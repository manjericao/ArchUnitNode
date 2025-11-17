# ArchUnit-TS Roadmap

This document outlines the planned features and improvements for ArchUnit-TS.

## Vision

To become the go-to architecture testing library for TypeScript and JavaScript projects, helping teams maintain clean architecture and prevent architectural drift.

## Released

### ✅ Version 1.0.0 (Current)

- Fluent API for defining architecture rules
- Naming convention enforcement
- Package/module dependency rules
- Decorator/annotation checking
- Layered architecture support
- Cyclic dependency detection
- TypeScript & JavaScript support
- Jest integration
- Comprehensive documentation
- Real-world examples

## In Progress

### 🚧 Version 1.1.0 (Q1 2025)

**Developer Experience**
- [ ] Configuration file support (`archunit.config.js`)
- [ ] Better error messages with code snippets
- [ ] Debug mode with verbose logging
- [ ] Performance profiling and benchmarks
- [ ] Watch mode for development

**CI/CD & Automation**
- [x] GitHub Actions workflows
- [x] Automated releases with semantic-release
- [x] CodeQL security scanning
- [x] Dependabot configuration
- [ ] Coverage reporting to Codecov

**Documentation**
- [x] SECURITY.md
- [x] CHANGELOG.md
- [x] FAQ.md
- [ ] TypeDoc API documentation
- [ ] Video tutorials
- [ ] Interactive examples

**Testing & Quality**
- [ ] Increase test coverage to 90%+
- [ ] Integration tests
- [ ] E2E tests with real projects
- [ ] Performance benchmarks

## Planned

### 📋 Version 1.2.0 (Q2 2025)

**Performance**
- [ ] Caching mechanism for faster subsequent runs
- [ ] Parallel analysis for large codebases
- [ ] Incremental analysis (only changed files)
- [ ] Memory optimization for large projects

**New Rules & Patterns**
- [ ] Clean Architecture pattern support
- [ ] Hexagonal/Onion architecture enhancements
- [ ] Microservices architecture patterns
- [ ] DDD (Domain-Driven Design) rules
- [ ] CQRS pattern support
- [ ] Event-driven architecture rules

**Advanced Features**
- [ ] Custom metric collection (complexity, cohesion, coupling)
- [ ] Architecture visualization/diagramming
- [ ] Rule composition and reuse
- [ ] Rule freezing (freeze current violations)
- [ ] Gradual adoption mode

### 📋 Version 1.3.0 (Q3 2025)

**Ecosystem Integration**
- [ ] VS Code extension
- [ ] WebStorm/IntelliJ plugin
- [ ] CLI tool for standalone usage
- [ ] Pre-commit hook helper
- [ ] GitHub Action
- [ ] GitLab CI component

**Framework-Specific Support**
- [ ] React architecture rules (components, hooks, context)
- [ ] Angular module boundary checks
- [ ] Vue.js composition API patterns
- [ ] Next.js app router patterns
- [ ] Remix architecture rules
- [ ] Svelte component patterns

**Reporting**
- [ ] HTML report generation
- [ ] JSON output format
- [ ] SonarQube integration
- [ ] Code coverage-style reports
- [ ] Trend analysis over time

### 📋 Version 2.0.0 (Q4 2025)

**Breaking Changes** (when necessary)
- [ ] Improved API based on community feedback
- [ ] Plugin system for extensibility
- [ ] Custom parser support
- [ ] Multi-language support (starting with JSX/TSX enhancements)

**Advanced Analysis**
- [ ] Runtime dependency analysis (optional)
- [ ] Call graph analysis
- [ ] Data flow analysis
- [ ] Type relationship analysis
- [ ] Interface segregation checks
- [ ] Liskov substitution validation

**AI-Powered Features**
- [ ] Suggest architecture improvements
- [ ] Auto-generate rules from existing codebase
- [ ] Detect architectural anti-patterns
- [ ] Smart violation explanations

## Community Requests

Features requested by the community (vote on GitHub Discussions):

- [ ] Support for more architectural patterns
- [ ] Better monorepo support
- [ ] Workspace analysis
- [ ] Cross-package dependency rules
- [ ] Support for Deno and Bun
- [ ] Browser/client-side analysis
- [ ] API for programmatic usage
- [ ] Support for JavaScript frameworks patterns
- [ ] Migration tools from other architecture checkers

## Long-term Goals

**Ecosystem Growth**
- Build a community of contributors
- Create a plugin marketplace
- Provide enterprise support options
- Develop training materials and certification

**Standardization**
- Define standard architectural patterns for TS/JS
- Create shareable rule configurations
- Establish best practices guide
- Collaborate with framework teams

**Innovation**
- Research ML-based architecture analysis
- Explore runtime architecture validation
- Develop architecture evolution tracking
- Create architecture comparison tools

## How to Contribute

We welcome contributions to any of these features!

1. **Comment on existing issues** - Share your thoughts on planned features
2. **Open new issues** - Suggest features not on the roadmap
3. **Vote on features** - Use 👍 reactions on issues to vote
4. **Submit PRs** - Help implement features
5. **Share use cases** - Tell us how you use ArchUnit-TS

## Release Schedule

- **Minor versions** (1.x.0) - Every 2-3 months
- **Patch versions** (1.0.x) - As needed for bugs
- **Major versions** (2.0.0) - Yearly or when breaking changes are necessary

## Staying Updated

- ⭐ Star the repo on GitHub
- 👀 Watch releases
- 📧 Subscribe to our newsletter (coming soon)
- 🐦 Follow [@archunit_ts](https://twitter.com/archunit_ts) (coming soon)
- 💬 Join our [Discord](https://discord.gg/archunit-ts) (coming soon)

## Feedback

This roadmap is flexible and based on community needs. Your feedback shapes our priorities!

- 💬 [Discussions](https://github.com/manjericao/ArchUnitNode/discussions)
- 🐛 [Issues](https://github.com/manjericao/ArchUnitNode/issues)
- 📧 Email: roadmap@manjericao.io

---

**Last Updated**: November 2024
**Next Review**: February 2025
