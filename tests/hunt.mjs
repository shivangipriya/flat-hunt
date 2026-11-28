import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const URL=process.env.FH_URL||'http://localhost:8771';
const server=spawn('python3',['-m','http.server','8771','--directory','dist'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,600));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox']});
let n=0;const ok=(v,m)=>{assert.ok(v,m);console.log('PASS',++n,m)};
const has=async(loc,s)=>{for(let i=0;i<50;i++){try{if((await loc.innerText()).includes(s))return true;}catch{}await new Promise(r=>setTimeout(r,100))}return false};
const sizes=[[390,844,'390x844'],[360,640,'360x640 small phone']];
try{for(const [W,H,name] of sizes){
const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,hasTouch:true,isMobile:true,permissions:['clipboard-read','clipboard-write']});const p=await ctx.newPage();
const w=ms=>p.waitForTimeout(ms);
const top=async sel=>{const r=await p.locator(sel).first().boundingBox();return r?r.y:null};
const inView=async sel=>{const r=await p.locator(sel).first().boundingBox();return !!r&&r.y>=0&&r.y+Math.min(r.height,60)<=H};
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(URL);await w(400);
// 1 quick add at the door: name only + Enter
await p.getByRole('button',{name:/Add your first place/}).first().click();await w(300);
ok((await p.locator('.fh-hint').first().innerText()).includes('Only the name is needed'),name+': form says only the name is needed');
await p.locator('#place-name').fill('Sai Residency 2BHK');await p.locator('#place-name').press('Enter');await w(400);
ok(await p.locator('.fh-place').count()===1,name+': Enter in the name field adds the place');
ok(await inView('#place-1'),name+': new card is on screen after Enter (top y='+Math.round(await top('#place-1'))+')');
ok(await p.evaluate(()=>document.activeElement&&document.activeElement.id==='place-1'),name+': new card has focus');
await p.screenshot({path:`/tmp/hunt-${W}-1-after-add.png`});
// 2 add with Save button after filling fields (PG)
await p.getByRole('button',{name:'+ Add a place'}).first().click();await w(300);
await p.locator('#place-name').fill('Green Nest PG');await p.getByRole('radio',{name:'PG'}).click();
const ys=[await top('#pg-sharing'),await top('#field-deposit'),await top('#field-feel')];
ok(ys[0]<ys[1]&&ys[0]<ys[2],name+': PG questions come before deposit and gut feel (y '+ys.map(Math.round).join(' < ')+')');
await p.locator('#field-rent').fill('7000');await p.locator('#pg-meals').selectOption('included');
await p.getByRole('button',{name:'Add to shortlist'}).scrollIntoViewIfNeeded();await p.getByRole('button',{name:'Add to shortlist'}).click();await w(400);
ok(await inView('#place-2'),name+': PG card is on screen after the Save button');
// third: flat with maintenance
await p.getByRole('button',{name:'+ Add a place'}).first().click();await w(300);
await p.locator('#place-name').fill('Ankit Tower 1BHK');await p.locator('#field-rent').fill('15000');await p.locator('#field-maintenance').fill('1000');await p.locator('#field-deposit').fill('2');await p.locator('#field-brokerage').fill('1');
await p.locator('#place-name').press('Enter');await w(400);
ok(await inView('#place-3'),name+': third card on screen after add');
// 3 compare at a glance
const rows=p.locator('.fh-compare li');ok(await rows.count()===3,name+': at-a-glance list has 3 rows');
const rt=await p.locator('.fh-compare').innerText();
ok(rt.includes('Monthly: not complete')&&rt.includes('Cash to move in: not complete')&&rt.includes('Monthly ₹16,000')&&rt.includes('Cash to move in ₹60,000'),name+': glance rows show complete numbers only when complete, else "not complete"');
const pgRow=await rows.nth(1).innerText();ok(pgRow.includes('(PG)')&&pgRow.includes('Rent ₹7,000'),name+': PG row is marked PG with its rent');
await p.locator('.fh-compare').scrollIntoViewIfNeeded();await w(200);await p.locator('.fh-compare').screenshot({path:`/tmp/hunt-${W}-2-glance.png`});
await rows.nth(0).locator('button').click();await w(400);
ok(await inView('#place-1'),name+': tapping a glance row jumps to that card');
// 4 visit tab: checks reachable, note on visit tab, row tap
await p.getByRole('button',{name:/Visit checklist/}).first().click();await w(400);
ok(await inView('.fh-check'),name+': checks are on screen right after opening the visit tab (first check y='+Math.round(await top('.fh-check'))+')');
const sel=await p.locator('#visit-place').inputValue();
await p.screenshot({path:`/tmp/hunt-${W}-3-visit.png`});
await p.locator('.fh-check span').first().click();
ok(await p.locator('.fh-check input').first().isChecked(),name+': tapping the check text (not the box) ticks it');
await p.locator('#visit-note').fill('Water only 6 to 8 am. Owner wants 11 month agreement.');await w(200);
await p.locator('#visit-place').selectOption({label:'Ankit Tower 1BHK'});await p.locator('#visit-place').selectOption({label:'Sai Residency 2BHK'});
ok((await p.locator('#visit-note').inputValue()).includes('Water only 6 to 8 am'),name+': visit note stays with its place after switching places');
await p.getByRole('tab',{name:'Your shortlist'}).click();await w(300);
ok(await has(p.locator('#place-1'),'Water only 6 to 8 am'),name+': visit note appears on the card');
await p.locator('#place-1').getByRole('button',{name:'Edit'}).click();await w(300);
ok((await p.locator('#place-notes').inputValue()).includes('Water only 6 to 8 am'),name+': the same text is in the Edit form notes field');
await p.locator('#place-name').fill('Sai Residency 2BHK (rent 18000)');await p.locator('#place-name').press('Enter');await w(400);
ok(await inView('#place-1'),name+': card on screen after an edit and save');
ok(await p.locator('#place-1').innerText().then(t=>t.includes('1 / 20')&&t.includes('Water only')),name+': edit kept the tick and the note');
await p.getByRole('button',{name:'Copy my list as text'}).click();await w(300);
const txt=await p.evaluate(()=>navigator.clipboard.readText());
ok(txt.includes('notes: Water only 6 to 8 am')&&txt.includes('Green Nest PG'),name+': shared text carries the visit note');
ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),name+': no sideways scroll');
ok(errs.length===0,name+': no page errors '+errs.join('|'));
await ctx.close();}
console.log('HUNT CHECKS',n);
}finally{await b.close();server.kill();}
