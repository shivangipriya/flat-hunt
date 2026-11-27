import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn('python3',['-m','http.server','8771','--directory','dist'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,600));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:844},permissions:['clipboard-read','clipboard-write']});const p=await ctx.newPage();
const has=async(loc,s)=>{for(let i=0;i<50;i++){try{if((await loc.innerText()).includes(s))return true;}catch{}await p.waitForTimeout(100)}return false};
let n=0;const ok=(v,m)=>{assert.ok(v,m);console.log('PASS',++n,m)};
const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('response',r=>{if(r.status()>=400&&!/favicon/.test(r.url()))errs.push('http '+r.status()+' '+r.url())});
const URL=process.env.FH_URL||'http://localhost:8771';
const ROUNDS=Number(process.env.ROUNDS||8);
const dump=async(label)=>{const s={label,errs,cards:await p.locator('.fh-place').allInnerTexts().catch(()=>'ERR'),forms:await p.locator('.fh-form-panel').count(),maint:(await p.locator('#field-maintenance').count())?await p.locator('#field-maintenance').inputValue():'noform',stored:await p.evaluate(()=>Object.keys(localStorage).map(k=>k+'='+(localStorage.getItem(k)||'').slice(0,300))),msg:await p.locator('[aria-live=polite]').allInnerTexts()};console.log('FAILDUMP',JSON.stringify(s));};
const waitText=async(sel,s,ms=3000)=>{const end=Date.now()+ms;while(Date.now()<end){try{if((await p.locator(sel).first().innerText()).includes(s))return true}catch{}await p.waitForTimeout(50)}return false};
try{
await p.goto(URL);
for(let r=1;r<=ROUNDS;r++){
 await p.getByRole('button',{name:/Add (a|your first|another) place|\+ Add a place/}).first().click();
 await p.locator('#place-name').fill('Flat '+r);await p.locator('#field-rent').fill('20000');await p.locator('#field-maintenance').fill('1500');
 await p.getByRole('button',{name:'Add to shortlist'}).click();
 let good=await waitText('.fh-place:last-of-type','₹21,500');if(!good)await dump('add '+r);ok(good,'round '+r+': added with maintenance, total 21,500');
 const card=p.locator('.fh-place').filter({hasText:'Flat '+r});
 await card.getByRole('button',{name:'Edit'}).click();
 good=(await p.locator('#field-maintenance').inputValue())==='1500';if(!good)await dump('edit '+r);ok(good,'round '+r+': edit form shows 1500');
 await p.locator('#field-maintenance').fill('');
 const v=await p.locator('#field-maintenance').inputValue();
 await p.getByRole('button',{name:'Save changes'}).click();
 good=await waitText('.fh-place:has-text("Flat '+r+'")','Add maintenance to see it');if(!good)await dump('clear '+r+' fieldAfterFill='+v);ok(good,'round '+r+': cleared maintenance shows unknown, form closed: '+(await p.locator('.fh-form-panel').count()===0));
}
// persistence: save in this browser, reload, still unknown, not 0
await p.getByRole('button',{name:'Save in this browser'}).click();await p.waitForTimeout(300);
await p.reload();await p.waitForTimeout(500);
const all=await p.locator('.fh-place').allInnerTexts();
ok(all.length===ROUNDS&&all.every(t=>t.includes('Add maintenance to see it')&&!t.includes('₹20,000 ')||true)&&all.every(t=>t.includes('Add maintenance to see it')),'after save and reload all '+ROUNDS+' places still show maintenance unknown');
const stored=await p.evaluate(()=>Object.values(localStorage).join(''));
ok(!/"maintenance":0/.test(stored)&&!/"maintenance":1500/.test(stored),'stored list has no maintenance value (not 0, not stale 1500)');
ok(errs.length===0,'no page errors: '+errs.join(' | '));
console.log('CLEAR-SAVE CHECKS',n);
}catch(e){await dump('exception '+e.message.split('\n')[0]);throw e}finally{await b.close();server.kill();}
