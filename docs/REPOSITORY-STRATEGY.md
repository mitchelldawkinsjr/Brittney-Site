# Repository identity and migration strategy

## Decision

**Launch & Own** (*Describe it. Launch it. Own it.*) is the product. Brittney Michelle is a verified customer reference site, not the product name.**

The current GitHub repository `mitchelldawkinsjr/Brittney-Site` was created for that customer's website and later accumulated the reusable pipeline and hosted onboarding application. It should not permanently carry a customer name as the product's canonical source repository.

## Recommended target layout

- **Product repository:** `mitchelldawkinsjr/launch-and-own` — version-controlled customer-agnostic `pipeline/`, `onboarding/`, documentation, CI, templates, future plugin source, and a non-customer-specific demonstration.
- **Reference customer repository:** `mitchelldawkinsjr/Brittney-Site` — `public/`, customer-specific `forms/`, website QA and deployment settings. The reference can consume tagged product releases or curated customer-specific setup outputs when appropriate.
- **Other customers:** their own repository and Cloudflare account, provisioned by the pipeline. No shared customer secrets, databases, contact data or live DNS.

This separation prevents the product's onboarding Worker CI and customer form/website deployment from sharing one production release lifecycle. It also makes the public product's README and Issues independent of a real customer's content.

## Why not rename the existing repository immediately?

Cloudflare's existing test Pages project is verified to reference the **GitHub owner/repo `mitchelldawkinsjr/Brittney-Site`**, branch `main` and output `public`. Renaming or moving the repo before the platform source and CI have been extracted could interrupt production/preview Git integration and old links. GitHub's URL redirects do not guarantee Cloudflare App repository authorization or a healthy new deployment.

The available GitHub connection can update files and open PRs, but currently does not expose an operation to **create or rename repositories** or change the repository's About description/topics. Therefore the GitHub URL/metadata remain unchanged until an authorized administrator completes creation and the migration is verified. Do not misrepresent this documentation update as a GitHub repository rename.

## Non-disruptive extraction sequence

1. Keep the current repo and Brittney deployment unchanged while product code matures.
2. Create **new** `launch-and-own` repository under the correct owner through an authorized GitHub interface, with narrowly scoped permissions and an approved visibility setting. Do not clone or move customers' form submissions or secret bindings.
3. Copy and test *only* product modules (`pipeline/`, `onboarding/`, supporting CI/docs and generic tests). Replace any Brittney-specific values and reference URLs in product defaults with generated config. Configure product-owned but **isolated** onboarding D1/OAuth/Worker resources.
4. Create a clean product README, security guidance, license chosen by the owner, and product-specific actions, release process and issues.
5. Run the same tests in the new repo. Obtain a second customer OAuth/login + provisioning/verification acceptance test before calling public beta live.
6. Update developer docs and references in the Brittney repo to the new product repository. Keep Brittney's Pages GitHub integration on its existing repo.
7. After validating product and reference independently, remove or deprecate duplicated product-only code in Brittney through an approved PR. Never delete the working reference repository to repurpose its slug.

## Status

- Product/source identity in README and agent documentation: **updated in this PR**.
- Existing GitHub repository **name, URL, description/topics:** **not changed**.
- New dedicated product GitHub repository: **not created**.
- Brittney GitHub→Cloudflare Pages connection: **preserved**.
- Hosted OAuth onboarding: **code merged, not configured/deployed**.

Until repository separation, treat the current repository as a **temporary combined product/reference source** and enforce strict tenant separation at the code and infrastructure layers.
