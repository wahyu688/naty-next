# NATY — Design System

> This document is the single source of truth for the visual language of the NATY portfolio. Read this before touching any styles, adding components, or making layout decisions.

---

## Brand Identity

**NATY** stands for *Nusantara* — a multi-disciplinary creative tech collective. The visual language reflects:

- **Restraint** — Monochromatic palette; no loud colors
- **Precision** — Tight spacing, consistent rhythm
- **Premium** — Subtle texture, depth through surface layers, smooth motion
- **Digital-native** — WebGL shaders, pixel-art effects, velocity-reactive marquees

---

## Color System

All color tokens are defined in `tailwind.config.ts` under `theme.extend.colors`.

### Background Layers

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#0a0a0a` | Page root background |
| `surface` | `#151515` | Cards, panels |
| `surface2` | `#202020` | Elevated cards, hover states |

Stack them: `bg` → `surface` → `surface2`. Never skip a level.

### Text

| Token | Hex | Use |
|-------|-----|-----|
| `ink` | `#f5f5f5` | Primary text, headings |
| `violet-soft` | `#9e9e9e` | Body text, descriptions |
| `muted` | `#8e8e8e` | Tertiary labels, metadata |

### Accent Scale (all neutral grays — intentional)

| Token | Hex | Role |
|-------|-----|------|
| `violet` | `#ededed` | Primary accent — highlights, active states |
| `amber` | `#cacaca` | Secondary accent — skill bars variant |
| `teal` | `#b5b5b5` | Tertiary tags |
| `blue` | `#9a9a9a` | Quaternary detail |
| `red` | `#e0e0e0` | Lightest detail level |

> Note: The accent names (`violet`, `amber`, `teal`) are semantic roles, **not** actual colors. The palette is intentionally monochromatic.

### Borders

```css
border-DEFAULT  /* rgba(255,255,255,0.05) — standard card border */
border-strong   /* rgba(255,255,255,0.09) — hover/focus border */
```

Always use these token borders. Never write `border-white/5` manually — it'll diverge.

### Team Colors (per-member overrides)

Defined in `src/lib/data.ts` → `TEAM_COLORS`. Each member has:
- `accent` — hex color for their personal accent
- `glow` — lighter hex for glow effects
- `tint` — `[r, g, b]` array used in pixel-art photo rendering
- `label` — CSS color string

These are **only** used in `TeamSection`, timeline member indicators, and filter tabs. Don't bleed them into global UI.

---

## Typography

Fonts are loaded via `next/font/google` in `src/app/layout.tsx` and injected as CSS variables.

### Font Families

| Role | Font | CSS Variable | Tailwind |
|------|------|--------------|---------|
| Headings | Bricolage Grotesque | `--font-bricolage` | `font-display` |
| Body | Inter | `--font-inter` | `font-sans` |

### Type Scale

These are Tailwind utility classes — use them consistently:

| Role | Class | Notes |
|------|-------|-------|
| Page hero title | `.page-hero-title` | `clamp(3rem, 6vw, 6rem)`, display font |
| Section heading | `text-3xl md:text-4xl font-display` | Used in `SectionHeader` |
| Section label | `.section-label` | `11px`, uppercase, `tracking-[0.2em]`, `text-violet-soft` |
| Body | `text-base text-violet-soft` | Default paragraph |
| Small / meta | `text-sm text-muted` | Tags, timestamps, badges |

### Responsive Headlines

Use CSS `clamp()` for fluid type scaling — already done in `.page-hero-title`. For other large headings:

```css
font-size: clamp(2rem, 4vw, 4rem);
```

---

## Spacing & Layout

### Container

```html
<div class="max-w-[1100px] mx-auto px-6">
```

Use `max-w-[1100px]` for all page content. Never go wider.

### Section Vertical Rhythm

| Section type | Padding |
|-------------|---------|
| Full hero | `py-[120px]` to `py-[160px]` |
| Standard section | `py-[80px] md:py-[120px]` |
| Compact section | `py-[60px]` |

### Grid Patterns

- **Stats** — `grid-cols-2 md:grid-cols-4`
- **Projects** — Horizontal scroll snap, single card visible at medium width
- **Team** — Horizontal card slides with overflow-x-hidden
- **Timeline** — Single column with left border rail

---

## Components

### Buttons

Three variants defined in `globals.css`:

```html
<!-- Primary: filled, lifts on hover -->
<button class="btn-primary">View Work</button>

<!-- Ghost: border only, no fill -->
<button class="btn-ghost">Learn More</button>

<!-- Small: for inline/icon buttons -->
<button class="btn-sm">...</button>
```

Liquid glass variant lives in `src/components/ui/liquid-glass-button.tsx` (CVA-based). It has five sizes: `sm`, `default`, `lg`, `xl`, `xxl`. Use it for primary CTAs only.

### Cards

```html
<div class="card">...</div>
```

The `.card` class gives: `bg-surface`, border at `border-DEFAULT` opacity, `rounded-card` (16px), hover lift (`-translate-y-1`), and subtle glow.

### Tags & Pills

```html
<span class="tag">React</span>
<span class="tag-amber">Design</span>
<span class="tag-teal">Motion</span>
<span class="stack-pill">TypeScript</span>
```

- `.tag` — Default neutral pill
- `.tag-amber` / `.tag-teal` — Colored variants
- `.stack-pill` — Technology label, slightly different padding

### Section Labels

```html
<span class="section-label">About Us</span>
```

Always precedes a section heading. 11px, uppercase, wide letter-spacing.

### Outline Text

```html
<span class="outline-text">NATY</span>
```

Uses `-webkit-text-stroke`. For decorative large type only.

---

## Motion & Animation

### Scroll Reveal

Wrap any element in `<Reveal>` from `src/components/ui/index.tsx`:

```tsx
import { Reveal } from "@/components/ui";

<Reveal delay={0.1}>
  <p>This fades in on scroll</p>
</Reveal>
```

- Default: `opacity: 0 → 1` + `y: 20 → 0`
- `delay` prop staggers children
- Uses Framer Motion `useInView` with `once: true`

### Timing

| Element | Duration | Easing |
|---------|----------|--------|
| Reveal fade-in | 600ms | `[0.16, 1, 0.3, 1]` |
| Button hover | 200ms | ease |
| Card hover lift | 200ms | ease |
| Skill bar fill | 700ms | ease-out |
| Marquee | 22s | linear |

### Smooth Scroll

Lenis is initialized in `src/components/providers/SmoothScroll.tsx`:
- `lerp: 0.09` — smooth but responsive
- `wheelMultiplier: 1`
- `touchMultiplier: 1.5` — slightly faster on touch

Don't disable or override Lenis unless targeting a specific scrollable inner container.

### Custom Animations (Tailwind)

```html
<div class="animate-marquee">...</div>       <!-- 22s scroll loop -->
<div class="animate-pulse2">...</div>        <!-- 2s breathing pulse -->
<div class="animate-floathint">...</div>     <!-- 3s gentle float -->
```

---

## Page Structure Pattern

Every page follows this shell:

```tsx
// Server component (page.tsx)
export default function Page() {
  return <PageClient />;
}

// Client component (PageClient.tsx)
"use client";
export default function PageClient() {
  return (
    <main>
      <PageHero label="..." title="..." subtitle="..." />
      {/* sections */}
    </main>
  );
}
```

### PageHero

```tsx
import { PageHero } from "@/components/ui";

<PageHero
  label="Our Work"
  title="What We've Built"
  subtitle="A curated selection of projects across design, development, and motion."
/>
```

### SectionHeader

```tsx
import { SectionHeader } from "@/components/ui";

<SectionHeader
  label="Skills"
  title="What We Work With"
  subtitle="..."
/>
```

---

## Icons & Imagery

- No icon library — icons are inline SVG or emoji where appropriate
- Team photos are uploaded via the dashboard and processed as **pixel art** (8×8 block rendering with per-member tint) in `TeamSection`
- Project cards use a single **emoji** + gradient background instead of screenshots
- Logo is `public/logo.svg`

---

## What to Avoid

- No hard-coded hex colors outside of `tailwind.config.ts` or `data.ts`
- No `bg-white`, `text-black`, or any non-palette color
- No external color accents (blue buttons, green badges, etc.)
- No shadows other than the token glow shadows already defined
- No font sizes outside the scale — use `clamp()` if you need something in between
- No `overflow: hidden` on `<body>` — Lenis needs native scroll
- No inline `style={{ animation: ... }}` — use Tailwind animate classes
- No Framer Motion on elements that aren't inside `"use client"` files
