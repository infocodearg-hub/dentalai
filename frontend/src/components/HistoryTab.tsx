import { useEffect, useState } from 'react';
import { getHistory } from '../api';
import type { HistoryMessage } from '../types';

export default function HistoryTab() {
  const [messages, setMessages] = useState<HistoryMessage[]>([]);

  useEffect(() => {
    const load = () => getHistory().then(setMessages).catch(() => {});
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-6 overflow-y-auto scrollbar-thin h-full">
      <h2 className="text-xl font-bold text-slate-800 mb-1">Historial de mensajes</h2>
      <p className="text-sm text-slate-400 mb-6">Se actualiza automáticamente cada pocos segundos.</p>
      <div className="space-y-2">
        {messages.length === 0 && <p className="text-slate-400 text-sm">Todavía no hay mensajes.</p>}
        {messages.map((m, i) => (
          <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-slate-100">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
              m.role === 'user' ? 'bg-slate-100' : 'bg-brand-100'
            }`}>
              {m.role === 'user' ? '🧑' : '👩‍⚕️'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">
                  {m.role === 'user' ? 'Paciente' : 'Sarah'}
                </span>
                <span className="text-xs text-slate-400">{new Date(m.created_at + 'Z').toLocaleString('es-AR')}</span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5 break-words">{m.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
