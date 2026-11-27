# Sprint 09 — Préparation de la validation finale (côté Ingénierie)

26 novembre 2026. Le protocole et les preuves relèvent du QA : *SONIQUE-ARIA-Protocole-QA-appareils-physiques* (Drive, fiches P01 à P05). Ce registre ne le remplace pas. Il indique ce que l’Ingénierie fournit pour la recette finale.

## Principe

- La recette finale porte sur la version qui intègre l’identité visuelle validée au Sprint 08 : commit et prévisualisation à désigner à la livraison.
- La prévisualisation 4 du Sprint 07 (`d5e4a7a`) reste disponible comme témoin. En cas d’écart, la rejouer permet de distinguer une réserve ancienne d’une régression du Sprint 08.
- Aucune fonctionnalité nouvelle, aucune modification du modèle pédagogique : seuls les jetons de couleur, la typographie, le logo, l’icône et les images changent.

## Non-régression automatisée (Chromium, micro simulé : ne remplace pas un test physique)

| Commande | Contenu |
| --- | --- |
| `npm run build && npm test` | Build et 44 tests unitaires (pédagogie, prises) |
| `node scripts/e2e-sprint04.mjs` | 244 contrôles, palette par défaut : parcours T01 à T11 automatisables, QA-01 et QA-02, mise en page (320 px, paysage, tablette, ordinateur, texte agrandi 200 %), contraste AA |
| `THEME=<palette> node scripts/e2e-sprint04.mjs` | Les mêmes contrôles dans une autre palette |

État au 26/11 sur la référence Sprint 08 `975e9ea` : 44/44 tests unitaires ; 297/297 contrôles en Nuit & cuivre (palettes candidates cuivre et bleu retirées).

## Réserves R09 : correspondance avec la fiche QA

| Réserve | Fiche QA | Ce qui change avec l’identité visuelle | À vérifier en plus sur la version finale |
| --- | --- | --- | --- |
| R09-01 · audio, prises, persistance | P01, P03, P04 | Rien dans la chaîne audio | Rejouer sur la version finale ; la couleur du bouton de prise au repos change selon la palette |
| R09-02 · VoiceOver, focus, ergonomie, texte agrandi, bilan | P05 | Couleurs de la séance immersive, logotype Sonique | Lisibilité de la séance instrument en main en Nuit & cuivre ; noter la version d’iOS (16.2 ou plus requis) ; **scénario S08-QA-REG-01 sur Safari et iPhone physique** (voir ci-dessous) |
| R09-03 · métronome, tempo | P02 | Pastille « Métronome · N BPM » et repère « Conseillé » recolorés | Distinction tempo actif / tempo conseillé dans la palette retenue |
| R09-04 · Android, cas d’erreur, parcours résiduels | Complément Android | Aucun | Selon les fixtures du QA |

## À fournir par l’Ingénierie à la livraison de la version finale

- Commit complet, lien de prévisualisation et `/version.json` correspondant.
- Captures de tous les écrans dans la palette retenue (`docs/screenshots/sprint08/`).
- Résultat de la recette automatisée sur ce commit.
- Liste des fichiers d’identité intégrés (police, SVG, images) avec leurs licences (`docs/LICENCES.md`).

## Contrôle S08-QA-REG-01 ajouté à R09-02 (arbitrage du Head of Product, 26/11/2026)

Statut : **non reproduit, en attente de preuve.** À exécuter sur iPhone physique, dans Safari ouvert directement, en navigation normale, sur la version candidate du Sprint 09 (ou sur la prévisualisation 3 du Sprint 08 : https://6b084f388ee01180268c44f2--ariafirstversion.netlify.app) :

1. Mode local : Piano, « Je débute », Rythme, 15 min ; morceau de test au titre inédit ; aucune prise.
2. Avancer jusqu’à l’étape 4 avec « Étape suivante », puis « Faire le bilan ».
3. « Garder en brouillon », puis l’onglet Accueil.
4. Recharger la page (geste de Safari).
5. Toucher « Reprendre mon bilan », puis « Reprendre la séance ».

Attendu : la séance s’affiche à l’étape 4, et le brouillon reste listé dans le Suivi.

Preuves à fournir : vidéo de l’écran, modèle d’iPhone, version d’iOS, état du profil (vierge ou déjà utilisé). Si l’écart se reproduit, l’Ingénierie corrige, ajoute la preuve au test `S08 · REG-01` et la contre-recette précède toute validation finale.

## Préparation du lancement opérationnel du Sprint 09 (en attente de l’autorisation de la fondatrice)

- **Point de départ proposé** : nouvelle branche `claude/sprint09-validation` depuis le dernier commit de `claude/sprint08-identite` (documentation seulement après `975e9ea`). Son application est identique à `975e9ea`, la référence figée du Sprint 08. Aucune fusion dans `main` sans décision distincte.
- **Lot Ingénierie (corrections inscrites)** :
  - S08-ENG-01 : instrument par défaut d’un nouveau morceau après rechargement ;
  - S08-QA-01 : avatar « A ».

  Chacune avec son test automatisé dédié, sans autre changement fonctionnel. Estimation : 1 h, recette et prévisualisation comprises.
- **Lot QA (appareils physiques)** : R09-01 à R09-04 selon le protocole P01 à P05, avec le contrôle S08-QA-REG-01 dans R09-02, sur la prévisualisation candidate du Sprint 09.
- **Livrables Ingénierie** :
  - prévisualisation candidate et commit, `version.json` ;
  - recette automatisée (au moins 44 tests unitaires et 297 parcours) ;
  - captures ;
  - mise à jour des registres.
- **Hors périmètre sans décision distincte** : nouvelles fonctionnalités, modèle pédagogique, photographies non autorisées, icône et favicon, fusion, publication.

## Sprint 09 — diagnostic initial et exécution (lancement du 26/11/2026)

Branche `claude/sprint09-validation`, créée depuis `claude/sprint08-identite` (application identique à `975e9ea`, référence du Sprint 08). Nuit & cuivre conservée ; aucune exploration chromatique, refonte ou fonctionnalité nouvelle.

### Audit du parcours (onboarding → deuxième séance)

Parcours complet rejoué sur un profil vierge (Chromium, 390 × 844, micro simulé) :
- Bienvenue, onboarding en 4 étapes, Accueil vierge, Bibliothèque vide, ajout d’un morceau, fiche, préparation ;
- séance 1 avec une prise, étapes « Oui, réussi » et « Pas encore », dernière étape, bilan avec observations, « Terminer la séance » ;
- Accueil, séance 2 construite à partir de la précédente (reprise à −8 BPM en tête), Suivi, Profil.

Aucune erreur JavaScript, aucun blocage. La continuité pédagogique fonctionne : l’exercice correctif et son tempo annoncés au bilan se retrouvent dans la séance 2.

Pertinence des programmes : 6 instruments × 3 niveaux × 5 objectifs, à 15 min. Les 30 combinaisons instrument × objectif produisent un contenu différent selon le niveau (consignes, repères, tempo de départ). Le contrôle exhaustif des invariants (plus de 10 000 programmes) reste dans `npm test`.

### Constats

| ID | Constat | Priorité proposée | Traitement |
| --- | --- | --- | --- |
| S08-ENG-01 | Instrument « Piano » imposé à un nouveau morceau après un rechargement | P1 | **Corrigé** + test dédié |
| S08-QA-01 | Avatar « A » sans prénom | P2 | **Corrigé** (icône neutre) + test dédié |
| S08-QA-02 | Recette : lecture des styles de la Bienvenue avant affichage (échec ponctuel) | Outillage | **Corrigé** (attente de l’écran) |
| S08-QA-REG-01 | « Reprendre la séance » laisserait le bilan affiché | Ouverte | Non reproduite ; test automatisé en place ; vérification par ChatGPT QA à son retour et sur iPhone (R09-02) |
| S09-D-01 | Prises enregistrées sans passage renseigné (« passage non renseigné ») : la comparaison A/B, qui exige un passage identifié, n’est alors jamais proposée. Or le champ « Passage travaillé » est facultatif et souvent laissé vide | P1, compréhension et continuité | **À arbitrer** (PM/PD) : aide à la saisie ou valeur par défaut « morceau entier ». Modification fonctionnelle, non faite |
| S09-D-02 | Pendant une prise, le message « Navigation indisponible… » recouvre le haut de la barre de navigation et le bas des commandes (S08-QA-03) | P2 | À vérifier sur iPhone (R09-02), puis à arbitrer |
| S09-D-03 | Pendant la séance et le bilan, l’onglet actif reste « Bibliothèque » (O-2, comportement du Sprint 07) | P3 | À arbitrer (repère de navigation) |
| S09-D-04 | Accueil vierge : « Mes accès rapides » double la barre de navigation (Pratiquer, Bibliothèque, Suivi) | P3 | À arbitrer (PD) |
| S09-D-05 | Bienvenue sans photographie : moitié haute vide (O-1) | P3 | Product Design (photos autorisées ou repli enrichi) |

### Plan d’exécution

1. **Fait le 26/11** : corrections S08-ENG-01 et S08-QA-01, fiabilisation de la recette (S08-QA-02), recette complète et prévisualisation candidate n° 1 du Sprint 09.
2. **Sur arbitrage** : S09-D-01 (estimé à 1 h, test compris), puis S09-D-02 à D-04 selon décision.
3. **QA (dès disponibilité)** :
   - contre-recette de la candidate ;
   - vérification de REG-01 par ChatGPT QA ;
   - tests physiques R09-01 à R09-04 (protocole P01 à P05, REG-01 dans R09-02).
4. **Ingénierie, en accompagnement** : reproduction et correction de tout écart remonté, avec preuves ; nouvelle candidate et contre-recette ciblée.

**Estimation** :
- candidate n° 1 livrée le 26/11 ;
- corrections arbitrées : environ 1 h par lot, recette comprise ;
- la validation finale dépend des tests physiques (iPhone et Android), qui ne peuvent pas être réalisés depuis l’environnement de l’Ingénierie.

Candidate n° 1 du Sprint 09 : https://6b085b5efaedcc23d9d0dea3--ariafirstversion.netlify.app (commit `22dbdc2`, déploiement `6b085b5efaedcc23d9d0dea3`, non publiée ; `/version.json` doit indiquer `22dbdc2`).

## Candidate n° 2 — corrections ciblées (GO PM du 26/11/2026)

Contre-recette Claude QA de la candidate n° 1 : 9/10, corrections validées, aucune régression.

| ID | Correction | Test dédié |
| --- | --- | --- |
| S09-QA-01 | À l’enregistrement du Profil, l’instrument proposé pour un nouveau morceau devient le premier instrument du profil, sans rechargement | e2e : profil Guitare → Batterie ; l’ajout propose Batterie ; la préparation présélectionne Batterie |
| S09-D-01 | Constat confirmé dans le code : une prise reprenait le passage du morceau ou du programme, sinon une valeur vide, et la règle de comparaison exige un passage identifié. Correction : une prise de séance sans passage saisi porte « Morceau entier » (`DEFAULT_PASSAGE`, `src/v0/takes.ts`). Le champ reste facultatif, les anciennes prises sans passage restent non comparables, les prises hors séance sont inchangées | Unitaires : passage par défaut, comparabilité, métadonnées. e2e : séance sans passage, deux prises, comparaison A/B proposée au bilan |

Le passage par défaut est un choix du PM, sous réserve de l’arbitrage du Head of Product et du Product Design. Le libellé se change en une ligne.

S09-D-02 à D-05 : priorités maintenues ; D-02 sera arbitré après les tests physiques. REG-01 reste ouverte.

Candidate n° 2 : https://6b0864cbe55b19581e435a76--ariafirstversion.netlify.app (commit `1aeaf8c`, déploiement `6b0864cbe55b19581e435a76`, non publiée ; `/version.json` doit indiquer `1aeaf8c`). Recette : 47/47, 307/307 (Nuit & cuivre), 287/287 (DA A).

## Phase de clôture — diagnostic du 27/11/2026 (avant toute modification applicative)

Référence de travail : candidate n° 2, `1aeaf8c`. Avis lus :
- contre-recette Claude QA de la candidate n° 2 (9/10, corrections validées, aucune régression, REG-01 non reproduite) ;
- complément PM : ChatGPT QA a reproduit REG-01 de façon intermittente, au premier clic ; Product Design confirme Nuit & cuivre.

### S08-QA-REG-01 : cause identifiée

- **Reproduction systématique** en Chromium automatisé sur `1aeaf8c` : touche Entrée répétée (maintenue, ou deux appuis rapprochés) sur « Reprendre la séance ». 2 essais sur 2. Non reproduit au simple clic, au double clic, à la barre d’espace ni au toucher, y compris avec le processeur ralenti 6 et 20 fois.
- **Mécanisme** :
  1. Le premier appui ouvre la séance à la dernière étape.
  2. La séance donne alors automatiquement le focus à « Faire le bilan » (règle S7-04 / T07).
  3. L’appui répété suivant active ce bouton et rouvre le bilan aussitôt : l’utilisateur a l’impression que le bilan « reste affiché ».
  4. Un appui ultérieur, bref, fonctionne : d’où le caractère intermittent.
  5. Le même risque existe pour « Étape suivante » vers la dernière étape.
- Le double clic est un déclencheur possible quand « Faire le bilan » apparaît sous le pointeur, selon la taille d’écran (non observé ici).
- **Correctif proposé** (11 lignes, `docs/sprint09/REG-01-correctif-propose.patch`, non appliqué) :
  - sur « Faire le bilan » uniquement, ignorer un appui clavier répété (`repeat`) et le second clic d’un double clic ;
  - le focus de S7-04 / T07 et celui de QA-01 sont conservés.
- Prototype vérifié localement : la reproduction disparaît (2 essais sur 2) ; recette complète 47/47 et 307/307.
- Test à ajouter avec le correctif : Entrée répétée sur « Reprendre la séance » et sur « Étape suivante » vers la dernière étape ; le bilan ne doit pas se rouvrir.
- À confirmer auprès de ChatGPT QA : le mode de clic utilisé (souris, clavier, outil d’automatisation).

### Tableau consolidé des réserves

| ID | Gravité | Nature | Responsable | Action nécessaire | Bloquant pour la clôture |
| --- | --- | --- | --- | --- | --- |
| S08-QA-REG-01 | Majeure (reproduite) | Technique | Ingénierie, puis QA | GO PM sur le correctif, candidate n° 3, contre-recette des deux QA, contrôle Safari iPhone (R09-02) | **Oui** |
| R09-01 | Majeure (non testé) | Test physique | Fondatrice ou QA | Prises avec un vrai micro ; comparaison A/B sans passage saisi (« Morceau entier ») ; persistance après fermeture de Safari ; refus et interruption du micro | **Oui** |
| R09-02 | Majeure (non testé) | Test physique | QA / PD / fondatrice | Séance marine instrument en main, texte agrandi, REG-01 sur Safari, VoiceOver si possible | **Oui** (au minimum REG-01 et l’ergonomie) |
| R09-03 | Moyenne (non testé) | Test physique | Fondatrice ou QA | Métronome à l’oreille : cadence, arrêt en quittant l’écran, tempo associé à la prise | Oui pour la validation finale |
| R09-04 | Moyenne (non testé) | Test physique | QA | Android si un appareil est disponible ; cas d’erreur selon fixtures | **À arbitrer** : report possible si aucun appareil Android n’est disponible |
| S09-D-01 | Arbitrage | Produit | Head of Product / PD | Confirmer le libellé « Morceau entier » (déjà intégré) | Non (décision attendue) |
| S09-D-02 | Mineure | Ergonomie | PM après tests physiques | Message « navigation indisponible » sur la barre pendant une prise | Non |
| S09-D-03, D-04 | Mineure | Ergonomie | PM / PD | Onglet actif pendant la séance ; accès rapides redondants | Non |
| S09-D-05, nom, logotype, icône, photographies | — | Lancement commercial | PD / Communication | Traités en parallèle, hors Sprint 09 | Non |
| O-S09-1 | Observation | Données | — | Anciennes prises sans passage non comparables (voulu, données préservées) | Non |
| O-S09-2 | Observation | Données | — | « morceau entier » saisi en minuscules ≠ « Morceau entier » : cas marginal, sans correction | Non |

### Protocole simplifié des tests physiques (fondatrice, iPhone, environ 30 minutes)

Préparation :
- Safari ouvert directement, pas depuis une autre application, en navigation normale.
- Lien de la candidate à tester (n° 3 si le correctif est validé, sinon n° 2). Ouvrir `/version.json` et noter le commit affiché.
- Noter le modèle d’iPhone et la version d’iOS (16.2 minimum).
- Un instrument, ou deux sons simples et différents.
- Pour chaque test : « conforme » ou « écart », avec une courte vidéo de l’écran si possible.

| Test | À faire | Attendu |
| --- | --- | --- |
| 1 · REG-01 (R09-02) | Mode local : Piano, « Je débute », Rythme, 15 min ; nouveau morceau ; aller à l’étape 4 avec « Étape suivante » ; « Faire le bilan » ; « Garder en brouillon » ; Accueil ; recharger la page ; « Reprendre mon bilan » ; « Reprendre la séance » | La séance s’affiche à l’étape 4 ; le brouillon reste dans le Suivi |
| 2 · Prises et comparaison (R09-01) | Nouvelle séance sans remplir « Passage travaillé » ; à la même étape, deux prises de 5 à 8 s (deux motifs différents) ; « Faire le bilan maintenant » | Les deux prises portent « Morceau entier » ; le bilan propose de les comparer ; une seule joue à la fois ; les sons sont audibles |
| 3 · Tempo différent (R09-01, R09-03) | Revenir à la séance ; ouvrir le Métronome, +4 BPM, démarrer ; troisième prise ; bilan | L’en-tête affiche le tempo du métronome ; la troisième prise n’est pas comparée aux deux autres ; le clic s’arrête quand on quitte l’écran |
| 4 · Persistance (R09-01) | Fermer complètement Safari (balayage), rouvrir le même lien ; Suivi | Les prises sont toujours là et se réécoutent |
| 5 · Micro refusé (R09-01) | Sur un autre morceau, refuser le micro puis l’autoriser dans les réglages du site et réessayer | Message clair, aucune prise fantôme ; la prise fonctionne ensuite |
| 6 · Séance instrument en main (R09-02) | Téléphone posé, instrument en main : repérer tempo, consigne, « Arrêter la prise » et « Faire le bilan » ; refaire rapidement avec un texte plus grand (Réglages iOS) | Commandes repérables et utilisables sans gêne |
| 7 · VoiceOver (R09-02, facultatif) | Activer VoiceOver, ouvrir un bilan | Le titre du bilan est annoncé |

Android, si un appareil est disponible : tests 2 et 4 dans Chrome.

### Corrections indispensables à la clôture et délai

- **Indispensable** : REG-01 (correctif proposé). Aucune autre correction technique n’est requise par les avis reçus.
- **Délai estimé après le GO PM** :
  - environ 45 min pour le correctif, le test dédié, la recette complète et la candidate n° 3 ;
  - puis environ 30 min de contre-recette par les QA ;
  - et environ 30 min de tests physiques par la fondatrice.
- La clôture dans la journée est possible si aucun nouvel écart n’apparaît.

## Candidate n° 3 — correctif REG-01 appliqué (GO PM du 27/11/2026)

- Correctif appliqué tel que proposé (`docs/sprint09/REG-01-correctif-propose.patch`), aucune autre modification applicative.
- Tests dédiés (8 contrôles) : Entrée répétée sur « Reprendre la séance » (bilan repris après rechargement) et sur « Étape suivante » vers la dernière étape. Pour chacun : la séance reste affichée, le focus est sur « Faire le bilan », un nouvel appui volontaire ouvre bien le bilan, et aucune erreur JavaScript.
- Preuve de détection : sans le correctif, les deux scénarios échouent (311/315) ; avec le correctif : **315/315**.
- REG-01 passe au statut « corrigé, à contre-recetter » par les deux QA et sur Safari iPhone (protocole simplifié, test 1).

Candidate n° 3 : https://6b095d84915d2ecd276a8f85--ariafirstversion.netlify.app (commit `aa83a42`, déploiement `6b095d84915d2ecd276a8f85`, non publiée ; `/version.json` doit indiquer `aa83a42`). Recette : 47/47, 315/315 (Nuit & cuivre), 295/295 (DA A). C’est la version à utiliser pour le protocole simplifié des tests physiques.

## Divergence « pointeur » sur REG-01 — investigation finale (27/11/2026)

Demande du PM : investiguer uniquement l’écart entre ChatGPT QA (« le bilan reste affiché après un clic sur “Reprendre la séance” », Chrome cloud) et Claude QA (clic, double clic, toucher conformes sur la candidate n° 3). Référence de validation : candidate n° 3, `aa83a42`. Aucune modification applicative dans cette investigation.

### Cause identifiée

Le bouton « Reprendre la séance » est la dernière commande du bilan. La barre de navigation est fixée en bas de l’écran et recouvre le bas de la page tant qu’on n’a pas fait défiler. La marge de fin de page est suffisante : en bas de page, le bouton est entièrement dégagé et cliquable, à toutes les tailles mesurées.

Le cas divergent est un état intermédiaire : le haut du bouton dépasse de quelques pixels au-dessus de la barre et le reste est caché dessous. Par exemple, à 1920 × 1080 sans défilement, seuls 14 px du bouton sont visibles. Le même état peut se produire à n’importe quelle taille d’écran, selon la position de défilement. Un clic placé à l’œil, par exemple par un agent de navigateur qui clique à des coordonnées, peut alors tomber :
- sur la bande visible : la séance s’ouvre (conforme) ;
- juste en dessous, sur la barre de navigation : selon l’endroit, rien ne se passe ou un onglet s’ouvre.

Dans le cas où rien ne se passe, le bilan reste affiché et « Retour » ramène à la séance. C’est exactement le constat de ChatGPT QA, y compris le fait que ce soit « aucun blocage total » et intermittent.

| Mesure (Chromium, `docs/sprint09/diag-REG-01-pointeur.cjs`) | `d5e4a7a` (Sprint 07) | `cf3d2c9` (Sprint 08) | `aa83a42` (candidate n° 3) |
| --- | --- | --- | --- |
| Position du bouton et de la barre (1920 × 1080, 1600 × 1000) | identique | identique | identique |
| Clic sur la bande visible | séance | — | séance |
| Clic juste sous la bande (sur la barre) | bilan reste affiché | — | bilan reste affiché |
| Clic par rôle, ou après défilement | séance | séance | séance |

Autres variantes au pointeur sur `aa83a42`, à 1348 × 936, 1280 × 720, 1280 × 800, 1024 × 768 et 1440 × 900 :
- conformes (séance ouverte) : clic simple, clic lent (appui de 400 ms), double clic, deux clics à 150 ms, deux clics distincts à 800 ms ;
- bilan rouvert : clic suivi d’un appui sur Entrée ou sur Espace. Après le clic, le focus est sur « Faire le bilan » (règle S7-04) ; un nouvel appui volontaire l’active, ce qui est le comportement normal du clavier, déjà accepté par les deux QA comme limite de REG-01.

### Conclusions

- **Ce n’est pas une anomalie applicative.** La géométrie de la page et le comportement au clic sont identiques depuis le Sprint 07 (`d5e4a7a`). La différence entre `d5e4a7a` et `cf3d2c9` rapportée au Sprint 08 vient de l’endroit où le clic est tombé, pas du code.
- Le correctif clavier de la candidate n° 3 n’est pas en cause et reste nécessaire : l’Entrée répétée était une cause distincte, reproduite systématiquement.
- **Aucune correction proposée, pas de candidate n° 4.** La candidate n° 3 (`aa83a42`) reste la référence de clôture.
- Observation non bloquante, hors périmètre du Sprint 09 (aucune modification graphique autorisée) : **O-S09-3**. Une commande peut être partiellement recouverte par la barre de navigation tant que la page n’a pas défilé. C’est le comportement courant d’une barre fixe, et la commande reste atteignable par défilement. Une amélioration éventuelle (barre d’action collante dans le bilan, ou masquage de la barre de navigation sur le bilan) relève du Product Design, après le MVP.
- Pour les QA : un clic doit viser une commande entièrement visible. Faire défiler jusqu’à voir le bouton en entier avant de cliquer ; avec un outil automatisé, cliquer par rôle ou par libellé plutôt qu’à des coordonnées. Le script de diagnostic rejoue les trois cas sur n’importe quelle prévisualisation : `node docs/sprint09/diag-REG-01-pointeur.cjs <URL>`.

### Protocole définitif des tests physiques (candidate n° 3)

Il remplace le protocole simplifié ci-dessus. Les tests 2 à 7 ne changent pas ; le test 1 est précisé.

Préparation :
- iPhone, Safari ouvert directement, en navigation normale.
- Lien : https://6b095d84915d2ecd276a8f85--ariafirstversion.netlify.app. Ouvrir `/version.json` et vérifier `aa83a42`. Sinon, arrêter et signaler.
- Noter le modèle d’iPhone et la version d’iOS (16.2 minimum).
- Pour chaque test : « conforme » ou « écart », avec une vidéo d’écran si possible et l’heure.

| Test | À faire | Attendu |
| --- | --- | --- |
| 1a · REG-01 au toucher (R09-02) | Mode local : Piano, « Je débute », Rythme, 15 min ; nouveau morceau ; aller à l’étape 4 avec « Étape suivante » ; « Faire le bilan » ; « Garder en brouillon » ; Accueil ; recharger la page ; « Reprendre mon bilan ». **Faire défiler jusqu’à voir « Reprendre la séance » en entier au-dessus de la barre**, puis toucher une fois | La séance s’affiche à l’étape 4 ; le brouillon reste dans le Suivi |
| 1b · REG-01, double toucher | Recommencer le test 1a (« Faire le bilan », « Garder en brouillon », Accueil, « Reprendre mon bilan »), puis toucher deux fois rapidement « Reprendre la séance » | La séance reste affichée ; le bilan ne se rouvre pas |
| 1c · REG-01 au clavier (facultatif, ordinateur avec Chrome ou Safari) | Même scénario ; placer le focus sur « Reprendre la séance » avec Tab et **maintenir** Entrée une seconde | La séance reste affichée, le focus est sur « Faire le bilan » ; un nouvel appui distinct sur Entrée ouvre le bilan (normal) |
| 2 à 7 | Inchangés (protocole simplifié ci-dessus) | Inchangés |

Un toucher sur la barre de navigation n’est pas un écart REG-01, même s’il recouvre en partie le bouton. Le noter comme observation O-S09-3, avec une capture.

Android, si un appareil est disponible : tests 1a, 2 et 4 dans Chrome.

### Délai

- Ingénierie : aucun développement nécessaire. Diagnostic, script et documentation livrés (commit de documentation seulement, aucune nouvelle prévisualisation).
- ChatGPT QA : environ 15 min pour confirmer, sur la candidate n° 3, le test 1a et le script de diagnostic.
- Fondatrice : environ 35 min pour le protocole définitif.
- La clôture du Sprint 09 est possible dans la journée si ces tests sont conformes et si « Morceau entier » est arbitré.

## Candidate n° 4 — dernier lot correctif (GO PM du 27/11/2026)

Source : rapport définitif de recette physique de Claude QA (iPhone 12 Pro Max, iOS 18.6.2, candidate n° 3). Le lot se limite aux deux anomalies majeures relevées. Les observations O-S09-4 à O-S09-7 sont documentées sans correction.

### S09-QA-02 — comparaison A/B à l’étape « Prise de contrôle » sans métronome

- **Cause** : sans métronome, une prise prenait le tempo de la consigne de l’étape. L’étape « Prise de contrôle » n’a pas de consigne de tempo, et les objectifs sans tempo (Justesse, Mémoire, Expression…) n’en ont à aucune étape. Les prises étaient donc « tempo inconnu » et jamais comparables.
- **Correction** : le tempo de référence et le tempo réellement joué sont distingués (`src/v0/takes.ts`, `model.ts`).
  - Avec le métronome en marche, la prise porte le **tempo joué** : « 60 BPM ».
  - Sans métronome, elle porte le **tempo de référence de la séance** : la consigne de l’étape, sinon le tempo de travail des autres étapes. Libellé : « réf. 60 BPM, sans métronome ». Ce tempo est conseillé, jamais présenté comme mesuré.
  - Dans une séance sans tempo et sans métronome, le libellé est « tempo libre ».
- **Règles de comparabilité préservées** : même séance, même passage, et un tempo de **même origine et de même valeur**. Métronome à 60 avec métronome à 60, référence 60 avec référence 60, libre avec libre.
  - Une prise au métronome n’est donc pas comparée à une prise sans métronome. Motif affiché : « Une seule des deux prises a été faite avec le métronome. », ou « Le tempo diffère. » si les valeurs diffèrent.
  - Le reste ne change pas : séances différentes, passages différents et prises illisibles ne sont toujours pas comparés.
- **Données historiques** : aucune migration ni réécriture. Les prises antérieures, sans le nouveau champ `tempoSource`, gardent leur tempo et leur comparabilité d’avant. Sans tempo, elles restent non comparables.
- Changement visible voulu : une prise faite sans métronome à une étape qui a une consigne de tempo affiche « réf. 60 BPM, sans métronome » au lieu de « 60 BPM ». Le contrôle S7-07 est mis à jour en conséquence, et la comparaison des deux prises éligibles est conservée.

### S09-QA-03 — « Arrêter » et repère REC visibles pendant toute la prise

- **Cause** : le message « Navigation indisponible » est fixé au-dessus de la barre, sur une hauteur théorique de 70 px. Avec l’affichage agrandi, la barre est plus haute et le message la recouvre, y compris le repère REC. Au démarrage, rien ne ramène « Arrêter » au-dessus du message. Le repère REC, posé à cheval sur la barre, était recouvert même à 100 %.
- **Correction** (`src/v0/AriaApp.tsx`, `aria-v0.css`), sans changement de couleur ni de composant :
  - le message est posé sur la hauteur **réelle** de la barre, mesurée pendant la prise ;
  - sa marge basse laisse la place au repère REC, qui passe au premier plan ;
  - au démarrage de la prise, et en cas de redimensionnement ou de zoom, « Arrêter » et le chrono sont ramenés au-dessus du message s’ils sont dessous ;
  - la marge de fin de page pendant la prise suit les hauteurs réelles.

### Tests de non-régression dédiés

| Test | Contrôles |
| --- | --- |
| Unitaires `takes.test.ts` (6 ajoutés, 53 au total) | Tempo de référence de « Prise de contrôle » ; tempo joué, de référence ou libre ; deux prises sans métronome comparables ; règles préservées (origine, valeur, séance, passage) ; anciennes prises inchangées |
| e2e S09-QA-02 (12 contrôles) | Piano · Je débute · Rythme, puis Mémoire : deux prises à « Prise de contrôle » sans métronome ; libellés ; A/B proposée ; prise au métronome écoutée à part avec son motif |
| e2e S09-QA-03 (20 contrôles) | 390 × 844, 260 × 563 (150 %), zoom de page 150 %, 320 × 568 : bouton « Enregistrer » près du bas de l’écran au démarrage. « Arrêter », chrono et REC entièrement visibles au démarrage et pendant la prise ; message lisible au-dessus de la barre ; arrêt fonctionnel |

Preuve de détection : sur `aa83a42`, 19 de ces contrôles échouent, plus le libellé S7-07 mis à jour (327/347). Avec les correctifs : **347/347** en Nuit & cuivre et **327/327** en DA A ; 53/53 unitaires. Tests faits en Chromium avec un micro simulé, ce qui ne remplace pas l’essai physique.

Captures : `docs/screenshots/sprint09/` (prise à 390 px et à 150 %, bilan avec comparaison à « Prise de contrôle »).

Candidate n° 4 : https://6b09a750acc212c565bc603f--ariafirstversion.netlify.app (commit `b419339`, déploiement `6b09a750acc212c565bc603f`, non publiée ; `/version.json` doit indiquer `b419339`).

### Contre-recette physique ciblée (environ 15 minutes, iPhone, Safari)

1. Ouvrir `/version.json` de la candidate n° 4 et vérifier `b419339`.
2. **S09-QA-02** : Piano · Je débute · Rythme · 15 min ; nouveau morceau sans passage ; aller à « Prise de contrôle » ; deux prises **sans métronome** ; « Faire le bilan ».
   - Attendu : prises « Morceau entier · réf. 60 BPM, sans métronome » ; « Comparer les prises · A / B ».
3. **S09-QA-03** : affichage agrandi (menu de page Safari « aA », 150 %) ; nouvelle séance ; à « Prise de contrôle », démarrer une prise avec le bouton près du bas de l’écran.
   - Attendu : « Arrêter », le chrono et REC restent entièrement visibles pendant toute la prise ; le message « Navigation indisponible » est au-dessus de la barre ; « Arrêter » fonctionne.
4. Facultatif : une prise avec le métronome, puis le bilan.
   - Attendu : elle est écoutée à part, avec la mention « Une seule des deux prises a été faite avec le métronome ».

### Observations documentées, non corrigées (hors périmètre)

O-S09-4 (chemin Réglages → Safari → Micro dans le message de refus), O-S09-5 (décalage du métronome au basculement micro / haut-parleur), O-S09-6 et O-S09-7 (comportements de Safari) : voir `docs/BACKLOG.md`.
