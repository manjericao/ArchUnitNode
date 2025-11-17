import * as fs from 'fs';
import * as path from 'path';
// @ts-expect-error - Types exist but moduleResolution: "node" doesn't resolve modern "exports" field
// TODO: Update to moduleResolution: "node16" once we can migrate to ES modules
import { parse, AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';
import {
  TSClass as ITSClass,
  TSInterface,
  TSFunction,
  TSModule,
  TSImport,
  TSDecorator,
  TSMethod,
  TSProperty,
  SourceLocation,
} from '../types';

/**
 * Parses TypeScript/JavaScript files into domain models
 */
export class TypeScriptParser {
  /**
   * Validates a file path for security concerns before parsing.
   * Implements defense-in-depth security validation to prevent:
   * - Path traversal attacks (../)
   * - Null byte injection
   * - Directory traversal outside project scope
   *
   * @param filePath Path to validate
   * @throws {Error} If path contains traversal attempts, null bytes, or doesn't exist
   *
   * @remarks
   * Security checks performed:
   * 1. Path normalization and resolution
   * 2. Detection of ".." in normalized paths
   * 3. Validation that relative paths don't escape CWD
   * 4. Null byte detection (including \x00 and \0)
   * 5. File existence verification
   * 6. File type verification (not a directory)
   *
   * @example
   * ```typescript
   * // These will throw:
   * validateFilePath('../../../etc/passwd');           // Path traversal
   * validateFilePath('/valid/path/file.ts\x00.txt');  // Null byte
   * validateFilePath('/path/to/directory');            // Directory, not file
   *
   * // These will pass:
   * validateFilePath('/absolute/path/to/file.ts');
   * validateFilePath('./relative/path/to/file.ts');
   * ```
   */
  private validateFilePath(filePath: string): void {
    const normalized = path.normalize(filePath);
    const resolved = path.resolve(filePath);

    // Check for path traversal attempts
    if (
      normalized.includes('..') ||
      normalized !== resolved.replace(process.cwd() + path.sep, '')
    ) {
      // Additional check: ensure resolved path doesn't escape working directory for relative paths
      if (!path.isAbsolute(filePath)) {
        const cwd = process.cwd();
        if (!resolved.startsWith(cwd)) {
          throw new Error(`Path traversal detected: ${filePath}`);
        }
      }
    }

    // Check for null bytes (can bypass security checks in some systems)
    if (filePath.includes('\0')) {
      throw new Error(`Invalid file path (null byte): ${filePath}`);
    }

    // Verify file exists and is actually a file
    try {
      const stats = fs.statSync(resolved);
      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${filePath}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`File does not exist: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Parses a single TypeScript file and extracts its structure.
   * Performs security validation before parsing to prevent path traversal and other attacks.
   *
   * @param filePath Path to the TypeScript file to parse (absolute or relative)
   * @returns Module containing classes, interfaces, functions, and imports
   * @throws {Error} If file path is invalid, contains security violations, or has syntax errors
   *
   * @remarks
   * The parser extracts:
   * - Classes with their methods, properties, decorators, extends, and implements
   * - Interfaces with their properties and extends
   * - Functions with their parameters
   * - Import statements with source modules
   *
   * Security features:
   * - Path traversal protection (rejects ../)
   * - Null byte injection prevention
   * - File type validation
   *
   * @example
   * ```typescript
   * const parser = new TypeScriptParser();
   *
   * // Parse a file
   * const module = parser.parseFile('./src/services/UserService.ts');
   *
   * // Access extracted information
   * console.log(`Found ${module.classes.length} classes`);
   * console.log(`Imports: ${module.imports.map(i => i.source).join(', ')}`);
   *
   * // Iterate through classes
   * for (const cls of module.classes) {
   *   console.log(`Class ${cls.name}:`);
   *   console.log(`  Methods: ${cls.methods.map(m => m.name).join(', ')}`);
   *   console.log(`  Decorators: ${cls.decorators.map(d => d.name).join(', ')}`);
   * }
   * ```
   *
   * @example
   * // Error handling
   * ```typescript
   * try {
   *   const module = parser.parseFile('./src/file.ts');
   * } catch (error) {
   *   if (error.message.includes('path traversal')) {
   *     console.error('Security violation detected');
   *   } else if (error.message.includes('Unexpected token')) {
   *     console.error('Syntax error in file');
   *   }
   * }
   * ```
   */
  public parseFile(filePath: string): TSModule {
    // Validate file path for security
    this.validateFilePath(filePath);

    const content = fs.readFileSync(filePath, 'utf-8');
    const ast = parse(content, {
      loc: true,
      range: true,
      comment: true,
      jsx: true,
    });

    const moduleName = this.getModuleName(filePath);

    const module: TSModule = {
      name: moduleName,
      filePath,
      imports: [],
      exports: [],
      classes: [],
      interfaces: [],
      functions: [],
    };

    this.visitNode(ast, module, filePath);

    return module;
  }

  /**
   * Get module name from file path
   */
  private getModuleName(filePath: string): string {
    return path.dirname(filePath).replace(/\\/g, '/');
  }

  /**
   * Visit AST node
   */
  private visitNode(node: TSESTree.Node, module: TSModule, filePath: string): void {
    switch (node.type) {
      case AST_NODE_TYPES.Program:
        node.body.forEach((stmt: TSESTree.Node) => this.visitNode(stmt, module, filePath));
        break;

      case AST_NODE_TYPES.ImportDeclaration:
        module.imports.push(this.parseImport(node, filePath));
        break;

      case AST_NODE_TYPES.ExportNamedDeclaration:
      case AST_NODE_TYPES.ExportDefaultDeclaration:
        this.parseExport(node, module, filePath);
        break;

      case AST_NODE_TYPES.ClassDeclaration:
        if (node.id) {
          module.classes.push(this.parseClass(node, module.name, filePath, false));
        }
        break;

      case AST_NODE_TYPES.TSInterfaceDeclaration:
        module.interfaces.push(this.parseInterface(node, module.name, filePath, false));
        break;

      case AST_NODE_TYPES.FunctionDeclaration:
        if (node.id) {
          module.functions.push(this.parseFunction(node, module.name, filePath, false));
        }
        break;

      default:
        // Handle other node types if needed
        break;
    }
  }

  /**
   * Parse import declaration
   */
  private parseImport(node: TSESTree.ImportDeclaration, filePath: string): TSImport {
    const specifiers: string[] = [];
    let isDefault = false;
    let isNamespace = false;

    node.specifiers.forEach((spec: TSESTree.ImportClause) => {
      if (spec.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
        specifiers.push(spec.local.name);
        isDefault = true;
      } else if (spec.type === AST_NODE_TYPES.ImportNamespaceSpecifier) {
        specifiers.push(spec.local.name);
        isNamespace = true;
      } else if (spec.type === AST_NODE_TYPES.ImportSpecifier) {
        specifiers.push(spec.imported.name);
      }
    });

    return {
      source: node.source.value,
      specifiers,
      isDefault,
      isNamespace,
      location: this.getLocation(node, filePath),
    };
  }

  /**
   * Parse export declaration
   */
  private parseExport(
    node: TSESTree.ExportNamedDeclaration | TSESTree.ExportDefaultDeclaration,
    module: TSModule,
    filePath: string
  ): void {
    if (node.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
      if (node.declaration) {
        if (node.declaration.type === AST_NODE_TYPES.ClassDeclaration && node.declaration.id) {
          module.classes.push(this.parseClass(node.declaration, module.name, filePath, true));
          module.exports.push({
            name: node.declaration.id.name,
            isDefault: true,
            location: this.getLocation(node, filePath),
          });
        } else if (
          node.declaration.type === AST_NODE_TYPES.FunctionDeclaration &&
          node.declaration.id
        ) {
          module.functions.push(this.parseFunction(node.declaration, module.name, filePath, true));
          module.exports.push({
            name: node.declaration.id.name,
            isDefault: true,
            location: this.getLocation(node, filePath),
          });
        }
      }
    } else if (node.declaration) {
      if (node.declaration.type === AST_NODE_TYPES.ClassDeclaration && node.declaration.id) {
        module.classes.push(this.parseClass(node.declaration, module.name, filePath, true));
        module.exports.push({
          name: node.declaration.id.name,
          isDefault: false,
          location: this.getLocation(node, filePath),
        });
      } else if (
        node.declaration.type === AST_NODE_TYPES.TSInterfaceDeclaration &&
        node.declaration.id
      ) {
        module.interfaces.push(this.parseInterface(node.declaration, module.name, filePath, true));
        module.exports.push({
          name: node.declaration.id.name,
          isDefault: false,
          location: this.getLocation(node, filePath),
        });
      } else if (
        node.declaration.type === AST_NODE_TYPES.FunctionDeclaration &&
        node.declaration.id
      ) {
        module.functions.push(this.parseFunction(node.declaration, module.name, filePath, true));
        module.exports.push({
          name: node.declaration.id.name,
          isDefault: false,
          location: this.getLocation(node, filePath),
        });
      }
    }
  }

  /**
   * Parse class declaration
   */
  private parseClass(
    node: TSESTree.ClassDeclaration,
    moduleName: string,
    filePath: string,
    isExported: boolean
  ): ITSClass {
    const name = node.id?.name || 'AnonymousClass';
    const extendsClause = node.superClass;
    const implementsClauses = node.implements || [];

    return {
      name,
      filePath,
      module: moduleName,
      extends:
        extendsClause && extendsClause.type === AST_NODE_TYPES.Identifier
          ? extendsClause.name
          : undefined,
      implements: implementsClauses.map((impl: TSESTree.TSClassImplements) =>
        impl.expression.type === AST_NODE_TYPES.Identifier ? impl.expression.name : ''
      ),
      decorators: this.parseDecorators(node.decorators || [], filePath),
      methods: this.parseMethods(node.body.body, filePath),
      properties: this.parseProperties(node.body.body, filePath),
      isAbstract: node.abstract || false,
      isExported,
      location: this.getLocation(node, filePath),
    };
  }

  /**
   * Parse interface declaration
   */
  private parseInterface(
    node: TSESTree.TSInterfaceDeclaration,
    moduleName: string,
    filePath: string,
    isExported: boolean
  ): TSInterface {
    return {
      name: node.id.name,
      filePath,
      module: moduleName,
      extends: (node.extends || []).map((ext: TSESTree.TSInterfaceHeritage) =>
        ext.expression.type === AST_NODE_TYPES.Identifier ? ext.expression.name : ''
      ),
      methods: [],
      properties: [],
      isExported,
      location: this.getLocation(node, filePath),
    };
  }

  /**
   * Parse function declaration
   */
  private parseFunction(
    node: TSESTree.FunctionDeclaration,
    moduleName: string,
    filePath: string,
    isExported: boolean
  ): TSFunction {
    return {
      name: node.id?.name || 'AnonymousFunction',
      filePath,
      module: moduleName,
      parameters: node.params.map((param: TSESTree.Parameter) =>
        param.type === AST_NODE_TYPES.Identifier ? param.name : ''
      ),
      returnType: undefined,
      isAsync: node.async || false,
      isExported,
      location: this.getLocation(node, filePath),
    };
  }

  /**
   * Parse decorators
   */
  private parseDecorators(decorators: TSESTree.Decorator[], filePath: string): TSDecorator[] {
    return decorators.map((dec) => ({
      name:
        dec.expression.type === AST_NODE_TYPES.Identifier
          ? dec.expression.name
          : dec.expression.type === AST_NODE_TYPES.CallExpression &&
              dec.expression.callee.type === AST_NODE_TYPES.Identifier
            ? dec.expression.callee.name
            : 'Unknown',
      arguments: [],
      location: this.getLocation(dec, filePath),
    }));
  }

  /**
   * Parse methods from class body
   */
  private parseMethods(body: TSESTree.ClassElement[], filePath: string): TSMethod[] {
    return body
      .filter(
        (member): member is TSESTree.MethodDefinition =>
          member.type === AST_NODE_TYPES.MethodDefinition
      )
      .map((method) => ({
        name: method.key.type === AST_NODE_TYPES.Identifier ? method.key.name : 'UnknownMethod',
        parameters:
          method.value.params.map((param: TSESTree.Parameter) =>
            param.type === AST_NODE_TYPES.Identifier ? param.name : ''
          ) || [],
        returnType: undefined,
        isPublic: method.accessibility === 'public' || !method.accessibility,
        isPrivate: method.accessibility === 'private',
        isProtected: method.accessibility === 'protected',
        isStatic: method.static || false,
        isAsync: method.value.async || false,
        decorators: this.parseDecorators(method.decorators || [], filePath),
        location: this.getLocation(method, filePath),
      }));
  }

  /**
   * Parse properties from class body
   */
  private parseProperties(body: TSESTree.ClassElement[], filePath: string): TSProperty[] {
    return body
      .filter(
        (member): member is TSESTree.PropertyDefinition =>
          member.type === AST_NODE_TYPES.PropertyDefinition
      )
      .map((prop) => ({
        name: prop.key.type === AST_NODE_TYPES.Identifier ? prop.key.name : 'UnknownProperty',
        type: undefined,
        isPublic: prop.accessibility === 'public' || !prop.accessibility,
        isPrivate: prop.accessibility === 'private',
        isProtected: prop.accessibility === 'protected',
        isStatic: prop.static || false,
        isReadonly: prop.readonly || false,
        decorators: this.parseDecorators(prop.decorators || [], filePath),
        location: this.getLocation(prop, filePath),
      }));
  }

  /**
   * Get source location from node
   */
  private getLocation(node: TSESTree.Node, filePath: string): SourceLocation {
    return {
      filePath,
      line: node.loc?.start.line || 0,
      column: node.loc?.start.column || 0,
    };
  }
}
