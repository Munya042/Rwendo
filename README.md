# Rwendo

**Rwendo: Placement Hours and Supervision** — a single-file progressive web app for
tracking placement, practicum and internship hours, with supervisor notes and
supervisor sign off built in.

Live at **https://munya042.github.io/rwendo/**

## The name

*Rwendo* (pronounced *rwen-doh*) is the Shona word for **a journey** — a trip, a
passage, the whole road travelled rather than any single step on it. A placement
is exactly that: hundreds of hours, dozens of shifts and a long run of
supervision sessions that only make sense added together. The app is named for
the journey, not the clock.

## What it does

For the student:

- Start/finish timer, plus manual entry of past shifts with unpaid breaks
- Supervision log with topics, reflection, actions agreed and sign off
- Weekly, monthly and total summaries, completion forecast and weekly pace
- Month calendar shaded by how long each day was, weekday pattern, milestones
- Hours tagged by activity, with a breakdown in the report
- CSV export, JSON backup/restore and a printable A4 report
- Light, dark and system themes with eight accents
- Works offline, installs to a phone home screen

For the supervisor:

- **Notes** on any shift, supervision session or whole week. Each note records the
  supervisor's name and the date, and shows up everywhere that item appears —
  the lists, the day panel, the report, the CSV and the backup.
- **Sign off** per shift and per whole week, recording the supervisor's name, the
  date and the hours approved. Signing off a week approves every shift in it that
  was still waiting; removing the week's sign off lifts exactly those again, and
  leaves shifts that were signed off individually alone.
- **Approved and pending totals** sit beside the usual totals on both the Today and
  Progress tabs, and the report sets approved hours against pending ones.
- **A signed-off shift is locked** — it cannot be edited or deleted until the
  supervisor removes the sign off.
- **A supervisor PIN** guards all of it. The supervisor sets it the first time they
  use it; notes, sign off and removing a sign off each ask for it.

### About the PIN

The PIN itself is never stored. On first use Rwendo generates a random salt,
hashes `salt + PIN` with SHA-256 (Web Crypto) and keeps only the salt and the
hash. Checking a PIN means hashing what was typed and comparing. That hash
travels with the record through backup and cloud sync, but cannot be turned back
into the PIN — so **a forgotten PIN cannot be recovered**, only replaced by
clearing the app's data. Five wrong attempts lock the pad for a minute.
Change the PIN in **Settings → Supervisor access** (the current PIN is required).

The PIN stops casual tampering on a shared device. It is not encryption: anyone
with access to the browser's storage can still read the records, exactly as they
could read a paper timesheet left on a desk.

## Completely separate from Placement Hours

Rwendo and [Placement Hours](https://github.com/Munya042/placement-hours-tracker)
are both served from `munya042.github.io`, so they share one browser origin and
therefore one `localStorage`. Rwendo is kept wholly apart from it:

| | Placement Hours | Rwendo |
|---|---|---|
| Storage prefix | `ph.v5.*` | `rwendo.v1.*` |
| Service worker cache | `placement-hours-v5-5` | `rwendo-v1-0-0` |
| Manifest id / scope | `/placement-hours/` | `/rwendo/` |
| Firebase project | `placement-hours-tracker` | yours, see below |

Every bucket, the theme, the accent, the open tab, the seen-accounts list and the
backup nudge use the `rwendo.v1` prefix. The legacy migration that imported the
old `placementTracker.*` keys has been **removed**, so Rwendo never reads or
writes another app's data. A student moving across does it explicitly, with
Backup / restore.

## No build step

Plain HTML, CSS and JavaScript. `index.html` is the whole app — open it in a
browser, or serve the folder:

```sh
python3 -m http.server 8777
```

Firebase is loaded from the CDN as an ES module, only when a config is present.

## Firebase setup

Out of the box the config in `index.html` is a placeholder, so Rwendo **runs
entirely on the device**: Google sign in is hidden, nothing is sent anywhere, and
there are no errors. To turn cloud sync on:

1. **Create the project** — [console.firebase.google.com](https://console.firebase.google.com)
   → *Add project*. Name it `rwendo` (the project id Firebase generates may be
   `rwendo-xxxxx`). Google Analytics is not needed.
2. **Add a web app** — in the project, *Add app* → *Web* (`</>`), nickname
   `Rwendo`. Skip Firebase Hosting. Firebase then shows a `firebaseConfig`
   object with six values.
3. **Paste the config** — open `index.html` and find the block marked
   `FIREBASE CONFIG — THE ONLY PLACE TO PASTE IT` (near the top of the
   `<script type="module">`, around line 1500). Replace the six
   `REPLACE_ME_*` values with the ones from the console. That is the only
   place in the codebase the config appears.
4. **Turn on Google sign-in** — *Authentication* → *Get started* → *Sign-in
   method* → *Google* → enable, set a support email, save.
5. **Authorise the domain** — *Authentication* → *Settings* → *Authorized
   domains* → add `munya042.github.io`. (`localhost` is there already.)
6. **Create the database** — *Firestore Database* → *Create database* →
   production mode → pick a region (`australia-southeast1` or
   `australia-southeast2` for NZ/AU).
7. **Publish the rules** — copy `firestore.rules` from this repo into
   *Firestore Database* → *Rules* → *Publish*. They allow a signed-in user to
   read and write only `users/{their own uid}`, and nothing else.
8. **Point the CLI at it** — set the project id in `.firebaserc` (currently
   `rwendo-app`) if you ever deploy or push rules with the Firebase CLI:
   `firebase deploy --only firestore:rules`.

Commit and push after step 3 and the live site picks it up. The web config is
public by design — it identifies the project, it does not grant access. The
Firestore rules are what keep one student's record private from another.

## Deployment

GitHub Pages, from `main`, via `.github/workflows/pages.yml`. Every push to
`main` publishes the repository root to https://munya042.github.io/rwendo/.

## Credits

Built by Munashe. Rwendo starts from Placement Hours v5.2 and adds the
supervision side of the journey.
