'use strict';

const db = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    const row = await db.get('SELECT * FROM settings WHERE id = 1');
    if (!row) return res.status(404).json({ error: 'Settings no encontradas.' });
    return res.json({
      settings: {
        clinic_name: row.clinic_name,
        address:     row.address,
        phone:       row.phone,
        email:       row.email,
        hours:       row.hours,
        services:    JSON.parse(row.services),
        description: row.description,
      },
    });
  }

  if (req.method === 'PUT') {
    const { clinic_name, address, phone, email, hours, services, description } = req.body;
    if (!clinic_name) return res.status(400).json({ error: 'El campo clinic_name es requerido.' });
    const servicesJson = JSON.stringify(Array.isArray(services) ? services : []);
    await db.run(
      `INSERT INTO settings (id, clinic_name, address, phone, email, hours, services, description)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         clinic_name = excluded.clinic_name,
         address     = excluded.address,
         phone       = excluded.phone,
         email       = excluded.email,
         hours       = excluded.hours,
         services    = excluded.services,
         description = excluded.description`,
      [clinic_name, address ?? '', phone ?? '', email ?? '', hours ?? '', servicesJson, description ?? '']
    );
    return res.json({ ok: true });
  }

  res.status(405).end();
};
