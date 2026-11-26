# Sprint 08 — Intégration Nuit & cuivre : recette Ingénierie

26 novembre 2026 · Branche `claude/sprint08-identite` · Intégration après le GO de la fondatrice. Références : dossier de transmission du Product Management (registre des sprints, 11 h 45), sections et planches du Product Design, recette QA *SONIQUE-Sprint-08-Recette-conformite-visuelle-et-non-regression*.

Cette recette n’est pas la recette QA : le QA et le Product Design contrôlent la même version de leur côté.

Prévisualisation 2 (non publiée) : https://6b081146e39e7cb1bbd3e2d5--ariafirstversion.netlify.app · commit `cf3d2c9` · déploiement `6b081146e39e7cb1bbd3e2d5`. Le fichier `/version.json` doit indiquer `cf3d2c9`.

## Ce qui a été intégré

| Élément | Intégration |
| --- | --- |
| Palette | Thème `nuit`, par défaut. Marine `#101D35` (Bienvenue, Séance), blanc doux `#F7F8FA` (fond de référence), surfaces `#FFFFFF`, encre `#1B1F2A`, bleu ciel `#A8C9EB` (sélections, onglet actif), rouge `#C62828` réservé à la prise active |
| Cuivre `#D9662B` | Décoration uniquement : filet sous le logotype (Bienvenue), filet sous le titre de l’Accueil, vagues du visuel de reprise, lumière latérale de la Bienvenue. Aucun texte, aucun contrôle et rien en séance, où il resterait proche du rouge de prise |
| Logotype | « Sonique », nom de travail provisoire, en Fraunces 650 et casse titre, sur la Bienvenue et l’Accueil. C’est du texte réel issu de `BRAND_NAME`, également repris dans le titre de l’onglet, le bilan, l’onboarding et l’écran d’erreur |
| Interface | Manrope : titres d’écran, slogan et commandes |
| Accueil | Blanc doux par défaut. Papier chaud `#F5F1EA` en variante, par l’adresse `?accueil=papier`, sans sélecteur dans l’application. Seul le fond de l’Accueil change |
| Bienvenue | Fond marine uni, avec une couleur de repli si le dégradé n’est pas pris en charge (iOS < 16.2) ; logotype clair, slogan exact, « Commencer » |
| Bibliothèque, Séance | Rendus de la DA A conservés, conformes aux spécifications (blanc doux et sélection bleu ciel ; séance marine) ; ordre, états et commandes du Sprint 07 inchangés |
| DA A | Toujours consultable avec `?theme=blanc`, mise en page identique. Les palettes candidates provisoires cuivre et bleu sont retirées (exploration close) |

Aucune modification fonctionnelle et aucune modification du modèle pédagogique : seuls les jetons, les styles, le nom affiché et le titre de page changent. Le bouton « Entrer dans Aria » et le message « Chargement d’Aria… » sont passés au nom de marque.

## Résultats automatisés (Chromium, micro simulé : ne remplace pas un test physique)

- `npm run build`, `npm test` : 44/44.
- `node scripts/e2e-sprint04.mjs` : **283/283** (palette par défaut Nuit & cuivre). Les 244 contrôles précédents sont tous conservés ; 39 contrôles Sprint 08 s’y ajoutent.
- `THEME=blanc node scripts/e2e-sprint04.mjs` : **263/263** (DA A, R-14).

## Correspondance avec la recette QA

| Contrôle QA | Couverture automatisée Ingénierie |
| --- | --- |
| V-01 | Bienvenue : « Sonique » en Fraunces 650, slogan exact, fond marine, filet cuivre, « Commencer » |
| V-02 | Aucune photographie : repli marine vérifié |
| V-03 | Accueil : blanc doux par défaut, filet cuivre sous le titre ; papier chaud par `?accueil=papier`, limité à l’Accueil |
| V-04 | Quatre onglets ; onglet actif en bleu ciel, libellé marine, sans petit texte cuivre |
| V-07, V-08 | Contrôles du Sprint 07 conservés : navigation indisponible pendant la prise, « Faire le bilan » principal et focus à la dernière étape |
| V-09, V-10 | « Conseil pédagogique Sonique », « Sonique commence par… » ; titre d’onglet « Sonique » ; aucun « ARIA » affiché |
| A-01, A-02 | Audit de contraste (couleurs rendues) : Bienvenue, Accueil (deux fonds), Séance (marine), Bilan, etc. |
| A-03, A-04 | Pour chaque écran principal : aucun texte cuivre sous 24 px (ou 18,7 px gras), aucun texte blanc sur cuivre |
| A-08, A-09, A-10 | Cibles ≥ 44 px et actions principales ≥ 48 px ; 320 px, paysage, tablette, ordinateur, texte agrandi à 200 % ; mouvement réduit |
| R-01 à R-11, R-14, R-15 | Recette des Sprints 04 à 07, rejouée en entier ; aucune erreur JavaScript |

Captures :
- parcours complet : `docs/screenshots/sprint08/` ;
- écrans clés à 320, 390, 430 et 1280 px : `docs/screenshots/sprint08/largeurs/` ;
- comparaison blanc doux / papier chaud : `S08-comparaison-accueil-blanc-doux-papier.png`.

## Écarts et points ouverts

| ID | Constat | Statut proposé |
| --- | --- | --- |
| S08-ENG-01 | **Anomalie fonctionnelle préexistante** (déjà présente sur `d5e4a7a`), trouvée pendant l’intégration. Après un rechargement de la page, un nouveau morceau est proposé avec l’instrument « Piano » au lieu de celui du profil (ex. Guitare), puis préparé avec cet instrument. Cause : l’instrument par défaut d’un nouveau morceau n’est fixé qu’à la fin de l’onboarding. Correction d’une ligne, non faite : les modifications fonctionnelles ne sont pas autorisées | À arbitrer par le Product Management (correction au Sprint 08 ou au Sprint 09) |
| S08-ENG-02 | Photographies non intégrées : les candidats du pack Sprint 07 sont des images générées, à usage interne, et la prévisualisation est publique par lien. Replis en place : marine sur la Bienvenue, pictogrammes en Bibliothèque | Conforme aux replis prévus (V-02). Intégration possible dès qu’une source autorisée et documentée est fournie (emplacement `--welcome-photo` prêt) |
| S08-ENG-03 | Icône d’application et favicon inchangés (hors périmètre) | V-13 : consigné |
| S08-ENG-04 | Bandeau « Mode local », avatar et accès rapides : rendus DA A conservés (aucune maquette spécifique) | V-12 : consigné, non bloquant |
| S08-ENG-05 | Simulation de daltonisme (A-05) non automatisée. Le cuivre n’apparaît jamais en séance ni près de la capture, et l’état de prise reste identifiable par son libellé, son chrono et son icône | À contrôler par le QA |
| S08-ENG-06 | « Sonique » est un nom de travail ; le nom commercial reste soumis à un arbitrage distinct | Une ligne à changer dans `src/v0/brand.ts` |

Aucun test sur appareil physique n’a été réalisé. Réserves R09-01 à R09-04 maintenues ; pour R09-02, à vérifier sur la version Nuit & cuivre.

## Contre-recette QA de la prévisualisation 2 : régression signalée « Reprendre la séance » (S08-QA-REG-01)

Signalement (ChatGPT QA, `cf3d2c9`) :
- scénario : Piano, débutant, Rythme, 15 min, sans prise ; bilan ouvert à l’étape 4 et gardé en brouillon ; retour à l’Accueil ; rechargement ; « Reprendre mon bilan », puis « Reprendre la séance » ;
- constat : le bilan reste affiché ;
- attendu : la séance à l’étape mémorisée.

Analyse Ingénierie (26/11, Chromium automatisé, micro simulé) :
- **Non reproduit** sur `cf3d2c9`, à 390 × 844 et à 1348 × 936. Variantes essayées : morceau ajouté ou démo « Gymnopédie n°1 », minuteur lancé, rechargement depuis le bilan, double clic. Dans tous les cas, « Reprendre la séance » rouvre la séance à l’étape 4, et le brouillon reste listé dans le Suivi.
- Même comportement sur la référence `d5e4a7a` (Sprint 07) : aucun écart observé entre les deux versions.
- Le code de ce bouton est identique depuis le Sprint 07 ; l’intégration Nuit & cuivre n’a modifié aucune logique de navigation.
- Test automatisé dédié ajouté (`S08 · REG-01`, 7 contrôles par taille d’écran, 14 au total) : il échoue si le bilan reste affiché, si l’étape change, si la séance ne survit pas à un rechargement ou si le brouillon disparaît. Recette complète : **297/297**.
- Aucune correction appliquée : sans reproduction, toute modification serait à l’aveugle et sortirait du périmètre (« ne traiter aucune autre anomalie »).
- Éléments demandés au QA pour reproduire :
  - navigateur et taille de fenêtre ;
  - profil vierge ou déjà utilisé (autres morceaux ou brouillons) ;
  - morceau utilisé ;
  - capture vidéo ou console au moment du clic ;
  - le clic a-t-il produit un effet visible ?
