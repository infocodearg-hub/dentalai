'use strict';

const { createClient } = require('@libsql/client');

const client = createClient({
  url:       process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let initialized = false;

async function init() {
  if (initialized) return;
  await client.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK(id = 1),
        clinic_name TEXT NOT NULL DEFAULT 'Clínica Dental Sonrisa',
        address TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        hours TEXT NOT NULL DEFAULT '',
        services TEXT NOT NULL DEFAULT '[]',
        description TEXT NOT NULL DEFAULT ''
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT,
        tool_call_id TEXT,
        tool_calls TEXT,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        patient_phone TEXT,
        service TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'activo',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      args: [],
    },
    {
      sql: `INSERT OR IGNORE INTO settings
        (id, clinic_name, address, phone, email, hours, services, description)
        VALUES (1, 'Clínica Dental Sonrisa', 'Av. Corrientes 1234, Buenos Aires',
          '+54 11 4567-8901', 'turnos@sonrisadental.ar',
          'Lunes a Viernes 9:00–18:00, Sábados 9:00–13:00',
          '["Limpieza dental","Blanqueamiento","Ortodoncia","Implantes","Extracción","Radiografía","Consulta general"]',
          'Clínica dental de primer nivel en Buenos Aires.')`,
      args: [],
    },
  ], 'write');
  initialized = true;
}

// Helpers that mirror the better-sqlite3 / node:sqlite sync API but async
async function get(sql, args = []) {
  await init();
  const res = await client.execute({ sql, args });
  return res.rows[0] ?? null;
}

async function all(sql, args = []) {
  await init();
  const res = await client.execute({ sql, args });
  return res.rows;
}

async function run(sql, args = []) {
  await init();
  const res = await client.execute({ sql, args });
  return { lastInsertRowid: Number(res.lastInsertRowid) };
}

async function exec(sql) {
  await init();
  await client.executeMultiple(sql);
}

module.exports = { get, all, run, exec, init };
