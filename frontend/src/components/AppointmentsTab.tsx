import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, List } from 'lucide-react';
import Calendar from './ui/Calendar';
import { getAppointments } from '../api';
import type { Appointment } from '../types';

const ESTADO_STYLE: Record<string, string> = {
  activo:    'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
  completado:'bg-slate-100 text-slate-500',
};

function Card({ a }: { a: Appointment }) {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-100 flex items-start sm:items-center justify-between gap-2">
      <div className="min-w-0">
        <div className="font-semibold text-slate-800 text-sm sm:text-base truncate">{a.patient_name}</div>
        <div className="text-xs sm:text-sm text-slate-500">{a.service}</div>
        <div className="text-xs text-slate-400 mt-0.5">
          {new Date(a.date + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })} · {a.time} hs
          {a.patient_phone ? ` · ${a.patient_phone}` : ''}
        </div>
      </div>
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize shrink-0 ${ESTADO_STYLE[a.status]}`}>
        {a.status}
      </span>
    </div>
  );
}

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    getAppointments().then(setAppointments).catch(() => {});
  }, []);

  const marked = useMemo(
    () => new Set(appointments.filter((a) => a.status === 'activo').map((a) => a.date)),
    [appointments]
  );
  const activos = appointments.filter((a) => a.status === 'activo');
  const otros   = appointments.filter((a) => a.status !== 'activo');

  return (
    <div className="p-4 sm:p-6 overflow-y-auto scrollbar-thin h-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">Turnos</h2>
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
              view === 'calendar' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500'
            }`}
          >
            <CalendarDays size={14} /> <span className="hidden sm:inline">Calendario</span>
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
              view === 'list' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500'
            }`}
          >
            <List size={14} /> <span className="hidden sm:inline">Lista</span>
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <Calendar markedDates={marked} />
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-500 mb-2">Próximos turnos activos</h3>
            {activos.length === 0 && <p className="text-slate-400 text-sm">No hay turnos activos.</p>}
            {activos.map((a) => <Card key={a.id} a={a} />)}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-500 mb-2">Activos</h3>
            <div className="space-y-2">
              {activos.length === 0 && <p className="text-slate-400 text-sm">No hay turnos activos.</p>}
              {activos.map((a) => <Card key={a.id} a={a} />)}
            </div>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-500 mb-2">Cancelados y completados</h3>
            <div className="space-y-2">
              {otros.length === 0 && <p className="text-slate-400 text-sm">No hay turnos en esta categoría.</p>}
              {otros.map((a) => <Card key={a.id} a={a} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
