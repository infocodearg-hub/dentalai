'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const chatRoutes        = require('./routes/chat');
const historyRoutes     = require('./routes/history');
const appointmentRoutes = require('./routes/appointments');
const settingsRoutes    = require('./routes/settings');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/chat',         chatRoutes);
app.use('/api/history',      historyRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/settings',     settingsRoutes);

// Serve compiled frontend in production
const DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');
const fs = require('fs');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`🦷 DentalAI backend corriendo en http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY no configurada. Copiá backend/.env.example a backend/.env y pegá tu clave.');
  }
});
