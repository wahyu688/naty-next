import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

function isAuthorized(req: NextRequest) {
  const pwd = req.headers.get('x-dashboard-password')
  return pwd === process.env.DASHBOARD_PASSWORD
}

function extractGithubUsername(input: string): string | null {
  const clean = input.trim().replace(/\/$/, '')
  const match = clean.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)/)
  if (match) return match[1]
  if (/^[a-zA-Z0-9-]+$/.test(clean)) return clean
  return null
}

async function fetchGitHubData(username: string) {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'NATY-Portfolio/1.0',
  }
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const [profileRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12&type=owner`, { headers }),
  ])

  if (!profileRes.ok) throw new Error(`GitHub user not found: ${username}`)

  const profile = await profileRes.json()
  const repos   = reposRes.ok ? await reposRes.json() : []
  return { profile, repos }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { githubUrl, memberName, memberRole } = await req.json()
  if (!githubUrl) return NextResponse.json({ error: 'Missing githubUrl' }, { status: 400 })

  const username = extractGithubUsername(githubUrl)
  if (!username) return NextResponse.json({ error: 'Invalid GitHub URL or username' }, { status: 400 })

  let profile: any, repos: any[]
  try {
    const data = await fetchGitHubData(username)
    profile = data.profile
    repos   = data.repos
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 })
  }

  const repoSummary = repos
    .filter((r: any) => !r.fork && r.description)
    .slice(0, 8)
    .map((r: any) => `- ${r.name} (${r.language ?? 'Unknown'}): ${r.description} [★${r.stargazers_count}]`)
    .join('\n')

  const githubContext = `
GitHub Username: ${username}
Name: ${profile.name ?? 'N/A'}
Bio: ${profile.bio ?? 'N/A'}
Location: ${profile.location ?? 'N/A'}
Public Repos: ${profile.public_repos}
Followers: ${profile.followers}

Top repositories:
${repoSummary || 'No public repos with descriptions found.'}
  `.trim()

  // Groq — free, no billing required
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 300,
    messages: [
      {
        role: 'system',
        content: 'You are a professional copywriter writing concise bios for a CS student portfolio website.',
      },
      {
        role: 'user',
        content: `Write a short professional bio for a portfolio website member card.

Member name: ${memberName}
Member role: ${memberRole}

GitHub data:
${githubContext}

Write 2-3 sentences (max 60 words), third person, present tense.
Focus on technical strengths visible from their repos and role.
Sound confident and specific, not generic.
Do NOT mention GitHub stats or follower counts.
Do NOT use filler phrases like "passionate about" or "loves coding".
Return ONLY the bio text, no quotes, no extra formatting.`,
      },
    ],
  })

  const bio = completion.choices[0].message.content?.trim() ?? ''

  const languages = [...new Set(
    repos.filter((r: any) => r.language).map((r: any) => r.language)
  )].slice(0, 6) as string[]

  return NextResponse.json({
    bio,
    suggestedTags: languages,
    githubProfile: {
      username,
      name:   profile.name,
      avatar: profile.avatar_url,
      repos:  profile.public_repos,
      bio:    profile.bio,
    },
  })
}