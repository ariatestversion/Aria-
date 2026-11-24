# Registre de recette — Sprint 05 · Expérience de pratique & préparation Alpha

Branche `claude/sprint05-pratique`. Prévisualisation, commit et résultats : voir la section 1 et `SOURCE_VERSION.json`.
**Sprint non clôturé** : la clôture attend la recette QA et les tests sur mobile réel.

## 1. Tests automatisés (Claude · Chromium · micro simulé)

| Suite | Résultat |
| --- | --- |
| `npm run build` | OK |
| `npm test` (unitaires) | 30/30 |
| `node scripts/e2e-sprint04.mjs` (390×844, plus contrôles à 320×640) | 94/94 en local |

Les interruptions sont **simulées** : événement `ended` sur la piste du micro (comme un appel entrant) et `visibilityState = hidden` (comme un changement d’application). Leur comportement sur un vrai téléphone reste à vérifier.

## 2. Critères d’acceptation du sprint

| Critère | Automatisé (e2e) | Mobile réel |
| --- | --- | --- |
| Choisir un morceau | ✔ | à faire |
| Préparer une séance (et la suite d’une séance précédente) | ✔ | à faire |
| Travailler : consigne, passage, tempo, métronome, minuteur | ✔ | à faire |
| Enregistrer plusieurs prises | ✔ | à faire |
| Réécouter, comparer A/B | ✔ | à faire |
| Obtenir un bilan exploitable (observations, correctif, prochaine séance cohérente) | ✔ | à faire |
| Reprendre après fermeture (prises, séance, observations du bilan) | ✔ (rechargement) | à faire |

## 3. Restant à vérifier sur mobile réel

À faire sur Safari iPhone (ouvert directement, pas dans une autre application) et Chrome Android.

| Cas | iPhone · Safari | Android · Chrome |
| --- | --- | --- |
| Parcours complet des critères ci-dessus, DA 4 | à faire | à faire |
| Appel entrant ou alarme pendant une prise → prise partielle sauvegardée, message affiché | à faire | à faire |
| Changer d’application pendant une prise → prise arrêtée et sauvegardée | à faire | à faire |
| L’écran ne se met pas en veille pendant une prise | à faire | à faire |
| Écran verrouillé pendant une prise | à faire | à faire |
| Bilan tapé puis application fermée → observations retrouvées | à faire | à faire |
| Fermer l’onglet, rouvrir le lendemain → prises audibles dans le Suivi | à faire | à faire |
| Lisibilité DA 4 (lumière forte et faible), zones tactiles | à faire | à faire |

## 4. Rien d’inventé

- Aucune analyse audio : la continuité utilise uniquement les observations et auto-évaluations saisies par l’utilisateur, et le tempo du programme précédent.
- Les règles appliquées sont affichées (« Règle ARIA appliquée à tes observations »).
