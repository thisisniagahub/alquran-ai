import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuranStore } from '../../store/quranStore';

const RECITERS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', country: '🇰🇼 Kuwait' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)', country: '🇪🇬 Egypt' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdur-Rahman As-Sudais', country: '🇸🇦 Saudi Arabia' },
  { id: 'ar.saadalghamadi', name: 'Saad Al-Ghamadi', country: '🇸🇦 Saudi Arabia' },
  { id: 'ar.mahmoudkhalilalhussary', name: 'Mahmoud Khalil Al-Hussary', country: '🇪🇬 Egypt' },
  { id: 'ar.muhammadayyoub', name: 'Muhammad Ayyoub', country: '🇸🇦 Saudi Arabia' },
  { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify', country: '🇸🇦 Saudi Arabia' },
];

export default function ReciterScreen() {
  const router = useRouter();
  const { selectedReciter, setSelectedReciter } = useQuranStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reciter</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Choose your preferred reciter for Quran audio
        </Text>

        {RECITERS.map((reciter) => (
          <TouchableOpacity
            key={reciter.id}
            style={[
              styles.reciterCard,
              selectedReciter === reciter.id && styles.reciterCardSelected
            ]}
            onPress={() => setSelectedReciter(reciter.id)}
          >
            <View style={styles.reciterIcon}>
              <MaterialCommunityIcons 
                name="account-voice" 
                size={28} 
                color={selectedReciter === reciter.id ? '#10b981' : '#6b7280'} 
              />
            </View>
            <View style={styles.reciterInfo}>
              <Text style={styles.reciterName}>{reciter.name}</Text>
              <Text style={styles.reciterCountry}>{reciter.country}</Text>
            </View>
            {selectedReciter === reciter.id ? (
              <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
            ) : (
              <TouchableOpacity style={styles.playButton}>
                <MaterialCommunityIcons name="play-circle-outline" size={24} color="#6b7280" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.noteCard}>
          <MaterialCommunityIcons name="information" size={20} color="#6366f1" />
          <Text style={styles.noteText}>
            Audio playback feature is coming soon. You'll be able to listen to beautiful Quran recitations.
          </Text>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  reciterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reciterCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  reciterIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  reciterInfo: {
    flex: 1,
  },
  reciterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  reciterCountry: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  playButton: {
    padding: 4,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#4338ca',
    marginLeft: 12,
    lineHeight: 20,
  },
});
