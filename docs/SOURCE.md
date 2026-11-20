# Dépôts ARIA — source de vérité

## Vérification Sprint 03 (2026-11-20)

| Rôle | Dépôt / service | Preuve |
| --- | --- | --- |
| **Source utilisée par Cursor** | Origin `elodie-yebga-samnick/link-doctor` | Environnement Cloud Agent + workspace courant |
| **Relié à Netlify** | Site `ariafirstversion` (id `3ae885ef-950d-4291-bbf7-60bfd310e6aa`) | `netlify status` → Project URL `https://ariafirstversion.netlify.app` + `netlify.toml` du repo |
| **Miroir public / reprise hors Cursor** | GitHub `ariatestversion/Aria-` (`main`) | Code source complet synchronisé à chaque lot |
| **Pages** | `ariatestversion/Aria-` branche `gh-pages` | https://ariatestversion.github.io/Aria-/ |

**Conclusion :** Cursor développe et déploie depuis **`link-doctor` (Origin)** vers Netlify **`ariafirstversion`**.  
Pour reprendre **sans Cursor**, cloner **`https://github.com/ariatestversion/Aria-`** (`main`), puis `npm install && npm run dev`.

## Publication

| Cible | URL |
| --- | --- |
| Netlify prod | https://ariafirstversion.netlify.app/ |
| Netlify draft | `https://<deploy-id>--ariafirstversion.netlify.app` |
| GitHub Pages | https://ariatestversion.github.io/Aria-/ |

Alignement : `version.json` (build) + `SOURCE_VERSION.json` sur GitHub `main`.

## Anciennes références (obsolètes)

- Netlify `ariaversionfinale` : ancien site, **ne plus cibler**.
- Affirmer que seul `Aria-` est « le » dépôt Cursor : **incorrect** — Cursor travaille sur `link-doctor`, synchronisé vers `Aria-`.
