# Brittney Michelle — Elite Pipeline Starter

**Source:** the supplied `site-mirror.zip` website. The homepage HTML and favicon were retained byte-for-byte. This is a static site, with no framework, build step, npm dependencies, or database.

**Start here: [START-HERE.md](START-HERE.md).**

Repository: https://github.com/mitchelldawkinsjr/Brittney-Site  
Existing website to compare: https://monumental-belekoy-442620.netlify.app/  
Cloudflare Pages project: `elite-pipeline-brittney-michelle-test`

## Files

- `public/index.html` — actual supplied website
- `public/favicon.ico` — original favicon
- `public/_headers` and `public/robots.txt` — basic security and duplicate-test noindex controls
- `public/404.html` — missing-page response
- `public/release.json` — visible version marker used to test redeploys
- `wrangler.toml` — Cloudflare Pages project/output settings
- `.github/workflows/validate.yml` — validates changes on push and PR
- `tests/site.test.mjs` — automated static website checks

## Cloudflare Pages one-time connection

Open [Cloudflare dashboard](https://dash.cloudflare.com/), go to Workers & Pages, import an existing Git repository, and choose `mitchelldawkinsjr/Brittney-Site`. Set production branch `main`, framework **None**, build command **blank**, output directory **`public`**, project name **`elite-pipeline-brittney-michelle-test`**, and leave root directory at repository root. Select **Save and Deploy**.

Read Cloudflare's official [Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/). You must authorize the Cloudflare GitHub application in your own account; a repository config file does not create a Cloudflare project by itself.

## Development and verification

```sh
node --test tests/site.test.mjs
python3 -m http.server 8787 --directory public
```

Then visit http://localhost:8787. For any requested changes, have Codex create a new branch and pull request; inspect the Cloudflare preview and checks before merging to `main`. Merging will trigger production deployment after the Git integration is set up.

## Known limitations / prelaunch review

- The existing contact button uses placeholder `hello@example.com` with a guard that prevents sending.
- The original image cards and portrait contain design placeholders.
- The test is `noindex` until you decide to replace the original public site.
- No form backend, login, database, or secret is required or configured.
- Only the repository owner can authorize the GitHub→Cloudflare connection and bind domains to their Cloudflare account.

## Original source integrity

Original uploaded `site-mirror/index.html` SHA-256: `b1d6159d95d860162db38a9506ebb99b88f4982851a392e148a03727e354d0b3`. Source HTML and favicon remain identical to the upload. Additional deployment files do not affect the source website.
