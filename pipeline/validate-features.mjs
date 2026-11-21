import {readFileSync} from "node:fs";
export function validateFeatures(config){
 const errors=[];
 if(config?.schemaVersion!==1)errors.push("Unsupported feature manifest schema");
 if(config?.site?.provider!=="cloudflare-pages")errors.push("Expected Cloudflare Pages provider");
 const form=config?.features?.contactForm;
 const email=config?.features?.emailNotifications;
 if(typeof form?.enabled!=="boolean"||typeof email?.enabled!=="boolean")errors.push("Feature enabled values must be boolean");
 if(email?.enabled&&!form?.enabled)errors.push("Email notifications require a contact form");
 if(email?.enabled&&email?.mode==="disabled")errors.push("Email notifications require an explicit delivery mode");
 return errors;
}
if(process.argv[1]&&import.meta.url===new URL("file://"+process.argv[1]).href){
 const path=process.argv[2]||"pipeline/features.json";
 const errors=validateFeatures(JSON.parse(readFileSync(path,"utf8")));
 if(errors.length){console.error(errors.join("\n"));process.exitCode=1}else console.log("Feature configuration valid");
}
