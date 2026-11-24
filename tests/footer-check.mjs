import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn('python3',['-m','http.server','8767','--directory','dist'],{stdio:'ignore'});
await new Promise(r=>setTimeout(r,700));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox']});
const p=await b.newPage({viewport:{width:390,height:844}});
try{
await p.goto('http://localhost:8767');
const a=p.locator('.fh-footer a[href="https://www.linkedin.com/in/shivangii-priyaa"]');
assert.equal(await a.count(),1,'exactly one LinkedIn footer link');
assert.equal((await a.innerText()).trim(),'Shivangi Priya','name text preserved');
assert.equal(await a.getAttribute('target'),'_blank','opens new tab');
assert.equal(await a.getAttribute('rel'),'noreferrer','noreferrer set');
await a.scrollIntoViewIfNeeded();
try{await p.screenshot({path:'/downloads/fh-footer-link-390.png'})}catch{}// optional local artifact, not an assertion
console.log('FOOTER CHECKS PASS');
}finally{await b.close();server.kill();}
