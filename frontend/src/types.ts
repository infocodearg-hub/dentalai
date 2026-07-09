export type Role = 'user' | 'assistant';

export interface ChatMessage {
  role: Role;
  content: string;
  created_at?: string;
}

export interface HistoryMessage {
  conversation_id: string;
  role: Role;
  content: string;
  created_at: string;
}

export interface Appointment {
  id: number;
  date: string;
  time: string;
  patient_name: string;
  patient_phone: string | null;
  service: string;
  status: 'activo' | 'cancelado' | 'completado';
  created_at: string;
}

export interface Settings {
  clinic_name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  services: string[];
  description: string;
}
