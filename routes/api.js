// routes/api.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const storagePath = path.join(__dirname, '..', 'data', 'storage.json');

// Safe read/write helpers
function readJsonSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}
function writeJsonSafe(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/* ---------- GET /api/tasks
   Returns array of tasks
----------------------------------------------------- */
router.get('/tasks', (req, res) => {
  const items = readJsonSafe(storagePath);
  res.json(items);
});

/* ---------- POST /api/tasks
   Create a new task
   body: { title, description }
----------------------------------------------------- */
router.post('/tasks', (req, res) => {
  const { title = '', description = '' } = req.body;

  // Basic server-side validation
  if (!title || title.trim().length < 1) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const items = readJsonSafe(storagePath);
  const newTask = {
    id: Date.now().toString(), // string id for safe matching
    title: title.trim(),
    description: description ? description.trim() : '',
    createdAt: new Date().toISOString()
  };
  items.push(newTask);
  writeJsonSafe(storagePath, items);

  return res.status(201).json(newTask);
});

/* ---------- PUT /api/tasks/:id
   Update existing task (partial allowed)
   body: { title?, description? }
----------------------------------------------------- */
router.put('/tasks/:id', (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;

  const items = readJsonSafe(storagePath);
  let found = false;
  const updated = items.map(item => {
    if (item.id === id) {
      found = true;
      return {
        ...item,
        title: title !== undefined ? String(title).trim() : item.title,
        description: description !== undefined ? String(description).trim() : item.description,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });

  if (!found) return res.status(404).json({ error: 'Task not found' });
  writeJsonSafe(storagePath, updated);
  return res.json({ ok: true });
});

/* ---------- DELETE /api/tasks/:id
   Delete a task
----------------------------------------------------- */
router.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  const items = readJsonSafe(storagePath);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return res.status(404).json({ error: 'Task not found' });

  writeJsonSafe(storagePath, filtered);
  return res.json({ ok: true });
});

module.exports = router;
