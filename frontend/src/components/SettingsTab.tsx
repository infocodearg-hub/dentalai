import { useEffect, useState } from 'react';
import { Save, Plus, X } from 'lucide-react';
import { getSettings, saveSettings } from '../api';
import type { Settings } from '../types';

export default function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [newService, setNewService] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {});
  }, []);

  if (!settings) return <div className="p-6 text-slate-400 text-sm">Cargando...</div>;

  const upd = (k: keyof Settings, v: Settings[keyof Settings]) => setSettings({ ...settings, [k]: v });

  async function handleSave() {
    await saveSettings(settings!);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const field = 'w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-400 text-sm';

  return (
    <div className="p-4 sm:p-6 overflow-y-auto scrollbar-thin h-full">
      <div className="max-w-2xl">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-0.5">Configuración de la clínica</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-5">Sarah usa estos datos para responderle a los pacientes.</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">Nombre</label>
            <input className={field} value={settings.clinic_name} onChange={(e) => upd('clinic_name', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">Teléfono</label>
              <input className={field} value={settings.phone} onChange={(e) => upd('phone', e.target.value)} />
            </div>
            <div>
              <label className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">Email</label>
              <input className={field} value={settings.email} onChange={(e) => upd('email', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">Dirección</label>
            <input className={field} value={settings.address} onChange={(e) => upd('address', e.target.value)} />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">Horarios</label>
            <input className={field} value={settings.hours} onChange={(e) => upd('hours', e.target.value)} />
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">Servicios</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {settings.services.map((s, i) => (
                <span key={i} className="flex items-center gap-1 bg-brand-100 text-brand-700 text-xs sm:text-sm px-2.5 py-1 rounded-full">
                  {s}
                  <button
                    onClick={() => upd('services', settings.services.filter((_, j) => j !== i))}
                    className="ml-0.5 hover:text-brand-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className={field}
                value={newService}
                placeholder="Agregar servicio"
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newService.trim()) {
                    upd('services', [...settings.services, newService.trim()]);
                    setNewService('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newService.trim()) {
                    upd('services', [...settings.services, newService.trim()]);
                    setNewService('');
                  }
                }}
                className="px-3.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 active:bg-slate-300 shrink-0"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">Descripción general</label>
            <textarea
              className={`${field} min-h-[90px] resize-y`}
              value={settings.description}
              onChange={(e) => upd('description', e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 active:bg-brand-800 transition-colors"
          >
            <Save size={16} /> {saved ? '¡Guardado! ✓' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
