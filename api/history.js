'use strict';

const db = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const messages = await db.all(
      `SELECT conversation_id, role, content, created_at
       FROM messages
       WHERE role IN ('user', 'assistant') AND content IS NOT NULL
       ORDER BY id DESC
       LIMIT 200`
    );
    return res.json({ messages: messages.reverse() });
  }

  if (req.method === 'DELETE') {
    await db.run('DELETE FROM messages');
    await db.run('DELETE FROM conversations');
    return res.json({ ok: true });
  }

  res.status(405).end();
};
