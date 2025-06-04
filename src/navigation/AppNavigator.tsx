import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import QiblaScreen from '../screens/QiblaScreen';
import DhikrScreen from '../screens/DhikrScreen';
import AyatHadithScreen from '../screens/AyatHadithScreen';
import AboutScreen from '../screens/AboutScreen';
import SplashScreen from '../screens/SplashScreen';
import { RootStackParamList, MainTabParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Ana Sayfa':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Namaz Vakitleri':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Ayet & Hadis':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Hakkında':
              iconName = focused ? 'information-circle' : 'information-circle-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: '#636e72',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#dcdde1',
        },
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#dcdde1',
        },
        headerTitleStyle: {
          color: '#2d3436',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen
        name="Ana Sayfa"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Namaz Vakitleri"
        component={PrayerTimesScreen}
        options={{ headerTitle: 'Namaz Vakitleri' }}
      />
      <Tab.Screen
        name="Ayet & Hadis"
        component={AyatHadithScreen}
        options={{ headerTitle: 'Ayet & Hadis' }}
      />
      <Tab.Screen
        name="Hakkında"
        component={AboutScreen}
        options={{ headerTitle: 'Hakkında' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="Qibla"
        component={QiblaScreen}
        options={{
          headerShown: true,
          headerTitle: 'Kıble Yönü',
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#dcdde1',
          },
          headerTitleStyle: {
            color: '#2d3436',
            fontSize: 18,
          },
          headerTintColor: '#2ecc71',
        }}
      />
      <Stack.Screen
        name="Dhikr"
        component={DhikrScreen}
        options={{
          headerShown: true,
          headerTitle: 'Zikir Sayacı',
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#dcdde1',
          },
          headerTitleStyle: {
            color: '#2d3436',
            fontSize: 18,
          },
          headerTintColor: '#2ecc71',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 