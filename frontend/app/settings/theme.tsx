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

const THEMES = [
  { 
    id: 'light', 
    label: 'Light', 
    icon: 'white-balance-sunny',
    description: 'Bright and clear for daytime reading'
  },
  { 
    id: 'dark', 
    label: 'Dark', 
    icon: 'moon-waning-crescent',
    description: 'Easy on the eyes in low light'
  },
];

export default function ThemeScreen() {
  const router = useRouter();
  const { theme, setTheme } = useQuranStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theme</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Choose your preferred theme for the app
        </Text>

        {THEMES.map((themeOption) => (
          <TouchableOpacity
            key={themeOption.id}
            style={[
              styles.themeCard,
              theme === themeOption.id && styles.themeCardSelected
            ]}
            onPress={() => setTheme(themeOption.id as 'light' | 'dark')}
          >
            <View style={styles.themeIcon}>
              <MaterialCommunityIcons 
                name={themeOption.icon as any} 
                size={32} 
                color={theme === themeOption.id ? '#10b981' : '#6b7280'} 
              />
            </View>
            <View style={styles.themeInfo}>
              <Text style={styles.themeLabel}>{themeOption.label}</Text>
              <Text style={styles.themeDescription}>{themeOption.description}</Text>
            </View>
            {theme === themeOption.id && (
              <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.noteCard}>
          <MaterialCommunityIcons name="information" size={24} color="#6366f1" />
          <Text style={styles.noteText}>
            Dark theme is coming soon! We're working on making it perfect for your reading experience.
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
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  themeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  themeInfo: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    color: '#6b7280',
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
