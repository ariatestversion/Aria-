# Changelog — ARIA

## [Sprint 09] — Validation finale de l’expérience et stabilisation du MVP (en cours, 2026-11-26)

Branche : `claude/sprint09-validation`, depuis `claude/sprint08-identite` (application identique à `975e9ea`, référence du Sprint 08). Nuit & cuivre conservée.
- **S08-ENG-01 corrigé** : un nouveau morceau reprend l’instrument du profil, y compris après un rechargement de la page.
- **S08-QA-01 corrigé** : sans prénom, l’avatar de l’Accueil affiche une icône neutre au lieu de « A ».
- **S08-QA-02 (outillage)** : la recette attend l’affichage de la Bienvenue avant d’en lire les styles.
- **S08-QA-REG-01** : toujours ouverte (non reproduite, en attente de preuve).
- Audit du parcours et des programmes, constats S09-D-01 à D-05 à arbitrer : `docs/recettes/sprint09.md`.
- Tests : unitaires 44/44 ; e2e **300/300** (3 contrôles dédiés ajoutés).

### Investigation finale — divergence « pointeur » sur REG-01 (27/11)
- Cause : sans défilement, « Reprendre la séance » peut n’être que partiellement visible au-dessus de la barre de navigation fixe (14 px à 1920 × 1080). Un clic placé juste sous la partie visible tombe sur la barre, et le bilan reste affiché.
- Comportement identique sur `d5e4a7a`, `cf3d2c9` et `aa83a42` : ce n’est pas une anomalie applicative et ce n’est pas une régression. Pas de candidate n° 4 ; la candidate n° 3 reste la référence de clôture.
- Observation O-S09-3, non bloquante, pour le Product Design après le MVP.
- Ajouts : script `docs/sprint09/diag-REG-01-pointeur.cjs` et protocole définitif des tests physiques (`docs/recettes/sprint09.md`). Aucune modification applicative.

### Candidate n° 3 — correctif REG-01 (GO PM du 27/11)
- **S08-QA-REG-01 corrigé** :
  - cause : une touche Entrée répétée (maintenue, ou deux appuis rapprochés) sur « Reprendre la séance » ou « Étape suivante » activait aussitôt « Faire le bilan », qui reçoit le focus automatiquement à la dernière étape ; le bilan se rouvrait ;
  - correctif : sur « Faire le bilan » seulement, un appui répété et le second clic d’un double clic sont ignorés ; le focus automatique (S7-04 / T07) et celui du bilan (QA-01) sont conservés.
- Tests dédiés : 8 contrôles. Les deux scénarios échouent sans le correctif (vérifié) et passent avec.
- Tests : unitaires 47/47 ; e2e **315/315**.

### Candidate n° 2 (GO PM du 26/11, après la contre-recette Claude QA de la candidate n° 1 : 9/10)
- **S09-QA-01 corrigé** : après une modification des instruments dans le Profil, l’ajout d’un morceau propose aussitôt le premier instrument du profil, sans rechargement.
- **S09-D-01 confirmé et corrigé** :
  - constat : une prise de séance enregistrée sans passage saisi recevait un passage vide, et la comparaison A/B, qui exige un passage identifié, n’était jamais proposée ;
  - correction : sans passage saisi, une prise de séance porte « Morceau entier » ; deux prises d’une même séance au même tempo deviennent comparables ;
  - le champ reste facultatif, aucun champ obligatoire n’est ajouté ;
  - les anciennes prises sans passage restent non comparables et les prises hors séance ne changent pas ;
  - choix retenu par le PM, sous réserve de l’arbitrage du Head of Product et du Product Design (une constante `DEFAULT_PASSAGE`).
- S09-D-02 à D-05 : inchangés, en attente des tests physiques et des arbitrages.
- REG-01 : ouverte.
- Tests : unitaires **47/47** (3 ajoutés) ; e2e **307/307** (7 contrôles ajoutés).

## [Sprint 08] — Identité visuelle Nuit & cuivre (clôture technique sous réserves, 2026-11-26)

**Statut : clôture technique sous réserves, effective (Head of Product, puis autorisation de la fondatrice, 26/11/2026).**
- Référence figée : `975e9ea`, prévisualisation 3 (application identique à `cf3d2c9`).
- Inscrits au Sprint 09 : S08-QA-REG-01, « non reproduit, en attente de preuve », dont le contrôle Safari / iPhone est ajouté à R09-02 ; les corrections S08-ENG-01 et S08-QA-01.
- Réserves R09-01 à R09-04 maintenues.
- Aucune fusion, aucune publication.

### Contre-recette : test S08-QA-REG-01 et prévisualisation 3
- Régression signalée (« Reprendre la séance » laisserait le bilan affiché) non reproduite sur `cf3d2c9` ni sur `d5e4a7a`.
- Test automatisé dédié ajouté (14 contrôles, 390 × 844 et 1348 × 936). Recette : 44/44 et **297/297**.
- Prévisualisation 3 (`975e9ea`) : application inchangée, pour la contre-recette.

### Intégration Nuit & cuivre (GO fondatrice, dossier de transmission PM du 26/11)
- **Palette Nuit & cuivre par défaut** (`data-brand='nuit'`) :
  - marine `#101D35` pour la Bienvenue et la Séance ;
  - blanc doux `#F7F8FA` comme fond de référence, surfaces blanches, encre `#1B1F2A` ;
  - bleu ciel pour les sélections ; rouge réservé à la prise active.
- **Cuivre `#D9662B` décoratif seulement** : filets sous le logotype et sous le titre de l’Accueil, vagues du visuel de reprise, lumière latérale de la Bienvenue. Jamais en texte, en contrôle ni en séance.
- **Logotype « Sonique »** (nom de travail provisoire), en Fraunces 650 et casse titre, sur la Bienvenue et l’Accueil.
  - Le nom vient de `BRAND_NAME` : titre de l’onglet, bilan (« Conseil pédagogique Sonique »), onboarding, écran d’erreur.
  - Manrope reste la police de l’interface ; Fraunces est désormais chargée en graisse variable 500 à 700.
- **Accueil** : papier chaud `#F5F1EA` en variante de comparaison (`?accueil=papier`), le blanc doux restant le fond par défaut.
- **Bienvenue** : couleur de fond marine de repli, pour garder le texte lisible même sans prise en charge du dégradé (iOS < 16.2).
- **Exploration close** : les palettes candidates cuivre et bleu sont retirées. La DA A reste consultable avec `?theme=blanc`.
- **Photographies** : aucune intégrée, faute de statut autorisé ; replis marine et pictogrammes (`docs/LICENCES.md`).
- **Aucune modification fonctionnelle.** Anomalie préexistante S08-ENG-01, consignée sans correction : l’instrument par défaut d’un nouveau morceau n’est pas restauré après un rechargement.
- **Tests** :
  - unitaires 44/44 ;
  - e2e **283/283** en Nuit & cuivre, dont 39 contrôles Sprint 08 (règles du cuivre, logotype, nom, variante papier) ;
  - e2e **263/263** en DA A.
- Recette, correspondance avec les contrôles QA (V, A, R) et écarts : `docs/recettes/sprint08.md`. Captures : `docs/screenshots/sprint08/`.

### Préparation technique (prévisualisation 1, `beae6f9`)

Branche : `claude/sprint08-identite`, depuis `1276a2a`, dont le code applicatif est identique à la référence `d5e4a7a` du Sprint 07.
- **Couleurs centralisées** : séance immersive (`--imm-*`), écran de bienvenue, barre de navigation et états fonctionnels passent désormais par des jetons. Il ne reste plus aucune couleur en dur dans les écrans.
- **Famille de palettes DA A** (`data-layout='a'`) : une palette se limite à un bloc de couleurs, et la mise en page comme les composants sont partagés.
- Deux palettes candidates provisoires (cuivre, bleu), proposées pour comparaison avec la DA A, retirées depuis.
- **Nom de marque centralisé** (`src/v0/brand.ts`). Le nom affiché reste « ARIA » et le slogan est inchangé.
- **Emplacement photographique** `--welcome-photo` prêt, sans image (droits à documenter).
- **Recette par palette** : `THEME=cuivre|bleu node scripts/e2e-sprint04.mjs`.
- Acquis du Sprint 07 inchangés : la palette par défaut reste la DA A, et ses captures sont identiques à celles du Sprint 07, aux dates près.
- Tests : unitaires 44/44 ; e2e **244/244** dans chacune des palettes DA A, cuivre et bleu.
- Faisabilité, estimations et blocages : `docs/sprint08/FAISABILITE.md`. Préparation du Sprint 09 : `docs/recettes/sprint09.md`. Comparaisons de l’exploration : `docs/screenshots/sprint08/exploration/`.

## [Sprint 07] — Intégration et consolidation (clôture technique sous réserves, 2026-11-25)

Branche : `claude/sprint07-integration`, depuis `main` (`f0a61a0`, Alpha V0.6, code audité `67aa241`).
Références : dossier Phase 5 (S7-01 à S7-10, T01 à T11), maquette 4.2, Design System Phase 3 et addendum 4.2 (dossier Drive « Sprint 07 »).
**Statut : clôture technique sous réserves (Product Management, 25/11/2026).** Référence applicative : `d5e4a7a` (`d5e4a7a8eed38e28ce9d4e3722136239d0e82da7`). Prévisualisation de référence : prévisualisation 4 (`6b06f9934ca1d2e7fb6e60b2`), conservée et non publiée. Développements gelés.
- Contre-recette QA sur Chrome : QA-01 et QA-02 corrigés ; QA-03 non reproduit. Avis Product Design : GO sous réserve du test sur iPhone.
- Réserves transférées au Sprint 09 (registre des sprints) :
  - R09-01 : audio réel, prises, réécoute, persistance après fermeture de Safari ;
  - R09-02 : VoiceOver, focus, ergonomie de la séance marine, texte agrandi, reprise du bilan, visibilité du bilan final ;
  - R09-03 : cadence et arrêt du métronome, métadonnées de tempo ;
  - R09-04 : Android, cas d’erreur et parcours physiques résiduels T01–T11.
- Branche non fusionnée dans `main` : les modalités de fusion sont décrites dans `docs/SOURCE.md`. La clôture technique ne vaut ni validation QA complète ni autorisation de publication.

### Lot B — intégrité fonctionnelle (prévisualisation 1)
- **S7-05 · Navigation pendant la prise** : pendant un enregistrement, les onglets, le retour, le changement d’étape et le bilan sont **indisponibles**, avec le message « Navigation indisponible. Arrête la prise pour changer d’écran. » relié aux commandes (`aria-disabled`, `aria-describedby`). Le bilan anticipé est masqué pendant la prise. Tout redevient disponible dès l’arrêt. La sauvegarde automatique en arrière-plan est conservée.
- **S7-06 · Protection des brouillons** :
  - avant de changer de morceau, ou de recommencer le même, un écran présente la séance active (morceau, étape, nombre de prises) : « Reprendre » ou « Garder le brouillon et … » ;
  - le brouillon est sauvegardé **avant** le changement ; si la sauvegarde échoue, rien ne change et un message propose de réessayer ;
  - le **temps restant du minuteur** est sauvegardé et restauré, avec l’étape, la note et les prises ;
  - une nouvelle séance sur le même morceau **met de côté** la séance en cours, qui reste reprenable depuis le Suivi.
- **S7-07 · Prises** :
  - chaque prise enregistre sa **séance** et son **tempo** (métronome en marche, sinon tempo de la consigne, sinon « inconnu ») ;
  - métadonnées affichées « passage · tempo · durée » dans cet ordre ;
  - la comparaison n’est proposée que pour des prises distinctes, lisibles, de la même séance, du même passage identifié et du même tempo connu ; sinon écoute séparée avec le motif ; les anciennes prises ne sont jamais déclarées comparables ;
  - zéro prise : prise de référence proposée ; une prise : réécoute ; les prises des séances précédentes sont en écoute seule ;
  - **prise vide** : rien n’est annoncé ni sauvegardé ; **prise illisible** : conservée et signalée, jamais comparée ; la lisibilité est vérifiée par décodage, sans durée minimale arbitraire (le seuil de 100 octets est supprimé).
- **S7-08 · Bilan** : repères « Ta propre observation », « Conseil pédagogique ARIA », « Analyse automatique de la prise : aucune ». Bilan anticipé sans aucun travail évalué : pas de bilan ni de « Terminer », mais « Reprendre la séance » ou « Garder en brouillon ».
- **S7-09 · Suivi et Profil** : brouillons distingués (« Brouillon de pratique » avec étape et prises, « Brouillon de bilan », « Brouillon mis de côté »), tous reprenables ; avertissement de stockage local dans le Profil.
- Une séance est « en cours » tant qu’aucune séance terminée ne porte son identifiant (comparaison par date conservée pour les séances antérieures au Sprint 05).

### Lot C — intégration Product Design et DA A (prévisualisation 2)
- **S7-01 · DA A Blanc & marine** appliquée par défaut :
  - jetons du Design System Phase 3 et de l’addendum 4.2 (blanc doux `#F7F8FA`, surfaces `#FFFFFF`, marine `#101D35`, bleu ciel `#A8C9EB`, encre `#202124`, texte secondaire `#4F5560`, filet `#CBD1D9`, rouge `#C62828` réservé à la prise active) ;
  - Manrope en police variable (titres et actions 800, repères 650, texte 500).
  - La DA 4 et les autres thèmes restent consultables par `?theme=` pour comparaison.
- **Séance immersive marine** par défaut sur l’écran Séance ; fond clair conservé comme **témoin QA** avec `?seance=clair`, sans sélecteur utilisateur. Réserve ergonomique iPhone et réserve « blanc doux » maintenues.
- **S7-02 · Accueil** : slogan « Just Play Something. » ; une action principale selon l’état réel (« Reprendre ma séance », « Reprendre mon bilan », nouvelle séance après une séance terminée, ou choisir un morceau) ; « Choisir un morceau » en secondaire.
- **S7-03 · Préparation** : passage, objectif, durée et plan d’abord, avec « Commencer la séance » ; puis « Réglages de la séance » (instrument, niveau, support, difficulté), tous conservés.
- **S7-04 · Séance** :
  - un seul bloc : morceau · passage, étape, tempo (accès direct au métronome), objectif, minuteur, segments, « À travailler », consigne, « Repère de réussite » ;
  - « Comment jouer ce passage » repliable (comment et pourquoi) ;
  - une action principale : « Étape suivante », puis « Faire le bilan » à la dernière étape, qui reçoit le focus ; « Faire le bilan maintenant » en secondaire, absent pendant la prise ; « Étape précédente » discrète.
- **S7-10 · Accessibilité** :
  - actions principales de 52 px (≥ 48 px) et commandes secondaires de 48 px ;
  - entrée d’écran en 180 ms, supprimée en mouvement réduit ;
  - contrastes vérifiés automatiquement. Deux défauts trouvés et corrigés : pastille d’étape invisible sur marine, statut d’enregistrement rouge sur marine à 2,99:1, passé en blanc.
- **Photographies** : non intégrées (prévisualisation publique par lien) ; visuels provisoires autorisés.

### Tests
- Unitaires : **44/44** (7 nouveaux : comparabilité, métadonnées, séparation des prises).
- e2e (Chromium, micro simulé) : **180/180** :
  - 31 contrôles du lot B, 12 du lot C ;
  - audit de contraste WCAG du texte affiché sur 6 écrans ;
  - prises vides et illisibles simulées par un enregistreur de test.
- Aucun test sur appareil physique.

### Lot D — recette automatisée et corrections (prévisualisation 3, pour la QA indépendante)
- **Parties automatisables de T01 à T11** : exécutées (voir `docs/recettes/sprint07.md`).
- **Contrôles responsive ajoutés** : paysage 844×390, tablette 768×1024, ordinateur 1280×800, texte agrandi à 200 %, pour l’accueil et la séance marine (mise en page, contraste, cibles).
- **Audit de mise en page renforcé** : il détecte désormais le contenu coupé ou hors écran, que le masquage du défilement horizontal cachait.
- **Défauts trouvés et corrigés** :
  - le libellé « Bibliothèque » débordait de sa case dans la barre de navigation (taille normale) ;
  - avec le texte agrandi, la barre d’outils de la séance (Ressources, Notes) et les accès rapides de l’accueil sortaient de l’écran, et les libellés de la barre de navigation se chevauchaient ;
  - les grilles passent désormais à la ligne, et les libellés de navigation sont abrégés proprement.
- Tests : unitaires 44/44 ; e2e **229/229**.

### Corrections finales — contre-recette QA et réserves Product Design sur `a7d1690` (prévisualisation 4)
- **QA-01 · Focus à l’ouverture du bilan** : sur tous les chemins (« Faire le bilan maintenant », « Faire le bilan » à la dernière étape, reprise depuis l’accueil ou le Suivi), le focus arrive sur le titre du bilan, nommé « Bilan de séance : <morceau> ». La tabulation suivante atteint le premier contrôle du bilan. L’anneau de focus n’apparaît qu’à la navigation au clavier. Le focus sur « Faire le bilan » à l’arrivée à la dernière étape est conservé.
- **QA-02 · Tempo affiché** : quand le métronome est ouvert, l’en-tête « Métronome · N BPM » affiche le tempo du métronome, c’est-à-dire celui qui sonne ou qui sonnera. Si ce tempo diffère de la consigne, un repère distinct « Conseillé : N BPM » apparaît. Une fois le métronome fermé, l’en-tête revient au tempo conseillé. La métadonnée de tempo d’une prise suit déjà le métronome en marche (lot B). Le panneau signale aussi son dernier tempo à la fermeture.
- **Réserve PD · « Reprendre mon bilan »** : la destination suit désormais le libellé cliqué (accueil et Suivi) : « Reprendre mon bilan » et « Brouillon de bilan » ouvrent toujours le bilan. L’écart n’a pas été reproduit sur données isolées (accueil, minuteur en marche, détour par l’enregistrement direct, rechargement). Par précaution, les modifications d’étape et la sauvegarde d’une prise repartent de la version enregistrée du morceau, au lieu d’une copie d’écran qui pouvait être en retard.
- **Réserve PD · « Faire le bilan » à la dernière étape** : les actions de la séance (« Étape suivante » / « Faire le bilan ») passent juste après l’auto-évaluation, **avant** la barre d’outils et ses panneaux. Sur ordinateur (1348×936), « Faire le bilan » est dans le premier écran. Sur 390×844, il faut un court défilement après la prise et l’auto-évaluation. À vérifier sur iPhone.
- Règle inchangée : une étape sans tempo n’affiche pas de repère de métronome dans l’en-tête. Le métronome reste accessible par la barre d’outils.
- Tests : unitaires 44/44 ; e2e **240/240** (11 contrôles ajoutés : QA-01 sur trois chemins et la première tabulation, QA-02, destination de la reprise depuis l’accueil et le Suivi, ordre des actions).

### Photographies
- Non intégrées aux prévisualisations (accessibles à toute personne disposant du lien), conformément à l’arbitrage du 25/11 : visuels provisoires autorisés de l’application.

## [ARIA — Alpha V0.6 · Sprint 06] — Finalisation fonctionnelle & préparation V1 (2026-11-24)

**Clôture technique (2026-11-24)** :
- retours QA favorables de Claude et de Work sur la version auditée `67aa241` ;
- unitaires 37/37, e2e 136/136 ;
- fusion dans `main` (merge `--no-ff`, historique conservé) ; tag proposé `v0.6.0-alpha` (à créer depuis GitHub) ;
- prévisualisation définitive conservée : https://6b05c4864a41ea883858ac80--ariafirstversion.netlify.app ;
- lien public inchangé (Sprint 02, verrouillé) ;
- réserves documentées dans `docs/BILAN_SPRINT06.md` : stockage local, comptes, absence de synchronisation, tests sur appareils physiques non réalisés ;
- base de travail des Product Designers et de la direction artistique. Pas de Sprint 07 sans autorisation.

Branche : `claude/sprint06-finalisation-v1`, créée depuis `main` (`04777e0`, Alpha V0.5). Historique conservé.  
Netlify : **prévisualisation uniquement** ; le lien public principal reste sur le Sprint 02.  
**Statut : clôturé techniquement le 24/11** (voir ci-dessus). Aucune nouvelle fonctionnalité majeure, aucune refonte, DA 4 conservée.

### Pédagogie
- **Écart de durée corrigé (S06-1)** : la reprise annoncée « pendant 5 min » dans le bilan dure bien 5 min dans la séance suivante. Le reste du temps est réparti entre les autres étapes, et le total reste exact.
- **Batterie** : les objectifs « Justesse » et « Fluidité » ne parlent plus de « notes ». Nouvelles étapes : « Mise au point des frappes » et « Frappes fragiles isolées » ; « frappes » remplace « notes » dans les étapes communes.
- **Contrôle exhaustif** : plus de 10 000 programmes générés (6 instruments × 3 niveaux × objectifs principal et secondaire × 5 durées × 5 supports, avec et sans reprise). Aucun total faux, aucune étape de moins de 2 min, aucun doublon, aucun champ vide, aucun vocabulaire d’un autre instrument, et la reprise a toujours la durée et le tempo annoncés.

### Comptes et données
- **Corrigé** : après une déconnexion, l’onboarding du compte suivant repartait des choix du compte précédent (instruments, objectifs, niveau). Le second compte pouvait ainsi recevoir un programme de batterie au lieu de voix. Les préférences et les saisies en cours sont maintenant remises à zéro à la déconnexion et à la connexion.
- **Inscription en mode local** : le texte n’annonce plus d’e-mail de confirmation, puisqu’aucun n’est envoyé.
- Vérifié de bout en bout :
  - inscription locale ;
  - refus d’un mauvais mot de passe ;
  - reconnexion ;
  - isolation des morceaux et des prises entre deux comptes du même appareil ;
  - réécoute d’une prise après déconnexion et reconnexion.

### Morceaux personnels et ressources
- **Partition PDF importée** : elle peut maintenant être ouverte depuis la fiche du morceau et pendant la séance (bouton « Ouvrir »). Avant, elle était seulement listée.
- **Liens** audio et vidéo cliquables.
- **Libellés de ressources corrigés** : « Référence vidéo » au lieu du libellé brut `video`, ainsi que « Référence audio » et « Note ».

### Prises
- Comparaison A/B : une prise ne peut plus être comparée à elle-même.

### Droits des médias
- **Retrait** des 3 fichiers « Ode to Joy » (`public/presets/`), de provenance non établie et jamais utilisés. Plus aucun média de provenance non établie n’est publié par l’application (voir `docs/LICENCES.md`).

### Tests
- Unitaires : **37/37**, dont le contrôle exhaustif et les cas propres à la batterie.
- e2e (Chromium, micro simulé) : **136/136**, dont 18 contrôles Sprint 06 (comptes, isolation, batterie, voix, morceau personnel, PDF, durée de la reprise).
- **Aucun test sur appareil physique.**

## [ARIA — Alpha V0.5 · Sprint 05] — Expérience de pratique & préparation Alpha (2026-11-24)

**Clôture technique (2026-11-24)** :
- retours favorables de Work et de Claude QA sur la version corrigée `d79b2d2` ;
- unitaires 35/35, e2e 115/115 ;
- fusion dans `main` (merge `--no-ff`, historique conservé) ; tag proposé `v0.5.0-alpha` (à créer depuis GitHub) ;
- prévisualisation définitive conservée : https://6b05bcb61ae60f91656e77ef--ariafirstversion.netlify.app ;
- production inchangée (Sprint 02, verrouillée) ;
- réserves : tests sur appareils physiques à faire ; écart mineur de durée de la reprise reporté au Sprint 06 (`docs/BACKLOG.md`, S06-1).

Branche : `claude/sprint05-pratique`, créée depuis `main` (`6b1652a`, V0.4) avec fusion de `claude/da-preview` (DA 4). Historique conservé.  
Netlify : **prévisualisation uniquement**. La production reste verrouillée sur le Sprint 02.  
**Statut : clôturé techniquement le 24/11** (voir ci-dessus).

### Correctifs de recette QA (24/11, audits Work et Claude)

- **P0 · Cohérence pédagogique** (scénario Work : Blackbird, guitare, 15 min, rythme, intro, sans partition ; « Main droite seule, cordes étouffées » marquée « Pas encore », séance terminée sans prise).
  - Avant : le bilan disait « reprends « Main droite seule… » », mais l’exercice correctif affiché et la reprise de la séance suivante étaient « Motif rythmique sur un seul accord », qui figurait alors **deux fois** dans la séance.
  - Maintenant, une règle unique, calculée au bilan et enregistrée avec la séance terminée, est reprise telle quelle :
    1. une étape jugée « Pas encore » → cette même étape, 8 BPM plus lentement si elle a un tempo ;
    2. sinon, un point noté « à travailler » → l’exercice de l’axe correspondant, 8 BPM sous le tempo de travail ;
    3. sinon, pas d’exercice correctif (le bilan le dit).
  - Le bilan affiche exactement cet exercice (titre, consigne, critère, tempo) et annonce sa place dans la séance suivante (« ARIA commence par… » ou « après l’échauffement… »).
  - La séance suivante ne contient jamais deux fois le même exercice : s’il y figure déjà, il est remplacé par sa reprise.
  - Une séance peut être terminée sans prise si au moins une étape a été auto-évaluée.
- **P0 · Reprise du bilan** : recharger la page pendant le bilan ramène directement au bilan, observations conservées (et non à l’étape 1). Depuis l’accueil ou la fiche du morceau, le bouton devient « Reprendre mon bilan » / « Reprendre le bilan ». Recharger pendant la séance ramène à la séance.
- **P1 · Navigation** : l’onglet actif découle de l’écran affiché, plus du chemin suivi. Fiche morceau, préparation, séance, enregistrement et bilan → Bibliothèque ; Accueil, Suivi, Profil → leur onglet.
- Tests : unitaires 35/35 (5 nouveaux sur le scénario Work) ; e2e 115/115 (21 nouveaux contrôles de non-régression QA).

### Continuité entre séances
- La préparation rappelle **la dernière séance terminée** du morceau : date, objectif, tempo, ce que tu avais noté à travailler, les étapes que tu avais jugées à reprendre ou réussies.
- Si l’objectif principal ne change pas, la nouvelle séance **part de la précédente** (règles explicites, appliquées à tes observations) :
  - une étape **« Reprise · … »** juste après l’échauffement, qui cite ta note et reprend l’exercice correctif ;
  - pour le rythme et le tempo, le tempo de départ suit la règle du bilan : **−8 BPM** si une étape était à reprendre, **+4 BPM** si les étapes évaluées étaient réussies, sinon le même tempo ;
  - une note explique ce qui change et pourquoi.
- Option **« Construire la séance à partir de la dernière »**, cochée par défaut, désactivable.
- Nouvel objectif principal : la séance repart des réglages de base, avec une note qui le dit.
- Bilan : rappel de ce que tu voulais travailler la fois précédente, pour réécouter et comparer.
- Le conseil « Prochaine séance » du bilan correspond désormais exactement à ce que fera la séance suivante (plus de « monte le tempo » sans étape notée réussie).

### Consignes directement applicables
- Au-dessus de la consigne : le **passage travaillé** et un bouton **« Métronome · N BPM »** au tempo de l’étape.
- Le métronome se règle sur le tempo de chaque nouvelle étape (il gardait auparavant celui de la première étape ouverte).

### Enregistrement et conservation des prises
- **Interruption par l’appareil** (appel, micro coupé, autre application) : la partie captée est sauvegardée, avec un message explicite. L’interface ne reste plus bloquée sur « Enregistrement en cours ».
- **Application mise en arrière-plan** pendant une prise : la prise est arrêtée et sauvegardée immédiatement.
- **Écran maintenu allumé** pendant une prise (Wake Lock, si le navigateur le permet).
- **Erreur de stockage** (espace plein, navigation privée) : message explicite au lieu d’un échec silencieux.
- Après la première prise, ARIA demande au navigateur de **ne pas effacer les données** en cas de manque d’espace (`navigator.storage.persist()`), sans garantie selon le navigateur.
- **Bilan sauvegardé pendant la saisie** : les observations sont gardées en brouillon au fil de la frappe. Fermer l’application ne les perd plus.

### Direction artistique
- **DA 4 « Ivoire & marine » appliquée par défaut**, sans nouvelle exploration graphique.
- Le sélecteur de directions visuelles est retiré du Profil. Les autres thèmes restent consultables pour comparaison avec `?theme=marine|electrique|espresso`, sans être mémorisés.
- Nouveaux composants aux couleurs des tokens : case à cocher avec libellé (cible ≥ 44 px), repères de consigne.

### Tests
- Unitaires : **30/30** (7 nouveaux : continuité, tempo, cohérence bilan / séance suivante).
- e2e (Chromium, micro simulé, 390×844 et 320×640) : **94/94**, dont 28 contrôles ajoutés ou réécrits au Sprint 05 (les contrôles du sélecteur de thèmes sont remplacés).
- **Aucun test sur appareil physique** pour cette version.

### Non traité (voir `docs/BACKLOG.md`)
- Les recommandations détaillées de la QA Work n’ont pas été transmises : aucune correction ne leur est attribuée.

## [ARIA — MVP Alpha V0.4 · Sprint 04] — Expérience musicale & Design System (2026-11-20)

Branche : `claude/sprint04-experience-musicale` (depuis `main` = `23ea182`, source Cursor `104645c`)  
Dépôt de référence : `ariatestversion/Aria-`. Développement : Claude Code (reprise de Cursor).  
Netlify : projet existant `ariafirstversion`, **prévisualisation uniquement**.

**Clôture (2026-11-20)** :
- recette indépendante Work sur `91441b1` : trois anomalies retestées résolues, **apte à une alpha accompagnée** ;
- contrôles de clôture : `npm ci`, build, unitaires 23/23, e2e 68/68 ;
- fusion dans `main` (merge `5fead7f`), version figée ; tag **`v0.4.0-alpha`** (pre-release GitHub) sur `e3950e6` ;
- prévisualisation définitive : https://6b0078bb87479237251ba188--ariafirstversion.netlify.app ;
- production Netlify toujours verrouillée sur le Sprint 02 ;
- restent à faire : tests physiques Safari iPhone (ouvert directement) et Android, avant toute publication.

### Audio

- Nouveau lecteur de prise : boutons **Lecture / Pause / Supprimer** libellés, curseur de position, durée. Ce lecteur est utilisé partout : Séance, fiche morceau, Bilan, Suivi.
- Une seule prise joue à la fois.
- Si le fichier audio d’une prise a disparu de l’appareil, le lecteur affiche « Audio introuvable ».
- Suppression avec confirmation explicite.
- Plusieurs prises par morceau ou passage, numérotées dans l’ordre chronologique et rattachées à l’étape de séance.
- Le Suivi regroupe les prises par morceau. Elles se réécoutent après rechargement (IndexedDB).
- Micro refusé :
  - message explicite, avec la marche à suivre ;
  - bouton **Réessayer le micro** ;
  - le refus est aussi détecté via `SecurityError` et l’état de permission ;
  - les erreurs d’enregistrement ont leur propre bouton **Réessayer**.
- Quitter l’écran pendant un enregistrement arrête et sauvegarde la prise. Un badge REC reste visible dans la barre de navigation.
- Distinction terminée / brouillon conservée. Une séance ne compte désormais que ses propres prises, et non plus toutes les prises du morceau.

### Personnalisation et séances

- **Correctif** : les objectifs et la durée choisis à l’onboarding n’étaient pas rechargés après une connexion ou un retour en mode découverte. Ils sont maintenant présélectionnés à la préparation. L’objectif principal est le premier choisi.
- La préparation prend en compte :
  - l’instrument ;
  - le niveau ;
  - les objectifs (2 au maximum) ;
  - le temps disponible ;
  - le passage ;
  - le support (partition, tablature, grille d’accords, enregistrement de référence, ou à l’oreille sans support) ;
  - une difficulté facultative.
- Un aperçu des étapes et de leurs durées s’affiche avant de commencer.
- Chaque étape a une **consigne**, une manière de faire, une **durée** et un **critère de réussite observable**. La somme des durées est égale au temps disponible.
- Une étape supplémentaire est ajoutée pour l’objectif secondaire à partir de 30 min.
- Plus de choix imposé entre séance « guidée » et « libre » : on peut enregistrer à tout moment, passer ou revenir sur une étape, et terminer plus tôt.
- Métronome local en Web Audio (±4 BPM), minuteur d’étape, et accès aux ressources et notes pendant la séance.
- Une nouvelle séance repart à l’étape 1. Avant, elle héritait de l’index d’étape de la séance précédente.

### Pédagogie et bilan

- Nouveau moteur de règles (`src/v0/pedagogy.ts`) par famille d’instrument (clavier, guitare/basse, voix, batterie, autre) et par axe (rythme, justesse, tempo, mémoire, fluidité). Le tempo de départ dépend du niveau : 60 / 72 / 84 BPM.
- Scénario de référence (guitare, 15 min, rythme, sans partition) :

  | Durée | Étape |
  | --- | --- |
  | 3 min | Main droite seule, cordes étouffées |
  | 5 min | Motif rythmique sur un accord |
  | 4 min | Changer d’accord sans casser le rythme |
  | 3 min | Prise de contrôle |

- Le bilan s’organise en quatre rubriques :
  - **Ce qui fonctionne** ;
  - **Ce qui mérite d’être travaillé** ;
  - **Exercice correctif** (règle ARIA, 5 min, avec critère) ;
  - **Prochaine tentative**.
- Chaque information du bilan affiche sa source : *Ton observation*, *Ton auto-évaluation* (étapes « Oui, réussi » / « Pas encore »), *Règle pédagogique ARIA*, *Données de la prise*. L’encart « Analyse automatique : aucune » rappelle qu’ARIA n’écoute pas le contenu des prises.
- Réécoute et comparaison A/B de deux prises, avec une note de comparaison facultative.
- Aucun score, aucune erreur musicale ni aucune analyse audio n’est inventé.

### Design System

- `src/design/tokens.css` :
  - palette identitaire (crème, espresso, or) distincte de la palette fonctionnelle : vert = réussite, jaune = vigilance, rouge = erreur (contour) et enregistrement (plein, animé, « REC ») ;
  - typographie Manrope pour tous les textes fonctionnels ;
  - échelle d’espacement de 4 px, rayons, bordures, ombres ;
  - zones tactiles de 44 px minimum ;
  - anneau de focus.
- Variante identitaire marine `#152642` préparée, **non appliquée par défaut**. Aperçu via `?brand=marine` ou Profil → Apparence.
- `src/design/components.css` (composants `ds-*`) et `src/design/Icon.tsx` (jeu d’icônes unique).
- Écrans Séance et Bilan entièrement redessinés. Accueil, Bibliothèque, Suivi, Profil, Onboarding et fiche morceau alignés sur les mêmes fondations.
- Largeur fixe (560 px max, marges de 16 px), barre de navigation stable avec un espace réservé sous le contenu. La hauteur des écrans suit leur contenu.
- Contrastes relevés au niveau WCAG AA pour les textes secondaires.
- Documentation : `docs/DESIGN_SYSTEM.md`.

### Correctifs de recette (clôture du Sprint 04)

- **Suivi** : un brouillon repris puis terminé apparaissait aussi dans les brouillons. Chaque journal porte désormais l’identifiant de sa séance (`sessionStartedAt`), et terminer la séance remplace son brouillon au lieu de le dupliquer. Les doublons déjà enregistrés sont masqués à l’affichage, les autres brouillons restent, et les observations du brouillon reviennent dans le bilan à la reprise.
- **Préparation** : « Partition » était présélectionnée sans partition importée. Le support par défaut est maintenant celui réellement présent dans la fiche, sinon « À l’oreille, sans support ». Il reste modifiable.
- **Bilan** : sans aucune prise, la prochaine tentative propose d’enregistrer une première prise de référence. L’invitation à comparer n’apparaît que si une prise existe déjà pour ce morceau.
- Suivi : le nombre de prises d’une séance terminée ne compte plus les prises supprimées.
- Recette de non-régression ajoutée (NR1 à NR3). Tests : unitaires 20/20, e2e 64/64.

### Clôture V0.4 — corrections pédagogiques issues des tests physiques

- **Bilan** : le conseil par défaut suit l’objectif. « Monte le tempo de 4 BPM » est réservé au Rythme et au Tempo. Justesse, Mémoire et Fluidité reçoivent un conseil propre à leur axe, et la reprise d’une étape n’impose plus de BPM hors rythme ou tempo (NR4).
- **Suivi** : l’objectif (« Justesse », « Rythme »…) n’est plus enregistré ni affiché comme passage quand aucun passage n’a été saisi. Les anciennes prises concernées sont aussi corrigées à l’affichage (NR5).
- Registre de recette consolidé (`docs/recettes/sprint04.md`), état des droits des médias (`docs/LICENCES.md`), bilan définitif (`docs/BILAN_SPRINT04.md`).
- `package.json` : version `0.4.0`.

### Médias (arbitrage de clôture MVP Alpha V0.4)

- **Retirés du dépôt et du déploiement** :
  - les 4 fichiers audio inutilisés (`clair-de-lune.mp3`, `lettre-a-elise.mp3`, `the-entertainer.mp3`, `ode-to-joy.wav`) et leurs fiches `*.AUDIO.txt` ;
  - les 3 images (`clair-de-lune.jpg`, `the-entertainer.jpg`, `lettre-a-elise.png`) et les 3 illustrations d’instruments, dont la **provenance n’a pas pu être établie** (aucune métadonnée, aucune source notée).
- **Remplacements neutres créés pour ARIA**, sans changer la structure des écrans :
  - fond d’accueil et cartes en dégradés CSS avec un motif de portées SVG inline ;
  - vignettes de morceaux à icône d’instrument ;
  - 6 icônes d’instruments dans le Design System.
- L’application n’affiche plus aucune image matricielle. Le build passe d’environ 5 Mo à 0,7 Mo.
- `docs/LICENCES.md` : enquête de provenance, éléments de remplacement, et éléments restants (fichiers SVG « Ode to Joy », hors arbitrage, provenance non établie).
- Identité visuelle par défaut inchangée (crème / espresso / or). La variante marine reste expérimentale.

### Préservé du Sprint 03

Onboarding en 4 étapes non répété, accueil sans « Bonjour, » vide, « Reprendre » uniquement si une séance est en cours, filtres de genres vides masqués, badge Démo, réécoute dans le Suivi, statut cloud/local dans le Profil, espace réservé sous la barre de navigation.

### Tests

- **Automatisés (micro simulé)** :
  - `npm test` : 23/23 ;
  - `node scripts/e2e-sprint04.mjs` (Playwright, Chromium, 390×844) : 68/68, dont 11 contrôles de non-régression (NR1 à NR5) et 3 contrôles médias (aucune requête vers les médias retirés, aucun 404, aucune image affichée), en local et sur la prévisualisation définitive.
- **Physiques (réalisés par la recette, micro réel)** :
  - Chrome sur Mac : réussi. Deux prises audibles, conservées après deux fermetures du navigateur.
  - iPhone, navigateur intégré à ChatGPT : réussi.
- **Non testés** : Safari iPhone ouvert directement, Android (reportés à dimanche ou lundi).
- Registre complet : `docs/recettes/sprint04.md`.

### Publication

- Captures : `docs/screenshots/sprint04/`.
- **Prévisualisation définitive MVP Alpha V0.4** : https://6b0078bb87479237251ba188--ariafirstversion.netlify.app, commit `91441b1` (`version.json` vérifié, bundles identiques, e2e 68/68 sur l’URL).
- Prévisualisations précédentes : `6b00649f…` (`cf42503`), `6b006f0b…` (`820bfe3`) et `6b0076bc…` (`99a313e`, avant le retrait des médias), remplacées.
- Production verrouillée sur le Sprint 02 (`6aff204b…`) jusqu’à la validation finale indépendante. Ensuite, et sur autorisation explicite : fusion dans `main` et publication sur le lien principal.
---

## [Sprint 03] — Parcours utilisateur & architecture UX (2026-11-20)

Branche : `cursor/aria-sprint03-parcours-ux-47c6`  
Source Cursor + Netlify : `elodie-yebga-samnick/link-doctor` → site `ariafirstversion`  
Miroir public : `ariatestversion/Aria-` (`main`) — voir `docs/SOURCE.md`

### Continuité technique

- Clarifié le dépôt réellement utilisé par Cursor (Origin `link-doctor`) vs miroir GitHub public.
- Corrigé `docs/SOURCE.md`, `netlify.toml` et script deploy (plus de cible `ariaversionfinale`).

### Authentification

- Prénom, nom et date de naissance **facultatifs** à l’inscription.
- Connexion / déconnexion / reset existants conservés ; mode local clairement affiché dans Profil.
- Pas de simulation cloud : si indisponible, message explicite.

### Onboarding

- 4 étapes : instruments (multi), niveau, objectifs, temps disponible.
- Ne se répète pas si `onboardingDone`.

### Navigation

- Accueil : « Reprendre » seulement si séance en cours ; sinon bilan / nouvelle séance ; plus de « Bonjour, » sans prénom.
- Bibliothèque : filtres genres vides masqués ; badge Démo conservé.
- Suivi : réécoute inline (bouton Lecture/Pause identifiable) + brouillons distincts.

### UX / CSS

- Tokens communs (rayons, paddings, hauteur boutons).
- Dock rehaussé + padding bas pour éviter masquage (badge Netlify éventuel).
- Lecteur `.v0-play` contraste crème/espresso renforcé.

### Tests

Playwright mobile 390×844 : 9/9 (welcome, onboarding 4 étapes, accueil, reprise, suivi, profil, reload).  
Badge Netlify : non supprimable via code gratuit documenté — contournement padding.

### Publication

Preview Netlify uniquement — attendre validation avant prod.  
Captures : `docs/screenshots/sprint03/`

---

## [Sprint 02] — Fiabilisation de la pratique (2026-11-19)

Branche : `cursor/aria-sprint02-fiabilisation-47c6`  
Source publique : https://github.com/ariatestversion/Aria- (`main`) — voir `docs/SOURCE.md`  
Dépôt de travail Cursor : `elodie-yebga-samnick/link-doctor`

### P0 — Séances

- Une séance vide ne peut plus être comptée comme terminée.
- Distinction **terminée** / **brouillon** (`status` sur les journaux de séance).
- Accueil et Suivi n’affichent comme terminées que les séances `completed`.

### P0 — Persistance

- Mode découverte : e-mail de session persisté (`setSessionEmail`) ; restauration sans compte mot de passe.
- Rechargement : retour Accueil / onboarding selon profil, plus de perte systématique vers le welcome.

### P0 — Audio

- Feedback prise sauvegardée / échec de capture.
- Bouton **Réessayer le micro** après refus.
- Chronomètre lié à l’état d’enregistrement (indicateur « En cours »).
- Recette Safari iPhone / Chrome Android : **non exécutée sur appareils réels dans ce lot** (préparée, non déclarée réussie).

### P0 — Documentation

- `docs/SOURCE.md` : dépôt source public vs travail Cursor ; références contradictoires corrigées.
- `docs/LICENCES.md` : inventaire des médias à vérifier.
- README aligné sur Netlify `ariafirstversion` (plus `ariaversionfinale` comme cible courante).

### P1 — Reprise de séance

- Reprise conserve durée (`program.minutes`), difficultés, objectif et mode guidé/libre.
- « Reprendre ma séance » / « Reprendre le travail » rouvre l’étape en cours (session ou record).

### Publication

- Livraison en **prévisualisation Netlify** ; production uniquement après validation.
- Captures : `docs/screenshots/sprint02/`

---

## [Sprint 01] — Stabilisation (2026-11-19)

Branche : `cursor/aria-sprint01-stabilisation-47c6`  
Référence de retour arrière : tag `aria-pre-sprint01`  
Source publique de reprise : `ariatestversion/Aria-` (`main`) ; travail Cursor : `elodie-yebga-samnick/link-doctor`  
Dépôts de publication : Netlify `ariafirstversion` + GitHub Pages `ariatestversion/Aria-` (`gh-pages`)


### Processus de livraison

Après chaque lot : tests → push source GitHub/Origin → déploiement Netlify → vérification `version.json` = commit → captures dans `docs/screenshots/`.

### Sécurisation technique

- Confirmé le projet source (`package.json`, `src/`, configs Vite/TS/Netlify).
- Retiré `.env.production` du suivi Git ; `.gitignore` n’autorise plus que `.env.example`.
- Aucun secret, `.env` ou `node_modules` n’est publié dans ce sprint.
- Diff Netlify vs GitHub Pages : même build applicatif ; Pages utilise `base=/Aria-/`, Netlify sert la racine `/`.
- Travail isolé sur branche dédiée ; **pas de remplacement de la production** dans ce sprint.

### Corrections visuelles

- Slogan exact **« Just Play Something. »** sur l’écran de bienvenue.
- Renforcement du contraste des contrôles crème/espresso (boutons, chips, niveaux, instruments).
- Réduction des chevauchements welcome / onboarding (ombres de lisibilité, images instruments bornées).
- Optimisation du poids des illustrations instruments (~1,3 Mo → ~120–145 Ko chacune) + `lettre-a-elise.png` / JPG presets allégés.
- Messages cloud / Google / Facebook reformulés sans jargon technique « Supabase ».

### Corrections fonctionnelles

- Plus de prénom inventé (`Musicien`, `Élodie`) si non renseigné.
- Plus d’auto-seed de démos pour les nouveaux comptes ; bibliothèque vide par défaut.
- Démos uniquement en mode découverte / action explicite, marquées **Démo**, sans `lastWorkedAt` fictif.
- Onglets : **Accueil · Bibliothèque · Suivi · Profil**.
- Pratique accessible depuis l’accueil et les fiches morceaux.
- Onglet **Suivi** : séances sauvegardées + prises audio réellement enregistrées uniquement.
- États vides (accueil, bibliothèque, suivi) + message « aucun résultat » pour les filtres.
- Erreurs / refus micro explicites sur l’écran d’enregistrement (IndexedDB inchangé pour la persistance des prises).

### Licences à vérifier

- Compositions classiques (Chopin, Debussy, Satie) : domaine public en composition.
- Fichiers audio / images des presets : **licences encore à vérifier** avant usage commercial.

### Non modifié (volontairement)

- Modèle pédagogique (`pedagogy.ts`).
- Aucune nouvelle API payante.
- Aucune analyse musicale automatique simulée.
- Intégrations Supabase conservées (mode cloud / local / down).
