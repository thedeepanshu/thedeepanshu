# Security policy

## Reporting a vulnerability

Email **deepanshusaini971@gmail.com** with "Security" in the subject. Please don't open a public issue.

Include the affected URL or file, what an attacker could do, and steps to reproduce. I'll reply within 7 days and keep you updated until it's fixed. Credit
is given in the changelog if you'd like it.

The same contact is published at [/.well-known/security.txt](https://thedeepanshu.vercel.app/.well-known/security.txt).

## Scope

The site is static: no backend, accounts, cookies or stored user data. The contact form only opens a draft in your own email app. Most relevant are:

- weaknesses in the Content Security Policy or other headers (`vercel.json`)
- ways to inject script or content through URLs
- vulnerable dependencies that actually reach the shipped bundle

Out of scope: missing headers that don't apply to a static site, reports from automated scanners without a working impact, and denial of service.

## Supported version

Only the live site and the `main` branch receive fixes.
