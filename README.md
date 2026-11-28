# Flat Hunt

The React and TypeScript source of the live Flat Hunt demo.

A mobile-first notebook for the flats you actually visit. Add places, compare rent, maintenance and terms, keep a separate 20-point visit checklist per place, and copy or share a summary for a flatmate. No listings, brokerage, authentication, backend or ranking algorithm.

**Try it:** https://flat-hunt.pages.dev/ - runs in your browser, no signup.

## Stack
TypeScript, React, Vite and Tailwind CSS. Tailwind is compiled locally; no runtime CDN. CSS is deliberately organized by feature and prefixed to avoid collisions. The app does not require a server beyond static file hosting.

## Run
`npm ci`, `npm run dev`, `npm run build`, `npm test`.

`npm run build` typechecks and writes `dist/`. For Cloudflare Pages use `npm run build` and output directory `dist`. The live site is a Cloudflare Pages direct upload of this build.

## Architecture
- `src/model.ts`: typed sanitization, numeric validation, per-place checks, compatible import/export and summary.
- `src/content.ts`: visit prompts, pre-payment questions, move-in prompt, stable check ids and the legacy tick map.
- `src/App.tsx`: React interface, state transitions and explicit storage/copy boundaries.
- `src/style.css`: responsive visual system, mobile-first composition, keyboard focus and reduced motion.
- `reference/`: known-good V2 and its test suite, preserved for behavioral comparison.
- `tests/model.test.ts`: 118 assertions including V2 parity, malicious/invalid input and saved-tick migration.
- `tests/browser.mjs`: 25 actual Chrome interaction checks. Install Playwright locally to run it. Uses a local static server and Chrome, no hosted account.
- `tests/bundle.mjs`: 68 checks at 390px for maintenance, monthly cost, share/copy, the checklist text and saved-tick migration. Run it with Playwright and Chrome after `npm run build`; CI does not run it.
- `tests/clear-save.mjs`: adds flats with maintenance, edits, clears it and saves, repeated, then saves in the browser and reloads. Prints the rendered cards, form state, stored list and HTTP errors if anything fails. `FH_URL` and `ROUNDS` env vars choose the site and rounds.
- `tests/focus.mjs`: 20 rounds of opening Edit and typing straight away; checks the entry stays in its own field and the invalid-maintenance message shows. Guards against delayed focus moves stealing typing. It can miss the fault on some rounds, so a pass is evidence, not proof.
- `tests/hunt.mjs`: 42 checks on a hunt at 390x844 and 360x640: Enter-to-add, the new card scrolled into view and focused, PG questions before deposit, the at-a-glance list, checks on screen after opening the visit tab, a note written on the visit tab, tapping check text, edit keeping ticks and notes.
- `tests/pg.mjs`: 42 checks at 390px for the PG variant: add a PG, its 20-check visit list, readable share text, deposit in rupees, saved gut feel, pinned progress bar, edit, reload, and a flat beside it. Same run method as bundle.mjs.

## Data and privacy
By default renter input exists only in memory. Opt-in saving uses localStorage key `flathunt-v2`; unticking removes that saved copy. Existing V2 saved lists/imports are sanitized on load. Visit ticks are stored under stable check ids. Ticks saved under the earlier position-based keys are carried over only where the check still means the same thing; ticks on checks that were reworded to ask for more or removed (6 old checks) are cleared, and the page says how many, for saved data and for pasted exports alike. Browser storage can be blocked or cleared and does not sync. The app makes no application network requests, uses no analytics or external fonts, and has no backend. Hosting providers still receive request metadata. Copying is explicit and under the renter's control. "Copy my list as text" and "Copy comparison" give readable text only. "Backup and restore" is a separate, collapsed section: "Copy backup code" gives a labelled code (base64 JSON, not encryption) that Restore accepts, as do older exports and older full copy messages. The page shows whether the list is only on the page or saved in this browser, and warns before it can be lost. Do not put secrets or identity documents in notes.

Private review adapter disables device saving because the review viewer does not expose ordinary browser storage. It uses an explicit copy control compatible with the viewer. The actual standalone app's storage opt-in/out, corruption and blocked-save behavior were tested separately in Chrome. Do not present the private review as the deployed Cloudflare website.

## Product decisions
A place can be a flat or a PG. A PG adds sharing, meals, electricity, Wi-Fi and laundry (each: not asked, included, costs extra, not available), house rules, and its own 20-point visit list. For a PG the maintenance field means extra monthly charges. Not asked, included and an explicit 0 stay different. Brokerage that was not entered is not counted for a PG: the cash line is then labelled a known subtotal. If a PG service costs extra or was never asked about, the monthly figure is labelled a known subtotal and the text names what is unconfirmed. Only when all four services are answered (each included or not available) is it a monthly total. Deposit can be entered in months or in rupees (not both); existing month data is kept as is. Not tested on real phones or with a screen reader.

Blank numbers are unknown, never zero. Maintenance is optional; monthly cost is shown only when it is entered. Cash to move in is first month's rent + deposit + brokerage and excludes maintenance and moving costs. No automatic winner or invented weights. Deposit and brokerage are in months of rent. Example places are labelled fictional. Deleting a place provides an undo. Import warns it replaces the current list. No addresses or documents required. Need is a hypothesis informed by renter-community anecdotes, not validated adoption or demand.

## Review and launch
Review the new version privately first. Public source replacement and Cloudflare deployment require approval of the reviewed version. After deployment, verify the real public link, HTTPS, mobile interactions, save behavior and request privacy again. No payment, domain purchase, paid service or usage-billed backend is required for this build.
