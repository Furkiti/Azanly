import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootStackParamList } from '../navigation/types';

const APP_NAME = Platform.select({
  ios: 'Namazio',
  android: 'Namazio',
  default: 'Namazio',
});

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const scaleValue = new Animated.Value(0);
  const opacityValue = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to main screen after animation
    const timer = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
          },
        ]}
      >
        <Icon name="moon" size={80} color="#2ecc71" />
      </Animated.View>
      <Animated.Text
        style={[
          styles.appName,
          {
            opacity: opacityValue,
            transform: [
              {
                translateY: opacityValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        {APP_NAME}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3436',
  },
});

export default SplashScreen;
