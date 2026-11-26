# Sprint 08 — Identité visuelle : faisabilité et préparation technique

26 novembre 2026 · Ingénierie (Lead Developer) · Branche `claude/sprint08-identite`

## Point de départ

- Branche créée depuis `1276a2a`, dernier commit de `claude/sprint07-integration`. Son code applicatif est identique à la référence `d5e4a7a` ; les commits postérieurs ne changent que la documentation.
- Acquis fonctionnels du Sprint 07 préservés. Recette automatisée : 44/44 unitaires, 244/244 parcours dans chacune des trois palettes (DA A, cuivre, bleu), audits de contraste et de mise en page compris.
- La palette par défaut reste la DA A (Blanc & marine). Comparaison des captures avec celles du Sprint 07 : seuls les dates et la teinte de vignette, tirée de l’identifiant aléatoire du morceau, diffèrent.

## Ce que l’Ingénierie a préparé

1. **Couleurs centralisées.** Plus aucune couleur écrite en dur dans les écrans (`src/v0/aria-v0.css`, `src/design/components.css`) : tout passe par `src/design/tokens.css`. Les jetons ajoutés sont :
   - séance immersive : `--imm-*` (fond, texte, accent, filets, champs, couleurs fonctionnelles) ;
   - écran de bienvenue : `--welcome-ink`, `--welcome-ink-soft`, `--welcome-shadow`, `--welcome-btn-*` ;
   - divers : `--dock-shadow`, `--on-strong`, `--fn-warning-on`, `--fn-warning-text`, `--rec-pulse`.

   Avant ce sprint, la séance marine était écrite en dur : une nouvelle palette ne l’aurait pas recolorée.
2. **Famille de palettes.** Les palettes de la famille DA A (`data-layout='a'`) partagent la mise en page, la typographie et les composants. Une palette se limite à un bloc `html[data-v0='1'][data-brand='…']` qui ne redéfinit que des couleurs.
3. **Deux palettes candidates, provisoires**, construites à partir des pistes de la fondatrice. Elles s’ouvrent avec `?theme=cuivre` ou `?theme=bleu`, sans être mémorisées. Ce ne sont pas des propositions du Product Design : ce sont des preuves de faisabilité, dont les valeurs seront remplacées par la palette validée.
4. **Nom de marque centralisé.** `src/v0/brand.ts` définit `BRAND_NAME = 'ARIA'` et `BRAND_SLOGAN`. Un changement de nom validé tiendra en une ligne. Le nom affiché reste « ARIA ».
5. **Emplacement photographique.** Le jeton `--welcome-photo` vaut `none` par défaut. Il est prévu pour une photographie musicale dont les droits sont documentés. Aucune image n’est intégrée.
6. **Recette par palette.** `THEME=cuivre node scripts/e2e-sprint04.mjs` rejoue toute la recette dans une palette donnée.

## Contrastes des palettes candidates (WCAG AA, calculés)

| Paire | Cuivre | Bleu |
| --- | --- | --- |
| Texte sur fond | 15,2:1 | 16,1:1 |
| Texte secondaire sur fond / carte / creux | 7,46 / 8,26 / 6,79 | 6,95 / 7,53 / 6,45 |
| Blanc sur couleur principale | 14,8:1 | 13,9:1 |
| Texte sur accent | 6,98:1 | 7,60:1 |
| Séance : blanc sur fond / secondaire / pastille | 16,97 / 11,88 / 8,03 | 16,2 / 11,37 / 8,83 |
| Blanc sur rouge de prise | 5,62:1 | 5,62:1 |

L’audit automatique de contraste des parcours passe sur les trois palettes.

## Intégrer la proposition validée (estimation après réception)

| Livrable Product Design | Travail Ingénierie | Durée estimée |
| --- | --- | --- |
| Palette (valeurs hexadécimales et usages) | Remplacer un bloc de jetons, contrôler les contrastes, rejouer la recette | 1 à 2 h |
| Typographie | Charger la police (Google Fonts ou fichiers avec licence) et ajuster `--font-title` et les graisses | 1 à 2 h |
| Logo et logotype (SVG) | Remplacer le mot « ARIA » de l’accueil et de la bienvenue par le SVG, avec un texte alternatif | 1 h |
| Icône d’application | Remplacer `public/favicon.svg` et ajouter les tailles iOS | 1 h |
| Photographies (droits documentés) | `--welcome-photo`, vignettes, optimisation (WebP ou AVIF, poids < 200 Ko), `docs/LICENCES.md` | 2 à 3 h |
| Nom commercial | Modifier `BRAND_NAME` et le titre de la page | 15 min |

À cela s’ajoutent la recette complète, les captures et le déploiement d’une prévisualisation : environ 1 h par livraison. Toutes les palettes partagent les mêmes écrans, ce qui garantit leur cohérence d’ensemble.

## Blocages et points à arbitrer

1. **Aucune proposition du Product Design validée n’a été reçue.** Aucun livrable n’est présent dans Drive à 10 h. La prévisualisation de 00 h ne pourra intégrer l’identité validée que si la palette, la typographie et le logo arrivent avant 20 h environ. Sinon, elle présentera les palettes candidates et l’architecture prête.
2. **Photographies.** Il faut des images aux droits documentés, ou cédés, utilisables sur une prévisualisation publique par lien. Les visuels à usage interne restent exclus (arbitrage du 25/11). Sans source validée, aucune photo n’est intégrée.
3. **Nom.** Le registre parle de « Sonique », mais l’application affiche « ARIA ». Le nom commercial relève de Communication & Marketing et de la fondatrice ; il ne change qu’après validation.
4. **Cuivre et rouge de prise.** L’accent cuivre est proche du rouge réservé à l’enregistrement : 2,66:1 entre eux. L’état de prise reste identifiable par son libellé, son temps écoulé et son point, jamais par la couleur seule. Le Product Design devra confirmer cette distinction.
5. **Références.** Brume, San Roch et Dynamo Cycling servent de références d’intention uniquement : aucune reprise de leurs logos, couleurs exactes ou visuels.
6. **iOS.** Le style requiert iOS 16.2 ou plus (`color-mix`, `dvh`). Ce constat est déjà transmis pour R09-02.

## Arbitrage créatif du 26/11 (registre, 11 h 08) : avis de faisabilité

Le comparatif est piloté par le Product Design à partir de ses propositions. L’Ingénierie ne produit pas de maquettes concurrentes. Les palettes candidates de la prévisualisation 1 sont seulement des preuves techniques : la proche de « Terre & cuivre » (`?theme=cuivre`) montre que l’application se recolore entièrement, séance comprise.

| Option | Faisabilité | Travail après GO |
| --- | --- | --- |
| **Terre & cuivre** | Immédiate : même famille de jetons que la palette candidate `cuivre` | Remplacer les valeurs par celles du Product Design (bloc unique), puis contrôler les contrastes : 1 à 2 h |
| **Nuit & cuivre** | Immédiate : fond nuit (proche de la séance marine actuelle) et accent cuivre | Même travail. Point d’attention : l’accent cuivre ne doit pas se confondre avec le rouge de prise, qui reste identifiable par son libellé, son temps et son point |
| **Manrope (titres)** | En place (DA A, police variable 200 à 800) | Aucun |
| **Fraunces (titres, logotype)** | Déjà chargée : elle sert au mot « ARIA » et aux titres de l’ancienne V0.4. Bascule par un jeton (`--font-title`) | 30 min à 1 h : adapter les graisses (Fraunces est chargée en 500, 600 et 700 ; la DA A titre en 800) et vérifier la lisibilité des titres longs à 320 px et avec le texte agrandi |
| **Logotype « Sonique »** (nom de travail) | Possible en texte, en Fraunces ou Manrope, via `BRAND_NAME` ; un SVG du Product Design est préférable | 15 min en texte, 1 h en SVG. Seulement après validation du nom |

Les deux palettes et les deux polices sont compatibles avec l’architecture actuelle, sans aucune modification fonctionnelle. Une fois l’arbitrage et le GO donnés, l’intégration complète prend environ 3 à 4 h, recette et déploiement compris. Pour une prévisualisation à 00 h, le GO doit donc arriver vers 20 h au plus tard.

Sur demande, l’Ingénierie peut ajouter les deux options du Product Design à la prévisualisation (`?theme=…`, `?titres=fraunces`), pour une comparaison dans l’application réelle (environ 1 h).
