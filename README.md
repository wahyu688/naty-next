# NATY Portfolio — Next.js

> Five CS students from Binus University. Built with Next.js 14 + Tailwind CSS + Framer Motion.

## Stack

| Tech | Purpose |
|------|---------|
| Next.js 14 (App Router) | Framework, routing, SSR/SSG |
| TypeScript | Type safety |
| Tailwind CSS v3 | Styling |
| Framer Motion | Scroll animations, transitions |
| `next/font` | Space Grotesk + Inter (zero layout shift) |

## Project structure

```
src/
├── app/
│   ├── layout.tsx          ← Root layout (Navbar + Footer + fonts)
│   ├── page.tsx            ← Homepage (/ )
│   ├── timeline/
│   │   ├── page.tsx        ← Server component wrapper
│   │   └── TimelineClient.tsx ← Interactive timeline with filter
│   ├── works/
│   │   ├── page.tsx
│   │   └── WorksClient.tsx ← Projects grid + case study modal
│   └── contact/
│       ├── page.tsx
│       └── ContactClient.tsx ← Contact form + channels
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      ← Sticky nav with active link + scroll state
│   │   └── Footer.tsx
│   ├── sections/           ← Homepage sections (Hero, About, Team, Projects, Skills, CTA)
│   └── ui/
│       └── index.tsx       ← Reusable: Reveal, Marquee, PageHero, FilterTabs, SectionHeader
├── lib/
│   └── data.ts             ← ALL content: members, projects, timeline entries
└── styles/
    └── globals.css         ← Tailwind + custom @layer components
```

## Getting started

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Update content

All content lives in **`src/lib/data.ts`**. Edit:
- `MEMBERS` — team member names, roles, bios, colors, links
- `PROJECTS` — project cards, case studies, stack
- `TIMELINE` — milestone/project entries per year

## Build for production

```bash
npm run build
npm start
```

## Deploy to Dokploy (VPS)

### Option A — Docker (recommended)

```bash
# Build image
docker build -t naty-portfolio .

# Run
docker run -p 3000:3000 naty-portfolio
```

### Option B — Dokploy GitHub integration

1. Push this repo to GitHub
2. In Dokploy → New Application → GitHub repo → select branch
3. Build command: `npm run build`
4. Start command: `node .next/standalone/server.js`
5. Port: `3000`
6. Set env: `NODE_ENV=production`

### Option C — Nixpacks (Dokploy auto-detect)

Dokploy can auto-detect Next.js via Nixpacks. Just connect the repo and it handles the build.

### Nginx reverse proxy (if needed)

```nginx
server {
    listen 80;
    server_name naty.dev www.naty.dev;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Photo upload (team section)

Each member slide has a 📷 upload button. Click it → select a photo → the photo gets pixelated (8px blocks) in-browser and becomes the fullscreen background. Photos are not persisted — add server upload later if needed.

## Customizing member colors

In `src/lib/data.ts`, each member has a `color` from `TEAM_COLORS`:
```ts
{ accent: '#7c5cfc', glow: '#9b7dfd', tint: [124, 92, 252], label: 'violet' }
```
Change hex codes to update dot color, glow, particle color, and pixel tint for that member.
