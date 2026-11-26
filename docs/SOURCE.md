# Dépôts ARIA — source de vérité

## Référence actuelle (à partir du Sprint 04)

| Rôle | Dépôt / service |
| --- | --- |
| **Dépôt de référence** | GitHub `ariatestversion/Aria-` (id 1428103245). L’ancienne adresse `ariaversionnouvelle/Aria-` redirige vers ce même dépôt. |
| **Branche stable** | `main` (Alpha V0.6 depuis le 24/11/2026) |
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

## État Sprint 09 — Validation finale et stabilisation du MVP (en cours, 26/11/2026)

- Branche `claude/sprint09-validation` depuis `claude/sprint08-identite` (application = `975e9ea` au départ). Non fusionnée.
- **Candidate n° 1** (`22dbdc2`, déploiement `6b085b5efaedcc23d9d0dea3`, non publiée) : https://6b085b5efaedcc23d9d0dea3--ariafirstversion.netlify.app — corrections S08-ENG-01 et S08-QA-01.
- Diagnostic, constats S09-D-01 à D-05, plan et estimation : `docs/recettes/sprint09.md`.
- **Lien public** : verrouillé sur le Sprint 02 (`d86e813`), non modifié.

## État Sprint 08 — Identité visuelle Nuit & cuivre (clôture technique sous réserves, 26/11/2026)

- **Référence figée : `975e9ea`** (prévisualisation 3, application identique à `cf3d2c9`). Branche `claude/sprint08-identite` conservée, non fusionnée. S08-QA-REG-01 : non reproduit, en attente de preuve (contrôle Safari / iPhone ajouté à R09-02). S08-ENG-01 et S08-QA-01 inscrits au Sprint 09.

- Branche `claude/sprint08-identite` depuis `1276a2a` (code applicatif = `d5e4a7a`). Non fusionnée.
- **Prévisualisation 3** (`975e9ea`, déploiement `6b084f388ee01180268c44f2`, non publiée) : https://6b084f388ee01180268c44f2--ariafirstversion.netlify.app. Application identique à la prévisualisation 2 ; test S08-QA-REG-01 ajouté. Pour la contre-recette QA.
- **Prévisualisation 2, Nuit & cuivre** (`cf3d2c9`, déploiement `6b081146e39e7cb1bbd3e2d5`, non publiée) : https://6b081146e39e7cb1bbd3e2d5--ariafirstversion.netlify.app · variante papier `?accueil=papier` · DA A `?theme=blanc`. Recette : `docs/recettes/sprint08.md`.
- Prévisualisation 1 (`beae6f9`, déploiement `6b0804d87e195655f192fa0d`, non publiée) : https://6b0804d87e195655f192fa0d--ariafirstversion.netlify.app — palettes candidates `?theme=cuivre` et `?theme=bleu`, défaut DA A inchangé.
- Faisabilité et blocages : `docs/sprint08/FAISABILITE.md`. Préparation du Sprint 09 : `docs/recettes/sprint09.md`.
- **Lien public** : verrouillé sur le Sprint 02 (`d86e813`), non modifié.

## État Sprint 07 — Intégration et consolidation (clôture technique sous réserves, 25/11/2026)

- **Référence applicative validée sous réserves : `d5e4a7a`** (`d5e4a7a8eed38e28ce9d4e3722136239d0e82da7`). Développements gelés. Les commits suivants de la branche ne modifient que la documentation : le code applicatif (`src/`, `index.html`, `package.json`) est identique à `d5e4a7a`.
- **Prévisualisation de référence** : https://6b06f9934ca1d2e7fb6e60b2--ariafirstversion.netlify.app (prévisualisation 4, `6b06f9934ca1d2e7fb6e60b2`). Vérifiée le 25/11 : `ready`, non publiée, sans date d’expiration.
- Branche `claude/sprint07-integration` depuis `main` (`f0a61a0`). **Non fusionnée.** Vérifié le 25/11 : 0 commit de retard sur `main`, 12 commits d’avance en comptant ce commit de clôture documentaire. `main` est un ancêtre de la branche : la fusion se fera sans conflit.
- Réserves transférées au Sprint 09 : R09-01 à R09-04 (registre des sprints & décisions produit).
- Prévisualisations successives (toutes conservées, non publiées) : 1 (`397d6d5`), 2 (`8a109c3`), 3 (`a7d1690`), 4 (`d5e4a7a`, déploiement `6b06f9934ca1d2e7fb6e60b2`, corrections QA-01 / QA-02) ; dernier couple commit / déploiement dans `SOURCE_VERSION.json`.
- Recette : `docs/recettes/sprint07.md`. Contre-recette QA du 25/11 : QA-01 et QA-02 corrigés sur Chrome, QA-03 non reproduit.

### Modalités de fusion dans `main` (à exécuter uniquement sur autorisation explicite)

La fusion ne publie rien : la production Netlify est un déploiement verrouillé, indépendant de `main`.
1. Autorisation écrite du Product Management ou du Head of Product.
2. Mettre `main` à jour, puis contrôler que la branche contient bien `d5e4a7a` :
   ```bash
   git fetch origin main claude/sprint07-integration
   git merge-base --is-ancestor d5e4a7a origin/claude/sprint07-integration
   ```
3. Fusionner sans réécriture d’historique (même méthode qu’aux Sprints 05 et 06) :
   ```bash
   git checkout main && git merge --no-ff origin/claude/sprint07-integration
   ```
4. Revérifier sur `main` : `npm ci && npm run build && npm test`, puis `npx vite preview --port 43123` et `node scripts/e2e-sprint04.mjs` (attendu : 44/44 et 240/240). Contrôler que `git diff d5e4a7a main -- src index.html package.json` est vide.
5. Pousser `main` ; conserver la branche (aucune suppression, aucun force-push).
6. Tag proposé : `v0.7.0-alpha` sur la fusion. Il est à créer depuis GitHub, comme `v0.5.0-alpha` et `v0.6.0-alpha`, qui restent à créer.
7. Aucun déploiement de production : la publication exige une autorisation distincte et la levée des réserves R09-01 à R09-04.
- **Lien public** : verrouillé sur le Sprint 02 (`6aff204b…`, `d86e813`), non modifié.

## État Sprint 06 — Alpha V0.6 (clôture technique, 24/11/2026)

- **Clôturé et figé** : `claude/sprint06-finalisation-v1` fusionnée dans `main` (merge `--no-ff`, historique conservé). Branche conservée.
- **Commit applicatif audité et figé : `67aa241`.** Le code applicatif de `main` lui est identique ; les commits suivants ne changent que la documentation.
- **Prévisualisation définitive** : https://6b05c4864a41ea883858ac80--ariafirstversion.netlify.app (`6b05c4864a41ea883858ac80`, non publiée, conservée).
- **Tag proposé** `v0.6.0-alpha` : à créer depuis GitHub.
- **Lien public** : verrouillé sur le Sprint 02 (`6aff204b…`, `d86e813`), non modifié.
- Base de travail des Product Designers et de la direction artistique. Pas de Sprint 07 sans autorisation.
- Recette : `docs/recettes/sprint06.md` ; bilan et réserves : `docs/BILAN_SPRINT06.md`.

## État Sprint 05 — Alpha V0.5 (clôture technique, 24/11/2026)

- **Clôturé et figé** : `claude/sprint05-pratique` fusionnée dans `main` (merge `--no-ff`, historique conservé). Branche conservée.
- **Commit applicatif figé : `d79b2d2`.** Le code applicatif de `main` lui est identique ; les commits suivants ne changent que la documentation.
- **Prévisualisation définitive** : https://6b05bcb61ae60f91656e77ef--ariafirstversion.netlify.app (`6b05bcb61ae60f91656e77ef`, non publiée, conservée).
- **Tag proposé** `v0.5.0-alpha` : à créer depuis GitHub (push de tag refusé à la session).
- **Production** : verrouillée sur le Sprint 02 (`6aff204b…`, `d86e813`). Aucune modification du lien public sans autorisation explicite.
- Recette : `docs/recettes/sprint05.md` ; bilan : `docs/BILAN_SPRINT05.md` ; reports : `docs/BACKLOG.md` (Sprint 06).
- **Sprint 06** : branche dédiée depuis `main` après cette fusion, avec sa propre prévisualisation Netlify.

## État Sprint 04 — ARIA MVP Alpha V0.4 (clôture)

- **Clôturé et figé** : branche fusionnée dans `main` (merge commit `5fead7f`, historique conservé).
- **Tag `v0.4.0-alpha`** : créé sur GitHub par la porteuse du projet (pre-release « ARIA — MVP Alpha V0.4 », https://github.com/ariatestversion/Aria-/releases/tag/v0.4.0-alpha). Il pointe sur `e3950e6`. La session Claude ne peut pas pousser de tags (refus HTTP 403 du proxy).
- Le code applicatif de `main` est identique à `91441b1`. Le code applicatif du tag est identique à `91441b1`, le commit déployé en prévisualisation ; seuls la documentation et le script e2e diffèrent.

- Branche `claude/sprint04-experience-musicale`. **Source déployée : commit `91441b1`** (`91441b163ee40e8829755cc780673e0e592f931f`). Les commits suivants ne touchent que les tests e2e et la documentation de livraison.
- **Prévisualisation définitive MVP Alpha V0.4** : https://6b0078bb87479237251ba188--ariafirstversion.netlify.app (déploiement `6b0078bb87479237251ba188`, non publié).
- **Production verrouillée** sur le Sprint 02 : déploiement `6aff204b188f1862668a1bab`, commit `d86e813`, `locked: true`. Aucune mise en production ni aucun déverrouillage n’a été fait.
- **Correspondance GitHub ↔ Netlify** :
  - `version.json` = `91441b1`, branche `claude/sprint04-experience-musicale` ;
  - `assets/index-CwMQ-Ygw.js` et `assets/index-BuR7kNjN.css` identiques (SHA-256) au build local ;
  - e2e 68/68 sur l’URL (micro simulé).
- **Médias retirés** : sur la prévisualisation, leurs anciennes adresses ne servent plus les fichiers. Elles renvoient la page de l’application (`text/html`, règle de redirection), et le parcours ne fait aucune requête vers elles.
- Prévisualisations précédentes, remplacées : `6b00649f…` (`cf42503`), `6b006f0b…` (`820bfe3`, celle des tests physiques), `6b0076bc…` (`99a313e`, avant le retrait des médias).

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
