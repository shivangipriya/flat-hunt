import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const URL=process.env.FH_URL||'http://localhost:8771';
const server=spawn('python3',['-m','http.server','8771','--directory','dist'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,600));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox']});
let n=0;const ok=(v,m)=>{assert.ok(v,m);console.log('PASS',++n,m)};
const has=async(loc,s)=>{for(let i=0;i<50;i++){try{if((await loc.innerText()).includes(s))return true}catch{}await new Promise(r=>setTimeout(r,100))}return false};
const store=(p)=>p.evaluate(()=>({data:localStorage.getItem('flathunt-v2'),off:localStorage.getItem('flathunt-v2-off')}));
try{
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});const p=await ctx.newPage();
const reqs=[];p.on('request',r=>{if(!r.url().startsWith(URL)&&!r.url().startsWith('data:'))reqs.push(r.url())});
await p.goto(URL);
ok(await p.locator('.fh-remember input').isChecked(),'saving is on by default');
ok((await store(p)).data===null,'nothing stored before the first place (no empty record)');
// add
await p.getByRole('button',{name:'Add your first place'}).click();await p.locator('#place-name').fill('Gupta flat');await p.locator('#field-rent').fill('18000');await p.locator('#field-maintenance').fill('1200');await p.locator('#place-name').press('Enter');await p.waitForTimeout(400);
ok(await has(p.locator('#root'),'Saved automatically in this browser only'),'status says saved automatically, browser only');
await p.reload();await p.waitForTimeout(400);
ok(await p.locator('.fh-place').count()===1&&await has(p.locator('.fh-place').first(),'₹19,200'),'added place survives reload with its total');
// edit
await p.getByRole('button',{name:'Edit'}).click();await p.locator('#field-rent').fill('17500');await p.getByRole('button',{name:'Save changes'}).click();await p.waitForTimeout(400);await p.reload();await p.waitForTimeout(400);
ok(await has(p.locator('.fh-place').first(),'₹17,500'),'edit survives reload');
// visit note and tick
await p.getByRole('tab',{name:/visit/i}).click();await p.waitForTimeout(300);
ok(await has(p.locator('label[for=visit-note]'),'Saved in this browser'),'note label says saved in this browser');
await p.locator('#visit-note').fill('water only 6 to 8 am');
await p.locator('.fh-check, [role=tabpanel] label:has(input[type=checkbox])').first().click();await p.waitForTimeout(300);
await p.reload();await p.waitForTimeout(400);await p.getByRole('tab',{name:/visit/i}).click();await p.waitForTimeout(300);
ok(await p.locator('#visit-note').inputValue()==='water only 6 to 8 am','visit note survives reload');
ok(await p.locator('[role=tabpanel] input[type=checkbox]:checked').count()===1,'tick survives reload');
await p.getByRole('tab',{name:/shortlist/i}).click();await p.waitForTimeout(300);
await p.screenshot({path:'/tmp/auto-1-on.png'});
// erase
await p.getByRole('button',{name:'Erase saved copy'}).click();await p.waitForTimeout(300);
let st=await store(p);ok(st.data===null&&st.off==='1','erase removes the saved copy and records that saving is off');
ok(await has(p.locator('#root'),'Saving is off')&&!(await p.locator('.fh-remember input').isChecked()),'status and checkbox say saving is off');
ok(await p.locator('.fh-place').count()===1,'erase keeps the current list on screen');
await p.screenshot({path:'/tmp/auto-2-erased.png'});
// not silently resaving
await p.getByRole('button',{name:'Edit'}).click();await p.locator('#field-rent').fill('17000');await p.getByRole('button',{name:'Save changes'}).click();await p.waitForTimeout(400);
await p.getByRole('tab',{name:/visit/i}).click();await p.locator('#visit-note').fill('changed after erase');await p.waitForTimeout(300);
ok((await store(p)).data===null,'edits after erase are not written to the browser');
await p.reload();await p.waitForTimeout(400);
ok(await p.locator('.fh-place').count()===0,'after erase and reload the list is gone, nothing came back');
ok(!(await p.locator('.fh-remember input').isChecked()),'saving stays off after reload (erase choice remembered)');
// turn on again
await p.getByRole('button',{name:'Add your first place'}).click();await p.locator('#place-name').fill('Second flat');await p.locator('#place-name').press('Enter');await p.waitForTimeout(400);
ok((await store(p)).data===null,'adding with saving off stores nothing');
await p.getByRole('button',{name:'Turn saving on'}).click();await p.waitForTimeout(300);
st=await store(p);ok(st.data&&st.data.includes('Second flat')&&st.off===null,'turning saving on saves the current list and clears the off flag');
await p.reload();await p.waitForTimeout(400);
ok(await p.locator('.fh-place').count()===1,'saved again after turning on, survives reload');
// existing data kept: earlier saved list, no off flag
const ctx2=await b.newContext({viewport:{width:390,height:844}});const q=await ctx2.newPage();await q.goto(URL);
await q.evaluate(()=>localStorage.setItem('flathunt-v2',JSON.stringify({places:[{id:1,name:'Older saved flat',kind:'flat',rent:15000,notes:'kept',checks:{}}]})));await q.reload();await q.waitForTimeout(400);
ok(await has(q.locator('.fh-place').first(),'Older saved flat'),'a list saved before this change still loads, nothing lost');
ok(await q.locator('.fh-remember input').isChecked(),'and saving is on for it');
await ctx2.close();
// storage unavailable
const ctx3=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});const r=await ctx3.newPage();
await r.addInitScript(()=>{Storage.prototype.setItem=()=>{throw new Error('blocked')};});await r.goto(URL);
await r.getByRole('button',{name:'Add your first place'}).click();await r.locator('#place-name').fill('Blocked flat');await r.locator('#place-name').press('Enter');await r.waitForTimeout(400);
ok(await r.locator('.fh-place').count()===1,'with storage blocked the page still works');
ok(await has(r.locator('#root'),'Not saved.')&&await has(r.locator('#root'),'not letting Flat Hunt save'),'blocked storage says plainly that nothing is saved');
ok(!(await has(r.locator('#root'),'Saved automatically')),'and never claims it is saved');
await r.screenshot({path:'/tmp/auto-3-blocked.png'});
await ctx3.close();
ok(reqs.length===0,'no outside network requests: '+reqs.join(','));
console.log('AUTOSAVE CHECKS',n);
}finally{await b.close();server.kill()}
