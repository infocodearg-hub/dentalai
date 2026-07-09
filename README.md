# DentalAI — Recepcionista virtual Sarah

App web para "Clínica Dental Sonrisa" con una recepcionista IA (Sarah, GPT-4o) integrada en el panel.

## Requisitos
- Node.js 18+
- Una clave de API de OpenAI

## Puesta en marcha
1. Configurá tu clave: copiá `backend/.env.example` a `backend/.env` y pegá tu `OPENAI_API_KEY`.
2. Backend: `cd backend && npm install && npm run seed && npm start`
3. Frontend: `cd frontend && npm install && npm run dev`
4. Abrí http://localhost:5173

## Estructura
- `backend/` — Express + SQLite + OpenAI (function calling)
- `frontend/` — React + Vite + Tailwind
