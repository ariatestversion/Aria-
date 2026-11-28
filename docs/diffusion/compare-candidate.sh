#!/usr/bin/env bash
# Comparatif technique d’une candidate de diffusion avec la référence définitive (contre-recette QA-V2-DIFF-01, A1 et A4).
# Usage : bash scripts/compare-candidate.sh <commit-candidat> [référence=bd38ae5]
# Lecture seule : construit les deux versions dans des copies de travail temporaires, ne modifie aucune branche.
set -euo pipefail
CAND="${1:?commit candidat requis}"; REF="${2:-bd38ae5}"
ROOT="$(git rev-parse --show-toplevel)"; TMP="$(mktemp -d)"; trap 'git -C "$ROOT" worktree remove --force "$TMP/ref" 2>/dev/null; git -C "$ROOT" worktree remove --force "$TMP/cand" 2>/dev/null; rm -rf "$TMP"' EXIT

# Fichiers autorisés (libellés C-DIFF-1 et C-DIFF-2, tests et outillage) ; la documentation est ignorée.
ALLOWED='^(index\.html|vite\.config\.ts|scripts/write-version\.mjs|scripts/e2e-sprint04\.mjs|scripts/compare-candidate\.sh|src/ErrorBoundary\.tsx|src/lib/presets\.ts|src/v0/AriaApp\.tsx|src/v0/labels\.ts|src/v0/labels\.test\.ts)$'
FORBIDDEN='^src/v0/(takes|takes\.test|model|pedagogy|pedagogy\.test|store|media|metronome|auth)\.tsx?$|^src/lib/(recorder|storage)\.ts$'
IGNORED='^(docs/|CHANGELOG\.md|SOURCE_VERSION\.json|README\.md|CLAUDE\.md)'

echo "== A1 · Fichiers modifiés entre $REF et $CAND"
status=0
while read -r f; do
  [[ -z "$f" || "$f" =~ $IGNORED ]] && continue
  if [[ "$f" =~ $FORBIDDEN ]]; then echo "  INTERDIT  $f"; status=1
  elif [[ "$f" =~ $ALLOWED ]]; then echo "  prévu     $f"
  else echo "  HORS LISTE $f"; status=1; fi
done < <(git -C "$ROOT" diff --name-only "$REF" "$CAND")
echo "  Lignes de AriaApp.tsx modifiées :"; git -C "$ROOT" diff -U0 "$REF" "$CAND" -- src/v0/AriaApp.tsx | grep '^[+-][^+-]' | sed 's/^/    /' || true
echo "  Clés de stockage « aria. » touchées :"; git -C "$ROOT" diff "$REF" "$CAND" -- src | grep -E "^[+-].*['\`\"]aria\." && status=1 || echo "    aucune"

echo "== A4 · « Aria » / « ARIA » dans l’application construite"
for side in ref cand; do
  rev=$REF; [[ $side == cand ]] && rev=$CAND
  git -C "$ROOT" worktree add -q --detach "$TMP/$side" "$rev"
  ln -s "$ROOT/node_modules" "$TMP/$side/node_modules"
  (cd "$TMP/$side" && npm run -s build >/dev/null 2>&1)
done
hits=$(grep -o -E "[^a-zA-Z0-9_.-]A(ria|RIA)[^a-zA-Z0-9_-][^\"'\`<]{0,30}" -r "$TMP/cand/dist" --include=*.js --include=*.html --include=*.json | grep -v "aria-" || true)
if [[ -n "$hits" ]]; then echo "$hits" | sed 's/^/  VISIBLE? /'; status=1; else echo "  aucun texte « Aria » / « ARIA » (restent admis : attributs aria-*, clés aria., balise meta aria-build)"; fi

echo "== Différences de l’application construite (dist)"
(cd "$TMP/ref/dist" && find . -type f ! -name version.json -exec sha256sum {} + | sort -k2) > "$TMP/ref.sum"
(cd "$TMP/cand/dist" && find . -type f ! -name version.json -exec sha256sum {} + | sort -k2) > "$TMP/cand.sum"
diff <(awk '{print $2}' "$TMP/ref.sum") <(awk '{print $2}' "$TMP/cand.sum") | sed 's/^/  /' || true
echo "  Taille JS : $(du -cb "$TMP"/ref/dist/assets/*.js | tail -1 | cut -f1) → $(du -cb "$TMP"/cand/dist/assets/*.js | tail -1 | cut -f1) octets"
echo "  Photos et polices identiques : $(cmp -s <(grep -E 'webp|woff' "$TMP/ref.sum" | awk '{print $1}') <(grep -E 'webp|woff' "$TMP/cand.sum" | awk '{print $1}') && echo oui || echo NON)"

echo; [[ $status == 0 ]] && echo "Résultat : conforme au périmètre C-DIFF" || echo "Résultat : ÉCART À EXAMINER"
exit $status
