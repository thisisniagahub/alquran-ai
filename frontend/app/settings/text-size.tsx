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

const FONT_SIZES = [
  { label: 'Small', value: 14, sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { label: 'Medium', value: 18, sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { label: 'Large', value: 22, sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
  { label: 'Extra Large', value: 26, sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
];

export default function TextSizeScreen() {
  const router = useRouter();
  const { fontSize, setFontSize } = useQuranStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Text Size</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Choose your preferred text size for reading the Quran
        </Text>

        {FONT_SIZES.map((size) => (
          <TouchableOpacity
            key={size.value}
            style={[
              styles.sizeCard,
              fontSize === size.value && styles.sizeCardSelected
            ]}
            onPress={() => setFontSize(size.value)}
          >
            <View style={styles.sizeHeader}>
              <Text style={styles.sizeLabel}>{size.label}</Text>
              {fontSize === size.value && (
                <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
              )}
            </View>
            <Text style={[styles.sampleText, { fontSize: size.value + 6 }]}>
              {size.sample}
            </Text>
            <Text style={[styles.translationSample, { fontSize: size.value }]}>
              In the name of Allah, the Most Gracious, the Most Merciful
            </Text>
          </TouchableOpacity>
        ))}
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
  sizeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sizeCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  sampleText: {
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 8,
  },
  translationSample: {
    textAlign: 'center',
    color: '#6b7280',
  },
});
