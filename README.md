# ARIA — Just Play Something.

Application de pratique musicale (React + Vite + TypeScript) : travailler ses morceaux sans professeur.

## Dépôt source

Dépôt de référence : https://github.com/ariatestversion/Aria- (`main`). Voir [`docs/SOURCE.md`](docs/SOURCE.md).

## Démarrage

```bash
npm install
cp .env.example .env.local   # optionnel (Supabase anon)
npm run dev
```

## Vérifications

```bash
npm run build                 # TypeScript + Vite, génère public/version.json
npm test                      # tests unitaires (Vitest)
npx vite preview --port 43123 &
npm run e2e                   # parcours mobile Playwright (micro simulé)
```

## Documentation

- [`CHANGELOG.md`](CHANGELOG.md)
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — couleurs, typographie, espacements, composants
- [`docs/recettes/sprint04.md`](docs/recettes/sprint04.md) — registre de recette (automatisé, physique, à faire)
- [`docs/BILAN_SPRINT04.md`](docs/BILAN_SPRINT04.md) — bilan du prototype V0.4
- [`docs/LICENCES.md`](docs/LICENCES.md) — contenus audio/images encore à vérifier

## Publication

- Netlify : projet `ariafirstversion`. Une prévisualisation est publiée à chaque sprint ; la production n’est mise à jour qu’après validation.
- `npm run build` génère `public/version.json` (SHA du commit) pour faire correspondre GitHub et Netlify.
