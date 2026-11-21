#!/usr/bin/env node
// Read-only smoke checks: never submit a form or read private customer data.
const pages=process.env.PAGES_URL||"https://elite-pipeline-brittney-michelle-test.pages.dev";
const worker=process.env.FORMS_WORKER_URL||"https://esp-brittney-forms-staging.mitchell-dawkinsjr.workers.dev";
const request=async(url,init={})=>{
 const response=await fetch(url,{...init,signal:AbortSignal.timeout(15000),redirect:"manual"});
 return response;
};
const checks=[
 ["Pages homepage",async()=>{const r=await request(pages+"/");if(r.status!==200)throw Error("HTTP "+r.status)}],
 ["Turnstile staging page",async()=>{const r=await request(pages+"/forms-test.html");if(r.status!==200)throw Error("HTTP "+r.status);const text=await r.text();if(!text.includes("cf-turnstile")||!text.includes("data-action=\"contact\""))throw Error("Form widget missing")}],
 ["Worker health",async()=>{const r=await request(worker+"/api/health");if(r.status!==200||!(await r.json()).ok)throw Error("Worker unhealthy: "+r.status)}],
 ["Dashboard requires authentication",async()=>{const r=await request(worker+"/admin");if(![302,303,307,308,401,403].includes(r.status))throw Error("Expected Access redirect/denial, got "+r.status)}],
 ["Submissions API requires authentication",async()=>{const r=await request(worker+"/admin/submissions");if(![302,303,307,308,401,403].includes(r.status))throw Error("Expected Access redirect/denial, got "+r.status)}],
 ["Untrusted form origin rejected",async()=>{const r=await request(worker+"/api/forms/contact",{method:"POST",headers:{"origin":"https://not-allowed.example","content-type":"application/json"},body:"{}"});if(r.status!==403)throw Error("Expected 403, got "+r.status)}],
];
let failed=0;for(const [name,run] of checks){try{await run();console.log("PASS "+name)}catch(error){failed++;console.error("FAIL "+name+": "+error.message)}}if(failed)process.exitCode=1;
