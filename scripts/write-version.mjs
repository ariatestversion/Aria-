#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const target = join(root, 'public/version.json')

function git(cmd) {
  return execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
}

let sha = ''
let branch = ''
try {
  sha = git('git rev-parse HEAD')
  branch = git('git rev-parse --abbrev-ref HEAD')
} catch {
  // Build sans dépôt Git (ex. archive envoyée par le connecteur Netlify, .git exclu).
  sha = process.env.COMMIT_REF || ''
  branch = process.env.BRANCH || process.env.HEAD || ''
}

if (!sha) {
  if (existsSync(target)) {
    console.log('version.json → Git indisponible : conservation du fichier généré localement depuis le commit poussé.')
    process.exit(0)
  }
  console.warn('version.json → Git indisponible et aucun fichier existant : commit inconnu.')
  sha = 'unknown'
}

const payload = {
  name: 'ARIA',
  slogan: 'Just Play Something.',
  commit: sha,
  short: sha.slice(0, 7),
  branch,
  builtAt: new Date().toISOString(),
}
mkdirSync(join(root, 'public'), { recursive: true })
writeFileSync(target, `${JSON.stringify(payload, null, 2)}\n`)
console.log(`version.json → ${payload.short} (${branch})`)
