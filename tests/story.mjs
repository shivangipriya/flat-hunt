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
  await p.goto('http://localhost:8771/#story');
  ok(await p.evaluate(()=>{const c=getComputedStyle(document.querySelector('.fh-story h1')).color.match(/\d+/g).map(Number);return (c[0]+c[1]+c[2])/3<110;}),'title is dark on light '+w);ok(await p.locator('h1').innerText()==='I built Flat Hunt because a nice balcony wipes your memory','title '+w);
  ok(await p.evaluate(()=>document.documentElement.scrollWidth)<=w,'no horizontal overflow '+w);
  ok((await p.locator('.fh-story-fig img').count())===3,'three figures');ok(await p.evaluate(()=>[...document.querySelectorAll('.fh-story-fig img')].every(i=>i.complete&&i.naturalWidth>0)),'images load');
  ok((await p.locator('.fh-story p').allInnerTexts()).join(' ').includes('The “remember” box only decides whether your browser keeps the notes'),'privacy wording');
  ok(await p.locator('.fh-story-footer a[href="https://www.linkedin.com/in/shivangii-priyaa"]').count()===1,'linkedin link');
  ok(await p.locator('.fh-story-footer a[href="https://github.com/shivangipriya/flat-hunt"]').count()===1,'github link');
  await p.click('text=← Back to the notebook');await p.waitForSelector('.fh-tabs');
  ok(await p.locator('text=Try an example').count()>=0 && await p.locator('.fh-tabs').count()===1,'back to app '+w);
  await p.click('.fh-footer a[href="#story"]');await p.waitForSelector('.fh-story');
  ok(await p.locator('.fh-story').count()===1,'footer story link opens story '+w);
  const pn=await p.locator('.fh-footer a').count();
  await p.close();
 }
 console.log('STORY CHECKS PASS',n);
}finally{await b.close();server.kill();}
