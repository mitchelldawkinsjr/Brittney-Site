import test from "node:test";import assert from "node:assert/strict";import {admin,verifyAccess} from "../worker/admin.mjs";
const req=(path,headers={})=>new Request("https://staging.example"+path,{headers});
const env={CF_ACCESS_AUD:"aud",CF_ACCESS_TEAM_DOMAIN:"team.cloudflareaccess.com",ADMIN_EMAIL:"owner@example.com",DB:{prepare:()=>{throw Error("DB must not be queried")}}};
test("missing JWT is rejected",async()=>assert.equal(await verifyAccess(req("/admin"),env),false));
test("dashboard denies unauthenticated users",async()=>assert.equal((await admin(req("/admin"),env)).status,403));
test("submissions API denies unauthenticated users without touching DB",async()=>assert.equal((await admin(req("/admin/submissions"),env)).status,403));
test("missing Access config fails closed",async()=>assert.equal((await admin(req("/admin"),{})).status,403));
test("malformed JWT is rejected",async()=>assert.equal((await admin(req("/admin",{"Cf-Access-Jwt-Assertion":"invalid.token.parts"}),env)).status,403));
