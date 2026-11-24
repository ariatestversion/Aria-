# Backlog ARIA

## Sprint 06 — reports de la clôture du Sprint 05 (24/11/2026)

| # | Sujet | Constat | Priorité proposée |
| --- | --- | --- | --- |
| S06-1 | **Fait au Sprint 06.** Écart mineur de durée de la reprise | Le bilan annonce l’exercice de reprise « pendant 5 min », mais dans la séance suivante sa durée vient de la répartition du temps disponible : par exemple **3 min** sur une séance de 15 min (scénario Work). Le total de la séance reste exact. Aligner la durée annoncée et la durée réelle (annoncer la durée calculée, ou réserver la durée annoncée). | Mineure |
| S06-2 | Tests sur appareils physiques | Safari iPhone (ouvert directement) et Chrome Android : grille `docs/recettes/sprint05.md`, section 3. Prérequis de toute publication. | Haute |
| S06-3 | Rapports QA détaillés | Joindre les rapports Work et Claude QA du 24/11 au dépôt pour traçabilité (seuls les verdicts sont consignés). | Basse |

## Pour arbitrage Produit (constats du Sprint 06)

| # | Sujet | Constat |
| --- | --- | --- |
| P-1 | Synchronisation des données | Aucune : morceaux, prises et séances restent sur l’appareil. Le compte cloud sert uniquement à se connecter. |
| P-2 | Découverte → compte | Les données du mode découverte ne sont pas reprises à la création d’un compte. |
| P-3 | Suppression d’un morceau | Absente de l’interface. |
| P-4 | Écran de connexion | Ancien habillage (hors DA 4), « vous » et « tu » mélangés : à confier à la direction artistique. |
| P-5 | Connexion Google | Affichée mais « pas encore disponible ». |

# Archive — après la clôture du 23/11/2026

Consigné sans correction le 23/11. Mise à jour Sprint 05 : C1 traité ; les autres points restent ouverts. Ils attendent la priorisation Product du Sprint 05.

## A. Recommandations QA de Work

> **À compléter.** Le verdict de Work est connu (anomalies retestées résolues ; V0.4 apte à une alpha accompagnée ; contribution à l’arbitrage DA 4), mais le **détail de ses recommandations n’a pas été transmis à Claude**. Coller ici chaque recommandation telle que formulée, avec : écran, constat, priorité, source.

| # | Écran | Recommandation | Priorité | Source |
| --- | --- | --- | --- | --- |
| W1 | | | | Work |

## B. Recommandations de Claude (revue des directions visuelles)

| # | Sujet | Recommandation | Priorité proposée |
| --- | --- | --- | --- |
| C1 | DA 4 par défaut | **Fait au Sprint 05** : DA 4 par défaut, sélecteur retiré du Profil (thèmes de comparaison par `?theme=`). Reste à valider sur mobile. | — |
| C2 | Interprétations DA 4 | Confirmer la navigation (icônes anthracite sur ivoire, ou barre anthracite) et les marges gris clair sur ordinateur. | Haute |
| C3 | Rouge réservé | Vérifier en test utilisateur que les erreurs en anthracite (sans rouge) restent perçues comme des erreurs. | Moyenne |
| C4 | Gris clair sur ivoire | Contraste 1,05:1 compensé par des bordures. Vérifier sur écrans réels, en extérieur et en luminosité basse. | Moyenne |
| C5 | Vert / jaune | Valider leur maintien dans la DA 4, ou définir des teintes d’état propres à la palette. | Moyenne |
| C6 | Photographie | La carte de reprise est prévue avec photo. Fournir le lien Unsplash exact et le photographe, ou commander des visuels aux droits établis. Sinon, garder les vagues. | Moyenne |
| C7 | Nom et logo | Mot-symbole « ARIA » provisoire, en attente de validation. | Moyenne |
| C8 | **Fait au Sprint 06.** Médias restants | Retirer les 2 SVG « Ode to Joy » et la note associée : inutilisés, provenance non établie, toujours publiés. | Moyenne |
| C9 | Repère de version | Afficher la version (commit, date) dans le Profil, pour distinguer les prévisualisations. | Basse |
| C10 | Poids du bundle | Environ 530 kB : l’ancien prototype `src/App.tsx` et `src/lib/presets.ts` sont encore compilés. À alléger. | Basse |
| C11 | Branche inutile | Supprimer `claude/sprint04-access-check` sur GitHub (action manuelle : la session Claude ne peut pas supprimer de branche). | Basse |
| C12 | Registre des liens | Ajouter le lien de la copie Google Drive dans `CLAUDE.md`, pour que les futures sessions la tiennent à jour. | Basse |

## C. Tests restant à effectuer

Voir `docs/recettes/da-preview.md`, section « Restant à vérifier ».
