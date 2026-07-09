import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, Clock, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';

const BENEFICIOS = [
  { icon: MessageSquare, title: 'Atención 24/7',     text: 'Sarah responde a tus pacientes en cualquier momento, con calidez y precisión.' },
  { icon: CalendarCheck, title: 'Agenda sin errores', text: 'Verifica disponibilidad y nunca pisa un horario ya tomado.' },
  { icon: Clock,         title: 'Ahorrás tiempo',    text: 'Menos llamados, menos idas y vueltas. Todo desde un chat.' },
  { icon: Sparkles,      title: 'Impulsado por IA',  text: 'Entiende lenguaje natural y se adapta a los datos de tu clínica.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      <header className="flex items-center justify-between px-5 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="codearg" className="h-7 w-auto" />
        </div>
        <Link
          to="/panel"
          className="text-sm font-medium text-brand-700 hover:text-brand-900 flex items-center gap-1"
        >
          Panel <ArrowRight size={14} />
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-10 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs px-3 py-1.5 rounded-full mb-5">
            <Sparkles size={12} /> Recepcionista virtual con IA
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
            Conocé a <span className="text-brand-600">Sarah</span>,{' '}
            <span className="block">la recepcionista de tu clínica</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 mb-7">
            Agenda, cancela y reprograma turnos conversando en español, dentro de tu propio panel.
          </p>
          <Link
            to="/panel"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3.5 rounded-2xl font-semibold text-base shadow-lg shadow-brand-600/20 hover:bg-brand-700 transition-all"
          >
            Entrar al panel <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Chat preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-3xl shadow-2xl shadow-brand-900/10 p-4 border border-slate-100 mt-4 md:mt-0"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-lg">👩‍⚕️</div>
            <div>
              <div className="font-semibold text-slate-800 text-sm">Sarah</div>
              <div className="text-xs text-green-500">En línea</div>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="bg-slate-100 text-slate-700 text-sm px-3.5 py-2.5 rounded-2xl rounded-tl-md w-fit max-w-[85%]">
              ¡Hola! 👋 Soy Sarah. ¿Querés agendar un turno?
            </div>
            <div className="bg-brand-600 text-white text-sm px-3.5 py-2.5 rounded-2xl rounded-tr-md w-fit max-w-[85%] ml-auto">
              Sí, para una limpieza dental el jueves
            </div>
            <div className="bg-slate-100 text-slate-700 text-sm px-3.5 py-2.5 rounded-2xl rounded-tl-md w-fit max-w-[85%]">
              ¡Genial! Tengo libre a las 10:00 y a las 14:30. ¿Cuál te viene mejor? 😊
            </div>
          </div>
        </motion.div>
      </section>

      {/* Beneficios */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-10">¿Por qué DentalAI?</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {BENEFICIOS.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-sm"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 mb-3">
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 text-sm sm:text-base">{title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-100">
        DentalAI · Recepcionista virtual para Clínica Dental Sonrisa
      </footer>
    </div>
  );
}
