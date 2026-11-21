#!/usr/bin/env node
// One-time setup for an opted-in contact form. Requires a scoped Cloudflare API token.
// Never prints or writes a Turnstile secret.
import {readFileSync,writeFileSync} from "node:fs";
const env=process.env;
const account=env.CLOUDFLARE_ACCOUNT_ID;
const worker=env.FORMS_WORKER_NAME;
const hostname=env.FORMS_HOSTNAME;
const token=env.CLOUDFLARE_API_TOKEN;
if(!account||!worker||!hostname||!token)throw Error("Cloudflare account, worker, hostname, and token are required");
const api=async(path,method="GET",body)=>{
 const response=await fetch("https://api.cloudflare.com/client/v4"+path,{method,headers:{Authorization:"Bearer "+token,...(body?{"Content-Type":"application/json"}:{})},body:body?JSON.stringify(body):undefined});
 const data=await response.json();
 if(!response.ok||!data.success)throw Error("Cloudflare API operation failed: "+method+" "+path+" ("+response.status+")");
 return data.result;
};
const base="/accounts/"+encodeURIComponent(account);
const widgets=await api(base+"/challenges/widgets");
let widget=widgets.find(x=>x.name===env.FORMS_WIDGET_NAME&&x.domains?.includes(hostname));
let secret;
if(!widget){
 const created=await api(base+"/challenges/widgets","POST",{name:env.FORMS_WIDGET_NAME||"Launch & Own — "+hostname,domains:[hostname],mode:"managed"});
 widget=created;secret=created.secret;
 console.log("Created Turnstile widget");
}else if(env.ROTATE_TURNSTILE_SECRET==="true"){
 const rotated=await api(base+"/challenges/widgets/"+encodeURIComponent(widget.sitekey)+"/rotate_secret","POST",{invalidate_immediately:true});
 secret=rotated.secret;
 console.log("Rotated existing Turnstile secret");
}
if(secret){
 await api(base+"/workers/scripts/"+encodeURIComponent(worker)+"/secrets","PUT",{name:"TURNSTILE_SECRET",type:"secret_text",text:secret});
 console.log("Installed Worker secret");
}else console.log("Existing widget reused; Worker secret unchanged");
const path=env.FORMS_SITEKEY_FILE;
if(path){
 const original=readFileSync(path,"utf8");
 const next=original.replace(/0x4[A-Za-z0-9_-]{15,}/g,widget.sitekey);
 if(next===original&&!original.includes(widget.sitekey))throw Error("No Turnstile sitekey found in target file");
 if(next!==original)writeFileSync(path,next);
 console.log("Updated public sitekey in "+path);
}
console.log("Turnstile configured for "+hostname+" (public sitekey: "+widget.sitekey+")");
