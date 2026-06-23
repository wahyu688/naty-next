# CLAUDE.md — AI Context for NATY Next.js Project

This file gives AI coding assistants the full picture of this codebase so they can make correct, consistent contributions without needing to re-derive context.

---

## What This Project Is

**NATY** is a portfolio website for a multi-disciplinary creative tech collective called Nusantara. It showcases team members, past projects, a timeline of milestones, and provides a contact form. It is a **Next.js 14 App Router** project written in TypeScript, styled with Tailwind CSS, and deployed via Docker.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + custom `@layer components` in `globals.css` |
| Animation | Framer Motion (scroll reveals), GSAP, Lenis (smooth scroll) |
| 3D / WebGL | Three.js (`web-gl-shader.tsx`) |
| Backend | Supabase (team member photos stored in DB) |
| AI | OpenAI API (`/api/summarize` route) |
| Deployment | Docker (`output: standalone`) |

---

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    layout.tsx            # Root: fonts, Navbar, Footer, SmoothScroll provider
    page.tsx              # Homepage — composes all sections
    api/
      members/route.ts    # CRUD for team member photos (Supabase)
      summarize/route.ts  # OpenAI summarize endpoint
    timeline/             # page.tsx (server) + TimelineClient.tsx (client)
    works/                # page.tsx (server) + WorksClient.tsx (client)
    dashboard/            # page.tsx (server) + DashboardClient.tsx (client)
    contact/              # page.tsx (server) + ContactClient.tsx (client)
  components/
    layout/               # Navbar.tsx, Footer.tsx
    providers/            # SmoothScroll.tsx (Lenis)
    sections/             # One file per homepage section
    ui/
      index.tsx           # Reusable primitives: Reveal, Marquee, PageHero, SectionHeader, StackPills, FilterTabs
      liquid-glass-button.tsx   # CVA glass button component
      web-gl-shader.tsx         # Three.js background shader
  lib/
    data.ts               # ALL static content: MEMBERS, PROJECTS, TIMELINE, TEAM_COLORS
    supabase.ts           # Supabase client (public + service role)
    utils.ts              # cn() utility (clsx + tailwind-merge)
  styles/
    globals.css           # Global base styles + @layer components
```

---

## Key Conventions

### Client vs Server Components

- **Server components** (`page.tsx`) are thin wrappers — they only set metadata and render one client component.
- **Client components** (`*Client.tsx`) contain all interactivity, state, and animations.
- All Framer Motion, GSAP, and Lenis code must be inside `"use client"` files.

### Path Alias

```ts
import { cn } from "@/lib/utils";       // @ resolves to src/
import { Reveal } from "@/components/ui";
```

### Class Merging

Always use `cn()` for conditional Tailwind classes:

```ts
import { cn } from "@/lib/utils";
className={cn("base-class", condition && "conditional-class")}
```

### Content Edits

**All team/project/timeline content lives in `src/lib/data.ts`.** Do not hardcode content in components. If adding new projects or members, update `data.ts` only — the components read from it.

### Supabase

- Public client (`supabase`) — use for reads in client components
- Service role client (`getServiceSupabase()`) — use in API routes only, never client-side
- `MemberRow` type is defined in `supabase.ts`

---

## Design System (Summary)

Full details in `design.md`. Key points for AI:

- **Palette is intentionally monochromatic** — all "accents" (`violet`, `amber`, `teal`) are actually neutral grays. Do not introduce real color.
- **Backgrounds stack**: `bg` (#0a0a0a) → `surface` (#151515) → `surface2` (#202020)
- **Text**: `ink` (#f5f5f5) primary, `violet-soft` (#9e9e9e) secondary, `muted` (#8e8e8e) tertiary
- **Fonts**: `font-display` (Bricolage Grotesque) for headings, `font-sans` (Inter) for body
- **Borders**: use `border` (0.05 opacity) and `border-strong` (0.09 opacity) tokens only
- **Cards**: use `.card` class — never recreate from scratch
- **Buttons**: `.btn-primary`, `.btn-ghost`, `.btn-sm`, or `LiquidGlassButton` for CTAs

---

## Animation Patterns

### Scroll Reveal

```tsx
import { Reveal } from "@/components/ui";
<Reveal delay={0.1}><p>Fades in on scroll</p></Reveal>
```

### Smooth Scroll

Lenis runs globally in root mode. Do not add `overflow: hidden` to `<body>` or `<html>`. For inner-scrollable containers, configure Lenis separately.

### Motion Timing

- Reveals: 600ms, easing `[0.16, 1, 0.3, 1]`
- Hover transitions: 200ms ease
- Skill bars: 700ms ease-out

---

## API Routes

### `GET/POST /api/members`

- GET: fetches all team members with their `photo_url` from Supabase
- POST (with `multipart/form-data`): uploads a photo for a member; stores in Supabase storage + updates `member_photos` table

### `POST /api/summarize`

- Body: `{ text: string }`
- Calls OpenAI to summarize the provided text
- Returns `{ summary: string }`

---

## Common Tasks

### Add a new page

1. Create `src/app/<name>/page.tsx` (server, sets metadata)
2. Create `src/app/<name>/<Name>Client.tsx` (client, all UI)
3. Use `PageHero` at the top, wrap content in `<Reveal>` for scroll animation
4. Add nav link in `src/components/layout/Navbar.tsx`

### Add a new project

Edit `src/lib/data.ts` → `PROJECTS` array. Required fields: `id`, `name`, `type`, `categories`, `status`, `emoji`, `gradientFrom`, `gradientTo`, `members`, `desc`, `stack`, `year`, `role`.

### Add a new team member

Edit `src/lib/data.ts`:
1. Add a color entry to `TEAM_COLORS`
2. Add the member to `MEMBERS` referencing the color key

### Add a timeline entry

Edit `src/lib/data.ts` → `TIMELINE` array. `member: -1` means team-wide.

### Add a new UI component

- If it's a layout primitive → `src/components/ui/index.tsx`
- If it's a standalone complex component → new file in `src/components/ui/`
- Always export from `src/components/ui/index.tsx` if it will be used across pages

---

## What NOT to Do

- Don't add `"use client"` to files that don't need state or browser APIs
- Don't write inline `style={{ color: '#fff' }}` — use Tailwind tokens
- Don't add new dependencies without checking if the need is already covered (Framer Motion for animation, cn() for class merging, etc.)
- Don't put content (strings, data) inside component files — it goes in `data.ts`
- Don't create separate CSS files — extend `globals.css` `@layer components` instead
- Don't add `console.log` to production components

---

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

---

## Running the Project

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # Production build
npm start            # Serve production build
```

Docker:
```bash
docker build -t naty-next .
docker run -p 3000:3000 naty-next
```
