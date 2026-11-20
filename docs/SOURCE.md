# Dépôts ARIA — source de vérité

## Référence actuelle (à partir du Sprint 04)

| Rôle | Dépôt / service |
| --- | --- |
| **Dépôt de référence** | GitHub `ariatestversion/Aria-` (id 1428103245). L’ancienne adresse `ariaversionnouvelle/Aria-` redirige vers ce même dépôt. |
| **Branche stable** | `main` |
| **Branches de sprint** | `claude/sprint04-experience-musicale`, … (une branche dédiée par sprint) |
| **Netlify** | Projet existant `ariafirstversion` (id `3ae885ef-950d-4291-bbf7-60bfd310e6aa`) |
| **Développement** | Claude Code depuis le Sprint 04, en remplacement de Cursor |

Base du Sprint 04 : commit GitHub `23ea182` sur `main`. Il contient la source Cursor `104645c` du Sprint 03, sans l’historique Git de Cursor (voir `SOURCE_VERSION.json` de ce commit).

## Processus de livraison

1. Créer une branche dédiée depuis `main`. Ne jamais réécrire l’historique ni supprimer de branche.
2. `npm ci && npm run build && npm test && node scripts/e2e-sprint04.mjs` (après `npx vite preview --port 43123`).
3. Mettre à jour `CHANGELOG.md`, la documentation et les captures `docs/screenshots/sprintNN/`.
4. Pousser la branche sur `ariatestversion/Aria-`.
5. Déployer une **prévisualisation** (brouillon) Netlify sur `ariafirstversion`.
6. Vérifier que `https://<deploy-id>--ariafirstversion.netlify.app/version.json` contient bien le commit poussé.
7. **Production uniquement après validation explicite.**

`npm run build` génère `public/version.json` (commit, branche, date) : c’est la preuve de correspondance entre le commit GitHub et le déploiement Netlify. `SOURCE_VERSION.json` enregistre le dernier couple commit / déploiement de prévisualisation.

## Publication

| Cible | URL |
| --- | --- |
| Netlify production | https://ariafirstversion.netlify.app/ (non modifiée sans autorisation) |
| Netlify prévisualisation | `https://<deploy-id>--ariafirstversion.netlify.app` |
| GitHub Pages (historique) | https://ariatestversion.github.io/Aria-/ (branche `gh-pages`, non mise à jour au Sprint 04) |

## Historique

- Sprints 01 à 03 : développés par Cursor dans `elodie-yebga-samnick/link-doctor` et synchronisés vers `ariatestversion/Aria-`. Le site Netlify `ariaversionfinale` est obsolète : ne plus le cibler.
- Sprint 04 : reprise par Claude Code directement sur `ariatestversion/Aria-`.
