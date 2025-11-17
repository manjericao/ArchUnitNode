# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The ArchUnit-TS team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**security@manjericao.io**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include in Your Report

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

This information will help us triage your report more quickly.

### What to Expect

After submitting a report, you can expect:

1. **Confirmation** - We'll acknowledge receipt of your vulnerability report within 48 hours
2. **Assessment** - We'll investigate and validate the vulnerability
3. **Fix Development** - We'll develop a fix for the vulnerability
4. **Disclosure** - We'll coordinate the disclosure timeline with you
5. **Credit** - We'll credit you in the security advisory (unless you prefer to remain anonymous)

### Preferred Languages

We prefer all communications to be in English.

## Security Update Process

1. Security vulnerabilities are reported privately via email
2. The core team assesses the vulnerability and impact
3. A fix is developed and tested
4. A security advisory is prepared
5. A new release is published with the security fix
6. The security advisory is published

## Security Best Practices for Users

When using ArchUnit-TS:

1. **Keep Dependencies Updated** - Always use the latest version of ArchUnit-TS
2. **Review Dependencies** - Regularly run `npm audit` to check for vulnerabilities
3. **Use in Development Only** - ArchUnit-TS is designed for development/testing environments
4. **Code Analysis Only** - ArchUnit-TS only analyzes code structure; it doesn't execute analyzed code
5. **Validate Input** - If you're dynamically generating architecture rules, validate all inputs

## Security Features

ArchUnit-TS includes the following security considerations:

- **Zero Runtime Dependencies** - Production code has no dependencies, reducing attack surface
- **Static Analysis Only** - The library only performs static code analysis
- **No Code Execution** - Analyzed code is never executed
- **TypeScript Type Safety** - Strict TypeScript configuration for type safety
- **Regular Security Scans** - Automated security scanning via CodeQL and npm audit

## Known Security Considerations

- ArchUnit-TS parses TypeScript/JavaScript files using `@typescript-eslint/typescript-estree`
- The library reads files from the filesystem based on provided paths
- Users should ensure they only analyze trusted codebases
- File system access is limited to the paths explicitly provided by the user

## Automated Security

We use the following automated security tools:

- **Dependabot** - Automatic dependency updates
- **CodeQL** - Automated security scanning
- **npm audit** - Dependency vulnerability scanning
- **Snyk** - Additional vulnerability scanning (planned)

## Contact

For general security questions or concerns, please email:
security@manjericao.io

For urgent security issues, please use the same email with "[URGENT]" in the subject line.

## Hall of Fame

We recognize and thank the following security researchers who have responsibly disclosed vulnerabilities:

- (None yet - be the first!)

Thank you for helping keep ArchUnit-TS and our users safe!
