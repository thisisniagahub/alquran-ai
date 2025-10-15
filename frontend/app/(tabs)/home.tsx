import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { quranAPI } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadSurahs();
    loadDailyVerse();
  }, []);

  const loadSurahs = async () => {
    try {
      const response = await quranAPI.getSurahs();
      setSurahs(response.data.data || []);
    } catch (error) {
      console.error('Error loading surahs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyVerse = async () => {
    try {
      const response = await quranAPI.getDailyVerse();
      if (response.data.success) {
        setDailyVerse(response.data.data);
      }
    } catch (error) {
      console.error('Error loading daily verse:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Guest'}</Text>
        </View>
        <TouchableOpacity style={styles.aiButton} onPress={() => router.push('/ai-chat')}>
          <MaterialCommunityIcons name="robot" size={28} color="#10b981" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Daily Verse Card */}
        <TouchableOpacity 
          style={styles.dailyCard}
          onPress={() => dailyVerse && router.push({
            pathname: '/(tabs)/read',
            params: { surah: dailyVerse.surah_number }
          })}
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="star-crescent" size={32} color="#fff" />
            <Text style={styles.dailyTitle}>Daily Verse</Text>
            {dailyVerse ? (
              <>
                <Text style={styles.dailyVerse} numberOfLines={2}>
                  {dailyVerse.translation}
                </Text>
                <Text style={styles.dailyReference}>
                  Surah {dailyVerse.surah_name} ({dailyVerse.surah_number}:{dailyVerse.ayah_number})
                </Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#fff" style={{ marginTop: 12 }} />
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/read')}>
            <View style={[styles.iconCircle, { backgroundColor: '#dbeafe' }]}>
              <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.actionText}>Continue Reading</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#fce7f3' }]}>
              <MaterialCommunityIcons name="headphones" size={24} color="#ec4899" />
            </View>
            <Text style={styles.actionText}>Listen</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/prayer-times')}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef3c7' }]}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Prayer Times</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/qibla')}>
            <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
              <MaterialCommunityIcons name="compass" size={24} color="#6366f1" />
            </View>
            <Text style={styles.actionText}>Qibla</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Surahs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Surahs</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.surahList}>
              {surahs.slice(0, 10).map((surah: any) => (
                <TouchableOpacity
                  key={surah.number}
                  style={styles.surahCard}
                  onPress={() => {
                    // Navigate to read screen with surah
                    router.push({ 
                      pathname: '/(tabs)/read',
                      params: { surah: surah.number }
                    });
                  }}
                >
                  <View style={styles.surahNumber}>
                    <Text style={styles.surahNumberText}>{surah.number}</Text>
                  </View>
                  <View style={styles.surahInfo}>
                    <Text style={styles.surahName}>{surah.englishName}</Text>
                    <Text style={styles.surahDetails}>
                      {surah.englishNameTranslation} • {surah.numberOfAyahs} verses
                    </Text>
                  </View>
                  <Text style={styles.surahArabic}>{surah.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating AI Assistant Button */}
      <TouchableOpacity style={styles.fabButton} onPress={() => router.push('/ai-chat')}>
        <MaterialCommunityIcons name="robot" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  aiButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyCard: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradientCard: {
    padding: 24,
  },
  dailyTitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 12,
    fontWeight: '600',
  },
  dailyVerse: {
    fontSize: 20,
    color: '#fff',
    marginTop: 8,
    fontWeight: 'bold',
  },
  dailyReference: {
    fontSize: 14,
    color: '#d1fae5',
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  surahList: {},
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  surahInfo: {
    flex: 1,
    marginLeft: 16,
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  surahDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  surahArabic: {
    fontSize: 20,
    color: '#10b981',
    fontWeight: 'bold',
  },
  fabButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
