import axios from 'axios';
import type { Appointment, ChatMessage, HistoryMessage, Settings } from './types';

const api = axios.create({ baseURL: '/api' });

export async function newConversation(): Promise<string> {
  const { data } = await api.post('/chat/new');
  return data.conversationId;
}

export async function getConversation(id: string): Promise<ChatMessage[]> {
  const { data } = await api.get(`/chat/${id}`);
  return data.messages;
}

export async function sendMessage(id: string, content: string): Promise<string> {
  const { data } = await api.post(`/chat/${id}/message`, { content });
  return data.reply;
}

export async function clearConversation(id: string): Promise<void> {
  await api.delete(`/chat/${id}`);
}

export async function getHistory(): Promise<HistoryMessage[]> {
  const { data } = await api.get('/history');
  return data.messages;
}

export async function getAppointments(): Promise<Appointment[]> {
  const { data } = await api.get('/appointments');
  return data.appointments;
}

export async function getSettings(): Promise<Settings> {
  const { data } = await api.get('/settings');
  return data.settings;
}

export async function saveSettings(s: Settings): Promise<void> {
  await api.put('/settings', s);
}
