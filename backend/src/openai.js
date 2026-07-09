'use strict';

const OpenAI = require('openai');
const db = require('./db');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Consulta los horarios disponibles para una fecha específica. Devuelve lista de horas libres.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Fecha en formato YYYY-MM-DD (ej: 2025-08-15)',
          },
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
      description: 'Cancela un turno existente cambiando su estado a "cancelado".',
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

// ---------------------------------------------------------------------------
// Tool implementations
// ---------------------------------------------------------------------------
const ALL_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
                   '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

function checkAvailability({ date }) {
  const taken = db
    .prepare("SELECT time FROM appointments WHERE date = ? AND status = 'activo'")
    .all(date)
    .map((r) => r.time);

  // Sundays are closed
  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  if (dayOfWeek === 0) {
    return { date, available: [], message: 'La clínica no atiende los domingos.' };
  }

  // Saturdays: only morning slots
  const slots = dayOfWeek === 6 ? ALL_SLOTS.filter((s) => s < '13:00') : ALL_SLOTS;
  const available = slots.filter((s) => !taken.includes(s));

  return { date, available, taken };
}

function createAppointment({ date, time, patient_name, patient_phone, service }) {
  // Check if slot is free
  const conflict = db
    .prepare("SELECT id FROM appointments WHERE date = ? AND time = ? AND status = 'activo'")
    .get(date, time);

  if (conflict) {
    return { success: false, error: `El horario ${time} del ${date} ya está ocupado. Elegí otro horario.` };
  }

  const result = db
    .prepare('INSERT INTO appointments (date, time, patient_name, patient_phone, service, status) VALUES (?, ?, ?, ?, ?, ?)')
    .run(date, time, patient_name, patient_phone || null, service, 'activo');

  return {
    success: true,
    appointment: { id: result.lastInsertRowid, date, time, patient_name, patient_phone, service, status: 'activo' },
  };
}

function cancelAppointment({ appointment_id }) {
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(appointment_id);
  if (!appt) return { success: false, error: `No encontré un turno con ID ${appointment_id}.` };
  if (appt.status === 'cancelado') return { success: false, error: 'Este turno ya está cancelado.' };

  db.prepare("UPDATE appointments SET status = 'cancelado' WHERE id = ?").run(appointment_id);
  return { success: true, message: `Turno #${appointment_id} de ${appt.patient_name} cancelado correctamente.` };
}

function getPatientAppointments({ patient_name, patient_phone }) {
  let rows;
  if (patient_phone) {
    rows = db.prepare('SELECT * FROM appointments WHERE patient_phone LIKE ? ORDER BY date, time').all(`%${patient_phone}%`);
  } else if (patient_name) {
    rows = db.prepare('SELECT * FROM appointments WHERE patient_name LIKE ? ORDER BY date, time').all(`%${patient_name}%`);
  } else {
    return { appointments: [], message: 'Indicá nombre o teléfono para buscar.' };
  }
  return { appointments: rows };
}

function executeTool(name, args) {
  switch (name) {
    case 'check_availability':       return checkAvailability(args);
    case 'create_appointment':       return createAppointment(args);
    case 'cancel_appointment':       return cancelAppointment(args);
    case 'get_patient_appointments': return getPatientAppointments(args);
    default:                         return { error: `Función desconocida: ${name}` };
  }
}

// ---------------------------------------------------------------------------
// Build system prompt dynamically from settings
// ---------------------------------------------------------------------------
function buildSystemPrompt() {
  const s = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  const services = s ? JSON.parse(s.services).join(', ') : 'consultar con la clínica';

  return `Sos Sarah, la recepcionista virtual de ${s ? s.clinic_name : 'la clínica'}.
Tu rol es ayudar a los pacientes a agendar, consultar, cancelar o reprogramar turnos odontológicos.

Información de la clínica:
- Nombre: ${s?.clinic_name ?? ''}
- Dirección: ${s?.address ?? ''}
- Teléfono: ${s?.phone ?? ''}
- Email: ${s?.email ?? ''}
- Horarios de atención: ${s?.hours ?? ''}
- Servicios disponibles: ${services}
- Descripción: ${s?.description ?? ''}

Reglas de comportamiento:
- Hablás en español rioplatense (vos, no tú). Sos amable, cálida y eficiente.
- Para agendar un turno siempre pedís: nombre completo, servicio deseado y fecha/hora aproximada.
- Antes de confirmar un turno, SIEMPRE llamás a check_availability para verificar disponibilidad.
- Nunca confirmés un horario sin verificarlo primero.
- Si el slot está ocupado, ofrecés alternativas del mismo día.
- Para cancelar, primero buscás el turno del paciente con get_patient_appointments.
- Si no podés resolver algo, le decís que llame al ${s?.phone ?? 'teléfono de la clínica'}.
- Usás emojis con moderación para darle calidez a la conversación.
- Respondés solo en español. Nunca mezcles idiomas.`;
}

// ---------------------------------------------------------------------------
// Main chat function (agentic loop)
// ---------------------------------------------------------------------------
async function chat(conversationId, userContent) {
  // Load conversation history
  const history = db
    .prepare('SELECT role, content, tool_call_id, tool_calls, name FROM messages WHERE conversation_id = ? ORDER BY id')
    .all(conversationId);

  // Build messages array for OpenAI
  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    ...history.map((m) => {
      const msg = { role: m.role, content: m.content };
      if (m.tool_call_id) msg.tool_call_id = m.tool_call_id;
      if (m.tool_calls)   msg.tool_calls = JSON.parse(m.tool_calls);
      if (m.name)         msg.name = m.name;
      return msg;
    }),
    { role: 'user', content: userContent },
  ];

  // Persist user message
  db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(
    conversationId, 'user', userContent
  );

  // Agentic loop: keep calling OpenAI until no more tool calls
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

    // Add assistant message to local array
    messages.push(assistantMsg);

    if (choice.finish_reason === 'tool_calls' && assistantMsg.tool_calls?.length) {
      // Persist assistant message with tool_calls
      db.prepare('INSERT INTO messages (conversation_id, role, content, tool_calls) VALUES (?, ?, ?, ?)').run(
        conversationId, 'assistant', assistantMsg.content ?? null, JSON.stringify(assistantMsg.tool_calls)
      );

      // Execute each tool call
      for (const toolCall of assistantMsg.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const result = executeTool(toolCall.function.name, args);
        const resultStr = JSON.stringify(result);

        const toolMsg = {
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: resultStr,
        };
        messages.push(toolMsg);

        db.prepare('INSERT INTO messages (conversation_id, role, content, tool_call_id, name) VALUES (?, ?, ?, ?, ?)').run(
          conversationId, 'tool', resultStr, toolCall.id, toolCall.function.name
        );
      }
      // Loop again to get final answer
      continue;
    }

    // No more tool calls → we have the final reply
    finalReply = assistantMsg.content ?? '';
    db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(
      conversationId, 'assistant', finalReply
    );
    break;
  }

  if (!finalReply) {
    finalReply = 'Ocurrió un error procesando tu mensaje. Por favor, intentá de nuevo.';
  }

  return finalReply;
}

module.exports = { chat };
