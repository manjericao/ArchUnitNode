/**
 * Testing Utilities for ArchUnit-TS
 *
 * Helpers, matchers, and builders for writing architectural tests
 */

// Test Helpers
export {
  TestFixtureBuilder,
  ViolationAssertions,
  RuleTestHelper,
  createTestFixture,
  createRuleTestHelper,
} from './TestHelpers';

// Jest Matchers
export { archUnitMatchers, extendJestMatchers } from './JestMatchers';

// Test Suite Builder
export {
  TestSuiteBuilder,
  TestSuiteConfig,
  RuleTestCase,
  createTestSuite,
  testRule,
} from './TestSuiteBuilder';
