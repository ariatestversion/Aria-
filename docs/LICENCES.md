# Licences — médias (état au Sprint 04 / V0.4)

**Statut : non validé.** Aucune vérification juridique n’a été faite. Claude a inventorié les fichiers et relevé les sources notées dans le dépôt, mais n’a ni vérifié ni obtenu aucun droit. Ces médias ne doivent pas être présentés comme libres de droits.

## Médias affichés par l’application V0.4

| Fichier | Usage dans V0.4 | Source connue | Statut |
| --- | --- | --- | --- |
| `public/presets/clair-de-lune.jpg` | Fond de l’écran d’accueil, vignette par défaut des morceaux | Aucune source notée | **À vérifier** |
| `public/presets/the-entertainer.jpg` | Carte « Commencer » de l’accueil, vignette démo « Nocturne » | Aucune source notée | **À vérifier** |
| `public/presets/lettre-a-elise.png` | Vignette démo « Gymnopédie » | Aucune source notée | **À vérifier** |
| `public/instruments/{piano,guitare,basse}-dessin.png` | Onboarding (choix d’instruments) | Illustrations produit | **Droits internes à confirmer** |

## Médias publiés mais non utilisés par V0.4

Ils restent dans `public/` : ils sont donc **publiés et accessibles par URL**, sur la prévisualisation comme en production. Seul l’ancien prototype `src/App.tsx`, non monté, les référence.

| Fichier | Source notée dans le dépôt | Conséquence |
| --- | --- | --- |
| `public/presets/clair-de-lune.mp3` | Archive.org « ClairDeLunedebussy » — **CC BY-ND 3.0** | Attribution obligatoire, aucune modification ; non affichée |
| `public/presets/lettre-a-elise.mp3` | Jamendo / Archive.org jamendo-325328 — StasNick — **CC BY-SA 3.0** | Attribution obligatoire, partage à l’identique ; non affichée |
| `public/presets/the-entertainer.mp3` | Archive.org, enregistrement historique — licence non vérifiée (« check item page ») | **À vérifier** |
| `public/presets/ode-to-joy.wav` | Aucune source notée | **À vérifier** |
| `public/presets/ode-to-joy.svg`, `ode-to-joy-beginner-placeholder.svg` | Arrangement débutant, source non notée | **À vérifier** |

Les compositions (Debussy, Beethoven, Joplin, Chopin, Satie) sont dans le domaine public en tant qu’œuvres. En revanche, leurs **enregistrements** et les **images** peuvent être protégés.

## Recommandations (non appliquées, en attente de décision)

1. Avant toute mise en production, choisir pour chaque média : prouver la licence, remplacer le média, ou le retirer de `public/`.
2. Pour les enregistrements CC BY-ND et CC BY-SA, s’ils sont conservés : afficher l’attribution (auteur, titre, licence, lien) ou les retirer, puisque V0.4 ne les utilise pas.
3. Documenter la provenance des 3 images affichées et des illustrations d’instruments.

Aucun média n’a été modifié, ajouté ni retiré au Sprint 04.
