# Elite Pipeline Starter — Brittney Michelle (real-site test)

**New to websites? Start with [START-HERE.md](START-HERE.md). It has the three steps: GitHub → Cloudflare Pages → request an update.**

This repository contains **the supplied Brittney Michelle website**, from `site-mirror.zip`, rather than a generated replacement. The homepage HTML and favicon are copied without modification. The production website is a static single-page portfolio; **no framework, npm install, or build tool is required**.

## Important before going live

- The **Get In Touch** button still uses the placeholder `hello@example.com`. Its click guard prevents sending to that example address. Replace it with an approved professional contact address before publishing as the official site.
- Production image cards and the portrait are **design placeholders**, as described on the site itself.
- This test deployment includes **noindex rules** in `public/_headers` and `public/robots.txt` to discourage indexing a duplicate test site. Remove the `X-Robots-Tag` line and change `robots.txt` before making the new address the official indexed site.
- Deployment to a public `*.pages.dev` URL does not replace or alter the existing Netlify website. Keep both separate until migration has been approved.
- No login, database, or form backend was included in the uploaded original site.

## Files

```text
public/
  index.html       # original site HTML, unchanged
  favicon.ico      # original favicon, unchanged
  404.html         # branded missing-page response
  _headers         # security headers and test-only noindex
  robots.txt       # test-only crawlers instruction
  release.json     # update-test version marker
.github/workflows/validate.yml   # checks each push and PR
tests/site.test.mjs                # Node built-in tests
wrangler.toml                      # Cloudflare Pages project name + publish settings
START-HERE.md                      # simple, nontechnical setup instructions
```

## Run checks locally

```bash
node --test tests/site.test.mjs
python3 -m http.server 8787 --directory public
# open http://localhost:8787
```

## One-time GitHub setup

1. Sign in at https://github.com/new and create **private** repository `elite-pipeline-brittney-michelle-test`, with no automatic README or starter files.
2. Unzip this project on your computer and run the following commands from within its folder, replacing `<YOUR_GITHUB_USERNAME>`:

```bash
git init -b main
git add .
git commit -m "Initial import of Brittney Michelle website"
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/elite-pipeline-brittney-michelle-test.git
git push -u origin main
```

If Git is already initialized, adjust those commands accordingly. You can alternatively upload the extracted files using GitHub's **Add file → Upload files** interface. Do not upload only the ZIP file: Cloudflare must receive the HTML and other files as repository files.

## Cloudflare Pages setup

1. In https://dash.cloudflare.com/ open **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Authorize GitHub and choose `elite-pipeline-brittney-michelle-test`. Allow access to that repository.
3. Configure the following:

| Setting | Value |
|---|---|
| Framework | None (static HTML) |
| Production branch | `main` |
| Root directory | `/` (repository root) |
| Build command | blank (or `exit 0`) |
| Build output directory | `public` |

4. The `wrangler.toml` file in the repository also declares the Cloudflare Pages project name and output directory. Keep these values consistent with the dashboard. Deploy and save the assigned `https://<project>.pages.dev` address. Validate the site and verify `https://<project>.pages.dev/release.json` says `starter-v1`.
5. Confirm the website visually on desktop and mobile before treating the copy as production-ready. A successful build alone does not confirm design or functional equivalence.

Official guidance: https://developers.cloudflare.com/pages/get-started/git-integration/ and https://developers.cloudflare.com/pages/framework-guides/deploy-anything/ .

## Prove future AI-driven updates

After GitHub integration is connected, ask ChatGPT/Codex:

> In `elite-pipeline-brittney-michelle-test`, change only `public/release.json` from `starter-v1` to `starter-v2`, and update the homepage's contact heading to "Let's tell your story together." Open a pull request. Do not merge it until CI passes and the Cloudflare preview looks correct.

1. Inspect the GitHub pull request and CI checks.
2. Check the Cloudflare preview link on desktop and phone.
3. Merge the PR to `main`.
4. Verify the production homepage's heading and `/release.json` showing `starter-v2`.
5. Compare the update workflow's cost, speed, and complexity with Netlify.

## Original source verification

- Uploaded original filename: `site-mirror.zip`.
- Origin website to compare: https://monumental-belekoy-442620.netlify.app/
- Original `site-mirror/index.html` SHA-256: **`b1d6159d95d860162db38a9506ebb99b88f4982851a392e148a03727e354d0b3`**.
- This project preserves `index.html` and `favicon.ico` byte-for-byte from the uploaded ZIP. The additional deployment files do not alter the source website content.
