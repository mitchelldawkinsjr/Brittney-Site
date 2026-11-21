# Customer onboarding: connect accounts, approve, launch

This is the **target customer experience**, not a statement that a hosted OAuth login or a published ChatGPT plugin is already live. Current executable provisioning is in `pipeline/provision-site.mjs` and still needs authorized GitHub and Cloudflare bearer credentials.

## Intended experience (no terminal or API keys for customers)

1. Customer describes a website in a conversation. The assistant gathers business name, pages, copy, assets, preferred look, and whether forms are desired.
2. **Connect GitHub**: customer installs/authorizes the Elite Site Pipeline GitHub App and approves the minimum permissions needed for repository creation and updates. A backend receives a GitHub App **user-to-server** access token, not a pasted personal access token. Confirm the actual GitHub user with `GET https://api.github.com/user`.
3. **Connect Cloudflare**: redirect to the public Cloudflare OAuth client's consent page. Customer selects an authorized account. Verify access to that account via Cloudflare's `GET /accounts/:accountId` using the OAuth access token.
4. **Connect GitHub to Cloudflare Pages**: Cloudflare's **Workers & Pages GitHub App** is a separate authorization. If not already installed for the customer, prompt them to authorize it. For installations restricted to specific repositories, they may need to add the **new** repository after creation. Do not silently broaden repository access. Cloudflare's own app authorization cannot be replaced with our GitHub App.
5. Customer previews generated pages and approves a concise description of new resources, data storage and domain. This explicit launch approval is saved server-side against the authenticated session and exact plan. **Connecting accounts does not automatically mean permission to create resources.**
6. Server provisions or reuses a customer-isolated repository and Cloudflare project. The contact-form path additionally requires independent D1, Worker, Turnstile and Access resources and is currently blocked pending full implementation.
7. Server verifies that deployment succeeded and that the public website responds; show the URL and future editing instructions. Later changes follow an approval/PR/test/deploy process.

## Cloudflare OAuth library — implemented, but not wired into a hosted callback

`pipeline/cloudflare-oauth.mjs` exports:

- `beginCloudflareOAuth({clientId,redirectUri,scopes})`: creates a cryptographically random state + PKCE S256 verifier and a URL for `https://dash.cloudflare.com/oauth2/auth`. Its `session` result contains **secrets**, for an encrypted, short-lived server-side store only. Never give the session object, verifier or tokens to the browser, conversation or logs.
- `completeCloudflareOAuth({clientId,redirectUri,code,receivedState,expectedState,codeVerifier,clientSecret?,fetchFn?})`: uses constant-time OAuth state comparison and an HTTPS callback URI, then exchanges the code with `https://dash.cloudflare.com/oauth2/token`. `clientSecret` is only provided for a confidential server-side client. Token responses are **sensitive**; the function deliberately does **not** store or print them.
- `verifyCloudflareAccount({accessToken,accountId})`: validates that the token can read the selected account and that its ID matches.
- `verifyProviderConnections(customerConfig,{githubAccessToken,cloudflareAccessToken})`: separately verifies the real GitHub user and Cloudflare account, without provisioning resources. Its response explicitly reports that **Cloudflare's GitHub integration is not yet verified**.

## GitHub App OAuth primitives — implemented, not hosted

`pipeline/github-app-oauth.mjs` exports:

- `beginGitHubAppOAuth({clientId,redirectUri,offlineAccess=true})` builds a GitHub App authorization URL using state and PKCE S256. `offline_access` requests expiring user access and refresh tokens without requesting any conventional OAuth repository scopes; GitHub App permissions are configured in the GitHub App registration.
- `completeGitHubAppOAuth({clientId,clientSecret,redirectUri,code,receivedState,expectedState,codeVerifier})` rejects missing or mismatched state and exchanges the code through `https://github.com/login/oauth/access_token`. The confidential client secret and returned user/refresh tokens **must remain in the backend**.
- These functions do not install the GitHub App, create a user-facing callback route, persist or rotate tokens, or grant Cloudflare's GitHub integration access. Those steps remain separate.

See [Generating a user access token for a GitHub App](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app). The authenticated user-to-server access token must have the GitHub App's **repository creation** permission and contents permissions for the initial repo bootstrap. An installation token alone is not interchangeable with the user token used by the current `POST /user/repos` executor.

The hosting application must still implement:
- Cloudflare OAuth client registration and required domain verification to make the client **public**, plus exact HTTPS callback registration.
- A backend session (secure, HttpOnly, SameSite cookie), short expiration, state tied to the logged-in user, **atomic one-time consumption** of state, token encryption at rest and revocation/disconnect.
- GitHub App registration, install/authorize callback, secure user-to-server token handling, minimum user **repository creation** permission and repository contents write permission.
- Account-selection UI, Cloudflare Workers & Pages GitHub App consent/permission detection, server-side final approval, application-specific tenant isolation and job orchestration.
- Real second-customer OAuth and provisioning acceptance tests. No production OAuth client is registered by this PR.

Cloudflare supports OAuth Authorization Code, and PKCE S256 for public clients. To become publicly usable, a Cloudflare OAuth client needs verified ownership of the client domain, name, logo, URL and scopes. Obtain the **exact** required scopes from the official `GET /oauth/scopes` API, not guessed scope identifiers.

Cloudflare documentation:
- [Register clients](https://developers.cloudflare.com/fundamentals/oauth/create-an-oauth-client/)
- [OAuth endpoints](https://developers.cloudflare.com/fundamentals/oauth/integrate-with-cloudflare/)
- [GitHub integration authorization](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)

GitHub documentation:
- [Permissions for GitHub Apps](https://docs.github.com/en/rest/authentication/permissions-required-for-github-apps)
- [GitHub App user tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-on-behalf-of-a-user)

## Security and authorization invariants

- Only backend-verified identities can determine which GitHub owner and Cloudflare account will be used. Never trust a client-supplied `connected:true` flag or account ID alone.
- A submitted OAuth code must be exchanged once, and only when expected state matches the authenticated user session. Rotating state must not remove an existing session's safety checks.
- Provider access tokens must not appear in URLs, browser storage, static HTML, logs, PR diffs or customer-facing error messages.
- Short-lived tokens and minimum scope; allow customers to disconnect and revoke access.
- Never share one customer's Cloudflare D1, Turnstile secret, Access policy or submissions with another.
- Recover from a partial setup by checking ownership markers and reusing **only exact matching** resources, never auto-deleting or adopting unrelated resources.
- A deploy request is not a successful website: require published deployment and public HTTP verification.
- Website-only is the initial beta mode. Do not expose forms in the launch UI as complete until the dedicated provisioning and live acceptance flow is implemented.

## Two deployment strategies

**ChatGPT plugin/connected-app-first (preferred beta UX):** the user connects GitHub and Cloudflare to ChatGPT, and the orchestrator uses those authorized connector capabilities directly. This route need not give the user API keys; exact provider permissions and supported API operations must be confirmed. A public plugin still needs separate publication and authorization work.

**Standalone self-service portal:** the portal owns the GitHub App and Cloudflare OAuth client, redirects customers to each provider's consent flow, and stores encrypted tokens server-side. The two strategies can share the same plan, provisioning checks and deployment verifier.

Current repo's manually dispatched GitHub Action is an **operator-only fallback**, not the final customer onboarding experience.
