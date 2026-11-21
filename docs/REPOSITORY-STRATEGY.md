# Repository identity and migration strategy

## Decision

**Launch & Own** (*Describe it. Launch it. Own it.*) is the product. Brittney Michelle is a verified customer reference site, not the product name.

The original GitHub repository `mitchelldawkinsjr/Brittney-Site` began with the Brittney reference website. The dedicated product repository [`mitchelldawkinsjr/launch-and-own`](https://github.com/mitchelldawkinsjr/launch-and-own) has now been initialized with a curated, customer-free source import (PR #1). The original repository stays intact for the verified reference deployment.

## Established repository layout

- **Product repository:** `mitchelldawkinsjr/launch-and-own` — version-controlled customer-agnostic `pipeline/`, `onboarding/`, documentation, CI, templates, future plugin source, and a non-customer-specific demonstration.
- **Reference customer repository:** `mitchelldawkinsjr/Brittney-Site` — `public/`, customer-specific `forms/`, website QA and deployment settings. The reference can consume tagged product releases or curated customer-specific setup outputs when appropriate.
- **Other customers:** their own repository and Cloudflare account, provisioned by the pipeline. No shared customer secrets, databases, contact data or live DNS.

This separation prevents the product's onboarding Worker CI and customer form/website deployment from sharing one production release lifecycle. It also makes the public product's README and Issues independent of a real customer's content.

## Why not rename the existing repository immediately?

Cloudflare's existing test Pages project is verified to reference the **GitHub owner/repo `mitchelldawkinsjr/Brittney-Site`**, branch `main` and output `public`. Renaming or moving the repo before the platform source and CI have been extracted could interrupt production/preview Git integration and old links. GitHub's URL redirects do not guarantee Cloudflare App repository authorization or a healthy new deployment.

The available GitHub connection can update files and open PRs, but currently does not expose an operation to **create or rename repositories** or change the repository's About description/topics. Therefore the GitHub URL/metadata remain unchanged until an authorized administrator completes creation and the migration is verified. Do not misrepresent this documentation update as a GitHub repository rename.

## Non-disruptive extraction sequence

1. Keep the current repo and Brittney deployment unchanged while product code matures.
2. **Completed:** `launch-and-own` repository created under the proper owner, with publicly visible source. No customer form submissions or secrets were imported.
3. **Completed:** copied and tested *only* product modules (`pipeline/`, `onboarding/`, supporting CI/docs and generic tests). Replace any Brittney-specific values and reference URLs in product defaults with generated config. Configure product-owned but **isolated** onboarding D1/OAuth/Worker resources.
4. Create a clean product README, security guidance, license chosen by the owner, and product-specific actions, release process and issues.
5. Run the same tests in the new repo. Obtain a second customer OAuth/login + provisioning/verification acceptance test before calling public beta live.
6. Update developer docs and references in the Brittney repo to the new product repository. Keep Brittney's Pages GitHub integration on its existing repo.
7. After validating product and reference independently, remove or deprecate duplicated product-only code in Brittney through an approved PR. Never delete the working reference repository to repurpose its slug.

## Status

- Product/source identity in README and agent documentation: **updated in this PR**.
- Existing GitHub repository **name, URL, description/topics:** **not changed**.
- New dedicated product GitHub repository: **created**, imported via [Launch & Own PR #1](https://github.com/mitchelldawkinsjr/launch-and-own/pull/1), standalone CI tested.
- Brittney GitHub→Cloudflare Pages connection: **preserved**.
- Hosted OAuth onboarding: **code merged, not configured/deployed**.

Repository separation is now established: treat this repository as the **customer reference** and the new repository as the **canonical product source**. Keep customer site and form resources isolated.


## Portable product-only export

Use **Build Launch & Own portable source**, the manually triggered GitHub Actions workflow in `.github/workflows/product-export.yml`, to generate a downloadable artifact named `launch-and-own-product-source`. The ZIP contains a **standalone** `launch-and-own/` source tree with product modules, an isolated onboarding D1 template, a dedicated CI workflow, and a new product README. It excludes the Brittney site (`public/`), customer forms (`forms/`), site-specific feature manifests, contact data, and customer Cloudflare IDs.

The exporter is safe to run locally with Node.js 22+, and its regression suite includes running the exported product's own tests:

```sh
node --test scripts/export-launch-and-own.test.mjs
node scripts/export-launch-and-own.mjs /tmp/launch-and-own-export
```

The exported `onboarding/wrangler.jsonc` deliberately contains `REPLACE_WITH_INDEPENDENT_D1_UUID` and **must not** be deployed until a new, authorized onboarding database is configured. OAuth app registrations and secrets are not packaged. No repository is created merely by generating the ZIP.

**Completed:** The dedicated repository was created, and the curated product source imported on [PR #1](https://github.com/mitchelldawkinsjr/launch-and-own/pull/1). Its independent test CI passed. The original Brittney Pages GitHub integration remains connected to the original repository.

**Licensing:** The export intentionally includes no license until the owner selects one.
