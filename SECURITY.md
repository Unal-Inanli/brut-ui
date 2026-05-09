# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✓         |
| < 1.0   | ✗         |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report vulnerabilities privately via GitHub's
[Security Advisory](https://github.com/Unal-Inanli/brut-ui/security/advisories/new) feature.

We aim to acknowledge reports within **48 hours** and release a patch within **14 days** for confirmed issues.

## Scope

In scope:

- XSS / DOM injection vectors in any `src/js/components/*.js`
- Supply-chain concerns affecting `@sprtn/ui` consumers (e.g. malicious dependencies, build-output tampering)
- Markup or token output that could enable CSP bypass

Out of scope:

- Bugs in consumer applications that consume the kit
- Issues in third-party tooling (Vite, Vitest, Playwright)

## Disclosure

Once a fix ships in a tagged release, the advisory becomes public with credit to the reporter.
