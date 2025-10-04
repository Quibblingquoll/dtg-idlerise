# Downtime Games – IdleRise • DTG (Starter)

A sleek, region-ready React + Tailwind **PWA** for downtime learning links.

## Quick start (no custom domain needed)

1. **Install Node LTS (>=18)**  
   - macOS: `brew install node` (or use nvm)  
   - Windows: download from https://nodejs.org (LTS)  
   - Linux: use your package manager or nvm

2. **Unzip this folder** and open a terminal inside it.

3. **Install deps**  
   ```bash
   npm install
   ```

4. **Run locally**  
   ```bash
   npm run dev
   ```  
   Then open the URL it prints (usually http://localhost:5173).

5. **Edit links**  
   - Global defaults live inside the app (fallback).  
   - For quick edits without redeploying, use `/public/content.global.json` and optional region overrides `/public/content.us.json`, `/public/content.uk.json`, `/public/content.in.json`, etc.  
   - The structure matches the `DEFAULT_CONTENT` in `src/App.jsx`.

6. **Build for production**  
   ```bash
   npm run build
   npm run preview
   ```

## Deploy (gets you a free temporary URL)

**Option A: Netlify (drag‑and‑drop)**  
1. Run `npm run build` – this creates a `dist/` folder.  
2. Go to https://app.netlify.com/drop and drop the `dist/` folder.  
3. Netlify gives you a live URL like `https://your-site.netlify.app`.

**Option B: Vercel (via CLI)**  
1. Install: `npm i -g vercel`.  
2. Run `npm run build`.  
3. Run `vercel deploy --prebuilt` and follow prompts.  
4. You’ll get a URL like `https://your-site.vercel.app`.

You can add a custom domain later in Netlify/Vercel settings and set up subdomains `k.`, `p.`, `h.` to point to the same app.

## PWA notes
- Manifest is at `public/manifest.webmanifest`.  
- Service worker is `public/sw.js` (very small cache‑first shell).  
- On iOS/Android, you can “Add to Home Screen” after first visit.

## App features
- **Level tabs:** Kindergarten / Primary / High School.  
- **Subjects:** Maths / Science / Geography / History.  
- **Search** filter.  
- **Region + language selectors:** add `?region=uk&lang=fr` to the URL or use the dropdowns.  
- **Ad‑free toggle:** `?adfree=1` or cookie `dtg_adfree=true`.  
- **Accessible:** keyboard focus rings, motion‑reduced friendly, safe‑area insets for iOS.

## File map
- `src/App.jsx` – main app (edit brand name, theme, UI).  
- `public/content.global.json` – optional link data file (global).  
- `public/content.{region}.json` – optional region overrides.  
- `public/manifest.webmanifest`, `public/sw.js` – PWA files.  
- `public/icons/` – app icons.

## When you get a domain
Create DNS records for `k`, `p`, and `h` that point to your host (Netlify/Vercel). All subdomains can use the same build; the app auto‑selects level from subdomain. (Users can still switch levels via tabs.)

## Troubleshooting
- **Blank page on old iPad:** update Safari/iOS. This app targets modern browsers.  
- **Links blocked at school:** toggle **Ad‑free** or replace external links with school‑approved ones.  
- **PWA not installing in dev:** service workers only fully work on production builds/HTTPS. Use `npm run build` + `npm run preview`.

MIT License.
