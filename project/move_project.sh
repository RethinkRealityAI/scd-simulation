#!/usr/bin/env bash
# Move project folder to scd-simulation preserving git history when possible
set -euo pipefail
PROJECT_DIR="project"
TARGET_DIR="scd-simulation"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "Error: $PROJECT_DIR does not exist in repo root."
  exit 1
fi

if [ -d "$TARGET_DIR" ]; then
  echo "Error: $TARGET_DIR already exists. Aborting to avoid overwrite."
  exit 1
fi

# Try git mv first (preserves history)
if git rev-parse --git-dir > /dev/null 2>&1; then
  set +e
  git mv "$PROJECT_DIR" "$TARGET_DIR"
  MV_STATUS=$?
  set -e
  if [ $MV_STATUS -eq 0 ]; then
    git add -A
    git commit -m "Move project -> scd-simulation"
    echo "Moved with git mv and committed."
    exit 0
  fi
fi

# Fallback: copy files, preserve mode and timestamps
mkdir -p "$TARGET_DIR"
rsync -a --exclude='.git' "$PROJECT_DIR/" "$TARGET_DIR/"

git add "$TARGET_DIR"
git rm -r --cached "$PROJECT_DIR" || true
rm -rf "$PROJECT_DIR"

git add -A
git commit -m "Move project -> scd-simulation (fallback copy)"

echo "Moved by copy fallback and committed."
