import {chromium} from 'playwright-core';import {spawn} from 'node:child_process';import assert from 'node:assert/strict';
const server=spawn('python3',['-m','http.server','8769','--directory','dist'],{stdio:'ignore'});await new Promise(r=>setTimeout(r,600));
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome-stable',headless:true,args:['--no-sandbox']});const p=await b.newPage({viewport:{width:390,height:844}});let n=0;const ok=(v,m)=>{assert.ok(v,m);console.log('PASS',++n,m)};
const banner=()=>p.getByText('Example mode.').count();const cards=()=>p.locator('.fh-place').count();
async function addReal(name){await p.getByRole('button',{name:/Add another place|Add your first place|\+ Add a place/}).first().click();await p.locator('#place-name').fill(name);await p.getByRole('button',{name:'Add to shortlist'}).click();}
try{
await p.goto('http://localhost:8769');await p.getByRole('button',{name:'Try an example'}).click();
ok(await banner()===1&&await cards()===2,'example loads with banner');
await p.getByRole('checkbox',{name:'Remember in this browser'}).check();await p.reload();
ok(await cards()===2&&await banner()===1,'saved example keeps banner after reload');
ok(await p.getByRole('button',{name:'Clear example'}).count()===1,'Clear example survives reload');
await addReal('My own flat near the metro');ok(await cards()===3,'real place added next to example');
await p.reload();ok(await cards()===3&&await banner()===1,'mixed list survives reload');
await p.getByRole('button',{name:'Clear example'}).click();
ok(await cards()===1&&await p.getByText('My own flat near the metro').count()>=1,'clear removes only examples');
ok(await banner()===0,'banner gone once no examples left');
await p.reload();ok(await cards()===1&&await banner()===0,'after clear + reload only the real place remains');
// legacy saved copy without flags is kept untouched (never cleared automatically)
await p.evaluate(()=>{localStorage.setItem('flathunt-v2',JSON.stringify({places:[{id:1,name:'Indiranagar · 1BHK',rent:23000,deposit:3,lockin:6,commute:20,brokerage:1,feel:8,notes:'FICTIONAL EXAMPLE. Bright kitchen. Check water timing on a second visit.',checks:{}},{id:2,name:'My real flat',rent:18000,deposit:2,lockin:11,commute:25,brokerage:null,feel:null,notes:'saw it Sunday',checks:{}}]}))});
await p.reload();ok(await banner()===0&&await cards()===2,'unflagged legacy places stay as ordinary entries, no banner, nothing auto-cleared');
await p.getByRole('button',{name:'Remove Indiranagar · 1BHK'}).click();ok(await cards()===1&&await p.getByText('My real flat').count()===1,'legacy sample can be removed by hand, real entry kept');
// a real place named like an example but with own numbers is not an example
await p.evaluate(()=>localStorage.setItem('flathunt-v2',JSON.stringify({places:[{id:1,name:'Indiranagar · 1BHK',rent:24000,deposit:3,lockin:6,commute:20,brokerage:1,feel:8,notes:'my notes',checks:{}}]})));
await p.reload();ok(await banner()===0&&await cards()===1,'real place with an example name is not treated as an example');
// export/import keeps provenance
await p.evaluate(()=>localStorage.removeItem('flathunt-v2'));await p.reload();await p.getByRole('button',{name:'Try an example'}).click();
console.log('EXAMPLE CHECKS',n);
}finally{await b.close();server.kill();}
