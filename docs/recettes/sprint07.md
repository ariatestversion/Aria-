# Registre de recette — Sprint 07 · Intégration et consolidation

Branche `claude/sprint07-integration`. Référence de non-régression : Alpha V0.6 (`67aa241`), 37 unitaires et 136 contrôles e2e.
**Sprint non clôturé** : recette indépendante et décision du Head of Product requises.

## Lot B — prévisualisation 1 (25/11)

https://6b06c8dd206fa1088b916525--ariafirstversion.netlify.app · commit `397d6d5` · non publiée.

Résultats automatisés (Chromium, micro **simulé**) : unitaires **44/44**, e2e **168/168** (dont 31 contrôles nouveaux du lot B et les 136 contrôles V0.6 rejoués, adaptés au nouveau comportement sans affaiblir les assertions).

| Test Phase 5 | Partie automatisée (Chromium) | Résultat | Reste à faire (humain / appareil réel) |
| --- | --- | --- | --- |
| T03 Prise active | Toucher et clavier sur Suivi / Profil pendant la prise : message, maintien en séance, onglets `aria-disabled` reliés au message ; étape suivante indisponible avec texte ; pas de bilan anticipé ; navigation rétablie après l’arrêt ; mise en page sans masquage | Réussi | VoiceOver et toucher sur iPhone réel |
| T04 Protection des brouillons | Blackbird étape 2, 3 prises, minuteur et note ; Gymnopédie → arbitrage ; Reprendre ; échec de sauvegarde forcé (reste sur place, message) ; Garder et changer ; aucune prise héritée ; rechargement ; reprise depuis le Suivi : étape, temps restant, note, prises ; même morceau : séance mise de côté puis reprise | Réussi | Fermeture réelle de Safari et micro réel sur iPhone |
| T05 Prises | Deux prises même tempo comparables ; une à un autre tempo hors comparaison avec motif ; métadonnées « passage · tempo · durée » ; une lecture à la fois ; règles unitaires (même prise, passage différent, valeurs manquantes, séances différentes, illisible) | Réussi | Audio réel |
| T06 Arrêt, vide, illisible | Prise vide : rien sauvegardé, message, réessai ; média illisible : pas de faux succès, conservé et signalé ; micro refusé puis autorisé, interruption, arrière-plan (contrôles V0.6) | Réussi (simulé) | iPhone et Android réels |
| T10 Historique | Terminer remplace le brouillon ; nouvelle séance du même morceau sans prise héritée ; comptes isolés, PDF ouvrable (V0.6) | Réussi | — |
| T02 Pédagogie | Contrôle exhaustif de plus de 10 000 programmes (V0.6) inchangé | Réussi | — |
| T01, T07, T08, T09, T11 | Après le lot C | — | — |

Aucun test sur appareil physique n’a été réalisé.

## Lot C — prévisualisation 2 (25/11)

https://6b06e4629842048fae789a15--ariafirstversion.netlify.app (séance marine) · témoin clair : ajouter `?seance=clair` · commit `8a109c3` · non publiée.

Résultats automatisés : unitaires **44/44**, e2e **180/180** (Chromium, micro simulé).

| Test Phase 5 | Partie automatisée (Chromium) | Résultat | Reste à faire (humain / appareil réel) |
| --- | --- | --- | --- |
| T01 Profil vierge → bilan | Onboarding, bibliothèque, recherche, ajout, préparation, séance, bilan, états vides (contrôles V0.6 rejoués en DA A) | Réussi | iPhone : compréhension sans aide |
| T02 Pédagogie | Contrôle exhaustif de plus de 10 000 programmes ; scénario Blackbird (reprise même exercice, tempo, durée, sans doublon) | Réussi | — |
| T03 Prise active | Voir lot B ; mise en page et contraste pendant la prise | Réussi | VoiceOver iPhone |
| T04 Brouillons | Voir lot B | Réussi | Fermeture réelle de Safari, micro réel |
| T05 Prises | Voir lot B | Réussi | Audio réel |
| T06 Arrêt, vide, illisible | Voir lot B | Réussi (simulé) | iPhone et Android réels |
| T07 Action suivante | Étapes intermédiaires : « Étape suivante » principale, bilan anticipé secondaire ; dernière étape : « Faire le bilan » principale avec focus ; pendant la prise : indisponible avec texte | Réussi | Clavier physique, VoiceOver |
| T08 Marine vs clair | Séance marine par défaut, témoin clair `?seance=clair`, contrastes AA sur les deux, 390 et 320 px, cibles ≥ 48 px, mouvement réduit | Réussi (automatisé) | **Fondatrice, iPhone, instrument en main** : repérage tempo, consigne, critère, arrêt ; texte agrandi ; paysage ; barres Safari. Réserve blanc doux à consigner |
| T09 Métronome / minuteur | Minuteur sauvegardé et restauré ; métronome au tempo de l’étape ; arrêt à la sortie (comportement V0.6) | Partiel | **Audio réel** : accent, clic capté ou non, aucun clic résiduel |
| T10 Historique | Voir lot B | Réussi | — |
| T11 Non-régression | Les 136 contrôles V0.6 rejoués (sélecteurs adaptés aux nouveaux libellés, assertions maintenues) ; build ; contraste ; focus | Réussi | QA indépendante |

Aucun test sur appareil physique n’a été réalisé.

## Lot D — prévisualisation 3, pour la QA indépendante (25/11)

https://6b06e995ea0d5e04915ab8ef--ariafirstversion.netlify.app (séance marine) · témoin clair : `?seance=clair` · commit `a7d1690` · non publiée. **C’est la version à recetter.**

Résultats automatisés : unitaires **44/44**, e2e **229/229** (Chromium, micro simulé).

- Contrôles ajoutés (T08 / S7-10, partie automatisable) : paysage 844×390, tablette 768×1024, ordinateur 1280×800, texte agrandi 200 % ; accueil et séance marine ; mise en page, contraste, cibles, contenu coupé ou hors écran.
- Défauts trouvés et corrigés : libellé « Bibliothèque » débordant dans la barre de navigation ; barre d’outils de séance et accès rapides hors écran, et libellés de navigation superposés, avec le texte agrandi.
- Restent non automatisables : toucher, VoiceOver, barres de Safari, micro et audio réels, interruptions iOS, lecture instrument en main (voir les tableaux ci-dessus).

## Corrections finales — contre-recette QA de `a7d1690` et réserves Product Design (25/11)

https://6b06f9934ca1d2e7fb6e60b2--ariafirstversion.netlify.app (séance marine) · témoin clair : `?seance=clair` · commit `d5e4a7a` · non publiée. Une contre-recette ciblée est attendue avant la décision du Head of Product.

Résultats automatisés : unitaires **44/44**, e2e **240/240** (Chromium, micro simulé).

| Point | Correction | Contrôle automatisé | Reste à vérifier (humain / appareil) |
| --- | --- | --- | --- |
| QA-01 · Focus du bilan | Focus sur le titre « Bilan de séance : <morceau> » à chaque ouverture du bilan | Entrée sur « Faire le bilan maintenant » et sur « Faire le bilan » (étape 4) : élément actif = titre ; première tabulation = contrôle du bilan ; reprise depuis l’accueil : titre | Annonce VoiceOver sur iPhone ; clavier physique |
| QA-02 · Tempo affiché | En-tête = tempo du métronome ouvert ; « Conseillé : N BPM » si différent ; retour au tempo conseillé à la fermeture | Accélérer de 4 BPM et démarrer : en-tête et panneau identiques, tempo conseillé distingué ; fermeture : un seul tempo | Clic audible au tempo affiché ; tempo de la prise avec micro réel |
| PD · « Reprendre mon bilan » | La destination suit le libellé (accueil, Suivi) ; programme relu depuis le stockage | Accueil → bilan (pas la séance) ; Suivi « Brouillon de bilan » → bilan | QA-03 : rejouer sur iPhone après fermeture de Safari, avec et sans prise |
| PD · « Faire le bilan » à la dernière étape | Actions placées avant les outils | Ordre vérifié ; premier écran sur ordinateur 1348×936 | Repérage sur iPhone, téléphone posé, instrument en main |

Aucun test sur appareil physique n’a été réalisé.

## Clôture technique sous réserves (Product Management, 25/11/2026)

Référence : commit `d5e4a7a`, prévisualisation 4 (`6b06f9934ca1d2e7fb6e60b2`), conservée et non publiée.

- **Contre-recette QA (Chrome cloud)** : QA-01 et QA-02 corrigés ; QA-03 non reproduit. Il s’agit d’un GO ciblé, pas d’une validation QA complète.
- **Product Design** : GO sous réserve du test sur iPhone.
- **Ingénierie** : contrôles automatisés 44/44 et 240/240 (Chromium, micro simulé) sur `d5e4a7a`. Aucun test sur Safari ou WebKit, ni sur appareil physique, n’a été réalisé par l’Ingénierie sur ce sprint.

| Réserve Sprint 09 | Responsable | Points de ce registre concernés |
| --- | --- | --- |
| R09-01 | QA | T03 à T06 : micro réel, refus et interruption, comparaison et isolation des prises, réécoute et persistance après fermeture de Safari |
| R09-02 | QA / PD | T07, T08, QA-01 (VoiceOver), reprise du bilan depuis l’Accueil, visibilité de « Faire le bilan », texte agrandi, séance marine instrument en main |
| R09-03 | QA | T09, QA-02 : cadence, accent, arrêt du clic, métadonnées de tempo d’une prise |
| R09-04 | QA | Android, cas d’erreur non couverts, parcours physiques résiduels T01 à T11 |

Constat technique à vérifier dans R09-02 :
- le style utilise `color-mix()` (iOS 16.2 et plus) et `100dvh` (iOS 15.4 et plus), sans solution de repli ;
- sur un iPhone antérieur à iOS 16.2, la barre de navigation et le fond de l’écran d’accueil pourraient mal s’afficher ;
- noter la version d’iOS de chaque appareil testé.
