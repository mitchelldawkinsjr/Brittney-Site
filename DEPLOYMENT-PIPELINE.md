# Brittney reference website — existing Cloudflare deployment

> **Scope:** This document covers the **Brittney Michelle reference website**, not the reusable Elite Site Pipeline product. See [README](README.md) for the product and [onboarding/README.md](onboarding/README.md) for the unfinished independent onboarding app.

| Setting | Reference value |
|---|---|
| GitHub repository | `mitchelldawkinsjr/Brittney-Site` (legacy URL) |
| Git branch | `main` |
| Cloudflare Pages project | `elite-pipeline-brittney-michelle-test` |
| Cloudflare Pages URL | https://elite-pipeline-brittney-michelle-test.pages.dev |
| Build command | none |
| Output directory | `public` |
| Framework | static HTML |
| Previous public source | https://monumental-belekoy-442620.netlify.app/ (untouched) |

The Pages project is GitHub-integrated. Pushes to `main` deploy automatically when Cloudflare integration is healthy; preview deployments may be available for PRs.

## Safely update the reference

1. Ask for a scoped website change.
2. Create a feature branch and PR; preserve user-provided content and placeholders that have not been approved for replacement.
3. Verify `node --test tests/site.test.mjs` plus other affected tests; inspect the Cloudflare preview.
4. Obtain owner approval before merging or publishing.
5. Confirm the deployed production website actually reflects the expected commit and contents.

## Contact-form reference acceptance

The staging form uses **Cloudflare Turnstile**, a **Worker**, **D1**, and a **Cloudflare Access-protected owner dashboard**. A real submission passed verification, was saved in D1, and appeared in the owner dashboard. That proves the Brittney reference flow; **it does not provision forms for other customers**.

Keep the form's staging database, Turnstile secret, Worker, Cloudflare Access policy, and site isolation intact. Do not reuse these resources in the product onboarding service.

## Restrictions

The staging test site is **noindex**. Do not change its DNS or remove noindex controls without approval. Renaming this GitHub repository without validating the Cloudflare app source connection could interrupt deployments. See [repository strategy](docs/REPOSITORY-STRATEGY.md).
