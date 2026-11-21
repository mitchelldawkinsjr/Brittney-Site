# Brittney forms staging

Cloudflare D1 database `esp-brittney-forms-staging` is created and migrated (zero submissions). This is isolated from the production Pages site.

Do not merge or activate contact forms until a staging Worker is deployed with `TURNSTILE_SECRET`, a matching public Turnstile site key, and rate limiting; configure Cloudflare Access JWT verification (`CF_ACCESS_AUD`, `CF_ACCESS_TEAM_DOMAIN`, `ADMIN_EMAIL`) before exposing `/admin`. Owner email notification may be enabled only after verifying the destination address and binding Cloudflare Email Service. Paid arbitrary-recipient emails require Workers Paid.

The existing Pages project remains unchanged. The original site has no functional contact form. Deploy a dedicated Worker at a staging workers.dev hostname; never route the public site to it before end-to-end validation.
