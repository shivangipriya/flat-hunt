# Flat Hunt

House-hunting in an Indian city means visiting five places in a weekend and remembering none of them clearly by Monday. Flat Hunt keeps the comparison in one page: add each place you visit, tick a checklist for that flat while you are standing in it, and copy a summary for the family group before you decide.

Open `index.html` in any browser. There is nothing to install and no account. Nothing is saved or sent anywhere unless you choose it - the page forgets everything when you close it unless you tick "remember in this browser" or copy an export text.

## What is inside

- **Compare places** - each place gets rent, deposit (months), lock-in, commute, brokerage and your gut feel, shown side by side in the order you added them. Blank fields show as "-" and are never assumed to be zero. The page does not rank places or pick a winner; the numbers are yours and the call is yours.
- **Visit checklist, per place** - 20 checks grouped into water & power, structure & damp, everyday living, money clarity, and area & access. Each flat keeps its own checklist, so findings from Tuesday's 1RK never leak into Friday's 2BHK. Built for ticking on your phone during the visit.
- **Before you pay** - the token-money and agreement questions renters wish they had asked, including the two scam shapes that come up again and again in Indian city rental groups: paying before visiting, and an "owner" who will not video-call from inside the flat.
- **Keep your list across visits** - tick "remember in this browser" (local storage on your device only, untick to erase) or copy an export text and paste it back on any device.

## Why it exists

Rental communities like r/bangalorerentals are full of the same stories: token money that never came back, deposits eaten by undefined "repainting" charges, water problems discovered after moving in. The knowledge to avoid all of it exists, scattered across hundreds of threads. This page puts that knowledge in the order you actually need it: while comparing, while visiting, and before paying.

Generic decision-matrix tools exist (for example rexakit.in and vscalculator.com); they make you invent the criteria yourself. This one ships with the criteria Indian renters actually fight about, plus the visit checklist and token-money questions in the same page. That is the difference.

## Where the checklist comes from

The checklist items are distilled from public renter-community threads, including:

- r/bangalorerentals, "Vet the owner and rental setup before you commit": https://www.reddit.com/r/bangalorerentals/comments/1vsyt9l/
- r/bangalore, "Red flags to look for while looking for pg like colive": https://www.reddit.com/r/bangalore/comments/ss2kvb/
- r/bangaloreflats, "A cheat sheet for reading Bangalore rental listings": https://www.reddit.com/r/bangaloreflats/comments/1u11wl8/
- r/bangalorerentals, "How to avoid PG horror stories": https://www.reddit.com/r/bangalorerentals/comments/1rgu2cz/
- r/bangalore, rental-scam patterns including token-money traps: https://www.reddit.com/r/bangalore/comments/135bmd1/

## Engineering notes

- One static file, no dependencies, no build step, no network calls. All data stays on the device.
- Every numeric field is range-checked on both entry paths (the form and import). On the form, an out-of-range value stops the save: the entry stays in the form with a visible warning, and nothing is stored until the value is fixed or cleared. On import, invalid entries are skipped and counted. Names and notes are length-capped.
- Imports are size-capped and re-sanitized on load: entries without a name are skipped and counted, checklist keys outside the known set are dropped, and ids are re-assigned so a hand-edited or corrupted export cannot break place selection.
- If the browser refuses local storage, the page says so instead of claiming it saved.
- If the clipboard API is blocked or does not answer, the page falls back to selecting the summary text for manual copying.
- User-entered text is HTML-escaped everywhere it is rendered, and the tests include an XSS-shaped import.
- Tabs, panels and the progress bar carry ARIA roles; keyboard focus is visibly outlined.
- Tests: `node fh-test.js` covers the pure logic, and a headless-Chrome driver exercises the real page end to end. A GitHub Actions workflow is included that runs the node suite on every push.

## Run the tests

```
node fh-test.js
```

## Maintainer

Maintained by Shivangi Priya.
