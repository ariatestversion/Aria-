# Sprint 07 — Lot A · Inventaire technique et préparation

25/11/2026 · Claude Code · branche `claude/sprint07-integration`, créée depuis `main` (`f0a61a0`).

## 1. Référence confirmée

| Point | Constat |
| --- | --- |
| `main` | `f0a61a0` (fusion du Sprint 06) |
| Code applicatif de `main` | Identique au commit audité `67aa241` (aucune différence dans `src/`, `scripts/`, `public/`, `index.html`, `package.json`) |
| Prévisualisation de référence | https://6b05c4864a41ea883858ac80--ariafirstversion.netlify.app (`67aa241`, non publiée) |
| Lien public | Sprint 02 (`d86e813`), verrouillé, non modifié |

## 2. Tests de référence (exécutés le 25/11 sur `f0a61a0`, installation propre `npm ci`)

| Suite | Résultat |
| --- | --- |
| `npm run build` | OK (JS 548 kB / 159 kB gzip ; CSS 109 kB / 22 kB gzip ; avertissement Vite > 500 kB) |
| `npm test` | 37/37 |
| `node scripts/e2e-sprint04.mjs` (Chromium, micro simulé, 390×844 et 320×640) | 136/136 |

Ces résultats servent de base de non-régression pour les lots B à D. Aucun test sur appareil physique.

## 3. Architecture existante

| Zone | Fichiers | Taille | Rôle |
| --- | --- | --- | --- |
| Application active | `src/v0/AriaApp.tsx` | 2 237 lignes | Tous les écrans (bienvenue, connexion, onboarding, accueil, bibliothèque, fiche, préparation, séance, enregistrement, bilan, suivi, profil) dans un seul composant à états |
| Composants UI | `src/v0/ui.tsx` | 488 | Lecteur de prise, panneau d’enregistrement, métronome, minuteur, ressources, vignettes, badges |
| Moteur pédagogique | `src/v0/pedagogy.ts` (+ tests) | 865 (+ 493) | Programmes, reprise, bilan ; règles explicites testées de façon exhaustive |
| Données | `src/v0/store.ts`, `model.ts`, `auth.ts` | 763 | localStorage, IndexedDB (audio, PDF), comptes locaux / Supabase |
| Design System | `src/design/tokens.css`, `components.css`, `Icon.tsx` ; `docs/DESIGN_SYSTEM.md` | 1 345 | Jetons à 3 niveaux, 4 thèmes (`data-brand`), composants `ds-*`, 40+ icônes |
| Mise en page de l’app | `src/v0/aria-v0.css` | 356 | Dock, accueil, carte de reprise, bienvenue ; 3 couleurs en dur (`#f7f1e8`) |
| Héritage (non monté sauf exceptions) | `src/App.tsx`, `src/components/*`, `src/lib/*`, `src/styles.css` | 6 560 | Prototype avant Sprint 04 |

Couplages avec l’héritage encore actifs :
- `AuthGate` (écran de connexion / inscription) : composant hérité, **hors Design System**, habillage ancien ;
- `src/lib/recorder.ts` (enregistrement), `supabaseAuth.ts`, `passwordPolicy.ts` ;
- `src/styles.css`, chargé globalement : **source majeure du CSS de 109 kB** et risque de conflits de style ;
- `pdfjs-dist` et `src/lib/presets.ts` sont compilés via le prototype : poids du bundle.

## 4. Lot B — état actuel par exigence

Établi d’après le code. Les critères précis du dossier Phase 5 ne sont pas encore disponibles (voir §6).

| Exigence | Existant | Écart probable |
| --- | --- | --- |
| Protection des brouillons | Brouillon distinct d’une séance terminée ; sauvegarde pendant la saisie ; reprise directe au bilan ; une séance terminée n’est jamais repassée en brouillon | Règles Phase 5 à confronter (expiration, abandon, suppression ?) |
| Conservation et séparation des prises | Prises en IndexedDB, rattachées au morceau, à l’étape et à la séance ; isolation par compte ; suppression confirmée | Séparation « prises de séance / prises libres » à vérifier selon la spec |
| Conditions de comparaison | A/B dès 2 prises du même morceau ; même prise interdite des deux côtés | Conditions Phase 5 (même passage ? même séance ?) à appliquer |
| Enregistrements vides, métadonnées manquantes | Prise < 100 octets refusée ; « Audio introuvable » si le fichier a disparu ; libellé de passage filtré | Durée 0 ou inconnue, prise orpheline (morceau absent) à traiter explicitement |
| Navigation pendant la capture | Changer d’écran arrête et sauvegarde la prise ; arrière-plan et micro coupé gérés ; badge REC dans le dock | Confirmation avant de quitter ? à décider selon la spec |
| Préservation bilan, suivi, données | Bilan sourcé, suivi, continuité ; tests de non-régression | — |

Estimation lot B : **1 à 2 jours-session**, selon le nombre d’écarts dans la spec.

## 5. Lot C — préparation

- Le thème est piloté par `html[data-brand]` et des jetons à 3 niveaux. Appliquer une DA consiste d’abord à **remplacer les valeurs des jetons**, ce qui touche peu le code des écrans.
- **Manrope** est déjà chargée (Google Fonts, SIL OFL). Fraunces sert uniquement au mot-symbole actuel.
- **Séance immersive marine** : l’écran Séance est aujourd’hui sur fond ivoire avec un bloc de consigne marine. Le passer en plein écran marine demande de nouveaux jetons « surface sombre », des contrastes vérifiés (WCAG AA) et la gestion du dock et de la zone sûre.
- **Photographies** : aucune dans l’app depuis le Sprint 04 (provenance non établie). Toute photo intégrée devra avoir source, auteur et licence dans `docs/LICENCES.md`, en WebP/AVIF dimensionnés, chargés en différé.
- **Écran de connexion** : composant hérité hors DS. Le passer au DS est probablement nécessaire pour la cohérence, avec un risque de régression sur les comptes, couvert par l’e2e existant.
- **Risque principal** : `AriaApp.tsx` monolithique. Intégrer de nouveaux écrans ou états sans refonte générale suppose d’extraire au fil de l’eau les écrans touchés en composants (extraction ciblée, pas de refonte).

Estimation lot C : **3 à 5 jours-session**, à affiner sur la maquette 4.2 (nombre d’écrans et d’états réellement nouveaux).

## 6. Lot D — préparation

- Les **11 scénarios d’acceptation Phase 5** seront automatisés dans le parcours e2e (Chromium, micro simulé), en plus des 136 contrôles existants. La recette sur iPhone réel (séance marine notamment) reste à faire par le QA.
- Estimation lot D : **1 à 2 jours-session**, plus le délai de la QA indépendante.

## 7. Dépendances (levées le 25/11)

Les six documents de référence ne sont **pas accessibles à la session de développement**. Ils ne sont ni dans le dépôt, ni dans le Google Drive connecté, ni dans les artefacts Claude :

1. Dossier de spécifications Product Management — Phase 5 (règles lot B, 11 scénarios lot D) ;
2. Maquette interactive Phase 4.2 (écrans, interactions, états lot C) ;
3. Design System Phase 3 et addenda (jetons, composants, définition de la « DA A ») ;
4. Rapport QA Phase 4 ;
5. Corrections Phase 4.2 ;
6. Résultats de contre-recette Phase 4.3.

**Mise à jour du 25/11** : les documents ont été transmis dans le dossier Drive « Sprint 07 » (index `00-INDEX-Sprint-07.md`) et lus intégralement. Voir la section 9.

Point à clarifier : la « DA A » est-elle la DA 4 Ivoire & marine retenue le 23/11 (palette documentée dans `docs/DA4_IVOIRE_MARINE.md`), ou une nouvelle déclinaison issue de la Phase 3 ? La « réserve sur le blanc doux » laisse penser à une palette différente de l’ivoire actuel.

## 8. Risques

| Risque | Impact | Parade |
| --- | --- | --- |
| Documents de référence indisponibles | Lots B à D bloqués ou interprétés | Transmission des documents avant le lot B |
| Composant d’app monolithique | Régressions en intégrant de nouveaux écrans | Extraction ciblée des écrans touchés ; 136 contrôles e2e comme filet |
| CSS hérité global (`styles.css`) | Conflits de style avec le nouveau DS | Isoler ou neutraliser les règles héritées qui touchent l’app active |
| Écran de connexion hérité | Incohérence visuelle, ou régression des comptes si on le reprend | Reprise au DS couverte par les contrôles comptes de l’e2e |
| Séance plein écran marine | Contrastes, lisibilité en jouant, zone sûre iPhone | Jetons sombres dédiés, audit de contraste automatisé ; validation sur iPhone réel (réserve du cadrage) |
| Photographies | Droits, poids | Provenance documentée avant intégration ; formats optimisés |
| Aucune recette physique depuis la V0.4 | Comportements audio réels non garantis | Recette iPhone et Android par la QA indépendante |

## 9. Références reçues et correspondance avec le code (25/11)

Documents lus : index, spécifications Phase 5 (S7-01 à S7-10, T01 à T11), maquette 4.2 (HTML, 15 états rendus en Chromium, marine et clair), Design System Phase 3 (PDF, 4 pages), contre-recette 4.2 (addendum DS), recette Phase 4, résultats 4.3, addendum QA Sprint 07, revue visuelle, 4 visuels JPEG.

**DA A** = blanc doux `#F7F8FA`, surfaces `#FFFFFF`, séance marine `#101D35`, bleu ciel `#A8C9EB`, encre `#202124`, texte secondaire `#4F5560`, filet `#CBD1D9`, gris `#F0F1F3`, rouge `#C62828` réservé à la prise active ; Manrope 800 / 750 / 650 / 500 ; cibles principales 48 px. Elle remplace l’ivoire `#F7F3EA` de la DA 4 (réserve « blanc doux » consignée).

| Ticket | Priorité | Existant V0.6 | Écart à réaliser |
| --- | --- | --- | --- |
| S7-05 Navigation pendant la capture | P0 | Changer d’écran **arrête et sauvegarde** la prise ; arrière-plan et micro coupé gérés | Pendant la prise : onglets, raccourci Profil, étape suivante et bilan **indisponibles**, avec message textuel relié (`aria-describedby`) ; réactivation après arrêt ou échec. La sauvegarde en arrière-plan est conservée. |
| S7-06 Protection des brouillons | P0 | Programme en cours conservé sur le morceau ; bilan repris directement ; brouillon de bilan | Écran d’arbitrage au changement de morceau (morceau, étape, nombre de prises ; « Reprendre » / « Garder et changer ») ; sauvegarde **avant** changement, rester sur place si elle échoue ; **temps restant du minuteur** à persister (absent aujourd’hui) ; même morceau : proposer la reprise avant une nouvelle séance (aujourd’hui « Préparer » remplace silencieusement le programme en cours) ; préparation non démarrée = aucune entrée |
| S7-07 Prises et comparaison | P0 | A/B dès 2 prises du morceau ; même prise interdite ; prise < 100 octets refusée | Métadonnées « passage · tempo · durée » ; **tempo et séance à enregistrer avec chaque prise** (absents du modèle) ; comparaison seulement si même séance, même passage identifié, même tempo connu ; sinon écoute séparée ; anciennes prises jamais déclarées comparables ; prise vide ou **illisible** détectée par la lecture, sans durée minimale arbitraire |
| S7-08 Bilan | P0 | Sources distinguées, aucune analyse, reprise et tempo cohérents | Libellés exacts : « Ta propre observation », « Conseil pédagogique ARIA », « Analyse automatique de la prise : aucune » ; bilan anticipé sans travail évalué : proposer brouillon / reprise, pas de bilan |
| S7-09 Suivi et profil | P0 | Brouillons et terminées séparés ; isolation des comptes ; avertissement local | Distinguer **brouillon de pratique** et **brouillon de bilan** ; lister les séances démarrées sans bilan |
| S7-01 DA A et DS | P1 | DA 4 ivoire, Manrope chargée (400–800), 4 thèmes | Jetons DA A, séance marine plein écran, clair comme **témoin QA sans sélecteur utilisateur** (paramètre d’adresse) ; Manrope 650 et 750 (police variable) |
| S7-02 Accueil | P1 | Carte de reprise, conseil | Une seule action principale selon l’état réel (reprendre séance / reprendre bilan / choisir un morceau) ; visuel photo |
| S7-03 Bibliothèque et préparation | P1 | Recherche, ajout, ressources, préparation complète | Hiérarchie morceau → passage → objectif → plan ; vignettes photo par instrument (guitare, piano, voix ; repli pour les autres) |
| S7-04 Séance | P1 | Consigne, critère, minuteur, métronome, prises | Bloc unique passage / étape / tempo / temps / consigne / critère ; explications repliables ; une action principale (étape suivante, puis bilan à la dernière étape avec focus) ; bilan anticipé secondaire, absent pendant la capture |
| S7-10 Accessibilité | P1 | Cibles 44 px, focus, contrôles e2e | Cibles principales 48 px, annonces d’état, mouvement réduit (transitions 180 ms / 160 ms / 100 ms), barres Safari |

**Estimation révisée** : lot B **2 à 3 jours-session** (modèle des prises, arbitrage de changement de morceau, persistance du minuteur) ; lot C **3 à 4 jours-session** ; lot D **1 à 2 jours-session** (automatisation des parties Chromium de T01 à T11). Total **6 à 9 jours-session**, hors recette physique et QA indépendante.

### Références manquantes ou à préciser

1. **Revue DA A (page 5)**, citée pour le classement « usage interne » des visuels : non présente dans le dossier (lien ChatGPT interne).
2. **Diagnostic Product Design** et **maquette Phase 3**, cités par la recette Phase 4 : non présents (non bloquant, la maquette 4.2 fait référence).
3. **Visuels « usage interne »** : une prévisualisation Netlify est accessible à toute personne disposant du lien. Confirmer que l’intégration des 4 JPEG dans une prévisualisation de revue non publiée est acceptée, ou prévoir un repli sans photo.
4. **Familles sans visuel** (basse, batterie, autre) : le repli actuel (vagues) est conservé, conformément à la revue visuelle.
5. **Nom de branche** : le dossier PM propose `claude/sprint07-integration-design` ; la branche ouverte au lot A est `claude/sprint07-integration`.
