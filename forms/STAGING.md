# Optional forms and email extension — Brittney staging

The Elite Site Pipeline must publish a complete static website without forms, D1, Turnstile, Access, or email configuration. These are **opt-in** capabilities, not prerequisites.

| User selection | Provisioning |
| --- | --- |
| Website only (default) | Static Cloudflare Pages; no form infrastructure |
| Website + contact form | Separate Worker, D1, Turnstile, rate limiting, protected admin dashboard |
| Website + contact form + notifications | Above plus verified recipient and supported email provider/binding |

Email is **disabled by default** (`EMAIL_MODE=disabled`). No email keys, paid plans, or sender verification should be requested unless the user opts in. The form itself must not be added to the public website unless the user opts in.

## Current staging state

Cloudflare D1 database `esp-brittney-forms-staging` was created and migrated. A staging Access application exists with an owner-only allow policy, but the Worker is not yet deployed and Access JWT validation has not been implemented. The Turnstile widget was created; its secret was shown in a screenshot and should be rotated before use. Only the public site key belongs in Git.

This repository's existing Pages site has a placeholder mailto link and no functional contact form. Keep that unchanged while validating the optional extension. Deploy the separate staging Worker with a rotated `TURNSTILE_SECRET`, test real submission and access controls, and verify GitHub Actions checks before declaring it ready. Do not publish admin submission data without validated Access JWT authentication.
