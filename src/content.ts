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
