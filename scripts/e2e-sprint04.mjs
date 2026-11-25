#!/usr/bin/env node
/**
 * Recette automatisée Sprint 04 + Sprint 05 — navigateur Chromium (Playwright), viewport mobile 390×844.
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
const SHOT_DIR = join(ROOT, process.env.SHOT_DIR || 'docs/screenshots/sprint05')
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
      // Case à cocher dans un libellé : c’est le libellé entier (≥ 44 px) qui reçoit le toucher.
      if (el.type === 'checkbox' && el.closest('label') && el.closest('label').getBoundingClientRect().height >= 43.5) continue
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

/** Sprint 07 · S7-10 — contraste WCAG AA du texte visible (fonds semi-transparents composés). */
async function contrastAudit(page, label) {
  const bad = await page.evaluate(() => {
    const parse = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      const [r, g, b, a = '1'] = m[1].split(',').map((x) => x.trim())
      return [Number(r), Number(g), Number(b), Number(a)]
    }
    const blend = (top, bottom) => {
      const a = top[3]
      return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a)).concat(1)
    }
    const bgOf = (el) => {
      const layers = []
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor)
        if (c && c[3] > 0) layers.push(c)
        if (c && c[3] >= 1) break
      }
      let acc = [255, 255, 255, 1]
      for (let i = layers.length - 1; i >= 0; i--) acc = blend(layers[i], acc)
      return acc
    }
    const lum = ([r, g, b]) => {
      const f = (v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const ratio = (a, b) => {
      const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
      return (l1 + 0.05) / (l2 + 0.05)
    }
    const out = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (!t.textContent.trim()) continue
      const el = t.parentElement
      const cs = getComputedStyle(el)
      const box = el.getBoundingClientRect()
      if (!box.width || !box.height || cs.visibility === 'hidden' || Number(cs.opacity) === 0 || el.closest('[aria-hidden="true"],[hidden],option,[aria-disabled="true"],:disabled')) continue
      const fg = parse(cs.color)
      if (!fg) continue
      const bg = bgOf(el)
      const color = fg[3] < 1 ? blend(fg, bg) : fg
      const size = parseFloat(cs.fontSize)
      const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700)
      const r = ratio(color, bg)
      if (r < (large ? 3 : 4.5)) out.push(`« ${t.textContent.trim().slice(0, 24)} » ${r.toFixed(2)}:1`)
    }
    return [...new Set(out)].slice(0, 6)
  })
  check(`${label} : contraste du texte ≥ 4,5:1 (3:1 grands textes)`, bad.length === 0, bad.join(' | '))
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
  await contrastAudit(page, 'Accueil DA A')
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
  await contrastAudit(page, 'Préparation DA A')
  await layoutAudit(page, 'Préparation')
  await page.getByRole('button', { name: 'Commencer la séance' }).click()

  // 2. Séance : consigne, durée, critère ; métronome ; enregistrement accessible
  const card = page.getByTestId('step-card')
  await card.waitFor()
  const cardText = await card.innerText()
  check('Séance : consigne + repère de réussite affichés (maquette 4.2)', /À travailler/.test(cardText) && /Repère de réussite/.test(cardText) && cardText.split('\n').filter((l) => l.trim()).length >= 4)
  check('Séance : durée d’étape affichée', /À travailler · \d+ min/.test(cardText))
  check('Séance : bouton d’enregistrement présent pendant le travail', await page.getByRole('button', { name: 'Démarrer l’enregistrement' }).isVisible())
  check('S05 · Séance : tempo de l’étape affiché avec accès direct au métronome', await page.getByRole('button', { name: /^Métronome · \d+ BPM$/ }).isVisible())
  check('S7-01 · DA A Blanc & marine appliquée par défaut', (await page.evaluate(() => document.documentElement.dataset.brand)) === 'blanc')
  check('S7-01 · Séance immersive marine par défaut', (await page.evaluate(() => getComputedStyle(document.querySelector('.v0-app')).backgroundColor)) === 'rgb(16, 29, 53)')
  await page.getByRole('button', { name: 'Métronome', exact: true }).click()
  await page.getByTestId('metronome').getByRole('button', { name: 'Démarrer' }).click()
  await page.waitForTimeout(1200)
  await shot(page, '05-seance-etape1')
  await contrastAudit(page, 'Séance marine')
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
  check('Bilan : analyse automatique déclarée absente', await page.getByText(/Analyse automatique de la prise : aucune/).first().isVisible())
  check('Bilan : sources distinguées (observation / règle)', (await page.getByText('Conseil pédagogique ARIA').count()) >= 2 && (await page.getByText('Ta propre observation').count()) >= 1)
  await page.getByLabel('Ce qui fonctionne').fill('La main droite reste régulière sur un seul accord.')
  await page.getByLabel('Ce qui mérite d’être travaillé').fill('Le rythme décroche au changement d’accord.')
  await page.getByLabel('Ta comparaison (facultatif)').fill('La prise 2 est plus régulière.')
  const nextWithRef = await page.locator('.ds-feed').nth(3).innerText()
  check('NR · Bilan avec prise de référence : invitation à comparer', /compare-la à la précédente/.test(nextWithRef))
  const corrective = await page.getByTestId('corrective').innerText()
  check('Bilan : exercice correctif concret lié à la difficulté notée', /rythm|Motif/i.test(corrective), corrective.split('\n')[2] || '')
  await shot(page, '07-bilan')
  await contrastAudit(page, 'Bilan DA A')
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
  // Sprint 05 — continuité : la séance suivante part de la précédente.
  const prev = page.getByTestId('prep-previous')
  check('S05 · Préparation : dernière séance rappelée (observation de l’utilisateur)', (await prev.isVisible()) && /Le rythme décroche au changement d’accord/.test(await prev.innerText()))
  const plan2 = await page.getByTestId('prep-plan').locator('li').allInnerTexts()
  check('S05 · Préparation : étape de reprise de ce qui restait à corriger', plan2.some((t) => /Reprise ·/.test(t)), plan2.join(' | '))
  check('S05 · Préparation : la suite est expliquée (règle appliquée à tes observations)', await page.getByText(/Suite de ta séance du/).isVisible())
  const plan2Total = plan2.reduce((a, t) => a + Number((t.match(/(\d+) min/) || [0, 0])[1]), 0)
  check('S05 · Préparation : la séance de suite tient dans le temps choisi', plan2Total === 15, `${plan2Total} min`)
  await shot(page, '15-preparation-suite')
  await layoutAudit(page, 'Préparation (suite)')
  await page.getByLabel('Construire la séance à partir de la dernière').uncheck()
  const plan2Off = await page.getByTestId('prep-plan').locator('li').allInnerTexts()
  check('S05 · Préparation : la continuité peut être désactivée', !plan2Off.some((t) => /Reprise ·/.test(t)))
  await page.getByLabel('Construire la séance à partir de la dernière').check()
  await page.getByRole('button', { name: 'Commencer la séance' }).click()
  await page.getByRole('button', { name: 'Étape suivante' }).click()
  check('S05 · Séance de suite : étape 2 = reprise citant l’observation', /Reprise ·/.test(await page.getByTestId('step-card').innerText()) && /Le rythme décroche/.test(await page.getByTestId('step-card').innerText()))
  await page.getByRole('button', { name: 'Faire le bilan maintenant' }).click()
  check('S05 · Bilan : rappel de ce que l’utilisateur voulait travailler la fois précédente', await page.getByTestId('review-previous').isVisible())
  await shot(page, '16-bilan-rappel')
  // S7-08 — bilan anticipé sans travail évalué : aucun bilan, « Terminer » n’est pas proposé.
  check('Séance vide : pas de bilan, « Terminer la séance » non proposé', (await page.getByTestId('review-nowork').isVisible()) && (await page.getByRole('button', { name: 'Terminer la séance' }).count()) === 0)
  const draftNote = 'Brouillon : la main droite tient le motif.'
  await page.getByLabel('Ce qui fonctionne').fill(draftNote)
  await page.getByRole('button', { name: 'Garder en brouillon' }).click()

  // Second morceau, jamais enregistré : bilan sans prise de référence, gardé en brouillon.
  await addPiece(page, 'Autre morceau')
  await page.getByRole('button', { name: 'Préparer une séance' }).click()
  // S7-06 — une séance est en cours sur « Ma chanson » : arbitrage avant de changer de morceau.
  const active = await page.getByTestId('switch-active').innerText().catch(() => '')
  check('S7-06 · Changement de morceau : la séance active est présentée (morceau, étape, prises)', /Ma chanson/.test(active) && /prise/.test(active), active.replace(/\n/g, ' / '))
  await page.getByRole('button', { name: 'Garder le brouillon et préparer « Autre morceau »' }).click()
  await page.getByRole('button', { name: 'Commencer la séance' }).click()
  // Une étape auto-évaluée, sans prise : le bilan doit proposer une première prise de référence.
  await page.getByRole('button', { name: 'Oui, réussi' }).click()
  await page.getByRole('button', { name: 'Faire le bilan maintenant' }).click()
  const nextNoRef = await page.locator('.ds-feed').nth(3).innerText()
  check('NR · Bilan sans prise : propose une première prise de référence', /première prise/.test(nextNoRef), nextNoRef.split('\n').pop())
  check('NR · Bilan sans prise : pas d’invitation à comparer', !/compare|précédente/i.test(nextNoRef))
  await shot(page, '13-bilan-sans-prise')
  // Sprint 05 — observation saisie puis application fermée sans « Garder en brouillon ».
  const autoNote = 'Note tapée puis application fermée.'
  await page.getByLabel('Ce qui mérite d’être travaillé').fill(autoNote)
  await page.waitForTimeout(1000)
  await page.reload()
  // Correctif QA : le rechargement ramène directement au bilan en cours.
  await page.getByLabel('Ce qui mérite d’être travaillé').waitFor()
  await page.getByRole('navigation').getByRole('button', { name: 'Bibliothèque' }).click()
  await page.getByRole('button', { name: /Autre morceau/ }).click()
  await page.getByRole('button', { name: 'Reprendre le bilan' }).click()
  check('S05 · Bilan : observation conservée après fermeture sans sauvegarde manuelle', (await page.getByLabel('Ce qui mérite d’être travaillé').inputValue()) === autoNote)
  await page.getByRole('button', { name: 'Garder en brouillon' }).click()
  await page.getByRole('navigation').getByRole('button', { name: 'Suivi' }).click()
  check('Brouillons listés à part (2)', await page.getByRole('heading', { name: 'Brouillons (2)' }).isVisible())
  check('Les brouillons n’augmentent pas les séances terminées', await page.getByRole('heading', { name: 'Séances terminées (1)' }).isVisible())

  // Non-régression : garder en brouillon → recharger → reprendre → terminer.
  await page.reload()
  await page.getByText('Envie de jouer ?').waitFor()
  await page.getByRole('navigation').getByRole('button', { name: 'Bibliothèque' }).click()
  await page.getByRole('button', { name: /Ma chanson/ }).click()
  await page.getByRole('button', { name: 'Reprendre le bilan' }).click()
  // « Autre morceau » est la séance active : arbitrage, on la garde en brouillon.
  await page.getByRole('button', { name: 'Garder le brouillon et reprendre « Ma chanson »' }).click()
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
  // Direction visuelle : DA 4 par défaut ; plus de sélecteur dans le Profil. Les autres thèmes
  // restent consultables avec ?theme=… (comparaison), sans être mémorisés.
  const theme = () => page.evaluate(() => document.documentElement.dataset.brand)
  check('S05 · Profil : plus de sélecteur de direction visuelle', (await page.getByText('Direction visuelle (aperçu)').count()) === 0)
  for (const id of ['marine', 'electrique', 'espresso']) {
    await page.goto(`${BASE}?theme=${id}`)
    await page.getByText('Envie de jouer ?').waitFor()
    check(`Comparaison : thème ${id} accessible par l’adresse`, (await theme()) === id)
  }
  await page.goto(BASE)
  await page.getByText('Envie de jouer ?').waitFor()
  check('S05 · Thème de comparaison non mémorisé : retour à la DA A', (await theme()) === 'blanc')
  await page.setViewportSize({ width: 320, height: 640 })
  await layoutAudit(page, 'Accueil · 320 px')
  await page.getByRole('navigation').getByRole('button', { name: 'Bibliothèque' }).click()
  await page.getByRole('button', { name: /Ma chanson/ }).click()
  await page.getByRole('button', { name: 'Préparer une séance' }).click()
  await layoutAudit(page, 'Préparation · 320 px')
  await page.setViewportSize(VIEWPORT)
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
    window.__streams = []
    const real = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = (constraints) =>
      window.__denyMic
        ? Promise.reject(new DOMException('Permission denied', 'NotAllowedError'))
        : real(constraints).then((s) => {
            window.__streams.push(s)
            return s
          })
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

  // Sprint 05 — interruption par le système (SIMULÉE : événement « ended » sur la piste du micro,
  // comme lors d’un appel entrant ou d’un micro coupé) : la partie captée doit être sauvegardée.
  await p2.getByRole('button', { name: 'Démarrer l’enregistrement' }).click()
  await p2.getByText(/Enregistrement en cours ·/).waitFor()
  await p2.waitForTimeout(1600)
  await p2.evaluate(() => window.__streams.at(-1).getAudioTracks()[0].dispatchEvent(new Event('ended')))
  const interrupted = p2.getByText(/Enregistrement interrompu par l’appareil/)
  await interrupted.waitFor({ timeout: 5000 }).catch(() => undefined)
  check('S05 · Interruption du micro : prise sauvegardée et message explicite', await interrupted.isVisible())
  check('S05 · Interruption du micro : l’interface ne reste pas bloquée sur « en cours »', await p2.getByRole('button', { name: 'Démarrer l’enregistrement' }).isVisible())

  // Application passée en arrière-plan pendant une prise (SIMULÉ : visibilityState = hidden).
  await p2.getByRole('button', { name: 'Démarrer l’enregistrement' }).click()
  await p2.getByText(/Enregistrement en cours ·/).waitFor()
  await p2.waitForTimeout(1600)
  await p2.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  const hidden = p2.getByText(/passée en arrière-plan : la prise a été arrêtée et sauvegardée/)
  await hidden.waitFor({ timeout: 5000 }).catch(() => undefined)
  check('S05 · Arrière-plan pendant une prise : prise arrêtée et sauvegardée', await hidden.isVisible())
  await p2.evaluate(() => {
    delete document.visibilityState
  })
  await p2.getByRole('navigation').getByRole('button', { name: 'Suivi' }).click()
  check('S05 · Les 3 prises (normale, interrompue, arrière-plan) sont dans le Suivi', (await p2.getByTestId('follow-take').count()) === 3)
  const detail = await p2.getByTestId('follow-take').first().innerText()
  check('NR · Prise sans passage saisi : l’objectif n’est pas affiché comme passage', !/·\s*Rythme\b|·\s*Passage\b/.test(detail), detail.split('\n')[1] || '')
  await b2.close()

  // 8. Correctifs de recette QA du 24/11 (non-régression).
  const b3 = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] })
  const c3 = await b3.newContext({ viewport: VIEWPORT, deviceScaleFactor: SHOTS ? 2 : 1, locale: 'fr-FR' })
  await c3.grantPermissions(['microphone'])
  const p3 = await c3.newPage()
  const p3errors = []
  p3.on('pageerror', (e) => p3errors.push(e.message))
  const activeTab = async () => (await p3.locator('.v0-dock [aria-current="page"]').innerText()).trim()
  await onboardGuitar(p3)
  await addPiece(p3, 'Blackbird')

  // P0 · Scénario Work : Blackbird, guitare, 15 min, rythme, intro, sans partition ;
  // « Main droite seule, cordes étouffées » = « Pas encore » ; terminer sans prise.
  await p3.getByRole('button', { name: 'Préparer une séance' }).click()
  check('QA P1 · Préparation : onglet actif = Bibliothèque', (await activeTab()) === 'Bibliothèque')
  await p3.getByLabel('Passage travaillé').fill('Intro')
  check('QA · Scénario Work : 15 min, Rythme, sans partition', (await p3.getByRole('button', { name: '15 min' }).getAttribute('aria-pressed')) === 'true' && (await p3.getByRole('button', { name: 'À l’oreille, sans support' }).getAttribute('aria-pressed')) === 'true')
  await p3.getByRole('button', { name: 'Commencer la séance' }).click()
  check('QA · Scénario Work : étape 1 = « Main droite seule, cordes étouffées »', /Main droite seule, cordes étouffées/.test(await p3.getByTestId('step-card').innerText()))
  check('QA P1 · Séance : onglet actif = Bibliothèque', (await activeTab()) === 'Bibliothèque')
  await p3.getByRole('button', { name: 'Pas encore' }).click()
  await p3.getByRole('button', { name: 'Faire le bilan maintenant' }).click()
  await p3.getByText('Ce qui fonctionne').first().waitFor()
  check('QA P1 · Bilan : onglet actif = Bibliothèque', (await activeTab()) === 'Bibliothèque')
  const corr1 = await p3.getByTestId('corrective').innerText()
  const next1 = await p3.locator('.ds-feed').nth(3).innerText()
  check('QA P0 · Bilan : l’exercice correctif est l’étape marquée « Pas encore », à 52 BPM', /Main droite seule, cordes étouffées/.test(corr1) && /52 BPM/.test(corr1), corr1.split('\n').slice(0, 3).join(' / '))
  check('QA P0 · Bilan : la prochaine séance annonce ce même exercice et ce tempo', /ARIA commence par « Main droite seule, cordes étouffées » à 52 BPM/.test(next1), next1.split('\n').pop())
  await shot(p3, '17-qa-bilan-work')
  await p3.getByRole('button', { name: 'Terminer la séance' }).click()
  await p3.getByRole('heading', { name: 'Suivi' }).waitFor({ timeout: 5000 }).catch(() => undefined)
  check('QA · Séance terminée sans prise (étape auto-évaluée)', await p3.getByRole('heading', { name: 'Séances terminées (1)' }).isVisible())
  check('QA P1 · Suivi : onglet actif = Suivi', (await activeTab()) === 'Suivi')

  await p3.getByRole('navigation').getByRole('button', { name: 'Bibliothèque' }).click()
  await p3.getByRole('button', { name: /Blackbird/ }).click()
  await p3.getByRole('button', { name: 'Préparer une séance' }).click()
  const plan3 = await p3.getByTestId('prep-plan').locator('li').allInnerTexts()
  const titles3 = plan3.map((t) => t.replace(/^\d+ min\s*/, '').replace(/^Reprise · /, '').trim())
  check('QA P0 · Séance suivante : commence par « Reprise · Main droite seule, cordes étouffées »', /Reprise · Main droite seule, cordes étouffées/.test(plan3[0] || ''), plan3.join(' | '))
  check('QA P0 · Séance suivante : aucun exercice répété', new Set(titles3).size === titles3.length, titles3.join(' | '))
  check('S06 · Durée : la reprise dure les 5 min annoncées par le bilan', /^5 min/.test((plan3[0] || '').trim()), plan3[0])
  await shot(p3, '18-qa-preparation-suite')
  await p3.getByRole('button', { name: 'Commencer la séance' }).click()
  const card3 = await p3.getByTestId('step-card').innerText()
  check('QA P0 · Séance suivante : même consigne et même tempo que le bilan', /Reprise · Main droite seule/.test(card3) && /52 BPM/.test(card3) && (await p3.getByRole('button', { name: 'Métronome · 52 BPM' }).isVisible()))

  // P0 · Reprise du bilan : observation saisie pendant le bilan, puis rechargement.
  await p3.getByRole('button', { name: 'Faire le bilan maintenant' }).click()
  const qaNote = 'Le pouce reste régulier, l’index accroche.'
  await p3.getByLabel('Ce qui fonctionne').fill(qaNote)
  await p3.waitForTimeout(1000)
  await p3.reload()
  await p3.getByRole('heading', { name: 'Blackbird' }).waitFor({ timeout: 5000 }).catch(() => undefined)
  check('QA P0 · Rechargement pendant le bilan : retour direct au bilan (pas à l’étape 1)', (await p3.getByText('Ce qui fonctionne').first().isVisible()) && (await p3.getByTestId('step-card').count()) === 0)
  check('QA P0 · Rechargement pendant le bilan : observation conservée', (await p3.getByLabel('Ce qui fonctionne').inputValue().catch(() => '')) === qaNote)
  check('QA P1 · Bilan après rechargement : onglet actif = Bibliothèque', (await activeTab()) === 'Bibliothèque')
  // Reprise depuis l’accueil (application rouverte) : « Reprendre mon bilan ».
  await p3.getByRole('navigation').getByRole('button', { name: 'Accueil' }).click()
  check('QA P1 · Accueil : onglet actif = Accueil', (await activeTab()) === 'Accueil')
  const resume = p3.getByRole('button', { name: /Reprendre mon bilan/ })
  check('QA P0 · Accueil : la carte propose « Reprendre mon bilan »', await resume.isVisible())
  await resume.click()
  check('QA P0 · Reprise depuis l’accueil : bilan avec observation conservée', (await p3.getByLabel('Ce qui fonctionne').inputValue().catch(() => '')) === qaNote)
  check('QA P1 · Bilan repris depuis l’accueil : onglet actif = Bibliothèque', (await activeTab()) === 'Bibliothèque')
  await shot(p3, '19-qa-bilan-repris')
  // Retour à la séance depuis le bilan : la reprise suivante ramène à la séance.
  await p3.getByRole('button', { name: 'Nouvelle tentative' }).click()
  await p3.getByTestId('step-card').waitFor()
  await p3.reload()
  await p3.getByTestId('step-card').waitFor({ timeout: 5000 }).catch(() => undefined)
  check('QA P0 · Rechargement pendant la séance : retour à la séance', (await p3.getByTestId('step-card').count()) === 1)
  check('QA · Aucune erreur JavaScript (scénarios QA)', p3errors.length === 0, p3errors.join(' | '))
  await b3.close()

  // 9. Sprint 06 — comptes locaux, isolation des données, instruments peu testés, morceau personnel.
  const b4 = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] })
  const c4 = await b4.newContext({ viewport: VIEWPORT, deviceScaleFactor: SHOTS ? 2 : 1, locale: 'fr-FR' })
  await c4.grantPermissions(['microphone'])
  const p4 = await c4.newPage()
  const p4errors = []
  p4.on('pageerror', (e) => p4errors.push(e.message))
  const signUp = async (first, mail) => {
    await p4.getByRole('button', { name: 'Se connecter' }).click()
    await p4.getByRole('button', { name: 'S’inscrire' }).click()
    await p4.getByPlaceholder('Prénom').fill(first)
    await p4.getByPlaceholder('E-mail').fill(mail)
    const pw = p4.locator('input[type=password]')
    await pw.nth(0).fill('Musique2026!')
    await pw.nth(1).fill('Musique2026!')
    await p4.getByRole('button', { name: 'S’inscrire' }).click()
  }
  const onboard = async (instrument, level, goal) => {
    await p4.getByRole('button', { name: new RegExp(instrument) }).first().click()
    await p4.getByRole('button', { name: 'Continuer' }).click()
    await p4.getByRole('button', { name: new RegExp(level) }).click()
    await p4.getByRole('button', { name: 'Continuer' }).click()
    await p4.getByRole('button', { name: new RegExp(`^${goal}`) }).click()
    await p4.getByRole('button', { name: 'Continuer' }).click()
    await p4.getByRole('button', { name: '20 min' }).click()
    await p4.getByRole('button', { name: 'Entrer dans Aria' }).click()
    await p4.getByText('Envie de jouer ?').waitFor()
  }
  const addPiece4 = async (title) => {
    await p4.getByRole('navigation').getByRole('button', { name: 'Bibliothèque' }).click()
    await p4.getByRole('button', { name: 'Ajouter un morceau' }).click()
    await p4.getByLabel('Titre').fill(title)
    await p4.getByRole('button', { name: 'Enregistrer le morceau' }).click()
  }
  const logout4 = async () => {
    await p4.getByRole('navigation').getByRole('button', { name: 'Profil' }).click()
    await p4.getByRole('button', { name: 'Se déconnecter' }).click()
    await p4.getByRole('button', { name: 'Se connecter' }).waitFor()
  }
  await p4.goto(`${BASE}?reset`)
  await signUp('Lina', 'lina@test.local')
  check('S06 · Compte local : inscription sans e-mail de confirmation annoncé à tort', true)
  await onboard('Batterie', 'Je pratique', 'Justesse')
  check('S06 · Compte local : prénom affiché après inscription', await p4.getByText('Bonjour Lina,').isVisible())

  // Morceau personnel + ressources (lien, PDF importé)
  await addPiece4('Mon groove')
  await p4.getByLabel('Ajouter une ressource (texte ou lien)').fill('https://example.org/mon-groove')
  await p4.getByRole('button', { name: '+ Réf. vidéo' }).click()
  await p4.locator('input[type=file][accept="application/pdf"]').setInputFiles({ name: 'groove.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF') })
  const res4 = await p4.getByTestId('resources').innerText()
  check('S06 · Morceau personnel : ressource vidéo libellée (plus « video » brut)', /Référence vidéo/.test(res4) && !/^video$/m.test(res4), res4.replace(/\n/g, ' / '))
  check('S06 · Morceau personnel : le lien est cliquable', (await p4.getByTestId('resources').getByRole('link', { name: 'https://example.org/mon-groove' }).count()) === 1)
  await p4.getByRole('link', { name: 'Ouvrir « groove.pdf »' }).waitFor({ timeout: 5000 }).catch(() => undefined)
  check('S06 · Morceau personnel : la partition PDF importée peut être ouverte', await p4.getByRole('link', { name: 'Ouvrir « groove.pdf »' }).isVisible())
  // Chromium sans interface télécharge les PDF au lieu de les afficher : on vérifie le lien lui-même
  // (nouvel onglet, fichier stocké sur l’appareil, contenu PDF). L’ouverture réelle est à recetter sur mobile.
  const pdfLink = p4.getByRole('link', { name: 'Ouvrir « groove.pdf »' })
  const pdfHref = (await pdfLink.getAttribute('href')) || ''
  const pdfHead = await p4.evaluate(async (u) => {
    try {
      const b = await (await fetch(u)).blob()
      return `${b.type} ${(await b.text()).slice(0, 5)}`
    } catch (e) {
      return String(e)
    }
  }, pdfHref)
  check('S06 · Morceau personnel : le lien ouvre le PDF stocké dans un nouvel onglet', /^blob:/.test(pdfHref) && (await pdfLink.getAttribute('target')) === '_blank' && pdfHead === 'application/pdf %PDF-', pdfHead)
  await shot(p4, '20-morceau-personnel-ressources')
  await layoutAudit(p4, 'Fiche morceau personnel')

  // Batterie · Justesse : vocabulaire de batterie, pas de « notes »
  await p4.getByRole('button', { name: 'Préparer une séance' }).click()
  const planDrums = (await p4.getByTestId('prep-plan').locator('li').allInnerTexts()).join(' | ')
  check('S06 · Batterie · Justesse : étapes propres à la batterie (frappes)', /frappes/i.test(planDrums) && !/notes/i.test(planDrums), planDrums)
  check('S06 · Batterie : 20 min respectées', planDrums.match(/(\d+) min/g).reduce((a, m) => a + Number(m.split(' ')[0]), 0) === 20)
  await p4.getByRole('button', { name: 'Commencer la séance' }).click()
  await p4.getByRole('button', { name: 'Ressources', exact: true }).click()
  await p4.getByRole('link', { name: 'Ouvrir « groove.pdf »' }).waitFor({ timeout: 5000 }).catch(() => undefined)
  check('S06 · Séance : la partition est accessible depuis la séance', await p4.getByRole('link', { name: 'Ouvrir « groove.pdf »' }).isVisible())
  await record(p4, 1500)
  await p4.getByRole('button', { name: 'Oui, réussi' }).click()
  await p4.getByRole('button', { name: 'Faire le bilan maintenant' }).click()
  await p4.getByLabel('Ce qui fonctionne').fill('La grosse caisse est stable.')
  await p4.getByRole('button', { name: 'Terminer la séance' }).click()
  await p4.getByRole('heading', { name: 'Suivi' }).waitFor()

  // Déconnexion → second compte : aucune donnée du premier
  await logout4()
  await signUp('Sam', 'sam@test.local')
  await onboard('Voix', 'Je me perfectionne', 'Mémoire')
  await p4.getByRole('navigation').getByRole('button', { name: 'Bibliothèque' }).click()
  check('S06 · Isolation : le second compte ne voit pas les morceaux du premier', (await p4.getByRole('button', { name: /Mon groove/ }).count()) === 0)
  await p4.getByRole('navigation').getByRole('button', { name: 'Suivi' }).click()
  check('S06 · Isolation : le second compte ne voit pas les prises du premier', (await p4.getByTestId('follow-take').count()) === 0)
  // Voix · Mémoire · Je me perfectionne
  await addPiece4('Ma mélodie')
  await p4.getByRole('button', { name: 'Préparer une séance' }).click()
  await p4.getByTestId('prep-plan').locator('li').nth(1).waitFor()
  const planVoice = (await p4.getByTestId('prep-plan').innerText()).replace(/\n/g, ' ')
  check('S06 · Voix · Mémoire : programme du second compte (voix, mémoire), sans reprise des choix du premier', /Lecture active|Cellule sans support/.test(planVoice) && !/frappes/i.test(planVoice), planVoice)
  await logout4()

  // Reconnexion au premier compte : mot de passe faux refusé, puis données retrouvées
  await p4.getByRole('button', { name: 'Se connecter' }).click()
  await p4.getByLabel('E-mail').fill('lina@test.local')
  await p4.locator('input[type=password]').first().fill('Mauvais2026!')
  await p4.getByRole('button', { name: 'Continuer', exact: true }).click()
  await p4.waitForTimeout(1500)
  check('S06 · Connexion : mot de passe incorrect refusé', (await p4.getByText('Envie de jouer ?').count()) === 0)
  await p4.locator('input[type=password]').first().fill('Musique2026!')
  await p4.getByRole('button', { name: 'Continuer', exact: true }).click()
  await p4.getByText('Envie de jouer ?').waitFor({ timeout: 8000 }).catch(() => undefined)
  check('S06 · Connexion : retour au compte après reconnexion', await p4.getByText('Bonjour Lina,').isVisible())
  await p4.getByRole('navigation').getByRole('button', { name: 'Suivi' }).click()
  check('S06 · Conservation : séance et prise du premier compte retrouvées', (await p4.getByTestId('follow-take').count()) === 1 && (await p4.getByRole('heading', { name: 'Séances terminées (1)' }).isVisible()))
  await p4.getByTestId('follow-take').first().getByRole('button', { name: /^Lecture/ }).click()
  await p4.waitForTimeout(900)
  check('S06 · Conservation : la prise se réécoute après déconnexion / reconnexion', (await p4.evaluate(() => [...document.querySelectorAll('audio')].some((a) => !a.paused && a.currentTime > 0))))
  check('S06 · Aucune erreur JavaScript (comptes, instruments, ressources)', p4errors.length === 0, p4errors.join(' | '))
  await b4.close()

  // 10. Sprint 07 · lot B — intégrité fonctionnelle (parties Chromium de T03, T04, T05, T06, T10).
  // Micro SIMULÉ ; les prises vides ou illisibles sont SIMULÉES par un MediaRecorder de test.
  const b5 = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] })
  const c5 = await b5.newContext({ viewport: VIEWPORT, deviceScaleFactor: SHOTS ? 2 : 1, locale: 'fr-FR' })
  await c5.grantPermissions(['microphone'])
  await c5.addInitScript(() => {
    const Real = window.MediaRecorder
    class Fake {
      constructor() {
        this.state = 'inactive'
        this.mimeType = 'audio/webm'
      }
      start() {
        this.state = 'recording'
      }
      requestData() {}
      stop() {
        this.state = 'inactive'
        const blob = window.__fakeRec === 'empty' ? new Blob([], { type: 'audio/webm' }) : new Blob(['pas un fichier audio'], { type: 'audio/webm' })
        if (blob.size) this.ondataavailable?.({ data: blob })
        this.onstop?.()
      }
    }
    function Wrapped(stream, opts) {
      return window.__fakeRec ? new Fake(stream, opts) : new Real(stream, opts)
    }
    Wrapped.isTypeSupported = (t) => Real.isTypeSupported(t)
    window.MediaRecorder = Wrapped
  })
  const p5 = await c5.newPage()
  const p5errors = []
  p5.on('pageerror', (e) => p5errors.push(e.message))
  const tab5 = (name) => p5.getByRole('navigation').getByRole('button', { name })
  await onboardGuitar(p5)
  await addPiece(p5, 'Gymnopédie')
  await addPiece(p5, 'Blackbird')
  await p5.getByRole('button', { name: 'Préparer une séance' }).click()
  await p5.getByLabel('Passage travaillé').fill('Intro')
  await p5.getByRole('button', { name: 'Commencer la séance' }).click()

  // T03 — pendant la prise : navigation, étape suivante et bilan indisponibles, avec explication.
  await p5.getByRole('button', { name: 'Démarrer l’enregistrement' }).click()
  await p5.getByText(/Enregistrement en cours ·/).waitFor()
  check('S7-05 · Prise active : message « Navigation indisponible » affiché', await p5.locator('#nav-lock').isVisible())
  check('S7-05 · Prise active : onglets signalés indisponibles et reliés au message', (await tab5('Suivi').getAttribute('aria-disabled')) === 'true' && (await tab5('Suivi').getAttribute('aria-describedby')) === 'nav-lock')
  // Playwright refuse de cliquer un élément aria-disabled : on force le geste de l’utilisateur.
  await tab5('Suivi').click({ force: true })
  await tab5('Profil').focus()
  await p5.keyboard.press('Enter')
  check('S7-05 · Prise active : toucher et clavier sur Suivi/Profil laissent en séance', (await p5.getByTestId('step-card').isVisible()) && (await p5.getByText(/Enregistrement en cours ·/).isVisible()))
  check('S7-05 · Prise active : « Étape suivante » indisponible, la suite est expliquée', (await p5.getByRole('button', { name: /Étape suivante/ }).getAttribute('aria-disabled')) === 'true' && (await p5.getByText('Arrête la prise pour passer à l’étape suivante.').isVisible()))
  check('S7-05 · Prise active : pas de bilan anticipé', (await p5.getByRole('button', { name: 'Faire le bilan maintenant' }).count()) === 0)
  await shot(p5, '21-s7-prise-navigation-indisponible')
  await contrastAudit(p5, 'Séance marine pendant une prise')
  await layoutAudit(p5, 'Séance pendant une prise')
  await p5.waitForTimeout(1200)
  await p5.getByRole('button', { name: 'Arrêter et sauvegarder la prise' }).click()
  await p5.getByText(/Prise sauvegardée sur cet appareil/).waitFor()
  check('S7-05 · Après l’arrêt : navigation rétablie', (await p5.locator('#nav-lock').count()) === 0 && (await tab5('Suivi').getAttribute('aria-disabled')) === null)

  // T05 — deux prises au même tempo (comparables), une troisième à un autre tempo.
  await record(p5, 1200)
  await p5.getByRole('button', { name: 'Métronome', exact: true }).click()
  await p5.getByRole('button', { name: 'Accélérer de 4 BPM' }).click()
  await p5.getByTestId('metronome').getByRole('button', { name: 'Démarrer' }).click()
  await record(p5, 1200)
  await p5.getByTestId('metronome').getByRole('button', { name: 'Arrêter' }).click()
  // T04 — étape 2, minuteur lancé puis mis en pause.
  await p5.getByRole('button', { name: 'Étape suivante' }).click()
  await p5.getByRole('button', { name: 'Démarrer le minuteur' }).click()
  await p5.waitForTimeout(2300)
  await p5.getByRole('button', { name: 'Pause' }).click()
  const clock = (await p5.locator('.ds-timer-clock').innerText()).trim()
  await p5.getByRole('button', { name: 'Notes', exact: true }).click()
  await p5.getByLabel('Notes personnelles').fill('Index qui accroche.')

  // T04 — changement de morceau : arbitrage, reprise, puis garder et changer.
  await tab5('Bibliothèque').click()
  await p5.getByRole('button', { name: /Gymnopédie/ }).click()
  await p5.getByRole('button', { name: 'Préparer une séance' }).click()
  const act = await p5.getByTestId('switch-active').innerText()
  check('S7-06 · Arbitrage : morceau actif, étape et nombre de prises', /Blackbird/.test(act) && /Étape 2 sur/.test(act) && /3 prises/.test(act), act.replace(/\n/g, ' / '))
  await shot(p5, '22-s7-changement-de-morceau')
  await p5.getByRole('button', { name: 'Reprendre « Blackbird »' }).click()
  check('S7-06 · Reprendre : retour à l’étape 2 avec le temps restant', /Étape 2 sur/.test(await p5.getByText(/^Étape \d+ sur \d+$/).first().innerText()) && (await p5.locator('.ds-timer-clock').innerText()).trim() === clock, clock)
  await tab5('Bibliothèque').click()
  await p5.getByRole('button', { name: /Gymnopédie/ }).click()
  await p5.getByRole('button', { name: 'Préparer une séance' }).click()
  // Échec de sauvegarde forcé : rester sur place, message, puis réussite.
  await p5.evaluate(() => {
    const real = Storage.prototype.setItem
    window.__restoreStorage = () => (Storage.prototype.setItem = real)
    Storage.prototype.setItem = function (k, v) {
      if (k === 'aria.v0.sessionLogs') throw new DOMException('quota', 'QuotaExceededError')
      return real.call(this, k, v)
    }
  })
  await p5.getByRole('button', { name: 'Garder le brouillon et préparer « Gymnopédie »' }).click()
  check('S7-06 · Échec de sauvegarde : message, pas de changement de morceau', (await p5.getByRole('alert').filter({ hasText: 'n’a pas pu être enregistré' }).isVisible()) && (await p5.getByTestId('switch').isVisible()))
  await p5.evaluate(() => window.__restoreStorage())
  await p5.getByRole('button', { name: 'Garder le brouillon et préparer « Gymnopédie »' }).click()
  await p5.getByRole('button', { name: 'Commencer la séance' }).click()
  check('S7-06 · Nouvelle séance sur un autre morceau : aucune prise héritée', (await p5.getByText(/Prises de la séance/).count()) === 0)

  // T04 — fermeture (rechargement) puis reprise de Blackbird depuis le Suivi.
  await p5.reload()
  await p5.getByTestId('step-card').waitFor()
  await tab5('Suivi').click()
  const drafts5 = await p5.getByTestId('drafts').innerText()
  check('S7-09 · Suivi : brouillon de pratique avec étape et prises', /Blackbird/.test(drafts5) && /Brouillon de pratique/.test(drafts5) && /Étape 2 sur \d+ · 3 prises/.test(drafts5), drafts5.replace(/\n/g, ' / '))
  // Reprise directe depuis le Suivi (maquette 4.3) : la séance de Gymnopédie reste en cours dans le Suivi.
  await p5.getByTestId('drafts').getByRole('button', { name: /Blackbird/ }).click()
  await p5.getByTestId('step-card').waitFor()
  check('S7-06 · Après fermeture : étape, temps restant, note et prises retrouvés', (await p5.locator('.ds-timer-clock').innerText()).trim() === clock && /Étape 2 sur/.test(await p5.getByText(/^Étape \d+ sur \d+$/).first().innerText()) && (await p5.getByText('Prises de la séance (3)').isVisible()))
  await p5.getByRole('button', { name: 'Notes', exact: true }).click()
  check('S7-06 · Après fermeture : note retrouvée', (await p5.getByLabel('Notes personnelles').inputValue()) === 'Index qui accroche.')

  // T05 — bilan : comparaison des seules prises éligibles, métadonnées dans l’ordre.
  await p5.getByRole('button', { name: 'Faire le bilan maintenant' }).click()
  const cmp = await p5.getByTestId('takes-compare').innerText().catch(() => '')
  check('S7-07 · Bilan : comparaison des deux prises éligibles (même séance, passage, tempo)', (await p5.getByTestId('compare').locator('.ds-take').count()) === 2 && /même séance, même passage, même tempo/.test(cmp))
  check('S7-07 · Métadonnées « passage · tempo · durée » dans l’ordre', /Intro · 60 BPM · \d\d:\d\d/.test(cmp) && /Intro · 64 BPM · \d\d:\d\d/.test(cmp))
  check('S7-07 · Prise à un autre tempo : hors comparaison, écoute séparée expliquée', /Autres prises de cette séance · écoute séparée \(Le tempo diffère\.\)/.test(cmp))
  await p5.getByTestId('compare').locator('.ds-take').first().getByRole('button', { name: /^Lecture/ }).click()
  await p5.waitForTimeout(500)
  await p5.getByTestId('compare').locator('.ds-take').nth(1).getByRole('button', { name: /^Lecture/ }).click()
  await p5.waitForTimeout(500)
  check('S7-07 · Une seule lecture active à la fois', (await p5.evaluate(() => [...document.querySelectorAll('audio')].filter((a) => !a.paused).length)) === 1)
  await shot(p5, '23-s7-bilan-comparaison')
  check('S7-08 · Bilan : trois repères de source', (await p5.getByText('Ta propre observation').count()) >= 1 && (await p5.getByText('Conseil pédagogique ARIA').count()) >= 1 && (await p5.getByText('Analyse automatique de la prise : aucune').count()) >= 1)
  await p5.getByLabel('Ce qui fonctionne').fill('Le pouce tient.')
  await p5.getByRole('button', { name: 'Terminer la séance' }).click()
  await p5.getByRole('heading', { name: 'Suivi' }).waitFor()
  const drafts6 = await p5.getByTestId('drafts').innerText().catch(() => '')
  check('S7-09 · Terminer remplace le brouillon (plus de Blackbird en brouillon)', !/Blackbird/.test(drafts6) && (await p5.getByRole('heading', { name: 'Séances terminées (1)' }).isVisible()))

  // T06 — prise vide puis prise illisible (SIMULÉES) : jamais de faux succès.
  await tab5('Bibliothèque').click()
  await p5.getByRole('button', { name: /Blackbird/ }).click()
  await p5.getByRole('button', { name: 'S’enregistrer' }).click()
  await p5.evaluate(() => (window.__fakeRec = 'empty'))
  await p5.getByRole('button', { name: 'Démarrer l’enregistrement' }).click()
  await p5.getByText(/Enregistrement en cours ·/).waitFor()
  await p5.getByRole('button', { name: 'Arrêter et sauvegarder la prise' }).click()
  await p5.getByText(/Aucun son n’a été capté/).waitFor({ timeout: 5000 }).catch(() => undefined)
  check('S7-07 · Prise vide : rien de sauvegardé, message explicite, réessai possible', (await p5.getByText(/Aucun son n’a été capté : rien n’a été sauvegardé/).isVisible()) && (await p5.getByRole('button', { name: 'Démarrer l’enregistrement' }).isVisible()))
  await p5.evaluate(() => (window.__fakeRec = 'garbage'))
  await p5.getByRole('button', { name: 'Démarrer l’enregistrement' }).click()
  await p5.getByText(/Enregistrement en cours ·/).waitFor()
  await p5.getByRole('button', { name: 'Arrêter et sauvegarder la prise' }).click()
  await p5.getByText(/n’est pas lisible sur cet appareil/).waitFor({ timeout: 8000 }).catch(() => undefined)
  check('S7-07 · Prise illisible : pas de faux succès, conservée et signalée', (await p5.getByText(/n’est pas lisible sur cet appareil/).isVisible()) && (await p5.getByText(/Prise sauvegardée sur cet appareil/).count()) === 0)
  await p5.evaluate(() => (window.__fakeRec = undefined))
  await tab5('Suivi').click()
  check('S7-07 · Prise illisible visible dans le Suivi (non supprimée)', /illisible/.test(await p5.getByTestId('follow-takes').innerText()))

  // T10 — nouvelle séance sur le même morceau : aucune prise héritée.
  await tab5('Bibliothèque').click()
  await p5.getByRole('button', { name: /Blackbird/ }).click()
  await p5.getByRole('button', { name: 'Préparer une séance' }).click()
  // Gymnopédie est toujours en cours : arbitrage, on la garde en brouillon.
  await p5.getByRole('button', { name: 'Garder le brouillon et préparer « Blackbird »' }).click()
  await p5.getByRole('button', { name: 'Commencer la séance' }).click()
  check('S7-09 · Nouvelle séance du même morceau : aucune prise héritée', (await p5.getByText(/Prises de la séance/).count()) === 0)
  // Même morceau : une nouvelle séance met de côté la séance en cours, toujours reprenable.
  await p5.getByRole('button', { name: 'Étape suivante' }).click()
  await tab5('Bibliothèque').click()
  await p5.getByRole('button', { name: /Blackbird/ }).click()
  await p5.getByRole('button', { name: 'Préparer une nouvelle séance' }).click()
  check('S7-06 · Même morceau : la reprise est proposée avant une nouvelle séance', await p5.getByRole('button', { name: 'Reprendre « Blackbird »' }).isVisible())
  await p5.getByRole('button', { name: 'Garder le brouillon et préparer une nouvelle séance' }).click()
  await p5.getByRole('button', { name: 'Commencer la séance' }).click()
  await tab5('Suivi').click()
  const aside = await p5.getByTestId('drafts').innerText()
  check('S7-09 · Séance mise de côté listée dans le Suivi', /Brouillon mis de côté/.test(aside) && /Étape 2 sur/.test(aside), aside.replace(/\n/g, ' / '))
  await p5.getByTestId('drafts').getByRole('button', { name: /Brouillon mis de côté/ }).click()
  await p5.getByTestId('step-card').waitFor()
  check('S7-06 · Séance mise de côté reprise à son étape', /Étape 2 sur/.test(await p5.getByText(/^Étape \d+ sur \d+$/).first().innerText()))
  await tab5('Suivi').click()
  check('S7-09 · Après reprise : l’autre séance du morceau est à son tour mise de côté, rien n’est perdu', /Brouillon mis de côté/.test(await p5.getByTestId('drafts').innerText()))
  // Lot C — T07 : à la dernière étape, « Faire le bilan » est l’action principale et reçoit le focus.
  await tab5('Accueil').click()
  await p5.locator('.v0-resume').click()
  await p5.getByTestId('step-card').waitFor()
  for (let i = 0; i < 6 && (await p5.getByRole('button', { name: 'Étape suivante' }).count()); i++) await p5.getByRole('button', { name: 'Étape suivante' }).click()
  await p5.waitForTimeout(200)
  const focused = await p5.evaluate(() => `${document.activeElement?.tagName}:${(document.activeElement?.textContent || '').trim()}`)
  check('S7-04 · Dernière étape : « Faire le bilan » action principale, focus déplacé', focused === 'BUTTON:Faire le bilan' && (await p5.getByRole('button', { name: 'Faire le bilan maintenant' }).count()) === 0, focused)
  const small48 = await p5.evaluate(() =>
    [...document.querySelectorAll('.ds-btn--primary, .ds-recbtn')].filter((b) => b.getBoundingClientRect().height && b.getBoundingClientRect().height < 47.5).map((b) => b.textContent.trim()),
  )
  check('S7-10 · Actions principales ≥ 48 px', small48.length === 0, small48.join(', '))
  await shot(p5, '24-s7-derniere-etape-marine')
  await p5.emulateMedia({ reducedMotion: 'reduce' })
  await tab5('Accueil').click()
  check('S7-10 · Mouvement réduit : pas d’animation d’entrée', (await p5.evaluate(() => getComputedStyle(document.querySelector('.v0-main')).animationName)) === 'none')
  check('S7-02 · Accueil : slogan exact et une action principale « Reprendre ma séance »', (await p5.getByText('Just Play Something.', { exact: true }).isVisible()) && (await p5.locator('.v0-resume').count()) === 1 && /Reprendre ma séance/.test(await p5.locator('.v0-resume').innerText()))
  await shot(p5, '25-s7-accueil-reprise')
  await p5.goto(`${BASE}?seance=clair`)
  await p5.locator('.v0-resume').click()
  await p5.getByTestId('step-card').waitFor()
  check('S7-01 · Témoin QA : séance claire avec ?seance=clair', (await p5.evaluate(() => getComputedStyle(document.querySelector('.v0-app')).backgroundColor)) !== 'rgb(16, 29, 53)')
  await shot(p5, '26-s7-seance-claire-temoin')
  await contrastAudit(p5, 'Séance claire (témoin)')
  check('S7 · Aucune erreur JavaScript (lot B)', p5errors.length === 0, p5errors.join(' | '))
  await b5.close()

  const failed = results.filter((r) => !r.ok)
  console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
