# Launch & Own — Hosted Customer Onboarding (beta service)

The customer-facing name is **Launch & Own**, with the tagline **Describe it. Launch it. Own it.** Internal prelaunch worker/database identifiers beginning with `elite-site-` remain unchanged temporarily to preserve the already-provisioned isolated beta D1; these are infrastructure identifiers, not the product's name.

This directory contains an **independent Cloudflare Worker** for nontechnical website customers. It is not wired into the existing Brittney site, and **it must not be deployed publicly until OAuth applications, a dedicated database, and the domain are configured**.

## Customer journey

1. Visit the onboarding URL, choose **Connect GitHub**, and consent through the Launch & Own GitHub App.
2. Choose **Connect Cloudflare** and approve the minimal Cloudflare scopes, then select an account you own.
3. Enter a website name, review the planned **private repository** and **public Pages URL**, and explicitly click **Approve and create website**.
4. The server uses the user's connected tokens to run the existing idempotent `applyWebsite` provisioner. Credentials are never exposed to the browser or logged.
5. A Pages project may be queued; the customer chooses **Check live deployment**. Only a successful canonical production deployment for the **exact approved GitHub commit** plus an HTTP 200 HTML response can move the status to `live`. A previously successful but stale deployment remains pending. On a failed setup, retry reuses exact ownership-matched resources without deleting anything.

Cloudflare's **Workers & Pages GitHub App** requires its **own** installation/authorization on the customer's GitHub account; the Launch & Own GitHub App connection is not a substitute. A private repository may need to be explicitly added to Cloudflare's GitHub installation if its repository access is restricted.

The current website-only beta creates a basic, clearly labeled starter homepage. **It does not yet generate a full AI-designed business website, set up contact forms, connect custom domains, or send email**. Those are separate milestones. No payment/billing or DNS changes occur.

## Security design

- GitHub App and Cloudflare OAuth use server-side Authorization Code + PKCE with cryptographically random state and verifier.
- OAuth state is bound to a short-lived, HttpOnly `__Host-` cookie or an authenticated session and **consumed atomically once** with a conditional D1 `UPDATE ... RETURNING`. Cross-user and replayed callback attempts are rejected.
- Encrypted GitHub/Cloudflare tokens, CSRF secret and PKCE verifiers use **AES-256-GCM with independent random IVs and contextual associated data**. Only opaque session-cookie material reaches the browser. Use a dedicated 32-byte `TOKEN_ENCRYPTION_KEY` secret, not a key from another site or customer.
- The signed-in GitHub identity and selected Cloudflare account are checked against the provider APIs. Every preview, approval, retry and status check is scoped to the authenticated session.
- Mutating POST requests require an origin check and CSRF token. `SameSite=Lax` is required for top-level cross-site OAuth callback redirects, and the session cookie is `Secure`, `HttpOnly`, and scoped to the host.
- An IP-based Cloudflare rate-limit binding applies to connection starts and previews; sensitive errors are not logged. Logs contain event codes, not credentials. A daily cron clears expired flow/session records.
- `approved` is **not** `live`; the workflow reports `pending_deployment` until a public homepage is verified.
- The provisioning engine refuses to take over unrelated repositories or Pages projects, and never automatically deletes resources.

**Remaining security work before an open public beta:** independent security review, provider token refresh/rotation and disconnect/revocation, durable orchestration for interrupted provisioning, deployment alerts, D1 data retention policy, and real provider/infrastructure acceptance tests. This preview design stores session-scoped credentials, not reusable lifelong credentials; reconnect after session expiration is expected.

## Operator-only configuration (not steps for customers)

Create **separate** GitHub App and public Cloudflare OAuth client registrations. You must own/verify a customer-facing onboarding domain for the public Cloudflare OAuth client (promotion to public visibility is irreversible). Register these *exact* HTTPS callbacks:

- `https://<owned-onboarding-host>/oauth/github/callback`
- `https://<owned-onboarding-host>/oauth/cloudflare/callback`

Follow official [Cloudflare OAuth setup](https://developers.cloudflare.com/fundamentals/oauth/create-an-oauth-client/) and [GitHub App authorization](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app). The GitHub App needs GitHub's dedicated **Repository creation** permission and **Contents: write** for newly created personal repositories, subject to the user's actual privileges. Cloudflare's live OAuth scope catalog currently includes `page.read` and `page.write` for Pages access, and `memberships.read` for membership inspection. Confirm the exact account-listing permission and actual endpoint authorization during live integration; select scopes from the official [OAuth scopes endpoint](https://developers.cloudflare.com/api/resources/iam/subresources/oauth_scopes/methods/list/) rather than inventing identifiers. Do not ask customers to paste PATs or API tokens.

**Beta environment D1 now exists.** The platform-owned, isolated database `elite-site-onboarding-beta` (`c21295f8-2593-4317-abad-1d1221c0656b`) was created in the configured Cloudflare account and its initial migration was applied. The repository's `onboarding/wrangler.jsonc` now points to that dedicated database. The Cloudflare D1 schema was verified to contain all three onboarding tables and three required indexes. **Do not use the Brittney contact-form database.** For another operator/account, create a separate database, update the binding with its ID, and apply the migration in that account. In the Worker environment configure:

| Binding | Purpose |
|---|---|
| `DB` | Dedicated onboarding D1 binding |
| `ONBOARDING_LIMITER` | Rate-limit binding |
| `ONBOARDING_ORIGIN` | Exact HTTPS origin such as `https://onboard.your-owned-domain.com` |
| `TOKEN_ENCRYPTION_KEY` | 32 random bytes, **hex-encoded**, set as a Worker secret |
| `GH_CLIENT_ID` / `GH_CLIENT_SECRET` | GitHub App OAuth client ID and secret (secret is a Worker secret) |
| `CF_CLIENT_ID` / `CF_CLIENT_SECRET` | Cloudflare OAuth client ID and secret (secret is a Worker secret) |
| `CF_SCOPES` | Space-separated, officially supported Cloudflare OAuth scopes |

Configure the non-secret values as environment variables and all sensitive values via the Cloudflare Worker secret store, **never GitHub or source files**. Rotate compromised credentials and disconnect active sessions; key rotation invalidates currently encrypted credentials.

The project already uses Wrangler under `forms/`; deploy this separate Worker with the `onboarding/wrangler.jsonc` configuration only after the domain, OAuth client registrations and secrets are ready. The isolated beta D1 migration is already applied, but production deployment is deliberately still blocked. Avoid changing any `forms/` bindings or Brittney Pages settings.

**Verification:**
```sh
node onboarding/validate-config.mjs
# Optional: requires scoped read-only D1 API authorization
CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... node onboarding/validate-config.mjs --remote
node --test onboarding/*.test.mjs
node --test forms/tests/*.test.mjs pipeline/*.test.mjs onboarding/*.test.mjs
```

Tests simulate providers locally with an in-memory SQLite D1 adapter and no real credentials, including callback replay, CSRF rejection, tenant isolation, provisioning retry, and deployment status. Passing tests do **not** establish that the hosted OAuth registrations or production website provisioning works; that requires a separate customer to complete an authorized live test.

## Exact-revision launch acceptance

The provisioner captures the new site's production-branch `headCommitSha`. The onboarding Worker keeps that value inside the approved launch record and checks Cloudflare Pages canonical deployment metadata against it. A queued/new commit while an old commit is live **cannot** be reported as a new successful launch. Retrying after a partial failure checks the current authorized repository head. This is verified in pipeline and onboarding tests.
