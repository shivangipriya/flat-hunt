export const VISIT: [string,string[]][] = [
  ["Water & power", [
    "Turn on taps: pressure and hot water actually work",
    "Ask about water timing / tanker dependency in summer",
    "Power backup: what runs on it (lift? one plug point? whole flat?)",
    "Check the meter type: individual meter or split bill",
    "Bathroom: flush, drainage and geyser all work",
    "Electricals: switches, sockets, fans and lights all work"
  ]],
  ["Structure & damp", [
    "Look for damp patches, especially corners, ceilings, bathroom walls",
    "Open windows: ventilation and daylight in every room",
    "Check for pest signs under the sink and behind appliances",
    "Balcony / drying space for clothes"
  ]],
  ["Everyday living", [
    "Mobile signal in every room (make a call). Ask which broadband providers serve the building",
    "Noise: stand quietly for a minute - traffic, construction, function halls nearby",
    "Kitchen actually usable: gas pipeline or cylinder space, chimney/exhaust",
    "Storage and fittings: cupboards, loft, and what is included (fans, geyser, furniture)"
  ]],
  ["Money clarity", [
    "What rent includes: maintenance (how much a month), parking, water?",
    "Rent increase: how much after how long, in the agreement"
  ]],
  ["Area & access", [
    "Street lighting and the walk from the main road at night",
    "Door and window locks, and who controls entry to the building",
    "Guest, delivery, and vehicle-parking rules (ask the guard, not just the broker)",
    "Flood/waterlogging history of the street in monsoon"
  ]]
]
export const ASK = [
  "See the draft agreement before paying anything. Read the lock-in, the exit clause, the notice period on both sides, who repaints at exit, and the deduction list.",
  "Get the owner's full name and ID, and ask to see proof that they own the flat. If someone else is letting it, ask for the owner's written authorisation.",
  "Get a written receipt for any token, with the refund condition written on it.",
  "Ask whether police or tenant verification is needed where you are, and who arranges it.",
  "Confirm on a video call from inside the flat if you are dealing remotely. A broker who will not do this is a red flag.",
  "Ask why the previous tenant left, and how long the place was empty.",
  "Ask the security guard or a neighbour about power cuts and the owner - not only the person showing you the flat."
]
export const MOVEIN = [
  "Photograph every existing scratch, stain and fitting on move-in day and share the photos with the owner the same day."
]

// Stable ids, parallel to VISIT. Saved ticks use these, so reordering or rewording the list never moves a tick.
export const CHECK_IDS: string[][] = [
  ["taps","water-timing","power-backup","meter","bathroom","electricals"],
  ["damp","ventilation","pests","balcony"],
  ["signal-broadband","noise","kitchen","storage-fittings"],
  ["rent-includes","rent-increase"],
  ["street-lighting","locks-entry","guest-parking-rules","flood"]
]
// Ticks saved by the first version used "group-item" positions in the old list. Only checks whose meaning did not change are carried over.
// The old signal, storage and "what is included" checks now ask for more, and three old checks were removed, so those old ticks are dropped.
export const LEGACY_TICKS: Record<string,string|null> = {
  "0-0":"taps","0-1":"water-timing","0-2":"power-backup","0-3":"meter",
  "1-0":"damp","1-1":"ventilation","1-2":"pests","1-3":"balcony",
  "2-0":null,"2-1":"noise","2-2":"kitchen","2-3":null,
  "3-0":null,"3-1":null,"3-2":"rent-increase","3-3":null,
  "4-0":"street-lighting","4-1":null,"4-2":"guest-parking-rules","4-3":"flood"
}

// PG: its own 20 checks in five groups, with their own stable ids.
export const PG_VISIT: [string,string[]][] = [
  ["Room & bed", [
    "Bed, mattress and cupboard are in good shape. Ask who else sleeps in the room (the sharing type)",
    "Window, ventilation and daylight in the room you will actually get, not just the model room",
    "Fan, lights, sockets and AC (if promised) all work. Count the charging points per bed",
    "Room door lock, and a lockable cupboard or drawer for your things"
  ]],
  ["Bathroom & water", [
    "How many people share one bathroom? Check flush, drainage and hot water",
    "Bathrooms and common areas look clean right now, not only the room shown",
    "Water supply timing, and drinking water (RO or filter) available",
    "Look for damp patches and pest signs in the room and the common areas"
  ]],
  ["Food & kitchen", [
    "See the kitchen and taste a meal if you can. Note the hygiene",
    "Ask for the menu, meal timings and what happens if you skip a meal. Get it in writing",
    "Check that your diet is catered for (vegetarian, no onion-garlic, fasting days)",
    "Can residents use a fridge, kettle or kitchen, or is it not allowed?"
  ]],
  ["Safety & rules", [
    "Who controls entry: guard, CCTV or biometric? Who can walk in?",
    "Curfew, visitor and overnight guest rules. Ask for them in writing",
    "Fire exit and extinguisher visible. Is there a second way out?",
    "Street lighting and the walk from the main road at night"
  ]],
  ["Daily life & money", [
    "Wi-Fi works in your room (test a call or a speed test). Ask how many share it",
    "Power backup: does it cover your room's fan and lights?",
    "Laundry: machine, washerman or buckets only? Any extra charge?",
    "Extra charges in writing: electricity, AC, food, laundry. Also the notice period and when the deposit comes back"
  ]]
]
export const PG_CHECK_IDS: string[][] = [
  ["pg-bed","pg-ventilation","pg-electricals","pg-room-lock"],
  ["pg-bath-count","pg-bath-clean","pg-water","pg-damp"],
  ["pg-food-taste","pg-food-menu","pg-food-diet","pg-fridge"],
  ["pg-entry","pg-curfew","pg-fire","pg-night-walk"],
  ["pg-wifi","pg-backup","pg-laundry","pg-charges"]
]
// Short names, used only in the text a renter shares, so a flatmate or parent can see what was checked.
export const SHORT: Record<string,string> = {
  "taps":"taps and hot water","water-timing":"water timing","power-backup":"power backup","meter":"meter type","bathroom":"bathroom","electricals":"electricals",
  "damp":"damp","ventilation":"ventilation","pests":"pests","balcony":"balcony/drying space","signal-broadband":"signal and broadband","noise":"noise","kitchen":"kitchen","storage-fittings":"storage and fittings",
  "rent-includes":"what rent includes","rent-increase":"rent increase","street-lighting":"street lighting","locks-entry":"locks and entry","guest-parking-rules":"guest and parking rules","flood":"flooding history",
  "pg-bed":"bed and sharing","pg-ventilation":"room light and air","pg-electricals":"fan, lights and sockets","pg-room-lock":"room lock and cupboard",
  "pg-bath-count":"bathroom sharing","pg-bath-clean":"cleanliness","pg-water":"water and drinking water","pg-damp":"damp and pests",
  "pg-food-taste":"kitchen and a meal","pg-food-menu":"menu and timings","pg-food-diet":"diet fit","pg-fridge":"fridge and kitchen use",
  "pg-entry":"entry control","pg-curfew":"curfew and visitor rules","pg-fire":"fire exit","pg-night-walk":"street at night",
  "pg-wifi":"Wi-Fi","pg-backup":"power backup","pg-laundry":"laundry","pg-charges":"extra charges in writing"
}
