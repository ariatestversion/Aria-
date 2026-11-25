# Sprint 07 — Estimation détaillée et planning

25/11/2026 · Claude Code · demande du Head of Product. Ce document ne suspend pas le développement.

## 1. Deux notions distinctes

- **Temps de développement effectif** : temps de travail de la session de développement (Claude Code) pour coder, tester et documenter. Le lot B, estimé à « 2 à 3 jours-session » au lot A, a été réalisé en environ **une demi-journée de session** le 25/11. L’estimation initiale était prudente : elle supposait des allers-retours sur des spécifications encore inconnues.
- **Délai calendaire** : il dépend surtout des **interventions humaines** (revues PM et Product Design, QA indépendante, tests de la fondatrice sur iPhone, décisions du Head of Product), qui ne peuvent pas être accélérées par le développement.

## 2. Estimation par lot et par ticket

| Lot | Ticket | Contenu | Développement effectif | Statut 25/11 |
| --- | --- | --- | --- | --- |
| A | — | Inventaire, tests de référence, correspondance S7 | 2 h | Fait |
| B | S7-05 (P0) | Navigation et étapes indisponibles pendant la prise, message relié | 1 h | Fait |
| B | S7-06 (P0) | Arbitrage au changement de morceau, sauvegarde avant changement, échec géré, minuteur persistant, séance mise de côté | 2 h | Fait |
| B | S7-07 (P0) | Séance et tempo enregistrés avec chaque prise, comparaison éligible seulement, prises vides ou illisibles | 2 h | Fait |
| B | S7-08 (P0) | Libellés des sources, bilan anticipé sans travail | 0,5 h | Fait |
| B | S7-09 (P0) | Suivi : brouillon de pratique / de bilan / mis de côté ; avertissement de stockage dans le Profil | 1 h | Fait |
| B | Tests | 7 tests unitaires et 31 contrôles e2e nouveaux | 1,5 h | Fait |
| C | S7-01 (P1) | Jetons DA A, Manrope 500/650/750/800, séance marine plein écran, clair comme témoin QA par l’adresse | 3 à 4 h | À faire |
| C | S7-02 (P1) | Accueil : une action principale selon l’état réel | 1 h | À faire |
| C | S7-03 (P1) | Bibliothèque et préparation : hiérarchie morceau → passage → objectif → plan ; vignettes | 2 h | À faire |
| C | S7-04 (P1) | Séance : bloc unique, explications repliables, une action principale, focus vers le bilan | 3 h | À faire |
| C | S7-10 (P1) | Cibles 48 px, focus visible, annonces, mouvement réduit, barres Safari | 2 h | À faire |
| D | T01–T11 | Automatisation des parties Chromium, contrastes, corrections | 3 à 5 h | À faire |
| D | Docs | CHANGELOG, recette, Drive, prévisualisation QA | 1 h | En continu |

Total restant : environ **15 à 18 h de développement effectif**, soit **2 à 3 jours calendaires** de session si aucun arbitrage ne bloque.

## 3. Dépendances et interventions humaines

| Intervention | Personne | Sur quoi | Nécessaire pour |
| --- | --- | --- | --- |
| Revue fonctionnelle du lot B | PM, QA | Prévisualisation 1 | Valider S7-05 à S7-09 avant clôture |
| T04 / T06 avec micro réel, T03 / T07 avec VoiceOver | Fondatrice, iPhone réel | Prévisualisation 1 (fonctionnel) puis finale | Bloquant pour la clôture (audio, données) |
| T08 séance marine instrument en main, T09 métronome à l’oreille | Fondatrice, iPhone réel | Prévisualisation 2 | Arbitrage marine ; réserve blanc doux |
| Grille de conformité visuelle | Product Design | Prévisualisation 2 | P1 visuels |
| Recette indépendante T01–T11 | QA | Prévisualisation finale | GO / NO GO |
| Droits des photographies et hébergement à accès restreint | Head of Product | — | Avant toute photo dans une prévisualisation |
| Décision de clôture | Head of Product | Rapport QA | Clôture du sprint |

## 4. Travaux parallélisables

- **Pendant le lot C** : la QA et la fondatrice peuvent déjà tester le **lot B** sur la prévisualisation 1 (navigation pendant la prise, changement de morceau, comparaison, prises vides, reprise après fermeture), notamment T04 et T06 avec le micro réel. Ces tests ne dépendent pas du rendu final.
- **Pendant le lot D** : le Product Design peut dérouler la grille de conformité visuelle sur la prévisualisation 2.
- **À tout moment** : le Head of Product peut statuer sur les photographies (hébergement restreint ou visuels provisoires).

## 5. Calendrier prévisionnel

| Date | Livraison | Contenu |
| --- | --- | --- |
| 25/11 | Prévisualisation 1 | Lot B (S7-05 à S7-09), tests de non-régression |
| 26/11 | Prévisualisation 2 | Lot C (DA A, séance marine, accueil, préparation, accessibilité) |
| 26–27/11 | Prévisualisation finale QA | Lot D : T01–T11 automatisables, corrections |
| À partir du 27/11 | Recette indépendante et tests iPhone | Selon disponibilité QA et fondatrice |
| Après recette | Décision Head of Product | Clôture ou corrections |

Ces dates supposent qu’aucun arbitrage structurant n’est nécessaire en cours de route.

## 6. Photographies

Les prévisualisations Netlify sont accessibles à toute personne disposant du lien : ce n’est **pas** un environnement à accès restreint. Conformément à l’arbitrage du 25/11, les 4 photographies « usage interne » **ne sont pas intégrées** aux prévisualisations. Les vignettes et la carte d’accueil utilisent les visuels provisoires autorisés de l’application (vagues dessinées pour ARIA, icônes d’instruments). L’emplacement des photos est préparé pour qu’elles puissent être activées dans un environnement restreint, après validation des droits.
