const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});
const valid=x=>x&&typeof x.name==="string"&&x.name.trim().length>0&&x.name.length<=120&&typeof x.email==="string"&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email)&&x.email.length<=254&&typeof x.message==="string"&&x.message.trim().length>0&&x.message.length<=5000&&(!x.website);
async function captcha(token,secret,ip){if(!token||!secret)return false;const f=new FormData();f.set("secret",secret);f.set("response",token);if(ip)f.set("remoteip",ip);const r=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body:f});return r.ok&&(await r.json()).success===true;}
export default {async fetch(req,env){const url=new URL(req.url);if(url.pathname==="/api/health")return reply({ok:true,mode:"staging",database:!!env.DB,turnstile:!!env.TURNSTILE_SECRET});
if(url.pathname!=="/api/forms/contact"||req.method!=="POST")return reply({error:"Not found"},404);
if(!env.TURNSTILE_SECRET||!env.DB||!env.FORM_RATE_LIMITER)return reply({error:"Staging backend not configured"},503);
if(req.headers.get("origin")!==env.ALLOWED_ORIGIN)return reply({error:"Origin not allowed"},403);
if(!/^application\/json(?:;|$)/i.test(req.headers.get("content-type")||""))return reply({error:"JSON required"},415);
if(Number(req.headers.get("content-length")||0)>12000)return reply({error:"Payload too large"},413);
let body;try{const raw=await req.text();if(raw.length>12000)return reply({error:"Payload too large"},413);body=JSON.parse(raw);}catch{return reply({error:"Invalid JSON"},400);}
if(!valid(body))return reply({error:"Invalid fields"},400);
const ip=req.headers.get("CF-Connecting-IP")||"unknown";const rate=await env.FORM_RATE_LIMITER.limit({key:ip});if(!rate.success)return reply({error:"Too many submissions"},429);
if(!await captcha(body.turnstileToken,env.TURNSTILE_SECRET,req.headers.get("CF-Connecting-IP")))return reply({error:"Verification failed"},400);
const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO submissions(id,form_id,name,email,message) VALUES(?,?,?,?,?)").bind(id,"contact",body.name.trim(),body.email.trim(),body.message.trim()).run();
if(env.EMAIL_MODE==="owner_verified"&&env.EMAIL&&env.OWNER_EMAIL&&env.EMAIL_FROM){try{await env.EMAIL.send({from:env.EMAIL_FROM,to:env.OWNER_EMAIL,subject:"New Brittney site inquiry",text:"New inquiry from "+body.name+" ("+body.email+").\n\n"+body.message});}catch(e){console.error("Email notification failed",String(e));}}
return reply({ok:true,id},201);
}};