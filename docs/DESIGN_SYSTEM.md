# ARIA — Design System (Sprint 04)

Source unique : `src/design/tokens.css` (fondations) et `src/design/components.css` (composants `ds-*`).
Icônes : `src/design/Icon.tsx`. Composants React réutilisables : `src/v0/ui.tsx`
(lecteur de prise, enregistreur, métronome, minuteur, badges, sources).

La mise en page propre à chaque écran reste dans `src/v0/aria-v0.css` et ne consomme que des tokens.

## 1. Couleurs

### Identité (marque) — `--id-*`

| Token | Crème / espresso / or (par défaut) | Variante marine (aperçu) | Usage |
| --- | --- | --- | --- |
| `--id-bg` | `#f5f0e6` crème | `#f4f1ea` | Fond d’application |
| `--id-surface` | `#fbf7f0` | `#fbfaf6` | Cartes, champs |
| `--id-surface-sunken` | `#efe7da` | `#e8e6df` | Fond des segments |
| `--id-ink` / `--id-primary` | `#3c2a21` espresso | `#152642` marine | Texte, bouton principal, sélection |
| `--id-accent` | `#b08a45` or | `#b08a45` or | Accent, critère de réussite, règles ARIA |
| `--id-accent-ink` | `#7a5a1f` | `#6f5219` | Texte sur fond or léger |

**Variante marine `#152642` : préparée, pas appliquée.** Elle s’active seulement :
- avec `?brand=marine` dans l’URL (retour : `?brand=default`) ;
- ou dans **Profil → Apparence (aperçu)**.

Le choix est mémorisé sur l’appareil uniquement. Seules les couleurs identitaires changent.

### Fonctionnel (sens) — `--fn-*`

| Sens | Token | Traitement | Toujours accompagné de |
| --- | --- | --- | --- |
| Réussite, confirmation | `--fn-success` `#2f6b45` | Badge vert clair, bordure gauche verte, bouton contour | Icône ✓ + libellé (« Oui, réussi », « Terminée », « Ce qui fonctionne ») |
| Vigilance, axe de travail | `--fn-warning` `#8a5a00` (texte) / `--fn-warning-strong` `#d79a1a` (surfaces) | Badge jaune, bordure gauche jaune | Icône cible / reprise + libellé (« Pas encore », « Ce qui mérite d’être travaillé ») |
| Erreur | `--fn-error` `#b42318` | **Contour** rouge + fond très léger | Icône ⚠ + titre (« Micro refusé. », « Erreur d’enregistrement. ») |
| Enregistrement | `--fn-record` `#d92d20` | **Plein** rouge + point clignotant + halo pulsé | Libellé « REC · enregistrement en cours » et « Arrêter » |

Erreur et enregistrement sont tous deux rouges, mais leurs traitements diffèrent : contour pour l’erreur, plein et animé pour l’enregistrement.

Aucune information n’est portée **uniquement** par la couleur. La barre d’étapes colorée est doublée par :
- le texte « Étape n sur N » ;
- les badges « Réussi » et « À reprendre » du programme complet.

### Contrastes (WCAG, sur fond crème)

| Couleur | Ratio |
| --- | --- |
| `--ink` | 12,9:1 |
| `--ink-muted` | ≥ 4,9:1 |
| `--ink-faint` | 4,6:1 |
| `--fn-success` | 5,6:1 |
| `--fn-warning` | 5,2:1 |
| `--fn-error` | 5,8:1 |
| Blanc sur `--fn-record` | 4,8:1 |

## 2. Typographie

| Rôle | Police | Token / classe |
| --- | --- | --- |
| Textes fonctionnels, boutons, consignes, libellés | **Manrope** | `--font-sans` (défaut de `body`) |
| Marque et titres d’écran (`.ds-h1`, slogan) | Fraunces | `--font-display` |

Échelle :

| Token | Taille |
| --- | --- |
| `--fs-display` | 1,6–2 rem |
| `--fs-title` | 1,25 rem |
| `--fs-subtitle` | 1,05 rem |
| `--fs-body` | 1 rem |
| `--fs-small` | 0,9 rem |
| `--fs-caption` | 0,78 rem |

Graisses : 500 / 600 / 700 / 800.

Les consignes de séance sont en Manrope (`.ds-body-lg`), jamais en Fraunces.

## 3. Espacements et dimensions

- Échelle de 4 px : `--sp-1` (4) · `--sp-2` (8) · `--sp-3` (12) · `--sp-4` (16) · `--sp-5` (20) · `--sp-6` (24) · `--sp-8` (32) · `--sp-10` (40).
- Page : marge latérale `--page-x` = 16 px, largeur maximale `--page-max` = 560 px. La largeur est identique sur tous les écrans ; la hauteur suit le contenu.
- **Zone tactile minimale : `--touch` = 44 px.** Elle s’applique aux boutons, chips, segments, boutons-icônes, curseurs de lecture et résumés repliables. Elle est vérifiée automatiquement par `scripts/e2e-sprint04.mjs`.
- Boutons : `--btn-h` = 52 px ; `--btn-h-sm` = 44 px. Champs : `--field-h` = 48 px.
- Icônes : 18 / 20 / 26 px (`--icon-sm`, `--icon`, `--icon-lg`), trait 1,7 px.

## 4. Rayons, bordures, ombres

- Rayons : `--r-sm` 10 · `--r-md` 14 · `--r-lg` 18 · `--r-xl` 22 · `--r-pill`.
- Bordures : `--bw` 1 px (cartes) · `--bw-strong` 1,5 px (contrôles).
- Ombres : `--shadow-1` (cartes) · `--shadow-2` (carte d’étape, éléments mis en avant).

## 5. États interactifs

| État | Rendu |
| --- | --- |
| Focus clavier | Anneau or `--focus-ring` sur tout élément interactif (`:focus-visible`) |
| Sélectionné | Fond `--id-primary` + texte `--id-on-primary` + `aria-pressed="true"` ; ✓ sur les chips d’objectifs |
| Désactivé | Opacité 45 % + `cursor: not-allowed` |
| Appui | Échelle 0,98 |
| En lecture | Badge « En lecture » + bouton « Pause » + bordure or |
| Enregistrement | Voir « Enregistrement » ci-dessus ; badge REC dans la barre de navigation si l’on quitte l’écran |

## 6. Composants

| Classe / composant | Rôle |
| --- | --- |
| `.ds-btn` + `--primary`, `--secondary`, `--quiet`, `--danger`, `--success-outline`, `--warning-outline`, `--sm`, `--fit` | Boutons |
| `.ds-iconbtn` | Bouton-icône 44 px, toujours avec `aria-label` |
| `.ds-chip`, `.ds-seg`, `.ds-option` | Choix multiples, segments, options détaillées |
| `.ds-card`, `.ds-row-card` | Cartes et lignes de liste |
| `.ds-badge--{success, warning, error, record, neutral, accent}` | Statuts |
| `.ds-source--{user, self-check, rules, facts, none}` | Origine de l’information dans le bilan |
| `.ds-alert--{info, success, warning, error}` | Messages |
| `.ds-stepcard`, `.ds-criterion`, `.ds-steps` | Écran Séance |
| `.ds-feed--{success, warning, rules}` | Rubriques du bilan |
| `<TakePlayer>` | Lecture / Pause libellées, curseur, durée, suppression avec confirmation |
| `<RecordPanel>` | Enregistrer / Arrêter, chronomètre, micro refusé + Réessayer |
| `<MetronomePanel>` | Métronome Web Audio local, ±4 BPM |
| `<StepTimer>` | Minuteur de l’étape |

## 7. Règles d’usage

1. Ne jamais écrire une couleur en dur dans un écran : utiliser un token.
2. Une couleur fonctionnelle s’accompagne toujours d’un libellé ou d’une icône.
3. Toute action destructive (supprimer une prise) passe par une confirmation explicite.
4. Les informations du bilan affichent leur source : observation de l’utilisateur, auto-évaluation, règle ARIA ou donnée factuelle. L’analyse automatique est déclarée absente.
