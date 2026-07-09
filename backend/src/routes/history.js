'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/history — last 200 user+assistant messages across all conversations
router.get('/', (req, res) => {
  const messages = db
    .prepare(`
      SELECT conversation_id, role, content, created_at
      FROM messages
      WHERE role IN ('user', 'assistant') AND content IS NOT NULL
      ORDER BY id DESC
      LIMIT 200
    `)
    .all()
    .reverse();

  res.json({ messages });
});

module.exports = router;
