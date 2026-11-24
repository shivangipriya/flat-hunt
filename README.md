# Flat Hunt

The React and TypeScript source of the live Flat Hunt demo.

A mobile-first notebook for the flats you actually visit. Add places, compare rent and terms, keep a separate 20-point visit checklist per place, and copy a summary for a flatmate. No listings, brokerage, authentication, backend or ranking algorithm.

**Try it:** https://flat-hunt.pages.dev/ - runs in your browser, no signup.

## Stack
TypeScript, React, Vite and Tailwind CSS. Tailwind is compiled locally; no runtime CDN. CSS is deliberately organized by feature and prefixed to avoid collisions. The app does not require a server beyond static file hosting.

## Run
`npm ci`, `npm run dev`, `npm run build`, `npm test`.

`npm run build` typechecks and writes `dist/`. For Cloudflare Pages use `npm run build` and output directory `dist`. No deployment has been made yet.

## Architecture
- `src/model.ts`: typed sanitization, numeric validation, per-place checks, compatible import/export and summary.
- `src/content.ts`: visit prompts and pre-payment questions preserved from V2.
- `src/App.tsx`: React interface, state transitions and explicit storage/copy boundaries.
- `src/style.css`: responsive visual system, mobile-first composition, keyboard focus and reduced motion.
- `reference/`: known-good V2 and its test suite, preserved for behavioral comparison.
- `tests/model.test.ts`: 99 assertions including V2 parity and malicious/invalid input.
- `tests/browser.mjs`: 25 actual Chrome interaction checks. Install Playwright locally to run it. Uses a local static server and Chrome, no hosted account.

## Data and privacy
By default renter input exists only in memory. Opt-in saving uses localStorage key `flathunt-v2`; unticking removes that saved copy. Existing V2 saved lists/imports are sanitized on load. Browser storage can be blocked or cleared and does not sync. The app makes no application network requests, uses no analytics or external fonts, and has no backend. Hosting providers still receive request metadata. Copy/export is explicit and under the renter's control. Export is base64 JSON, not encryption; do not put secrets or identity documents in it.

Private review adapter disables device saving because the review viewer does not expose ordinary browser storage. It uses an explicit copy control compatible with the viewer. The actual standalone app's storage opt-in/out, corruption and blocked-save behavior were tested separately in Chrome. Do not present the private review as the deployed Cloudflare website.

## Product decisions
Blank numbers are unknown, never zero. No automatic winner or invented weights. Deposit and brokerage are in months of rent. Example places are labelled fictional. Deleting a place provides an undo. Import warns it replaces the current list. No addresses or documents required. Need is a hypothesis informed by renter-community anecdotes, not validated adoption or demand.

## Review and launch
Review the new version privately first. Public source replacement and Cloudflare deployment require approval of the reviewed version. After deployment, verify the real public link, HTTPS, mobile interactions, save behavior and request privacy again. No payment, domain purchase, paid service or usage-billed backend is required for this build.
