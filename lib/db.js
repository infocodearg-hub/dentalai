'use strict';

const { Pool } = require('pg');

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1, // importante para serverless
    });
  }
  return pool;
}

let initialized = false;

async function init() {
  if (initialized) return;
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      clinic_name TEXT NOT NULL DEFAULT 'Clínica Dental Sonrisa',
      address TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      hours TEXT NOT NULL DEFAULT '',
      services TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT,
      tool_call_id TEXT,
      tool_calls TEXT,
      name TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      patient_phone TEXT,
      service TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'activo',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO settings (id, clinic_name, address, phone, email, hours, services, description)
    VALUES (1,
      'Clínica Dental Sonrisa',
      'Av. Corrientes 1234, Buenos Aires',
      '+54 11 4567-8901',
      'turnos@sonrisadental.ar',
      'Lunes a Viernes 9:00–18:00, Sábados 9:00–13:00',
      '["Limpieza dental","Blanqueamiento","Ortodoncia","Implantes","Extracción","Radiografía","Consulta general"]',
      'Clínica dental de primer nivel en Buenos Aires.'
    ) ON CONFLICT (id) DO NOTHING;
  `);
  initialized = true;
}

async function get(sql, args = []) {
  await init();
  const res = await getPool().query(sql, args);
  return res.rows[0] ?? null;
}

async function all(sql, args = []) {
  await init();
  const res = await getPool().query(sql, args);
  return res.rows;
}

async function run(sql, args = []) {
  await init();
  const res = await getPool().query(sql, args);
  return { lastInsertRowid: res.rows[0]?.id ?? null };
}

module.exports = { get, all, run, init };
