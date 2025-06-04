import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

interface PrayerCardProps {
  currentPrayer: string;
  nextPrayer: {
    name: string;
    time: string;
    remainingTime: string;
  } | null;
  location?: {
    city: string;
    district?: string;
  };
}

const PrayerCard: React.FC<PrayerCardProps> = ({ currentPrayer, nextPrayer, location }) => {
  // Türkçe namaz vakti isimleri
  const getPrayerNameInTurkish = (name: string) => {
    const names: { [key: string]: string } = {
      'İmsak': 'İmsak',
      'Güneş': 'Güneş',
      'Öğle': 'Öğle',
      'İkindi': 'İkindi',
      'Akşam': 'Akşam',
      'Yatsı': 'Yatsı'
    };
    return names[name] || name;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.currentPrayerContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.currentPrayerLabel}>Şu anki vakit</Text>
            {location?.city && (
              <Text style={styles.cityText}>{location.city}</Text>
            )}
          </View>
          <View style={styles.currentPrayerRow}>
            <Icon name="clock-outline" size={32} color={colors.text.white} style={styles.icon} />
            <Text style={styles.currentPrayerText}>
              {getPrayerNameInTurkish(currentPrayer)}
            </Text>
          </View>
        </View>
        {nextPrayer && (
          <View style={styles.nextPrayerContainer}>
            <View>
              <Text style={styles.nextPrayerLabel}>
                {getPrayerNameInTurkish(nextPrayer.name)} vaktine
              </Text>
              <Text style={styles.remainingTime}>{nextPrayer.remainingTime}</Text>
            </View>
            <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: colors.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  currentPrayerContainer: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPrayerLabel: {
    fontSize: 16,
    color: colors.text.white,
    opacity: 0.9,
  },
  cityText: {
    fontSize: 16,
    color: colors.text.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  currentPrayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  currentPrayerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.white,
  },
  nextPrayerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minHeight: 64,
  },
  nextPrayerLabel: {
    fontSize: 15,
    color: colors.text.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  remainingTime: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.secondary,
    flexShrink: 1,
  },
  nextPrayerTime: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.white,
    marginLeft: 12,
    minWidth: 70,
    textAlign: 'right',
  },
});

export default PrayerCard; 