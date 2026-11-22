#!/usr/bin/env node
/**
 * Captures comparatives de la direction visuelle : mêmes données, mêmes écrans, trois thèmes.
 * Chromium, 390×844, densité ×2, micro simulé. Sortie : docs/screenshots/da-preview/<theme>-<écran>.png
 * Usage : npx vite preview --port 43123 &  puis  node scripts/da-captures.mjs [url]
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const BASE = process.argv[2] || 'http://localhost:43123/'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs/screenshots/da-preview')
mkdirSync(OUT, { recursive: true })

const THEMES = ['marine', 'electrique', 'espresso']

async function shot(page, name) {
  await page.waitForTimeout(300)
  const style = await page.addStyleTag({ content: '.v0-dock{position:absolute!important;bottom:0!important}.v0-app{position:relative}' })
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true })
  await style.evaluate((el) => el.remove())
}

const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR' })
await context.grantPermissions(['microphone'])
const page = await context.newPage()
const nav = (name) => page.getByRole('navigation').getByRole('button', { name }).click()

// Données de démonstration identiques pour les trois thèmes (mode découverte, exemples marqués Démo).
await page.goto(`${BASE}?reset`)
await page.getByRole('button', { name: 'Commencer' }).click()
await page.getByRole('button', { name: /Guitare/ }).click()
await page.getByRole('button', { name: 'Continuer' }).click()
await page.getByRole('button', { name: /Je pratique/ }).click()
await page.getByRole('button', { name: 'Continuer' }).click()
await page.getByRole('button', { name: /^Rythme/ }).click()
await page.getByRole('button', { name: 'Continuer' }).click()
await page.getByRole('button', { name: '20 min' }).click()
await page.getByRole('button', { name: 'Entrer dans Aria' }).click()
await nav('Bibliothèque')
await page.getByRole('button', { name: 'Charger des exemples de démonstration' }).click()
await page.getByRole('button', { name: /Gymnopédie/ }).click()
await page.getByRole('button', { name: 'Préparer une séance' }).click()
await page.getByRole('button', { name: 'Commencer la séance' }).click()
await page.getByRole('button', { name: 'Démarrer l’enregistrement' }).click()
await page.waitForTimeout(1500)
await page.getByRole('button', { name: 'Arrêter et sauvegarder la prise' }).click()
await page.getByText(/Prise sauvegardée/).waitFor()

for (const theme of THEMES) {
  await page.goto(`${BASE}?theme=${theme}`)
  await page.getByText('Envie de jouer ?').waitFor()
  await shot(page, `${theme}-1-accueil`)
  await nav('Bibliothèque')
  await shot(page, `${theme}-2-bibliotheque`)
  await nav('Accueil')
  await page.locator('.v0-resume').first().click()
  await page.getByTestId('step-card').waitFor()
  await page.getByRole('button', { name: 'Démarrer l’enregistrement' }).click()
  await page.waitForTimeout(1200)
  await shot(page, `${theme}-3-seance-enregistrement`)
  await page.getByRole('button', { name: 'Arrêter et sauvegarder la prise' }).click()
  await page.getByText(/Prise sauvegardée/).waitFor()
  await page.getByRole('button', { name: 'Terminer maintenant et faire le bilan' }).click()
  await page.getByText('Ce qui fonctionne').first().waitFor()
  await shot(page, `${theme}-4-bilan`)
  await nav('Suivi')
  await shot(page, `${theme}-5-suivi`)
  await nav('Profil')
  await shot(page, `${theme}-6-profil`)
}
// Écran de bienvenue (sans données)
const fresh = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'fr-FR' })
const p2 = await fresh.newPage()
for (const theme of THEMES) {
  await p2.goto(`${BASE}?theme=${theme}`)
  await p2.getByRole('button', { name: 'Commencer' }).waitFor()
  await p2.waitForTimeout(400)
  await p2.screenshot({ path: join(OUT, `${theme}-0-bienvenue.png`) })
}
await browser.close()
console.log(`Captures écrites dans ${OUT}`)
