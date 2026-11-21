# Connect Cloudflare to Codex — Elite Pipeline Starter

This repository is prepared to deploy the Brittney Michelle static website to Cloudflare Pages. **Connecting the Cloudflare account requires you to authorize access once.** The official Cloudflare agent guide is https://developers.cloudflare.com/agent-setup/prompt.md.

## Easiest route — Codex desktop

1. Open this repository in Codex desktop or Codex CLI.
2. In Codex, open **Plugins** (or type `/plugins` in the CLI), search **Cloudflare**, and install the official plugin. This includes Cloudflare Skills and registers its MCP tools.
3. When Codex first calls a Cloudflare tool, approve the Cloudflare OAuth login in your browser.
4. Tell Codex: **"Using the Cloudflare plugin and this GitHub repository, create a Cloudflare Pages project with Git integration on `main`. Project name `elite-pipeline-brittney-michelle-test`; framework None; blank build command; output `public`. Do not alter the original Netlify site or any custom domain. Verify the deployed `/release.json` endpoint and return the pages.dev URL."**

Official Codex-specific guide: https://developers.cloudflare.com/agent-setup/codex/

## Command-line route (per Cloudflare's prompt.md)

If using a local Codex CLI, the official commands are:

```bash
npx -y skills add cloudflare/skills --skill '*' --yes --global
codex mcp add cloudflare --url https://mcp.cloudflare.com/mcp
codex mcp login cloudflare
```

The repository already declares the Cloudflare MCP endpoint in `.codex/config.toml`; **you do not need to add a second copy** if Codex recognizes the project configuration. In that case, only install the skills (if not installing the official plugin) and sign in when prompted.

Verify with:

```bash
codex mcp list
```

**Do not commit tokens or private credentials.** OAuth happens in your local browser.

## Alternative: connect directly through ChatGPT Plugins

If your ChatGPT account offers **Settings → Plugins → Add custom MCP server**, enter the official URL `https://mcp.cloudflare.com/mcp`, choose the supported OAuth authentication, and authorize your Cloudflare account. The new server must be made available to the chat before ChatGPT can call Cloudflare tools. Do not assume saving a URL in GitHub connects this chat.

## Cloudflare Pages configuration

| Setting | Value |
|---|---|
| GitHub repo | `mitchelldawkinsjr/Brittney-Site` |
| Cloudflare Pages project | `elite-pipeline-brittney-michelle-test` |
| Branch | `main` |
| Framework preset | None |
| Build command | Leave blank |
| Build output directory | `public` |
| Existing config file | `wrangler.toml` |

## Deployment smoke test

After deploying, open the new `https://YOUR-PROJECT.pages.dev/` and `https://YOUR-PROJECT.pages.dev/release.json`. Check that the JSON contains `starter-v1` and the site matches the original Netlify design.

Then ask Codex to make a pull request changing only `public/release.json` to `starter-v2`. Review the preview and CI, merge when ready, and confirm the production URL returns `starter-v2`.

## Boundaries

Configuring GitHub, a repository-level MCP entry, or this documentation **does not** independently authenticate a Cloudflare account or create a Cloudflare Pages project. The Git integration and first deployment need authorized Cloudflare access.
