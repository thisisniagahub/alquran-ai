import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { quranAPI, bookmarkAPI, progressAPI, aiAPI } from '../../lib/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuranStore } from '../../store/quranStore';

export default function ReadScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [surahData, setSurahData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<number>>(new Set());
  const [loadingBookmark, setLoadingBookmark] = useState<number | null>(null);
  const { currentSurah, setCurrentSurah, fontSize } = useQuranStore();
  
  const surahNumber = params.surah ? Number(params.surah) : currentSurah;

  useEffect(() => {
    loadSurah(surahNumber);
    loadBookmarks();
  }, [surahNumber]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (surahData) {
        saveProgress(surahNumber, 1);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [surahNumber, surahData]);

  const loadSurah = async (number: number) => {
    try {
      setLoading(true);
      const response = await quranAPI.getSurahWithTranslations(number, 'en,ms');
      setSurahData(response.data.data);
      setCurrentSurah(number);
    } catch (error) {
      console.error('Error loading surah:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    try {
      const response = await bookmarkAPI.getBookmarks();
      const bookmarks = response.data.bookmarks || [];
      const ayahNumbers = new Set(
        bookmarks
          .filter((b: any) => b.surah_number === surahNumber)
          .map((b: any) => b.ayat_number)
      );
      setBookmarkedAyahs(ayahNumbers);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const saveProgress = async (surah: number, ayat: number) => {
    try {
      await progressAPI.updateProgress(surah, ayat, 30);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const toggleBookmark = async (ayahNumber: number) => {
    const isBookmarked = bookmarkedAyahs.has(ayahNumber);
    setLoadingBookmark(ayahNumber);

    try {
      if (isBookmarked) {
        const response = await bookmarkAPI.getBookmarks();
        const bookmark = response.data.bookmarks.find(
          (b: any) => b.surah_number === surahNumber && b.ayat_number === ayahNumber
        );
        if (bookmark) {
          await bookmarkAPI.deleteBookmark(bookmark._id);
          setBookmarkedAyahs(prev => {
            const newSet = new Set(prev);
            newSet.delete(ayahNumber);
            return newSet;
          });
        }
      } else {
        await bookmarkAPI.createBookmark(surahNumber, ayahNumber);
        setBookmarkedAyahs(prev => new Set(prev).add(ayahNumber));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update bookmark');
      console.error('Bookmark error:', error);
    } finally {
      setLoadingBookmark(null);
    }
  };

  const explainVerse = (ayahNumber: number) => {
    router.push({
      pathname: '/ai-chat',
      params: { surah: surahNumber, ayat: ayahNumber }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const arabicSurah = surahData?.[0];
  const translationSurah = surahData?.[1];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.surahTitle}>
          {arabicSurah?.englishName || 'Al-Quran'}
        </Text>
        <Text style={styles.surahSubtitle}>
          {arabicSurah?.englishNameTranslation} • {arabicSurah?.numberOfAyahs} verses
        </Text>
      </View>

      {/* Bismillah */}
      {surahNumber !== 1 && surahNumber !== 9 && (
        <View style={styles.bismillahContainer}>
          <Text style={styles.bismillahText}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {arabicSurah?.ayahs?.map((ayah: any, index: number) => {
          const translation = translationSurah?.ayahs[index];
          return (
            <View key={ayah.number} style={styles.verseContainer}>
              {/* Verse Number */}
              <View style={styles.verseHeader}>
                <View style={styles.verseNumberBadge}>
                  <Text style={styles.verseNumber}>{ayah.numberInSurah}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => toggleBookmark(ayah.numberInSurah)}
                  disabled={loadingBookmark === ayah.numberInSurah}
                >
                  <MaterialCommunityIcons 
                    name={bookmarkedAyahs.has(ayah.numberInSurah) ? "bookmark" : "bookmark-outline"} 
                    size={20} 
                    color={bookmarkedAyahs.has(ayah.numberInSurah) ? "#10b981" : "#6b7280"}
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <MaterialCommunityIcons name="play-circle-outline" size={20} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => explainVerse(ayah.numberInSurah)}
                >
                  <MaterialCommunityIcons name="robot-outline" size={20} color="#10b981" />
                </TouchableOpacity>
              </View>

              {/* Arabic Text */}
              <Text style={[styles.arabicText, { fontSize: fontSize + 6 }]}>
                {ayah.text}
              </Text>

              {/* Translation */}
              {translation && (
                <Text style={[styles.translationText, { fontSize }]}>
                  {translation.text}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => surahNumber > 1 && loadSurah(surahNumber - 1)}
          disabled={surahNumber === 1}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={surahNumber === 1 ? '#d1d5db' : '#1f2937'} />
          <Text style={[styles.controlText, surahNumber === 1 && styles.controlTextDisabled]}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.playButton}>
          <MaterialCommunityIcons name="play" size={32} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => surahNumber < 114 && loadSurah(surahNumber + 1)}
          disabled={surahNumber === 114}
        >
          <Text style={[styles.controlText, surahNumber === 114 && styles.controlTextDisabled]}>Next</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={surahNumber === 114 ? '#d1d5db' : '#1f2937'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  surahTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  surahSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  bismillahContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  bismillahText: {
    fontSize: 24,
    color: '#10b981',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  verseContainer: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  verseNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  verseNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 42,
    textAlign: 'right',
    color: '#1f2937',
    marginBottom: 12,
  },
  translationText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#4b5563',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 14,
    color: '#1f2937',
    marginHorizontal: 4,
  },
  controlTextDisabled: {
    color: '#d1d5db',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
