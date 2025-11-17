# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive CI/CD pipeline with GitHub Actions
- Automated security scanning with CodeQL
- Dependabot for automated dependency updates
- Pre-commit hooks with Husky and lint-staged
- Semantic versioning and automated releases with semantic-release
- Comprehensive security policy (SECURITY.md)
- FAQ documentation
- TypeDoc for API documentation generation
- ESM module support alongside CommonJS
- Enhanced package.json with better metadata
- Commitizen for conventional commits
- Improved test coverage configuration
- Additional npm scripts for better DX
- TypeScript strict mode configuration enhancements

### Changed
- Enhanced README with comprehensive examples and badges
- Improved build process with ESM support
- Updated Jest configuration with coverage thresholds
- Better error messages and logging

### Fixed
- Various type safety improvements
- Documentation inconsistencies

## [1.0.0] - 2024-01-XX

### Added
- Initial release of ArchUnit-TS
- Fluent API for defining architecture rules
- Support for naming conventions enforcement
- Package/module dependency rules
- Decorator/annotation checking
- Layered architecture support
- Cyclic dependency detection
- TypeScript & JavaScript support
- Integration with Jest and other test frameworks
- Comprehensive documentation and examples
- Express.js, NestJS, and Clean Architecture examples

### Core Features
- `ArchRuleDefinition` - Fluent API for rule definition
- `TSClass` and `TSClasses` - Domain models for analyzed code
- `CodeAnalyzer` - File discovery and dependency analysis
- `TypeScriptParser` - AST-based code parsing
- `LayeredArchitecture` - Layered architecture pattern support

[Unreleased]: https://github.com/manjericao/ArchUnitNode/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/manjericao/ArchUnitNode/releases/tag/v1.0.0
