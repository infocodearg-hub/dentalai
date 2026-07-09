'use strict';

const db = require('./db');

// Seed settings
const existingSettings = db.prepare('SELECT id FROM settings WHERE id = 1').get();
if (!existingSettings) {
  db.prepare(`
    INSERT INTO settings (id, clinic_name, address, phone, email, hours, services, description)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Clínica Dental Sonrisa',
    'Av. Corrientes 1234, Buenos Aires',
    '+54 11 4567-8901',
    'turnos@sonrisadental.ar',
    'Lunes a Viernes 9:00–18:00, Sábados 9:00–13:00',
    JSON.stringify(['Limpieza dental', 'Blanqueamiento', 'Ortodoncia', 'Implantes', 'Extracción', 'Radiografía', 'Consulta general']),
    'Clínica dental de primer nivel en Buenos Aires. Contamos con profesionales de amplia experiencia y tecnología de vanguardia para brindarte la mejor atención odontológica.'
  );
  console.log('✅ Settings iniciales insertados.');
} else {
  console.log('ℹ️  Settings ya existen, omitiendo.');
}

// Seed sample appointments
const count = db.prepare('SELECT COUNT(*) as c FROM appointments').get();
if (count.c === 0) {
  const today = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const add = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return fmt(d);
  };

  const samples = [
    { date: add(1),  time: '10:00', patient_name: 'María González',   patient_phone: '+54 9 11 1234-5678', service: 'Limpieza dental',  status: 'activo' },
    { date: add(2),  time: '14:30', patient_name: 'Carlos Rodríguez', patient_phone: '+54 9 11 2345-6789', service: 'Consulta general', status: 'activo' },
    { date: add(3),  time: '11:00', patient_name: 'Ana Martínez',     patient_phone: null,                 service: 'Ortodoncia',       status: 'activo' },
    { date: add(5),  time: '09:00', patient_name: 'Luis Fernández',   patient_phone: '+54 9 11 3456-7890', service: 'Blanqueamiento',   status: 'activo' },
    { date: add(-2), time: '10:00', patient_name: 'Paula Sánchez',    patient_phone: '+54 9 11 4567-8901', service: 'Extracción',       status: 'completado' },
    { date: add(-1), time: '15:00', patient_name: 'Martín López',     patient_phone: null,                 service: 'Radiografía',      status: 'cancelado' },
  ];

  const insert = db.prepare(`
    INSERT INTO appointments (date, time, patient_name, patient_phone, service, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION');
  for (const r of samples) {
    insert.run(r.date, r.time, r.patient_name, r.patient_phone, r.service, r.status);
  }
  db.exec('COMMIT');

  console.log(`✅ ${samples.length} turnos de ejemplo insertados.`);
} else {
  console.log('ℹ️  Turnos ya existen, omitiendo.');
}

console.log('🌱 Seed completado.');
process.exit(0);
