import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const APP_VERSION = '1.0.0';
const APP_NAME = Platform.select({
  ios: 'Namazio',
  android: 'Namazio',
  default: 'Namazio',
});

const AboutScreen: React.FC = () => {
  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const sendEmail = () => {
    openLink('mailto:support@namazio.com');
  };

  const openWebsite = () => {
    openLink('https://namazio.com');
  };

  const openPrivacyPolicy = () => {
    openLink('https://namazio.com/privacy');
  };

  const openTerms = () => {
    openLink('https://namazio.com/terms');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="moon" size={60} color="#2ecc71" />
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.version}>Versiyon {APP_VERSION}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkımızda</Text>
        <Text style={styles.description}>
          Namazio, Müslümanların günlük ibadetlerini kolaylaştırmak için
          tasarlanmış bir uygulamadır. Namaz vakitleri, kıble yönü, zikir sayacı
          ve günlük ayet-hadis paylaşımları ile ibadetlerinize yardımcı olmayı
          amaçlıyoruz.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İletişim</Text>
        <TouchableOpacity style={styles.link} onPress={sendEmail}>
          <Icon name="mail-outline" size={24} color="#2ecc71" />
          <Text style={styles.linkText}>E-posta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={openWebsite}>
          <Icon name="globe-outline" size={24} color="#2ecc71" />
          <Text style={styles.linkText}>Web Sitesi</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yasal</Text>
        <TouchableOpacity style={styles.link} onPress={openPrivacyPolicy}>
          <Icon name="shield-checkmark-outline" size={24} color="#2ecc71" />
          <Text style={styles.linkText}>Gizlilik Politikası</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={openTerms}>
          <Icon name="document-text-outline" size={24} color="#2ecc71" />
          <Text style={styles.linkText}>Kullanım Koşulları</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} Namazio. Tüm hakları saklıdır.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdde1',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginTop: 10,
  },
  version: {
    fontSize: 16,
    color: '#636e72',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#636e72',
    lineHeight: 24,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkText: {
    fontSize: 16,
    color: '#2d3436',
    marginLeft: 10,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
  },
});

export default AboutScreen; 