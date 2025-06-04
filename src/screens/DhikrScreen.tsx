import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DhikrState {
  count: number;
  target: number;
  totalCount: number;
}

const STORAGE_KEY = '@dhikr_counter';
const VIBRATION_DURATION = 20;

const DhikrScreen: React.FC = () => {
  const [state, setState] = useState<DhikrState>({
    count: 0,
    target: 33,
    totalCount: 0,
  });

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedState) {
        setState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  };

  const saveState = async (newState: DhikrState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  };

  const incrementCount = () => {
    setState(prevState => {
      const newCount = prevState.count + 1;
      const newTotalCount = prevState.totalCount + 1;
      const newState = {
        ...prevState,
        count: newCount,
        totalCount: newTotalCount,
      };

      if (newCount === prevState.target) {
        Vibration.vibrate(VIBRATION_DURATION * 3);
        Alert.alert('Hedef Tamamlandı', 'Zikir hedefine ulaştınız!');
      } else {
        Vibration.vibrate(VIBRATION_DURATION);
      }

      saveState(newState);
      return newState;
    });
  };

  const resetCount = () => {
    Alert.alert(
      'Sıfırla',
      'Sayacı sıfırlamak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sıfırla',
          onPress: () => {
            setState(prevState => {
              const newState = { ...prevState, count: 0 };
              saveState(newState);
              return newState;
            });
          },
        },
      ],
    );
  };

  const setTarget = (newTarget: number) => {
    setState(prevState => {
      const newState = { ...prevState, target: newTarget };
      saveState(newState);
      return newState;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>{state.count}</Text>
        <Text style={styles.targetText}>Hedef: {state.target}</Text>
      </View>

      <TouchableOpacity
        style={styles.counterButton}
        onPress={incrementCount}
        activeOpacity={0.7}
      >
        <Icon name="add-circle" size={80} color="#2ecc71" />
      </TouchableOpacity>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={resetCount}
        >
          <Icon name="refresh" size={24} color="#e74c3c" />
          <Text style={styles.controlText}>Sıfırla</Text>
        </TouchableOpacity>

        <View style={styles.targetButtons}>
          {[33, 99, 100, 500, 1000].map(target => (
            <TouchableOpacity
              key={target}
              style={[
                styles.targetButton,
                state.target === target && styles.targetButtonActive,
              ]}
              onPress={() => setTarget(target)}
            >
              <Text
                style={[
                  styles.targetButtonText,
                  state.target === target && styles.targetButtonTextActive,
                ]}
              >
                {target}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Toplam Zikir: {state.totalCount}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  counterContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  counterText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  targetText: {
    fontSize: 18,
    color: '#636e72',
    marginTop: 10,
  },
  counterButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
  },
  controlText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#e74c3c',
  },
  targetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  targetButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dcdde1',
  },
  targetButtonActive: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  targetButtonText: {
    fontSize: 14,
    color: '#2d3436',
  },
  targetButtonTextActive: {
    color: '#fff',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsText: {
    fontSize: 16,
    color: '#636e72',
  },
});

export default DhikrScreen;
