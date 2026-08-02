// Simple in-memory per-IP rate limit for /track/[slug] (§9 "tambah
// rate limit sederhana"). Deliberately basic: state lives in the
// middleware's module scope, which is fine for this single-instance
// Docker/Dokploy deployment (per README) but would need a shared
// store (Redis/Upstash) if this app ever runs across multiple
// instances behind a load balancer.

const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 30

const hits = new Map<string, { count: number; resetAt: number }>()

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  entry.count += 1
  return entry.count > MAX_REQUESTS_PER_WINDOW
}
