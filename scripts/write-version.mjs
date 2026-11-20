#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sha = execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim()
const short = sha.slice(0, 7)
const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: root, encoding: 'utf8' }).trim()
const builtAt = new Date().toISOString()
const payload = {
  name: 'ARIA',
  slogan: 'Just Play Something.',
  commit: sha,
  short,
  branch,
  builtAt,
}
mkdirSync(join(root, 'public'), { recursive: true })
writeFileSync(join(root, 'public/version.json'), `${JSON.stringify(payload, null, 2)}\n`)
console.log(`version.json → ${short} (${branch})`)
