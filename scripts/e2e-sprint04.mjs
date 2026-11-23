#!/usr/bin/env node
/**
 * Recette automatisée Sprint 04 — navigateur Chromium (Playwright), viewport mobile 390×844.
 *
 * Micro SIMULÉ par Chromium (--use-fake-device-for-media-stream) : ce n’est PAS un test sur
 * appareil physique. Le son enregistré est un signal de test généré par le navigateur.
 *
 * Usage : npm run build && npx vite preview --port 43123 &  puis  node scripts/e2e-sprint04.mjs [url]
 * Options : SHOTS=1 pour régénérer docs/screenshots/sprint04/.
 */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const BASE = process.argv[2] || 'http://localhost:43123/'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SHOT_DIR = join(ROOT, process.env.SHOT_DIR || 'docs/screenshots/sprint04')
const SHOTS = process.env.SHOTS === '1'
if (SHOTS) mkdirSync(SHOT_DIR, { recursive: true })

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok: Boolean(ok), detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

const VIEWPORT = { width: 390, height: 844 }

async function shot(page, name) {
  if (!SHOTS) return
  await page.waitForTimeout(250)
  // Capture pleine page : la barre de navigation fixe est replacée en bas du document.
  const style = await page.addStyleTag({ content: '.v0-dock{position:absolute!important;bottom:0!important}.v0-app{position:relative}' })
  await page.screenshot({ path: join(SHOT_DIR, `${name}.png`), fullPage: true })
  await style.evaluate((el) => el.remove())
}

/** Débordement horizontal + cibles tactiles < 44 px visibles. */
async function layoutAudit(page, label) {
  const r = await page.evaluate(() => {
    const doc = document.documentElement
    const overflow = doc.scrollWidth - doc.clientWidth
    const small = []
    for (const el of document.querySelectorAll('button, a[href], input, select, textarea, summary, label.ds-btn')) {
      const box = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      if (!box.width || !box.height || style.visibility === 'hidden' || el.closest('[hidden]')) continue
      if (el.type === 'file' || el.classList.contains('ds-steps-seg')) continue
      if (box.height < 43.5 || (box.width < 43.5 && el.tagName !== 'INPUT')) {
        small.push(`${el.tagName.toLowerCase()}「${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 28)}」${Math.round(box.width)}×${Math.round(box.height)}`)
      }
    }
    // Chevauchement dock / dernier élément interactif une fois en bas de page
    window.scrollTo(0, doc.scrollHeight)
    const dock = document.querySelector('.v0-dock')
    let hidden = []
    if (dock) {
      const top = dock.getBoundingClientRect().top
      const items = [...document.querySelectorAll('.v0-main button, .v0-main input, .v0-main textarea')]
      hidden = items
        .filter((el) => {
          const b = el.getBoundingClientRect()
          return b.height && b.bottom > top + 1 && b.top < window.innerHeight
        })
        .map((el) => (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 28))
    }
    window.scrollTo(0, 0)
    return { overflow, small, hidden }
  })
  check(`${label} : pas de défilement horizontal`, r.overflow <= 0, r.overflow > 0 ? `${r.overflow}px` : '')
  check(`${label} : cibles tactiles ≥ 44 px`, r.small.length === 0, r.small.join(', '))
  check(`${label} : rien de masqué par la navigation en bas de page`, r.hidden.length === 0, r.hidden.join(', '))
}

async function onboardGuitar(page) {
  await page.goto(`${BASE}?reset`)
  await page.getByRole('button', { name: 'Commencer' }).click()
  await page.getByRole('button', { name: /Guitare/ }).click()
  await shot(page, '01-onboarding-instruments')
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByRole('button', { name: /Je débute/ }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByRole('button', { name: /^Rythme/ }).click()
  await shot(page, '02-onboarding-objectifs')
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByRole('button', { name: '15 min' }).click()
  await page.getByRole('button', { name: 'Entrer dans Aria' }).click()
}

async function addPiece(page, title) {
  await page.getByRole('navigation').getByRole('button', { name: 'Bibliothèque' }).click()
  await page.getByRole('button', { name: 'Ajouter un morceau' }).click()
  await page.getByLabel('Titre').fill(title)
  await page.getByRole('button', { name: 'Enregistrer le morceau' }).click()
}

async function record(page, ms) {
  await page.getByRole('button', { name: 'Démarrer l’enregistrement' }).click()
  await page.getByText(/Enregistrement en cours ·/).waitFor()
  await page.waitForTimeout(ms)
  await page.getByRole('button', { name: 'Arrêter et sauvegarder la prise' }).click()
  await page.getByText(/Prise sauvegardée sur cet appareil/).waitFor()
}

async function main() {
  const browser = await chromium.launch({
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'],
  })
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SHOTS ? 2 : 1, locale: 'fr-FR' })
  await context.grantPermissions(['microphone'])
  const page = await context.newPage()
  const errors = []
  const missing = []
  const mediaRequests = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('response', (r) => {
    if (r.status() >= 400 && new URL(r.url()).origin === new URL(BASE).origin) missing.push(`${r.status()} ${r.url()}`)
  })
  // Netlify renvoie index.html (200) pour tout chemin inconnu : on contrôle donc les requêtes
  // elles-mêmes, en plus des 404 (utile en local).
  page.on('request', (r) => {
    const path = new URL(r.url()).pathname
    if (/\/(presets|instruments)\//.test(path) || /\.(mp3|wav|jpe?g|png)$/i.test(path)) mediaRequests.push(path)
  })

  // 1. Onboarding → objectifs transmis à la préparation
  await onboardGuitar(page)
  await page.getByText('Envie de jouer ?').waitFor()
  await shot(page, '03-accueil')
  await layoutAudit(page, 'Accueil')

  await addPiece(page, 'Ma chanson')
  await page.getByRole('button', { name: 'Préparer une séance' }).click()
  const rythme = page.getByTestId('prep-goals').getByRole('button', { name: /^Rythme/ })
  check('Préparation : objectif « Rythme » de l’onboarding présélectionné', (await rythme.getAttribute('aria-pressed')) === 'true')
  check(
    'Préparation : durée 15 min de l’onboarding présélectionnée',
    (await page.getByRole('button', { name: '15 min' }).getAttribute('aria-pressed')) === 'true',
  )
  check(
    'Préparation : instrument Guitare présélectionné',
    (await page.getByRole('button', { name: 'Guitare' }).getAttribute('aria-pressed')) === 'true',
  )
  // Non-régression : morceau de guitare sans ressource → « À l’oreille » par défaut, modifiable.
  const pressed = async (name) => (await page.getByRole('button', { name }).getAttribute('aria-pressed')) === 'true'
  check('NR · Préparation sans ressource : « À l’oreille, sans support » sélectionné par défaut', await pressed('À l’oreille, sans support'))
  check('NR · Préparation sans ressource : « Partition » non présélectionnée', !(await pressed('Partition')))
  await page.getByRole('button', { name: 'Partition' }).click()
  const switched = (await pressed('Partition')) && !(await pressed('À l’oreille, sans support'))
  await page.getByRole('button', { name: 'À l’oreille, sans support' }).click()
  check('NR · Préparation : le support reste modifiable', switched && (await pressed('À l’oreille, sans support')))
  await page.getByLabel('Passage travaillé').fill('Couplet')
  const plan = await page.getByTestId('prep-plan').locator('li').allInnerTexts()
  const total = plan.reduce((a, t) => a + Number((t.match(/(\d+) min/) || [0, 0])[1]), 0)
  check('Scénario guitare · rythme · 15 min · sans partition : 4 étapes', plan.length === 4, plan.join(' | '))
  check('Scénario guitare : durées des étapes = 15 min', total === 15, `${total} min`)
  check('Scénario guitare : exercices main droite / motif / changement d’accord', /Main droite/.test(plan[0]) && /Motif/.test(plan[1]) && /accord/.test(plan[2]))
  await shot(page, '04-preparation')
  await layoutAudit(page, 'Préparation')
  await page.getByRole('button', { name: 'Commencer la séance' }).click()

  // 2. Séance : consigne, durée, critère ; métronome ; enregistrement accessible
  const card = page.getByTestId('step-card')
  await card.waitFor()
  const cardText = await card.innerText()
  check('Séance : consigne + critère de réussite affichés', /Consigne/i.test(cardText) && /Critère de réussite/i.test(cardText))
  check('Séance : durée d’étape affichée', await page.getByText(/^\d+ min$/).first().isVisible())
  check('Séance : bouton d’enregistrement présent pendant le travail', await page.getByRole('button', { name: 'Démarrer l’enregistrement' }).isVisible())
  await page.getByRole('button', { name: 'Métronome' }).click()
  await page.getByTestId('metronome').getByRole('button', { name: 'Démarrer' }).click()
  await page.waitForTimeout(1200)
  await shot(page, '05-seance-etape1')
  await page.getByTestId('metronome').getByRole('button', { name: 'Arrêter' }).click()
  await layoutAudit(page, 'Séance')

  await record(page, 2200)
  await record(page, 1600)
  const sessionTakes = await page.locator('.ds-take').count()
  check('Plusieurs prises pour le même passage', sessionTakes === 2, `${sessionTakes} prises`)
  await page.getByRole('button', { name: 'Oui, réussi' }).click()
  await page.getByRole('button', { name: 'Étape suivante' }).click()
  await page.getByRole('button', { name: 'Étape suivante' }).click()
  await page.getByRole('button', { name: 'Pas encore' }).click()
  await shot(page, '06-seance-etape3')
  await page.getByRole('button', { name: 'Étape suivante' }).click()
  await page.getByRole('button', { name: 'Faire le bilan' }).click()

  // 3. Bilan structuré + comparaison
  await page.getByText('Ce qui fonctionne').first().waitFor()
  check('Bilan : comparaison A/B de deux prises', (await page.getByTestId('compare').locator('.ds-take').count()) === 2)
  check('Bilan : 4 rubriques', (await page.locator('.ds-feed').count()) === 4)
  check('Bilan : analyse automatique déclarée absente', await page.getByText(/Analyse automatique : aucune/).first().isVisible())
  check('Bilan : sources distinguées (observation / règle)', (await page.getByText('Règle pédagogique ARIA').count()) >= 2 && (await page.getByText('Ton observation').count()) >= 1)
  await page.getByLabel('Ce qui fonctionne').fill('La main droite reste régulière sur un seul accord.')
  await page.getByLabel('Ce qui mérite d’être travaillé').fill('Le rythme décroche au changement d’accord.')
  await page.getByLabel('Ta comparaison (facultatif)').fill('La prise 2 est plus régulière.')
  const nextWithRef = await page.locator('.ds-feed').nth(3).innerText()
  check('NR · Bilan avec prise de référence : invitation à comparer', /compare-la à la précédente/.test(nextWithRef))
  const corrective = await page.getByTestId('corrective').innerText()
  check('Bilan : exercice correctif concret lié à la difficulté notée', /rythm|Motif/i.test(corrective), corrective.split('\n')[2] || '')
  await shot(page, '07-bilan')
  await layoutAudit(page, 'Bilan')
  await page.getByRole('button', { name: 'Terminer la séance' }).click()
  await page.getByRole('heading', { name: 'Suivi' }).waitFor()
  check('Séance terminée visible dans le Suivi', await page.getByText('Terminée', { exact: true }).first().isVisible())

  // 4. Rechargement → réécoute depuis le Suivi
  await page.reload()
  await page.getByText('Envie de jouer ?').waitFor()
  await page.getByRole('navigation').getByRole('button', { name: 'Suivi' }).click()
  const followTakes = page.getByTestId('follow-take')
  check('Après rechargement : prises listées dans le Suivi', (await followTakes.count()) === 2)
  await followTakes.first().getByRole('button', { name: /^Lecture/ }).click()
  await page.waitForTimeout(900)
  const playing = await page.evaluate(() => {
    const a = [...document.querySelectorAll('audio')].find((x) => !x.paused)
    return a ? a.currentTime : -1
  })
  check('Après rechargement : réécoute effective (lecture en cours)', playing > 0, `t=${playing.toFixed?.(2)}s`)
  check('Lecteur : bouton « Pause » explicite pendant la lecture', await followTakes.first().getByRole('button', { name: /^Pause/ }).isVisible())
  await shot(page, '08-suivi')
  await layoutAudit(page, 'Suivi')
  await followTakes.first().getByRole('button', { name: /^Pause/ }).click()
  await followTakes.first().getByRole('button', { name: 'Supprimer' }).click()
  await followTakes.first().getByRole('button', { name: 'Oui, supprimer' }).click()
  await page.waitForTimeout(300)
  check('Suppression d’une prise avec confirmation', (await followTakes.count()) === 1)
  check('Brouillons et séances terminées distincts', (await page.getByText('Brouillon', { exact: true }).count()) === 0)

  // 5. Brouillons — non comptés comme terminés ; reprise d’un brouillon après rechargement.
  await page.getByRole('navigation').getByRole('button', { name: 'Bibliothèque' }).click()
  await page.getByRole('button', { name: /Ma chanson/ }).click()
  await page.getByRole('button', { name: 'Préparer une séance' }).click()
  await page.getByRole('button', { name: 'Commencer la séance' }).click()
  await page.getByRole('button', { name: 'Terminer maintenant et faire le bilan' }).click()
  await page.getByRole('button', { name: 'Terminer la séance' }).click()
  check('Séance vide refusée comme « terminée »', await page.getByText(/Pour terminer la séance/).isVisible())
  const draftNote = 'Brouillon : la main droite tient le motif.'
  await page.getByLabel('Ce qui fonctionne').fill(draftNote)
  await page.getByRole('button', { name: 'Garder en brouillon' }).click()

  // Second morceau, jamais enregistré : bilan sans prise de référence, gardé en brouillon.
  await addPiece(page, 'Autre morceau')
  await page.getByRole('button', { name: 'Préparer une séance' }).click()
  await page.getByRole('button', { name: 'Commencer la séance' }).click()
  await page.getByRole('button', { name: 'Terminer maintenant et faire le bilan' }).click()
  const nextNoRef = await page.locator('.ds-feed').nth(3).innerText()
  check('NR · Bilan sans prise : propose une première prise de référence', /première prise/.test(nextNoRef), nextNoRef.split('\n').pop())
  check('NR · Bilan sans prise : pas d’invitation à comparer', !/compare|précédente/i.test(nextNoRef))
  await shot(page, '13-bilan-sans-prise')
  await page.getByRole('button', { name: 'Garder en brouillon' }).click()
  await page.getByRole('navigation').getByRole('button', { name: 'Suivi' }).click()
  check('Brouillons listés à part (2)', await page.getByRole('heading', { name: 'Brouillons (2)' }).isVisible())
  check('Les brouillons n’augmentent pas les séances terminées', await page.getByRole('heading', { name: 'Séances terminées (1)' }).isVisible())

  // Non-régression : garder en brouillon → recharger → reprendre → terminer.
  await page.reload()
  await page.getByText('Envie de jouer ?').waitFor()
  await page.getByRole('navigation').getByRole('button', { name: 'Bibliothèque' }).click()
  await page.getByRole('button', { name: /Ma chanson/ }).click()
  await page.getByRole('button', { name: 'Reprendre la séance' }).click()
  await page.getByRole('button', { name: 'Terminer maintenant et faire le bilan' }).click()
  check('NR · Reprise du brouillon : observations restaurées', (await page.getByLabel('Ce qui fonctionne').inputValue()) === draftNote)
  await page.getByRole('button', { name: 'Terminer la séance' }).click()
  await page.getByRole('heading', { name: 'Suivi' }).waitFor()
  await page.reload()
  await page.getByText('Envie de jouer ?').waitFor()
  await page.getByRole('navigation').getByRole('button', { name: 'Suivi' }).click()
  check('NR · Brouillon terminé : une seule séance terminée de plus (2)', await page.getByRole('heading', { name: 'Séances terminées (2)' }).isVisible())
  check('NR · Brouillon terminé : il a disparu des brouillons', await page.getByRole('heading', { name: 'Brouillons (1)' }).isVisible())
  const remainingDraft = await page.locator('.ds-card--muted').innerText()
  check('NR · Les autres brouillons sont toujours présents', /Autre morceau/.test(remainingDraft) && !/Ma chanson/.test(remainingDraft))
  await shot(page, '14-suivi-brouillon-termine')

  // 6. Écrans communs
  await page.getByRole('navigation').getByRole('button', { name: 'Bibliothèque' }).click()
  await shot(page, '09-bibliotheque')
  await layoutAudit(page, 'Bibliothèque')
  await page.getByRole('navigation').getByRole('button', { name: 'Profil' }).click()
  await shot(page, '10-profil')
  await layoutAudit(page, 'Profil')
  // Direction visuelle : trois thèmes comparables, Marine (DA 1) par défaut sur cette branche.
  const theme = () => page.evaluate(() => document.documentElement.dataset.brand)
  check('Direction visuelle : Marine (DA 1) par défaut', (await theme()) === 'marine')
  for (const [label, id] of [
    ['Bleu électrique (DA 2)', 'electrique'],
    ['Crème & espresso (V0.4)', 'espresso'],
    ['Ivoire & marine (DA 4)', 'ivoire'],
    ['Marine (DA 1)', 'marine'],
  ]) {
    await page.getByRole('navigation').getByRole('button', { name: 'Profil' }).click()
    await page.getByRole('button', { name: new RegExp(`^${label.replace(/[()]/g, '\\$&')}`) }).click()
    check(`Direction visuelle : thème ${label} appliqué`, (await theme()) === id)
    await page.getByRole('navigation').getByRole('button', { name: 'Accueil' }).click()
    await layoutAudit(page, `Accueil · ${label}`)
  }
  check('Aucune erreur JavaScript', errors.length === 0, errors.join(' | '))
  check('Médias : aucune ressource en échec (404)', missing.length === 0, missing.join(' | '))
  check('Médias : aucune requête vers les médias retirés (presets, instruments, audio, images)', mediaRequests.length === 0, mediaRequests.join(' | '))
  check(
    'Médias : aucune image externe affichée par l’application',
    (await page.evaluate(() => document.querySelectorAll('img').length)) === 0,
  )
  await browser.close()

  // 7. Micro refusé puis réessai.
  // Le refus est SIMULÉ : getUserMedia rejette NotAllowedError (comportement d’un refus utilisateur),
  // tant que window.__denyMic est vrai. Le réessai se fait ensuite avec l’autorisation accordée.
  const b2 = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] })
  const c2 = await b2.newContext({ viewport: VIEWPORT, deviceScaleFactor: SHOTS ? 2 : 1, locale: 'fr-FR' })
  await c2.grantPermissions(['microphone'])
  await c2.addInitScript(() => {
    window.__denyMic = true
    const real = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = (constraints) =>
      window.__denyMic ? Promise.reject(new DOMException('Permission denied', 'NotAllowedError')) : real(constraints)
  })
  const p2 = await c2.newPage()
  await onboardGuitar(p2)
  await addPiece(p2, 'Test micro')
  // Séance sans passage saisi (objectif Rythme) : sert aussi au contrôle du libellé de passage.
  await p2.getByRole('button', { name: 'Préparer une séance' }).click()
  await p2.getByRole('button', { name: 'Commencer la séance' }).click()
  await p2.getByRole('button', { name: 'Démarrer l’enregistrement' }).click()
  const denied = p2.getByText('Micro refusé.')
  await denied.waitFor({ timeout: 5000 }).catch(() => undefined)
  check('Micro refusé : message explicite', await denied.isVisible())
  const retry = p2.getByRole('button', { name: 'Réessayer le micro' })
  check('Micro refusé : bouton « Réessayer le micro »', await retry.isVisible())
  await shot(p2, '12-micro-refuse')
  await layoutAudit(p2, 'Micro refusé')
  await p2.evaluate(() => {
    window.__denyMic = false
  })
  await retry.click()
  const rec = p2.getByText(/Enregistrement en cours ·/)
  await rec.waitFor({ timeout: 5000 }).catch(() => undefined)
  check('Micro autorisé ensuite : l’enregistrement démarre au réessai', await rec.isVisible())
  await p2.waitForTimeout(1500)
  await p2.getByRole('button', { name: 'Arrêter et sauvegarder la prise' }).click()
  await p2.getByText(/Prise sauvegardée sur cet appareil/).waitFor()
  await p2.getByRole('navigation').getByRole('button', { name: 'Suivi' }).click()
  const detail = await p2.getByTestId('follow-take').first().innerText()
  check('NR · Prise sans passage saisi : l’objectif n’est pas affiché comme passage', !/·\s*Rythme\b|·\s*Passage\b/.test(detail), detail.split('\n')[1] || '')
  await b2.close()

  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
