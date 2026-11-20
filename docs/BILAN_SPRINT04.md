# Bilan définitif — Sprint 04 · ARIA MVP Alpha V0.4

Dépôt `ariatestversion/Aria-`, branche `claude/sprint04-experience-musicale`, base `23ea182` (source Cursor `104645c`, Sprint 03). **Prévisualisation définitive MVP Alpha V0.4** : https://6b0078bb87479237251ba188--ariafirstversion.netlify.app (commit `91441b1`, `version.json` vérifié). Détails : `docs/SOURCE.md` et `SOURCE_VERSION.json`.
Production : verrouillée sur le Sprint 02. **Aucune mise en production.**

## 1. Fonctionnalités acquises

### Parcours
- Onboarding en 4 étapes : instruments (plusieurs), niveau, objectifs (le premier est principal), temps disponible.
- Profil modifiable, repris à la préparation de chaque séance (correctif de transmission des objectifs).
- Bibliothèque : recherche, filtres de genre, ajout de morceau ; démos marquées « Démo » et chargées seulement sur demande en mode découverte.
- Fiche morceau :
  - objectif, passage et notes ;
  - ressources texte, liens et partition PDF ;
  - dernier bilan ;
  - prises.

### Séance (morceau au centre)
- La préparation tient compte de l’instrument, du niveau, de 2 objectifs au plus, du temps, du passage, du support (partition, tablature, accords, enregistrement de référence, à l’oreille) et d’une difficulté facultative. Elle affiche un aperçu des étapes.
- Le support par défaut est celui réellement importé, sinon « À l’oreille, sans support ».
- Chaque étape a une consigne, une méthode, une durée, un critère de réussite observable et un « pourquoi ». La somme des durées est égale au temps disponible.
- Le moteur de règles couvre 5 familles d’instruments (clavier, guitare/basse, voix, batterie, autre) et 5 axes (rythme, justesse, tempo, mémoire, fluidité). Le tempo de départ dépend du niveau.
- Pendant le travail :
  - enregistrement toujours accessible ;
  - métronome Web Audio local ;
  - minuteur d’étape ;
  - ressources et notes ;
  - auto-évaluation « Oui, réussi » / « Pas encore » ;
  - navigation libre entre les étapes, fin anticipée possible.

### Audio
- Plusieurs prises par morceau ou passage, numérotées et rattachées à l’étape.
- Lecteur explicite : Lecture, Pause, curseur, durée, Supprimer avec confirmation. Une seule prise joue à la fois.
- Prises conservées sur l’appareil (IndexedDB), réécoutables depuis le Suivi après rechargement et après fermeture du navigateur (vérifié physiquement sur Chrome Mac et sur iPhone dans le navigateur intégré à ChatGPT).
- Micro refusé : message, marche à suivre et bouton « Réessayer ». Erreur d’enregistrement avec « Réessayer ».
- Si l’on quitte l’écran pendant un enregistrement, la prise est sauvegardée automatiquement.

### Bilan
- Quatre rubriques : ce qui fonctionne, ce qui mérite d’être travaillé, exercice correctif (5 min, avec critère), prochaine tentative.
- Sources affichées : observation, auto-évaluation, règle ARIA, données de la prise. Encart « Analyse automatique : aucune ».
- Comparaison A/B de deux prises, avec une note de comparaison.
- Le conseil suit l’objectif. Sans prise, il propose une première prise de référence ; avec une prise, il invite à comparer.

### Suivi
- Séances terminées et brouillons distincts. Un brouillon repris puis terminé ne compte qu’une fois.
- Prises groupées par morceau.

### Design System
- Tokens : identité crème / espresso / or, palette fonctionnelle (vert, jaune, rouge erreur, rouge enregistrement), Manrope, espacements, rayons, ombres, cibles tactiles de 44 px.
- Composants `ds-*` et jeu d’icônes, documentés dans `docs/DESIGN_SYSTEM.md`.
- Contraste au niveau WCAG AA pour les textes.
- Variante marine `#152642` disponible en aperçu seulement. Elle reste expérimentale ; l’identité crème / espresso / or est conservée par défaut.

### Médias
- Aucun média de provenance non établie n’est utilisé. Le fond d’accueil, les cartes, les vignettes et les icônes d’instruments sont créés pour ARIA (CSS, SVG). Les 4 fichiers audio inutilisés sont retirés.

## 2. Anomalies restantes

Aucune anomalie ouverte n’est connue à la date de clôture. Les 5 anomalies relevées en recette (NR1 à NR5) sont corrigées et couvertes par des tests (voir `docs/recettes/sprint04.md`).

Points d’attention, non qualifiés comme anomalies faute de test :
- **Safari iPhone ouvert directement** et **Android** : non testés.
- **Données d’avant les correctifs** : dans un navigateur qui a déjà servi aux recettes, les doublons de brouillons et les anciens libellés de passage sont masqués à l’affichage, mais restent dans le stockage local.

## 3. Limites connues (par conception ou hors périmètre V0.4)

- **Aucune analyse audio automatique.** Les recommandations viennent de règles et des observations de l’utilisateur.
- **Stockage local à l’appareil.** Les prises ne sont pas synchronisées et sont perdues si l’on efface les données du navigateur. Sur Safari, l’effacement est automatique après 7 jours sans visite (ITP).
- **Règles pédagogiques générales** pour l’instrument « Autre », ce qui est signalé dans l’application.
- **Le métronome est capté dans les enregistrements** quand le haut-parleur est utilisé.
- **Médias** : les éléments de provenance non établie sont retirés de V0.4. Restent publiés, non utilisés et hors arbitrage : 2 fichiers SVG « Ode to Joy » et une note texte, de provenance non établie (retrait recommandé, voir `docs/LICENCES.md`). La production actuelle (Sprint 02) sert encore les anciens médias tant que V0.4 n’y est pas publiée.
- **Visuels neutres** : les photos sont remplacées par des fonds abstraits et des icônes. La structure des écrans est conservée, sans nouvel arbitrage graphique.
- **Variante marine non validée** : elle n’est pas appliquée par défaut.
- **Déploiement par le connecteur Netlify** : il n’existe pas de mode brouillon. La prévisualisation repose sur le verrouillage de la production. Le site n’est relié à aucun dépôt GitHub, donc il n’y a pas de prévisualisation automatique par branche.
- **Pas de fusion dans `main`** : le Sprint 04 vit sur sa branche, en attente de validation.
- **Bundle JS d’environ 530 kB** (avertissement Vite) : il inclut l’ancien prototype et Supabase. Pas d’optimisation au Sprint 04.

## 4. Tests

| Type | Résultat |
| --- | --- |
| Unitaires (Vitest) | 23/23 |
| Parcours de bout en bout (Playwright, Chromium, 390×844, micro simulé) | 68/68 en local et sur la prévisualisation définitive |
| Physique · Chrome Mac · micro réel (recette) | Réussi |
| Physique · iPhone, navigateur intégré à ChatGPT · micro réel (recette) | Réussi |
| Physique · Safari iPhone ouvert directement | Non testé (reporté à dimanche ou lundi) |
| Physique · Android | Non testé (reporté à dimanche ou lundi) |

## 5. Suite prévue

1. Tests physiques complémentaires sur Safari iPhone ouvert directement et sur Android (dimanche ou lundi).
2. Validation finale indépendante.
3. Sur autorisation explicite : fusion du Sprint 04 dans `main`, puis publication de V0.4 sur le lien principal Netlify (déverrouillage de la production).
4. Décision sur les fichiers SVG « Ode to Joy » restants (retrait recommandé).

Aucun Sprint 05 ni aucune nouvelle fonctionnalité avant cette validation.
