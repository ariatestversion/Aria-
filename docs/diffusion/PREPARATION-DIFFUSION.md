# Sonique V2 — Préparation de la candidate de diffusion (réserves QA)

28 novembre 2026 · Ingénierie (Claude Code) · Référence définitive interne : `bd38ae5`, inchangée.

Demande du Head of Product : intégrer les recommandations de Claude QA (avis du 28/11 et critères QA-V2-DIFF-01) sans rouvrir les sprints. Cette branche (`claude/sonique-v2-diffusion-prep`) contient de la **documentation seulement** :
- le correctif proposé, **non appliqué** : `C-DIFF-correctif-propose.patch` ;
- le script de comparaison technique : `compare-candidate.sh`.

Aucune modification de l’application, aucune fusion, aucune publication. **Le nom commercial n’est pas modifié.**

## 1. Occurrences résiduelles du nom ARIA (relevé du 28/11 sur `bd38ae5`)

Relevé fait de deux façons : recherche dans le code source, et recherche dans l’application construite (`dist`), avec vérification de ce qu’un utilisateur peut atteindre.

### Visibles par l’utilisateur

| # | Emplacement | Texte | Où l’utilisateur le voit | Relevé QA |
| --- | --- | --- | --- | --- |
| N-1 | `index.html` l. 49 | « Aria » | Écran de chargement, à chaque lancement | Oui (O-V2-4, C-DIFF-1) |
| N-2 | `index.html` l. 61 | « Aria » | Message « L’app n’a pas démarré » | Oui (C-DIFF-1) |
| N-3 | `src/lib/presets.ts`, clé `welcomeToSonique` | « Bienvenue sur Aria » | **Écran de connexion** (Bienvenue → « Se connecter ») | **Non, nouveau** |
| N-4 | `src/lib/presets.ts`, clé `authTermsBody` | « Aria t’aide à travailler tes morceaux… » | **Conditions d’utilisation** de l’écran de connexion | **Non, nouveau** |
| N-5 | `src/lib/presets.ts`, clé `checkEmailLead` | « Ouvre le mail Aria… » | Inscription en mode cloud seulement : **inaccessible** aujourd’hui (Supabase non configuré) | Non |
| N-6 | `scripts/write-version.mjs` → `/version.json` | `"name": "ARIA"` | Fichier technique public | Oui (C-DIFF-1) |
| N-7 | `public/favicon.svg` | « a » de l’ancienne marque | Onglet du navigateur, icône d’accueil | Oui (M-6, hors C-DIFF : icône du Product Design) |

### Présents dans l’application livrée, mais inaccessibles

`src/lib/presets.ts` contient 21 autres textes « Aria », en français et en anglais (« Aria écoute… », « Écris à Aria… », « Relis les retours d’Aria… », etc.). Ils datent de l’ancien prototype (`src/App.tsx`, `src/play`, `src/components/StringsStudio.tsx`), qui n’est pas monté.

Ils sont pourtant livrés, parce que l’écran de connexion importe tout l’objet de textes. Le contrôle QA A4 (recherche dans `dist`) les signalerait.

### Techniques, invisibles (admis)

- Clés de stockage `aria.` : **à ne jamais renommer**, sous peine de perdre les données des utilisateurs.
- Attributs d’accessibilité `aria-*` : sans rapport avec la marque.
- Balise `<meta name="aria-build">` et journal de console « Aria crashed » (`src/ErrorBoundary.tsx`).
- Noms internes : `package.json` (`aria`), `AriaApp.tsx`, `aria-v0.css`, commentaires de code, documentation et noms de documents Drive.

### Autre constat sur l’écran de connexion (non corrigé, hors périmètre)

L’écran « Se connecter » date d’avant la V2. Son bouton « Continuer avec Google » s’affiche comme un **champ vide** : le texte est invisible avec les styles actuels. Il renvoie « Google indisponible » en mode local.

Pour l’App Store, proposer une connexion Google obligerait à proposer aussi « Se connecter avec Apple » (règle 4.8). Le traitement de ce bouton est une **décision produit**, à rattacher à D6 (comptes) du dossier de commercialisation. Il n’entre pas dans C-DIFF.

## 2. Correctif proposé (non appliqué) : `C-DIFF-correctif-propose.patch`

| Correction | Contenu | Fichiers |
| --- | --- | --- |
| C-DIFF-1 | Le nom affiché vient d’une **seule source**, `BRAND_NAME` dans `src/v0/brand.ts` : écran de chargement et démarrage échoué (via Vite), `/version.json`, textes de l’écran de connexion et anciens textes (N-1 à N-6), journal de console. Si le nom commercial change après l’arbitrage, une ligne suffit. Le correctif n’impose aucun nom : avec la valeur actuelle, il affiche « Sonique » | `index.html`, `vite.config.ts`, `scripts/write-version.mjs`, `src/lib/presets.ts`, `src/ErrorBoundary.tsx` |
| C-DIFF-2 | La phrase du bloc « Comparer les prises » suit l’origine du tempo du groupe comparé (voir le tableau ci-dessous) | `src/v0/labels.ts` (nouveau), une ligne et un import dans `src/v0/AriaApp.tsx` |
| Tests | 2 tests unitaires (`labels.test.ts`) ; 5 contrôles de parcours (C-DIFF-1 : chargement, démarrage échoué, `/version.json`, écran de connexion et conditions ; C-DIFF-2 : tempo de référence et tempo libre) | `src/v0/labels.test.ts`, `scripts/e2e-sprint04.mjs` |

Phrases proposées pour C-DIFF-2 :

| Origine du tempo | Phrase |
| --- | --- |
| Tempo libre | « Prises comparables · même séance, même passage, **toutes en tempo libre**. » |
| Tempo de référence | « … **même tempo de référence (60 BPM, sans métronome)**. » |
| Métronome | « … **même tempo au métronome (60 BPM)**. » |
| Prises antérieures à la V2 | « … **même tempo (64 BPM)**. » |

La formulation reste à confirmer par le Product Design. Variante neutre possible : « mêmes conditions de tempo ».

Règles de comparaison, données et stockage : **inchangés**. `takes.ts`, `takes.test.ts`, `model.ts`, `pedagogy.ts`, l’enregistrement et le stockage ne sont pas touchés. Les clés `aria.` sont conservées.

Vérification sur un prototype jetable construit sur `bd38ae5` :
- unitaires **55/55** ; parcours **365/365** en Nuit & cuivre et **343/343** en DA A ;
- plus aucun « Aria » ni « ARIA » dans l’application construite ;
- preuve de détection : sur `bd38ae5`, les 5 nouveaux contrôles échouent (360/365).

### Écart avec les conditions d’entrée de la QA, à valider avant la candidate

QA-V2-DIFF-01 limite la différence à `index.html`, `/version.json` et la ligne du bloc « Comparer les prises ». Le correctif touche aussi d’autres fichiers :

- **`src/lib/presets.ts` (N-3, N-4)** : sans lui, « Bienvenue sur Aria » reste visible et la candidate serait « NO GO » au critère « Aria encore visible ».
- **`scripts/write-version.mjs`** : `/version.json` est généré par ce script, il n’existe pas de fichier à modifier directement.
- **`vite.config.ts`** : il permet la source unique du nom. Variante possible : écrire le nom en dur dans `index.html`.
- **`src/ErrorBoundary.tsx`** : nom technique invisible, facultatif.
- **`src/v0/labels.ts`** : nouveau fichier, pour laisser `takes.ts` inchangé comme le demande la QA.

Demande au Product Management et à Claude QA : valider cette liste de fichiers, qu’applique le script de comparaison.

## 3. Nouvelle candidate de diffusion : déroulé prévu (après validation du nom commercial)

1. Arbitrage juridique et validation du nom par la fondatrice ; validation de la liste de fichiers et de la formulation C-DIFF-2.
2. Branche `claude/sonique-v2-diffusion` créée depuis `bd38ae5`. Si le nom change, modifier `BRAND_NAME` (une ligne), puis appliquer le correctif.
3. Recette complète, puis `bash docs/diffusion/compare-candidate.sh <commit>` (contrôles A1 et A4).
4. Prévisualisation Netlify **non publiée** ; inscription au registre des liens.
5. Contre-recette QA-V2-DIFF-01 : A1 à A13 par Claude QA, puis B1 à B5 sur iPhone, environ 10 minutes.

Durée Ingénierie : environ 1 h 30 entre la validation et la remise de la candidate, recette et déploiement compris. Le correctif est prêt.

Si le nom change pour un mot qui commence par une voyelle, il faut relire 4 textes de `presets.ts` qui disent « de Sonique » / « que Sonique ». Ce sont des textes inaccessibles, sans enjeu pour l’utilisateur.

## 4. Comparatif technique avec `bd38ae5`

`compare-candidate.sh` construit la référence et la candidate dans des copies de travail temporaires, sans toucher aux branches. Il produit :
- la liste des fichiers modifiés, classés « prévu », « hors liste » ou « interdit » (logique, données, stockage) ;
- les lignes modifiées de `AriaApp.tsx` ;
- les clés de stockage `aria.` touchées ;
- la recherche d’« Aria » / « ARIA » dans l’application construite ;
- les fichiers construits qui diffèrent, la taille du JavaScript, et l’identité des photos et des polices.

Résultat sur le prototype : 10 fichiers, tous prévus, aucun interdit, aucune clé touchée, aucun « Aria ». Seul le paquet JavaScript change (+291 octets) ; photos et CSS identiques.
