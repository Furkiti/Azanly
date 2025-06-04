import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/Ionicons';

interface QiblaInfo {
  direction: number;
  distance: number;
}

const QiblaScreen: React.FC = () => {
  const [qiblaInfo, setQiblaInfo] = useState<QiblaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compassHeading, setCompassHeading] = useState(0);

  const KAABA_COORDINATES = {
    latitude: 21.422487,
    longitude: 39.826206,
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        return auth === 'granted';
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Konum İzni',
          message: 'Kıble yönünü belirleyebilmek için konum iznine ihtiyacımız var.',
          buttonNeutral: 'Daha Sonra Sor',
          buttonNegative: 'İptal',
          buttonPositive: 'Tamam',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const calculateQibla = (userLat: number, userLng: number) => {
    const lat1 = userLat * (Math.PI / 180);
    const lat2 = KAABA_COORDINATES.latitude * (Math.PI / 180);
    const lng1 = userLng * (Math.PI / 180);
    const lng2 = KAABA_COORDINATES.longitude * (Math.PI / 180);

    const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
    let qiblaDirection = Math.atan2(y, x) * (180 / Math.PI);
    qiblaDirection = (qiblaDirection + 360) % 360;

    // Calculate distance
    const R = 6371; // Earth's radius in km
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return { direction: qiblaDirection, distance };
  };

  const getLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        setError('Konum izni gerekli');
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const qiblaData = calculateQibla(latitude, longitude);
          setQiblaInfo(qiblaData);
          setLoading(false);
        },
        error => {
          setError('Konum alınamadı');
          setLoading(false);
          console.error(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      setError('Bir hata oluştu');
      setLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Kıble yönü hesaplanıyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.compassContainer}>
        <Icon
          name="compass"
          size={200}
          color="#2ecc71"
          style={[
            styles.compass,
            { transform: [{ rotate: `${qiblaInfo?.direction || 0}deg` }] },
          ]}
        />
      </View>
      {qiblaInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.directionText}>
            Kıble Yönü: {Math.round(qiblaInfo.direction)}°
          </Text>
          <Text style={styles.distanceText}>
            Kabe'ye Uzaklık: {Math.round(qiblaInfo.distance)} km
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 125,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  compass: {
    width: 200,
    height: 200,
  },
  infoContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  directionText: {
    fontSize: 18,
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 10,
  },
  distanceText: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#2d3436',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    padding: 20,
  },
});

export default QiblaScreen;
