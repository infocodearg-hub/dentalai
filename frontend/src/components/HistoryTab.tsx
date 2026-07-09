import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { getHistory, clearHistory } from '../api';
import type { HistoryMessage } from '../types';

export default function HistoryTab() {
  const [messages, setMessages] = useState<HistoryMessage[]>([]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const load = () => getHistory().then(setMessages).catch(() => {});
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  async function handleClear() {
    if (!confirming) { setConfirming(true); return; }
    await clearHistory();
    setMessages([]);
    setConfirming(false);
    localStorage.removeItem('dentalai_conversation');
  }

  return (
    <div className="p-4 sm:p-6 overflow-y-auto scrollbar-thin h-full">
      <div className="flex items-start justify-between mb-0.5">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">Historial de mensajes</h2>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            onBlur={() => setConfirming(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
              confirming
                ? 'bg-red-500 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Trash2 size={13} />
            {confirming ? '¿Confirmar?' : 'Borrar todo'}
          </button>
        )}
      </div>
      <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">Se actualiza automáticamente cada pocos segundos.</p>
      <div className="space-y-2">
        {messages.length === 0 && <p className="text-slate-400 text-sm">Todavía no hay mensajes.</p>}
        {messages.map((m, i) => (
          <div key={i} className="flex items-start gap-2 sm:gap-3 bg-white rounded-xl p-2.5 sm:p-3 border border-slate-100">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm shrink-0 ${
              m.role === 'user' ? 'bg-slate-100' : 'bg-brand-100'
            }`}>
              {m.role === 'user' ? '🧑' : '👩‍⚕️'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  {m.role === 'user' ? 'Paciente' : 'Sarah'}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(m.created_at + 'Z').toLocaleString('es-AR')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 break-words">{m.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
