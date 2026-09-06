# GitHub Setup & New Laptop Migration Guide

## Overview
This guide documents the process of pushing your B2 Backend Application code to GitHub and setting it up on a new laptop.

---

## Part 1: Pushing Code to GitHub (Current Laptop)

### Prerequisites
- Git installed and configured locally
- GitHub account created
- SSH keys configured for GitHub (recommended) or use HTTPS credentials
- Repository already created on GitHub: `YashDixit04/SAAS-Backend-Application`

### Step 1: Initialize Git Repository
```bash
git init
```
This creates a new `.git` directory in your project, enabling version control.

### Step 2: Stage Files
```bash
git add README.md
```
Adds the README.md file to the staging area. To add all files, use:
```bash
git add .
```

### Step 3: Create Initial Commit
```bash
git commit -m "first commit"
```
Creates your first commit with a commit message.

### Step 4: Rename Branch to Main
```bash
git branch -M main
```
Renames the current branch (usually `master`) to `main` (GitHub's default).

### Step 5: Add Remote Repository
```bash
git remote add origin git@github.com:YashDixit04/SAAS-Backend-Application.git
```
Links your local repository to the remote GitHub repository using SSH.
- Use SSH (`git@github.com:...`) if SSH keys are configured
- Use HTTPS (`https://github.com/...`) as alternative if SSH is not set up

### Step 6: Push to GitHub
```bash
git push -u origin main
```
Pushes your code to GitHub and sets `origin/main` as the default upstream branch.
- `-u` flag sets the upstream tracking branch

### Verify Successful Push
- Visit: `https://github.com/YashDixit04/SAAS-Backend-Application`
- Confirm files appear in the repository

---

## Part 2: Cleaning Up Current Laptop (Optional)

### Backup First
Before deletion, ensure:
- Code is successfully pushed to GitHub
- All important local changes are committed
- You have a backup copy if needed

### Remove Local Repository
```bash
# Option 1: Delete the entire project folder
rm -r d:\atozFullcode\b2-backend

# Option 2: Delete only git history (keeps files)
rm -r d:\atozFullcode\b2-backend\.git
```

---

## Part 3: Setting Up on New Laptop

### Step 1: Navigate to Projects Directory
```bash
cd /path/to/your/projects
```

### Step 2: Clone Repository
```bash
git clone git@github.com:YashDixit04/SAAS-Backend-Application.git
cd SAAS-Backend-Application
```

### Step 3: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 4: Configure Environment
- Copy `.env` file (if not committed to GitHub)
- Update environment variables for new laptop
- Configure database connections

### Step 5: Setup Prisma
```bash
npx prisma generate
npx prisma migrate dev
```

### Step 6: Verify Setup
```bash
npm run start
# or
npm run dev
```

Check if the application starts successfully.

---

## SSH Configuration (If Using SSH)

### Generate SSH Keys (New Laptop Only)
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

### Add SSH Key to SSH Agent
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Add Public Key to GitHub
1. Copy public key: `cat ~/.ssh/id_ed25519.pub`
2. Go to: `GitHub Settings > SSH and GPG keys > New SSH key`
3. Paste and save

---

## Troubleshooting

### Authentication Failed
- Verify SSH keys are configured on GitHub
- Test connection: `ssh -T git@github.com`
- For HTTPS, ensure credentials are saved in Git Credential Manager

### Push Rejected
- Pull latest changes: `git pull origin main`
- Resolve conflicts if any
- Try push again: `git push -u origin main`

### Connection Timeout
- Check internet connection
- Verify firewall/proxy settings
- Try HTTPS instead of SSH

---

## Additional Tips

### .gitignore
Ensure sensitive files are not committed:
```
.env
node_modules/
dist/
*.log
.DS_Store
```

### Environment Variables
Move `.env` to `.env.example` and document required variables:
```
DATABASE_URL=
JWT_SECRET=
GITHUB_TOKEN=
```

### Database Backups
- For production, backup database before migration
- Use Prisma snapshots or database exports
- Document backup procedures

---

## Command Reference

| Task | Command |
|------|---------|
| Initialize repository | `git init` |
| Clone repository | `git clone <url>` |
| Check status | `git status` |
| View commit history | `git log --oneline` |
| Create new branch | `git checkout -b <branch-name>` |
| Switch branch | `git checkout <branch-name>` |
| Merge branch | `git merge <branch-name>` |
| Pull latest changes | `git pull origin main` |
| Push changes | `git push origin main` |

---

## Next Steps

1. ✅ Execute git commands to push code
2. ✅ Verify repository on GitHub
3. ⬜ Backup or delete local copy
4. ⬜ Clone on new laptop
5. ⬜ Install dependencies
6. ⬜ Configure environment
7. ⬜ Test application
