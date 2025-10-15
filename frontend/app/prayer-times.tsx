import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

interface PrayerTime {
  name: string;
  time: string;
  icon: string;
}

export default function PrayerTimesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    requestLocationAndLoadTimes();
  }, []);

  const requestLocationAndLoadTimes = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to show accurate prayer times for your area.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      await loadPrayerTimes(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location');
      setLoading(false);
    }
  };

  const loadPrayerTimes = async (latitude: number, longitude: number) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=3`
      );
      
      const data = await response.json();
      
      if (data.code === 200 && data.data) {
        const timings = data.data.timings;
        setPrayerTimes([
          { name: 'Fajr', time: timings.Fajr, icon: 'weather-sunset-up' },
          { name: 'Dhuhr', time: timings.Dhuhr, icon: 'weather-sunny' },
          { name: 'Asr', time: timings.Asr, icon: 'weather-sunset-down' },
          { name: 'Maghrib', time: timings.Maghrib, icon: 'weather-sunset' },
          { name: 'Isha', time: timings.Isha, icon: 'weather-night' },
        ]);
      }
    } catch (error) {
      console.error('Prayer times error:', error);
      Alert.alert('Error', 'Could not load prayer times');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPrayer = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (let i = 0; i < prayerTimes.length; i++) {
      const [hours, minutes] = prayerTimes[i].time.split(':').map(Number);
      const prayerTimeInMinutes = hours * 60 + minutes;
      
      if (currentTime < prayerTimeInMinutes) {
        return i;
      }
    }
    return 0;
  };

  const nextPrayerIndex = getCurrentPrayer();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prayer Times</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading prayer times...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prayer Times</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Date Display */}
        <View style={styles.dateCard}>
          <Text style={styles.dateText}>
            {date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          {location && (
            <View style={styles.locationInfo}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#6b7280" />
              <Text style={styles.locationText}>
                {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Prayer Times List */}
        <View style={styles.prayerList}>
          {prayerTimes.map((prayer, index) => {
            const isNext = index === nextPrayerIndex;
            return (
              <View 
                key={prayer.name} 
                style={[
                  styles.prayerCard,
                  isNext && styles.prayerCardActive
                ]}
              >
                <View style={styles.prayerLeft}>
                  <View style={[
                    styles.prayerIcon,
                    isNext && styles.prayerIconActive
                  ]}>
                    <MaterialCommunityIcons 
                      name={prayer.icon as any} 
                      size={28} 
                      color={isNext ? '#fff' : '#10b981'} 
                    />
                  </View>
                  <View>
                    <Text style={[
                      styles.prayerName,
                      isNext && styles.prayerNameActive
                    ]}>
                      {prayer.name}
                    </Text>
                    {isNext && (
                      <Text style={styles.nextLabel}>Next Prayer</Text>
                    )}
                  </View>
                </View>
                <Text style={[
                  styles.prayerTime,
                  isNext && styles.prayerTimeActive
                ]}>
                  {prayer.time}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Qibla Button */}
        <TouchableOpacity 
          style={styles.qiblaButton}
          onPress={() => router.push('/qibla')}
        >
          <MaterialCommunityIcons name="compass" size={24} color="#fff" />
          <Text style={styles.qiblaButtonText}>Find Qibla Direction</Text>
        </TouchableOpacity>
      </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  prayerList: {
    flex: 1,
  },
  prayerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  prayerCardActive: {
    backgroundColor: '#10b981',
    elevation: 4,
    shadowOpacity: 0.2,
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  prayerIconActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  prayerNameActive: {
    color: '#fff',
  },
  nextLabel: {
    fontSize: 12,
    color: '#d1fae5',
    marginTop: 2,
  },
  prayerTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  prayerTimeActive: {
    color: '#fff',
  },
  qiblaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  qiblaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});
