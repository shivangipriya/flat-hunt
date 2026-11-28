import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const URL=process.env.FH_URL||'http://localhost:8771';const N=+process.env.ROUNDS||20;
const server=spawn('python3',['-m','http.server','8771','--directory','dist'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,600));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox']});
let bad=0;
try{
// Regression: opening Edit moves focus to the name field after a tick. A fast entry in another
// field must not be pulled into the name field. Seen on the live site before this fix (2 of 30 rounds).
for(let i=0;i<N;i++){const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await ctx.newPage();await p.goto(URL);
await p.getByRole('button',{name:'Try an example'}).click();await p.getByRole('button',{name:'Clear example'}).click();await p.getByRole('button',{name:'+ Add a place'}).click();
await p.locator('#place-name').fill('Test flat');await p.locator('#field-rent').fill('20000');await p.locator('#field-maintenance').fill('1500');await p.getByRole('button',{name:'Add to shortlist'}).click();
await p.getByRole('button',{name:'Edit'}).click();await p.locator('#field-maintenance').fill('');await p.getByRole('button',{name:'Save changes'}).click();
await p.getByRole('button',{name:'Edit'}).click();await p.locator('#field-maintenance').fill('-3');
const name=await p.locator('#place-name').inputValue(),maint=await p.locator('#field-maintenance').inputValue();
if(name!=='Test flat'||maint!=='-3'){bad++;console.log('ROUND',i,'name',JSON.stringify(name),'maintenance',JSON.stringify(maint));await p.screenshot({path:`/tmp/focus-fail-${i}.png`});}
await p.getByRole('button',{name:'Save changes'}).click();
if(await p.locator('#err-maintenance').count()!==1){bad++;console.log('ROUND',i,'no validation message');}
await ctx.close();}
assert.equal(bad,0,'focus moved into the name field or validation message missing');
console.log('PASS',N,'rounds: fast entry stays in its own field, invalid maintenance shows a message');
console.log('FOCUS CHECKS',N);
}finally{await b.close();server.kill()}
