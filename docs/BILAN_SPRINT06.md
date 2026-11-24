# Bilan du Sprint 06 — Finalisation fonctionnelle & préparation V1

**Clôture technique : 24/11/2026**, après les retours QA favorables de Claude et de Work sur la version auditée.
Cette version est la **base de travail des Product Designers et de la direction artistique**. Aucun Sprint 07 n’est lancé sans autorisation.

## 1. Version figée

| Élément | Référence |
| --- | --- |
| Branche du sprint | `claude/sprint06-finalisation-v1` (conservée) |
| Commit applicatif audité et figé | `67aa241` |
| Prévisualisation définitive | https://6b05c4864a41ea883858ac80--ariafirstversion.netlify.app (déploiement `6b05c4864a41ea883858ac80`, non publié, conservé) |
| Fusion | `main` (merge `--no-ff`, historique conservé). Le code applicatif de `main` est identique à `67aa241`. |
| Tag proposé | `v0.6.0-alpha`, à créer depuis GitHub (la session Claude ne peut pas créer de tag) |
| Lien public | Inchangé : Sprint 02, `d86e813`, déploiement `6aff204b…` verrouillé |

## 2. Livré au Sprint 06

- Durée de la reprise : 5 min annoncées dans le bilan = 5 min dans la séance suivante.
- Batterie : consignes propres à l’instrument (« frappes ») pour Justesse et Fluidité.
- Contrôle exhaustif du moteur pédagogique : plus de 10 000 programmes (6 instruments × 3 niveaux × objectifs × 5 durées × 5 supports, avec et sans reprise), sans incohérence.
- Comptes : aucune préférence ni saisie ne passe d’un compte à l’autre sur un même appareil ; texte d’inscription locale exact.
- Morceaux personnels : PDF importé ouvrable depuis la fiche et la séance, liens cliquables, libellés de ressources.
- Comparaison A/B : une prise ne peut plus être comparée à elle-même.
- Droits des médias : plus aucun média de provenance non établie publié (retrait des fichiers « Ode to Joy »).

## 3. Recette

| Recette | Version | Résultat |
| --- | --- | --- |
| Tests unitaires (Vitest) | `67aa241` | 37/37 |
| Parcours e2e (Chromium, micro simulé, 390×844 et 320×640) | `67aa241` | 136/136 |
| QA Claude | `67aa241` | **Favorable** (verdict transmis par la porteuse du projet) |
| QA Work | `67aa241` | **Favorable** (verdict transmis par la porteuse du projet) |

Les rapports détaillés des deux audits n’ont pas été transmis à la session de développement.

## 4. Réserves

### Stockage local
- Toutes les données (profil musical, morceaux, ressources, séances, prises audio) sont stockées **dans le navigateur de l’appareil** : `localStorage` pour les données, IndexedDB pour les fichiers audio et PDF.
- Elles sont **perdues** si l’on efface les données du navigateur, si l’on utilise la navigation privée, ou si l’on change de navigateur ou d’appareil.
- **Safari** peut effacer automatiquement les données d’un site non visité pendant 7 jours. ARIA demande un stockage persistant (`navigator.storage.persist()`), sans garantie.
- Espace limité selon l’appareil : en cas de stockage plein, un message s’affiche, mais aucune gestion de quota n’existe.

### Comptes
- **Comptes locaux** : créés et vérifiés sur l’appareil (mot de passe dérivé par PBKDF2, jamais en clair). Un compte local n’existe que sur l’appareil où il a été créé. Pas de récupération de mot de passe.
- **Compte cloud (Supabase)** : utilisé seulement s’il est configuré. **Non testé** : l’environnement de test n’a pas de configuration Supabase.
- **Connexion Google** : affichée, mais « pas encore disponible ».
- **Mode découverte** : ses données ne sont pas reprises dans un compte créé ensuite.
- Isolation vérifiée entre deux comptes d’un même appareil (morceaux, prises, préférences).

### Synchronisation
- **Aucune synchronisation des données.** Même avec un compte cloud, morceaux, prises et séances restent sur l’appareil. Il n’y a ni sauvegarde distante ni accès multi-appareil. Y remédier serait une fonctionnalité majeure, soumise à arbitrage Produit (voir `docs/BACKLOG.md`, P-1).

### Tests sur appareils physiques
- **Aucun test physique pour les Sprints 05 et 06.** Le seul test physique est celui de la V0.4 (`820bfe3`, 20/11 : Chrome Mac, et iPhone via le navigateur intégré à une application).
- Les interruptions (appel, arrière-plan, micro coupé), l’écran maintenu allumé et l’ouverture des PDF n’ont été vérifiés qu’en **simulation** dans Chromium.
- La grille à réaliser (Safari iPhone ouvert directement, Chrome Android) est dans `docs/recettes/sprint06.md`, section 3. Elle est **un prérequis à toute publication**.

### Autres limites connues
- Aucune analyse audio : ARIA n’écoute pas le contenu des prises ; tout vient des observations et auto-évaluations de l’utilisateur.
- Règles générales pour l’instrument « Autre » ; métronome capté dans les prises sur haut-parleur.
- Écran de connexion : ancien habillage, hors DA 4, avec « vous » et « tu » mélangés (pour la direction artistique).
- Suppression d’un morceau absente de l’interface.

## 5. Pour les Product Designers et la direction artistique

- Version de référence : prévisualisation définitive ci-dessus ; code sur `main`.
- Design System : `src/design/tokens.css`, `src/design/components.css`, `src/design/Icon.tsx`, documenté dans `docs/DESIGN_SYSTEM.md` ; palette DA 4 dans `docs/DA4_IVOIRE_MARINE.md`.
- Captures de tous les écrans : `docs/screenshots/sprint06/`.
- Points ouverts pour arbitrage : `docs/BACKLOG.md` (P-1 à P-5).
