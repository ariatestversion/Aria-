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

État au 26/11 sur la référence Sprint 08 `975e9ea` : 44/44 tests unitaires ; 297/297 contrôles en Nuit & cuivre (palettes candidates cuivre et bleu retirées).

## Réserves R09 : correspondance avec la fiche QA

| Réserve | Fiche QA | Ce qui change avec l’identité visuelle | À vérifier en plus sur la version finale |
| --- | --- | --- | --- |
| R09-01 · audio, prises, persistance | P01, P03, P04 | Rien dans la chaîne audio | Rejouer sur la version finale ; la couleur du bouton de prise au repos change selon la palette |
| R09-02 · VoiceOver, focus, ergonomie, texte agrandi, bilan | P05 | Couleurs de la séance immersive, logotype Sonique | Lisibilité de la séance instrument en main en Nuit & cuivre ; noter la version d’iOS (16.2 ou plus requis) ; **scénario S08-QA-REG-01 sur Safari et iPhone physique** (voir ci-dessous) |
| R09-03 · métronome, tempo | P02 | Pastille « Métronome · N BPM » et repère « Conseillé » recolorés | Distinction tempo actif / tempo conseillé dans la palette retenue |
| R09-04 · Android, cas d’erreur, parcours résiduels | Complément Android | Aucun | Selon les fixtures du QA |

## À fournir par l’Ingénierie à la livraison de la version finale

- Commit complet, lien de prévisualisation et `/version.json` correspondant.
- Captures de tous les écrans dans la palette retenue (`docs/screenshots/sprint08/`).
- Résultat de la recette automatisée sur ce commit.
- Liste des fichiers d’identité intégrés (police, SVG, images) avec leurs licences (`docs/LICENCES.md`).

## Contrôle S08-QA-REG-01 ajouté à R09-02 (arbitrage du Head of Product, 26/11/2026)

Statut : **non reproduit, en attente de preuve.** À exécuter sur iPhone physique, dans Safari ouvert directement, en navigation normale, sur la version candidate du Sprint 09 (ou sur la prévisualisation 3 du Sprint 08 : https://6b084f388ee01180268c44f2--ariafirstversion.netlify.app) :

1. Mode local : Piano, « Je débute », Rythme, 15 min ; morceau de test au titre inédit ; aucune prise.
2. Avancer jusqu’à l’étape 4 avec « Étape suivante », puis « Faire le bilan ».
3. « Garder en brouillon », puis l’onglet Accueil.
4. Recharger la page (geste de Safari).
5. Toucher « Reprendre mon bilan », puis « Reprendre la séance ».

Attendu : la séance s’affiche à l’étape 4, et le brouillon reste listé dans le Suivi.

Preuves à fournir : vidéo de l’écran, modèle d’iPhone, version d’iOS, état du profil (vierge ou déjà utilisé). Si l’écart se reproduit, l’Ingénierie corrige, ajoute la preuve au test `S08 · REG-01` et la contre-recette précède toute validation finale.

## Préparation du lancement opérationnel du Sprint 09 (en attente de l’autorisation de la fondatrice)

- **Point de départ proposé** : nouvelle branche `claude/sprint09-validation` depuis le dernier commit de `claude/sprint08-identite` (documentation seulement après `975e9ea`). Son application est identique à `975e9ea`, la référence figée du Sprint 08. Aucune fusion dans `main` sans décision distincte.
- **Lot Ingénierie (corrections inscrites)** :
  - S08-ENG-01 : instrument par défaut d’un nouveau morceau après rechargement ;
  - S08-QA-01 : avatar « A ».

  Chacune avec son test automatisé dédié, sans autre changement fonctionnel. Estimation : 1 h, recette et prévisualisation comprises.
- **Lot QA (appareils physiques)** : R09-01 à R09-04 selon le protocole P01 à P05, avec le contrôle S08-QA-REG-01 dans R09-02, sur la prévisualisation candidate du Sprint 09.
- **Livrables Ingénierie** :
  - prévisualisation candidate et commit, `version.json` ;
  - recette automatisée (au moins 44 tests unitaires et 297 parcours) ;
  - captures ;
  - mise à jour des registres.
- **Hors périmètre sans décision distincte** : nouvelles fonctionnalités, modèle pédagogique, photographies non autorisées, icône et favicon, fusion, publication.
