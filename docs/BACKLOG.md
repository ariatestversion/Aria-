# Backlog ARIA — après la clôture du 23/11/2026

Consigné sans correction. Aucun de ces points n’a été traité. Ils attendent la priorisation Product du Sprint 05.

## A. Recommandations QA de Work

> **À compléter.** Le verdict de Work est connu (anomalies retestées résolues ; V0.4 apte à une alpha accompagnée ; contribution à l’arbitrage DA 4), mais le **détail de ses recommandations n’a pas été transmis à Claude**. Coller ici chaque recommandation telle que formulée, avec : écran, constat, priorité, source.

| # | Écran | Recommandation | Priorité | Source |
| --- | --- | --- | --- | --- |
| W1 | | | | Work |

## B. Recommandations de Claude (revue des directions visuelles)

| # | Sujet | Recommandation | Priorité proposée |
| --- | --- | --- | --- |
| C1 | DA 4 par défaut | Après validation mobile, faire de la DA 4 le thème par défaut, puis décider s’il faut garder le sélecteur de thèmes (outil de comparaison) ou le retirer. | Haute |
| C2 | Interprétations DA 4 | Confirmer la navigation (icônes anthracite sur ivoire, ou barre anthracite) et les marges gris clair sur ordinateur. | Haute |
| C3 | Rouge réservé | Vérifier en test utilisateur que les erreurs en anthracite (sans rouge) restent perçues comme des erreurs. | Moyenne |
| C4 | Gris clair sur ivoire | Contraste 1,05:1 compensé par des bordures. Vérifier sur écrans réels, en extérieur et en luminosité basse. | Moyenne |
| C5 | Vert / jaune | Valider leur maintien dans la DA 4, ou définir des teintes d’état propres à la palette. | Moyenne |
| C6 | Photographie | La carte de reprise est prévue avec photo. Fournir le lien Unsplash exact et le photographe, ou commander des visuels aux droits établis. Sinon, garder les vagues. | Moyenne |
| C7 | Nom et logo | Mot-symbole « ARIA » provisoire, en attente de validation. | Moyenne |
| C8 | Médias restants | Retirer les 2 SVG « Ode to Joy » et la note associée : inutilisés, provenance non établie, toujours publiés. | Moyenne |
| C9 | Repère de version | Afficher la version (commit, date) dans le Profil, pour distinguer les prévisualisations. | Basse |
| C10 | Poids du bundle | Environ 530 kB : l’ancien prototype `src/App.tsx` et `src/lib/presets.ts` sont encore compilés. À alléger. | Basse |
| C11 | Branche inutile | Supprimer `claude/sprint04-access-check` sur GitHub (action manuelle : la session Claude ne peut pas supprimer de branche). | Basse |
| C12 | Registre des liens | Ajouter le lien de la copie Google Drive dans `CLAUDE.md`, pour que les futures sessions la tiennent à jour. | Basse |

## C. Tests restant à effectuer

Voir `docs/recettes/da-preview.md`, section « Restant à vérifier ».
