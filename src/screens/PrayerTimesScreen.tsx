import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import { fetchPrayerTimes } from '../services/prayerTimes';

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

const PrayerTimesScreen: React.FC = () => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesState | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLocation = () => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        error => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        }
      );
    });
  };

  const loadPrayerTimes = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      setError(null);

      const { latitude, longitude } = await getLocation();
      const response = await fetchPrayerTimes(latitude, longitude);

      setPrayerTimes(response.times);
      setLocation(response.location);
    } catch (error: any) {
      setError(error?.message || 'Namaz vakitleri alınırken bir hata oluştu');
      Alert.alert(
        'Hata',
        'Namaz vakitleri alınırken bir hata oluştu. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPrayerTimes(true);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Namaz vakitleri yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Namaz Vakitleri</Text>
        {location && (
          <Text style={styles.locationText}>
            {location.district ? `${location.district}, ${location.city}` : location.city}
          </Text>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <View style={styles.timesContainer}>
          {prayerTimes && (
            <>
              <View style={styles.timeRow}>
                <Text style={styles.prayerName}>İmsak</Text>
                <Text style={styles.prayerTime}>{formatTime(prayerTimes.Fajr)}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.prayerName}>Güneş</Text>
                <Text style={styles.prayerTime}>{formatTime(prayerTimes.Sunrise)}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.prayerName}>Öğle</Text>
                <Text style={styles.prayerTime}>{formatTime(prayerTimes.Dhuhr)}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.prayerName}>İkindi</Text>
                <Text style={styles.prayerTime}>{formatTime(prayerTimes.Asr)}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.prayerName}>Akşam</Text>
                <Text style={styles.prayerTime}>{formatTime(prayerTimes.Maghrib)}</Text>
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.prayerName}>Yatsı</Text>
                <Text style={styles.prayerTime}>{formatTime(prayerTimes.Isha)}</Text>
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2d3436',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdde1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 16,
    color: '#636e72',
  },
  timesContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  prayerName: {
    fontSize: 18,
    color: '#2d3436',
    fontWeight: '500',
  },
  prayerTime: {
    fontSize: 18,
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PrayerTimesScreen;
