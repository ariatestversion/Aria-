# Bilan du Sprint 05 — Expérience de pratique & préparation Alpha

**Clôture technique : 24/11/2026**, après les retours favorables de Work et de Claude QA sur la version corrigée.

## 1. Version figée

| Élément | Référence |
| --- | --- |
| Branche du sprint | `claude/sprint05-pratique` (conservée) |
| Commit applicatif figé | `d79b2d2` (correctifs QA inclus) |
| Prévisualisation définitive | https://6b05bcb61ae60f91656e77ef--ariafirstversion.netlify.app (déploiement `6b05bcb61ae60f91656e77ef`, non publié, conservé) |
| Fusion | `main` (merge `--no-ff`, historique conservé). Le code applicatif de `main` est identique à `d79b2d2`. |
| Tag proposé | `v0.5.0-alpha`, à créer depuis GitHub (la session Claude ne peut pas pousser de tag) |
| Production | Inchangée : Sprint 02, `d86e813`, déploiement `6aff204b…` verrouillé. Aucune publication sans autorisation explicite. |

## 2. Livré

- **Continuité entre séances** : rappel de la dernière séance ; séance suivante construite à partir des observations et auto-évaluations de l’utilisateur ; tempo −8 / +4 BPM selon règle explicite ; désactivable.
- **Reprise pédagogique cohérente** (correctif QA) : un seul exercice de reprise, calculé au bilan, enregistré, repris à l’identique ; jamais deux fois le même exercice.
- **Consignes applicables** : passage et métronome au tempo de l’étape au-dessus de la consigne.
- **Enregistrement fiabilisé** : interruption par l’appareil, mise en arrière-plan, écran maintenu allumé, erreurs de stockage, demande de stockage persistant.
- **Bilan** : sauvegarde pendant la saisie ; retour direct au bilan après rechargement ou depuis l’accueil (correctif QA) ; rappel de la séance précédente.
- **Navigation** : onglet actif dérivé de l’écran (correctif QA).
- **DA 4 Ivoire & marine** par défaut, sans nouvelle exploration graphique.

## 3. Recette

| Recette | Version | Résultat |
| --- | --- | --- |
| Tests unitaires (Vitest) | `d79b2d2` | 35/35 |
| Parcours e2e (Chromium, micro simulé, 390×844 et 320×640) | `d79b2d2` | 115/115, dont 21 contrôles de non-régression QA |
| Audit indépendant Work (24/11) | `d79b2d2` | **Favorable** (retour transmis par la porteuse du projet) |
| Audit Claude QA (24/11) | `d79b2d2` | **Favorable** (retour transmis par la porteuse du projet) |

Le détail des rapports Work et Claude QA n’a pas été transmis à la session de développement : seuls les verdicts sont consignés ici.

## 4. Réserves restantes

- **Aucun test sur appareil physique** pour le Sprint 05. À faire avant toute publication :
  - Safari iPhone ouvert directement (pas dans une autre application) : enregistrement, réécoute, conservation après fermeture, interruption par un appel, mise en arrière-plan, écran verrouillé ;
  - Chrome Android : mêmes cas ;
  - vérification visuelle mobile de la DA 4 (lumière forte et faible, zones tactiles).
  La grille est dans `docs/recettes/sprint05.md`, section 3.
- **Interruptions testées seulement en simulation** (événement `ended` sur la piste du micro, `visibilityState = hidden`).
- **Stockage local** : `navigator.storage.persist()` est demandé mais n’est pas garanti ; Safari peut effacer les données après 7 jours sans visite.
- **Écart mineur de durée** : reporté au Sprint 06 (voir `docs/BACKLOG.md`, S06-1).
- Limites inchangées : aucune analyse audio ; règles générales pour l’instrument « Autre » ; métronome capté dans les prises sur haut-parleur.

## 5. Point de départ du Sprint 06

Le Sprint 06 part de `main` après cette fusion, sur sa propre branche, avec sa propre prévisualisation Netlify. Le lien public principal reste inchangé sans autorisation explicite de publication.
