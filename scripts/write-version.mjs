#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
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

// Build Netlify à partir d’une archive : Netlify recrée un dépôt Git synthétique (branche « master »)
// dont le commit n’a rien à voir avec GitHub. On garde alors le version.json généré localement
// depuis le commit réellement poussé, s’il est présent dans l’archive.
if (sha && process.env.NETLIFY === 'true' && existsSync(target)) {
  try {
    const local = JSON.parse(readFileSync(target, 'utf8'))
    if (local.commit && local.commit !== sha) {
      let known = true
      try {
        git(`git cat-file -e ${local.commit}^{commit}`)
      } catch {
        known = false
      }
      if (!known) {
        console.log(`version.json → build Netlify depuis une archive : conservation du commit source ${local.short}.`)
        process.exit(0)
      }
    }
  } catch {
    /* fichier illisible : on régénère */
  }
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
