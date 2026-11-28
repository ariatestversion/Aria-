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

## Sonique V2 — finition esthétique (prévisualisation consolidée, 28/11/2026)

- Branche `claude/sonique-v2-finitions`, créée depuis `c0164ff` (base technique `b419339`). Commit `bd38ae5`.
- Prévisualisation non publiée : https://6b0a3613baecd0ded2957f17--ariafirstversion.netlify.app (déploiement `6b0a3613baecd0ded2957f17` ; `/version.json` doit indiquer `bd38ae5`). DA A : `?theme=blanc`.
- Contenu : visuels du Product Design (Bienvenue, carte de reprise, vignettes), sans modification fonctionnelle. Référentiel, captures avant/après et arbitrages de la fondatrice : `docs/v2/REFERENTIEL-FINITIONS.md`.
- Recette : 53/53, 360/360 (Nuit & cuivre), 338/338 (DA A). Production toujours verrouillée sur le Sprint 02.

## Clôture technique consolidée des Sprints 07, 08 et 09 et sécurisation des versions (27/11/2026)

Décision du Head of Product : clôture technique consolidée des Sprints 07, 08 et 09. **Référence technique de Sonique V2 : candidate n° 4, `b419339`.** À partir du 28/11 : finitions esthétiques et intégration des ressources validées seulement. Aucune modification fonctionnelle, aucun Sprint 10, aucune suppression de branche, aucune fusion dans `main`, aucune publication.

### Filiation des branches (vérifiée le 27/11 sur `ariatestversion/Aria-`)

`main` (`f0a61a0`, fusion du Sprint 06) → `claude/sprint07-integration` (`1276a2a`) → `claude/sprint08-identite` (`221b579`) → `claude/sprint09-validation` (`afcc746`, documentation au-dessus de `b419339`).

- Chaque branche contient entièrement la précédente, sans réécriture. `main` est entièrement contenu dans `b419339`. Une fusion future de `claude/sprint09-validation` dans `main` serait donc une avance rapide, sans conflit.
- Les branches antérieures sont toutes contenues dans `b419339` : `sprint04-experience-musicale`, `sprint04-access-check`, `da-preview`, `sprint05-pratique` et `sprint06-finalisation-v1`. `claude/sprint09-candidate4` pointe sur `b419339`. `gh-pages` (Sprint 03) est indépendante.
- Acquis : la recette complète rejoue les contrôles des Sprints 04 à 09 sur `b419339`. Résultats : 53/53 unitaires, 347/347 parcours Nuit & cuivre, 327/327 DA A (Chromium, micro simulé).

### Versions de référence

| Version | Commit de référence | Où il se trouve | Prévisualisation (non publiée) | Tag |
| --- | --- | --- | --- | --- |
| MVP — Alpha V0.4 (Sprint 04) | `e3950e6` (clôture ; application déployée : `91441b1`) | `main` (fusion `5fead7f`) | https://6b0078bb87479237251ba188--ariafirstversion.netlify.app | `v0.4.0-alpha` existe déjà (pre-release GitHub) |
| V1 — Alpha V0.6 (Sprint 06, « finalisation fonctionnelle V1 ») | `67aa241` (application déployée ; clôture `d4f326e`, fusion `f0a61a0`) | `main` | https://6b05c4864a41ea883858ac80--ariafirstversion.netlify.app | proposé : `v1.0.0-alpha` |
| V2 technique — Sonique (Sprints 07 à 09) | `b419339` (candidate n° 4) | `claude/sprint09-validation`, `claude/sprint09-candidate4` (hors `main`) | https://6b09a750acc212c565bc603f--ariafirstversion.netlify.app | proposé : `v2.0.0-tech` |
| Repères intermédiaires (facultatif) | Sprint 07 `d5e4a7a`, Sprint 08 `975e9ea` | branches des sprints | voir plus haut | proposés : `sprint07-ref`, `sprint08-ref` |
| Production actuelle (Sprint 02) | `d86e813` | **absent de l’historique de ce dépôt** | https://ariafirstversion.netlify.app (déploiement `6aff204b188f1862668a1bab`, `locked: true`) | aucun possible |

Note sur `d86e813` : ce commit n’existe dans aucune branche du dépôt. La version de production est conservée uniquement sous la forme du déploiement Netlify verrouillé, qui est immuable. Aucune action n’est requise : il ne faut simplement jamais supprimer ce déploiement.

### Tags proposés (à créer par la porteuse du projet dans GitHub : la session ne peut pas pousser de tags)

Releases → *Draft a new release* → *Choose a tag* (saisir le nom) → *Target* : le commit complet → cocher *Set as a pre-release*.

| Tag | Commit complet | Titre proposé |
| --- | --- | --- |
| `v1.0.0-alpha` | `67aa2419b4285f258f5f95b2635f26a70a951f3b` | ARIA — V1 · Alpha V0.6 (Sprint 06) |
| `v2.0.0-tech` | `b41933949c15616fa316a8055fe31fe686ba32f1` | Sonique — V2 technique (clôture Sprints 07-09, candidate n° 4) |
| `sprint07-ref` (facultatif) | `d5e4a7a8eed38e28ce9d4e3722136239d0e82da7` | Sprint 07 — référence |
| `sprint08-ref` (facultatif) | `975e9ea01ca3c810e3e3eec9c4cd2d4ef41cb528` | Sprint 08 — référence Nuit & cuivre |

Le tag `v0.4.0-alpha` (MVP, `e3950e6`) existe déjà.

### Déploiement Netlify en cas de fusion dans `main`

Constats (outils Netlify en lecture, 27/11) :
- tous les déploiements du projet `ariafirstversion` sont envoyés par l’outil en ligne de commande ou l’API (« Deploy triggered by upload »), sans référence Git (`commit_ref` et `branch` vides) ;
- aucun déploiement n’a été déclenché par un push sur GitHub ;
- la production est verrouillée sur `6aff204b188f1862668a1bab` (`locked: true`). La publication automatique est donc arrêtée : même un déploiement de branche ne remplacerait pas le lien public sans action manuelle ;
- `netlify.toml` définit la construction (`npm run build`, `dist`, Node 22) mais ne lie aucun dépôt.

Conclusion : en l’état observé, une fusion dans `main` ne déclencherait ni construction ni publication. Limite : l’outil disponible n’affiche pas la section « Continuous deployment » du projet. La porteuse du projet doit vérifier dans Netlify (*Project configuration → Build & deploy → Continuous deployment*) qu’aucun dépôt n’est lié. Si un dépôt l’est, il faut conserver le verrouillage de la production, ou désactiver les constructions automatiques (*Stop builds*), avant toute fusion.

### Sécurisation proposée (aucune action faite par l’Ingénierie)

1. Créer les tags `v1.0.0-alpha` et `v2.0.0-tech` dans GitHub (tableau ci-dessus).
2. Protéger `main` dans GitHub (*Settings → Branches → Branch protection rule*) : pas de push direct, pas de suppression, pas de force-push. Protéger de même `claude/sprint09-validation`.
3. Netlify : garder la production verrouillée. Vérifier l’absence de lien Git ou l’arrêt des constructions automatiques. Ne jamais supprimer les déploiements de référence (`6aff204b…`, `6b0078bb…`, `6b05c486…`, `6b09a750…`).
4. Finitions à partir du 28/11 : nouvelle branche depuis `b419339`. `b419339` reste la référence immuable de la V2 technique.

## État Sprint 09 — Validation finale et stabilisation du MVP (clôture technique consolidée le 27/11/2026)

- Branche `claude/sprint09-validation` depuis `claude/sprint08-identite` (application = `975e9ea` au départ). Non fusionnée.
- **Candidate n° 1** (`22dbdc2`, déploiement `6b085b5efaedcc23d9d0dea3`, non publiée) : https://6b085b5efaedcc23d9d0dea3--ariafirstversion.netlify.app — corrections S08-ENG-01 et S08-QA-01.
- **Candidate n° 4** (`b419339`, déploiement `6b09a750acc212c565bc603f`, non publiée) : https://6b09a750acc212c565bc603f--ariafirstversion.netlify.app — dernier lot correctif : S09-QA-02 (comparaison A/B sans métronome) et S09-QA-03 (« Arrêter » et REC visibles pendant la prise). Recette : 53/53, 347/347, 327/327 (DA A).
- **Candidate n° 3** (`aa83a42`, déploiement `6b095d84915d2ecd276a8f85`, non publiée) : https://6b095d84915d2ecd276a8f85--ariafirstversion.netlify.app — correctif REG-01. **Référence de clôture** retenue par le PM. Divergence « pointeur » investiguée le 27/11 : pas d’anomalie applicative, pas de candidate n° 4 (`docs/recettes/sprint09.md`, « Divergence pointeur »).
- **Candidate n° 2** (`1aeaf8c`, déploiement `6b0864cbe55b19581e435a76`, non publiée) : https://6b0864cbe55b19581e435a76--ariafirstversion.netlify.app — S09-QA-01 et S09-D-01.
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
