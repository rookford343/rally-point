# Setup Guide

This guide walks you through getting Rally Point running — no prior coding experience required.

---

## Prerequisites

- A computer running macOS, Windows, or Linux
- A GitHub account (free at github.com)
- [Bun](https://bun.sh) installed (the JavaScript runtime this project uses)

### Install Bun

**macOS / Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows:** Download the installer from [bun.sh](https://bun.sh).

---

## Step 1: Fork the Repository

1. Go to [https://github.com/rookford343/rally-point](https://github.com/rookford343/rally-point)
2. Click **Fork** in the top right
3. Choose your account — this creates your own copy of the project

---

## Step 2: Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/rally-point.git
cd rally-point
```

Replace `YOUR-USERNAME` with your GitHub username.

---

## Step 3: Install Dependencies

```bash
bun install
```

This downloads all the project's dependencies. Takes about 30 seconds.

---

## Step 4: Run Locally

```bash
bun dev
```

Open your browser to `http://localhost:5173` — you should see the app.

---

## Step 5: Build the App

```bash
bun run build
```

This creates a `dist/` folder with the production-ready app files.

---

## Step 6: Deploy to GitHub Pages (Free Hosting)

This project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to `main`.

### Enable GitHub Pages:

1. In your forked repo on GitHub, go to **Settings → Pages**
2. Under **Build and deployment**, select **GitHub Actions** as the source
3. Push a commit to `main` — the workflow will run automatically
4. Your app will be live at `https://YOUR-USERNAME.github.io/rally-point/`

### Trigger the first deploy:

```bash
git add .
git commit -m "Initial setup"
git push origin main
```

Watch the **Actions** tab in your GitHub repo — the deploy takes about 1 minute.

---

## Customizing Your Deployment

### Change the app title

Edit `index.html` and update the `<title>` tag.

### Update the base URL

If you're deploying to a custom domain instead of GitHub Pages, edit `vite.config.ts` and change `base: '/rally-point/'` to `base: '/'`.

### Add a custom domain

1. Add a `CNAME` file to the `public/` folder with your domain name
2. Configure DNS per GitHub's instructions

---

## Updating Your App

To get the latest improvements from the main Rally Point project:

```bash
git remote add upstream https://github.com/rookford343/rally-point.git
git fetch upstream
git merge upstream/main
```

---

## Troubleshooting

**`bun: command not found`** — Bun isn't installed or isn't in your PATH. Re-run the install command and restart your terminal.

**Build fails with type errors** — Run `bun run build` again after `bun install`. If it persists, open an issue on GitHub.

**App loads but shows blank page** — Check that `base` in `vite.config.ts` matches your deployment path (e.g., `/rally-point/` for GitHub Pages).

**My plan data disappeared** — Plan data is in `localStorage`. Clearing browser data or using a different browser will show an empty plan. Always print your plan as a backup.
