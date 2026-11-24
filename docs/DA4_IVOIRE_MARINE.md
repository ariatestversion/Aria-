# DA 4 — Ivoire & marine · direction artistique de référence

**Statut (23/11/2026)** : retenue officiellement comme direction artistique de référence d’ARIA, **sous réserve de la validation finale sur mobile**. Elle n’est pas encore appliquée par défaut : dans la prévisualisation, le thème par défaut reste Marine (DA 1), et la DA 4 s’ouvre avec `?theme=ivoire` ou depuis Profil → Direction visuelle.

- Prévisualisation figée : https://6b049602aae77d02d0479a31--ariafirstversion.netlify.app/?theme=ivoire
- Code : branche `claude/da-preview`, commit applicatif `14723ee` (les commits suivants ne changent que la documentation).
- Source dans le code : `src/design/tokens.css` (bloc `[data-brand='ivoire']`) et `src/design/components.css` (règles `[data-brand='ivoire']`).

## 1. Palette

### Couleurs identitaires

| Nom | HEX | Rôle | Où dans l’app |
| --- | --- | --- | --- |
| Ivoire | `#F7F3EA` | Fond principal | Fond des écrans, barre de navigation, colonne de contenu sur ordinateur |
| Gris clair | `#ECEEF1` | Surfaces secondaires | Cartes de liste, prises, accès rapides, panneaux d’outils ; marges latérales sur ordinateur (≥ 840 px) |
| Gris clair foncé | `#E2E5EA` | Surface en creux | Fond des contrôles segmentés |
| Bleu ciel | `#CFE3F5` | Accents et états sélectionnés | Chips, options et instruments sélectionnés, onglet actif, bouton de la carte de reprise, libellés sur marine, badge « Étape n sur N » |
| Marine | `#152642` | Cartes principales et consignes | Carte « Reprendre », bloc de consigne de séance, boutons principaux, bouton d’enregistrement au repos |
| Marine clair | `#22365C` | Dégradé | Haut du visuel de reprise, haut de l’écran de bienvenue |
| Anthracite | `#1C1E22` | Textes, navigation, structure | Textes, icônes, contours, navigation ; erreurs et suppression |
| Gris de texte | `#4F5560` | Texte secondaire | Métadonnées, aides, sous-titres |
| Bordure de champ | `#7D8592` | Contour des champs | Champs de saisie (fond blanc `#FFFFFF`) |
| Rouge | `#C62828` | **Enregistrement uniquement** | Bouton « Arrêter · 00:12 », point clignotant, badge REC |

### Couleurs d’état (hors palette DA 4, conservées de la V0.4)

| État | HEX texte / fond | Usage |
| --- | --- | --- |
| Réussite | `#2F6B45` sur vert 12 % | « Oui, réussi », séance terminée, « Ce qui fonctionne » |
| Vigilance / axe de travail | `#8A5A00` (texte), `#D79A1A` (bordures) | « Pas encore », « Ce qui mérite d’être travaillé » |

### Contrastes vérifiés (WCAG)

| Paire | Ratio | Seuil |
| --- | --- | --- |
| Anthracite sur ivoire | 15,07:1 | AA texte ✔ |
| Anthracite sur gris clair | 14,36:1 | AA texte ✔ |
| Gris de texte sur ivoire | 6,77:1 | AA texte ✔ |
| Gris de texte sur gris clair | 6,45:1 | AA texte ✔ |
| Blanc sur marine | 15,13:1 | AA texte ✔ |
| Bleu ciel sur marine | 11,50:1 | AA texte ✔ |
| Anthracite sur bleu ciel | 12,68:1 | AA texte ✔ |
| Blanc sur rouge | 5,62:1 | AA texte ✔ |
| Bordure de champ sur ivoire | 3,36:1 | 3:1 composants ✔ |
| Gris clair sur ivoire | 1,05:1 | ✘, d’où une bordure `rgba(28,30,34,.12)` sur chaque carte gris clair |

## 2. Règles d’utilisation des couleurs

1. **Le rouge signifie « enregistrement en cours », et rien d’autre.** Au repos, le bouton d’enregistrement est marine ; il passe au rouge pendant la prise, avec le libellé « Arrêter » et le temps écoulé.
2. **Erreur et suppression sans rouge** : texte et contour anthracite, icône d’alerte et libellé explicite (« Micro refusé. », « Oui, supprimer »).
3. **Le marine porte ce qui compte** : la carte principale de l’accueil, la consigne de séance et l’action principale. Un seul aplat marine dominant par écran.
4. **Le bleu ciel montre ce qui est choisi** (sélection, onglet actif) ou l’action dans une carte marine. Jamais pour du texte courant sur ivoire.
5. **Le gris clair distingue les surfaces secondaires**, toujours avec une bordure fine, puisqu’il ne se voit pas seul sur l’ivoire.
6. **L’anthracite structure** : textes, icônes, navigation, contours.
7. **Jamais de couleur seule** : chaque état coloré a un libellé ou une icône.

## 3. Typographie

| Rôle | Police | Taille / interligne | Graisse |
| --- | --- | --- | --- |
| Titre d’accueil (« Envie de jouer ? ») | Manrope | 32–36 px / 1,18 | 700 |
| Titre d’écran | Manrope | 28–32 px / 1,18 | 700 |
| Titre de carte / de consigne | Manrope | 24 px / 30 | 700 |
| Titre de section (« Mes accès rapides ») | Manrope | 18 px / 24 | 700, casse normale |
| Corps de texte | Manrope | 16 px / 24 | 500 |
| Métadonnées, libellés | Manrope | 13 px / 18 | 600–700 |
| Navigation | Manrope | 11,5 px | 700 |
| Mot-symbole « ARIA » | Fraunces (logo existant) | — | — |

Manrope et Fraunces sont sous licence SIL Open Font License 1.1, chargées depuis Google Fonts. **Le nom public et le logo restent à valider.**

## 4. Composants

| Composant | Rendu DA 4 |
| --- | --- |
| Carte de reprise (accueil) | Rayon 22 px. Visuel de vagues bleu ciel sur dégradé marine (sans photo). Aplat marine, libellé bleu ciel, titre blanc, bouton bleu ciel « Reprendre », texte anthracite. |
| Bloc de consigne (séance) | Aplat marine, rayon 22 px. Titre blanc. Libellés « Consigne », « Comment », « Critère de réussite » en bleu ciel. |
| Bouton principal | Marine, texte blanc, hauteur 52 px, rayon 14 px |
| Bouton secondaire | Contour marine 1,5 px, texte marine |
| Bouton d’enregistrement | Pleine largeur, 52 px. Au repos : marine « Enregistrer une prise ». En cours : rouge « Arrêter · mm:ss », point clignotant, statut « Enregistrement en cours » en rouge. |
| Cartes de liste, prises, accès rapides | Gris clair, bordure fine, rayon 16 px, sans ombre |
| Chips, options, instruments | Au repos : gris clair, contour. Sélectionnés : bleu ciel, contour anthracite, coche. |
| Champs | Fond blanc, bordure `#7D8592`, rayon 14 px, libellé visible au-dessus |
| Barre de navigation | Fond ivoire, 70 px + zone sûre, icônes et libellés anthracite, onglet actif sur bleu ciel |
| Vignettes de morceau | Vagues abstraites marine sur bleu ciel, beige `#E6DFCF` ou gris `#DDE1E7` |
| Alertes d’erreur | Contour et texte anthracite, fond gris clair, icône d’alerte |
| Focus clavier | Double anneau : ivoire 2 px puis marine 2 px |
| Cibles tactiles | 44 × 44 px minimum |

## 5. Points d’interprétation à confirmer

- **Navigation en anthracite** : appliquée aux icônes et libellés, sur fond ivoire. Une barre entièrement anthracite reste possible.
- **Panneaux latéraux sur ordinateur** : l’app n’en a pas, et sa structure n’a pas changé. Ce sont les marges autour de la colonne qui passent en gris clair.
- **Vert et jaune** pour les états : ils ne sont pas dans la palette décrite et sont conservés de la V0.4.
