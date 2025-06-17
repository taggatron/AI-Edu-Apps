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

A web application for managing and visualizing AI education resources. This app features a Node.js backend (Express) and a static frontend (HTML/CSS/JS).

## Features
- REST API for data (nodes/links) with persistent storage in `/data/data.json`
- Serves static frontend
- Designed for Hugging Face Spaces Node.js runtime

## Usage
- All data is stored in `/data/data.json` (persistent on Hugging Face Spaces)
- Start the backend with `npm start` from the `backend` directory

## Hugging Face Spaces
This app is ready to deploy on Hugging Face Spaces using the Node.js runtime. All persistent data is written to `/data/data.json` as required by the platform.

## License
MIT
