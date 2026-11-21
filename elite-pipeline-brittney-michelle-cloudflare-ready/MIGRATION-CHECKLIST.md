# Migration and experiment checklist

## Local and source checks
- [x] Extract actual uploaded `site-mirror.zip` and verify it contains the source website.
- [x] Keep homepage and favicon byte-for-byte identical to the uploaded files.
- [x] Add Cloudflare-compatible publish directory, `wrangler.toml` and static security headers.
- [x] Add Node tests and a GitHub Actions workflow.
- [ ] Compare browser-rendered Netlify original against Cloudflare deployment.

## Integration test
- [x] Initialize local Git repository and make an initial commit.
- [ ] Create the **remote** private GitHub repository (not available through current connector).
- [ ] Connect the repository to Cloudflare Pages with output directory `public`.
- [ ] Record the Cloudflare `*.pages.dev` URL.
- [ ] Verify production release `starter-v1` at `/release.json`.
- [ ] Have ChatGPT/Codex open a PR updating version and a small text element.
- [ ] Check CI and Cloudflare preview deployment.
- [ ] Merge PR and verify `starter-v2` on production.

## Before replacing the official Netlify site
- [ ] Obtain and configure approved professional contact email.
- [ ] Replace placeholder images with approved assets where necessary.
- [ ] Remove test-only noindex rules and update metadata if changing domain.
- [ ] Confirm brand/site owner's approval of launch.
- [ ] Review DNS, HTTPS, accessibility, performance, and SEO.
- [ ] Keep a rollback option and avoid repointing the official domain prematurely.
