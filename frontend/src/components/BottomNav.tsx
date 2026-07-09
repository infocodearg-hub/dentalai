import { MessageCircle, Clock, CalendarDays, Settings2 } from 'lucide-react';
import type { TabId } from './Sidebar';

const TABS: { id: TabId; label: string; icon: typeof MessageCircle }[] = [
  { id: 'chat',         label: 'Chat',       icon: MessageCircle },
  { id: 'history',      label: 'Historial',  icon: Clock },
  { id: 'appointments', label: 'Turnos',     icon: CalendarDays },
  { id: 'settings',     label: 'Config',     icon: Settings2 },
];

export default function BottomNav({ active, onChange }: { active: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="flex border-t border-slate-100 bg-white safe-bottom">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            active === id ? 'text-brand-600' : 'text-slate-400'
          }`}
        >
          <Icon size={20} strokeWidth={active === id ? 2.5 : 1.8} />
          {label}
        </button>
      ))}
    </nav>
  );
}
