import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { progressAPI } from '../lib/api';

export default function ProgressScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<any>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const response = await progressAPI.getProgress();
      setProgressData(response.data);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reading Progress</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </SafeAreaView>
    );
  }

  const currentProgress = progressData?.current_progress || {};
  const streak = progressData?.streak || {};
  const history = progressData?.history || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reading Progress</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Current Position */}
        {currentProgress.last_surah && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="book-open-page-variant" size={24} color="#10b981" />
              <Text style={styles.cardTitle}>Continue Reading</Text>
            </View>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push({
                pathname: '/(tabs)/read',
                params: { surah: currentProgress.last_surah }
              })}
            >
              <Text style={styles.continueText}>
                Surah {currentProgress.last_surah}, Ayat {currentProgress.last_ayat}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#10b981" />
            </TouchableOpacity>
          </View>
        )}

        {/* Streak */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="fire" size={24} color="#f59e0b" />
            <Text style={styles.cardTitle}>Reading Streak</Text>
          </View>
          <View style={styles.streakContainer}>
            <View style={styles.streakItem}>
              <Text style={styles.streakNumber}>{streak.current_streak || 0}</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Text style={styles.streakNumber}>{streak.longest_streak || 0}</Text>
              <Text style={styles.streakLabel}>Longest Streak</Text>
            </View>
          </View>
          <Text style={styles.streakNote}>
            {streak.current_streak > 0 
              ? 'Keep it up! Read daily to maintain your streak.'
              : 'Start reading today to begin your streak!'}
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="chart-line" size={24} color="#6366f1" />
            <Text style={styles.cardTitle}>Statistics</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="book-multiple" size={32} color="#6366f1" />
              <Text style={styles.statValue}>{history.length}</Text>
              <Text style={styles.statLabel}>Reading Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="clock-outline" size={32} color="#ec4899" />
              <Text style={styles.statValue}>
                {Math.floor(history.reduce((acc: number, h: any) => acc + (h.time_spent || 0), 0) / 60)}
              </Text>
              <Text style={styles.statLabel}>Minutes Read</Text>
            </View>
          </View>
        </View>

        {/* Recent History */}
        {history.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="history" size={24} color="#10b981" />
              <Text style={styles.cardTitle}>Recent Activity</Text>
            </View>
            {history.slice(0, 10).map((item: any, index: number) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <MaterialCommunityIcons name="book" size={16} color="#10b981" />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyText}>
                    Surah {item.surah_number}, Ayat {item.ayat_number}
                  </Text>
                  <Text style={styles.historyDate}>
                    {item.date ? new Date(item.date).toLocaleDateString() : 'Recently'}
                  </Text>
                </View>
                <Text style={styles.historyTime}>
                  {Math.floor((item.time_spent || 0) / 60)}m
                </Text>
              </View>
            ))}
          </View>
        )}

        {history.length === 0 && (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="book-open-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No reading history yet</Text>
            <Text style={styles.emptySubtext}>
              Start reading the Quran to track your progress
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push('/(tabs)/read')}
            >
              <Text style={styles.startButtonText}>Start Reading</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  streakLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  streakDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  streakNote: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  historyDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  historyTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
