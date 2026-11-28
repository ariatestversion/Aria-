# Licences — médias (état final ARIA MVP Alpha V0.4)

## Décision appliquée (V0.4)

1. **Les quatre fichiers audio inutilisés sont retirés** du dépôt et du déploiement, avec leurs fiches de source `*.AUDIO.txt`.
2. **Les trois images et les trois illustrations d’instruments sont retirées**, car leur provenance **n’a pas pu être établie** (voir l’enquête ci-dessous). Elles sont remplacées par des éléments créés pour ARIA dans le code, sans droits tiers, sans changer la structure des écrans.

Aucune vérification juridique externe n’a été faite. Ce document décrit des faits techniques, pas un avis juridique.

## Enquête de provenance (2026-11-20)

| Fichier retiré | Usage en V0.4 | Recherche effectuée | Conclusion |
| --- | --- | --- | --- |
| `public/presets/clair-de-lune.jpg` (900×7486) | Fond de l’écran d’accueil, vignette par défaut | Métadonnées : aucune (ré-encodé par ffmpeg « Lavc60.31.102 ») ; aucune source notée ; historique Git limité à l’import `23ea182` | Provenance **non établie** : retiré |
| `public/presets/the-entertainer.jpg` (900×5094) | Carte « Commencer », vignette démo | Idem | Provenance **non établie** : retiré |
| `public/presets/lettre-a-elise.png` (640×905) | Vignette démo | Métadonnées : aucune ; aucune source notée | Provenance **non établie** : retiré |
| `public/instruments/piano-dessin.png`, `guitare-dessin.png`, `basse-dessin.png` (512×341) | Onboarding (choix d’instruments) | Métadonnées : aucune ; seule mention : « illustrations produit », sans auteur ni contrat | Provenance **non établie** : retirés |

## Fichiers audio retirés

| Fichier | Source notée avant retrait | Licence notée |
| --- | --- | --- |
| `public/presets/clair-de-lune.mp3` | Archive.org « ClairDeLunedebussy » | CC BY-ND 3.0 (attribution non affichée) |
| `public/presets/lettre-a-elise.mp3` | Jamendo / Archive.org jamendo-325328 — StasNick | CC BY-SA 3.0 (attribution non affichée) |
| `public/presets/the-entertainer.mp3` | Archive.org, enregistrement historique | Non vérifiée |
| `public/presets/ode-to-joy.wav` | Aucune | Inconnue |

Aucun de ces fichiers n’était utilisé par l’application V0.4. Seul l’ancien prototype `src/App.tsx`, non monté, les référençait encore.

**Attention :** ces fichiers restent servis par la production actuelle (Sprint 02, verrouillée) tant que la V0.4 n’y est pas publiée. Ils restent aussi dans l’historique Git, où ils ne sont plus publiés.

## Éléments de remplacement (créés pour ARIA, sans droits tiers)

| Élément | Remplace | Nature |
| --- | --- | --- |
| Fond de l’écran d’accueil | `clair-de-lune.jpg` | Dégradés CSS aux couleurs des tokens identitaires et motif de portées en SVG inline (`--staff-lines`, `src/v0/aria-v0.css`) |
| Carte « Reprendre / Commencer » de l’accueil | `the-entertainer.jpg`, `clair-de-lune.jpg` | Même procédé, aucune image |
| Vignettes de morceaux | 3 images de presets | Composant `PieceThumb` : icône de l’instrument sur fond or léger (`src/v0/ui.tsx`) |
| Icônes d’instruments (onboarding, vignettes) | 3 illustrations PNG | Icônes vectorielles dessinées pour le Design System : `inst-piano`, `inst-guitar`, `inst-bass`, `inst-voice`, `inst-drums`, `inst-other` (`src/design/Icon.tsx`) |

L’application V0.4 n’affiche plus aucune image matricielle. Le parcours e2e vérifie qu’aucune requête n’est faite vers les médias retirés. Sur la prévisualisation `6b0078bb…` (`91441b1`), leurs anciennes adresses ne servent plus les fichiers et renvoient la page de l’application.

## Autres éléments publiés

| Élément | Statut |
| --- | --- |
| `public/favicon.svg` | Logo du projet ARIA (fichier interne) |
| Polices Manrope et Fraunces (Google Fonts) | SIL Open Font License 1.1, usage autorisé |
| `public/presets/ode-to-joy.svg`, `ode-to-joy-beginner-placeholder.svg`, `ode-to-joy.KEEP.txt` | **Retirés au Sprint 06 (24/11/2026).** Provenance non établie (arrangement de l’« Hymne à la joie » sans auteur noté), jamais utilisés par l’application active. Le dossier `public/presets/` n’est plus publié. Les anciennes adresses renvoient la page de l’application (règle de redirection), sans servir le fichier. |
| Démos « Nocturne / Clair de lune / Gymnopédie » (mode découverte) | Titres et compositeurs uniquement (œuvres du domaine public), sans média associé |

## État au Sprint 06 (24/11/2026)

- **Aucun média de provenance non établie n’est publié.** `public/` ne contient plus que `favicon.svg`, `_redirects` et `version.json` (généré).
- Médias de l’application active : icônes, vagues et fonds dessinés pour ARIA dans le code (`src/design/Icon.tsx`, CSS), polices Manrope et Fraunces (SIL Open Font License 1.1, Google Fonts).
- Démos du mode découverte : titres et compositeurs d’œuvres du domaine public, sans média associé.
- L’ancien prototype non monté (`src/App.tsx`, `src/lib/presets.ts`) cite encore des chemins de médias retirés sous forme de texte ; il ne les charge jamais (contrôlé par le parcours e2e : aucune requête vers `/presets/`).
- **Reste hors du dépôt** : la production actuelle (Sprint 02, verrouillée) sert encore les anciens médias tant qu’une nouvelle version n’y est pas publiée.

## Sprint 07 (25/11/2026) — photographies de la maquette 4.2

Quatre JPEG (cuivre, guitare, piano, voix ; générés par ImageGen, statut « revue interne ») sont fournis par le Product Design. Conformément à l’arbitrage du Head of Product, ils ne sont autorisés que dans un environnement de revue **à accès restreint**. Les prévisualisations Netlify étant accessibles à toute personne disposant du lien, **ils ne sont pas intégrés** : l’application utilise ses visuels provisoires (vagues dessinées pour ARIA, icônes d’instruments). Avant toute intégration : validation du régime de droits du compte de génération, vérification image par image (marques, ressemblances), variantes WebP 240/480/750 px avec repli JPEG.


## Sprint 08 — Nuit & cuivre (26/11/2026)

- **Photographies : aucune intégrée.** Les candidats du pack Sprint 07 (cuivre.jpg, guitare.jpg, piano.jpg, voix.jpg) sont des images générées (OpenAI ImageGen) au statut « usage interne » ; la prévisualisation Netlify étant publique par lien, ils sont exclus. Replis : fond marine sur la Bienvenue, pictogrammes en Bibliothèque. Avant toute intégration : auteur ou provenance, licence ou autorisation, périmètre de diffusion à inscrire ici.
- **Polices** : Fraunces (logotype, graisse 650) et Manrope (interface), servies par Google Fonts, licence SIL Open Font License 1.1.
- **Motifs** : filets et vagues cuivre dessinés en CSS / SVG inline, création du projet, sans droits tiers.

## Sonique V2 — finition esthétique (28/11/2026) : visuels du pack Product Design

| Fichier (dans `src/assets/photos/`) | Surface | Empreinte SHA-256 (vérifiée à l’intégration) |
| --- | --- | --- |
| `bienvenue-cuivres-480.webp` / `-960.webp` | Bienvenue (Nuit & cuivre) | `ce827ca9…` / `19526630…` |
| `guitare-160.webp` / `-640.webp` | Vignette et carte de reprise Guitare | `36152ed1…` / `dc71ea4e…` |
| `piano-160.webp` / `-640.webp` | Vignette et carte de reprise Piano | `31c4fe38…` / `a7d4346c…` |
| `voix-160.webp` / `-640.webp` | Vignette et carte de reprise Voix | `c6ba6bba…` / `2b587119…` |

- **Provenance** : pack `SONIQUE-V2-ressources-visuelles.zip` du Product Design (Drive, APP / Produit / Product Design, 27/11/2026), fichier `empreintes.txt`. Les quatre originaux ont été générés avec OpenAI ImageGen pour Sonique V2, à partir de descriptions textuelles originales, sans photo tierce en entrée. Les huit fichiers sont des redimensionnements WebP de ces originaux, intégrés sans retouche.
- **Statut : proposés à validation interne.** Ils sont intégrés à une prévisualisation non publiée, sur autorisation du Head of Product du 28/11. **L’intégration définitive attend l’arbitrage de la fondatrice** : approbation des images et de leurs surfaces de diffusion.
- Le dossier ne contient aucune licence commerciale indépendante. Avant toute utilisation commerciale ou publication : consigner le compte et le régime contractuel OpenAI applicables, contrôler marques et ressemblances, puis tracer la décision pour l’app, le web et les supports de diffusion.
- Les images sont décoratives (`alt=""`) : titre et instrument sont toujours écrits. Repli si une image manque : fond marine (Bienvenue), décor de vagues (carte de reprise), vagues et pictogramme (vignettes).
