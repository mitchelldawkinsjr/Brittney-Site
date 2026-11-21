# Automated opt-in form security

The pipeline defaults to **website only**. Do not run this setup unless the user opts into a contact form.

The provisioner `pipeline/provision-turnstile.mjs` uses Cloudflare's API to find or create a Turnstile widget, optionally rotate its secret, and write that secret directly to a Worker binding. It never prints or commits secrets. It can update a local public sitekey file when `FORMS_SITEKEY_FILE` is provided.

The on-demand GitHub workflow requires a scoped `CLOUDFLARE_API_TOKEN` repository secret and `CLOUDFLARE_ACCOUNT_ID` repository variable. The workflow only provisions Turnstile; it does **not** provision D1, deploy a Worker, deploy Pages, or confirm a live submission. Those steps remain separate and must be tested.

When running via a connected Cloudflare integration, prefer executing API calls server-side and passing the returned secret directly to the Worker secrets endpoint without logging or exposing it.

Cloudflare Pages deployment may queue independently of the Worker. Do not report the website as live until the requested deployment reaches `deploy/success` and a public HTTP smoke test succeeds. Email sending stays disabled.
