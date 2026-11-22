# Direction visuelle — prévisualisation comparative

Branche `claude/da-preview`, créée depuis `main` (V0.4, tag `v0.4.0-alpha`). **Prévisualisation uniquement** : la production reste verrouillée, `main` n’est pas modifiée.

## Ce que montre la prévisualisation

Une seule application avec les **mêmes parcours, fonctionnalités et données que la V0.4**. Trois directions visuelles se choisissent dans **Profil → Direction visuelle (aperçu)**, ou par l’URL `?theme=marine|electrique|espresso`. Le choix est mémorisé sur l’appareil uniquement.

| Thème | Source | Par défaut |
| --- | --- | --- |
| **Marine (DA 1)** | Dossier « ARIA — Direction visuelle » (6 pages) : marine `#152642`, papier, encre, ardoise, sable, Manrope | **Oui**, c’est la référence de travail |
| **Bleu électrique (DA 2)** | Dossier « Direction visuelle actuelle » (3 pages, 22/11/2026) : blanc, gris clair, bleu `#2448EA`, anthracite, rouge | Non |
| **Crème & espresso (V0.4)** | Version actuelle, recettée et taguée `v0.4.0-alpha` | Non |

Captures comparatives, avec les mêmes données dans les trois thèmes : `docs/screenshots/da-preview/<thème>-<écran>.png`. Elles sont générées par `node scripts/da-captures.mjs`.

## Fidélité et interprétations

Appliqué tel que décrit :
- palettes, couleurs d’état ;
- Manrope pour les titres et les textes ;
- tailles 36/32/24/18/16/13 ;
- rayons 16 et 22 px ;
- barre de 70 px, cibles de 44 px, marges de 20 px (16 px sous 360 px) ;
- pastille de l’onglet actif ;
- carte de reprise (visuel en haut, aplat, bouton « Reprendre ») ;
- bloc de consigne (DA 1 : marine, libellés sable ; DA 2 : gris clair, trait bleu, libellés bleus) ;
- bouton d’enregistrement (DA 1 : marine → rose « Arrêter · 00:12 » avec point rouge ; DA 2 : bleu → rouge plein) ;
- vignettes à vagues (DA 1), listes sans vignette (DA 2) ;
- libellé persistant du champ de recherche.

Interprétations et écarts volontaires :
1. **Contenu V0.4 conservé.** Les maquettes montrent d’anciens écrans. Les fonctionnalités validées au Sprint 04 restent présentes, avec le style de la DA : consigne, durée, minuteur, auto-évaluation, prises de séance, bilan en 4 rubriques, sources, comparaison A/B.
2. **« Bonjour {prénom}, »** seulement si le prénom est connu (correction du Sprint 03). Les maquettes affichent « Bonjour, » seul.
3. **Erreur ≠ enregistrement.** L’erreur garde un contour et une icône d’alerte ; l’enregistrement suit la DA.
4. **Métronome actif** (grisé dans la maquette DA 1).
5. **Poids des titres** : la DA 1 indique 800, mais les maquettes paraissent plus légères. 700 est retenu pour la DA 1, 500 pour la DA 2, d’après le rendu des maquettes.
6. **Bordure des champs DA 1** : `#8290A3` donne 2,93:1 sur papier, sous le seuil de 3:1. Elle est corrigée en `#76859A` (3,39:1).
7. **Champs DA 2** : gris sans bordure, 1,08:1. Une bordure `#8C93A0` (3,09:1) est ajoutée.
8. **DA 2 sans vert ni jaune** : la palette fonctionnelle V0.4 est reprise pour ces états.
9. **Écrans non couverts par les DA** (bienvenue, onboarding, préparation, fiche morceau, enregistrement, connexion) : les mêmes tokens leur sont appliqués.
10. **Logo** : le mot-symbole « ARIA » actuel est conservé, puisque le nom et le logo sont à valider.
11. **Photographie absente** : la photo Unsplash des maquettes n’est pas intégrée (voir ci-dessous). Elle est remplacée par un visuel de vagues dessiné pour ARIA, ce que la DA 1 prévoit « lorsque l’image manque ».
12. **Hors périmètre DA 2** : les modes « Audio · Vidéo · Photo » et les titres de morceaux d’exemple des maquettes sont de nouvelles fonctionnalités ou des contenus, donc non intégrés.

## Droits des ressources

| Ressource | Statut |
| --- | --- |
| Manrope (Google Fonts) | SIL Open Font License 1.1, usage commercial autorisé |
| Fraunces (mot-symbole ARIA, thème V0.4) | SIL Open Font License 1.1 |
| Icônes | Jeu ARIA (`src/design/Icon.tsx`), dessiné pour le projet. Les icônes des maquettes ne sont pas importées. |
| Vagues, fonds | SVG et CSS créés pour ARIA |
| Photographie de studio (les deux DA) | **Non intégrée.** Source citée : « Unsplash », sans lien ni auteur. La licence Unsplash autorise l’usage commercial sans attribution, mais ne couvre ni les marques visibles (instruments) ni les autorisations de propriété. Il faut le lien exact pour décider. La DA 1 demande aussi d’autres photos (voix, basse, batterie, claviers), non fournies. |

## Tests

Unitaires 23/23. e2e `scripts/e2e-sprint04.mjs` : 79/79, dont le changement de thème et un audit de mise en page de l’accueil dans les 3 thèmes. Micro simulé, aucun test sur appareil physique.
