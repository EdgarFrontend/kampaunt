import express from 'express';
import historyHandler from './api/history';
import deleteHandler from './api/history/[id]';
import configHandler from './api/config';
import tasksHandler from './api/tasks/index';
import taskByIdHandler from './api/tasks/[id]';

const app = express();
app.use(express.json());

// Type-cast to any to satisfy VercelRequest/VercelResponse signatures
app.all('/api/history', async (req, res) => {
  try {
    await historyHandler(req as any, res as any);
  } catch (err) {
    console.error("Local API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.all('/api/history/:id', async (req, res) => {
  try {
    // Vercel extracts path parameters into req.query
    req.query.id = req.params.id;
    await deleteHandler(req as any, res as any);
  } catch (err) {
    console.error("Local API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.all('/api/config', async (req, res) => {
  try {
    await configHandler(req as any, res as any);
  } catch (err) {
    console.error("Local API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.all('/api/tasks', async (req, res) => {
  try {
    await tasksHandler(req as any, res as any);
  } catch (err) {
    console.error("Local API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.all('/api/tasks/:id', async (req, res) => {
  try {
    req.query.id = req.params.id;
    await taskByIdHandler(req as any, res as any);
  } catch (err) {
    console.error("Local API Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Local API Server listening on port ${PORT}`);
});
