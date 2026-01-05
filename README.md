# AI Edu Apps (GitHub Pages)

This repo is a static D3 app and is compatible with GitHub Pages.

## GitHub Pages hosting

### Option A: GitHub Actions (recommended)

1. Push to `main`
2. In GitHub: **Settings → Pages → Build and deployment → Source**
3. Select **GitHub Actions**

The workflow at `.github/workflows/deploy-pages.yml` will deploy the site.

### Option B: Deploy from a branch

1. In GitHub: **Settings → Pages → Build and deployment → Source**
2. Select **Deploy from a branch**
3. Pick the branch and **/(root)** folder

## Notes

- On GitHub Pages the app runs in **read-only mode**.
- The **Admin** button is hidden because saving edits requires the local Node backend.

## Local development

- `npm install`
- `npm start` (runs the backend and a static frontend server)
