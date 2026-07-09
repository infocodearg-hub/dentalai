'use strict';

const db = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  const messages = await db.all(
    `SELECT conversation_id, role, content, created_at
     FROM messages
     WHERE role IN ('user', 'assistant') AND content IS NOT NULL
     ORDER BY id DESC
     LIMIT 200`
  );
  res.json({ messages: messages.reverse() });
};
