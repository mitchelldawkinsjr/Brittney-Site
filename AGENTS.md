# Brittney-Site — Elite Pipeline Starter

This repository contains the original Brittney Michelle static website and a Cloudflare Pages deployment configuration.

## Cloudflare workflow
- Use the official Cloudflare Skills and Cloudflare MCP server documented at https://developers.cloudflare.com/agent-setup/prompt.md.
- Cloudflare MCP is registered in `.codex/config.toml` for trusted Codex projects. Cloudflare account access requires user OAuth authorization.
- Cloudflare Pages project: `elite-pipeline-brittney-michelle-test`.
- Production branch: `main`; build command: blank; output directory: `public`; framework: None.
- `wrangler.toml` is already present; use Wrangler guidance for CLI tasks when needed.
- To test changes, use a new branch and pull request, verify CI and deployment preview, and merge only after approval.
- Run `node --test tests/site.test.mjs` for changes to the website.

## Guardrails
- Preserve the existing website design and content unless an update is explicitly requested.
- Do not replace the placeholder email `hello@example.com` with invented contact details.
- Keep the original Netlify site untouched and avoid changing live DNS or a custom domain without explicit owner approval.
- Keep credentials and Cloudflare tokens out of commits, logs, and chat; use OAuth or securely managed secrets.
- Keep the Cloudflare test deployment unindexed until the owner requests a production migration.
- If account permissions or MCP authorization are missing, report the exact blocker rather than claiming deployment succeeded.
