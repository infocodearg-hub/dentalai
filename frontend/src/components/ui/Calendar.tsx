import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

export default function Calendar({ markedDates }: { markedDates: Set<string> }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // lunes = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100">
          <ChevronLeft size={18} />
        </button>
        <h3 className="font-semibold text-slate-800">{MESES[month]} {year}</h3>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-slate-100">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
        {DIAS.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const iso = `${year}-${pad(month + 1)}-${pad(d)}`;
          const marked = markedDates.has(iso);
          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg relative ${
                marked ? 'bg-brand-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d}
              {marked && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white/80" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
