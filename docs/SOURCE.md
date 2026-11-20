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

## État Sprint 04 — prototype V0.4 (clôture)

- Branche `claude/sprint04-experience-musicale`. **Source déployée : commit `99a313e`** (`99a313eb9beff358f3ea95cfcb18cc495a4de343`). Le commit suivant ne contient que cette documentation de livraison.
- **Prévisualisation définitive V0.4** : https://6b0076bca18fd5cc811ba140--ariafirstversion.netlify.app (déploiement `6b0076bca18fd5cc811ba140`, non publié).
- **Production verrouillée** sur le Sprint 02 : déploiement `6aff204b188f1862668a1bab`, commit `d86e813`, `locked: true`. Aucune mise en production ni aucun déverrouillage n’a été fait.
- **Correspondance GitHub ↔ Netlify** :
  - `version.json` = `99a313e`, branche `claude/sprint04-experience-musicale` ;
  - `assets/index-DDrk4lBb.js` et `assets/index-Bom41a6f.css` identiques (SHA-256) au build local ;
  - e2e 65/65 sur l’URL (micro simulé).
- Prévisualisations précédentes, remplacées : `6b00649f…` (`cf42503`) et `6b006f0b…` (`820bfe3`, celle des tests physiques).

### Déploiement par le connecteur Netlify (procédure)

1. Vérifier que la production est verrouillée (`locked: true` sur le déploiement publié).
2. `npm run build` depuis un arbre propre, au commit poussé : `public/version.json` porte ce commit.
3. Lancer la commande fournie par l’opération `deploy-site` avec `NODE_USE_ENV_PROXY=1` (proxy de la session). L’hôte `mcp.netlify.com` doit être autorisé dans l’environnement.
4. Contrôler par l’API : nouveau déploiement `ready` et `published_at: null` ; le déploiement publié reste inchangé.
5. Vérifier `/version.json` et les bundles sur l’URL `https://<deploy-id>--ariafirstversion.netlify.app`, puis exécuter le parcours e2e sur cette URL.

## Publication

| Cible | URL |
| --- | --- |
| Netlify production | https://ariafirstversion.netlify.app/ (non modifiée sans autorisation) |
| Netlify prévisualisation | `https://<deploy-id>--ariafirstversion.netlify.app` |
| GitHub Pages (historique) | https://ariatestversion.github.io/Aria-/ (branche `gh-pages`, non mise à jour au Sprint 04) |

## Historique

- Sprints 01 à 03 : développés par Cursor dans `elodie-yebga-samnick/link-doctor` et synchronisés vers `ariatestversion/Aria-`. Le site Netlify `ariaversionfinale` est obsolète : ne plus le cibler.
- Sprint 04 : reprise par Claude Code directement sur `ariatestversion/Aria-`.
