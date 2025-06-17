import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to read data
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return { nodes: [], links: [] };
  }
}

// Helper to write data
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write data.json:", e);
    throw e;
  }
}

// GET all data
app.get("/api/data", (req, res) => {
  res.json(readData());
});

// PUT (replace) all data
app.put("/api/data", (req, res) => {
  const { nodes, links } = req.body;
  if (!Array.isArray(nodes) || !Array.isArray(links)) {
    return res.status(400).json({ error: "Invalid data format" });
  }
  writeData({ nodes, links });
  res.json({ success: true });
});

// PATCH (update a single node)
app.patch("/api/node/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const data = readData();
  const node = data.nodes.find(n => n.id === id);
  if (!node) return res.status(404).json({ error: "Node not found" });
  Object.assign(node, updates);
  writeData(data);
  res.json({ success: true, node });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
