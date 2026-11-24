var FH = {};

FH.VISIT = [
  ["Water & power", [
    "Turn on taps: pressure and hot water actually work",
    "Ask about water timing / tanker dependency in summer",
    "Power backup: what runs on it (lift? one plug point? whole flat?)",
    "Check the meter type: individual meter or split bill"
  ]],
  ["Structure & damp", [
    "Look for damp patches, especially corners, ceilings, bathroom walls",
    "Open windows: ventilation and daylight in every room",
    "Check for pest signs under the sink and behind appliances",
    "Balcony / drying space for clothes"
  ]],
  ["Everyday living", [
    "Your mobile signal and data speed inside every room (make a call)",
    "Noise: stand quietly for a minute - traffic, construction, function halls nearby",
    "Kitchen actually usable: gas pipeline or cylinder space, chimney/exhaust",
    "Storage: cupboards, loft, or space for your own"
  ]],
  ["Money clarity", [
    "What exactly is included in rent: maintenance, parking, water?",
    "Deposit refund terms in writing: deductions listed, timeline stated",
    "Rent increase: how much after how long, in the agreement",
    "Notice period on both sides, and who repaints at exit"
  ]],
  ["Area & access", [
    "Street lighting and the walk from the main road at night",
    "Nearest grocery, pharmacy, and bus/metro stop",
    "Guest, delivery, and vehicle-parking rules (ask the guard, not just the broker)",
    "Flood/waterlogging history of the street in monsoon"
  ]]
];

FH.ASK = [
  "See the draft agreement before paying anything. Read the lock-in, the exit clause, and the deduction list.",
  "Get the owner's full name and a written receipt for any token, with the refund condition written on it.",
  "Confirm on a video call from inside the flat if you are dealing remotely. A broker who will not do this is a red flag.",
  "Ask why the previous tenant left, and how long the place was empty.",
  "Ask the security guard or a neighbour about water, power cuts, and the owner - not only the person showing you the flat.",
  "Photograph every existing scratch, stain and fitting on move-in day and share the photos with the owner the same day."
];

FH.MAX_NAME = 120;
FH.MAX_NOTES = 1000;
FH.MAX_IMPORT_CHARS = 200000;
FH.RANGES = { rent: [0, 100000000], deposit: [0, 24], lockin: [0, 120], commute: [0, 1440], brokerage: [0, 24], feel: [1, 10] };
FH._vk = null;
FH.validCheckKeys = function(){
  if(FH._vk) return FH._vk;
  var s = {};
  FH.VISIT.forEach(function(sec, si){ sec[1].forEach(function(_, ii){ s[si + "-" + ii] = true; }); });
  FH._vk = s;
  return s;
};
FH.cleanNumber = function(v, range){
  if(v === null || v === undefined) return null;
  var s = String(v).trim();
  if(s === "") return null;
  var n = Number(s);
  if(typeof n !== "number" || !isFinite(n)) return null;
  if(range && (n < range[0] || n > range[1])) return null;
  return n;
};
FH.sanitizePlace = function(p){
  if(!p || typeof p !== "object") return null;
  var name = String(p.name === null || p.name === undefined ? "" : p.name).trim().slice(0, FH.MAX_NAME);
  if(!name) return null;
  var out = { id: null, name: name, notes: String(p.notes === null || p.notes === undefined ? "" : p.notes).trim().slice(0, FH.MAX_NOTES), checks: {} };
  ["rent","deposit","lockin","commute","brokerage","feel"].forEach(function(f){ out[f] = FH.cleanNumber(p[f], FH.RANGES[f]); });
  if(p.checks && typeof p.checks === "object"){
    var vk = FH.validCheckKeys();
    for(var k in p.checks){
      if(Object.prototype.hasOwnProperty.call(p.checks, k) && vk[k] && p.checks[k] === true) out.checks[k] = true;
    }
  }
  return out;
};
FH.sanitizePlaces = function(list){
  var out = [], skipped = 0;
  for(var i = 0; i < list.length; i++){
    var p = FH.sanitizePlace(list[i]);
    if(p){ p.id = out.length + 1; out.push(p); } else { skipped++; }
  }
  return { places: out, skipped: skipped };
};

FH.cell = function(v, suffix){ return (v === null || v === undefined || isNaN(v)) ? "-" : (v + (suffix || "")); };

FH.checkedCount = function(place){
  var n = 0;
  if(place && place.checks){ for(var k in place.checks){ if(place.checks[k]) n++; } }
  return n;
};

FH.totalChecks = function(){
  var n = 0;
  FH.VISIT.forEach(function(sec){ n += sec[1].length; });
  return n;
};

FH.summary = function(places){
  var lines = ["Flat hunt comparison:"];
  var total = FH.totalChecks();
  places.forEach(function(p, i){
    var parts = [];
    if(p.rent != null) parts.push("rent Rs." + p.rent);
    if(p.deposit != null) parts.push("deposit " + p.deposit + "m");
    if(p.lockin != null) parts.push("lock-in " + p.lockin + "m");
    if(p.commute != null) parts.push("commute " + p.commute + " min");
    if(p.brokerage != null) parts.push("brokerage " + p.brokerage + "m");
    if(p.feel != null) parts.push("feel " + p.feel + "/10");
    var line = (i+1) + ". " + p.name + " - " + (parts.length ? parts.join(", ") : "no details yet");
    var done = FH.checkedCount(p);
    if(done > 0) line += " [visit checklist: " + done + " of " + total + " done]";
    lines.push(line);
    if(p.notes) lines.push("   notes: " + p.notes);
  });
  return lines.join("\n");
};

FH.encode = function(state){ return btoa(unescape(encodeURIComponent(JSON.stringify(state)))); };
FH.decode = function(txt){
  try {
    txt = String(txt).trim();
    if(!txt || txt.length > FH.MAX_IMPORT_CHARS) return null;
    var obj = JSON.parse(decodeURIComponent(escape(atob(txt))));
    if(!obj || !Array.isArray(obj.places)) return null;
    var res = FH.sanitizePlaces(obj.places);
    if(obj.places.length > 0 && res.places.length === 0) return null;
    return { places: res.places, skipped: res.skipped };
  } catch(e){ return null; }
};


module.exports=FH;
