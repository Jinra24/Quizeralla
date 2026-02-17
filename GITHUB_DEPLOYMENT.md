# GitHub Deployment Guide

## Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Enter repository name: `Practice` (or any name you prefer)
3. Add description: "Quiz Reviewer Application"
4. Choose **Public** (so it can be hosted with GitHub Pages)
5. Click **Create repository**

## Step 2: Push Your Code to GitHub

Run these commands in PowerShell in your Practice folder:

```powershell
# Navigate to your project folder
cd "C:\Users\rmpan\OneDrive\code\Practice"

# Configure Git with your GitHub credentials
git config user.email "your-github-email@example.com"
git config user.name "Your GitHub Username"

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Quiz Reviewer app with admin dashboard"

# Add remote repository (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/Practice.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your GitHub repository: `https://github.com/USERNAME/Practice`
2. Click **Settings** (top right)
3. Scroll to **Pages** (left sidebar)
4. Under "Source", select **Deploy from a branch**
5. Branch: **main**, Folder: **/ (root)**
6. Click **Save**

## Step 4: Your Site is Live!

After 1-2 minutes, your app will be live at:
```
https://USERNAME.github.io/Practice
```

Replace `USERNAME` with your actual GitHub username.

## Updating Your Code

After making changes, push updates with:

```powershell
cd "C:\Users\rmpan\OneDrive\code\Practice"
git add .
git commit -m "Your message describing changes"
git push
```

---

## Troubleshooting

**Error: "fatal: remote origin already exists"**
```powershell
git remote remove origin
git remote add origin https://github.com/USERNAME/Practice.git
```

**Changes not showing on GitHub Pages?**
- Wait 2-5 minutes for GitHub to rebuild
- Do a hard refresh: `Ctrl+Shift+R`
- Check the Actions tab for build status

**Need to authenticate?**
- Generate GitHub Personal Token: https://github.com/settings/tokens
- Use token as password when pushing

---

## Live Demo Access

Once deployed, share your app link:
- **Login**: admin@example.com / admin123
- Users can create accounts via admin panel
- Quiz Reviewer works fully online

Enjoy! 🎉
