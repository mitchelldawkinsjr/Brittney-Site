# Customer provisioning: milestone 2

This is the **first implementation milestone**, not a one-click live provisioner. The plan generator produces a deterministic, reviewable resource graph and **makes no API calls**. It never handles credentials.

Run locally with Node 22:

```sh
node --test pipeline/plan-customer.test.mjs
node pipeline/plan-customer.mjs customer.json
```

Example `customer.json`:

```json
{"name":"Second Customer","accountId":"YOUR_32_CHARACTER_CLOUDFLARE_ACCOUNT_ID","githubOwner":"YOUR_GITHUB_USERNAME","forms":false}
```

Forms are disabled unless `forms:true` and a valid `ownerEmail` are supplied. The plan identifies the resources and their dependencies but does not create them.

## Remaining implementation

- Authorized, idempotent GitHub repo and Pages provisioning with ownership collision checks.
- D1 schema migration, Worker deployment and secret inheritance.
- Turnstile creation and protected Cloudflare Access dashboard with explicit owner authorization.
- Live deployment checks, human Turnstile submission, dashboard login and failure recovery.
- A second independent customer environment for acceptance testing.

Never reuse the staging customer's secrets, database or Access policy for another customer. Keep email notifications disabled by default.
