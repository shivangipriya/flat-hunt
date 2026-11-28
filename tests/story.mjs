import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn('python3',['-m','http.server','8771','--directory','dist'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,700));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox']});
let n=0;const ok=(c,m)=>{assert.ok(c,m);n++;};
try{
 for(const w of [390,1280]){
  const p=await b.newPage({viewport:{width:w,height:844}});
  await p.goto('http://localhost:8771/#story');await p.waitForSelector('.fh-story-fig video');
  ok(await p.evaluate(()=>{const c=getComputedStyle(document.querySelector('.fh-story h1')).color.match(/\d+/g).map(Number);return (c[0]+c[1]+c[2])/3<110;}),'title is dark on light '+w);ok(await p.locator('h1').innerText()==='Everyone Remembers the Balcony. Nobody Remembers the Deposit.','title '+w);
  ok(await p.evaluate(()=>document.documentElement.scrollWidth)<=w,'no horizontal overflow '+w);
  ok((await p.locator('.fh-story-fig video').count())===3,'three clips');
  ok(await p.evaluate(()=>[...document.querySelectorAll('.fh-story-fig video')].every(v=>v.muted&&v.loop&&v.hasAttribute('playsinline')&&v.getAttribute('aria-label'))),'clips are muted, looping, labelled');
  ok(await p.evaluate(async()=>{const vs=[...document.querySelectorAll('.fh-story-fig video')];await Promise.all(vs.map(v=>new Promise(r=>{if(v.readyState>=1)r();else{v.addEventListener('loadedmetadata',r,{once:true});setTimeout(r,8000);}})));return vs.every(v=>v.videoWidth>0);}),'clips decode');
  ok(await p.evaluate(()=>[...document.querySelectorAll('.fh-story-fig video')].every(v=>v.getBoundingClientRect().width<=v.videoWidth+1)),'clips never upscaled '+w);
  ok((await p.locator('.fh-story-fig figcaption').allInnerTexts()).join('|')==='Ninety seconds on the balcony.|Two months. Plus a month to be named later.|Writing the deposit down. Immediately.','captions');
  ok((await p.locator('.fh-story p').allInnerTexts()).join(' ').includes('Your list is saved in your own browser so a phone call or a reload does not wipe it'),'privacy wording');
  ok((await p.locator('.fh-story').innerText()).includes('Balcony: lovely. Deposit: Not added. Yet.')&&(await p.locator('.fh-story-sign').innerText())==='Shivangi :)','ending and sign-off');
  ok(await p.locator('.fh-story a[href="https://github.com/shivangipriya/flat-hunt/issues"]').count()===1,'issues link');
  ok(await p.locator('.fh-story-footer a[href="https://www.linkedin.com/in/shivangii-priyaa"]').count()===1,'linkedin link');
  ok(await p.locator('.fh-story-footer a[href="https://github.com/shivangipriya/flat-hunt"]').count()===1,'github link');
  await p.click('text=← Back to the notebook');await p.waitForSelector('.fh-tabs');
  ok(await p.locator('text=Try an example').count()>=0 && await p.locator('.fh-tabs').count()===1,'back to app '+w);
  ok(await p.locator('.fh-footer a[href="#story"]').count()===0,'story link is not in the footer '+w);
  ok(await p.locator('.fh-footer a').count()===2,'footer keeps only LinkedIn and GitHub '+w);
  await p.click('.fh-hero a[href="#story"]');await p.waitForSelector('.fh-story');
  ok(await p.locator('.fh-story').count()===1,'hero story link opens story '+w);
  await p.close();
 }
 console.log('STORY CHECKS PASS',n);
}finally{await b.close();server.kill();}
