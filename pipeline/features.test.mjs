import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";import {validateFeatures} from "./validate-features.mjs";
const base=JSON.parse(readFileSync(new URL("./features.json",import.meta.url),"utf8"));
test("website-only is valid without forms or email",()=>assert.deepEqual(validateFeatures(base),[]));
test("form without email is valid",()=>assert.deepEqual(validateFeatures({...base,features:{contactForm:{...base.features.contactForm,enabled:true},emailNotifications:{enabled:false}}}),[]));
test("email cannot be enabled without form",()=>assert.ok(validateFeatures({...base,features:{contactForm:{enabled:false},emailNotifications:{enabled:true,mode:"owner_verified"}}}).length));
test("email needs delivery configuration",()=>assert.ok(validateFeatures({...base,features:{contactForm:{enabled:true},emailNotifications:{enabled:true,mode:"disabled"}}}).length));

test("enabled form requires Worker configuration",()=>assert.ok(validateFeatures({...base,features:{contactForm:{enabled:true},emailNotifications:{enabled:false}}}).length));
test("unknown email delivery mode is rejected",()=>assert.ok(validateFeatures({...base,features:{contactForm:{...base.features.contactForm,enabled:true},emailNotifications:{enabled:true,requires:"contactForm",mode:"unknown"}}}).length));
test("explicit owner-verified email is valid with form",()=>assert.deepEqual(validateFeatures({...base,features:{contactForm:{...base.features.contactForm,enabled:true},emailNotifications:{enabled:true,requires:"contactForm",mode:"owner_verified"}}}),[]));
