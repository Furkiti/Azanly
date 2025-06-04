import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyContent {
  verse: {
    text: string;
    translation: string;
    reference: string;
  };
  hadith: {
    text: string;
    source: string;
  };
  date: string;
}

const STORAGE_KEY = '@daily_content';

const AyatHadithScreen: React.FC = () => {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = async (force = false) => {
    try {
      setError(null);
      if (!force) {
        const savedContent = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedContent) {
          const parsed = JSON.parse(savedContent);
          const today = new Date().toISOString().split('T')[0];
          if (parsed.date === today) {
            setContent(parsed);
            setLoading(false);
            return;
          }
        }
      }

      // This is a placeholder. In a real app, you would fetch from an API
      const newContent: DailyContent = {
        verse: {
          text: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ',
          translation: 'Kullarım sana beni sorduğunda, şüphesiz ben çok yakınım.',
          reference: 'Bakara Suresi, 2:186',
        },
        hadith: {
          text: 'Kolaylaştırınız, zorlaştırmayınız. Müjdeleyiniz, nefret ettirmeyiniz.',
          source: 'Buhari, İlim, 11',
        },
        date: new Date().toISOString().split('T')[0],
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newContent));
      setContent(newContent);
    } catch (error) {
      setError('İçerik yüklenirken bir hata oluştu');
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadContent(true);
  };

  const shareContent = async (type: 'verse' | 'hadith') => {
    if (!content) return;

    const shareText = type === 'verse'
      ? `${content.verse.text}\n\n${content.verse.translation}\n\n${content.verse.reference}\n\nNamazio`
      : `${content.hadith.text}\n\n${content.hadith.source}\n\nNamazio`;

    try {
      await Share.share({
        message: shareText,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
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
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        content && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Günün Ayeti</Text>
                <TouchableOpacity
                  onPress={() => shareContent('verse')}
                  style={styles.shareButton}
                >
                  <Icon name="share-social-outline" size={24} color="#2ecc71" />
                </TouchableOpacity>
              </View>
              <Text style={styles.arabicText}>{content.verse.text}</Text>
              <Text style={styles.translationText}>{content.verse.translation}</Text>
              <Text style={styles.referenceText}>{content.verse.reference}</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Günün Hadisi</Text>
                <TouchableOpacity
                  onPress={() => shareContent('hadith')}
                  style={styles.shareButton}
                >
                  <Icon name="share-social-outline" size={24} color="#2ecc71" />
                </TouchableOpacity>
              </View>
              <Text style={styles.hadithText}>{content.hadith.text}</Text>
              <Text style={styles.sourceText}>{content.hadith.source}</Text>
            </View>
          </>
        )
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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  shareButton: {
    padding: 5,
  },
  arabicText: {
    fontSize: 24,
    textAlign: 'right',
    marginBottom: 15,
    lineHeight: 36,
    color: '#2d3436',
  },
  translationText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24,
    color: '#2d3436',
  },
  referenceText: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'right',
  },
  hadithText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24,
    color: '#2d3436',
  },
  sourceText: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'right',
  },
});

export default AyatHadithScreen;
