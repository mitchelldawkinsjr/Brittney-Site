# Customer website provisioning — milestone 2

The verified Brittney site is the reference implementation. This milestone adds a **website-only** executor for a new customer's **personal GitHub account** and a Cloudflare Pages project already authorized to access the account's GitHub repositories.

## Preview by default

Node.js 22 or newer. Create an untracked `customer.json` file:

```json
{
  "name": "Second Customer",
  "accountId": "0123456789abcdef0123456789abcdef",
  "githubOwner": "your-github-username",
  "forms": false
}
```

```sh
node pipeline/provision-site.mjs customer.json
node --test pipeline/plan-customer.test.mjs pipeline/provision-site.test.mjs
```

Preview shows the resource graph and makes no provider requests. Commit only non-sensitive configuration if necessary; **never commit API tokens or Turnstile secrets**.

## Authorized apply

Provide credentials through the runner's secret store or your session environment, then explicitly opt in to writing resources:

```sh
GITHUB_TOKEN=... CLOUDFLARE_API_TOKEN=... node pipeline/provision-site.mjs customer.json --apply
```

For a nontechnical beta tester, a repository maintainer can instead run the manual **Provision customer website** GitHub Actions workflow. Before dispatch, install `SITE_PIPELINE_GH_TOKEN` and `CLOUDFLARE_API_TOKEN` as Actions secrets; fill in customer name, GitHub owner, and Cloudflare account ID. The GitHub token needs authorization to create **private personal repositories** and write their contents; the Cloudflare token needs permission to create/read Pages projects in the chosen account. Cloudflare's GitHub Pages integration **must already be installed and authorized for new repositories**. Configure minimum practical permissions and rotate/revoke temporary credentials after use.

The executor checks the authenticated GitHub user's identity, creates a **private** repository named `esp-{slug}` with a unique pipeline ownership marker, adds `public/index.html` only if absent, then creates `esp-{slug}-site` as a Git-connected Cloudflare Pages project. An existing repository must match the marker, owner, expected name, and private visibility. An existing Pages project must match the repository ID and production branch. Any mismatch **stops the process** rather than taking over another project.

A retry preserves user-edited site files and reuses matching resources. A failed run may leave newly created resources in place for safe resumability; it **never auto-deletes** them. Every apply result reports `awaiting-live-deployment-verification`, not `success`: a separate check must confirm Cloudflare build completion and that the public site actually loads.

## Intentionally not yet supported

- **Contact forms** (`forms:true`) are rejected **before any API writes**. Each customer needs independent D1 schema, Turnstile secret, Worker, and Cloudflare Access policy, followed by real submission/login tests. The previously validated staging owner's credentials and data must never be shared with another customer.
- **Custom domains** (`hostname`) are rejected before writes. DNS ownership and certificate validation must be authorized separately.
- **Organization GitHub owners** are blocked until organization-scoped authorization is implemented.
- Deployments can be queued or fail after project creation. The executor does not claim the site is live.
- Automated image design, rollback, ongoing content generation, and full hands-off onboarding are future milestones.

No paid email service or email notifications are configured.

## Live deployment verification (separate from resource creation)

The GitHub Actions dispatch now runs `pipeline/launch-site.mjs`, which provisions the website, captures the intended 40-character GitHub commit SHA, and verifies that exact commit on Cloudflare production before reporting a successful launch. This read-only checker confirms:

1. The Pages project is still connected to the expected GitHub source.
2. Cloudflare reports a successful **canonical production deployment**.
3. Cloudflare's canonical production deployment identifies the **exact GitHub commit SHA** captured during setup. Older successful deployments do **not** count. The public `https://esp-{slug}-site.pages.dev/` also responds HTTP 200 with HTML markup.

The checker retries a bounded number of times while Cloudflare's build or public availability is pending. It fails the workflow if no live deployment can be confirmed; the created resources are left intact for diagnosis and a safe retry. A newer queued deployment does **not** hide an already live canonical deployment; the result flags that newer pending build.

For a standalone check (without mutating resources):

```sh
CLOUDFLARE_API_TOKEN=... node pipeline/verify-site.mjs customer.json
# This standalone check reports general website reachability; use `launch-site.mjs` for exact revision acceptance.
```

**Caveat:** This is an availability check, not a human review of branding/content, a contact-form acceptance test, or proof that the most recent commit has deployed.

## OAuth-first customer onboarding

The intended no-technical-steps experience, provider permissions, and the new Cloudflare PKCE / provider identity verification libraries are documented in [ONBOARDING_OAUTH.md](ONBOARDING_OAUTH.md). The OAuth callback service and GitHub App are **not yet deployed**. Never describe the operator-only GitHub Actions workflow as a finished self-serve OAuth onboarding flow.

## Revision-pinned acceptance

`applyWebsite()` now returns `headCommitSha` taken from the authorized GitHub repository's production branch. `launchWebsite()` and the hosted onboarding Worker pass it to `verifyWebsite()` as `expectedCommitSha`. A Pages deployment that is successful but points to an **older commit** remains `pending-expected-commit`, and the UI stays `pending_deployment`. It is never marked `live` until the expected SHA is visible in Cloudflare's canonical production deployment and the public site responds. This also protects manual GitHub Actions retries from accidentally accepting an older deploy.
