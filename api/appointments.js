'use strict';

const db = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  const appointments = await db.all('SELECT * FROM appointments ORDER BY date DESC, time DESC');
  res.json({ appointments });
};
