# Crafto VPN Control

A production-style desktop control surface for a VPN, operated by the **Crafto AI Agent** over a simulated **MCP** (Model Context Protocol) control plane.

> This is a front-end simulation. It never connects to a real VPN, server or API and it never touches your operating system or network configuration. All data, IP addresses (`198.51.100.0/24`, `203.0.113.0/24`) and tool results are fictional demo values.

---

## Features

- **VPN Dashboard** — live connection card, country flags, server, VPN IP, session duration, protocol, traffic monitor, statistics, 8 regions and working settings (protocol, Network Lock, Auto Connect, Split Tunneling).
- **AI Terminal** — a purpose-built agent console with streamed answers, grouped MCP tool calls, arguments/results, per-call execution time, progress indicators, command history and suggested commands.
- **One shared state** — an action in the terminal (or dashboard) instantly updates the other page, including location, flag, IP, latency, statistics and settings.
- **Dark & Light themes** — switch from the header; the choice is saved in `localStorage` and applied before first paint.
- **Fully static & responsive** — no backend, no runtime server, desktop-first with a mobile drawer layout.

## Tech stack

React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · Framer Motion · Lucide Icons

## Run locally

```bash
# 1. install dependencies
npm install

# 2. start the dev server
npm run dev

# 3. build the static output
npm run build

# 4. preview the production build
npm run preview
```

The production build is written to `dist/`. It is fully static: the JS/CSS bundle is inlined into a single HTML shell, so only `index.html`, `404.html` (SPA fallback) and `favicon.svg` are needed — no server runtime and no asset-path problems on sub-paths.

## Deploy to GitHub Pages

Deployment is automated with GitHub Actions (`.github/workflows/deploy.yml`). The workflow installs dependencies, calculates the correct base path, builds the project and publishes `dist/` through the official Pages actions.

### 1. Push the project to GitHub

```bash
git init
git add .
git commit -m "Crafto VPN Control"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

### 2. Enable Pages

Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.

That is the only required setting. No base path has to be committed: the workflow sets `VITE_BASE_PATH` automatically.

- Project page `https://<user>.github.io/<repo>/` → base becomes `/<repo>/`
- User/org page `https://<user>.github.io/` → base becomes `/`
- Custom domain → add a repository variable named `VITE_BASE_PATH` with value `/` (Settings → Secrets and variables → Actions → Variables).

### 3. Deploy

Every push to `main` (or a manual **Run workflow**) triggers the pipeline:

1. `npm ci`
2. compute `VITE_BASE_PATH`
3. `npm run build` with that base
4. validate `dist/index.html` and `dist/404.html`
5. upload and deploy to Pages

The site URL is shown in the workflow's `deploy` job and under **Settings → Pages**.

### Custom base path

The base is configurable without editing source files:

```bash
VITE_BASE_PATH=/my-repo/ npm run build
```

`vite.config.ts` reads `process.env.VITE_BASE_PATH` (default `/`), so the same commit works on localhost, a project page, a user page and a custom domain.

### Routing without 404 on GitHub Pages

GitHub Pages is a static host with no rewrite rules, so the app uses lightweight **hash routing**:

- `#/dashboard` — VPN Dashboard
- `#/terminal` — AI Terminal

Opening or refreshing either URL always loads the same static `index.html`, so there is never a 404 and no redirect hack is required. Sidebar navigation, browser back/forward and deep links all work. `public/404.html` is included as an extra safety net that sends any unknown path back to the app shell.

Assets, the favicon and the logo resolve relative to the configured base (verified under a `/crafto-vpn-control/` sub-path), and Google Fonts are loaded over HTTPS with system-font fallbacks.

## Project structure

```
.github/workflows/deploy.yml   GitHub Pages build & deploy
public/favicon.svg             Crafto brand icon
public/404.html                static fallback for unknown paths
src/components                 shell, dashboard, terminal, brand & flags
src/lib                        domain data, command parser, MCP engine
src/state                      shared application store
src/theme                      dark/light theme provider (localStorage)
```

## Supported agent commands

`connect VPN` · `connect to Germany` · `disconnect VPN` · `reconnect VPN` · `show connection status` · `change location to USA` · `list available locations` · `show my IP` · `get VPN IP` · `change protocol to WireGuard` · `enable network lock` · `disable auto connect` · `run speed test` · `check VPN connection` · `show VPN statistics` — plus natural-language variants such as “please switch to Japan”.

---

© Shahin Crafto — Crafto VPN Control
