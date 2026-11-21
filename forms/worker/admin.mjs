const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"}});
const decode=part=>JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0))));
export async function verifyAccess(request,env){
 if(!env.CF_ACCESS_AUD||!env.CF_ACCESS_TEAM_DOMAIN||!env.ADMIN_EMAIL)return false;
 const token=request.headers.get("Cf-Access-Jwt-Assertion");if(!token)return false;
 const parts=token.split(".");if(parts.length!==3)return false;
 try{
  const header=decode(parts[0]),payload=decode(parts[1]);
  const issuer="https://"+env.CF_ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//,"").replace(/\/$/,"");
  if(header.alg!=="RS256"||typeof header.kid!=="string"||payload.iss!==issuer||!Array.isArray(payload.aud)||!payload.aud.includes(env.CF_ACCESS_AUD)||payload.email?.toLowerCase()!==env.ADMIN_EMAIL.toLowerCase())return false;
  const now=Math.floor(Date.now()/1000);if(!Number.isFinite(payload.exp)||payload.exp<=now||payload.nbf>now||payload.iat>now+60)return false;
  const response=await fetch(issuer+"/cdn-cgi/access/certs");if(!response.ok)return false;
  const jwks=await response.json();const jwk=jwks.keys?.find(k=>k.kid===header.kid&&k.kty==="RSA"&&k.use==="sig");if(!jwk)return false;
  const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
  const signature=Uint8Array.from(atob(parts[2].replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
  return await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,signature,new TextEncoder().encode(parts[0]+"."+parts[1]));
 }catch{return false}
}
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Staging submissions</title><style>body{font:16px system-ui;max-width:850px;margin:40px auto;padding:0 18px;background:#faf9f7;color:#202020}h1{font-size:28px}article{background:white;padding:18px;margin:16px 0;border:1px solid #ddd;border-radius:10px}p{white-space:pre-wrap;overflow-wrap:anywhere}small{color:#555}</style><h1>Brittney — Contact submissions</h1><p>Private staging inbox. Email notifications are disabled.</p><div id="items">Loading…</div><script>fetch("/admin/submissions",{credentials:"same-origin"}).then(r=>{if(!r.ok)throw Error("Access denied");return r.json()}).then(d=>{const root=document.querySelector("#items");root.replaceChildren();if(!d.submissions.length){root.textContent="No submissions yet";return}for(const s of d.submissions){const a=document.createElement("article");for(const [tag,value] of [["strong",s.name],["div",s.email],["small",s.created_at],["p",s.message]]){const el=document.createElement(tag);el.textContent=value;a.append(el)}root.append(a)}}).catch(()=>document.querySelector("#items").textContent="Unable to load submissions")</script></html>`;
export async function admin(request,env){
 if(!await verifyAccess(request,env))return json({error:"Forbidden"},403);
 const path=new URL(request.url).pathname;
 if(path==="/admin"&&request.method==="GET")return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-frame-options":"DENY","content-security-policy":"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'"}});
 if(path==="/admin/submissions"&&request.method==="GET"){
  if(!env.DB)return json({error:"Database unavailable"},503);
  const result=await env.DB.prepare("SELECT id, name, email, message, created_at, is_read FROM submissions ORDER BY created_at DESC LIMIT 100").all();
  return json({submissions:result.results||[]});
 }
 return json({error:"Not found"},404);
}
