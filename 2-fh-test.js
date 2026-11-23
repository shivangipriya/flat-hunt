// Engine + copy tests for flat-hunt index.html
const fs = require('fs');
const html = fs.readFileSync(require('path').join(__dirname, 'index.html'), 'utf8');
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error('FAIL: no script block'); process.exit(1); }
const mod = { exports: {} };
new Function('module', m[1])(mod);
const FH = mod.exports;

let pass = 0, fail = 0;
function t(name, cond) { if (cond) { pass++; } else { fail++; console.log('FAIL: ' + name); } }

const good = { id: 1, name: 'g', rent: 15000, deposit: 2, lockin: 0, commute: 20, brokerage: 0, feel: 9, checks: {} };
const sparse = { id: 2, name: 's', rent: 15000, deposit: null, lockin: null, commute: null, brokerage: null, feel: null, checks: {} };

// --- per-place checklist state
t('total checks = 20', FH.totalChecks() === 20);
const p1 = { id: 1, name: 'A', checks: { '0-1': true } };
const p2 = { id: 2, name: 'B', checks: { '0-1': true, '2-2': true, '4-0': true } };
t('checkedCount is per place', FH.checkedCount(p1) === 1 && FH.checkedCount(p2) === 3);
t('empty checks -> 0', FH.checkedCount({ name: 'C', checks: {} }) === 0 && FH.checkedCount({ name: 'D' }) === 0);

// --- summary
const sum = FH.summary([good, p2]);
t('summary lists places', sum.indexOf('g') > -1 && sum.indexOf('B') > -1);
t('summary handles missing data without zeros', !/deposit 0m/.test(FH.summary([sparse])));
t('summary reports checklist progress per place', /visit checklist: 3 of 20 done/.test(sum));

// --- export / import round-trip with per-place checks
const state = { places: [ { ...good, checks: { '0-1': true, '3-2': true }, notes: 'damp patch' }, sparse ] };
const enc = FH.encode(state);
const dec = FH.decode(enc);
t('round-trips places', dec && dec.places.length === 2 && dec.places[0].name === 'g' && dec.places[1].rent === 15000);
t('round-trips per-place checks', dec.places[0].checks['0-1'] === true && dec.places[0].checks['3-2'] === true && Object.keys(dec.places[1].checks).length === 0);
t('round-trips notes', dec.places[0].notes === 'damp patch');
t('import rejects garbage', FH.decode('hello world') === null && FH.decode('') === null);
t('import rejects wrong shape', FH.decode(FH.encode({ foo: 1 })) === null);
t('import skips place without name, keeps valid ones', (function(){
  var d = FH.decode(FH.encode({ places: [{ name: 'ok' }, { rent: 5 }] }));
  return d && d.places.length === 1 && d.places[0].name === 'ok' && d.skipped === 1;
})());
t('import all-invalid rejects', FH.decode(FH.encode({ places: [{ rent: 5 }] })) === null);
t('import tolerates place without checks', FH.decode(FH.encode({ places: [{ name: 'x' }] })).places[0].checks !== undefined);

// --- checklist content
const all = JSON.stringify(FH.VISIT);
t('covers water/power', all.indexOf('Power backup') > -1);
t('covers deposit refund terms', all.indexOf('Deposit refund terms in writing') > -1);
t('covers mobile signal check', /mobile signal/i.test(all));
t('before-you-pay list present', FH.ASK.length >= 5);
t('token money receipt advice present', /written receipt/.test(FH.ASK.join(' ')));

// --- copy checks
t('blank-fields-left-out stated', /left out/.test(html));
t('no composite score or ranking', !/FH\.score|FACTORS|Sorted by score/.test(html));
t('no ranking claim', /does not rank the places or pick a winner/.test(html));
t('per-place checklist scope stated', /Each place keeps its own checklist/.test(html));
t('reset is per place', /Uncheck all for this place/.test(html));
t('remember is opt-in (unchecked default)', !/id="remember"[^>]*checked/.test(html));
t('local-only privacy wording', /never leaves it|only this device/.test(html));
t('loss limit stated', /forgets everything when you close/.test(html) || /resets when you close/.test(html));
t('not-legal-advice framing', /not legal advice/.test(html));
t('no "most reported" unverified claim', !/most reported/i.test(html));
t('maintainer line', /Maintained by Shivangi Priya\./.test(html));
t('no AI-assistance footer', !/AI assistance|built with AI/i.test(html));
t('no employer names', !/Coursera|Educlaas|Roehampton/i.test(html));
t('accessibility: tab roles', /role="tab"/.test(html));
t('accessibility: progressbar aria', /role="progressbar"/.test(html));
t('accessibility: place selector labelled', /<label for="vplace"/.test(html));


// --- v2: input hardening
t('cleanNumber rejects negatives', FH.cleanNumber('-5000', FH.RANGES.rent) === null);
t('cleanNumber rejects over-max', FH.cleanNumber('1e12', FH.RANGES.rent) === null && FH.cleanNumber('99', FH.RANGES.feel) === null && FH.cleanNumber('0', FH.RANGES.feel) === null);
t('cleanNumber rejects non-numeric', FH.cleanNumber('abc', FH.RANGES.rent) === null && FH.cleanNumber('15000abc', FH.RANGES.rent) === null);
t('cleanNumber accepts valid', FH.cleanNumber('0', FH.RANGES.rent) === 0 && FH.cleanNumber('15000', FH.RANGES.rent) === 15000 && FH.cleanNumber(22000.5, FH.RANGES.rent) === 22000.5 && FH.cleanNumber('2.5', FH.RANGES.deposit) === 2.5);
t('cleanNumber empty/null -> null', FH.cleanNumber('', FH.RANGES.rent) === null && FH.cleanNumber(null, FH.RANGES.rent) === null && FH.cleanNumber(undefined, FH.RANGES.rent) === null);
t('cleanNumber rejects Infinity/NaN', FH.cleanNumber('Infinity', FH.RANGES.rent) === null && FH.cleanNumber(NaN, FH.RANGES.rent) === null);

// --- v2: sanitizePlace
t('sanitize truncates long name and notes', (function(){
  var p = FH.sanitizePlace({ name: 'x'.repeat(500), notes: 'y'.repeat(5000) });
  return p.name.length === FH.MAX_NAME && p.notes.length === FH.MAX_NOTES;
})());
t('sanitize rejects blank/whitespace name', FH.sanitizePlace({ name: '   ' }) === null && FH.sanitizePlace(null) === null && FH.sanitizePlace('str') === null);
t('sanitize drops out-of-range numerics, keeps valid', (function(){
  var p = FH.sanitizePlace({ name: 'a', rent: -1, deposit: '99', lockin: '3', commute: '45', brokerage: '0', feel: '11' });
  return p.rent === null && p.deposit === null && p.lockin === 3 && p.commute === 45 && p.brokerage === 0 && p.feel === null;
})());
t('sanitize accepts numeric strings from forms', (function(){
  var p = FH.sanitizePlace({ name: 'a', rent: '22000', feel: '8' });
  return p.rent === 22000 && p.feel === 8;
})());
t('sanitize prunes unknown/prototype check keys and non-true values', (function(){
  var checks = JSON.parse('{"0-1":true,"__proto__":true,"99-99":true,"0-2":"yes","1-0":true}');
  var p = FH.sanitizePlace({ name: 'a', checks: checks });
  var keys = Object.keys(p.checks);
  return keys.length === 2 && p.checks['0-1'] === true && p.checks['1-0'] === true && !Object.prototype.hasOwnProperty.call(p.checks, '__proto__') && !Object.prototype.hasOwnProperty.call(p.checks, '99-99') && !Object.prototype.hasOwnProperty.call(p.checks, '0-2');
})());

// --- v2: sanitizePlaces id normalization
t('sanitizePlaces assigns fresh sequential ids', (function(){
  var r = FH.sanitizePlaces([{ name: 'a', id: 7 }, { name: 'b', id: 7 }, { name: 'c', id: '5' }]);
  return r.places[0].id === 1 && r.places[1].id === 2 && r.places[2].id === 3 && r.skipped === 0;
})());
t('import normalizes string ids (visit selection cannot break)', (function(){
  var d = FH.decode(FH.encode({ places: [{ name: 'a', id: '5', checks: { '0-1': true } }] }));
  return d && d.places[0].id === 1 && typeof d.places[0].id === 'number';
})());
t('import rejects oversized payload', (function(){
  var big = FH.encode({ places: [{ name: 'a', notes: 'z'.repeat(FH.MAX_IMPORT_CHARS) }] });
  return FH.decode(big) === null;
})());
t('import empty list allowed', (function(){
  var d = FH.decode(FH.encode({ places: [] }));
  return d && d.places.length === 0 && d.skipped === 0;
})());
t('round-trip preserves all sanitized fields', (function(){
  var d = FH.decode(FH.encode({ places: [{ name: 'g', rent: 15000, deposit: 2, lockin: 0, commute: 20, brokerage: 0, feel: 9, notes: 'damp', checks: { '0-1': true } }] }));
  var p = d.places[0];
  return p.rent === 15000 && p.deposit === 2 && p.lockin === 0 && p.commute === 20 && p.brokerage === 0 && p.feel === 9 && p.notes === 'damp' && p.checks['0-1'] === true;
})());

// --- v2: copy checks
t('input length caps in markup', /id="pname" maxlength="120"/.test(html) && /id="pnotes" maxlength="1000"/.test(html));
t('form warning element present', /id="formwarn"/.test(html));
t('out-of-range blocks save and preserves input', /Nothing was saved yet/.test(html) && /fix or clear it, then save again/.test(html) && /\.focus\(\);\n      return;/.test(html));
t('no window.prompt fallback', !/window\.prompt/.test(html));
t('clipboard fallback selects text instead', /Clipboard was blocked, so the summary is selected below/.test(html));
t('tabs wired with aria-controls', /id="tabCompare"[^>]*aria-controls="paneCompare"/.test(html) && /id="tabVisit"[^>]*aria-controls="paneVisit"/.test(html) && /id="tabAsk"[^>]*aria-controls="paneAsk"/.test(html));
t('panes are labelled tabpanels', /id="paneCompare" role="tabpanel" aria-labelledby="tabCompare"/.test(html) && /id="paneVisit" role="tabpanel" aria-labelledby="tabVisit"/.test(html) && /id="paneAsk" role="tabpanel" aria-labelledby="tabAsk"/.test(html));
t('focus-visible styling present', /:focus-visible/.test(html));
t('persist failure is honest', /refused to save the list/.test(html));
t('import reports skipped entries', /invalid entr/.test(html));

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
