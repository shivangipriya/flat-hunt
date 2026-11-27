import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn('python3',['-m','http.server','8771','--directory','dist'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,600));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},permissions:['clipboard-read','clipboard-write']});const p=await ctx.newPage();
const has=async(loc,s)=>{for(let i=0;i<50;i++){try{if((await loc.innerText()).includes(s))return true;}catch{}await p.waitForTimeout(100)}return false};
let n=0;const ok=(v,m)=>{assert.ok(v,m);console.log('PASS',++n,m)};
try{
await p.goto('http://localhost:8771');
// PG end to end: add, compare with a flat, visit checks, share text, edit, reload
await p.getByRole('button',{name:'+ Add a place'}).first().click();
await p.getByRole('radio',{name:'PG'}).click();
ok(await p.locator('#pg-sharing').isVisible()&&await p.locator('#pg-rules').isVisible(),'PG form shows sharing, services and rules');
await p.locator('#place-name').fill('Sunrise PG');await p.locator('#field-rent').fill('7500');await p.locator('#field-maintenance').fill('0');await p.locator('#field-deposit').fill('1');
await p.locator('#pg-sharing').selectOption('triple');await p.locator('#pg-meals').selectOption('included');await p.locator('#pg-electricity').selectOption('extra');
await p.locator('#pg-rules').fill('Gate closes 10 pm. No overnight guests.');
await p.getByRole('button',{name:'Add to shortlist'}).click();await p.waitForTimeout(300);
const pgc=p.locator('.fh-place').first();
for(const s of ['PLACE 01 · PG','3 sharing','Included','Costs extra','Gate closes 10 pm','Rent + extra charges','₹7,500','₹15,000','Brokerage not added, so not counted'])ok(await has(pgc,s),'PG card shows: '+s);
ok(!(await pgc.innerText()).includes('Laundry'),'laundry not asked stays absent (not shown as no or zero)');
// a flat next to it
await p.getByRole('button',{name:'+ Add a place'}).first().click();
await p.locator('#place-name').fill('Vijay Nagar 1BHK');await p.locator('#field-rent').fill('14000');await p.locator('#field-deposit').fill('2');await p.locator('#field-brokerage').fill('1');await p.locator('#field-maintenance').fill('1200');
await p.getByRole('button',{name:'Add to shortlist'}).click();await p.waitForTimeout(300);
ok(await p.locator('.fh-place').count()===2,'PG and flat sit side by side');
ok(await has(p.locator('.fh-place').nth(1),'₹15,200')&&await has(p.locator('.fh-place').nth(1),'Rent + maintenance'),'flat card still shows maintenance total');
await p.getByRole('tab',{name:'On the visit'}).click();
await p.locator('#visit-place').selectOption({label:'Sunrise PG'});
const pgvt=await p.locator('.fh-check-grid').innerText();
ok(await p.locator('.fh-check input').count()===20&&await p.locator('.fh-check-section').count()===5,'PG visit list: 20 checks in 5 groups');
for(const s of ['Room & bed','Food & kitchen','Curfew, visitor and overnight guest rules','taste a meal','Wi-Fi works in your room'])ok(pgvt.includes(s),'PG visit list has: '+s);
ok(!pgvt.includes('Turn on taps')&&!pgvt.includes('gas pipeline'),'PG list has no flat-only items');
await p.getByLabel(/Curfew, visitor and overnight guest rules/).check();await p.getByLabel(/taste a meal/).check();
await p.locator('#visit-place').selectOption({label:'Vijay Nagar 1BHK'});
ok((await p.locator('.fh-check-grid').innerText()).includes('Turn on taps')&&await p.locator('.fh-check input:checked').count()===0,'flat keeps its own list and its own ticks');
await p.getByRole('tab',{name:'Shortlist'}).click();
ok(await has(p.locator('.fh-place').first(),'2 / 20'),'PG card shows 2 / 20');
await p.getByRole('button',{name:'Copy my list as text'}).click();await p.waitForTimeout(300);
const hum=await p.evaluate(()=>navigator.clipboard.readText());
for(const s of ['1. Sunrise PG - PG, 3 sharing, meals included, electricity costs extra, rent Rs.7500, extra charges Rs.0, monthly total Rs.7500','cash to move in Rs.15,000 (first month + deposit; brokerage not added, so not counted','house rules: Gate closes 10 pm. No overnight guests.','checked on the visit: kitchen and a meal, curfew and visitor rules (2 of 20). The rest are not checked yet, which is not the same as a problem.','2. Vijay Nagar 1BHK - rent Rs.14000, maintenance Rs.1200, monthly total Rs.15200','cash to move in Rs.56,000 (first month + deposit + brokerage; excludes maintenance and moving costs)'])ok(hum.includes(s),'shared text has: '+s.slice(0,70));
ok(!/eyJ[A-Za-z0-9+\/=]{20,}/.test(hum)&&!hum.includes('laundry')&&!/fail/i.test(hum),'shared text: no code, no unasked laundry, no failure wording');
await p.evaluate(()=>{Object.defineProperty(navigator,'share',{value:undefined,configurable:true})});
await p.getByRole('button',{name:'Share Sunrise PG'}).click();await p.waitForTimeout(300);
const pgone=await p.evaluate(()=>navigator.clipboard.readText());
ok(pgone.startsWith('PG hunt: Sunrise PG')&&pgone.includes('house rules:')&&pgone.includes('checked on the visit:')&&!pgone.includes('Vijay'),'single PG share text is self-contained');
// edit keeps everything
await p.getByRole('button',{name:'Edit'}).first().click();
ok(await p.getByRole('radio',{name:'PG'}).getAttribute('aria-checked')==='true'&&await p.locator('#pg-sharing').inputValue()==='triple'&&await p.locator('#pg-rules').inputValue()==='Gate closes 10 pm. No overnight guests.','edit form restores PG type, sharing and rules');
await p.locator('#pg-laundry').selectOption('no');await p.getByRole('button',{name:'Save changes'}).click();await p.waitForTimeout(300);
ok(await has(p.locator('.fh-place').first(),'Not available')&&await has(p.locator('.fh-place').first(),'2 / 20'),'edit adds laundry and keeps both ticks');
await p.getByRole('button',{name:'Save in this browser'}).click();await p.waitForTimeout(300);await p.reload();await p.waitForTimeout(500);
ok(await has(p.locator('.fh-place').first(),'PLACE 01 · PG')&&await has(p.locator('.fh-place').first(),'2 / 20'),'PG and ticks survive a reload');
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'no horizontal overflow at 390px with PG and flat');
await p.screenshot({path:'/tmp/pg-cards.png',fullPage:true});
console.log('PG CHECKS',n);
}finally{await b.close();server.kill();}
