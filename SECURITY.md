# Security Policy

Thanks for helping keep involutionhell.github.io safe. We run a public-facing Next.js site deployed to Vercel, so even seemingly small bugs can have a big impact. Please follow the guidance below if you discover a vulnerability.

## Supported Versions

| Version             | Supported?                        |
| ------------------- | --------------------------------- |
| `main`              | ✅                                |
| older tags/releases | ❌ – upgrade to the latest `main` |

We only patch security issues on the active `main` branch. If you rely on a fork or an older tag, please rebase frequently.

## Reporting a Vulnerability

1. **Do not open a public issue or PR.** Instead email `longsizhuo@gmail.com` with the following:
   - A clear description of the issue and its impact.
   - Steps to reproduce; include HTTP requests, screenshots, or PoC snippets when helpful.
   - The commit SHA or deployed URL where you observed the problem.
2. **Encrypt if possible.** If you require PGP, mention it in your first email and we will share a key.
3. **Allow time for remediation.** We try to acknowledge within 3 business days and provide a fix or mitigation timeline within 10 business days.

## Scope and Guidelines

Please focus on:

- Frontend or API logic flaws in our Next.js app (authentication, session handling, data exposure).
- Misconfigurations in Vercel/Next.js headers, caching, or middleware that lead to XSS, CSRF, or SSRF.
- Leakage of secrets via build artifacts, environment variables, or client bundles.
- Dependency vulnerabilities introduced through `pnpm` packages.

Out of scope:

- Automated scans without proof of exploitability.
- Denial-of-service via excessive traffic or resource exhaustion tests.
- Issues in third-party services (e.g., Google Analytics, Zotero API) unless they directly impact our code.
- Social engineering of maintainers or hosting providers.

## Coordinated Disclosure

We appreciate responsible disclosure practices. Once a fix is ready or deployed, we may credit you in release notes if you agree. Please keep details private until we confirm remediation.

Thank you for helping protect our community site! Feel free to reach out at `longsizhuo@gmail.com` with any security questions.
