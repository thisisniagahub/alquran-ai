import { create } from 'zustand';

interface QuranState {
  currentSurah: number;
  currentAyat: number;
  selectedLanguages: string[];
  selectedReciter: string;
  theme: 'light' | 'dark';
  fontSize: number;
  audioPlaying: boolean;
  setCurrentSurah: (surah: number) => void;
  setCurrentAyat: (ayat: number) => void;
  setSelectedLanguages: (languages: string[]) => void;
  setSelectedReciter: (reciter: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setFontSize: (size: number) => void;
  setAudioPlaying: (playing: boolean) => void;
}

export const useQuranStore = create<QuranState>((set) => ({
  currentSurah: 1,
  currentAyat: 1,
  selectedLanguages: ['en', 'ms'],
  selectedReciter: 'ar.alafasy',
  theme: 'light',
  fontSize: 18,
  audioPlaying: false,
  
  setCurrentSurah: (surah) => set({ currentSurah: surah }),
  setCurrentAyat: (ayat) => set({ currentAyat: ayat }),
  setSelectedLanguages: (languages) => set({ selectedLanguages: languages }),
  setSelectedReciter: (reciter) => set({ selectedReciter: reciter }),
  setTheme: (theme) => set({ theme }),
  setFontSize: (size) => set({ fontSize: size }),
  setAudioPlaying: (playing) => set({ audioPlaying: playing }),
}));
