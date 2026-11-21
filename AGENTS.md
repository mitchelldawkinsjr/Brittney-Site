# Elite Site Pipeline — repository instructions

**Primary project:** a customer-owned, conversational, low-to-no-cost website creation and maintenance pipeline using GitHub, Cloudflare and ChatGPT. **Current repository slug** `Brittney-Site` is a legacy name because this repository began as a single customer website. It now contains reusable pipeline code, a standalone unhosted onboarding Worker, and the live **Brittney staging reference**.

Read [README.md](README.md) for product goals, boundaries and status, and [docs/REPOSITORY-STRATEGY.md](docs/REPOSITORY-STRATEGY.md) before reorganizing paths or renaming the GitHub repository.

## Code ownership and hard boundaries

- `pipeline/` is reusable customer-agnostic site planning, OAuth connection primitives, provisioning, and verification.
- `onboarding/` is an independent future customer onboarding Worker. It requires its **own D1 database** and its **own OAuth application registrations and secrets**. Do not deploy until correctly configured and approved.
- `public/`, `forms/`, and `tests/site.test.mjs` are the Brittney **reference site and reference forms**. Their Cloudflare resources must never be shared with a different customer.
- `.github/workflows/provision-customer.yml` is an **operator-managed fallback**, not the general public OAuth entry point.
- The existing Cloudflare Pages project `elite-pipeline-brittney-michelle-test` is GitHub-linked to the current repo path, branch `main`, output `public`. Do not rename the repository, change output directories, migrate hosting, or swap the Git integration without an explicit plan and deployment verification.

## Development workflow

- Inspect current code and the relevant official Cloudflare/GitHub docs before modifying provider APIs or security logic.
- Scope changes to the appropriate product module; do not alter customer website content while working on product infrastructure.
- Run `node --test tests/*.test.mjs forms/tests/*.test.mjs pipeline/*.test.mjs onboarding/*.test.mjs` and `node pipeline/validate-features.mjs`.
- Make a branch and PR; wait for both GitHub checks to succeed; preserve required reviews/approvals. A passing test does not establish a successful external OAuth login or deployment.
- For website changes, verify PR preview and public Pages production after merging. The reference site is intentionally **noindex** and the original Netlify deployment must remain untouched.

## Security

- Every user authorizes **their own** GitHub and Cloudflare accounts. Do not reuse author/customer provider tokens, Turnstile secrets, databases, Access policies, or account IDs as implicit defaults.
- Use secure provider consent, least privilege, server-side secret storage and explicit customer approval. Never commit, log, expose or request pasted OAuth tokens or API keys.
- Keep forms **off by default** for new customer provisioning. Never claim that generated content, custom domains, forms or paid features are implemented or live when they are not.
- Do not change DNS, billing, security policies, account ownership, external site availability, or public deployment visibility without explicit owner approval.
- The product's goals are **Ask → Preview → Approve → Live** and conversation-driven updates, not a generic website template repository.
