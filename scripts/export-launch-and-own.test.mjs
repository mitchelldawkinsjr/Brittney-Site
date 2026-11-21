import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync,mkdtempSync,rmSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {spawnSync} from "node:child_process";
import {exportLaunchAndOwn,PRODUCT_SOURCE_FILES} from "./export-launch-and-own.mjs";

function tempScope(fn){
 const parent=mkdtempSync(join(tmpdir(),"launch-and-own-"));
 try{return fn(join(parent,"product"))}finally{rmSync(parent,{recursive:true,force:true})}
}
test("export creates a standalone source-code product without customer site or forms",()=>{
 tempScope(dest=>{
  const result=exportLaunchAndOwn(dest);
  assert.equal(result.manifest.customerResourcesIncluded,false);
  assert.equal(result.manifest.product,"Launch & Own");
  assert(result.files>=20);
  for(const rel of PRODUCT_SOURCE_FILES)assert.equal(existsSync(join(dest,rel)),true,rel);
  for(const rel of ["public/index.html","forms/worker/index.mjs","pipeline/smoke-staging.mjs","pipeline/features.json","tests/site.test.mjs"])
   assert.equal(existsSync(join(dest,rel)),false,rel+" must not be exported");
  const readme=readFileSync(join(dest,"README.md"),"utf8");
  assert.match(readme,/Launch & Own/);
  assert.match(readme,/Describe it\. Launch it\. Own it\./);
  const pkg=JSON.parse(readFileSync(join(dest,"package.json"),"utf8"));
  assert.equal(pkg.name,"launch-and-own");assert.equal(pkg.private,true);
 });
});
test("export neutralizes the original owner's Cloudflare D1 binding",()=>{
 tempScope(dest=>{
  exportLaunchAndOwn(dest);
  const config=JSON.parse(readFileSync(join(dest,"onboarding/wrangler.jsonc"),"utf8"));
  assert.equal(config.name,"launch-and-own-onboarding-beta");
  assert.equal(config.d1_databases[0].database_name,"launch-and-own-onboarding-beta");
  assert.equal(config.d1_databases[0].database_id,"REPLACE_WITH_INDEPENDENT_D1_UUID");
  const validator=readFileSync(join(dest,"onboarding/validate-config.mjs"),"utf8");
  assert.match(validator,/launch-and-own-onboarding-beta/);
  for(const relative of PRODUCT_SOURCE_FILES){
   const content=readFileSync(join(dest,relative),"utf8");
   assert(!content.includes("c21295f8-2593-4317-abad-1d1221c0656b"),"Original onboarding D1 leaked in "+relative);
   assert(!content.includes("7eda172a-4537-4971-a3de-425241a8e549"),"Original reference form D1 leaked in "+relative);
  }
 });
});
test("does not overwrite an existing export or source repository",()=>{
 tempScope(dest=>{
  exportLaunchAndOwn(dest);
  writeFileSync(join(dest,"README.md"),"CUSTOM","utf8");
  assert.throws(()=>exportLaunchAndOwn(dest),/already exists/);
  assert.equal(readFileSync(join(dest,"README.md"),"utf8"),"CUSTOM");
 });
 assert.throws(()=>exportLaunchAndOwn(new URL("../",import.meta.url).pathname),/outside the source/);
});
test("exported product's source and OAuth integration tests pass independently",()=>{
 tempScope(dest=>{
  exportLaunchAndOwn(dest);
  const suite=[
   ...PRODUCT_SOURCE_FILES.filter(x=>x.startsWith("pipeline/")&&x.endsWith(".test.mjs")),
   "onboarding/worker.test.mjs"
  ];
  const run=spawnSync(process.execPath,["--test",...suite],{cwd:dest,encoding:"utf8",timeout:90000});
  assert.equal(run.status,0,run.stdout+"\n"+run.stderr);
 });
});
test("sanitized template refuses to deploy before customer-specific D1 configuration",()=>{
 tempScope(dest=>{
  exportLaunchAndOwn(dest);
  const run=spawnSync(process.execPath,["onboarding/validate-config.mjs"],{cwd:dest,encoding:"utf8",timeout:10000});
  assert.notEqual(run.status,0);
  assert.match(run.stderr,/Dedicated onboarding D1 UUID is missing/);
 });
});
