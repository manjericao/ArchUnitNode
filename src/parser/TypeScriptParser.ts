import * as fs from 'fs';
import * as path from 'path';
// @ts-expect-error - Module resolution issue with typescript-estree
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
   * Parse a single file
   */
  public parseFile(filePath: string): TSModule {
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
        node.body.forEach((stmt) => this.visitNode(stmt, module, filePath));
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

    node.specifiers.forEach((spec) => {
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
      implements: implementsClauses.map((impl) =>
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
      extends: (node.extends || []).map((ext) =>
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
      parameters: node.params.map((param) =>
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
          method.value.params.map((param) =>
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
