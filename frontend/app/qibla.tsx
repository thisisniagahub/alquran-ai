import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

export default function QiblaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [currentHeading, setCurrentHeading] = useState(0);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const rotateAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    requestLocationAndCalculateQibla();
  }, []);

  const requestLocationAndCalculateQibla = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to calculate Qibla direction.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const lat = currentLocation.coords.latitude;
      const lng = currentLocation.coords.longitude;
      
      setLocation({ latitude: lat, longitude: lng });

      const qibla = calculateQiblaDirection(lat, lng);
      setQiblaDirection(qibla);
      setLoading(false);

      subscribeToCompass();
    } catch (error) {
      console.error('Qibla error:', error);
      Alert.alert('Error', 'Could not calculate Qibla direction');
      setLoading(false);
    }
  };

  const calculateQiblaDirection = (lat: number, lng: number): number => {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const toDeg = (rad: number) => rad * (180 / Math.PI);

    const latRad = toRad(lat);
    const lngRad = toRad(lng);
    const kaabaLatRad = toRad(KAABA_LAT);
    const kaabaLngRad = toRad(KAABA_LNG);

    const dLng = kaabaLngRad - lngRad;

    const y = Math.sin(dLng) * Math.cos(kaabaLatRad);
    const x = Math.cos(latRad) * Math.sin(kaabaLatRad) -
              Math.sin(latRad) * Math.cos(kaabaLatRad) * Math.cos(dLng);

    let bearing = toDeg(Math.atan2(y, x));
    bearing = (bearing + 360) % 360;

    return bearing;
  };

  const subscribeToCompass = async () => {
    try {
      // Note: Compass might not work on all devices/simulators
      Location.watchHeadingAsync((heading) => {
        const trueHeading = heading.trueHeading || heading.magHeading;
        setCurrentHeading(trueHeading);
        
        Animated.spring(rotateAnim, {
          toValue: -trueHeading,
          useNativeDriver: true,
          friction: 8,
        }).start();
      });
    } catch (error) {
      console.log('Compass not available:', error);
    }
  };

  const getRelativeDirection = () => {
    const relative = (qiblaDirection - currentHeading + 360) % 360;
    return relative;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Qibla Direction</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Finding Qibla direction...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const relativeDirection = getRelativeDirection();
  const isAligned = Math.abs(relativeDirection) < 5 || Math.abs(relativeDirection) > 355;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Qibla Direction</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Point your device towards Kaaba</Text>
          <Text style={styles.infoText}>
            Qibla Direction: {qiblaDirection.toFixed(1)}°
          </Text>
          {location && (
            <Text style={styles.infoText}>
              Your Location: {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
            </Text>
          )}
        </View>

        {/* Compass */}
        <View style={styles.compassContainer}>
          <Animated.View
            style={[
              styles.compass,
              {
                transform: [{ rotate: rotateAnim.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg']
                })}]
              }
            ]}
          >
            {/* Compass Rose */}
            <View style={styles.compassRose}>
              <View style={styles.compassDirection}>
                <Text style={styles.compassDirectionText}>N</Text>
              </View>
              <View style={[styles.compassDirection, { top: 'auto', bottom: 8 }]}>
                <Text style={styles.compassDirectionText}>S</Text>
              </View>
              <View style={[styles.compassDirection, { left: 8, right: 'auto' }]}>
                <Text style={styles.compassDirectionText}>W</Text>
              </View>
              <View style={[styles.compassDirection, { left: 'auto', right: 8 }]}>
                <Text style={styles.compassDirectionText}>E</Text>
              </View>
            </View>

            {/* Qibla Indicator */}
            <Animated.View
              style={[
                styles.qiblaIndicator,
                {
                  transform: [
                    { rotate: `${qiblaDirection}deg` }
                  ]
                }
              ]}
            >
              <View style={[styles.qiblaArrow, isAligned && styles.qiblaArrowAligned]}>
                <MaterialCommunityIcons 
                  name="navigation" 
                  size={48} 
                  color={isAligned ? '#10b981' : '#6366f1'} 
                />
              </View>
            </Animated.View>
          </Animated.View>

          {/* Center Kaaba Icon */}
          <View style={styles.centerIcon}>
            <MaterialCommunityIcons name="star-crescent" size={32} color="#10b981" />
          </View>
        </View>

        {/* Status */}
        <View style={[styles.statusCard, isAligned && styles.statusCardAligned]}>
          <MaterialCommunityIcons 
            name={isAligned ? "check-circle" : "information"} 
            size={24} 
            color={isAligned ? "#10b981" : "#6366f1"} 
          />
          <Text style={[styles.statusText, isAligned && styles.statusTextAligned]}>
            {isAligned 
              ? 'Aligned with Qibla! ✓' 
              : 'Rotate your device to align with Qibla'}
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <Text style={styles.instructionsText}>
            • Hold your device flat{'\n'}
            • Rotate until the arrow points towards the icon{'\n'}
            • The arrow will turn green when aligned{'\n'}
            • Face the direction indicated
          </Text>
        </View>
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
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  compass: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  compassRose: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  compassDirection: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  compassDirectionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  qiblaIndicator: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  qiblaArrow: {
    marginTop: 20,
  },
  qiblaArrowAligned: {
    transform: [{ scale: 1.2 }],
  },
  centerIcon: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  statusCardAligned: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 12,
  },
  statusTextAligned: {
    color: '#10b981',
  },
  instructions: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
});
