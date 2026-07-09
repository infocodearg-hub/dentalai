import { useState } from 'react';
import Sidebar, { TabId } from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import ChatTab from '../components/ChatTab';
import HistoryTab from '../components/HistoryTab';
import AppointmentsTab from '../components/AppointmentsTab';
import SettingsTab from '../components/SettingsTab';

export default function Panel() {
  const [tab, setTab] = useState<TabId>('chat');
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar solo en desktop */}
      <div className="hidden md:flex">
        <Sidebar active={tab} onChange={setTab} />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          {tab === 'chat' && <ChatTab />}
          {tab === 'history' && <HistoryTab />}
          {tab === 'appointments' && <AppointmentsTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>

        {/* Bottom nav solo en mobile */}
        <div className="md:hidden">
          <BottomNav active={tab} onChange={setTab} />
        </div>
      </main>
    </div>
  );
}
