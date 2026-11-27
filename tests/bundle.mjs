import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn('python3',['-m','http.server','8771','--directory','dist'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,600));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},permissions:['clipboard-read','clipboard-write']});const p=await ctx.newPage();
let n=0;const ok=(v,m)=>{assert.ok(v,m);console.log('PASS',++n,m)};
try{
await p.goto('http://localhost:8771');
await p.getByRole('button',{name:'Try an example'}).click();
const cards=p.locator('.fh-place');
ok(await cards.count()===2,'example loads two places');
const t0=await cards.nth(0).innerText(),t1=await cards.nth(1).innerText();
ok(/MONTHLY COST/i.test(t0)&&t0.includes('₹25,000')&&t0.includes('Rent + maintenance'),'place with maintenance shows rent + maintenance total');
ok(t1.includes('Add maintenance to see it')&&t1.includes('not counted as 0'),'blank maintenance is shown as unknown, never 0');
ok(!/Monthly cost\s*₹19,000/i.test(t1),'no total shown for the place without maintenance');
// comparison copy sits above the cards
const copyBtn=p.getByRole('button',{name:'Copy comparison'});
ok(await copyBtn.count()===1,'one Copy comparison button');
const y1=(await copyBtn.boundingBox()).y,y2=(await cards.nth(0).boundingBox()).y;ok(y1<y2,'Copy comparison is above the place cards');
await copyBtn.click();await p.waitForTimeout(300);
ok(await p.locator('.fh-toolbar .fh-copied').innerText()==='Copied','Copied appears next to the comparison button');
const clip=await p.evaluate(()=>navigator.clipboard.readText());
ok(clip.startsWith('Flat hunt comparison:')&&clip.includes('maintenance Rs.2000, monthly total Rs.25000'),'comparison text includes maintenance only for the place that has it');
ok(!/HSR Layout[^\n]*maintenance/.test(clip),'no maintenance text for the place without it');
await p.waitForTimeout(3300);ok(await p.locator('.fh-toolbar .fh-copied').count()===0,'Copied clears itself');
// per-flat share: clipboard fallback
await p.evaluate(()=>{Object.defineProperty(navigator,'share',{value:undefined,configurable:true});});
await p.getByRole('button',{name:'Share Indiranagar · 1BHK'}).click();await p.waitForTimeout(300);
ok(await cards.nth(0).locator('.fh-copied').innerText()==='Copied','Share falls back to copy, Copied shown beside that card button');
ok(await cards.nth(1).locator('.fh-copied').count()===0,'other card shows no Copied');
const one=await p.evaluate(()=>navigator.clipboard.readText());
ok(one.startsWith('Flat hunt: Indiranagar')&&one.includes('cash to move in Rs.1,15,000')&&!one.includes('HSR'),'per-flat text is only that flat, with move-in cash');
// per-flat share: native share
await p.evaluate(()=>{window.__s=null;Object.defineProperty(navigator,'share',{value:async d=>{window.__s=d},configurable:true});});
await p.getByRole('button',{name:'Share HSR Layout · 1BHK'}).click();await p.waitForTimeout(200);
const sd=await p.evaluate(()=>window.__s);ok(sd&&sd.title==='HSR Layout · 1BHK'&&sd.text.startsWith('Flat hunt: HSR'),'native share receives title and text');
ok(await cards.nth(1).locator('.fh-copied').count()===0,'no Copied after a native share');
// cancelled share: silent
await p.waitForTimeout(3300);
await p.evaluate(()=>{Object.defineProperty(navigator,'share',{value:async()=>{const e=new Error('x');e.name='AbortError';throw e},configurable:true});});
await p.getByRole('button',{name:'Share HSR Layout · 1BHK'}).click();await p.waitForTimeout(300);
ok(!(await p.evaluate(()=>document.querySelector('.fh-app [aria-live=polite]').innerText)).includes('Copy did not work')&&await p.locator('.fh-copied').count()===0&&(await p.evaluate(()=>navigator.clipboard.readText()))===one,'cancelled share shows no error, no Copied, and does not copy');
// add a place with maintenance, edit it, blank stays blank
await p.getByRole('button',{name:'Clear example'}).click();
await p.getByRole('button',{name:'+ Add a place'}).click();
await p.locator('#place-name').fill('Test flat');await p.locator('#field-rent').fill('20000');await p.locator('#field-maintenance').fill('1500');await p.getByRole('button',{name:'Add to shortlist'}).click();
ok((await cards.nth(0).innerText()).includes('₹21,500'),'new place total = rent + maintenance');
await p.getByRole('button',{name:'Edit'}).click();ok(await p.locator('#field-maintenance').inputValue()==='1500','edit form shows saved maintenance');
await p.locator('#field-maintenance').fill('');await p.getByRole('button',{name:'Save changes'}).click();
ok((await cards.nth(0).innerText()).includes('Add maintenance to see it'),'clearing maintenance returns to unknown, not 0');
await p.getByRole('button',{name:'Edit'}).click();await p.locator('#field-maintenance').fill('-3');await p.getByRole('button',{name:'Save changes'}).click();
ok(await p.locator('#err-maintenance').count()===1,'invalid maintenance is rejected with a message');
await p.getByRole('button',{name:'Cancel'}).click();
ok(await p.getByRole('button',{name:'Copy comparison'}).count()===0,'no comparison button with a single place');
// checklist content
await p.getByRole('tab',{name:'On the visit'}).click();
ok(await p.locator('.fh-check input').count()===20,'still exactly 20 visit checks');
const vt=await p.locator('.fh-check-grid').innerText();
for(const s of ['Bathroom: flush, drainage and geyser','Electricals: switches, sockets','broadband providers','Door and window locks','Flood/waterlogging','what is included (fans, geyser, furniture)'])ok(vt.includes(s),'visit list has: '+s);
ok(await p.locator('.fh-check-section').count()===5,'still five groups');
ok(!/Nearest grocery|Notice period on both sides, and who repaints|Deposit refund terms in writing/.test(vt),'removed items are gone from the visit list');
await p.getByRole('tab',{name:'Before you pay'}).click();
const pt=await p.locator('#panel-pay').innerText();
for(const s of ['proof that they own the flat','written authorisation','police or tenant verification','written receipt','On move-in day','Photograph every existing scratch'])ok(pt.includes(s),'pay tab has: '+s);
ok(!/registered|stamp|11 month/i.test(pt),'no unverified legal duration or registration claims');
const qs=await p.locator('#panel-pay .fh-questions').nth(0).locator('>div').count(),mv=await p.locator('#panel-pay .fh-questions').nth(1).locator('>div').count();ok(qs===7&&mv===1,'7 token questions plus 1 move-in item');
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'no horizontal overflow at 390px (pay tab)');
// legacy saved data without maintenance still loads
await p.evaluate(()=>localStorage.setItem('flathunt-v2',JSON.stringify({places:[{id:1,name:'Old save',rent:18000,deposit:2,lockin:6,commute:10,brokerage:1,feel:6,notes:'',checks:{'0-0':true}}]})));
await p.reload();await p.waitForTimeout(500);
ok((await p.locator('.fh-place').innerText()).includes('Old save')&&(await p.locator('.fh-place').innerText()).includes('Add maintenance to see it'),'saved data from before this change loads, maintenance unknown');
// legacy ticks: carried only when the meaning is unchanged, never on a changed check
await p.evaluate(()=>localStorage.setItem('flathunt-v2',JSON.stringify({places:[{id:1,name:'Ticked',rent:18000,deposit:2,lockin:6,commute:10,brokerage:1,feel:6,notes:'',checks:{'0-0':true,'1-1':true,'2-0':true,'2-3':true,'3-1':true,'3-2':true,'4-1':true,'4-3':true}}]})));
await p.reload();await p.waitForTimeout(500);
ok((await p.locator('#root').innerText()).includes('4 saved visit ticks were cleared'),'notice says 4 old ticks were cleared');
await p.getByRole('tab',{name:'On the visit'}).click();
const on=await p.locator('.fh-check input').evaluateAll(els=>els.map(e=>[e.checked,e.parentElement.innerText]));
const checked=on.filter(x=>x[0]).map(x=>x[1]);
ok(checked.length===4,'exactly 4 checks ticked after migration, got '+checked.length);
for(const s of ['pressure and hot water','ventilation and daylight','Rent increase','Flood/waterlogging'])ok(checked.some(c=>c.includes(s)),'kept tick: '+s);
for(const s of ['broadband','what is included (fans','What rent includes','Door and window locks','Bathroom','Electricals'])ok(!checked.some(c=>c.includes(s)),'not falsely ticked: '+s);
await p.getByRole('tab',{name:'Shortlist'}).click();
const card=await p.locator('.fh-place').innerText();
ok(card.includes('4 / 20'),'card shows 4 / 20');
ok(card.includes("Excludes maintenance and moving costs"),'cash to move in label excludes maintenance');
// ticking now saves stable ids, and a reload keeps them
await p.getByRole('tab',{name:'On the visit'}).click();await p.locator('.fh-check input').nth(4).check();await p.reload();await p.waitForTimeout(500);
const saved=await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('flathunt-v2')).places[0].checks).sort());
ok(saved.includes('bathroom')&&saved.every(k=>!/^\d-\d$/.test(k)),'saved keys are stable ids: '+saved.join(','));
console.log('BUNDLE CHECKS',n);
}finally{await b.close();server.kill();}
