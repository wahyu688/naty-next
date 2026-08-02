# Info.md — NATY Portfolio (Codebase Reference)

> Dokumen ini ngejelasin state codebase saat ini secara detail: struktur project, alur data, dan skema database. Ditulis biar bisa jadi konteks kalau mau kasih task baru ke Claude tanpa perlu re-explain dari nol.

## 1. Apa ini

Portfolio Next.js untuk **NATY** — 5 mahasiswa CS Binus University. Isinya: landing page, halaman works (project showcase), timeline (riwayat aktivitas per anggota), contact form, dan **dashboard admin** privat buat CRUD semua konten tanpa perlu deploy ulang.

## 2. Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14.2 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS v3 + custom `@layer components` di `globals.css` |
| Animasi | Framer Motion, GSAP, Lenis (smooth scroll) |
| 3D | Three.js (`web-gl-shader.tsx`) |
| Database | Supabase (Postgres + JS client), dengan **fallback ke data statis** kalau Supabase gagal/kosong |
| AI | Groq SDK (`llama-3.3-70b-versatile`) buat generate bio member dari profil GitHub |
| Auth dashboard | Password tunggal via header, bukan sistem auth beneran (lihat §5) |
| Deploy | Docker / Dokploy (VPS), lihat `README.md` & `Dockerfile` |

## 3. Struktur project

```
src/
├── app/
│   ├── layout.tsx                 ← Root layout: fonts (Inter + Bricolage Grotesque), SmoothScroll, ClientLayout
│   ├── page.tsx                   ← Homepage — fetch members/projects/pricing dari Supabase (revalidate 60s)
│   ├── works/
│   │   ├── page.tsx               ← Server: fetch projects + members
│   │   └── WorksClient.tsx        ← Grid project + modal detail
│   ├── timeline/
│   │   ├── page.tsx               ← Server: fetch timeline + members
│   │   └── TimelineClient.tsx     ← Timeline interaktif + filter per tipe/member
│   ├── contact/
│   │   ├── page.tsx
│   │   └── ContactClient.tsx      ← Form kontak (submit ke /api/contact)
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── DashboardClient.tsx    ← Admin panel penuh (1381 baris) — lihat §5
│   └── api/                       ← Route handlers (lihat §6)
│       ├── members/route.ts
│       ├── projects/route.ts
│       ├── pricing/route.ts
│       ├── timeline/route.ts
│       ├── contact/route.ts
│       └── summarize/route.ts     ← AI bio generator (Groq + GitHub API)
├── components/
│   ├── layout/                    ← Navbar, Footer, ClientLayout
│   ├── providers/SmoothScroll.tsx ← Lenis wrapper
│   ├── sections/                  ← Section homepage: Hero, About, Team, Projects, Pricing, Skills, ContactCTA, HomeIntro
│   └── ui/                        ← Reusable: index.tsx (Reveal, Marquee, PageHero, FilterTabs, SectionHeader), ProjectModal, Select, BackToTop, icons, liquid-glass-button, VelocitySkew, web-gl-shader
├── lib/
│   ├── data.ts                    ← Data statis/fallback: MEMBERS, PROJECTS, TIMELINE, TEAM_COLORS (dipakai kalau Supabase kosong)
│   ├── supabase.ts                ← Supabase client + tipe row (MemberRow, ProjectRow, PricingRow, TimelineRow, ContactSubmission)
│   └── utils.ts
└── styles/globals.css
```

## 4. Alur data (penting!)

Setiap halaman publik (`/`, `/works`, `/timeline`) adalah **Server Component** yang:
1. Fetch dari Supabase pakai `Promise.allSettled(...)`.
2. Kalau fetch gagal / tabel kosong → **fallback ke data statis** di `src/lib/data.ts` (`MEMBERS`, `PROJECTS`, `TIMELINE`).
3. Hasilnya dipass ke Client Component (`*Client.tsx`) buat interaktivitas.
4. `revalidate = 60` — jadi perubahan lewat dashboard baru muncul di halaman publik maks. 60 detik kemudian (ISR).

Row dari Supabase (snake_case, mis. `short_name`, `gradient_from`) di-mapping manual ke tipe display (camelCase, mis. `shortName`, `gradientFrom`) di tiap `page.tsx`.

⚠️ Catatan: `src/lib/data.ts` masih berisi data **placeholder** untuk Member Two–Six (nama generik, link kosong) — kemungkinan besar konten real-nya sekarang sudah ada di tabel Supabase `members`, bukan di file ini lagi.

## 5. Dashboard admin (`/dashboard`)

- **Auth**: `PasswordGate` — input password dicek dengan hit `/api/members` pakai header `x-dashboard-password`, dibandingkan ke env `DASHBOARD_PASSWORD` di server. Tidak ada session/JWT/cookie — password dikirim ulang di header di setiap request selama sesi dashboard berjalan (disimpan di state React, hilang kalau refresh).
- **5 section**: `members`, `projects`, `pricing`, `timeline`, `inquiries` (contact submissions).
- CRUD penuh (Create/Read/Update/Delete) ke masing-masing tabel via API routes di §6.
- **Fitur AI Summarize**: di section members, ada tombol buat generate bio otomatis — input GitHub URL/username → server fetch profil + repo GitHub → kirim ke Groq (`llama-3.3-70b-versatile`) → hasil bio + suggested tags (bahasa pemrograman dari repo) bisa langsung di-apply ke member.

## 6. API Routes (`src/app/api/*/route.ts`)

Semua route pakai `getServiceSupabase()` (service-role key, bypass RLS) dan **kecuali `/api/contact` POST**, semua butuh header `x-dashboard-password` yang match `process.env.DASHBOARD_PASSWORD`.

| Route | Methods | Keterangan |
|---|---|---|
| `/api/members` | GET, PATCH | List & update member (tidak ada POST/DELETE — jumlah member fixed) |
| `/api/projects` | GET, POST, PATCH, DELETE | CRUD project |
| `/api/pricing` | GET, POST, PATCH, DELETE | CRUD paket harga |
| `/api/timeline` | GET, POST, PATCH, DELETE | CRUD entri timeline |
| `/api/contact` | POST (publik), GET/PATCH/DELETE (butuh password) | Submit form kontak publik; kelola submission di dashboard |
| `/api/summarize` | POST (butuh password) | GitHub → Groq AI → bio + tags |

Semua route pakai `export const dynamic = 'force-dynamic'` (no caching di level route).

## 7. Skema Database (Supabase / Postgres)

⚠️ Tidak ada file migration SQL di repo ini — skema di bawah **diturunkan dari TypeScript types** (`src/lib/supabase.ts`) dan cara kolom-kolomnya dipakai di API routes. Kalau mau task yang nyentuh struktur tabel, sebaiknya cross-check langsung ke Supabase dashboard/project untuk memastikan tipe kolom persis (nullable, default, dsb).

### `members`
| Kolom | Tipe (inferred) |
|---|---|
| id | number (PK) |
| name | string |
| short_name | string |
| role | string |
| bio | string |
| tags | string[] |
| github | string |
| linkedin | string |
| cv | string \| null |
| portfolio | string \| null |
| photo_url | string \| null |
| updated_at | timestamp |

### `projects`
| Kolom | Tipe |
|---|---|
| id | string (PK, slug) |
| name | string |
| type | string |
| categories | string[] (`web`\|`mobile`\|`ar`\|`data`\|`design`) |
| status | string (`live`\|`shipped`\|`wip`\|`portfolio`) |
| emoji | string |
| gradient_from, gradient_to | string (hex) |
| featured | boolean |
| members | number[] (FK ke `members.id`, array) |
| description | string |
| stack | string[] |
| overview, challenge, solution | string |
| year | string |
| role | string |
| link | string \| null |
| preview_url | string \| null |
| sort_order | number |
| created_at, updated_at | timestamp |

### `pricing`
| Kolom | Tipe |
|---|---|
| id | string (PK) |
| name | string |
| price | string |
| tagline | string |
| features | string[] |
| featured | boolean |
| sort_order | number |
| created_at, updated_at | timestamp |

### `timeline`
| Kolom | Tipe |
|---|---|
| id | string (PK) |
| year | string |
| month | string |
| type | string (`project`\|`award`\|`learning`\|`milestone`) |
| title | string |
| description | string |
| member_id | number (FK ke `members.id`, -1 = team-wide) |
| sort_order | number |
| created_at, updated_at | timestamp |

### `contact_submissions`
| Kolom | Tipe |
|---|---|
| id | string (PK, kemungkinan uuid) |
| name | string |
| email | string |
| message | string |
| service | string |
| budget | string |
| company | string |
| is_read | boolean |
| created_at | timestamp |

RLS: tabel ini punya policy yang mengizinkan `insert` tanpa auth (dipakai anon client dari form kontak publik), sedangkan read/update/delete lewat service-role key saja.

## 8. Environment Variables (`.env`)

| Var | Kegunaan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key — dipakai client publik (read-only + insert contact) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — dipakai semua API route dashboard (full access, bypass RLS) |
| `GROQ_API_KEY` | Buat fitur AI Summarize bio |
| `DASHBOARD_PASSWORD` | Password gerbang dashboard admin |
| `GITHUB_TOKEN` | Opsional — naikin rate limit GitHub API saat fetch profil/repo di `/api/summarize` |

## 9. Hal-hal yang perlu diperhatikan kalau nambah fitur baru

- **Auth dashboard lemah**: password polos dibandingkan string, dikirim di header setiap request, tanpa hashing/rate-limit/session. Kalau mau harden, ini titik pertama yang perlu disentuh.
- **`src/lib/data.ts` vs Supabase**: dua sumber data yang overlap. Kalau nambah field baru ke suatu entity, harus update di **tiga tempat**: tipe row (`supabase.ts`), tipe display (`data.ts`), dan mapping row→display di tiap `page.tsx`.
- **Tidak ada test suite** di repo ini (belum ada folder `__tests__`/`*.test.ts`).
- **Revalidate 60s (ISR)**: perubahan dari dashboard tidak instan muncul di halaman publik.
