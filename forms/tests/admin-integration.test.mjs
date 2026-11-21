import test from "node:test";
import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";
import {admin} from "../worker/admin.mjs";
const crypto=webcrypto;
const b64=x=>Buffer.from(x).toString("base64url");
const json=x=>b64(JSON.stringify(x));
test("signed owner JWT can read dashboard and D1 rows; impostors cannot",async()=>{
 const keys=await crypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["sign","verify"]);
 const publicKey=await crypto.subtle.exportKey("jwk",keys.publicKey);
 let reads=0;
 const env={CF_ACCESS_AUD:"test-aud",CF_ACCESS_TEAM_DOMAIN:"test.cloudflareaccess.com",ADMIN_EMAIL:"owner@example.com",DB:{prepare(sql){assert.match(sql,/SELECT/);return {all:async()=>{reads++;return {results:[{id:"test",name:"Test",email:"test@example.com",message:"Test inquiry",created_at:"2026-11-21",is_read:0}]}}}}}};
 const original=globalThis.fetch;
 globalThis.fetch=async url=>{assert.equal(url,"https://test.cloudflareaccess.com/cdn-cgi/access/certs");return new Response(JSON.stringify({keys:[{...publicKey,kid:"test-key",use:"sig"}]}),{status:200})};
 const sign=async payload=>{const header=json({alg:"RS256",kid:"test-key"}),body=json(payload);const signature=await crypto.subtle.sign("RSASSA-PKCS1-v1_5",keys.privateKey,new TextEncoder().encode(header+"."+body));return header+"."+body+"."+b64(Buffer.from(signature))};
 const base={iss:"https://test.cloudflareaccess.com",aud:["test-aud"],email:"owner@example.com",exp:Math.floor(Date.now()/1000)+300};
 const request=(path,token)=>new Request("https://test.example"+path,{headers:{"Cf-Access-Jwt-Assertion":token}});
 try{
  const good=await sign(base);
  const page=await admin(request("/admin",good),env);
  assert.equal(page.status,200);
  const response=await admin(request("/admin/submissions",good),env);
  assert.equal(response.status,200);
  assert.equal((await response.json()).submissions[0].id,"test");
  assert.equal(reads,1);
  const wrongEmail=await sign({...base,email:"attacker@example.com"});
  assert.equal((await admin(request("/admin/submissions",wrongEmail),env)).status,403);
  const expired=await sign({...base,exp:1});
  assert.equal((await admin(request("/admin/submissions",expired),env)).status,403);
  const wrongAud=await sign({...base,aud:["different"]});
  assert.equal((await admin(request("/admin/submissions",wrongAud),env)).status,403);
  const tampered=good.slice(0,-3)+"abc";
  assert.equal((await admin(request("/admin/submissions",tampered),env)).status,403);
  assert.equal(reads,1);
 }finally{globalThis.fetch=original}
});
