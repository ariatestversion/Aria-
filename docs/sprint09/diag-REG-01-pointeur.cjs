// Sprint 09 · diagnostic de la divergence « pointeur » sur S08-QA-REG-01 (ChatGPT QA).
// Aucune modification applicative : ce script rejoue le scénario du QA et clique à des coordonnées fixes,
// comme un agent de navigateur qui clique sur ce qu’il voit à l’écran.
// Usage : npx vite preview --port 43123, puis node docs/sprint09/diag-REG-01-pointeur.cjs [URL] [LxH,…]
const { chromium } = require('playwright')
const BASE = process.argv[2] || 'http://localhost:43123/'
const VPS = (process.argv[3] || '1920x1080,1348x936,1280x720,390x844').split(',')

async function scenario(page) {
  await page.goto(BASE + '?reset')
  await page.getByRole('button', { name: 'Commencer' }).click()
  await page.getByRole('button', { name: /Piano/ }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByRole('button', { name: /Je débute/ }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByRole('button', { name: /^Rythme/ }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByRole('button', { name: '15 min' }).click()
  await page.getByRole('button', { name: /^Entrer dans / }).click()
  await page.getByRole('navigation').getByRole('button', { name: 'Bibliothèque' }).click()
  await page.getByRole('button', { name: 'Ajouter un morceau' }).click()
  await page.getByLabel('Titre').fill('Diagnostic pointeur')
  await page.getByRole('button', { name: 'Enregistrer le morceau' }).click()
  await page.getByRole('button', { name: 'Préparer une séance' }).click()
  await page.getByRole('button', { name: 'Commencer la séance' }).click()
  for (let i = 0; i < 6 && (await page.getByRole('button', { name: 'Étape suivante' }).count()); i++) await page.getByRole('button', { name: 'Étape suivante' }).click()
  await page.getByRole('button', { name: 'Faire le bilan', exact: true }).click()
  await page.getByTestId('review-title').waitFor()
  await page.getByRole('button', { name: 'Garder en brouillon' }).click()
  await page.getByRole('navigation').getByRole('button', { name: 'Accueil' }).click()
  await page.reload()
  await page.getByText('Envie de jouer ?').waitFor()
  await page.locator('.v0-resume').click()
  await page.getByTestId('review-title').waitFor()
  await page.waitForTimeout(300)
}
const state = async (p) => ((await p.getByTestId('review-title').count()) ? 'bilan toujours affiché' : (await p.getByTestId('step-card').count()) ? 'séance (attendu)' : 'autre écran (barre de navigation)')

;(async () => {
  const browser = await chromium.launch()
  for (const s of VPS) {
    const [width, height] = s.split('x').map(Number)
    const page = await (await browser.newContext({ viewport: { width, height }, locale: 'fr-FR' })).newPage()
    await scenario(page)
    const g = await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Reprendre la séance')
      const r = btn.getBoundingClientRect(), dock = document.querySelector('.v0-dock').getBoundingClientRect()
      return { top: r.top, bottom: r.bottom, cx: r.left + r.width / 2, dockTop: dock.top }
    })
    const visible = Math.max(0, Math.min(g.bottom, g.dockTop) - g.top)
    console.log(`\n${s} : « Reprendre la séance » y ${Math.round(g.top)}–${Math.round(g.bottom)}, barre de navigation à y ${Math.round(g.dockTop)} → ${visible >= 52 ? 'entièrement visible' : visible > 0 ? `seulement ${Math.round(visible)} px visibles au-dessus de la barre` : 'masqué, il faut faire défiler'}`)
    const trials = [['clic par rôle (défile automatiquement)', (p) => p.getByRole('button', { name: 'Reprendre la séance' }).click()]]
    if (visible > 0) trials.push(['clic sur la partie visible du bouton', (p) => p.mouse.click(g.cx, g.top + visible / 2)])
    if (visible > 0 && visible < 52) trials.push(['clic juste sous la partie visible (sur la barre)', (p) => p.mouse.click(g.cx, g.dockTop + 12)])
    for (const [name, act] of trials) { await scenario(page); await act(page); await page.waitForTimeout(500); console.log(`  ${name.padEnd(48)} → ${await state(page)}`) }
    await page.context().close()
  }
  await browser.close()
})()
