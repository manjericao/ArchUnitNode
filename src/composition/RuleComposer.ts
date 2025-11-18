import { ArchRule } from '../core/ArchRule';
import { TSClasses } from '../core/TSClasses';
import { ArchitectureViolation, Severity } from '../types';

/**
 * Logical operators for rule composition
 */
export type LogicalOperator = 'AND' | 'OR' | 'NOT' | 'XOR';

/**
 * A composite rule that combines multiple rules with logical operators
 *
 * @example
 * ```typescript
 * // OR composition
 * const rule = RuleComposer.anyOf([
 *   classes().that().haveSimpleNameEndingWith('Controller').should().beAnnotatedWith('Controller'),
 *   classes().that().resideInPackage('api').should().beAnnotatedWith('RestController')
 * ]);
 *
 * // NOT composition
 * const rule = RuleComposer.not(
 *   classes().that().resideInPackage('internal').should().bePublic()
 * );
 *
 * // Complex nested logic: (A OR B) AND NOT(C)
 * const rule = RuleComposer.allOf([
 *   RuleComposer.anyOf([ruleA, ruleB]),
 *   RuleComposer.not(ruleC)
 * ]);
 * ```
 */
export class CompositeRule implements ArchRule {
  private rules: ArchRule[];
  private operator: LogicalOperator;
  private description: string;
  private severity: Severity = Severity.ERROR;

  constructor(rules: ArchRule[], operator: LogicalOperator, description?: string) {
    this.rules = rules;
    this.operator = operator;
    this.description = description || this.generateDescription();
  }

  /**
   * Generate a human-readable description of the composite rule
   */
  private generateDescription(): string {
    const ruleDescriptions = this.rules.map((r) => r.getDescription());

    switch (this.operator) {
      case 'AND':
        return `(${ruleDescriptions.join(' AND ')})`;
      case 'OR':
        return `(${ruleDescriptions.join(' OR ')})`;
      case 'NOT':
        return `NOT (${ruleDescriptions[0]})`;
      case 'XOR':
        return `(${ruleDescriptions.join(' XOR ')})`;
      default:
        return ruleDescriptions.join(` ${this.operator} `);
    }
  }

  /**
   * Get the description of this composite rule
   */
  public getDescription(): string {
    return this.description;
  }

  /**
   * Check the composite rule against a set of classes
   */
  public check(classes: TSClasses): ArchitectureViolation[] {
    const allViolations: ArchitectureViolation[][] = [];

    // Collect violations from all child rules
    for (const rule of this.rules) {
      const violations = rule.check(classes);
      allViolations.push(violations);
    }

    // Apply logical operator and get violations
    const violations = this.applyOperator(allViolations);

    // Apply severity to all violations
    return violations.map((v) => ({ ...v, severity: this.severity }));
  }

  /**
   * Apply the logical operator to combine violations
   */
  private applyOperator(allViolations: ArchitectureViolation[][]): ArchitectureViolation[] {
    switch (this.operator) {
      case 'AND':
        return this.applyAnd(allViolations);
      case 'OR':
        return this.applyOr(allViolations);
      case 'NOT':
        return this.applyNot(allViolations);
      case 'XOR':
        return this.applyXor(allViolations);
      default:
        return [];
    }
  }

  /**
   * AND: All rules must pass (return violations if ANY rule has violations)
   */
  private applyAnd(allViolations: ArchitectureViolation[][]): ArchitectureViolation[] {
    // For AND, we want violations from all rules that failed
    const result: ArchitectureViolation[] = [];

    for (const violations of allViolations) {
      result.push(...violations);
    }

    return result;
  }

  /**
   * OR: At least one rule must pass (return violations only if ALL rules have violations)
   */
  private applyOr(allViolations: ArchitectureViolation[][]): ArchitectureViolation[] {
    // If any rule passes (has no violations), the OR passes
    const hasPassingRule = allViolations.some((violations) => violations.length === 0);

    if (hasPassingRule) {
      return []; // OR satisfied, no violations
    }

    // All rules failed, combine violations with context
    const result: ArchitectureViolation[] = [];

    for (let i = 0; i < allViolations.length; i++) {
      const violations = allViolations[i];
      const rule = this.rules[i];

      // Add context that this is from an OR branch
      for (const violation of violations) {
        result.push({
          ...violation,
          message: `[OR branch ${i + 1}/${allViolations.length}] ${violation.message}`,
          rule: `${this.description} -> ${rule.getDescription()}`,
        });
      }
    }

    return result;
  }

  /**
   * NOT: Rule must fail (invert the result)
   */
  private applyNot(allViolations: ArchitectureViolation[][]): ArchitectureViolation[] {
    if (this.rules.length !== 1) {
      throw new Error('NOT operator requires exactly one rule');
    }

    const violations = allViolations[0];

    // If the rule passed (no violations), NOT fails
    if (violations.length === 0) {
      return [
        {
          message: `Rule should have failed but passed: ${this.rules[0].getDescription()}`,
          filePath: '',
          rule: this.description,
          severity: Severity.ERROR,
        },
      ];
    }

    // If the rule failed (has violations), NOT passes
    return [];
  }

  /**
   * XOR: Exactly one rule must pass
   */
  private applyXor(allViolations: ArchitectureViolation[][]): ArchitectureViolation[] {
    const passingRules = allViolations.filter((violations) => violations.length === 0);

    if (passingRules.length === 1) {
      return []; // Exactly one rule passed, XOR satisfied
    }

    // Either all failed or more than one passed
    const result: ArchitectureViolation[] = [];

    if (passingRules.length === 0) {
      // All rules failed
      result.push({
        message: `XOR requires exactly one rule to pass, but all ${this.rules.length} rules failed`,
        filePath: '',
        rule: this.description,
        severity: Severity.ERROR,
      });
    } else {
      // More than one rule passed
      result.push({
        message: `XOR requires exactly one rule to pass, but ${passingRules.length} rules passed`,
        filePath: '',
        rule: this.description,
        severity: Severity.ERROR,
      });
    }

    return result;
  }

  /**
   * Set this composite rule to warning severity
   */
  public asWarning(): ArchRule {
    this.severity = Severity.WARNING;
    return this;
  }

  /**
   * Set this composite rule to error severity
   */
  public asError(): ArchRule {
    this.severity = Severity.ERROR;
    return this;
  }

  /**
   * Get the severity level of this composite rule
   */
  public getSeverity(): Severity {
    return this.severity;
  }
}

/**
 * Rule composer for creating complex logical combinations of rules
 *
 * @example
 * ```typescript
 * // Create a rule that requires EITHER naming convention OR decorator
 * const rule = RuleComposer.anyOf([
 *   classes().that().resideInPackage('controllers')
 *     .should().haveSimpleNameEndingWith('Controller'),
 *   classes().that().resideInPackage('controllers')
 *     .should().beAnnotatedWith('Controller')
 * ]);
 *
 * // Create a rule that forbids a pattern
 * const rule = RuleComposer.not(
 *   classes().that().resideInPackage('domain')
 *     .should().dependOnClassesThat().resideInPackage('infrastructure')
 * );
 *
 * // Complex nested logic
 * const rule = RuleComposer.allOf([
 *   RuleComposer.anyOf([
 *     namingRule,
 *     decoratorRule
 *   ]),
 *   RuleComposer.not(forbiddenDependencyRule)
 * ]);
 * ```
 */
export class RuleComposer {
  /**
   * Create a composite rule where ALL rules must pass (AND logic)
   *
   * @param rules - Array of rules to combine with AND
   * @param description - Optional custom description
   * @returns A composite rule that requires all rules to pass
   *
   * @example
   * ```typescript
   * const rule = RuleComposer.allOf([
   *   classes().that().resideInPackage('services').should().haveSimpleNameEndingWith('Service'),
   *   classes().that().resideInPackage('services').should().beAnnotatedWith('Injectable')
   * ]);
   * ```
   */
  public static allOf(rules: ArchRule[], description?: string): ArchRule {
    return new CompositeRule(rules, 'AND', description);
  }

  /**
   * Create a composite rule where at least ONE rule must pass (OR logic)
   *
   * @param rules - Array of rules to combine with OR
   * @param description - Optional custom description
   * @returns A composite rule that requires at least one rule to pass
   *
   * @example
   * ```typescript
   * const rule = RuleComposer.anyOf([
   *   classes().that().resideInPackage('api').should().beAnnotatedWith('Controller'),
   *   classes().that().resideInPackage('api').should().haveSimpleNameEndingWith('Controller')
   * ]);
   * ```
   */
  public static anyOf(rules: ArchRule[], description?: string): ArchRule {
    return new CompositeRule(rules, 'OR', description);
  }

  /**
   * Create a composite rule that inverts another rule (NOT logic)
   *
   * @param rule - Rule to negate
   * @param description - Optional custom description
   * @returns A composite rule that passes when the input rule fails
   *
   * @example
   * ```typescript
   * const rule = RuleComposer.not(
   *   classes().that().resideInPackage('internal').should().bePublic()
   * );
   * // This rule PASSES if classes in 'internal' are NOT public
   * ```
   */
  public static not(rule: ArchRule, description?: string): ArchRule {
    return new CompositeRule([rule], 'NOT', description);
  }

  /**
   * Create a composite rule where EXACTLY ONE rule must pass (XOR logic)
   *
   * @param rules - Array of rules to combine with XOR
   * @param description - Optional custom description
   * @returns A composite rule that requires exactly one rule to pass
   *
   * @example
   * ```typescript
   * const rule = RuleComposer.xor([
   *   classes().that().resideInPackage('models').should().beAnnotatedWith('Entity'),
   *   classes().that().resideInPackage('models').should().beAnnotatedWith('ValueObject')
   * ]);
   * // Each class must be EITHER Entity OR ValueObject, but not both
   * ```
   */
  public static xor(rules: ArchRule[], description?: string): ArchRule {
    return new CompositeRule(rules, 'XOR', description);
  }
}
