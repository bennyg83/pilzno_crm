# Collaboration Setup Guide

This guide explains how to set up collaboration with your friend on the Pilzno CRM project.

## 👥 Adding Collaborators

### Step 1: Add Friend to GitHub Repository

1. Go to: https://github.com/bennyg83/pilzno_crm
2. Click **Settings** → **Collaborators** (left sidebar)
3. Click **Add people**
4. Enter your friend's GitHub username or email
5. Set permissions:
   - **Write** access (can push to repository)
   - Or **Admin** if you want them to manage settings
6. Send invitation

### Step 2: Friend Accepts Invitation

1. Friend receives email invitation
2. Friend clicks **Accept invitation**
3. Friend can now clone and push to repository

## 🌿 Branch Strategy for Collaboration

### Recommended Workflow

**Main Branch**: Production/Live
- Only merge tested code
- Auto-deploys to GitHub Pages
- Protected (optional - can require reviews)

**Dev Branch**: Development
- Everyone works here
- Test new features
- Merge to main when ready

### Individual Feature Branches (Optional)

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Work on feature
# ... make changes ...

# Push feature branch
git push origin feature/your-feature-name

# Merge to dev when complete
git checkout dev
git merge feature/your-feature-name
git push origin dev
```

## 🔄 Collaboration Workflow

### Daily Workflow

1. **Start of day:**
   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Make changes:**
   ```bash
   # Work on your changes
   # Test locally
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Feature: Description of changes"
   git push origin dev
   ```

4. **If conflicts occur:**
   ```bash
   # Pull latest changes
   git pull origin dev
   
   # Resolve conflicts
   # Edit conflicted files
   
   # Commit resolution
   git add .
   git commit -m "Merge: Resolved conflicts"
   git push origin dev
   ```

## 🔐 Git Configuration

### Initial Setup (One-time)

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"
```

### Per-Repository Setup

```bash
cd pilzno_crm

# Set name for this repo only
git config user.name "Your Name"

# Set email for this repo only
git config user.email "your.email@example.com"
```

## 📝 Commit Messages

Use clear, descriptive commit messages:

```
✅ Good:
git commit -m "Feature: Add Hebrew date persistence to member forms"
git commit -m "Fix: Resolve date shift issue when editing members"
git commit -m "Update: Improve dashboard statistics display"

❌ Bad:
git commit -m "changes"
git commit -m "fix stuff"
git commit -m "update"
```

## 🚀 Deployment Workflow

### Development → Production

1. **Test on dev branch:**
   ```bash
   git checkout dev
   # Test locally
   ```

2. **Merge to main:**
   ```bash
   git checkout main
   git merge dev
   ```

3. **Push to deploy:**
   ```bash
   git push origin main
   # GitHub Actions automatically deploys
   ```

### Code Review (Optional)

Before merging to main:
1. Create Pull Request from `dev` to `main`
2. Review changes together
3. Approve and merge
4. Auto-deploys to GitHub Pages

## 🛠️ Local Development Setup

### For Your Friend (First Time)

```bash
# Clone repository
git clone https://github.com/bennyg83/pilzno_crm.git
cd pilzno_crm

# Switch to dev branch
git checkout dev

# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Start Docker containers
cd ..
docker-compose up -d

# Or run locally
cd frontend && npm run dev
cd ../backend && npm run dev
```

## 📊 Branch Protection (Optional)

To protect the `main` branch:

1. Go to repository **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable:
   - ✅ Require pull request reviews
   - ✅ Require status checks
   - ✅ Require branches to be up to date

## 🔄 Syncing Local with GitHub

### Push Local Changes

```bash
# Commit changes
git add .
git commit -m "Description"

# Push to GitHub
git push origin dev  # Development work
git push origin main # Production (auto-deploys)
```

### Pull GitHub Changes

```bash
# Get latest changes from GitHub
git pull origin dev

# Or fetch and merge
git fetch origin
git merge origin/dev
```

## ⚠️ Conflict Resolution

If you and your friend edit the same file:

1. **Pull latest changes:**
   ```bash
   git pull origin dev
   ```

2. **Git will show conflicts:**
   ```
   Auto-merging file.tsx
   CONFLICT (content): Merge conflict in file.tsx
   ```

3. **Resolve conflicts:**
   - Open conflicted file
   - Look for `<<<<<<<`, `=======`, `>>>>>>>` markers
   - Edit to keep desired changes
   - Remove conflict markers

4. **Complete merge:**
   ```bash
   git add file.tsx
   git commit -m "Resolve merge conflict in file.tsx"
   git push origin dev
   ```

## 📋 Best Practices

### Before Starting Work

```bash
# Always pull latest changes
git pull origin dev
```

### Before Pushing

```bash
# Check what you're committing
git status

# Review changes
git diff

# Test locally
npm run dev  # Frontend
npm run dev  # Backend
```

### Communication

- ✅ Communicate what you're working on
- ✅ Push small, frequent commits
- ✅ Use clear commit messages
- ✅ Pull before starting new work

## 🔧 Tools for Collaboration

### GitHub Features

- **Issues**: Track bugs and features
- **Pull Requests**: Review code before merging
- **Discussions**: Discuss project topics
- **Projects**: Manage tasks and milestones

### Git Commands Summary

```bash
# View changes
git status
git diff

# Commit changes
git add .
git commit -m "Description"

# Push to GitHub
git push origin dev

# Pull from GitHub
git pull origin dev

# Switch branches
git checkout dev
git checkout main

# View history
git log --oneline
git log --graph --oneline --all
```

---

**Repository**: https://github.com/bennyg83/pilzno_crm  
**Main Branch**: Production/Live  
**Dev Branch**: Development/Collaboration  
**Last Updated**: November 2, 2025

