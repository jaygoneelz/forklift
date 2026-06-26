# Forklift — Play Store Deployment Guide

## What's in this package

| File | Purpose |
|------|---------|
| `forklift_v3.8.html` | The game (PWA-ready) |
| `manifest.json` | PWA manifest (name, icons, display mode) |
| `sw.js` | Service worker (offline caching) |
| `icon.svg` | App icon (vector, any size) |
| `icon-192.png` | Icon for PWA / Android |
| `icon-512.png` | Icon for Play Store listing |

---

## Step 1 — Host the game (free, 10 minutes)

You need HTTPS hosting. Easiest option: **GitHub Pages**

1. Create a GitHub account at github.com
2. Create a new repository: `forklift-game` (set to Public)
3. Upload all files in this package to the repository
4. Go to: Settings → Pages → Source: **Deploy from branch** → branch: `main`
5. Your game will be live at: `https://YOUR_USERNAME.github.io/forklift-game/forklift_v3.8.html`

**Test it:** Open that URL on your phone, tap Share → "Add to Home Screen". It should install like a native app.

---

## Step 2 — Generate the Android APK (free, 15 minutes)

Use **PWA Builder** — Microsoft's free tool that packages PWAs for Play Store.

1. Go to: **pwabuilder.com**
2. Enter your GitHub Pages URL
3. It will score your PWA (should score well since manifest + SW are set up)
4. Click **"Build My PWA"** → Select **Android**
5. Choose **"Trusted Web Activity (Recommended)"**
6. Fill in:
   - Package ID: `com.yourname.forklift` (e.g. `com.jay.forklift`)
   - App version: `1`
   - Version string: `1.0.0`
7. Download the generated ZIP — it contains a signed APK + Android Studio project

**Alternative:** Use **Bubblewrap CLI** (more control)
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR_URL/manifest.json
bubblewrap build
```

---

## Step 3 — Sign the APK

PWABuilder generates a debug APK. For Play Store you need a signed release APK/AAB.

1. In Android Studio: Build → Generate Signed Bundle/APK
2. Create a new keystore (save the password — you'll need it forever)
3. Build as **AAB (Android App Bundle)** — Play Store prefers this over APK

Or use the signing tool in PWABuilder (it signs for you).

---

## Step 4 — Google Play Console

1. Pay the $25 one-time developer fee at play.google.com/console
2. Create a new app → **Game** category
3. Upload your AAB
4. Fill in the store listing:

**App name:** Forklift

**Short description (80 chars):**
> The hunger is real. The food isn't.

**Full description:**
> Forklift is a food delivery idle game where you're always the customer.
> 
> Browse 28 restaurants across 4 unlockable tiers — from Street Food to Hidden Gems. Manage your wallet, earn through daily minigames, and track your order live on a real map. The food never arrives. The dopamine does.
> 
> • 28 restaurants across 4 arena tiers (Street Food → Neighbourhood → City Pick → Hidden Gems)
> • Real wallet economy — budget £30, earn through Food Quiz, Memory Match, Word Scramble and Higher or Lower
> • Live delivery tracking on OpenStreetMap
> • Cuisine mastery, loyalty stamps, flash deals, combo bonuses
> • Driver chat, scratch cards, blind box, prestige system
> • No ads. No in-app purchases. Just dopamine.

**Category:** Games → Simulation

**Content rating:** Fill in the questionnaire — answer No to everything. Rating will be PEGI 3 / Everyone.

**Privacy policy:** Required. Use a generator like privacypolicygenerator.info — say the app uses location (GPS) and stores data locally.

5. Add screenshots (take them on your phone from the GitHub Pages version)
6. Submit for review — typically 3–7 days

---

## Technical notes

- **Offline play:** The service worker caches all game assets. The game works offline except the live map (which degrades gracefully — delivery still completes, just no map tiles).
- **localStorage:** Game save data is stored in the browser's localStorage. In TWA mode this persists between sessions (same as a native app).
- **GPS:** The game requests location permission for the live map feature. Users can deny this — the game still works.
- **Haptics:** navigator.vibrate() works on Android Chrome / TWA.
- **Back button:** Wired to navigate back through game screens (store → browse, cart → store, etc.) instead of exiting.

---

## Optional: Custom domain

Instead of a GitHub Pages URL, you can use a custom domain (e.g. `forkl.it` or `playforklift.com`). This gives you a cleaner TWA URL. Set up DNS at your registrar to point to GitHub Pages, then configure the custom domain in repo Settings → Pages.

---

## Checklist before submission

- [ ] Game plays correctly on Chrome Android
- [ ] Add to Home Screen installs correctly
- [ ] All screenshots taken on a real Android phone
- [ ] Privacy policy URL is live
- [ ] Content rating questionnaire completed
- [ ] AAB signed with a keystore you've backed up
- [ ] Developer account verified with Google

