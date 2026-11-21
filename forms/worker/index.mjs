import {admin} from "./admin.mjs";
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const cors=(origin,allowed)=>origin===allowed?{"access-control-allow-origin":allowed,"access-control-allow-methods":"POST, OPTIONS","access-control-allow-headers":"Content-Type","vary":"Origin"}:{};
const valid=x=>x&&typeof x.name==="string"&&x.name.trim().length>0&&x.name.length<=120&&typeof x.email==="string"&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email)&&x.email.length<=254&&typeof x.message==="string"&&x.message.trim().length>0&&x.message.length<=5000&&(!x.website);
async function captcha(token,secret,ip){if(typeof token!=="string"||!token||token.length>2048||!secret)return false;const f=new FormData();f.set("secret",secret);f.set("response",token);if(ip)f.set("remoteip",ip);const r=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:f});if(!r.ok)return false;const result=await r.json();return result.success===true&&result.action==="contact"&&result.hostname==="elite-pipeline-brittney-michelle-test.pages.dev";}
export default {async fetch(req,env){const url=new URL(req.url);if(url.pathname==="/admin"||url.pathname.startsWith("/admin/"))return admin(req,env);if(url.pathname==="/api/health"&&req.method==="GET")return reply({ok:true,mode:"staging"});
if(url.pathname==="/api/forms/contact"&&req.method==="OPTIONS"){if(req.headers.get("origin")!==env.ALLOWED_ORIGIN)return reply({error:"Origin not allowed"},403);return new Response(null,{status:204,headers:cors(req.headers.get("origin"),env.ALLOWED_ORIGIN)});}
if(url.pathname!=="/api/forms/contact"||req.method!=="POST")return reply({error:"Not found"},404);
return handleContact(req,env);
}};
async function handleContact(req,env){const origin=req.headers.get("origin");const allowed=origin===env.ALLOWED_ORIGIN;const response=await processContact(req,env);if(!allowed)return response;const headers=new Headers(response.headers);for(const [k,v] of Object.entries(cors(origin,env.ALLOWED_ORIGIN)))headers.set(k,v);return new Response(response.body,{status:response.status,headers});}
async function processContact(req,env){
if(!env.TURNSTILE_SECRET||!env.DB||!env.FORM_RATE_LIMITER)return reply({error:"Staging backend not configured"},503);
if(req.headers.get("origin")!==env.ALLOWED_ORIGIN)return reply({error:"Origin not allowed"},403);
if(!/^application\/json(?:;|$)/i.test(req.headers.get("content-type")||""))return reply({error:"JSON required"},415);
if(Number(req.headers.get("content-length")||0)>12000)return reply({error:"Payload too large"},413);
let body;try{const raw=await req.text();if(raw.length>12000)return reply({error:"Payload too large"},413);body=JSON.parse(raw);}catch{return reply({error:"Invalid JSON"},400);}
if(!valid(body))return reply({error:"Invalid fields"},400);
const ip=req.headers.get("CF-Connecting-IP")||"unknown";const rate=await env.FORM_RATE_LIMITER.limit({key:ip});if(!rate.success)return reply({error:"Too many submissions"},429);
let verified=false;try{verified=await captcha(body.turnstileToken,env.TURNSTILE_SECRET,req.headers.get("CF-Connecting-IP"));}catch(e){console.error("Turnstile unavailable",String(e));return reply({error:"Verification unavailable"},503);}if(!verified)return reply({error:"Verification failed"},400);
const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO submissions(id,form_id,name,email,message) VALUES(?,?,?,?,?)").bind(id,"contact",body.name.trim(),body.email.trim(),body.message.trim()).run();
if(env.EMAIL_MODE==="owner_verified"&&env.EMAIL&&env.OWNER_EMAIL&&env.EMAIL_FROM){try{await env.EMAIL.send({from:env.EMAIL_FROM,to:env.OWNER_EMAIL,subject:"New Brittney site inquiry",text:"New inquiry from "+body.name+" ("+body.email+").\n\n"+body.message});}catch(e){console.error("Email notification failed",String(e));}}
return reply({ok:true,id},201);
}