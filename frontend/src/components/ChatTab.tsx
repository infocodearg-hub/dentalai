import { useEffect, useRef, useState } from 'react';
import { Send, Plus } from 'lucide-react';
import Bubble from './ui/Bubble';
import TypingIndicator from './ui/TypingIndicator';
import { newConversation, getConversation, sendMessage, clearConversation } from '../api';
import type { ChatMessage } from '../types';

const SUGERENCIAS = [
  'Quiero un turno para limpieza dental',
  '¿Qué horarios tenés libres esta semana?',
  'Necesito cancelar un turno',
  '¿Qué servicios ofrecen?',
];

export default function ChatTab() {
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      let id = localStorage.getItem('dentalai_conversation');
      if (!id) {
        id = await newConversation();
        localStorage.setItem('dentalai_conversation', id);
      }
      setConversationId(id);
      const msgs = await getConversation(id);
      setMessages(msgs);
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function handleSend(text: string) {
    const content = text.trim();
    if (!content || typing || !conversationId) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content }]);
    setTyping(true);
    try {
      const reply = await sendMessage(conversationId, content);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Uy, algo salió mal de mi lado. Probá de nuevo en un ratito. 🙏' },
      ]);
    } finally {
      setTyping(false);
    }
  }

  async function handleNew() {
    if (!conversationId) return;
    await clearConversation(conversationId);
    const id = await newConversation();
    localStorage.setItem('dentalai_conversation', id);
    setConversationId(id);
    setMessages([]);
  }

  const empty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-xl">👩‍⚕️</div>
          <div>
            <div className="font-semibold text-slate-800">Sarah</div>
            <div className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> En línea
            </div>
          </div>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <Plus size={16} /> Nueva conversación
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-4">
        {empty && (
          <div className="space-y-4">
            <Bubble
              role="assistant"
              content="¡Hola! 👋 Soy Sarah, la recepcionista de Clínica Dental Sonrisa. Puedo ayudarte a agendar, ver, cancelar o reprogramar tus turnos. ¿En qué te doy una mano?"
            />
            <div className="grid grid-cols-2 gap-2 pt-2">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left text-sm px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-brand-400 hover:text-brand-700 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} />
        ))}
        {typing && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Escribile a Sarah..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-brand-400 text-sm"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={typing}
            className="w-11 h-11 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
