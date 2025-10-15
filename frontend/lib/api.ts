import axios from 'axios';
import Constants from 'expo-constants';
import { supabase } from './supabase';

const API_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
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

export default api;

// API Methods
export const quranAPI = {
  getSurahs: () => api.get('/quran/surahs'),
  getSurah: (surahNumber: number, edition: string = 'quran-uthmani') => 
    api.get(`/quran/surah/${surahNumber}`, { params: { edition } }),
  getSurahWithTranslations: (surahNumber: number, languages: string = 'en,ms') =>
    api.get(`/quran/surah/${surahNumber}/translations`, { params: { languages } }),
  getAyah: (surahNumber: number, ayatNumber: number, edition: string = 'quran-uthmani') =>
    api.get(`/quran/ayah/${surahNumber}/${ayatNumber}`, { params: { edition } }),
  getJuz: (juzNumber: number, edition: string = 'quran-uthmani') =>
    api.get(`/quran/juz/${juzNumber}`, { params: { edition } }),
  search: (query: string, edition: string = 'quran-simple') =>
    api.get('/quran/search', { params: { q: query, edition } }),
  getEditions: () => api.get('/quran/editions'),
};

export const aiAPI = {
  chat: (message: string, context?: any) =>
    api.post('/ai/chat', { message, context }),
  explainVerse: (surahNumber: number, ayatNumber: number, language: string = 'en') =>
    api.post('/ai/explain-verse', { surah_number: surahNumber, ayat_number: ayatNumber, language }),
  getContextHelp: (screen: string, query?: string) =>
    api.post('/ai/context-help', { screen, query }),
};

export const bookmarkAPI = {
  getBookmarks: () => api.get('/bookmarks'),
  createBookmark: (surahNumber: number, ayatNumber: number, note?: string) =>
    api.post('/bookmarks', { surah_number: surahNumber, ayat_number: ayatNumber, note }),
  deleteBookmark: (bookmarkId: string) => api.delete(`/bookmarks/${bookmarkId}`),
};

export const progressAPI = {
  updateProgress: (surahNumber: number, ayatNumber: number, timeSpent: number) =>
    api.post('/progress/update', { 
      surah_number: surahNumber, 
      ayat_number: ayatNumber, 
      time_spent: timeSpent,
      timestamp: new Date().toISOString()
    }),
  getProgress: () => api.get('/progress'),
};

export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: any) => api.put('/profile', data),
};
