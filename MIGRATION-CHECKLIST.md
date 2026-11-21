# Elite Pipeline Starter — migration experiment checklist

## Completed
- [x] Extracted actual supplied website and preserved homepage and favicon.
- [x] Configured a static Cloudflare Pages project (`wrangler.toml`, output directory `public`).
- [x] Added static security headers, test-only noindex settings, 404 page and release marker.
- [x] Added and passed nine local Node tests.
- [x] Verified local desktop/mobile browser renderings with no horizontal overflow or JavaScript errors.
- [x] Found the new remote GitHub repository: `mitchelldawkinsjr/Brittney-Site`.

## Cloudflare integration — one-time user action
- [ ] Authorize the Cloudflare Pages GitHub integration.
- [ ] Choose `mitchelldawkinsjr/Brittney-Site`, branch `main`.
- [ ] Choose framework None, blank build command, output `public`.
- [ ] Deploy, save the `.pages.dev` URL, and visually compare it with the existing Netlify website.
- [ ] Confirm the remote `/release.json` says `starter-v1`.
- [ ] Ask ChatGPT/Codex for a tiny `starter-v2` pull request, review preview/CI, merge, and confirm the live version changed.

## Before making it the official site
- [ ] Use a real approved contact email in place of the guarded placeholder.
- [ ] Replace any image placeholders with approved images.
- [ ] Approve domain switch and remove `noindex` after the official launch decision.
- [ ] Test forms, links, accessibility, SEO, performance and rollback.
- [ ] Consider setting the source GitHub repository private if desired (it currently shows as public).
