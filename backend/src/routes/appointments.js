'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/appointments — all appointments ordered by date desc
router.get('/', (req, res) => {
  const appointments = db
    .prepare('SELECT * FROM appointments ORDER BY date DESC, time DESC')
    .all();
  res.json({ appointments });
});

module.exports = router;
