import test from "node:test";import assert from "node:assert/strict";import worker from "../worker/index.mjs";
const origin="https://elite-pipeline-brittney-michelle-test.pages.dev";
const env={DB:{},TURNSTILE_SECRET:"secret",FORM_RATE_LIMITER:{limit:async()=>({success:true})},ALLOWED_ORIGIN:origin};
const call=(path,options={},e=env)=>worker.fetch(new Request("https://staging.example"+path,options),e);
test("health reports bindings",async()=>{const r=await call("/api/health");assert.equal(r.status,200);assert.equal((await r.json()).mode,"staging");assert.equal("database" in (await (await call("/api/health")).json()),false)});
test("unknown routes are 404",async()=>assert.equal((await call("/admin")).status,404));
test("rejects missing security binding",async()=>{const r=await call("/api/forms/contact",{method:"POST"},{});assert.equal(r.status,503)});
test("rejects other origins",async()=>{const r=await call("/api/forms/contact",{method:"POST",headers:{origin:"https://evil.example"}});assert.equal(r.status,403)});
test("rejects invalid fields",async()=>{const r=await call("/api/forms/contact",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify({name:"",email:"no",message:""})});assert.equal(r.status,400)});
test("enforces rate limits before captcha",async()=>{const e={...env,FORM_RATE_LIMITER:{limit:async()=>({success:false})}};const r=await call("/api/forms/contact",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify({name:"Test",email:"test@example.com",message:"Hello"})},e);assert.equal(r.status,429)});

test("approved-origin CORS preflight succeeds",async()=>{const r=await call("/api/forms/contact",{method:"OPTIONS",headers:{origin,"access-control-request-method":"POST"}});assert.equal(r.status,204);assert.equal(r.headers.get("access-control-allow-origin"),origin)});
test("foreign-origin preflight is rejected",async()=>{const r=await call("/api/forms/contact",{method:"OPTIONS",headers:{origin:"https://evil.example"}});assert.equal(r.status,403)});

test("health only accepts GET",async()=>{const r=await call("/api/health",{method:"POST"});assert.equal(r.status,404)});

test("verified submission stores D1 row but sends no email by default",async()=>{
 const originalFetch=globalThis.fetch;const inserted=[];const emails=[];
 globalThis.fetch=async()=>new Response(JSON.stringify({success:true,action:"contact",hostname:"elite-pipeline-brittney-michelle-test.pages.dev"}),{status:200});
 try{
 const e={...env,EMAIL_MODE:"disabled",EMAIL:{send:async m=>emails.push(m)},DB:{prepare:()=>({bind:(...args)=>({run:async()=>inserted.push(args)})})}};
 const r=await call("/api/forms/contact",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify({name:"Test User",email:"test@example.com",message:"Test inquiry",turnstileToken:"test-token"})},e);
 assert.equal(r.status,201);assert.equal(inserted.length,1);assert.equal(emails.length,0);
 }finally{globalThis.fetch=originalFetch}
});
test("valid token for wrong hostname cannot store or email",async()=>{
 const originalFetch=globalThis.fetch;let writes=0;
 globalThis.fetch=async()=>new Response(JSON.stringify({success:true,action:"contact",hostname:"attacker.example"}),{status:200});
 try{const e={...env,DB:{prepare:()=>{writes++;throw Error("should not write")}}};const r=await call("/api/forms/contact",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify({name:"Test User",email:"test@example.com",message:"Test inquiry",turnstileToken:"test-token"})},e);assert.equal(r.status,400);assert.equal(writes,0)}finally{globalThis.fetch=originalFetch}
});
