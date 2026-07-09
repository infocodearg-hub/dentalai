'use strict';

const db = require('../../lib/db');

module.exports = async (req, res) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    const conv = await db.get('SELECT id FROM conversations WHERE id = $1', [id]);
    if (!conv) return res.status(404).json({ error: 'Conversación no encontrada.' });
    const messages = await db.all(
      "SELECT role, content, created_at FROM messages WHERE conversation_id = $1 AND role IN ('user','assistant') AND content IS NOT NULL ORDER BY id",
      [id]
    );
    return res.json({ messages });
  }

  if (req.method === 'DELETE') {
    await db.run('DELETE FROM messages WHERE conversation_id = $1', [id]);
    await db.run('DELETE FROM conversations WHERE id = $1', [id]);
    return res.json({ ok: true });
  }

  res.status(405).end();
};
