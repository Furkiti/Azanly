import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
  Modal,
  Linking,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Geolocation from 'react-native-geolocation-service';
import { fetchPrayerTimes } from '../services/prayerTimes';
import { colors } from '../theme/colors';
import PrayerCard from '../components/PrayerCard';
import IconMaterialCommunity from 'react-native-vector-icons/MaterialCommunityIcons';

type RootStackParamList = {
  HomeMain: undefined;
  Dhikr: undefined;
  Qibla: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface PrayerTimesState {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface LocationInfo {
  city: string;
  district?: string;
}

interface NextPrayerInfo {
  name: string;
  time: string;
  remainingTime: string;
}

const PERMISSION_GRANTED_KEY = '@location_permission_granted';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesState | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);
  const [currentPrayerTime, setCurrentPrayerTime] = useState<string | null>(null);

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openSettings();
    } else {
      Linking.openSettings();
    }
  };

  const checkStoredPermission = async () => {
    try {
      const granted = await AsyncStorage.getItem(PERMISSION_GRANTED_KEY);
      console.log('Stored permission status:', granted);
      return granted === 'true';
    } catch (error) {
      console.error('Error checking stored permission:', error);
      return false;
    }
  };

  const setStoredPermission = async (granted: boolean) => {
    try {
      await AsyncStorage.setItem(PERMISSION_GRANTED_KEY, granted ? 'true' : 'false');
      console.log('Permission status stored:', granted);
    } catch (error) {
      console.error('Error storing permission:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      console.log('Requesting location permission...');
      
      // Check stored permission first
      const storedPermission = await checkStoredPermission();
      if (storedPermission) {
        console.log('Using stored permission: granted');
        setHasLocationPermission(true);
        setShowPermissionModal(false);
        return true;
      }

      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        console.log('iOS permission result:', auth);
        const hasPermission = auth === 'granted';
        setHasLocationPermission(hasPermission);
        if (hasPermission) {
          await setStoredPermission(true);
          setShowPermissionModal(false);
        }
        return hasPermission;
      }

      if (Platform.OS === 'android') {
        const fineGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Konum İzni',
            message: 'Namaz vakitlerini gösterebilmek için konum iznine ihtiyacımız var.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          },
        );

        console.log('Android permission result:', fineGranted);
        
        if (fineGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Konum İzni Gerekli',
            'Namaz vakitlerini gösterebilmek için konum iznine ihtiyacımız var. Lütfen uygulama ayarlarından konum iznini etkinleştirin.',
            [
              {
                text: 'Ayarlara Git',
                onPress: openSettings
              },
              {
                text: 'İptal',
                style: 'cancel'
              }
            ]
          );
          return false;
        }

        const hasPermission = fineGranted === PermissionsAndroid.RESULTS.GRANTED;
        setHasLocationPermission(hasPermission);
        if (hasPermission) {
          await setStoredPermission(true);
          setShowPermissionModal(false);
        }
        return hasPermission;
      }

      return false;
    } catch (err) {
      console.error('Permission request error:', err);
      setHasLocationPermission(false);
      return false;
    }
  };

  const getLocation = () => {
    console.log('Getting location...');
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('Position received:', position);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
          // Ankara'nın koordinatlarını varsayılan olarak kullan
          resolve({
            latitude: 39.9334,
            longitude: 32.8597
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  };

  const loadPrayerTimes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting to load prayer times...');
      
      if (!hasLocationPermission) {
        console.log('No location permission, showing modal');
        setShowPermissionModal(true);
        setLoading(false);
        return;
      }

      console.log('Getting location...');
      const coords = await getLocation();
      console.log('Location received:', coords);

      console.log('Fetching prayer times...');
      const response = await fetchPrayerTimes(coords.latitude, coords.longitude);
      console.log('Prayer times response:', response);

      if (!response.times) {
        throw new Error('Namaz vakitleri alınamadı: Veri yok');
      }

      setPrayerTimes(response.times);
      setLocation(response.location);
      setError(null);

      // Namaz vakitleri yüklendikten sonra hesaplamaları yap
      calculateNextPrayer();
    } catch (error: any) {
      console.error('Error in loadPrayerTimes:', error);
      setError(error?.message || 'Namaz vakitleri alınırken bir hata oluştu');
      setPrayerTimes(null);
      setLocation(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPrayer = useCallback(() => {
    if (!prayerTimes) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayerSchedule = [
      { name: 'İmsak', time: prayerTimes.Fajr },
      { name: 'Güneş', time: prayerTimes.Sunrise },
      { name: 'Öğle', time: prayerTimes.Dhuhr },
      { name: 'İkindi', time: prayerTimes.Asr },
      { name: 'Akşam', time: prayerTimes.Maghrib },
      { name: 'Yatsı', time: prayerTimes.Isha },
    ];

    // Convert prayer times to minutes for comparison
    const prayerTimesInMinutes = prayerSchedule.map(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      return {
        ...prayer,
        totalMinutes: hours * 60 + minutes
      };
    });

    // Find next prayer
    let nextPrayerInfo = prayerTimesInMinutes.find(prayer => prayer.totalMinutes > currentTime);
    
    // If no next prayer today, use first prayer of tomorrow
    if (!nextPrayerInfo) {
      nextPrayerInfo = prayerTimesInMinutes[0];
    }

    // Find current prayer time
    const currentPrayer = [...prayerTimesInMinutes]
      .reverse()
      .find(prayer => prayer.totalMinutes <= currentTime);

    if (currentPrayer) {
      setCurrentPrayerTime(currentPrayer.name);
    } else {
      // If no current prayer (after Isha), set to last prayer of the day
      setCurrentPrayerTime(prayerTimesInMinutes[prayerTimesInMinutes.length - 1].name);
    }

    if (nextPrayerInfo) {
      let remainingMinutes = nextPrayerInfo.totalMinutes - currentTime;
      
      // If next prayer is tomorrow
      if (remainingMinutes < 0) {
        remainingMinutes += 24 * 60;
      }

      const hours = Math.floor(remainingMinutes / 60);
      const minutes = remainingMinutes % 60;
      
      // Format remaining time string
      let remainingTime = '';
      if (hours > 0) {
        remainingTime += `${hours} saat `;
      }
      if (minutes > 0 || hours === 0) {
        remainingTime += `${minutes} dakika`;
      }

      setNextPrayer({
        name: nextPrayerInfo.name,
        time: nextPrayerInfo.time,
        remainingTime
      });
    }
  }, [prayerTimes]);

  // İlk yüklemede ve konum izni değiştiğinde namaz vakitlerini yükle
  useEffect(() => {
    if (hasLocationPermission) {
      loadPrayerTimes();
    }
  }, [hasLocationPermission]);

  // Her dakika namaz vakitlerini güncelle
  useEffect(() => {
    if (prayerTimes) {
      calculateNextPrayer();
      const timer = setInterval(calculateNextPrayer, 60000);
      return () => clearInterval(timer);
    }
  }, [prayerTimes, calculateNextPrayer]);

  // Konum izni kontrolü
  useEffect(() => {
    const checkPermissionAndLoad = async () => {
      try {
        console.log('Checking location permission...');
        const hasPermission = await requestLocationPermission();
        console.log('Location permission status:', hasPermission);
        setHasLocationPermission(hasPermission);
      } catch (error) {
        console.error('Permission check error:', error);
        setError('Konum izni kontrolünde hata oluştu');
      }
    };
    
    checkPermissionAndLoad();
  }, []);

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const PermissionModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPermissionModal}
      onRequestClose={() => setShowPermissionModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Icon name="location-outline" size={50} color="#2ecc71" />
          <Text style={styles.modalTitle}>Konum İzni Gerekli</Text>
          <Text style={styles.modalText}>
            Bulunduğunuz konuma göre doğru namaz vakitlerini gösterebilmemiz için konum iznine ihtiyacımız var.
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={async () => {
              const granted = await requestLocationPermission();
              if (granted) {
                setShowPermissionModal(false);
                loadPrayerTimes();
              }
            }}
          >
            <Text style={styles.modalButtonText}>İzin Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonSecondary]}
            onPress={() => {
              setShowPermissionModal(false);
              openSettings();
            }}
          >
            <Text style={styles.modalButtonTextSecondary}>Ayarlara Git</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSpacer} />
        {/* Prayer Time Card */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadPrayerTimes}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <PrayerCard
            currentPrayer={currentPrayerTime || ''}
            nextPrayer={nextPrayer}
            location={location || undefined}
          />
        )}

        {/* Prayer Times List */}
        {prayerTimes && (
          <View style={styles.prayerTimesList}>
            <Text style={styles.sectionTitle}>Namaz Vakitleri</Text>
            <View style={styles.prayerTimesGrid}>
              {[
                { name: 'İmsak', time: prayerTimes.Fajr },
                { name: 'Güneş', time: prayerTimes.Sunrise },
                { name: 'Öğle', time: prayerTimes.Dhuhr },
                { name: 'İkindi', time: prayerTimes.Asr },
                { name: 'Akşam', time: prayerTimes.Maghrib },
                { name: 'Yatsı', time: prayerTimes.Isha },
              ].map((prayer) => (
                <View
                  key={prayer.name}
                  style={[
                    styles.prayerTimeItem,
                    currentPrayerTime === prayer.name && styles.currentPrayerTimeItem,
                  ]}
                >
                  <Text
                    style={[
                      styles.prayerTimeName,
                      currentPrayerTime === prayer.name && styles.currentPrayerTimeName,
                    ]}
                  >
                    {prayer.name}
                  </Text>
                  <Text
                    style={[
                      styles.prayerTimeValue,
                      currentPrayerTime === prayer.name && styles.currentPrayerTimeValue,
                    ]}
                  >
                    {formatTime(prayer.time)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <TouchableOpacity
        style={[styles.floatingButton, styles.leftButton]}
        onPress={() => navigation.navigate('Dhikr')}
      >
        <IconMaterialCommunity name="counter" size={24} color={colors.text.white} />
        <Text style={styles.floatingButtonText}>Tesbih</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.floatingButton, styles.rightButton]}
        onPress={() => navigation.navigate('Qibla')}
      >
        <IconMaterialCommunity name="compass" size={24} color={colors.text.white} />
        <Text style={styles.floatingButtonText}>Kıble</Text>
      </TouchableOpacity>

      <PermissionModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSpacer: {
    height: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.text.white,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  prayerTimesList: {
    marginTop: 24,
  },
  prayerTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  prayerTimeItem: {
    width: '50%',
    padding: 12,
    marginBottom: 8,
  },
  currentPrayerTimeItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  prayerTimeName: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  currentPrayerTimeName: {
    color: colors.primary,
    fontWeight: '500',
  },
  prayerTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  currentPrayerTimeValue: {
    color: colors.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#2d3436',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#636e72',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalButtonTextSecondary: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  currentPrayerTime: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  nextPrayerContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  nextPrayerText: {
    fontSize: 16,
    color: '#2ecc71',
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftButton: {
    left: 20,
  },
  rightButton: {
    right: 20,
  },
  floatingButtonText: {
    color: colors.text.white,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen; 