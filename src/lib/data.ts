// ═══════════════════════════════════════════
// NATY — Central data store
// Edit this file to update all pages at once
// ═══════════════════════════════════════════

// Grayscale modern — monochrome ramp (per-member tone variation)
export const TEAM_COLORS = [
  { accent: '#f5f5f5', glow: '#ffffff', tint: [245, 245, 245], label: 'gray-100' },
  { accent: '#cfcfcf', glow: '#e6e6e6', tint: [207, 207, 207], label: 'gray-300' },
  { accent: '#a8a8a8', glow: '#c4c4c4', tint: [168, 168, 168], label: 'gray-400' },
  { accent: '#888888', glow: '#a6a6a6', tint: [136, 136, 136], label: 'gray-500' },
  { accent: '#dcdcdc', glow: '#f0f0f0', tint: [220, 220, 220], label: 'gray-200' },
  { accent: '#707070', glow: '#999999', tint: [112, 112, 112], label: 'gray-600' },
]

export type Member = {
  id: number
  initials: string
  name: string
  shortName: string
  role: string
  bio: string
  tags: string[]
  github: string
  linkedin: string
  photo_url: string | null
  color: (typeof TEAM_COLORS)[number]
}

export const MEMBERS: Member[] = [
  {
    id: 0,
    initials: 'BN',
    name: 'Gede Bhoja Naradhipa',
    shortName: 'Bhoja',
    role: 'UI/UX Design · Frontend · AR/XR',
    bio: 'Leads the visual layer. From Figma wireframes to Vue/React components to Unity AR — bridges design and engineering. Specializing in Multimedia at Binus, 3.17 GPA.',
    tags: ['Figma', 'Vue 3', 'React', 'Unity', 'Tailwind', 'After Effects'],
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/in/',
    photo_url: null,
    color: TEAM_COLORS[0],
  },
  {
    id: 1,
    initials: 'M2',
    name: 'Member Two',
    shortName: 'Member 2',
    role: 'Backend · Database Architecture',
    bio: 'Owns the server side. Designs schemas, APIs, and the plumbing that keeps everything running. The team\'s go-to when something breaks at 2 AM.',
    tags: ['Node.js', 'Supabase', 'PostgreSQL', 'REST API'],
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/in/',
    photo_url: null,
    color: TEAM_COLORS[1],
  },
  {
    id: 2,
    initials: 'M3',
    name: 'Member Three',
    shortName: 'Member 3',
    role: 'Machine Learning · Data Engineering',
    bio: 'Turns raw data into insight. From ETL pipelines to Random Forest models, handles the analytical layer that makes products smarter.',
    tags: ['Python', 'Power BI', 'Pentaho', 'Scikit-learn'],
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/in/',
    photo_url: null,
    color: TEAM_COLORS[2],
  },
  {
    id: 3,
    initials: 'M4',
    name: 'Member Four',
    shortName: 'Member 4',
    role: 'Mobile Development · Android',
    bio: 'Builds the native experience. Comfortable with Material 3 and Jetpack, focused on apps that feel right in the hand.',
    tags: ['Kotlin', 'Java', 'Material 3', 'Jetpack'],
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/in/',
    photo_url: null,
    color: TEAM_COLORS[3],
  },
  {
    id: 4,
    initials: 'M5',
    name: 'Member Five',
    shortName: 'Member 5',
    role: 'Graphic Design · Video Production',
    bio: 'Shapes the visual identity. Handles motion graphics, brand assets, and video — makes the team look good before the code ships.',
    tags: ['Premiere Pro', 'After Effects', 'Photoshop', 'Illustrator'],
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/in/',
    photo_url: null,
    color: TEAM_COLORS[4],
  },
  {
    id: 5,
    initials: 'M6',
    name: 'Member Six',
    shortName: 'Member 6',
    role: 'DevOps · Cloud Architecture · Security',
    bio: 'Automates deployments and secures the infrastructure. Configures CI/CD pipelines, Docker containers, and manages cloud services so that the software stays resilient and scaling is seamless.',
    tags: ['Docker', 'AWS', 'GitHub Actions', 'CI/CD', 'Linux', 'Nginx'],
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/in/',
    photo_url: null,
    color: TEAM_COLORS[5],
  },
]

export type ProjectCategory = 'web' | 'mobile' | 'ar' | 'data' | 'design'
export type ProjectStatus = 'live' | 'shipped' | 'wip' | 'portfolio'

export interface Project {
  id: string
  name: string
  type: string
  categories: ProjectCategory[]
  status: ProjectStatus
  emoji: string
  gradientFrom: string
  gradientTo: string
  featured?: boolean
  members: number[]
  desc: string
  stack: string[]
  overview: string
  challenge: string
  solution: string
  year: string
  role: string
  link?: string
  preview_url?: string | null
}

export const PROJECTS: Project[] = [
  {
    id: 'secondspace',
    name: 'SecondSpace',
    type: 'Marketplace · Full-stack',
    categories: ['web'],
    status: 'shipped',
    emoji: '👗',
    gradientFrom: '#161616',
    gradientTo: '#272727',
    featured: true,
    members: [0, 1],
    desc: 'Neo-brutalist thrift & preloved marketplace. Full design system from scratch — Figma tokens to Vercel deployment. Led ~60% of full-stack work plus academic pitch deck.',
    stack: ['Vue 3', 'Vite', 'Tailwind v4', 'Pinia', 'Supabase', 'Vercel'],
    overview: 'A neo-brutalist thrift and preloved marketplace built entirely from scratch — from Figma design tokens to Vercel production. Bhoja led ~60% of full-stack work covering design system, frontend, Supabase integration, and pitch deck.',
    challenge: 'Building a cohesive design system while shipping features on a tight academic deadline. Tailwind v4 had breaking changes mid-project requiring a config rewrite.',
    solution: 'Defined design tokens first before writing any component. Used Pinia for reactive cart/auth state, Supabase RLS for user data isolation, and Vercel preview deployments.',
    year: '2025',
    role: 'UI/UX Design · Frontend Lead · Supabase Integration',
  },
  {
    id: 'geolapak',
    name: 'GeoLapak',
    type: 'Location Intelligence',
    categories: ['web', 'data'],
    status: 'portfolio',
    emoji: '📍',
    gradientFrom: '#131313',
    gradientTo: '#212121',
    members: [0],
    desc: 'Location analytics for pre-launch UMKM owners. Maps API + BPS open data to find optimal business spots across Indonesia.',
    stack: ['React', 'Google Maps API', 'BPS Data', 'Tailwind CSS'],
    overview: 'Location analytics platform for pre-launch UMKM owners. Combines Maps API with BPS open data to surface foot traffic, demographic density, and competitor proximity.',
    challenge: 'Originally for BuildLocal hackathon but pivoted to portfolio after concept didn\'t fit sub-themes. Design system was fully developed before the pivot.',
    solution: 'Maps rendering optimized for mobile with cluster markers and lazy-loading BPS census overlays.',
    year: '2024',
    role: 'Concept · Naming · Design System · Frontend',
  },
  {
    id: 'chimatcha',
    name: 'Chi Matcha',
    type: 'Mobile App · Android',
    categories: ['mobile', 'design'],
    status: 'shipped',
    emoji: '🥤',
    gradientFrom: '#181818',
    gradientTo: '#252525',
    members: [0, 3],
    desc: 'Material 3 Android app for a matcha café. Full design system in Figma — Fraunces + DM Sans, matcha palette. Shipped in Java + XML.',
    stack: ['Android', 'Java', 'XML Layouts', 'Material 3', 'Figma'],
    overview: 'Material 3 Android application for a matcha café concept. Full design system — typeface to interactive states — shipped as a working Android APK.',
    challenge: 'Android Studio setup issues, Gradle version conflicts, and Xiaomi-specific USB debugging blocking device testing.',
    solution: 'Fraunces + DM Sans for editorial warmth. Pinned Gradle dependency versions. Resolved Xiaomi USB debugging via hidden developer options.',
    year: '2025',
    role: 'UI/UX Design (Figma) · Android Development (Java)',
  },
  {
    id: 'gadgify',
    name: 'Gadgify',
    type: 'AR/XR · Unity',
    categories: ['ar'],
    status: 'shipped',
    emoji: '🔬',
    gradientFrom: '#121212',
    gradientTo: '#202020',
    members: [0],
    desc: 'Marker-based AR product showcase. Scan a card, get a 3D MacBook in your living room. Unity 6 + Vuforia, three scenes, Render Texture viewer.',
    stack: ['Unity 6', 'Vuforia Engine', 'C#', 'Android SDK'],
    overview: 'Marker-based AR product showcase in Unity 6 + Vuforia targeting Android. Scan a physical card to spawn an interactive 3D product model.',
    challenge: 'Touch input not registering — Unity Active Input Handling was set to "Input Manager" only. Render Texture viewer had camera layer bleed-through.',
    solution: 'Switched Active Input Handling to "Both". Assigned Render Texture its own camera layer with correct culling masks. Three-scene architecture used additive loading.',
    year: '2025',
    role: 'Full development — Unity, Vuforia, Android build',
  },
  {
    id: 'spojedy',
    name: 'SpoJeDy',
    type: 'Web App · Music',
    categories: ['web'],
    status: 'shipped',
    emoji: '🎵',
    gradientFrom: '#151515',
    gradientTo: '#232323',
    members: [0, 1],
    desc: 'Collaborative music streaming app. Pinia state management, TypeScript, resolved complex Git merge conflicts between feature branches.',
    stack: ['Vue 3', 'TypeScript', 'Pinia', 'Bootstrap', 'Vite'],
    overview: 'Collaborative music streaming app with Pinia-based state management for complex player state — queue, playback, shuffle — shared across components.',
    challenge: 'Major Git merge conflict between feat/shortcuts branch and a Pinia-refactored main, touching 40+ files with overlapping changes.',
    solution: 'Treated Pinia stores as source of truth and rebased shortcuts branch on refactored state. Bootstrap audited against two-template course constraint.',
    year: '2024',
    role: 'Frontend Architecture · State Management · Git',
  },
  {
    id: 'restmaterial',
    name: 'RESTMATERIAL',
    type: 'Sustainability · Platform',
    categories: ['web', 'design'],
    status: 'live',
    emoji: '♻️',
    gradientFrom: '#171717',
    gradientTo: '#242424',
    members: [0, 4],
    desc: 'Surplus construction materials marketplace with CO2 tracking. Built for I/O Festival 2026. UI design, voiceover, and frontend API integration.',
    stack: ['React', 'REST API', 'Figma', 'Repomix'],
    overview: 'Surplus construction materials marketplace with integrated CO2 tracking built for I/O Festival 2026. Connects contractors with leftover materials to buyers.',
    challenge: 'Tight festival deadline with large scope: UI design, listings, chat, CO2 tracking, and category filters all needed to ship.',
    solution: 'Extracted design tokens via Repomix from existing codebase. Frontend API used promise chaining for sequential fetches. Voiceover written in Indonesian with delivery guidance.',
    year: '2025',
    role: 'UI Design · Frontend API Integration · Voiceover Script',
  },
]

export type TimelineType = 'project' | 'award' | 'learning' | 'milestone'

export interface TimelineEntry {
  id: string
  year: string
  month: string
  type: TimelineType
  title: string
  desc: string
  member: number  // 0-5, -1 for team-wide
}

export const TIMELINE: TimelineEntry[] = [
  { id: 't1',  year: '2025', month: 'Jun 2025', type: 'project',   member: 0, title: 'RESTMATERIAL — I/O Festival 2026', desc: 'Contributed to a surplus construction materials marketplace with CO2 tracking. Led UI design, wrote voiceover script, and integrated frontend API endpoints.' },
  { id: 't2',  year: '2025', month: 'May 2025', type: 'project',   member: 0, title: 'Gadgify — Marker-based AR Showcase', desc: 'Built a Unity 6 + Vuforia AR app for Android. Three scenes, MacBook 3D model, Render Texture viewer, touch input via Active Input Handling.' },
  { id: 't3',  year: '2025', month: 'Apr 2025', type: 'project',   member: 0, title: 'SecondSpace — Full-stack Marketplace', desc: 'Led ~60% of full-stack work on a neo-brutalist thrift marketplace. Vue 3 + Supabase + Tailwind v4, shipped to Vercel. Full design system and pitch deck.' },
  { id: 't4',  year: '2025', month: 'Mar 2025', type: 'project',   member: 0, title: 'Chi Matcha — Android App (Material 3)', desc: 'Full Material 3 design system in Figma (Fraunces + DM Sans, matcha palette), implemented in Java + XML. Resolved Android Studio and Gradle issues.' },
  { id: 't5',  year: '2025', month: 'Mar 2025', type: 'project',   member: 2, title: 'Credit Default Prediction — ML Model', desc: 'Built a Random Forest classifier on the Home Credit dataset in Google Colab. Produced full presenter-facing documentation for academic submission.' },
  { id: 't6',  year: '2025', month: 'Feb 2025', type: 'learning',  member: 2, title: 'Data Engineering Pipeline — FIFA VAR Dataset', desc: 'Complete ETL pipeline with Pentaho + Power BI. Transformed raw FIFA VAR data into formatted analytics dashboards.' },
  { id: 't7',  year: '2025', month: 'Jan 2025', type: 'milestone', member: 0, title: 'Applied — Apple Developer Academy', desc: 'Submitted application to Apple Developer Academy. Prepared CV, portfolio, and tech stack showcase.' },
  { id: 't8',  year: '2024', month: 'Nov 2024', type: 'project',   member: 0, title: 'NexusFlow — React + Supabase Dashboard', desc: 'Built a real-time analytics dashboard self-hosted on Dokploy. Debugged Supabase Realtime publication registration for self-hosted instances.' },
  { id: 't9',  year: '2024', month: 'Oct 2024', type: 'project',   member: 0, title: 'SpoJeDy — Vue 3 Music Streaming App', desc: 'Collaborative music streaming app with Pinia state management and TypeScript. Resolved Git merge conflicts between feature branches.' },
  { id: 't10', year: '2024', month: 'Sep 2024', type: 'milestone', member: 0, title: 'Vice Coordinator — HIMTI Techfest Design Division', desc: 'Led the Design and Documentation Division for Techfest at HIMTI. Managed visual direction and deliverables.' },
  { id: 't11', year: '2024', month: 'Aug 2024', type: 'project',   member: 0, title: 'IEEE Paper — Dark Data Detection in Hospitals', desc: 'Co-authored an IEEE conference paper on ML-based dark data detection. Wrote Result, Discussion, Conclusion, Introduction, and Abstract.' },
  { id: 't12', year: '2024', month: 'Jun 2024', type: 'project',   member: 0, title: 'GeoLapak — Location Intelligence for UMKM', desc: 'Designed concept, naming, and design system for a location analytics platform combining Maps API with BPS open data.' },
  { id: 't13', year: '2024', month: 'May 2024', type: 'milestone', member: 1, title: 'Backend Architecture — First Production API', desc: 'Shipped first production-grade REST API with PostgreSQL + Supabase. Designed schema for multi-tenant app with row-level security.' },
  { id: 't14', year: '2024', month: 'Apr 2024', type: 'milestone', member: 3, title: 'First Android App — Published to Internal Testing', desc: 'Completed first Android app using Kotlin + Jetpack Compose. Published to Google Play internal testing.' },
  { id: 't15', year: '2024', month: 'Mar 2024', type: 'award',     member: 4, title: 'Best Visual Design — Internal Competition', desc: 'Recognized for outstanding motion graphics and brand identity at internal university competition.' },
  { id: 't16', year: '2023', month: 'Aug 2023', type: 'milestone', member: 0, title: 'Started SecondSpace — First Prototype', desc: 'Built first single-file Vue prototype for a thrift marketplace. Beginning of what would become a full production app two years later.' },
  { id: 't17', year: '2023', month: 'Feb 2023', type: 'milestone', member: -1, title: 'NATY Founded — Five CS Students, One Direction', desc: 'The team came together at Binus University. Adopted the name NATY from Nusantara.' },
]
