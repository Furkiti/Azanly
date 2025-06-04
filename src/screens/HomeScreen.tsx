import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Geolocation from 'react-native-geolocation-service';
import { fetchPrayerTimes } from '../services/prayerTimes';

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

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesState | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        const hasPermission = auth === 'granted';
        setHasLocationPermission(hasPermission);
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

        const hasPermission = fineGranted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('Android permission status:', { fineGranted, hasPermission });
        setHasLocationPermission(hasPermission);
        return hasPermission;
      }

      return false;
    } catch (err) {
      console.warn('Permission request error:', err);
      setHasLocationPermission(false);
      return false;
    }
  };

  const getLocation = () => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          console.log('Raw location data:', position);
          console.log('Coordinates being used:', coords);
          resolve(coords);
        },
        error => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000,
          // Android için ek ayarlar
          forceRequestLocation: true, // Konum servislerini açmaya zorla
          showLocationDialog: true, // Konum ayarları dialogunu göster
        }
      );
    });
  };

  const loadPrayerTimes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!hasLocationPermission) {
        const permissionGranted = await requestLocationPermission();
        if (!permissionGranted) {
          Alert.alert(
            'Konum İzni Gerekli',
            'Namaz vakitlerini gösterebilmek için konum iznine ihtiyacımız var.',
            [
              { text: 'İptal', style: 'cancel' },
              { 
                text: 'İzin Ver',
                onPress: async () => {
                  const granted = await requestLocationPermission();
                  if (granted) {
                    loadPrayerTimes();
                  }
                }
              }
            ]
          );
          setLoading(false);
          return;
        }
      }

      console.log('Getting location...');
      const { latitude, longitude } = await getLocation();
      console.log('Location received:', { latitude, longitude });

      console.log('Fetching prayer times...');
      const response = await fetchPrayerTimes(latitude, longitude);
      console.log('Prayer times received:', response);

      setPrayerTimes(response.times);
      setLocation(response.location);
      setError(null);
    } catch (error: any) {
      console.error('Error in loadPrayerTimes:', error);
      setError(error?.message || 'Namaz vakitleri alınırken bir hata oluştu');
      Alert.alert(
        'Hata',
        'Namaz vakitleri alınırken bir hata oluştu. Lütfen tekrar deneyin.',
        [
          {
            text: 'Tekrar Dene',
            onPress: () => loadPrayerTimes()
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkPermissionAndLoad = async () => {
      try {
        console.log('Checking location permission...');
        const hasPermission = await requestLocationPermission();
        console.log('Permission status:', hasPermission);
        
        if (hasPermission) {
          loadPrayerTimes();
        } else {
          // Eğer izin reddedildiyse veya "Daha Sonra" seçildiyse
          Alert.alert(
            'Konum İzni Gerekli',
            'Namaz vakitlerini gösterebilmek için konum iznine ihtiyacımız var. Lütfen konum iznini verin.',
            [
              { 
                text: 'İzin Ver',
                onPress: async () => {
                  const granted = await requestLocationPermission();
                  if (granted) {
                    loadPrayerTimes();
                  }
                }
              },
              {
                text: 'İptal',
                style: 'cancel'
              }
            ]
          );
        }
      } catch (error) {
        console.error('Permission check error:', error);
        setError('Konum izni alınamadı');
      }
    };
    
    checkPermissionAndLoad();
  }, []);

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  return (
    <View style={styles.background}>
      <ScrollView style={styles.container}>
        {/* Top Navigation Buttons */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Dhikr')}
          >
            <Icon name="timer-outline" size={24} color="#2ecc71" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Qibla')}
          >
            <Icon name="compass-outline" size={24} color="#2ecc71" />
          </TouchableOpacity>
        </View>

        {/* Prayer Times Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Namaz Vakitleri</Text>
            {location && (
              <Text style={styles.locationText}>
                {location.district ? `${location.district}, ${location.city}` : location.city}
              </Text>
            )}
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Namaz vakitleri yükleniyor...</Text>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          ) : error ? (
            <TouchableOpacity onPress={loadPrayerTimes} style={styles.retryButton}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
              <Text style={styles.errorText}>{error}</Text>
            </TouchableOpacity>
          ) : prayerTimes ? (
            <View style={styles.prayerTimesContainer}>
              <View style={styles.prayerTime}>
                <Text style={styles.prayerName}>İmsak</Text>
                <Text style={styles.time}>{formatTime(prayerTimes.Fajr)}</Text>
              </View>
              <View style={styles.prayerTime}>
                <Text style={styles.prayerName}>Güneş</Text>
                <Text style={styles.time}>{formatTime(prayerTimes.Sunrise)}</Text>
              </View>
              <View style={styles.prayerTime}>
                <Text style={styles.prayerName}>Öğle</Text>
                <Text style={styles.time}>{formatTime(prayerTimes.Dhuhr)}</Text>
              </View>
              <View style={styles.prayerTime}>
                <Text style={styles.prayerName}>İkindi</Text>
                <Text style={styles.time}>{formatTime(prayerTimes.Asr)}</Text>
              </View>
              <View style={styles.prayerTime}>
                <Text style={styles.prayerName}>Akşam</Text>
                <Text style={styles.time}>{formatTime(prayerTimes.Maghrib)}</Text>
              </View>
              <View style={styles.prayerTime}>
                <Text style={styles.prayerName}>Yatsı</Text>
                <Text style={styles.time}>{formatTime(prayerTimes.Isha)}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={loadPrayerTimes} style={styles.retryButton}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Daily Verse Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Günün Ayeti</Text>
          <Text style={styles.verseText}>
            "Allah'ın rahmeti sayesinde sen onlara karşı yumuşak davrandın. Eğer kaba, katı yürekli olsaydın, onlar senin etrafından dağılıp giderlerdi." (Âl-i İmran, 3/159)
          </Text>
        </View>

        {/* Daily Hadith Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Günün Hadisi</Text>
          <Text style={styles.hadithText}>
            "Kolaylaştırınız, zorlaştırmayınız. Müjdeleyiniz, nefret ettirmeyiniz." (Buhârî, İlim, 11)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 10,
  },
  iconButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  prayerTimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prayerTime: {
    width: '30%',
    marginBottom: 12,
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    textAlign: 'center',
  },
  hadithText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7f8c8d',
    marginVertical: 20,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    alignItems: 'center',
    padding: 20,
  },
  retryText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#2ecc71',
    marginVertical: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
});

export default HomeScreen; 