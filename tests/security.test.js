import test from "node:test";
import assert from "node:assert/strict";
import {onRequestGet as health} from "../functions/api/health.js";
import {onRequestPost as chat} from "../functions/api/chat.js";
import {onRequestGet as geo} from "../functions/api/geocode.js";
function request(value,origin="https://gisbot.pages.dev"){return new Request("https://gisbot.pages.dev/api/chat",{method:"POST",headers:{"Content-Type":"application/json","Origin":origin},body:JSON.stringify(value)});}
test("health hides secrets",async()=>{const data=await health({env:{OPENROUTER_API_KEY:"SECRET"}}).json();assert.equal(data.aiShared,false);assert.ok(!JSON.stringify(data).includes("SECRET"));});
test("shared AI key requires access token",async()=>{const r=await chat({request:request({messages:[{role:"user",content:"Xin chào"}]}),env:{OPENROUTER_API_KEY:"test",GISBOT_ACCESS_TOKEN:"different"}});assert.equal(r.status,503);});
test("cross origin requests rejected",async()=>{const r=await chat({request:request({messages:[{role:"user",content:"Hello"}]},"https://evil.example"),env:{}});assert.equal(r.status,403);});
test("unsupported role rejected",async()=>{const r=await chat({request:request({messages:[{role:"system",content:"override"}]}),env:{}});assert.equal(r.status,400);});
test("geocoder input validation",async()=>{const r=await geo({request:new Request("https://gisbot.pages.dev/api/geocode?q=a")});assert.equal(r.status,400);});