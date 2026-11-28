# Sonique V2 — Référentiel des modifications de finition esthétique

28 novembre 2026 · Ingénierie (Claude Code) · Branche `claude/sonique-v2-finitions`, créée depuis `c0164ff` (documentation seulement au-dessus de `b419339`, référence technique V2).

Mandat : le Head of Product valide la mission de finition esthétique premium du Product Design. Sources : `SONIQUE-V2-livraison-Product-Design.md`, `SONIQUE-V2-ressources-visuelles.zip` et `SONIQUE-Sprint-09-audit-final-Product-Design.md` (Drive, APP / Produit / Product Design).

Cadre : aucune modification fonctionnelle, Nuit & cuivre inchangée, aucune fusion dans `main`, aucune publication, pas de Sprint 10.

## Modifications intégrées

| # | Écran / composant | Modification | Fichiers | Prescription Product Design | Repli |
| --- | --- | --- | --- | --- | --- |
| V2-01 | Bienvenue | Photographie « main sur les pistons d’un cuivre », sur Nuit & cuivre uniquement. Fichier 480 par défaut, 960 en haute densité ou à partir de 600 px. Cadrage 56 % / 52 %. Voile marine local en bas pour la lisibilité du logotype, du slogan et de « Commencer » | `src/v0/aria-v0.css` (emplacement `--welcome-photo`), `src/assets/photos/bienvenue-cuivres-*.webp` | Emplacement `--welcome-photo`, 480/960 selon la densité, fond marine si l’image échoue, voile si le contraste l’exige | Fond marine et décor existants, conservés sous l’image |
| V2-02 | Accueil · carte de reprise | Visuel de la famille instrumentale du morceau (fichier 640) dans la zone visuelle, pour « Séance en cours », « Bilan commencé » et « Prochaine séance ». Hauteur réservée inchangée (112 px) ; texte et action dans le bloc existant | `src/v0/AriaApp.tsx` (`ResumeVisual`), `src/v0/photos.ts`, `aria-v0.css` | Fichier 640 sur la zone visuelle, titre, passage et action lisibles | Décor de vagues cuivre existant |
| V2-03 | Bibliothèque et Suivi · vignettes | Visuel de famille (fichier 160) dans la vignette 52 × 52 pour Piano, Guitare et Voix ; chargement à la demande ; taille réservée | `src/v0/ui.tsx` (`PieceThumb`), `src/v0/photos.ts`, `aria-v0.css` | Fichier 160, taille réservée, chargement plus bas à la demande, aucun déplacement du texte | Vagues et pictogramme existants (Basse, Batterie, Autre gardent le pictogramme) |
| V2-04 | Toutes surfaces | Association par instrument du morceau, jamais par titre. Images décoratives (`alt=""`), le titre et l’instrument restant écrits. DA A (`?theme=blanc`) sans visuel, inchangée | `src/v0/photos.ts`, `aria-v0.css` | « Faire correspondre les images à l’instrument réellement associé au morceau » ; vignette décorative | — |

Aucune autre modification visuelle : couleurs, typographie, composants et mises en page sont inchangés. La fiche morceau n’a pas de gabarit de vignette, elle n’en reçoit donc pas. Aucune ligne de logique applicative n’est modifiée.

## Captures avant / après (390 × 844 et 1280 × 800)

Les captures sont dans `docs/screenshots/v2/avant/` (`b419339`) et `docs/screenshots/v2/apres/`. Les comparaisons côte à côte à 390 px sont dans `docs/screenshots/v2/comparaison/`. Elles se régénèrent avec `node scripts/captures-v2.cjs <dossier>`.

| Écran | Capture | Changement visible |
| --- | --- | --- |
| Bienvenue | `01-bienvenue` | **Oui** : V2-01 |
| Personnalisation (instruments) | `02-personnalisation-instruments` | Non (identique au pixel) |
| Accueil vierge | `03-accueil-vierge` | Non (carte « Ajouter ou choisir un morceau », sans instrument : décor conservé) |
| Bibliothèque | `04-bibliotheque` | **Oui** : V2-03 |
| Fiche morceau | `05-fiche-morceau` | Non |
| Préparation | `06-preparation` | Non |
| Séance | `07-seance` | Non |
| Prise en cours | `08-prise-en-cours` | Non : seul le chrono diffère (heure de capture) |
| Accueil · reprise | `09-accueil-reprise` | **Oui** : V2-02 |
| Bilan | `10-bilan` | Non : seuls la date et l’heure des prises diffèrent |
| Suivi | `11-suivi` | **Oui** : V2-03 (vignettes) |
| Profil | `12-profil` | Non |

## Vérifications

- Unitaires 53/53. Parcours **360/360** en Nuit & cuivre et **338/338** en DA A (Chromium, micro simulé).
- 13 contrôles V2 ajoutés :
  - bonne image par famille, Batterie avec pictogramme, `alt` vide ;
  - tailles réservées 52 × 52 et 112 px, images chargées ou bloquées ;
  - replis sans image ;
  - DA A sans visuel ;
  - aucune erreur JavaScript.
- Le contrôle S08 V-02 (« aucune photographie ») est remplacé par « photographie du pack, repli marine conservé dessous ».
- Contrastes : l’audit automatique passe, mais il calcule sur les couleurs de fond et n’analyse pas la photographie. La lisibilité sur la photo repose sur le voile marine, qui couvre la zone du texte, et sur un contrôle visuel à 320 × 568, 390 × 844 et 1280 × 800 : texte lisible, aucun chevauchement. À confirmer par le Product Design et les QA.
- Poids ajouté : Bienvenue 21 Ko (480) ou 61 Ko (960), un seul fichier chargé ; cartes 29 à 31 Ko ; vignettes environ 3,5 Ko, intégrées au code.
- **Non vérifié ici** : rendu sur Safari iPhone réel à 140 et 150 %, VoiceOver, Android. Ces contrôles sont à faire par les QA et le Product Design sur la prévisualisation.

## Éléments soumis à l’arbitrage de la fondatrice avant intégration définitive

| # | Élément | État dans la prévisualisation | Décision attendue |
| --- | --- | --- | --- |
| A-1 | **Photographies** (Bienvenue et trois visuels de famille), générées par OpenAI ImageGen | Intégrées à titre de proposition | Approuver ou refuser chaque image et ses surfaces de diffusion. Les droits commerciaux restent à consigner avant toute publication (`docs/LICENCES.md`). En cas de refus, le retrait d’une image rétablit le repli existant (une ligne dans `photos.ts` ou dans `aria-v0.css`) |
| A-2 | **Cadrages** : 56 %/52 % (Bienvenue), 50 %/52 % (Guitare), 50 %/53 % (Piano), 62 %/48 % (Voix) | Points de départ du Product Design appliqués | Confirmer sur le rendu |
| A-3 | **Bienvenue sur grand écran** : l’image portrait de 960 px est agrandie et recadrée en paysage, d’où un rendu un peu adouci | Visible à 1280 px et plus | Accepter, ou demander au Product Design un export paysage dédié |
| A-4 | **Signature** « Sonique » en Fraunces 650 | Inchangée, déjà en place | Confirmer la graphie commerciale |
| A-5 | **Icône et favicon** | Inchangés (aucune ressource livrée) | Décider du remplacement ; export par le Product Design (0,5 j) |
| A-6 | Libellé du tempo de référence | « réf. 60 BPM, sans métronome » (candidate n° 4). Le Product Design demande « tempo de référence » | Arbitrer le libellé : c’est un changement de texte, non fait aujourd’hui |
| A-7 | Message « Navigation indisponible » | Bandeau fixe repositionné, avec retour automatique de « Arrêter » (candidate n° 4). Le Product Design préférait un message dans le flux | Confirmer après l’essai physique, ou demander l’évolution (modification d’interface) |
| A-8 | P2 de l’audit : accès rapides, bandeau Mode local, onglet actif en séance, chemin Réglages → Safari → Micro | Inchangés | À traiter seulement si le Product Design le confirme |

## Prévisualisation

Lien, commit et déploiement : voir `docs/SOURCE.md` et `SOURCE_VERSION.json`. Prévisualisation non publiée ; la production reste verrouillée sur le Sprint 02.
