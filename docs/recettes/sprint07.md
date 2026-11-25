# Registre de recette — Sprint 07 · Intégration et consolidation

Branche `claude/sprint07-integration`. Référence de non-régression : Alpha V0.6 (`67aa241`), 37 unitaires et 136 contrôles e2e.
**Sprint non clôturé** : recette indépendante et décision du Head of Product requises.

## Lot B — prévisualisation 1 (25/11)

Résultats automatisés (Chromium, micro **simulé**) : unitaires **44/44**, e2e **168/168** (dont 31 contrôles nouveaux du lot B et les 136 contrôles V0.6 rejoués, adaptés au nouveau comportement sans affaiblir les assertions).

| Test Phase 5 | Partie automatisée (Chromium) | Résultat | Reste à faire (humain / appareil réel) |
| --- | --- | --- | --- |
| T03 Prise active | Toucher et clavier sur Suivi / Profil pendant la prise : message, maintien en séance, onglets `aria-disabled` reliés au message ; étape suivante indisponible avec texte ; pas de bilan anticipé ; navigation rétablie après l’arrêt ; mise en page sans masquage | Réussi | VoiceOver et toucher sur iPhone réel |
| T04 Protection des brouillons | Blackbird étape 2, 3 prises, minuteur et note ; Gymnopédie → arbitrage ; Reprendre ; échec de sauvegarde forcé (reste sur place, message) ; Garder et changer ; aucune prise héritée ; rechargement ; reprise depuis le Suivi : étape, temps restant, note, prises ; même morceau : séance mise de côté puis reprise | Réussi | Fermeture réelle de Safari et micro réel sur iPhone |
| T05 Prises | Deux prises même tempo comparables ; une à un autre tempo hors comparaison avec motif ; métadonnées « passage · tempo · durée » ; une lecture à la fois ; règles unitaires (même prise, passage différent, valeurs manquantes, séances différentes, illisible) | Réussi | Audio réel |
| T06 Arrêt, vide, illisible | Prise vide : rien sauvegardé, message, réessai ; média illisible : pas de faux succès, conservé et signalé ; micro refusé puis autorisé, interruption, arrière-plan (contrôles V0.6) | Réussi (simulé) | iPhone et Android réels |
| T10 Historique | Terminer remplace le brouillon ; nouvelle séance du même morceau sans prise héritée ; comptes isolés, PDF ouvrable (V0.6) | Réussi | — |
| T02 Pédagogie | Contrôle exhaustif de plus de 10 000 programmes (V0.6) inchangé | Réussi | — |
| T01, T07, T08, T09, T11 | Après le lot C | — | — |

Aucun test sur appareil physique n’a été réalisé.
