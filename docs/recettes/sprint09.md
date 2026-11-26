# Sprint 09 — Préparation de la validation finale (côté Ingénierie)

26 novembre 2026. Le protocole et les preuves relèvent du QA : *SONIQUE-ARIA-Protocole-QA-appareils-physiques* (Drive, fiches P01 à P05). Ce registre ne le remplace pas. Il indique ce que l’Ingénierie fournit pour la recette finale.

## Principe

- La recette finale porte sur la version qui intègre l’identité visuelle validée au Sprint 08 : commit et prévisualisation à désigner à la livraison.
- La prévisualisation 4 du Sprint 07 (`d5e4a7a`) reste disponible comme témoin. En cas d’écart, la rejouer permet de distinguer une réserve ancienne d’une régression du Sprint 08.
- Aucune fonctionnalité nouvelle, aucune modification du modèle pédagogique : seuls les jetons de couleur, la typographie, le logo, l’icône et les images changent.

## Non-régression automatisée (Chromium, micro simulé : ne remplace pas un test physique)

| Commande | Contenu |
| --- | --- |
| `npm run build && npm test` | Build et 44 tests unitaires (pédagogie, prises) |
| `node scripts/e2e-sprint04.mjs` | 244 contrôles, palette par défaut : parcours T01 à T11 automatisables, QA-01 et QA-02, mise en page (320 px, paysage, tablette, ordinateur, texte agrandi 200 %), contraste AA |
| `THEME=<palette> node scripts/e2e-sprint04.mjs` | Les mêmes contrôles dans une autre palette |

État au 26/11 sur `claude/sprint08-identite` : 44/44 tests unitaires et 244/244 contrôles pour chacune des palettes DA A, cuivre et bleu.

## Réserves R09 : correspondance avec la fiche QA

| Réserve | Fiche QA | Ce qui change avec l’identité visuelle | À vérifier en plus sur la version finale |
| --- | --- | --- | --- |
| R09-01 · audio, prises, persistance | P01, P03, P04 | Rien dans la chaîne audio | Rejouer sur la version finale ; la couleur du bouton de prise au repos change selon la palette |
| R09-02 · VoiceOver, focus, ergonomie, texte agrandi, bilan | P05 | Couleurs de la séance immersive, éventuellement typographie et logo | Lisibilité de la séance instrument en main dans la palette retenue ; noter la version d’iOS (16.2 ou plus requis) |
| R09-03 · métronome, tempo | P02 | Pastille « Métronome · N BPM » et repère « Conseillé » recolorés | Distinction tempo actif / tempo conseillé dans la palette retenue |
| R09-04 · Android, cas d’erreur, parcours résiduels | Complément Android | Aucun | Selon les fixtures du QA |

## À fournir par l’Ingénierie à la livraison de la version finale

- Commit complet, lien de prévisualisation et `/version.json` correspondant.
- Captures de tous les écrans dans la palette retenue (`docs/screenshots/sprint08/`).
- Résultat de la recette automatisée sur ce commit.
- Liste des fichiers d’identité intégrés (police, SVG, images) avec leurs licences (`docs/LICENCES.md`).
