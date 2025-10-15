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

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', translation: 'Sahih International' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', translation: 'Basmeih' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', translation: 'Jalandhry' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', translation: 'Ministry of Religious Affairs' },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { selectedLanguages, setSelectedLanguages } = useQuranStore();

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter(l => l !== code));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, code]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translation Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Select one or more translation languages. At least one language must be selected.
        </Text>

        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageCard,
              selectedLanguages.includes(lang.code) && styles.languageCardSelected
            ]}
            onPress={() => toggleLanguage(lang.code)}
          >
            <Text style={styles.flag}>{lang.flag}</Text>
            <View style={styles.languageInfo}>
              <Text style={styles.languageName}>{lang.name}</Text>
              <Text style={styles.translationName}>{lang.translation}</Text>
            </View>
            {selectedLanguages.includes(lang.code) ? (
              <MaterialCommunityIcons name="checkbox-marked-circle" size={24} color="#10b981" />
            ) : (
              <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={24} color="#d1d5db" />
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.noteCard}>
          <MaterialCommunityIcons name="information" size={20} color="#6366f1" />
          <Text style={styles.noteText}>
            Multiple translations will be displayed side by side when reading
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
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  translationName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
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
  },
});
