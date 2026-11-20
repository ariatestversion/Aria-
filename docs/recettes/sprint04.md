# Registre de recette — Sprint 04 / ARIA MVP Alpha V0.4

Ce registre distingue trois sources de résultats :
- **les tests automatisés**, exécutés par Claude avec un micro simulé ;
- **les tests physiques**, réalisés par la recette avec de vrais micros et appareils ;
- **les tests encore à faire.**

Version de référence MVP Alpha V0.4 : commit `91441b1`, prévisualisation https://6b0078bb87479237251ba188--ariafirstversion.netlify.app (`version.json` = `91441b1`).

## 1. Tests automatisés (Claude, micro simulé)

| Suite | Commande | Résultat |
| --- | --- | --- |
| Compilation TypeScript + build Vite | `npm run build` | OK |
| Tests unitaires (moteur pédagogique, bilan, séances, non-régression) | `npm test` | 23/23 |
| Parcours de bout en bout, Chromium, mobile 390×844 | `node scripts/e2e-sprint04.mjs` | 68/68 en local, et sur l’URL de prévisualisation définitive |

### Couverture du parcours de bout en bout

- **Onboarding.** Guitare, « Je débute », objectif Rythme, 15 min. À la préparation, l’objectif, la durée et l’instrument sont présélectionnés.
- **Scénario de référence.** Guitare, 15 min, rythme, sans partition :
  - 4 étapes, 15 min au total ;
  - main droite étouffée → motif sur un accord → changement d’accord en rythme → prise de contrôle.
- **Séance.**
  - Consigne, durée et critère de réussite à chaque étape.
  - Métronome.
  - Enregistrement accessible pendant le travail.
  - 2 prises du même passage.
  - Auto-évaluation « Oui, réussi » / « Pas encore ».
- **Bilan.**
  - Comparaison A/B de deux prises.
  - 4 rubriques, avec leurs sources.
  - Exercice correctif lié à la difficulté notée.
  - Analyse automatique déclarée absente.
- **Rechargement.** Les prises sont listées dans le Suivi, la lecture démarre réellement, le bouton « Pause » est explicite. Suppression avec confirmation.
- **Brouillons.** Une séance vide est refusée comme terminée, et les brouillons sont listés à part (voir NR1).
- **Micro refusé.** Message explicite et bouton « Réessayer le micro ». L’enregistrement démarre après autorisation.
- **Mise en page de 8 écrans** :
  - pas de défilement horizontal ;
  - cibles tactiles d’au moins 44 px ;
  - rien de masqué par la barre de navigation.
- **Variante marine.** Aperçu, puis retour à la variante par défaut. Aucune erreur JavaScript.
- **Médias (après leur retrait).** Sur tout le parcours, aucune requête vers `/presets/`, `/instruments/` ni vers un fichier audio ou image matricielle. C’est le contrôle déterminant, car Netlify renvoie la page de l’application, avec un code 200, pour un fichier absent. Aucune réponse 404, aucune image `<img>` sur l’écran final. Les captures `docs/screenshots/sprint04/` sont refaites sur la version finale.

### Limites des tests automatisés

- Le **micro est simulé** par Chromium (`--use-fake-device-for-media-stream`). Le signal enregistré est un son de test.
- Le **refus du micro est simulé** : `getUserMedia` est forcé à rejeter `NotAllowedError`.
- Chromium uniquement. Ni WebKit, ni Firefox.

## 2. Non-régression

| # | Origine | Cas | Attendu | Couverture | Statut |
| --- | --- | --- | --- | --- | --- |
| NR1 | Recette indépendante | Garder une séance en brouillon, recharger, la reprendre et la terminer | Une séance terminée de plus, son brouillon disparaît, les autres brouillons restent, les observations du brouillon sont restaurées | e2e (rechargement réel) + unitaire | Corrigé (`820bfe3`) |
| NR2 | Recette indépendante | Morceau de guitare sans ressource → préparation | « À l’oreille, sans support » par défaut, « Partition » non présélectionnée, choix modifiable | e2e + unitaires | Corrigé (`820bfe3`) |
| NR3 | Recette indépendante | Bilan d’une séance sans prise | Proposer une première prise de référence ; inviter à comparer seulement si une prise existe | e2e + unitaires | Corrigé (`820bfe3`) |
| NR4 | Test physique Chrome Mac | Bilan sans observation, objectif Justesse | Conseil adapté à l’objectif : jamais « monte le tempo » hors Rythme / Tempo ; pas de BPM imposé à la reprise d’une étape de justesse | Unitaires | Corrigé (V0.4) |
| NR5 | Test physique Chrome Mac | Prise enregistrée en séance sans passage saisi | Le Suivi n’affiche pas l’objectif (« Justesse », « Rythme »…) comme passage, y compris pour les prises déjà enregistrées | e2e + unitaire | Corrigé (V0.4) |

| M1 | Arbitrage médias V0.4 | Retrait des 4 audios, des 3 images et des 3 illustrations | Aucune requête vers les médias retirés, structure des écrans conservée (captures) | e2e + revue des captures | Fait (`91441b1`) |

Contre-épreuves :
- M1, lancé sur la prévisualisation `6b0076bc…` (`99a313e`), échouait : requêtes vers `clair-de-lune.jpg` et `piano-dessin.png`.
- NR1 à NR3, lancés sur l’ancienne prévisualisation `6b00649f…`, échouaient.
- NR5, lancé sur la prévisualisation `6b006f0b…` (`820bfe3`), échouait : la prise affichait « · Rythme » comme passage.
- Tous passent sur la version définitive.

## 3. Tests physiques (réalisés par la recette)

**Claude n’a réalisé aucun test physique** : il travaille dans un conteneur cloud, sans appareil ni micro réel. Les résultats ci-dessous ont été déclarés par la recette.

| Date | Appareil, navigateur | Version testée | Cas | Résultat |
| --- | --- | --- | --- | --- |
| 2026-11-20 | Mac · Google Chrome · micro réel | Prévisualisation `6b006f0b…`, commit `820bfe3` | Deux prises du même passage ; réécoute ; fermeture et réouverture du navigateur deux fois → prises toujours accessibles et audibles | **Réussi**. Qualité sonore jugée satisfaisante. |
| 2026-11-20 | iPhone · navigateur intégré à l’application ChatGPT · micro réel | Prévisualisation `820bfe3` | Enregistrement, réécoute, conservation des prises après fermeture | **Réussi** |

Ces tests ont été réalisés sur `820bfe3`. Depuis, la version définitive a modifié deux règles de texte du bilan et l’affichage du libellé de passage, retiré des médias inutilisés et remplacé les visuels par des éléments neutres. L’enregistrement, la lecture et le stockage des prises ne changent pas : `recorder.ts` et `store.ts` sont identiques depuis `820bfe3`, le lecteur `TakePlayer` aussi. Seule la valeur du champ « passage » enregistré avec une prise change (NR5).

Sur iPhone, le navigateur intégré à ChatGPT repose sur le moteur WebKit, comme Safari. Ce n’est cependant pas Safari ouvert directement : la gestion des données de site et des autorisations peut différer.

### Restant à vérifier

Tests reportés à dimanche ou lundi, sur la prévisualisation définitive :

| Cas | Safari iPhone (ouvert directement) | Android · Chrome |
| --- | --- | --- |
| Autoriser le micro → enregistrer → arrêter → réécouter | non testé | non testé |
| Deux prises du même passage, comparaison A/B dans le bilan | non testé | non testé |
| Fermer l’onglet, rouvrir → Suivi → les deux prises sont audibles | non testé | non testé |
| Supprimer une prise (avec confirmation) | non testé | non testé |
| Refuser le micro → message → autoriser dans les réglages → Réessayer | non testé | non testé |
| Métronome audible, enregistrement en même temps | non testé | non testé |
| Quitter l’écran pendant l’enregistrement → prise sauvegardée automatiquement | non testé | non testé |
| Lisibilité, zones tactiles, aucune superposition avec la barre système | non testé | non testé |

Protocole Safari iPhone :
1. Ouvrir le lien de prévisualisation **dans Safari**, faire l’onboarding, ajouter un morceau, puis Préparer une séance et Commencer la séance.
2. Enregistrer deux prises du même passage.
3. Faire le bilan et écouter A puis B.
4. Fermer l’onglet, rouvrir le lien, aller dans le Suivi et réécouter les deux prises.

Points d’attention propres à Safari :
- Effacement automatique des données d’un site non visité depuis 7 jours (ITP). Une prise ancienne afficherait alors « Audio introuvable ».

## 4. Recette indépendante Work — verdict

| Élément | Détail |
| --- | --- |
| Recette | Work, recette indépendante |
| Version testée | Prévisualisation https://6b0078bb87479237251ba188--ariafirstversion.netlify.app, commit `91441b1` |
| Résultat | **Les trois anomalies retestées sont résolues** |
| Verdict | **Produit apte à une alpha accompagnée** |

Verdict rapporté par la porteuse du projet le 2026-11-20. Le rapport détaillé de Work n’est pas joint à ce dépôt.

## 5. Contrôles de clôture (Claude, dernier build)

Exécutés avant la fusion dans `main`, sur la branche au commit `bf78758`. Ce commit ne diffère de `91441b1` que par la documentation et le script e2e : le code applicatif est identique (vérifié par `git diff`).

| Contrôle | Résultat |
| --- | --- |
| `npm ci` (installation propre) | OK |
| `npm run build` | OK |
| `npm test` | 23/23 |
| `node scripts/e2e-sprint04.mjs` (local, micro simulé) | 68/68 |
| e2e sur la prévisualisation `91441b1` | 68/68 |
| Prévisualisation accessible, `version.json` = `91441b1` | OK |
| Production : `version.json` = `d86e813`, déploiement `6aff204b…` `locked: true` | OK (inchangée) |

## 6. Tests physiques restant à effectuer

Sur la prévisualisation `91441b1`, avec la liste de cas de la section 3 (« Restant à vérifier ») :
1. **Safari iPhone, ouvert directement** (pas dans une application tierce) : enregistrement de deux prises, réécoute dans le bilan, fermeture de l’onglet, réécoute depuis le Suivi.
2. **Android · Chrome** : mêmes cas.
3. À l’occasion : refus du micro puis autorisation, métronome pendant l’enregistrement, quitter l’écran pendant un enregistrement.

## 7. Statut de la mise en production

**Non autorisée.** La production reste verrouillée sur le Sprint 02 (`6aff204b…`, `d86e813`). La V0.4 est figée dans `main` (merge `5fead7f`) ; tag `v0.4.0-alpha` à créer sur GitHub. Sa publication sur le lien principal reste soumise à :
1. les tests physiques de la section 6 ;
2. l’autorisation explicite de la porteuse du projet (déverrouillage et publication).
