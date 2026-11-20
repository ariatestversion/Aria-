# Changelog — ARIA

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
