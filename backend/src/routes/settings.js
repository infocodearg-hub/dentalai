'use strict';

const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/settings
router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  if (!row) return res.status(404).json({ error: 'Settings no encontradas.' });

  const settings = {
    clinic_name: row.clinic_name,
    address:     row.address,
    phone:       row.phone,
    email:       row.email,
    hours:       row.hours,
    services:    JSON.parse(row.services),
    description: row.description,
  };
  res.json({ settings });
});

// PUT /api/settings
router.put('/', (req, res) => {
  const { clinic_name, address, phone, email, hours, services, description } = req.body;

  if (!clinic_name || typeof clinic_name !== 'string') {
    return res.status(400).json({ error: 'El campo clinic_name es requerido.' });
  }

  const servicesJson = JSON.stringify(Array.isArray(services) ? services : []);

  db.prepare(`
    INSERT INTO settings (id, clinic_name, address, phone, email, hours, services, description)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      clinic_name = excluded.clinic_name,
      address     = excluded.address,
      phone       = excluded.phone,
      email       = excluded.email,
      hours       = excluded.hours,
      services    = excluded.services,
      description = excluded.description
  `).run(
    clinic_name,
    address     ?? '',
    phone       ?? '',
    email       ?? '',
    hours       ?? '',
    servicesJson,
    description ?? ''
  );

  res.json({ ok: true });
});

module.exports = router;
