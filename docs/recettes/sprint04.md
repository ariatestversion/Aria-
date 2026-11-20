# Recette Sprint 04 — Expérience musicale & Design System

## Tests automatisés exécutés

| Suite | Commande | Résultat |
| --- | --- | --- |
| Compilation TypeScript + build Vite | `npm run build` | OK |
| Tests unitaires (moteur pédagogique, bilan, séances) | `npm test` | 20/20 |
| Parcours de bout en bout, mobile 390×844 | `node scripts/e2e-sprint04.mjs` | 64/64 |

### Ce que couvre le parcours de bout en bout

- **Onboarding.** Guitare, « Je débute », objectif Rythme, 15 min. À la préparation, l’objectif, la durée et l’instrument sont bien présélectionnés (correctif de transmission des objectifs).
- **Scénario de référence.** Guitariste débutante, 15 min, rythme, sans partition :
  - 4 étapes, 15 min au total ;
  - main droite étouffée → motif sur un accord → changement d’accord en rythme → prise de contrôle.
- **Séance.**
  - Consigne, durée et critère de réussite affichés à chaque étape.
  - Métronome qui démarre et s’arrête.
  - Enregistrement accessible pendant le travail.
  - 2 prises du même passage.
  - Auto-évaluation « Oui, réussi » / « Pas encore ».
- **Bilan.**
  - Comparaison A/B de deux prises.
  - 4 rubriques, avec leurs sources affichées.
  - Exercice correctif lié à la difficulté notée.
  - Analyse automatique déclarée absente.
- **Rechargement de la page.** Les prises restent listées dans le Suivi, la lecture démarre réellement (`currentTime > 0`) et le bouton « Pause » est explicite. La suppression passe par une confirmation.
- **Brouillons.**
  - Une séance vide est refusée comme « terminée ».
  - Le brouillon est listé à part.
  - Le compteur des séances terminées ne bouge pas.
- **Micro refusé.** Message explicite et bouton « Réessayer le micro ». Après autorisation, l’enregistrement démarre.
- **Mise en page de chaque écran** (Accueil, Préparation, Séance, Bilan, Suivi, Bibliothèque, Profil, Micro refusé) :
  - pas de défilement horizontal ;
  - toutes les cibles tactiles mesurent au moins 44 px ;
  - aucun contrôle n’est masqué par la barre de navigation.
- **Variante marine.** Appliquée en aperçu, puis la variante par défaut est restaurée. Aucune erreur JavaScript pendant le parcours.

### Non-régression — recette indépendante (clôture du Sprint 04)

| # | Cas | Attendu | Tests |
| --- | --- | --- | --- |
| NR1 | Garder une séance en brouillon, recharger, la reprendre et la terminer | Une seule séance terminée de plus, le brouillon correspondant disparaît, les autres brouillons restent, les observations du brouillon sont restaurées | e2e (avec rechargement réel) + unitaire `dedupeSessionLogs` |
| NR2 | Morceau de guitare sans ressource, préparer une séance | « À l’oreille, sans support » sélectionné par défaut, « Partition » non présélectionnée, choix modifiable | e2e + unitaires `defaultResource` |
| NR3 | Bilan d’une séance sans prise | Proposer une première prise de référence ; l’invitation à comparer n’apparaît que si une prise de référence existe | e2e (cas sans prise et cas avec prise) + unitaires |

Contrôle : les tests NR, lancés sur l’ancienne prévisualisation `6b00649f…`, échouent bien (NR2, NR3 et la restauration du brouillon en échec, puis arrêt du parcours au cas NR1). Ils passent sur la version corrigée.

### Limites des tests automatisés

- **Le micro est simulé** par Chromium (`--use-fake-device-for-media-stream`). Le signal enregistré est un son de test.
- **Le refus du micro est simulé** : `getUserMedia` est forcé à rejeter `NotAllowedError`. En mode headless, Chromium ne présente pas de vraie boîte d’autorisation.
- Tests exécutés uniquement dans Chromium (bureau, viewport mobile). Ni WebKit, ni Firefox.

## Tests sur appareil physique

**Aucun test sur appareil physique n’a été réalisé par Claude.** Claude travaille dans un conteneur cloud sans iPhone ni Android : ni Safari iOS, ni micro réel. Tous les résultats des sections précédentes proviennent de Chromium avec un micro simulé.

### Test réalisé par la recette — Chrome sur Mac, micro réel

| Élément | Détail |
| --- | --- |
| Date | 2026-11-20 |
| Réalisé par | La recette (porteuse du projet), et non par Claude |
| Appareil, navigateur | Mac, Google Chrome, microphone réel |
| Version testée | Prévisualisation https://6b006f0b3d9e6991f197cd84--ariafirstversion.netlify.app, commit `820bfe3` |
| Résultat | **Réussi** |

| Cas | Résultat |
| --- | --- |
| Enregistrer deux prises du même passage avec le micro réel | Réussi |
| Réécouter les deux prises : son audible | Réussi, qualité sonore jugée satisfaisante |
| Fermer puis rouvrir le navigateur, deux fois de suite → les deux prises restent accessibles et audibles | Réussi |

Ce test couvre uniquement Chrome sur ordinateur. Il ne remplace pas le test Safari iPhone : format d’enregistrement, conservation des données et lecture audio y sont différents.

### Test décisif pour la mise en production — Safari iPhone (à réaliser par la recette)

Sur la prévisualisation finale :

1. Ouvrir le lien dans **Safari** (pas dans une application tierce), puis Commencer → onboarding.
2. Bibliothèque → ajouter un morceau → Préparer une séance → Commencer la séance.
3. Enregistrer → autoriser le micro → jouer environ 10 s → Arrêter. Recommencer : **deux prises du même passage**.
4. Faire le bilan : écouter la prise A puis la prise B (son audible, Pause fonctionnelle). Terminer la séance.
5. **Fermer l’onglet** (sélecteur d’onglets → croix), puis rouvrir le lien de prévisualisation.
6. Suivi → les deux prises sont listées → **Lecture** de chacune : le son doit être audible.

Suivi des appareils mobiles (au 2026-11-20 : non testés) :

| Cas | iPhone · Safari | Android · Chrome |
| --- | --- | --- |
| Autoriser le micro → enregistrer → arrêter → réécouter | non testé | non testé |
| Deux prises du même passage, comparaison A/B dans le bilan | non testé | non testé |
| Fermer l’onglet, rouvrir → Suivi → les deux prises sont audibles | non testé | non testé |
| Supprimer une prise (avec confirmation) | non testé | non testé |
| Refuser le micro → message → autoriser dans les réglages → Réessayer | non testé | non testé |
| Métronome audible, enregistrement en même temps | non testé | non testé |
| Quitter l’écran pendant l’enregistrement → prise sauvegardée automatiquement | non testé | non testé |
| Lisibilité, zones tactiles, aucune superposition avec la barre système | non testé | non testé |

Points d’attention propres à Safari iOS, non vérifiés :
- Format d’enregistrement `audio/mp4`, choisi par `pickMimeType`.
- Conservation des blobs dans IndexedDB après fermeture de l’onglet.
- Effacement automatique des données de site par Safari après 7 jours sans visite (ITP). Une prise ancienne peut alors afficher « Audio introuvable ».

## Statut de la mise en production

**Non autorisée.** Le test Safari iPhone est le préalable décisif, et Android reste non testé. La production reste verrouillée sur le Sprint 02 (`6aff204b…`, `d86e813`).
