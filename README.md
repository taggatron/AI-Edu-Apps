---
title: AI Edu Apps
emoji: 📚
colorFrom: blue
colorTo: indigo
sdk: nodejs
app_file: backend/server.js
pinned: false
---

# AI Edu Apps

Interactive graph of AI education tools.

The project includes:

- A static frontend (HTML/CSS/JS + D3)
- An optional Node.js/Express backend for saving edits (used locally and on Hugging Face Spaces)

## GitHub Pages

GitHub Pages is static hosting, so the app runs in **read-only mode**.

- **Download CSV** exports the current app list.
- **Upload CSV** imports a CSV and replaces the app list for your browser (stored in `localStorage`).

### Hosting

**Option A: GitHub Actions (recommended)**

1. Push to `main`
2. In GitHub: **Settings → Pages → Build and deployment → Source**
3. Select **GitHub Actions**

The workflow at `.github/workflows/deploy-pages.yml` will deploy the site.

**Option B: Deploy from a branch**

1. In GitHub: **Settings → Pages → Build and deployment → Source**
2. Select **Deploy from a branch**
3. Pick the branch and **/(root)** folder

## Hugging Face Spaces

This app can be deployed to Hugging Face Spaces using the Node.js runtime.

- The backend stores persistent data in `/data/data.json`.
- Start the backend with `npm start` from the `backend` directory.

## Local development

- `npm install`
- `npm start` (runs the backend and a static frontend server)

## License

MIT
