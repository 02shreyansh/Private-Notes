import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const notesApi = {
  getAll: () => api.get<Note[]>('/api/notes'),
  getById: (id: string) => api.get<Note>(`/api/notes/${id}`),
  create: (data: { title: string; content: string }) => 
    api.post<Note>('/api/notes', data),
  update: (id: string, data: { title: string; content: string }) => 
    api.put<Note>(`/api/notes/${id}`, data),
  delete: (id: string) => api.delete(`/api/notes/${id}`),
};

export default api;