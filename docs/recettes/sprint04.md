# Recette Sprint 04 — Expérience musicale & Design System

## Tests automatisés exécutés

| Suite | Commande | Résultat |
| --- | --- | --- |
| Compilation TypeScript + build Vite | `npm run build` | OK |
| Tests unitaires (moteur pédagogique, bilan, séances) | `npm test` | 15/15 |
| Parcours de bout en bout, mobile 390×844 | `node scripts/e2e-sprint04.mjs` | 54/54 |

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

### Limites des tests automatisés

- **Le micro est simulé** par Chromium (`--use-fake-device-for-media-stream`). Le signal enregistré est un son de test.
- **Le refus du micro est simulé** : `getUserMedia` est forcé à rejeter `NotAllowedError`. En mode headless, Chromium ne présente pas de vraie boîte d’autorisation.
- Tests exécutés uniquement dans Chromium (bureau, viewport mobile). Ni WebKit, ni Firefox.

## Tests sur appareil physique

**Non réalisés dans ce sprint.** Aucun test sur iPhone ou Android n’a été effectué. La checklist ci-dessous reste à exécuter et ne doit pas être déclarée réussie avant de l’avoir été.

| Cas | iPhone · Safari | Android · Chrome |
| --- | --- | --- |
| Autoriser le micro → enregistrer → arrêter → réécouter | non testé | non testé |
| Deux prises du même passage, comparaison A/B dans le bilan | non testé | non testé |
| Recharger → Suivi → réécouter une prise | non testé | non testé |
| Supprimer une prise (avec confirmation) | non testé | non testé |
| Refuser le micro → message → autoriser dans les réglages → Réessayer | non testé | non testé |
| Métronome audible, enregistrement en même temps | non testé | non testé |
| Quitter l’écran pendant l’enregistrement → prise sauvegardée automatiquement | non testé | non testé |
| Lisibilité, zones tactiles, aucune superposition avec la barre système | non testé | non testé |

Point d’attention connu : Safari iOS enregistre en `audio/mp4`. Le code le gère (`pickMimeType`), mais ce n’est pas vérifié sur appareil.
