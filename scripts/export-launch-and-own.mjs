#!/usr/bin/env node
// Export the reusable Launch & Own product without a customer's deployed site.
// No provider API calls, GitHub writes, downloads, secrets, or existing file overwrites.
import {copyFileSync,existsSync,lstatSync,mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {join,resolve,dirname,sep} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";

const DEFAULT_ROOT=fileURLToPath(new URL("../",import.meta.url));
export const PRODUCT_SOURCE_FILES=Object.freeze([
  "pipeline/authorization-checks.mjs",
  "pipeline/authorization-checks.test.mjs",
  "pipeline/cloudflare-oauth.mjs",
  "pipeline/cloudflare-oauth.test.mjs",
  "pipeline/github-app-oauth.mjs",
  "pipeline/github-app-oauth.test.mjs",
  "pipeline/launch-site.mjs",
  "pipeline/launch-site.test.mjs",
  "pipeline/plan-customer.mjs",
  "pipeline/plan-customer.test.mjs",
  "pipeline/provision-site.mjs",
  "pipeline/provision-site.test.mjs",
  "pipeline/verify-site.mjs",
  "pipeline/verify-site.test.mjs",
  "onboarding/crypto.mjs",
  "onboarding/worker.mjs",
  "onboarding/worker.test.mjs",
  "onboarding/validate-config.mjs",
  "onboarding/migrations/0001_initial.sql",
  "onboarding/wrangler.jsonc"
]);

const readme=[
  "# Launch & Own",
  "",
  "**Describe it. Launch it. Own it.**",
  "",
  "Launch & Own is a customer-owned, conversational website launch and maintenance project. The beta website-only provisioning code creates a private GitHub repository, connects Cloudflare Pages, and verifies the requested production revision. Customers retain ownership of their GitHub and Cloudflare accounts.",
  "",
  "> **Source-code beta, not a live self-service website builder.** The GitHub App and Cloudflare OAuth libraries and onboarding Worker must be configured and deployed by an authorized operator before customers can connect accounts. AI-generated design, per-customer contact forms, custom domains, and publication of a ChatGPT plugin are not yet implemented end to end.",
  "",
  "## Code",
  "",
  "- \`pipeline/\`: resource planning, guarded GitHub/Cloudflare provisioning, OAuth primitives, deployment verification and tests.",
  "- \`onboarding/\`: secure callback/session implementation, D1 migration, Worker UI and tests.",
  "- \`onboarding/wrangler.jsonc\`: **template** with a deliberately invalid D1 database ID. Create a dedicated D1 and configure secrets before deployment.",
  "",
  "## Test locally",
  "",
  "Requires Node.js 22 or newer. No provider tokens needed for unit/integration tests.",
  "",
  "\`\`\`sh",
  "npm test",
  "node onboarding/validate-config.mjs # will fail until a dedicated D1 UUID is configured",
  "\`\`\`",
  "",
  "## Before any real customer launch",
  "",
  "Register and authorize a GitHub App, a Cloudflare OAuth client, and the customer's separate GitHub→Cloudflare integration; create an isolated onboarding D1, apply its migration, register an owned HTTPS callback hostname and securely configure Worker secrets. Run a real independent-account launch acceptance test. Do not expose an unconfigured Worker publicly.",
  "",
  "The manual provisioner needs operator-authorized credentials. Never paste tokens into chat or commit them. Connecting accounts does not itself authorize a website to be created: customer launch approval is required.",
  "",
  "## Source and ownership",
  "",
  "This export intentionally excludes the Brittney Michelle reference website, customer contact forms, customer data and customer-specific Cloudflare configuration. It does not transfer or copy the original site's DNS, Turnstile widget, D1 records or Access policy.",
  "",
  "The historical \`esp-\` prefix and legacy managed-resource marker remain for idempotent beta compatibility; **Launch & Own** is the customer-facing product name.",
  "",
  "Choose a license and distribution terms before publicly publishing or reselling the exported code."
].join("\n")+"\n";

const onboardingReadme=[
  "# Launch & Own — hosted onboarding service",
  "",
  "This Worker is an **unconfigured beta template**, not a running OAuth service.",
  "Its functions are GitHub App/Cloudflare OAuth login, one-time state verification, account selection, explicit website approval, guarded provisioning and revision-specific deployment verification.",
  "",
  "## Operator setup",
  "",
  "1. Create an **independent** Cloudflare D1 database for onboarding. Do not use any customer contact-form database.",
  "2. Replace the invalid \`database_id\` in \`wrangler.jsonc\` and apply \`migrations/0001_initial.sql\`.",
  "3. Register a GitHub App and Cloudflare OAuth client with minimally required scopes, real HTTPS callback URLs on a hostname you control.",
  "4. Set Worker environment bindings \`ONBOARDING_ORIGIN\`, \`GH_CLIENT_ID\`, \`CF_CLIENT_ID\`, \`CF_SCOPES\` and secrets \`TOKEN_ENCRYPTION_KEY\`, \`GH_CLIENT_SECRET\`, \`CF_CLIENT_SECRET\`.",
  "5. Authorize Cloudflare's **own** GitHub Pages integration separately; the product GitHub App cannot install it on another user's behalf.",
  "6. Review refresh-token expiry, disconnect/revocation, job durability, account isolation and retention before any public beta.",
  "7. Verify a real, authorized, independent customer login, approval, Pages deploy and the **exact** production GitHub commit before calling the site live.",
  "",
  "No API credentials, account IDs or customer website assets are included in this export.",
  ""
].join("\n");

const ci=[
  "name: Launch & Own product checks",
  "on:",
  "  push:",
  "  pull_request:",
  "jobs:",
  "  test:",
  "    runs-on: ubuntu-latest",
  "    steps:",
  "      - uses: actions/checkout@v4",
  "      - uses: actions/setup-node@v4",
  "        with:",
  "          node-version: '22'",
  "      - run: npm test",
  "      - run: node --check onboarding/worker.mjs",
  ""
].join("\n");

function write(target,relative,content) {
  const filename=join(target,relative);
  mkdirSync(dirname(filename),{recursive:true});
  writeFileSync(filename,content,"utf8");
}
export function exportLaunchAndOwn(destination,{sourceRoot=DEFAULT_ROOT}={}) {
  if(typeof destination!=="string"||!destination)throw Error("A destination directory is required");
  const root=resolve(sourceRoot),target=resolve(destination);
  if(target===root||target.startsWith(root+sep)||root.startsWith(target+sep))
    throw Error("Export must be outside the source repository, and cannot overwrite its ancestors");
  if(existsSync(target))throw Error("Destination already exists; refusing to overwrite");
  // Preflight the complete allowlist before writing a single output file.
  for(const relative of PRODUCT_SOURCE_FILES){
    if(relative.includes("..")||relative.startsWith("/")||!relative.includes("/"))throw Error("Unsafe source path");
    const path=join(root,relative);
    if(!lstatSync(path).isFile()||lstatSync(path).isSymbolicLink())throw Error("Unsafe source file: "+relative);
  }
  mkdirSync(target,{recursive:false});
  for(const relative of PRODUCT_SOURCE_FILES){
    const output=join(target,relative);
    mkdirSync(dirname(output),{recursive:true});
    copyFileSync(join(root,relative),output);
  }
  // No production/customer-owned database IDs in the portable product template.
  const configPath=join(target,"onboarding/wrangler.jsonc");
  const config=JSON.parse(readFileSync(configPath,"utf8"));
  config.name="launch-and-own-onboarding-beta";
  config.d1_databases[0].database_name="launch-and-own-onboarding-beta";
  config.d1_databases[0].database_id="REPLACE_WITH_INDEPENDENT_D1_UUID";
  write(configPath, "", JSON.stringify(config,null,2)+"\n");
  const validatorPath=join(target,"onboarding/validate-config.mjs");
  const originalValidator=readFileSync(validatorPath,"utf8");
  const validator=originalValidator
    .replaceAll("elite-site-onboarding-beta","launch-and-own-onboarding-beta")
    .replace("7eda172a-4537-4971-a3de-425241a8e549","00000000-0000-0000-0000-000000000000");
  if(validator===originalValidator)throw Error("Expected beta config validation symbols not found");
  writeFileSync(validatorPath,validator,"utf8");
  write(target,"README.md",readme);
  write(target,"onboarding/README.md",onboardingReadme);
  write(target,"AGENTS.md","# Launch & Own\n\nNever commit credentials or customer assets. Keep provider account and D1 resources isolated per customer. Require explicit launch approval, exact GitHub revision verification and passing tests. Do not claim a source-code beta is live until a real deployment is verified.\n");
  write(target,".gitignore",".env\n.env.*\n.dev.vars\n.dev.vars.*\n.wrangler/\nnode_modules/\ncoverage/\n");
  write(target,"package.json",JSON.stringify({
    name:"launch-and-own",version:"0.1.0-beta",private:true,type:"module",
    description:"Customer-owned conversational website launch and maintenance pipeline",
    engines:{node:">=22"},
    scripts:{test:"node --test pipeline/*.test.mjs onboarding/worker.test.mjs"}
  },null,2)+"\n");
  write(target,".github/workflows/test.yml",ci);
  const manifest={
    product:"Launch & Own",version:1,customerResourcesIncluded:false,
    sourceFiles:[...PRODUCT_SOURCE_FILES],
    setupRequired:["Create dedicated onboarding D1","Register GitHub App and Cloudflare OAuth client","Authorize hosting integration","Set secrets","Run independent customer acceptance test"],
    intentionallyExcluded:["public/","forms/","tests/site.test.mjs","pipeline/features.json","pipeline/smoke-staging.mjs","customer-owned Cloudflare resource IDs and credentials"]
  };
  write(target,"EXPORT-MANIFEST.json",JSON.stringify(manifest,null,2)+"\n");
  return {directory:target,files:PRODUCT_SOURCE_FILES.length+7,manifest};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const output=exportLaunchAndOwn(process.argv[2]);
    console.log("Product-only Launch & Own export ready:",output.directory);
  }catch(e){console.error("Export rejected:",e.message);process.exitCode=1}
}
