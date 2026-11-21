# Elite Pipeline Starter — launch Brittney Michelle's website

Your GitHub repository is already created: **[Brittney-Site](https://github.com/mitchelldawkinsjr/Brittney-Site)**. ChatGPT uploaded the website and Cloudflare configuration to it. You only need to connect Cloudflare Pages once.

## Step 1 — Connect Cloudflare Pages (one time)

1. Sign in to [Cloudflare](https://dash.cloudflare.com/) or make a free account.
2. Open **Workers & Pages → Create application → Pages → Import an existing Git repository** (or **Connect to Git**).
3. Connect/authorize GitHub if prompted. Choose **`mitchelldawkinsjr/Brittney-Site`** and proceed.
4. Use these settings:

| Setting | Value |
|---|---|
| Project name | `elite-pipeline-brittney-michelle-test` |
| Production branch | `main` |
| Framework | `None` |
| Build command | leave blank |
| Build output directory | `public` |
| Root directory | default (`/`) |

5. Click **Save and Deploy**. Cloudflare will show a `.pages.dev` URL. Copy that link and open it. There is no domain to buy for this test.

The repository's `wrangler.toml` stores the project name and output directory. You do not need to install Node, configure environment variables, or add a database.

## Step 2 — Confirm the website works

- Open the new `.pages.dev` URL on phone and computer.
- Open `https://YOUR-PROJECT.pages.dev/release.json` — it should show `starter-v1`.
- Compare the design with the [existing Netlify website](https://monumental-belekoy-442620.netlify.app/).
- Check the GitHub Actions workflow is green: [Actions](https://github.com/mitchelldawkinsjr/Brittney-Site/actions).

## Step 3 — Ask ChatGPT for an update (repeat anytime)

Say: **“In `mitchelldawkinsjr/Brittney-Site`, update `public/release.json` from `starter-v1` to `starter-v2` on a new branch and open a PR. Keep the rest unchanged.”**

Review the Cloudflare preview and GitHub checks, then merge the PR. Cloudflare automatically updates the live website. No further setup is required.

**The whole repeatable process: Ask → Preview → Approve → Live.**

## Important for this test

- This is a **copy**, so the existing Netlify site will not change.
- Contact email is a placeholder (`hello@example.com`) and is deliberately blocked from sending. Replace with a real approved address before an official launch.
- Original image placeholders are preserved as supplied.
- Search engines are told **not to index** the test copy. This is intentional.
- The GitHub repository is currently **public**. If you want it private, change **GitHub → Repository Settings → General → Danger Zone → Change repository visibility**, provided you have access to that control. Be aware that the website source is already public in its deployed form even when a repository is private.
