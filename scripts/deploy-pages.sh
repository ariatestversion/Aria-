#!/usr/bin/env bash
# Publish the compiled app to GitHub Pages.
# Intended URL: https://try-aria.github.io/app/
# Create the GitHub org/user `try-aria` and repo `app` first.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VITE_BASE=/app/ VITE_THEME_MODE=noir npm run build:noir

DIST="$ROOT/dist-noir"
touch "$DIST/.nojekyll"
cp "$DIST/index.html" "$DIST/404.html"

REPO="${GITHUB_PAGES_REPO:-https://github.com/try-aria/app.git}"
npx gh-pages -d dist-noir --dotfiles --repo "$REPO"

echo "Published: https://try-aria.github.io/app/"
