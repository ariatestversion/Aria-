# Registre de recette — Sprint 06 · Finalisation fonctionnelle & préparation V1

Branche `claude/sprint06-finalisation-v1`, depuis `main` (`04777e0`, Alpha V0.5). Prévisualisation : https://6b05c4864a41ea883858ac80--ariafirstversion.netlify.app · commit applicatif `67aa241`.
**Clôture technique le 24/11/2026** après les retours QA favorables de Claude et de Work sur `67aa241`. Réserve : aucune recette sur appareil physique n’a été faite pour cette version (section 3). Bilan et réserves : `docs/BILAN_SPRINT06.md`.

## 0. Verdicts QA

| Audit | Version | Verdict |
| --- | --- | --- |
| Claude QA | `67aa241` | Favorable |
| Work | `67aa241` | Favorable |

## 1. Tests automatisés (Claude · Chromium · micro simulé)

| Suite | Résultat |
| --- | --- |
| `npm run build` | OK |
| `npm test` (unitaires, dont contrôle exhaustif de plus de 10 000 programmes) | 37/37 |
| `node scripts/e2e-sprint04.mjs` (parcours Sprints 04 à 06, 390×844 et 320×640) | 136/136 en local |

## 2. Vérifications demandées

| Demande | Vérifié (automatisé) | Résultat |
| --- | --- | --- |
| Enregistrement, réécoute, comparaison, conservation | Plusieurs prises, A/B, réécoute après rechargement et après déconnexion/reconnexion, suppression confirmée | OK ; corrigé : comparaison d’une prise avec elle-même |
| Interruptions et reprise des séances | Micro coupé, arrière-plan, rechargement en séance et en bilan, reprise depuis l’accueil | OK (simulé) |
| Comptes, sauvegarde, synchronisation | Inscription locale, mauvais mot de passe, reconnexion, isolation entre comptes | **Corrigé** : choix d’onboarding transmis d’un compte à l’autre. Voir les limites section 4 |
| Instruments et niveaux peu testés | Contrôle exhaustif ; e2e batterie (Je pratique · Justesse) et voix (Je me perfectionne · Mémoire) | **Corrigé** : vocabulaire « notes » pour la batterie |
| Morceaux personnels | Ajout, lien vidéo, import PDF, ouverture du PDF depuis la fiche et la séance, séance complète | **Corrigé** : PDF non ouvrable, libellé brut `video` |
| Écart de durée bilan / séance suivante | Unitaire exhaustif + e2e scénario Work | Corrigé : 5 min annoncées = 5 min |
| Droits des médias | Aucune requête vers les médias retirés | Fichiers « Ode to Joy » retirés |
| Navigation et ergonomie | Onglet actif, cibles ≥ 44 px, pas de défilement horizontal, rien sous la barre | OK |

## 3. À recetter sur appareil réel (Safari iPhone ouvert directement, Chrome Android)

| Cas | iPhone | Android |
| --- | --- | --- |
| Enregistrer, réécouter, comparer deux prises ; fermer l’application, rouvrir, réécouter | à faire | à faire |
| Appel entrant ou alarme pendant une prise ; changement d’application ; écran verrouillé | à faire | à faire |
| Écran maintenu allumé pendant une prise | à faire | à faire |
| Recharger pendant le bilan → retour au bilan avec observations | à faire | à faire |
| Importer un PDF depuis l’appareil, l’ouvrir depuis la fiche et pendant la séance | à faire | à faire |
| Ouvrir un lien vidéo d’un morceau, revenir dans ARIA | à faire | à faire |
| Créer un compte, se déconnecter, créer un second compte, se reconnecter au premier | à faire | à faire |
| Parcours batterie et voix (consignes lisibles en jouant) | à faire | à faire |
| Lisibilité DA 4 (lumière forte et faible), zones tactiles, barre de navigation et zone sûre | à faire | à faire |

## 4. Limites et points pour arbitrage Produit

- **Pas de synchronisation des données.** Le compte cloud (Supabase), quand il est configuré, ne sert qu’à se connecter. Les morceaux, prises et séances restent sur l’appareil, rattachés à l’e-mail. Changer d’appareil ou effacer les données du navigateur les fait perdre. Les synchroniser serait une fonctionnalité majeure.
- **Découverte → compte** : les données créées en mode découverte ne sont pas reprises dans un compte créé ensuite.
- **Connexion cloud non testée** : l’environnement de test n’a pas de configuration Supabase ; seuls les comptes locaux sont testés. La connexion Google affiche « pas encore disponible ».
- **Suppression d’un morceau** : elle n’existe pas dans l’interface (fonctionnalité absente, non ajoutée).
- **Écran de connexion** : il garde l’ancien habillage, qui n’est pas en DA 4, et mélange « vous » et « tu ». Une reprise de cet écran relève de la direction artistique.
- Inchangé : aucune analyse audio ; métronome capté sur haut-parleur ; règles générales pour « Autre » ; stockage persistant non garanti (Safari).
