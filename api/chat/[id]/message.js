'use strict';

const db = require('../../../lib/db');
const { chat } = require('../../../lib/openai');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.query;
  const { content } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'El campo "content" es requerido.' });
  }

  const conv = await db.get('SELECT id FROM conversations WHERE id = $1', [id]);
  if (!conv) return res.status(404).json({ error: 'Conversación no encontrada.' });

  try {
    const reply = await chat(id, content.trim());
    res.json({ reply });
  } catch (err) {
    console.error('Error en chat:', err.message);
    res.status(500).json({ error: 'Error al procesar el mensaje.' });
  }
};
