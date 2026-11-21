# Elite Pipeline — Cloudflare deployment workflow

This repository is the source of truth for Brittney Michelle's static website.

## Hosting

- Cloudflare Pages project: `elite-pipeline-brittney-michelle-test`
- Repository: `mitchelldawkinsjr/Brittney-Site`
- Production branch: `main`
- Site output: `public`
- Build command: none
- Framework: none
- Public test address: https://elite-pipeline-brittney-michelle-test.pages.dev
- Existing Netlify website remains unchanged.

The Cloudflare Pages project is configured to connect to GitHub and deploy pushes to `main` automatically. It also permits preview builds for pull requests.

## How to update the website safely

1. Request a change in ChatGPT.
2. Create a feature branch and GitHub pull request, rather than editing `main` for website changes.
3. Confirm `node --test tests/site.test.mjs` passes, and inspect the Cloudflare preview deployment.
4. Approve and merge the pull request.
5. Verify the production website and `/release.json` reflect the change.

## Bootstrap

This documentation commit was added to `main` specifically to trigger and verify the first GitHub-connected Cloudflare Pages deployment.

## Production safety

The current test version intentionally opts out of indexing. Do not change DNS, promote it as the live site, or remove noindex controls without site-owner approval. The contact address in the supplied source is a placeholder and must be replaced by an approved real address before launch.
