# PWA App — GitHub Pages

A progressive web app with 3 pages, IndexedDB CRUD, and full offline caching.

## Pages
- `index.html`    — Dashboard (stats, cache info, recent records)
- `contacts.html` — Contacts CRUD (create, read, update, delete, search)
- `profile.html`  — Users CRUD (cards view with avatar colours)

## Deploy to GitHub Pages

### Step 1 — Create a GitHub repo
1. Go to github.com → New repository
2. Name it anything e.g. `pwa-app`
3. Set to **Public**

### Step 2 — Upload files
Option A (drag & drop):
- Open the repo → click "Add file" → "Upload files"
- Drag the entire contents of this folder
- Commit changes

Option B (Git):
```bash
git init
git add .
git commit -m "Initial PWA"
git remote add origin https://github.com/YOUR_USERNAME/pwa-app.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to repo **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` → folder: `/ (root)`
4. Click **Save**

Your site will be live at:
`https://YOUR_USERNAME.github.io/pwa-app/`

---

## Test Caching (Offline)

1. Open the site in Chrome
2. Open DevTools → Application → Service Workers → confirm registered
3. Go to Dashboard — check the "Cached Files" count
4. Toggle **Offline** in DevTools → Network tab
5. Refresh pages — they all still load from cache ✓

## IndexedDB

View stored data in DevTools:
- Application → IndexedDB → pwa_app_db
  - `contacts` store
  - `users` store

## File Structure
```
pwa-app/
├── index.html       ← Dashboard
├── contacts.html    ← Contacts CRUD
├── profile.html     ← Users CRUD
├── style.css        ← Shared styles
├── db.js            ← IndexedDB CRUD layer (shared)
├── sw.js            ← Service worker (caching)
├── manifest.json    ← PWA manifest
├── icons/           ← App icons
└── README.md
```
