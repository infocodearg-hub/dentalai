'use strict';

const { v4: uuidv4 } = require('uuid');
const db = require('../../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const id = uuidv4();
  await db.run('INSERT INTO conversations (id) VALUES ($1)', [id]);
  res.json({ conversationId: id });
};
