# ARIA — consignes de travail

- Dépôt de référence : `ariatestversion/Aria-`. Slogan inchangeable : « Just Play Something. »
- Application active : `src/v0/` (`AriaApp.tsx`, `pedagogy.ts`, `store.ts`, `ui.tsx`). `src/App.tsx` est un ancien prototype non monté.
- Design System : `src/design/tokens.css`, `src/design/components.css`, `src/design/Icon.tsx`, documenté dans `docs/DESIGN_SYSTEM.md`. Pas de couleur en dur dans les écrans.

## Chaque sprint

1. Branche dédiée depuis `main`. Conserver l’historique Git : pas de force-push, pas de suppression de branche.
2. Poursuivre l’existant : ne pas reconstruire l’application ni retirer de fonctionnalité acquise.
3. Vérifier : `npm run build`, `npm test`, puis `npx vite preview --port 43123` et `node scripts/e2e-sprint04.mjs`.
4. Mettre à jour `CHANGELOG.md`, `docs/SOURCE.md`, `SOURCE_VERSION.json` et les captures `docs/screenshots/sprintNN/` (`SHOTS=1`).
5. Déployer une **prévisualisation** Netlify sur le projet existant `ariafirstversion` (connecteur Netlify), puis vérifier que `/version.json` correspond au commit.
6. Aucune mise en production sans autorisation explicite.

## Contraintes produit

- Ne pas limiter ARIA au piano. Ne pas ajouter de données fictives. Pas d’API payante.
- Ne jamais inventer d’analyse audio, de score ou d’erreur musicale. Distinguer observation de l’utilisateur, règle pédagogique et analyse automatique (aujourd’hui : aucune).
- Ne jamais déclarer réalisé un test sur appareil physique qui ne l’a pas été.

## Registre des liens

- Document de référence : « ARIA — Liens de référence », https://claude.ai/artifact/RiTaMWPZDgCLgzUM7abiTG (document Claude du compte de la porteuse du projet).
- Après chaque déploiement Netlify, création ou avancée de branche, tag ou changement de production : mettre à jour ce document (tableaux Netlify et GitHub, commit, statut). Ne jamais en créer un second.
