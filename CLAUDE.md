# CLAUDE.md — NATY

Panduan kerja untuk Claude Code di repositori portfolio NATY.
Dokumen ini adalah sumber kebenaran untuk fitur baru. Kalau instruksi chat bertentangan dengan dokumen ini, tanya dulu sebelum eksekusi.

Baca juga `Info.md` di repo ini untuk peta codebase yang sudah ada.

---

## 1. Yang sudah ada (jangan dirusak)

Repo ini **bukan proyek kosong**. Sudah berjalan:

- Next.js 14.2 App Router + React 18 + TypeScript, source di `src/`
- Tailwind v3 dengan `@layer components` di `src/styles/globals.css`
- Supabase (Postgres + `@supabase/supabase-js`), **tanpa Prisma, tanpa ORM**
- Halaman publik: `/`, `/works`, `/timeline`, `/contact` — semua Server Component dengan `revalidate = 60` dan fallback ke data statis di `src/lib/data.ts`
- Dashboard admin di `/dashboard` dengan `PasswordGate` (password tunggal lewat header `x-dashboard-password`)
- API routes di `src/app/api/*` memakai `getServiceSupabase()` (service-role, bypass RLS)
- Tabel eksisting: `members`, `projects`, `pricing`, `timeline`, `contact_submissions`
- Integrasi Groq untuk generate bio member dari GitHub

**Aturan keras:**

- Jangan ganti Supabase client ke Prisma atau ORM lain. Ikuti pola query yang sudah dipakai.
- Jangan ubah halaman publik yang sudah ada kecuali diminta.
- Jangan ubah skema tabel eksisting kecuali diminta eksplisit. Kalau butuh kolom baru di tabel lama, buat migrasi terpisah dan laporkan.
- Jangan hapus `src/lib/data.ts` atau mekanisme fallback-nya.
- Pertahankan gaya kode yang ada: mapping manual `snake_case` row ke `camelCase` display.

---

## 2. Yang mau dibangun

Dua hal, berurutan:

1. **Login dashboard pakai akun `@natynext.com`** menggantikan password tunggal.
2. **Pipeline klien**: submission dari form kontak diubah jadi klien dan proyek yang bisa dilacak, lengkap dengan papan kerja tim dan perhitungan pembagian hasil sesuai SOP NATY.

Sumber aturan bisnis: **SOP Operasional NATY v1.0**. Ringkasannya ada di bagian 6. Jangan mengarang aturan di luar itu.

---

## 3. Bentrokan penamaan (penting, baca dulu)

Tabel `projects` yang sudah ada adalah **etalase portfolio publik**, bukan pekerjaan klien berbayar.

Pekerjaan klien yang dibangun sekarang **wajib memakai nama tabel dan tipe berbeda**. Gunakan `engagements`, bukan `projects`.

| Konsep | Tabel | Sifat |
|---|---|---|
| Showcase portfolio | `projects` (sudah ada) | publik, dipajang di `/works` |
| Pekerjaan klien berbayar | `engagements` (baru) | internal, dilacak di dashboard |

Nanti boleh ada kolom `engagements.published_project_id` untuk menautkan pekerjaan yang sudah selesai ke entri portfolio. Satu arah, opsional.

---

## 4. Hal lain yang perlu dicek di awal

Sebelum mulai, verifikasi dan laporkan kalau ada yang tidak cocok:

- **Tidak ada folder migrasi SQL** di repo. Mulai sekarang **wajib ada**: buat `supabase/migrations/` dan simpan setiap perubahan skema sebagai file `.sql` bernomor urut. Skema di `Info.md` diturunkan dari tipe TypeScript, jadi **cross-check dulu ke Supabase** sebelum menulis migrasi yang menyentuh tabel lama.
- **Belum ada test suite.** Tambahkan Vitest. Minimal wajib ada test untuk logika pembagian hasil.
- **`Info.md` menyebut 5 anggota, SOP menyebut 7.** Jangan hardcode jumlah anggota di mana pun. Ambil dari tabel.
- **Deploy saat ini Docker/Dokploy di VPS.** Kalau VPS sedang tidak aktif, fitur tetap dikerjakan seperti biasa. Jangan mengubah `Dockerfile` atau konfigurasi deploy tanpa diminta.

---

## 5. Auth: dari password tunggal ke akun `@natynext.com`

### 5.1 Target

- Supabase Auth, **email + password** (bukan magic link).
- Hanya email berakhiran `@natynext.com` yang boleh masuk.
- Akun dibuat oleh admin, **public signup dimatikan**.
- Anggota berstatus `TIDAK_AKTIF` ditolak walaupun kredensial benar.
- Session lewat cookie, jadi refresh halaman tidak melempar user keluar (masalah `PasswordGate` sekarang).

### 5.2 Perubahan pada tabel `members`

Tambah kolom lewat migrasi, jangan bikin tabel anggota baru:

```
auth_user_id   uuid null unique   -- relasi ke auth.users
email          text null unique   -- wajib @natynext.com
access_role    text default 'MEMBER'  -- ADMIN | PM | MEMBER
status         text default 'AKTIF'   -- AKTIF | CUTI | TIDAK_AKTIF
```

Kolom lama (`name`, `short_name`, `role`, `bio`, dst) tetap. `role` yang lama adalah jabatan tampilan di situs publik, **jangan** dipakai untuk hak akses. Hak akses memakai `access_role`.

### 5.3 Migrasi bertahap (jangan bikin dashboard mati)

1. Bangun auth baru berdampingan dengan `PasswordGate`, jangan langsung dihapus.
2. Route API menerima **dua** cara autentikasi sementara: session Supabase, atau header `x-dashboard-password` yang lama.
3. Setelah semua anggota punya akun dan bisa login, baru hapus `PasswordGate` dan jalur header. Hapus ini **hanya kalau diminta eksplisit**.

### 5.4 Service role

Route API sekarang memakai service-role key yang bypass RLS. Untuk fitur baru:

- Tetap boleh memakai service role di server, **tapi setiap route wajib memeriksa session dan peran lebih dulu**. Service role tidak boleh jadi pengganti otorisasi.
- `SUPABASE_SERVICE_ROLE_KEY` tidak boleh menyentuh client component.

### 5.5 Matriks hak akses

| Aksi | ADMIN | PM | MEMBER |
|---|---|---|---|
| Kelola anggota, peran, status | ya | tidak | tidak |
| Kelola konten situs (projects, pricing, timeline) | ya | ya | tidak |
| Lihat & proses inquiry | ya | ya | tidak |
| Ubah fase engagement | ya | ya | tidak |
| Input scoping & poin | ya | ya | tidak |
| Terapkan penalti poin | ya | ya | tidak |
| Eksekusi payout | ya | tidak | tidak |
| Lihat payout | semua | semua | hanya miliknya |
| Update task & standup sendiri | ya | ya | ya |

---

## 6. Aturan bisnis dari SOP (wajib persis)

### 6.1 Level kompleksitas

| Level | Poin |
|---|---|
| 0 | 0 (lini tidak ada di proyek) |
| 1 | 1 |
| 2 | 2 |
| 3 | 4 |
| 4 | 7 |
| 5 | 10 |

Lini kerja: `BACKEND`, `FRONTEND`, `DESIGN`, `PM_QA`.

### 6.2 Rumus pembagian

```
finderFee     = 10% x nilaiEngagement
poolTim       = 90% x nilaiEngagement
bagianAnggota = (poinLini / totalPoin) x poolTim
```

Aturan turunan:

- Finder tetap dapat 10 persen walau ikut mengerjakan. Kalau ikut, dia dapat 10 persen **ditambah** porsinya dari pool.
- Klien datang sendiri tanpa finder: 10 persen masuk **kas NATY**.
- Satu orang dua lini: poin dijumlahkan.
- Dua orang satu lini: poin dibagi sesuai `share_percent`, total per lini wajib 100.
- PM boleh memotong poin sebuah lini maksimal 20 persen, wajib ada alasan tertulis.

### 6.3 Uang

- Semua nilai uang **integer rupiah**. Dilarang `float`.
- Bulatkan ke bawah per penerima, sisa pembulatan masuk kas NATY.
- Total seluruh payout wajib **persis sama** dengan nilai engagement. Ada unit test untuk ini.

### 6.4 Kode engagement

Format `NTY-<TAHUN>-<3 DIGIT>`, contoh `NTY-2026-014`. Urut per tahun.

Karena kode ini urut dan mudah ditebak, **URL portal klien tidak memakai kode ini**. Tambah kolom `public_slug` berisi string acak 12 karakter untuk URL publik. Kode tetap ditampilkan ke klien sebagai nomor referensi.

### 6.5 Delapan fase

```
LEAD_MASUK, KUALIFIKASI, SCOPING, PENAWARAN_KONTRAK,
KICKOFF, EKSEKUSI, QA_REVISI, SERAH_TERIMA
```

Gerbang yang wajib dipaksa sistem:

- Tidak bisa masuk `KICKOFF` sebelum `dp_received_at` terisi.
- Tidak bisa menutup `SERAH_TERIMA` sebelum `paid_off_at` terisi.
- Payout hanya bisa dieksekusi setelah `paid_off_at` terisi.
- Fase tidak boleh dilompati maju. Mundur boleh, tapi wajib tercatat di log.

---

## 7. Tabel baru

Semua tabel baru: `id uuid default gen_random_uuid()`, `created_at`, `updated_at`. Ikuti konvensi `snake_case` yang sudah dipakai.

**`engagements`** — `code` unik, `public_slug` unik, `client_name`, `client_contact`, `submission_id` (FK `contact_submissions`, nullable), `finder_id` (FK `members.id`, nullable = klien datang sendiri), `value` (bigint rupiah), `phase`, `revision_quota`, `revision_used`, `dp_received_at`, `paid_off_at`, `target_date`, `progress_percent` (0-100), `public_note` (teks singkat yang boleh dilihat klien), `published_project_id` (FK `projects.id`, nullable).

**`scope_items`** — `engagement_id`, `discipline`, `level` (0-5), `points`, `penalty_percent` (0-20, default 0), `penalty_reason`. Unik per (`engagement_id`, `discipline`).

**`assignments`** — `scope_item_id`, `member_id`, `share_percent` (default 100).

**`payouts`** — `engagement_id`, `member_id` (nullable kalau penerima kas), `type` (`FINDER_FEE` | `WORK_SHARE` | `KAS`), `amount` (bigint), `calculated_at`. Bersifat **snapshot**: tidak ikut berubah kalau scope diedit setelah payout dieksekusi.

**`sprints`** — `engagement_id`, `number`, `start_date`, `end_date`, `goal`.

**`tasks`** — `engagement_id`, `sprint_id` (nullable), `title`, `description`, `status` (`BACKLOG` | `DIKERJAKAN` | `DIREVIEW` | `SELESAI`), `assignee_id`, `discipline`, `sort_order`.

**`standups`** — `sprint_id`, `member_id`, `date`, `yesterday`, `today`, `blocker`. Unik per (`sprint_id`, `member_id`, `date`).

**`change_requests`** — `engagement_id`, `description`, `decision` (`GRATIS` | `BERBAYAR` | `FASE_2`), `extra_charge` (bigint default 0), `decided_by`, `decided_at`.

**`activity_logs`** — `engagement_id`, `actor_id`, `action`, `metadata` (jsonb). Catat perubahan fase, perubahan scope, dan eksekusi payout.

RLS aktif di semua tabel baru. Default deny, lalu buka sesuai matriks di 5.5.

---

## 8. Alur inquiry ke engagement

`contact_submissions` sudah menampung `name`, `email`, `company`, `service`, `budget`, `message`, `is_read`. Itu jadi pintu masuk lead.

Tambah kolom di `contact_submissions` lewat migrasi:

```
status         text default 'BARU'   -- BARU | DIKUALIFIKASI | DITUTUP | JADI_ENGAGEMENT
finder_id      bigint null           -- FK members.id
closed_reason  text null
```

**Aturan finder:**

- Kalau submission datang dari form publik tanpa referensi, `finder_id` tetap null sampai ada anggota yang mengklaimnya.
- Anggota mengklaim lewat tombol "Klaim lead" di dashboard. `finder_id` diisi dari **session user**, tidak boleh diketik manual.
- Klaim hanya bisa dilakukan sekali. Setelah terisi, hanya ADMIN yang boleh mengubah, dan wajib tercatat di `activity_logs`.
- Kalau lead tidak pernah diklaim sampai jadi engagement, `finder_id` engagement bernilai null dan 10 persen masuk kas.

Tombol "Jadikan engagement" membuat baris `engagements` baru, generate `code` dan `public_slug`, menyalin data klien, dan mengubah status submission jadi `JADI_ENGAGEMENT`.

---

## 9. Portal klien publik

Route: `/track/[slug]`, memakai `public_slug`. **Tanpa login.**

Boleh ditampilkan:

- Nama engagement dan nama klien
- Kode referensi (`NTY-2026-014`)
- Fase saat ini dengan label ramah, misal "Sedang dikerjakan", bukan `EKSEKUSI`
- Persentase progres
- Tanggal target berikutnya
- `public_note`
- Timeline 8 fase dengan penanda fase yang sudah lewat

**Dilarang muncul di mana pun, termasuk response API dan HTML source:**

- Nilai engagement, DP, pelunasan, harga apa pun
- Nama anggota tim atau siapa mengerjakan apa
- Poin kompleksitas, payout, pembagian uang
- Isi task, standup, blocker, catatan internal
- Data lead lain, kontak klien lain, daftar engagement lain

Implementasi:

- Buat tipe `PublicEngagementView` yang eksplisit. **Hanya tipe itu** yang boleh menyeberang ke client component.
- Query memilih kolom secara eksplisit. Dilarang `select('*')` di jalur ini.
- Slug tidak dikenal mengembalikan 404 biasa. Jangan membocorkan apakah slug pernah ada.
- Tambah rate limit sederhana di route ini.
- Wajib ada test yang memastikan tidak ada field terlarang di payload.

---

## 10. UI

Ikuti bahasa visual situs yang sudah ada: latar gelap, teks krem, aksen emas tipis, tipografi bersih, banyak ruang kosong. Pakai komponen dari `src/components/ui/` yang sudah ada sebelum bikin baru.

- Bahasa antarmuka: **Indonesia**, singkat dan langsung.
- Papan SCRUM 4 kolom. Kalau drag and drop menambah kompleksitas berlebih di iterasi pertama, cukup dropdown ubah status.
- Wajib responsif. Anggota akan update standup dari HP.
- Halaman dashboard baru masuk sebagai section tambahan mengikuti pola `DashboardClient.tsx` yang ada. `DashboardClient.tsx` sudah 1381 baris, **jangan ditambah terus**. Pecah section baru jadi komponen terpisah di `src/components/dashboard/`.

---

## 11. Milestone

Kerjakan berurutan. **Berhenti dan laporkan di akhir setiap milestone.**

**M1 — Fondasi migrasi.** Buat `supabase/migrations/`, tulis migrasi awal yang mencerminkan skema eksisting (hasil cross-check ke Supabase, bukan tebakan), setup Vitest.
Selesai kalau: migrasi bisa dijalankan di project Supabase baru dan menghasilkan skema yang sama.

**M2 — Auth.** Kolom baru di `members`, Supabase Auth, pembatasan domain, blokir `TIDAK_AKTIF`, middleware, helper peran, halaman kelola anggota untuk ADMIN. `PasswordGate` masih hidup berdampingan.
Selesai kalau: anggota bisa login dengan `@natynext.com`, session bertahan setelah refresh, email di luar domain ditolak, dan dashboard lama masih berfungsi.

**M3 — Lead.** Kolom baru di `contact_submissions`, tombol klaim lead, tombol jadikan engagement, generator `code` dan `public_slug`.
Selesai kalau: satu submission bisa diklaim lalu diubah jadi engagement dengan kode benar.

**M4 — Engagement.** Tabel `engagements`, halaman daftar dan detail, transisi fase dengan gerbang DP dan pelunasan, `activity_logs`.
Selesai kalau: fase tidak bisa dilompati dan gerbang DP benar-benar memblokir.

**M5 — Scoping dan payout.** `scope_items`, `assignments`, `payouts`, `src/lib/payout.ts` sebagai fungsi murni tanpa I/O, halaman scoping dan payout, snapshot payout.
Selesai kalau: studi kasus di bagian 12 menghasilkan angka persis sama dan seluruh unit test lolos.

**M6 — SCRUM.** `sprints`, `tasks`, `standups`, `change_requests`, papan 4 kolom, standup tertulis.
Selesai kalau: satu sprint bisa dibuat, task berpindah kolom, standup tersimpan per hari per anggota.

**M7 — Portal klien.** `/track/[slug]`, query kolom publik, test anti-kebocoran.
Selesai kalau: portal menampilkan progres dan tidak ada satu pun field terlarang di payload.

---

## 12. Studi kasus wajib untuk test payout

Diambil dari SOP. Harus lolos persis.

Input: nilai `8000000`, finder Justine tidak ikut mengerjakan, Frontend level 4 (7 poin), Design level 3 (4 poin), Backend level 2 (2 poin), PM & QA level 2 (2 poin). Total poin 15, pool `7200000`.

| Penerima | Jumlah |
|---|---|
| Frontend | 3.360.000 |
| Design | 1.920.000 |
| Backend | 960.000 |
| PM & QA | 960.000 |
| Justine (finder) | 800.000 |
| **Total** | **8.000.000** |

Test tambahan yang wajib ada: engagement tanpa finder (10 persen ke kas), satu orang dua lini, dua orang satu lini 60/40, penalti 20 persen, dan kasus yang menghasilkan sisa pembulatan.

---

## 13. Perintah

```bash
npm run dev
npm run lint
npm run build      # wajib lolos sebelum lapor selesai
npm run test       # tambahkan script ini di M1
```

Environment variables yang sudah ada: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `DASHBOARD_PASSWORD`, `GITHUB_TOKEN`.

Setiap variabel baru wajib ditambahkan ke `.env.example` dan dilaporkan.

---

## 14. Yang tidak boleh dilakukan

- Jangan menambah Prisma atau ORM lain.
- Jangan menamai tabel pekerjaan klien sebagai `projects`. Itu sudah dipakai portfolio.
- Jangan menghapus `PasswordGate` sebelum diminta eksplisit.
- Jangan memakai `float` untuk uang.
- Jangan `select('*')` di jalur portal publik.
- Jangan mengirim objek database utuh ke client component.
- Jangan mematikan RLS "supaya jalan dulu".
- Jangan mengeksekusi payout otomatis. Selalu butuh aksi eksplisit ADMIN.
- Jangan menumpuk kode baru di `DashboardClient.tsx`.
- Jangan menyentuh `Dockerfile` atau konfigurasi deploy tanpa diminta.
- Jangan mengubah skema tabel eksisting tanpa cross-check ke Supabase lebih dulu.

---

## 15. Format laporan tiap milestone

1. **Apa yang dibuat** — file baru dan file yang diubah
2. **Cara mengetes** — langkah konkret
3. **Konfigurasi manual** — env, setting Supabase, RLS policy yang perlu dijalankan
4. **Yang belum dikerjakan** dan alasannya
5. **Keputusan teknis** yang diambil kalau spesifikasi kurang jelas
