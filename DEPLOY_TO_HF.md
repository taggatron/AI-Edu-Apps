# Deploying to GitHub and Hugging Face Spaces

Follow these steps to deploy your project:

## 1. Initialize Git (if not already done)
Open a terminal in your project root and run:

```sh
git init
git add .
git commit -m "Initial commit for Hugging Face Spaces"
```

## 2. Add Remote and Push
Run the following commands (replace nothing):

```sh
git remote add origin https://github.com/Taggatron/ai-education-apps.git
git branch -M main
git push -u origin main
```

## 3. Create a Hugging Face Space
- Go to https://huggingface.co/spaces
- Click “Create new Space”
- Name your Space, select “Node.js” as the runtime
- Link your GitHub repo: `Taggatron/ai-education-apps`

## 4. Wait for Build & Test
- Hugging Face will install dependencies and start your app automatically.
- Data will persist in `/data/data.json` as required.

---

If you need to update your app, just commit and push changes to GitHub. Hugging Face Spaces will redeploy automatically.
