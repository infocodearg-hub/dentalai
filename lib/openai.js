'use strict';

const OpenAI = require('openai');
const db = require('./db');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Consulta los horarios disponibles para una fecha específica. Devuelve lista de horas libres.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Fecha en formato YYYY-MM-DD (ej: 2025-08-15)' },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_appointment',
      description: 'Crea un nuevo turno. Verificá disponibilidad antes de llamar esta función.',
      parameters: {
        type: 'object',
        properties: {
          date:          { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
          time:          { type: 'string', description: 'Hora en formato HH:MM (ej: 10:00)' },
          patient_name:  { type: 'string', description: 'Nombre completo del paciente' },
          patient_phone: { type: 'string', description: 'Teléfono del paciente (opcional)' },
          service:       { type: 'string', description: 'Servicio solicitado (ej: Limpieza dental)' },
        },
        required: ['date', 'time', 'patient_name', 'service'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_appointment',
      description: 'Cancela un turno existente.',
      parameters: {
        type: 'object',
        properties: {
          appointment_id: { type: 'number', description: 'ID del turno a cancelar' },
        },
        required: ['appointment_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_patient_appointments',
      description: 'Busca los turnos de un paciente por nombre o teléfono.',
      parameters: {
        type: 'object',
        properties: {
          patient_name:  { type: 'string', description: 'Nombre del paciente (búsqueda parcial)' },
          patient_phone: { type: 'string', description: 'Teléfono del paciente' },
        },
      },
    },
  },
];

const ALL_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
];

async function checkAvailability({ date }) {
  const rows = await db.all(
    "SELECT time FROM appointments WHERE date = $1 AND status = 'activo'",
    [date]
  );
  const taken = rows.map((r) => r.time);
  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  if (dayOfWeek === 0) return { date, available: [], message: 'La clínica no atiende los domingos.' };
  const slots = dayOfWeek === 6 ? ALL_SLOTS.filter((s) => s < '13:00') : ALL_SLOTS;
  return { date, available: slots.filter((s) => !taken.includes(s)), taken };
}

async function createAppointment({ date, time, patient_name, patient_phone, service }) {
  const conflict = await db.get(
    "SELECT id FROM appointments WHERE date = $1 AND time = $2 AND status = 'activo'",
    [date, time]
  );
  if (conflict) {
    return { success: false, error: `El horario ${time} del ${date} ya está ocupado. Elegí otro horario.` };
  }
  const result = await db.run(
    `INSERT INTO appointments (date, time, patient_name, patient_phone, service, status)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [date, time, patient_name, patient_phone || null, service, 'activo']
  );
  return {
    success: true,
    appointment: { id: result.lastInsertRowid, date, time, patient_name, patient_phone, service, status: 'activo' },
  };
}

async function cancelAppointment({ appointment_id }) {
  const appt = await db.get('SELECT * FROM appointments WHERE id = $1', [appointment_id]);
  if (!appt) return { success: false, error: `No encontré un turno con ID ${appointment_id}.` };
  if (appt.status === 'cancelado') return { success: false, error: 'Este turno ya está cancelado.' };
  await db.run("UPDATE appointments SET status = 'cancelado' WHERE id = $1", [appointment_id]);
  return { success: true, message: `Turno #${appointment_id} de ${appt.patient_name} cancelado correctamente.` };
}

async function getPatientAppointments({ patient_name, patient_phone }) {
  if (patient_phone) {
    const rows = await db.all(
      'SELECT * FROM appointments WHERE patient_phone LIKE $1 ORDER BY date, time',
      [`%${patient_phone}%`]
    );
    return { appointments: rows };
  }
  if (patient_name) {
    const rows = await db.all(
      'SELECT * FROM appointments WHERE patient_name ILIKE $1 ORDER BY date, time',
      [`%${patient_name}%`]
    );
    return { appointments: rows };
  }
  return { appointments: [], message: 'Indicá nombre o teléfono para buscar.' };
}

async function executeTool(name, args) {
  switch (name) {
    case 'check_availability':       return checkAvailability(args);
    case 'create_appointment':       return createAppointment(args);
    case 'cancel_appointment':       return cancelAppointment(args);
    case 'get_patient_appointments': return getPatientAppointments(args);
    default:                         return { error: `Función desconocida: ${name}` };
  }
}

async function buildSystemPrompt() {
  const s = await db.get('SELECT * FROM settings WHERE id = 1');
  const services = s ? JSON.parse(s.services).join(', ') : 'consultar con la clínica';
  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });
  const todayISO = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }); // YYYY-MM-DD
  return `Sos Sarah, la recepcionista virtual de ${s ? s.clinic_name : 'la clínica'}.
Tu rol es ayudar a los pacientes a agendar, consultar, cancelar o reprogramar turnos odontológicos.

FECHA DE HOY: ${today} (${todayISO}). Usá SIEMPRE esta fecha como referencia. Nunca uses fechas del pasado para nuevos turnos.

Información de la clínica:
- Nombre: ${s?.clinic_name ?? ''}
- Dirección: ${s?.address ?? ''}
- Teléfono: ${s?.phone ?? ''}
- Email: ${s?.email ?? ''}
- Horarios de atención: ${s?.hours ?? ''}
- Servicios disponibles: ${services}
- Descripción: ${s?.description ?? ''}

Reglas:
- Hablás en español rioplatense (vos, no tú). Sos amable, cálida y eficiente.
- Para agendar un turno siempre pedís: nombre completo, servicio deseado y fecha/hora aproximada.
- Antes de confirmar un turno, SIEMPRE llamás a check_availability para verificar disponibilidad.
- Si el slot está ocupado, ofrecés alternativas del mismo día.
- Para cancelar, primero buscás el turno con get_patient_appointments.
- Si no podés resolver algo, le decís que llame al ${s?.phone ?? 'teléfono de la clínica'}.
- Usás emojis con moderación. Respondés solo en español.`;
}

async function chat(conversationId, userContent) {
  const history = await db.all(
    'SELECT role, content, tool_call_id, tool_calls, name FROM messages WHERE conversation_id = $1 ORDER BY id',
    [conversationId]
  );

  const messages = [
    { role: 'system', content: await buildSystemPrompt() },
    ...history.map((m) => {
      const msg = { role: m.role, content: m.content };
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
      if (m.tool_calls)   msg.tool_calls = JSON.parse(m.tool_calls);
      if (m.name)         msg.name = m.name;
      return msg;
    }),
    { role: 'user', content: userContent },
  ];

  await db.run(
    'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
    [conversationId, 'user', userContent]
  );

  let finalReply = '';
  let iterations = 0;
  const MAX_ITER = 8;

  while (iterations < MAX_ITER) {
    iterations++;
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    const assistantMsg = choice.message;
    messages.push(assistantMsg);

    if (choice.finish_reason === 'tool_calls' && assistantMsg.tool_calls?.length) {
      await db.run(
        'INSERT INTO messages (conversation_id, role, content, tool_calls) VALUES ($1, $2, $3, $4)',
        [conversationId, 'assistant', assistantMsg.content ?? null, JSON.stringify(assistantMsg.tool_calls)]
      );
      for (const toolCall of assistantMsg.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = await executeTool(toolCall.function.name, args);
        const resultStr = JSON.stringify(result);
        messages.push({ role: 'tool', tool_call_id: toolCall.id, name: toolCall.function.name, content: resultStr });
        await db.run(
          'INSERT INTO messages (conversation_id, role, content, tool_call_id, name) VALUES ($1, $2, $3, $4, $5)',
          [conversationId, 'tool', resultStr, toolCall.id, toolCall.function.name]
        );
      }
      continue;
    }

    finalReply = assistantMsg.content ?? '';
    await db.run(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [conversationId, 'assistant', finalReply]
    );
    break;
  }

  return finalReply || 'Ocurrió un error procesando tu mensaje. Por favor, intentá de nuevo.';
}

module.exports = { chat };
