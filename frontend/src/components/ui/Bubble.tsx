import { motion } from 'framer-motion';
import type { Role } from '../../types';

export default function Bubble({ role, content }: { role: Role; content: string }) {
  const isUser = role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] px-4 py-2.5 shadow-sm whitespace-pre-wrap leading-relaxed ${
          isUser
            ? 'bg-brand-600 text-white rounded-2xl rounded-tr-md'
            : 'bg-white text-slate-800 rounded-2xl rounded-tl-md'
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
}
