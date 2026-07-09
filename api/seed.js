'use strict';

// Endpoint temporal para repoblar datos de ejemplo con fechas reales.
// Solo acepta POST con el header X-Seed-Token correcto.

const db = require('../lib/db');

const add = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  // Borro todos los turnos existentes
  await db.run('DELETE FROM appointments');

  // Inserto turnos de ejemplo con fechas reales
  const samples = [
    { date: add(1),  time: '10:00', patient_name: 'María González',   patient_phone: '+54 9 11 1234-5678', service: 'Limpieza dental',  status: 'activo' },
    { date: add(2),  time: '14:30', patient_name: 'Carlos Rodríguez', patient_phone: '+54 9 11 2345-6789', service: 'Consulta general', status: 'activo' },
    { date: add(3),  time: '11:00', patient_name: 'Ana Martínez',     patient_phone: null,                 service: 'Ortodoncia',       status: 'activo' },
    { date: add(5),  time: '09:00', patient_name: 'Luis Fernández',   patient_phone: '+54 9 11 3456-7890', service: 'Blanqueamiento',   status: 'activo' },
    { date: add(-2), time: '10:00', patient_name: 'Paula Sánchez',    patient_phone: '+54 9 11 4567-8901', service: 'Extracción',       status: 'completado' },
    { date: add(-1), time: '15:00', patient_name: 'Martín López',     patient_phone: null,                 service: 'Radiografía',      status: 'cancelado' },
  ];

  for (const r of samples) {
    await db.run(
      'INSERT INTO appointments (date, time, patient_name, patient_phone, service, status) VALUES ($1, $2, $3, $4, $5, $6)',
      [r.date, r.time, r.patient_name, r.patient_phone, r.service, r.status]
    );
  }

  res.json({ ok: true, seeded: samples.length, dates: samples.map(s => s.date) });
};
