import { useState } from 'react';
import Sidebar, { TabId } from '../components/Sidebar';
import ChatTab from '../components/ChatTab';
import HistoryTab from '../components/HistoryTab';
import AppointmentsTab from '../components/AppointmentsTab';
import SettingsTab from '../components/SettingsTab';

export default function Panel() {
  const [tab, setTab] = useState<TabId>('chat');
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar active={tab} onChange={setTab} />
      <main className="flex-1 min-w-0">
        {tab === 'chat' && <ChatTab />}
        {tab === 'history' && <HistoryTab />}
        {tab === 'appointments' && <AppointmentsTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}
