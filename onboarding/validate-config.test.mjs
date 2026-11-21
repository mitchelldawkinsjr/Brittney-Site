import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateConfig,checkRemoteSchema} from "./validate-config.mjs";
const config=JSON.parse(readFileSync(new URL("./wrangler.jsonc",import.meta.url),"utf8"));
const id=config.d1_databases[0].database_id,accountId="0123456789abcdef0123456789abcdef";
const copy=()=>structuredClone(config);
test("isolated onboarding binding validates without exposing credentials",()=>{
 const result=validateConfig(config);
 assert.equal(result.status,"configuration-valid");
 assert.equal(result.databaseId,id);
 assert.notEqual(id,"7eda172a-4537-4971-a3de-425241a8e549");
});
test("rejects missing/placeholder and customer reference databases",()=>{
 for(const value of ["REPLACE_WITH_DEDICATED_ONBOARDING_DATABASE_UUID","7eda172a-4537-4971-a3de-425241a8e549","not-a-uuid"]){
  const changed=copy();changed.d1_databases[0].database_id=value;
  assert.throws(()=>validateConfig(changed),/Dedicated onboarding/);
 }
});
test("refuses unexpected resources or observability disabled",()=>{
 const c1=copy();c1.d1_databases.push({...c1.d1_databases[0],binding:"CUSTOMER_DB"});
 assert.throws(()=>validateConfig(c1),/exactly one/);
 const c2=copy();c2.observability.traces.enabled=false;
 assert.throws(()=>validateConfig(c2),/logs and traces/);
 const c3=copy();c3.ratelimits=[];
 assert.throws(()=>validateConfig(c3),/rate-limit/);
});
test("refuses accidental plaintext secret vars",()=>{
 const changed=copy();changed.vars={TOKEN_ENCRYPTION_KEY:"not-secret"};
 assert.throws(()=>validateConfig(changed),/credentials/);
});
test("remote verification uses read-only schema query and exact database",async()=>{
 let called=0;
 const fetchFn=async(url,opts)=>{
  called++;
  assert.equal(url,"https://api.cloudflare.com/client/v4/accounts/"+accountId+"/d1/database/"+id+"/query");
  assert.equal(opts.method,"POST");
  assert.equal(opts.headers.authorization,"Bearer private-token");
  assert.equal(opts.redirect,"error");
  const sql=JSON.parse(opts.body).sql;
  assert.match(sql,/^SELECT name FROM sqlite_master/);
  return Response.json({success:true,result:[{results:[
   {name:"onboarding_flows"},{name:"onboarding_sessions"},{name:"onboarding_launches"},
   {name:"idx_onboarding_flows_expires"},{name:"idx_onboarding_sessions_expires"},
   {name:"idx_onboarding_launches_session"}
  ]}]});
 };
 const result=await checkRemoteSchema({accountId,token:"private-token",databaseId:id,fetchFn});
 assert.equal(result.status,"schema-ready");assert.equal(called,1);
 assert.equal(JSON.stringify(result).includes("private-token"),false);
});
test("missing indexes fail readiness even when tables exist",async()=>{
 await assert.rejects(checkRemoteSchema({accountId,token:"private-token",databaseId:id,
  fetchFn:async()=>Response.json({success:true,result:[{results:[
   {name:"onboarding_flows"},{name:"onboarding_sessions"},{name:"onboarding_launches"}
  ]}]})}),/schema incomplete/);
});
test("remote preflight fails without scoped authorization and makes no request",async()=>{
 let called=0;
 await assert.rejects(checkRemoteSchema({accountId,token:"",databaseId:id,fetchFn:async()=>{called++}}),/API_TOKEN/);
 await assert.rejects(checkRemoteSchema({accountId,token:"token",databaseId:"7eda172a-4537-4971-a3de-425241a8e549",fetchFn:async()=>{called++}}),/Unsafe/);
 assert.equal(called,0);
});
test("remote 403 is a deployment blocker",async()=>{
 await assert.rejects(checkRemoteSchema({accountId,token:"token",databaseId:id,fetchFn:async()=>Response.json({success:false},{status:403})}),/denied/);
});
