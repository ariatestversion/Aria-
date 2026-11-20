# Changelog — ARIA

## [ARIA — MVP Alpha V0.4 · Sprint 04] — Expérience musicale & Design System (2026-11-20)

Branche : `claude/sprint04-experience-musicale` (depuis `main` = `23ea182`, source Cursor `104645c`)  
Dépôt de référence : `ariatestversion/Aria-`. Développement : Claude Code (reprise de Cursor).  
Netlify : projet existant `ariafirstversion`, **prévisualisation uniquement**.

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
