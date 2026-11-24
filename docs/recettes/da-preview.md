# Registre de recette — prévisualisation des directions visuelles

Version figée le 23/11/2026 : https://6b049602aae77d02d0479a31--ariafirstversion.netlify.app, branche `claude/da-preview`, commit applicatif `14723ee`. Le site public n’est pas concerné : il reste sur le Sprint 02.

## 1. Tests automatisés (Claude, micro simulé, Chromium)

| Suite | Résultat | Version |
| --- | --- | --- |
| `npm run build` | OK | `14723ee` |
| `npm test` (unitaires) | 23/23 | `14723ee` |
| `node scripts/e2e-sprint04.mjs` (parcours complet, 390×844) | 83/83 | `14723ee`, en local |
| Captures comparatives (`scripts/da-captures.mjs`) | 28 captures, 7 écrans × 4 thèmes, données identiques | `14723ee` |

Le parcours e2e couvre les fonctionnalités V0.4 (onboarding, séance, enregistrement, bilan, suivi, brouillons, micro refusé) et :
- le thème Marine par défaut ;
- le passage aux 4 thèmes ;
- un audit de mise en page de l’accueil dans chaque thème : pas de défilement horizontal, cibles d’au moins 44 px, rien de masqué par la navigation.

Non réalisé : le parcours e2e directement sur l’URL de cette prévisualisation (adresse non autorisée dans l’environnement de la session). Le build déployé provient du même commit que le build testé.

## 2. Tests physiques

| Date | Appareil | Version | Résultat | Réalisé par |
| --- | --- | --- | --- | --- |
| 20/11/2026 | Mac · Chrome · micro réel | V0.4 `820bfe3` | Réussi (enregistrement, réécoute, conservation après fermeture) | Recette |
| 20/11/2026 | iPhone · navigateur intégré à ChatGPT · micro réel | V0.4 `820bfe3` | Réussi | Recette |
| — | Toute version des directions visuelles | `14723ee` | **Aucun test physique à ce jour** | — |

Le code audio (`recorder.ts`, `store.ts`, lecteur de prise) est inchangé depuis `820bfe3`. Seuls l’habillage et la disposition du bouton d’enregistrement ont changé.

## 3. Restant à vérifier (validation finale mobile de la DA 4)

Sur https://6b049602aae77d02d0479a31--ariafirstversion.netlify.app/?theme=ivoire

| Cas | Safari iPhone (ouvert directement) | Android · Chrome |
| --- | --- | --- |
| Lisibilité des textes, gris clair visible sur ivoire (lumière forte et faible) | à faire | à faire |
| Accueil : carte de reprise marine, bouton bleu ciel | à faire | à faire |
| Séance : bloc de consigne marine lisible en jouant | à faire | à faire |
| Enregistrement : marine au repos → rouge « Arrêter · mm:ss » en cours | à faire | à faire |
| Deux prises, réécoute dans le bilan, comparaison A/B | à faire | à faire |
| Fermer l’onglet, rouvrir → Suivi → prises audibles | à faire | à faire |
| Micro refusé : erreur anthracite comprise comme une erreur | à faire | à faire |
| Sélections bleu ciel (onboarding, préparation, profil) | à faire | à faire |
| Barre de navigation : onglet actif, zone sûre, pas de chevauchement | à faire | à faire |
| Zones tactiles ≥ 44 px confortables | à faire | à faire |

## 4. Statut

- La DA 4 est retenue comme référence, **sous réserve de la validation mobile ci-dessus**.
- Aucun nouveau développement ni aucune mise en production ne sont autorisés à ce jour.
