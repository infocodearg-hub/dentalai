'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { chat } = require('../openai');

const router = express.Router();

// POST /api/chat/new — create a new conversation
router.post('/new', (req, res) => {
  const id = uuidv4();
  db.prepare('INSERT INTO conversations (id) VALUES (?)').run(id);
  res.json({ conversationId: id });
});

// GET /api/chat/:id — get messages of a conversation
router.get('/:id', (req, res) => {
  const conv = db.prepare('SELECT id FROM conversations WHERE id = ?').get(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversación no encontrada.' });

  const messages = db
    .prepare("SELECT role, content, created_at FROM messages WHERE conversation_id = ? AND role IN ('user','assistant') AND content IS NOT NULL ORDER BY id")
    .all(req.params.id);

  res.json({ messages });
});

// POST /api/chat/:id/message — send a message and get a reply
router.post('/:id/message', async (req, res) => {
  const { content } = req.body;
  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'El campo "content" es requerido.' });
  }

  const conv = db.prepare('SELECT id FROM conversations WHERE id = ?').get(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversación no encontrada.' });

  try {
    const reply = await chat(req.params.id, content.trim());
    res.json({ reply });
  } catch (err) {
    console.error('Error en chat:', err.message);
    res.status(500).json({ error: 'Error al procesar el mensaje.' });
  }
});

// DELETE /api/chat/:id — delete a conversation
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM conversations WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
