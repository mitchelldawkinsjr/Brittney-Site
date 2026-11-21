# Launch & Own

**Describe it. Launch it. Own it.**

*Ask → Preview → Approve → Live.*

A customer-owned, conversational website creation and maintenance pipeline. The goal is to help someone with **no coding experience** describe a website, authorize their own accounts, approve a preview, publish using GitHub + Cloudflare, and request future updates in plain English—without hiring a developer for routine changes.

> **Beta development, not a publicly available self-service service.** The reusable website-only provisioner, authorization libraries, onboarding Worker source, and deployment checks exist and are CI-tested. The hosted OAuth application has **not** been registered/deployed or independently live-tested for a second customer. Full AI-designed pages, opt-in customer contact forms, custom domains, and published ChatGPT plugin onboarding remain future work. Do not promise one-click launch yet.

## The experience we're building

1. **Ask:** Describe a new website, or provide an existing URL/repository/ZIP. ChatGPT collects only the essential content and style decisions.
2. **Preview:** Generate the site and show what will go live, where it will be hosted, and which resources will be created.
3. **Connect:** Authorize the customer's **own** GitHub and Cloudflare accounts via provider consent screens, with least-privilege access; no pasted API tokens.
4. **Approve:** Explicitly approve the site, public exposure, repository ownership, and changes before the pipeline creates or publishes anything.
5. **Live:** Provision GitHub + Cloudflare, verify the production deployment and public URL, and hand the customer their links.
6. **Maintain:** Request edits conversationally; use a branch, automated tests, preview, approval and safe deployment.

**Low-to-no hosting cost is a design goal, not an unlimited/free-cost guarantee.** Cloudflare and GitHub free-tier eligibility, quotas, custom domains, external email, and provider pricing depend on the user's setup. Customers keep ownership of their accounts, repositories and infrastructure.

## What's implemented today

| Capability | Status | Notes |
|---|---|---|
| Customer-specific resource planning | Tested | Predictable names, dependencies, forms off by default |
| Website-only GitHub + Cloudflare Pages provisioning | Tested with mocked providers | Private customer repository; Cloudflare Pages Git integration; safe reruns |
| Production deployment + HTTP verification | Tested with mocked providers | Does not treat a queued deployment as live |
| GitHub App and Cloudflare OAuth primitives | Tested | Authorization Code, PKCE, state validation and provider identity checks |
| Isolated hosted onboarding Worker source | CI-tested, **not deployed** | Consent callbacks, encrypted sessions, review/approval, account selection and retry |
| Protected contact form reference implementation | **Live verified for Brittney staging** | Turnstile → Worker → D1; owner dashboard protected by Cloudflare Access |
| Public OAuth onboarding for a second independent customer | **Not yet verified** | Needs domain ownership, OAuth registrations, isolated D1 and deployment |
| Generated custom designs, per-customer forms, custom domains and automatic content updates | **Not implemented end to end** | Dedicated future milestones |
| Public ChatGPT plugin | **Not published** | Separate review and distribution process |

## Repository map

**This repository currently has a legacy GitHub URL: `mitchelldawkinsjr/Brittney-Site`.** It began as a Brittney Michelle website migration and expanded into the Launch & Own **product development + reference deployment**. The canonical product repository will be `mitchelldawkinsjr/launch-and-own`. The repository URL itself has not been renamed. Do **not** rename or move it without reviewing its active Cloudflare Pages GitHub connection first.

| Location | Responsibility |
|---|---|
| `pipeline/` | Reusable customer plan, provisioner, OAuth primitives, deployment verification and tests |
| `onboarding/` | Proposed standalone customer onboarding Worker, isolated schema, security tests and setup guide |
| `forms/` | Brittney **reference implementation**, staging Worker, contact-form D1 migration and dashboard |
| `public/` | Brittney **reference website** currently deployed to a staging Pages project; **not** a product landing page |
| `tests/` | Reference-site static checks |
| `.github/workflows/` | CI and operator-only manual provisioning fallback |
| `docs/` | Product boundaries, rollout status and migration strategy |

**Tenant boundary:** Never point new customers at the Brittney D1 database, Turnstile secret, Worker, Cloudflare Access policy, or Pages project. The site reference is a proof of concept, not shared infrastructure.

## For customers and beta testers

The intended customer setup will be **connect accounts → review → approve → verified website URL**. The hosted onboarding app isn't live yet. At present the [manual website-only provisioning workflow](.github/workflows/provision-customer.yml) is **operator-only** and requires securely configured provider secrets and Cloudflare's GitHub integration.

See [customer onboarding architecture](onboarding/README.md), [OAuth implementation notes](pipeline/ONBOARDING_OAUTH.md), and [provisioner instructions](pipeline/CUSTOMER_PROVISIONING.md).

## For contributors / maintainers

Node.js 22+ runs the test suite without requiring live provider credentials:

```sh
node --test tests/*.test.mjs forms/tests/*.test.mjs pipeline/*.test.mjs onboarding/*.test.mjs
node pipeline/validate-features.mjs
```

The original reference website is plain static HTML, served from `public/`. Test locally with `python3 -m http.server 8787 --directory public`. Create a scoped branch + PR, run CI, inspect the corresponding preview, then merge and verify production after approval. Never treat a GitHub merge as proof the website is deployed.

## The working reference: Brittney Michelle

- **Staging website:** https://elite-pipeline-brittney-michelle-test.pages.dev
- **Staging Pages project:** `elite-pipeline-brittney-michelle-test`
- **GitHub-connected source:** `mitchelldawkinsjr/Brittney-Site`, branch `main`, output `public`
- **Original customer site:** https://monumental-belekoy-442620.netlify.app/ (untouched)
- Contact submission → Turnstile → Worker → D1 and owner-only dashboard were confirmed with a real acceptance submission.
- This staging copy is deliberately **noindex**; the reference website should not be silently promoted to production.

For history, integrity and legacy setup information see [START-HERE.md](START-HERE.md) and [DEPLOYMENT-PIPELINE.md](DEPLOYMENT-PIPELINE.md).

## Roadmap and accountability

1. **Launch & Own identity and repository boundaries** — branding applied; preserve the existing customer deployment.
2. **Hosted OAuth beta readiness** — isolated database, provider app registrations, verified domain, security hardening and live deploy.
3. **Independent customer test** — authorize different accounts, provision a website, verify the URL and editing loop.
4. **Template + content generation** — genuine website preview, accessible responsive styles, user-approved images.
5. **Opt-in forms** — customer-isolated D1, Turnstile and protected inbox; end-to-end verification.
6. **Portable beta and ChatGPT integration** — carefully scoped sharing and install instructions; public distribution only after supported approval.

**Current launch checklist:** [Issue #21](https://github.com/mitchelldawkinsjr/Brittney-Site/issues/21). Security and account ownership requirements take priority over claiming the project is free, fully automated or generally available.

---

**Product:** Launch & Own · **Development reference:** Brittney Michelle · **Principle:** the customer owns the website and its infrastructure.
