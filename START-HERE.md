# Start here — Elite Site Pipeline

This repository is currently a **development monorepo for Elite Site Pipeline**, with the **Brittney Michelle staging website** serving as the verified real-world reference. It is not a published general-purpose onboarding service yet.

## What are you doing?

| Goal | Start here |
|---|---|
| Understand the product and current maturity | [README](README.md) |
| Develop the reusable GitHub + Cloudflare provisioner | [Customer provisioning](pipeline/CUSTOMER_PROVISIONING.md) |
| Review the nontechnical OAuth onboarding experience | [Hosted onboarding](onboarding/README.md) |
| Learn where the platform should live long-term | [Repository strategy](docs/REPOSITORY-STRATEGY.md) |
| Continue the verified Brittney staging site | [Reference deployment](DEPLOYMENT-PIPELINE.md) |
| Complete the first independently onboarded customer | [Issue #21](https://github.com/mitchelldawkinsjr/Brittney-Site/issues/21) |

## For someone who wants a website

The eventual workflow is **describe your site → connect your own GitHub and Cloudflare accounts → preview → approve → verified live URL**. It is under development: the OAuth backend code exists, but the live hosted service, OAuth registrations and independent second-customer test are not yet ready.

The **operator-only** [manual provisioning workflow](.github/workflows/provision-customer.yml) can create a simple website with a private GitHub repository on authorized customer accounts after properly scoped tokens have been configured. It is not a no-technical-steps beta or a website designer. Never paste secrets into ChatGPT or commit them.

## For someone maintaining the Brittney reference site

The staging website is already GitHub-connected and deployed at https://elite-pipeline-brittney-michelle-test.pages.dev. The contact form, Turnstile, Worker, D1 and Cloudflare Access owner dashboard have passed an end-to-end live test. The customer staging copy is **noindex**, and the earlier Netlify site was not changed.

The staging project remains linked to this legacy repository name (`Brittney-Site`), branch `main`, static output `public`. To request changes, use a new branch/PR, run tests, review the preview and merge after approval. Recheck the actual production deployment.

The original site comparison URL is https://monumental-belekoy-442620.netlify.app/.

## Local validation

```sh
node --test tests/*.test.mjs forms/tests/*.test.mjs pipeline/*.test.mjs onboarding/*.test.mjs
node pipeline/validate-features.mjs
```

**Project principle:** customer-owned infrastructure and repeatable, conversational website updates. **Current work:** isolate product code into a product-specific repository and get hosted OAuth onboarding to its first verified customer test.
