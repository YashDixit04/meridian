# New Laptop Setup Guide (Frontend Project)

Use this checklist when moving to a new laptop after pushing your code to GitHub.

## 1) Before wiping old laptop (final safety check)

- Push latest code to GitHub.
- Push all important branches (not only main/master).
- Save `.env` / `.env.local` values (API URLs, keys, secrets).
- Save any local files not tracked by git.

Quick verification commands:

```bash
git status
git branch -a
git push --all
git push --tags
```

## 2) Install required tools on new laptop

- Git
- Node.js (LTS)
- VS Code
- Package manager used by this repo:
  - npm (default), or
  - yarn, or
  - pnpm

Recommended checks:

```bash
git --version
node -v
npm -v
```

## 3) Clone the project

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

If you use multiple branches:

```bash
git fetch --all
git branch -a
```

## 4) Install dependencies

Use only one package manager (the one your project uses).

```bash
npm install
```

or

```bash
yarn
```

or

```bash
pnpm install
```

## 5) Recreate environment files

Create the same env file(s) you had before:

- `.env`
- `.env.local`
- any other environment-specific file used by your project

Example:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_APP_NAME=MyApp
```

Note: Env files are usually not pushed to GitHub, so this step is mandatory.

## 6) Run the app

For Vite projects:

```bash
npm run dev
```

Then open the URL shown in terminal (commonly `http://localhost:5173`).

## 7) Validate project health

```bash
npm run build
```

If tests exist:

```bash
npm test
```

Optional lint/type checks:

```bash
npm run lint
npm run typecheck
```

## 8) Optional: set up GitHub auth on new laptop

- Sign in to GitHub in browser.
- Configure Git identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

- Use either:
  - HTTPS + Personal Access Token, or
  - SSH key setup for GitHub

## 9) Common problems and fixes

- `npm install` fails:
  - Delete `node_modules` and lock file only if needed, then reinstall.
- Wrong Node version:
  - Install required version (use nvm/nvm-windows if needed).
- App starts but API fails:
  - Recheck env values and API URL.
- Build fails but dev works:
  - Run `npm run build` and fix strict TypeScript/build errors.

## 10) Fast copy-paste workflow

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
npm run dev
```

After this, add your `.env` values and run `npm run build`.
