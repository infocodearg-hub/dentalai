import { MessageCircle, Clock, CalendarDays, Settings2 } from 'lucide-react';

export type TabId = 'chat' | 'history' | 'appointments' | 'settings';

const TABS: { id: TabId; label: string; icon: typeof MessageCircle }[] = [
  { id: 'chat', label: 'Chat con Sarah', icon: MessageCircle },
  { id: 'history', label: 'Historial', icon: Clock },
  { id: 'appointments', label: 'Turnos', icon: CalendarDays },
  { id: 'settings', label: 'Configuración', icon: Settings2 },
];

export default function Sidebar({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col p-4 shrink-0">
      <div className="flex items-center gap-2 px-2 py-4 mb-4">
        <span className="text-3xl">🦷</span>
        <div>
          <div className="font-extrabold text-brand-700 leading-tight">DentalAI</div>
          <div className="text-xs text-slate-400">Panel de administración</div>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              active === id ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
