import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {cleanNumber,ranges,fields,sanitizePlace,sanitizeList,encode,decode,summary,validateDraft,emptyDraft,totalChecks,upfront,monthlyTotal,draftFrom,placeText,droppedLegacyTicks,clearedInImport,exportText} from '../src/model';
import {CHECK_IDS,VISIT} from '../src/content';
const require=createRequire(import.meta.url);const old=require('../reference/core.cjs');
test('checklist has the same 20 items',()=>assert.equal(totalChecks,old.totalChecks()));
for(const field of fields)for(const value of [null,undefined,'',0,'0',1,'1',-1,'abc',NaN,Infinity,1e9,'  2.5  '])test(`${field} numeric parity ${String(value)}`,()=>assert.equal(cleanNumber(value,ranges[field]),old.cleanNumber(value,old.RANGES[field])));
for(const raw of [null,{},'bad',{name:'  A  '},{name:'你好 घर',notes:'  note ',rent:0,feel:11,checks:{'0-0':true,'0-1':false,'9-9':true}},{name:'a'.repeat(200),notes:'x'.repeat(2000),deposit:24},{name:'<img src=x onerror=alert(1)>',checks:{'4-3':true}}])test(`sanitizer parity ${JSON.stringify(raw).slice(0,40)}`,()=>{const a=sanitizePlace(raw),b=old.sanitizePlace(raw);if(a){a.id=0;a.checks={};}if(b){b.id=0;b.checks={};}assert.deepEqual(a,b);});
test('UTF8 export compatible both ways',()=>{const p=sanitizeList([{name:'घर 🏠',notes:'你好',rent:0}]).places;assert.deepEqual(decode(old.encode({places:p})),old.decode(encode(p)));assert.deepEqual(decode(encode(p))?.places,p);});
test('summary is identical to approved original',()=>{const p=sanitizeList([{name:'A',rent:0,deposit:2,lockin:0,commute:15,brokerage:0,feel:8,notes:'hello'},{name:'B'}]).places;assert.equal(summary(p),old.summary(p));});
for(const text of ['','garbage','x'.repeat(200001),btoa('{}'),btoa('{"places":{}}'),btoa('{"places":[{}]}')])test(`invalid export refused (${text.length})`,()=>assert.equal(decode(text),null));
test('valid empty export accepted',()=>assert.deepEqual(decode(encode([])),{places:[],skipped:0}));
test('sanitize reassigns duplicate ids and counts skips',()=>{const r=sanitizeList([{id:1,name:'A'},{id:1,name:'B'},{}]);assert.deepEqual(r.places.map(p=>p.id),[1,2]);assert.equal(r.skipped,1);});
test('invalid input blocks save without discarding draft',()=>{const d={...emptyDraft(),name:'A',rent:'-1'};assert.equal(validateDraft(d).place,null);assert.ok(validateDraft(d).errors.rent);assert.equal(d.rent,'-1');});
test('blank name has visible validation',()=>assert.ok(validateDraft(emptyDraft()).errors.name));
test('blank is distinct from zero',()=>{const p=validateDraft({...emptyDraft(),name:'A',rent:'0'}).place!;assert.equal(p.rent,0);assert.equal(p.deposit,null);});

import {samplePlaces} from '../src/model';
test('shipped examples are flagged and survive sanitize/encode/decode',()=>{
  assert.ok(samplePlaces.every(p=>p.example===true));
  const r=sanitizeList(samplePlaces);assert.ok(r.places.every(p=>p.example===true));
  const d=decode(encode(r.places));assert.ok(d&&d.places.every(p=>p.example===true));
});
test('unflagged saved places are never treated as examples, even if they match a shipped example',()=>{
  const legacy=samplePlaces.map(({example,...p})=>p);
  assert.ok(sanitizeList(legacy).places.every(p=>p.example===undefined));
});
test('a real entry cannot gain the example flag by accident',()=>{
  const p=sanitizePlace({name:'Koramangala 2BHK',rent:30000})!;assert.equal(p.example,undefined);
  assert.equal(sanitizePlace({name:'x',example:'yes'})!.example,undefined);
});

test('move-in cash = first month + deposit + brokerage, only when all three are known',()=>{const p=sanitizeList([{name:'A',rent:20000,deposit:2,brokerage:1}]).places[0];assert.equal(upfront(p),80000);assert.equal(upfront({...p,deposit:null}),null);assert.equal(upfront({...p,brokerage:null}),null);assert.equal(upfront({...p,rent:null}),null);assert.equal(upfront({...p,deposit:0,brokerage:0}),20000);});
test('maintenance is optional and unknown is not zero',()=>{const a=sanitizeList([{name:'A',rent:20000}]).places[0];assert.equal(a.maintenance,undefined);assert.equal(monthlyTotal(a),null);const b=sanitizeList([{name:'B',rent:20000,maintenance:0}]).places[0];assert.equal(b.maintenance,0);assert.equal(monthlyTotal(b),20000);const c=sanitizeList([{name:'C',rent:20000,maintenance:2500}]).places[0];assert.equal(monthlyTotal(c),22500);const d=sanitizeList([{name:'D',maintenance:2500}]).places[0];assert.equal(monthlyTotal(d),null);for(const bad of ['abc',-1,1e9,NaN])assert.equal(sanitizeList([{name:'E',rent:1,maintenance:bad}]).places[0].maintenance,undefined);});
test('maintenance validation and draft round trip',()=>{const d={...emptyDraft(),name:'A',rent:'20000',maintenance:'2000'};const r=validateDraft(d);assert.equal(r.place?.maintenance,2000);assert.equal(draftFrom(r.place!).maintenance,'2000');assert.equal(draftFrom(sanitizeList([{name:'B'}]).places[0]).maintenance,'');assert.ok(validateDraft({...d,maintenance:'-5'}).errors.maintenance);assert.equal(validateDraft({...d,maintenance:''}).place?.maintenance,undefined);});
test('maintenance survives export and import, old exports still load',()=>{const p=sanitizeList([{name:'A',rent:1000,maintenance:200}]).places;assert.equal(decode(encode(p))!.places[0].maintenance,200);assert.equal(decode(btoa(JSON.stringify({places:[{name:'Old',rent:5}]})))!.places[0].maintenance,undefined);});
test('summary mentions maintenance only when it was entered',()=>{const withM=sanitizeList([{name:'A',rent:20000,maintenance:2000}]).places;assert.match(summary(withM),/maintenance Rs\.2000, monthly total Rs\.22000/);const without=sanitizeList([{name:'A',rent:20000}]).places;assert.doesNotMatch(summary(without),/maintenance|monthly total/);});
test('single place share text is self-contained and never shows zero for unknowns',()=>{const p=sanitizeList([{name:'HSR',rent:19000,deposit:2,brokerage:1,notes:'Direct owner',checks:{'0-0':true}}]).places[0];const t=placeText(p);assert.match(t,/^Flat hunt: HSR/);assert.match(t,/cash to move in Rs\.76,?000/);assert.match(t,/Visit checklist: 1 of 20 done/);assert.match(t,/Notes: Direct owner/);assert.doesNotMatch(t,/maintenance|lock-in|commute/);});
test('legacy positional ticks keep only checks whose meaning is unchanged',()=>{
const all:Record<string,boolean>={};for(let g=0;g<5;g++)for(let i=0;i<4;i++)all[`${g}-${i}`]=true;
const p=sanitizeList([{name:'Old',checks:all}]).places[0];
assert.deepEqual(Object.keys(p.checks).sort(),['balcony','damp','flood','guest-parking-rules','kitchen','meter','noise','pests','power-backup','rent-increase','street-lighting','taps','ventilation','water-timing']);
for(const bad of ['bathroom','electricals','locks-entry','signal-broadband','storage-fittings','rent-includes'])assert.equal(p.checks[bad],undefined);
assert.equal(droppedLegacyTicks([{name:'Old',checks:all}]),6);
});
test('new stable ids round trip and unknown or false keys are ignored',()=>{
const p=sanitizeList([{name:'N',checks:{bathroom:true,locks:true,taps:false,'2-0':false}}]).places[0];
assert.deepEqual(p.checks,{bathroom:true});
assert.deepEqual(sanitizeList(decode(encode([p]))!.places).places[0].checks,{bathroom:true});
});
test('removing and re-sorting never shifts ticks: every check id is unique and matches the visit list shape',()=>{
assert.equal(new Set(CHECK_IDS.flat()).size,20);
assert.deepEqual(CHECK_IDS.map(g=>g.length),VISIT.map(g=>g[1].length));
});
test('old export import reports how many ticks were cleared',()=>{
const legacy=encode([{id:1,name:'X',notes:'',checks:{'0-0':true,'2-0':true,'3-1':true}} as any]);
assert.equal(clearedInImport(legacy),2);
assert.equal(clearedInImport('not base64'),0);
assert.equal(clearedInImport(encode(sanitizeList([{name:'Y',checks:{taps:true}}]).places)),0);
});
test('copied list is readable and the whole message restores the list',()=>{
const ps=sanitizeList([{name:'Indiranagar',rent:23000,maintenance:2000,deposit:3,brokerage:1,notes:'Bright kitchen',checks:{taps:true}},{name:'HSR',rent:19000}]).places;
const text=exportText(ps);
assert.ok(text.startsWith('Flat hunt comparison:'));assert.ok(text.includes('monthly total Rs.25000'));assert.ok(text.includes('Flat Hunt backup code'));
assert.deepEqual(decode(text)?.places,ps);
assert.deepEqual(decode(encode(ps))?.places,ps);
assert.deepEqual(decode(text.split('\n').pop()!)?.places,ps);
assert.equal(clearedInImport(exportText(sanitizeList([{name:'Z'}]).places)),0);
assert.equal(exportText([]),encode([]));
assert.equal(decode('hello eyJ'+'a'.repeat(30)),null);
});
