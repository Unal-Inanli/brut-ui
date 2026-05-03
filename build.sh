#!/usr/bin/env bash
# build.sh — thin shim for backwards compatibility.
# The canonical build command is now: pnpm build
set -euo pipefail
npx vite build "$@"
