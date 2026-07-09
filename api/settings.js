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
       VALUES (1, $1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         clinic_name = EXCLUDED.clinic_name,
         address     = EXCLUDED.address,
         phone       = EXCLUDED.phone,
         email       = EXCLUDED.email,
         hours       = EXCLUDED.hours,
         services    = EXCLUDED.services,
         description = EXCLUDED.description`,
      [clinic_name, address ?? '', phone ?? '', email ?? '', hours ?? '', servicesJson, description ?? '']
    );
    return res.json({ ok: true });
  }

  res.status(405).end();
};
