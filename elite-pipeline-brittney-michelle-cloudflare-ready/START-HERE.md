# Elite Pipeline Starter: launch this website in 3 steps

This is Brittney Michelle's **actual uploaded website**, ready to test on Cloudflare Pages. We copied its homepage and favicon without changing the original design. You do **not** need to learn HTML, buy hosting, or install a framework.

## Step 1 — Put the website in GitHub (one time)

1. Open **https://github.com/new** and sign in.
2. Repository name: `elite-pipeline-brittney-michelle-test`. Choose **Private** and select **Create repository**. Leave the automatic README option off.
3. Extract the downloaded project ZIP, then in the new GitHub repository choose **uploading an existing file**. Drag the **contents** of the extracted project folder (including `public`, `tests`, `.github`, `wrangler.toml`, and the Markdown instructions) into GitHub. Select **Commit changes**.

> Important: Upload the **files and folders, not the ZIP itself**. On macOS, Finder may hide the `.github` folder; press **Command + Shift + .** to show hidden files. If dragging folders does not work for your browser, use GitHub Desktop or the Git commands in `README.md`.

## Step 2 — Connect Cloudflare Pages (one time)

1. Open **https://dash.cloudflare.com/**. Go to **Workers & Pages → Create application → Pages → Connect to Git**.
2. Select GitHub, authorize Cloudflare, choose the new private repository, and click **Begin setup**.
3. Fill in exactly these values:

| Cloudflare setting | Enter this |
|---|---|
| Project name | `elite-pipeline-brittney-michelle-test` |
| Production branch | `main` |
| Framework preset | `None` (no framework) |
| Build command | *Leave empty* |
| Build output directory | `public` |
| Root directory | `/` (default) |

4. Click **Save and Deploy**. Cloudflare will provide a new website address ending in `.pages.dev`. Open it and compare with the reference Netlify website.

> The `wrangler.toml` file in this repository already declares the project name and `./public` deployment directory. Keep the Cloudflare setup aligned with it; there are no secrets, databases, or environment variables to enter.

## Step 3 — Make a change whenever you want

1. Connect this GitHub repository to ChatGPT's **Codex** coding workflow.
2. Ask: "In `elite-pipeline-brittney-michelle-test`, change `public/release.json` from `starter-v1` to `starter-v2` and open a pull request. Keep everything else unchanged."
3. Review GitHub's test results and Cloudflare's preview link. If correct, **Merge** the pull request.
4. Visit `https://YOUR-CLOUDFLARE-ADDRESS.pages.dev/release.json` and check that it says `starter-v2`.

**That's the repeatable workflow: ask → preview → approve → live.** Cloudflare deploys new commits to `main` automatically. You do not need to reconnect GitHub or repeat step 2.

## What remains intentionally unfinished

- **Contact email:** The current site uses `hello@example.com`; its button displays a warning instead of sending an email. Supply a real approved address before promoting the website.
- **Images:** Original design placeholders remain in place.
- **Search engines:** This **test copy** is marked `noindex` so it does not compete with the original site. Remove test indexing restrictions **only when** the new site is approved as the official public website.
- **Domain:** Leave the original Netlify site and domain untouched during this experiment. Connecting the final custom domain is a later, separate approval step.

## How to know the test succeeded

- The same Brittney Michelle design appears at the new `.pages.dev` URL.
- GitHub's `Validate static site` workflow passes.
- A pull request shows a preview deployment before publishing.
- Merging the PR changes the live `/release.json` from `starter-v1` to `starter-v2` without repeating deployment setup.

For troubleshooting and optional terminal commands, see [README.md](README.md).
