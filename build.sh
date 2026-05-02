#!/usr/bin/env bash
# build.sh — concatenate sources into dist/.
#   dist/brut.css = src/tokens.css + src/components.css
#   dist/brut.js  = src/js/core.js + src/js/components/*.js (alphabetical)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$ROOT/src"
DIST="$ROOT/dist"
CSS_OUT="$DIST/brut.css"
JS_OUT="$DIST/brut.js"

mkdir -p "$DIST"

VERSION="$(node -p "require('$ROOT/package.json').version" 2>/dev/null || echo "0.0.0")"
DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# ---- CSS bundle -------------------------------------------------
{
  printf "/*!\n * BRUT v%s — neo-brutalist HTML+CSS UI kit\n * Built %s\n * Bundle: src/tokens.css + src/components.css\n */\n\n" "$VERSION" "$DATE"
  cat "$SRC/tokens.css"
  printf "\n\n"
  cat "$SRC/components.css"
} > "$CSS_OUT"

CSS_BYTES="$(wc -c < "$CSS_OUT" | tr -d ' ')"
printf "built %s (%s bytes)\n" "${CSS_OUT#$ROOT/}" "$CSS_BYTES"

# ---- JS bundle --------------------------------------------------
# core.js must come first; component files load alphabetically.
if [ -f "$SRC/js/core.js" ]; then
  {
    printf "/*!\n * BRUT v%s — runtime\n * Built %s\n * Bundle: src/js/core.js + src/js/components/*.js\n */\n\n" "$VERSION" "$DATE"
    sed "s/__BRUT_VERSION__/$VERSION/" "$SRC/js/core.js"
    printf "\n"
    if [ -d "$SRC/js/components" ]; then
      for f in "$SRC"/js/components/*.js; do
        [ -e "$f" ] || continue
        printf "\n/* --- %s --- */\n" "$(basename "$f")"
        cat "$f"
        printf "\n"
      done
    fi
  } > "$JS_OUT"

  JS_BYTES="$(wc -c < "$JS_OUT" | tr -d ' ')"
  printf "built %s (%s bytes)\n" "${JS_OUT#$ROOT/}" "$JS_BYTES"
fi
