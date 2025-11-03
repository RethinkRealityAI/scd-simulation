# Deployment Guide

This document explains how to move the project directory to `scd-simulation` and deploy to Netlify.

## Move the project folder (optional scripts)

Unix:

```bash
./move_project.sh
```

Windows PowerShell:

```powershell
./move_project.ps1
```

Both scripts attempt to preserve Git history using `git mv`. If that fails they copy and commit the files.

## Netlify configuration

Option A: Commit netlify.toml at repository root with the following content:

```
[build]
  base = "scd-simulation"
  publish = "dist"
  command = "npm run build"
```

Option B: Configure through Netlify UI

- Build command: npm run build
- Publish directory: dist
- Base directory: scd-simulation

## Build & deploy locally

```bash
cd scd-simulation
npm ci
npm run build
# Option 1: Netlify CLI
npx netlify-cli deploy --prod --dir=dist
# Option 2: Push to GitHub and let Netlify auto-deploy (ensure base dir is set)
```

## Notes

- Update any CI/workflow files that reference `project/*` to `scd-simulation/*`.
- If you use absolute paths in scripts or docs, update them accordingly.
