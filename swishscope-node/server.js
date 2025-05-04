const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;
const FLASK_API = 'http://localhost:5001';

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// === Frontend Pages ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homepage.html'));
});

app.get('/players', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'players.html'));
});

app.get('/teams', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'teams.html'));
});

app.get('/live', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'live.html'));
});

app.get('/analyze', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analyze.html'));
});

// === API Proxy Routes ===
app.get('/api/teams', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API}/api/teams`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get teams from Flask' });
  }
});

app.get('/api/playoff_players', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API}/api/playoff_players`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get players from Flask' });
  }
});

app.get('/api/player/:id', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API}/api/player/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get player details' });
  }
});

app.get('/api/player/:id/total_stats', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API}/api/player/${req.params.id}/total_stats`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get total stats' });
  }
});

app.get('/api/player/:id/last10', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API}/api/player/${req.params.id}/last10`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get last 10 stats' });
  }
});

app.get('/api/player/:id/last_game', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API}/api/player/${req.params.id}/last_game`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get last game stats' });
  }
});

app.get('/api/player/:id/game_logs', async (req, res) => {
  try {
    const response = await axios.get(`${FLASK_API}/api/player/${req.params.id}/game_logs`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get game logs' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Node server running at http://localhost:${PORT}`);
});
