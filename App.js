import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import SplashScreenComponent from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import TextToVideoScreen from './src/screens/TextToVideoScreen';
import ImageToVideoScreen from './src/screens/ImageToVideoScreen';
import PoetryToVideoScreen from './src/screens/PoetryToVideoScreen';
import ScriptToVideoScreen from './src/screens/ScriptToVideoScreen';
import ImageEnhancementScreen from './src/screens/ImageEnhancementScreen';
import CertificateScreen from './src/screens/CertificateScreen';
import BulkCertificateScreen from './src/screens/BulkCertificateScreen';
import StudioScreen from './src/screens/StudioScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Components
import TabBarIcon from './src/components/TabBarIcon';

// Theme
import { theme } from './src/theme/theme';

// Store
import { useSubscriptionStore } from './src/store/subscriptionStore';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon name={getTabBarIconName(route.name)} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Cairo-Regular',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: 'الرئيسية' }}
      />
      <Tab.Screen 
        name="Studio" 
        component={StudioScreen} 
        options={{ tabBarLabel: 'الاستديو' }}
      />
      <Tab.Screen 
        name="Subscription" 
        component={SubscriptionScreen} 
        options={{ tabBarLabel: 'الاشتراك' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'الملف الشخصي' }}
      />
    </Tab.Navigator>
  );
}

function getTabBarIconName(routeName) {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'Studio':
      return 'camera';
    case 'Subscription':
      return 'crown';
    case 'Profile':
      return 'account';
    default:
      return 'home';
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const { initializeSubscription } = useSubscriptionStore();

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize subscription state
        await initializeSubscription();
        
        // Check if this is the first launch
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        setIsFirstLaunch(hasLaunched === null);
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    setIsFirstLaunch(false);
  };

  if (isLoading) {
    return <SplashScreenComponent />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isFirstLaunch ? (
              <Stack.Screen name="Onboarding">
                {props => (
                  <OnboardingScreen 
                    {...props} 
                    onComplete={handleOnboardingComplete}
                  />
                )}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="TextToVideo" component={TextToVideoScreen} />
                <Stack.Screen name="ImageToVideo" component={ImageToVideoScreen} />
                <Stack.Screen name="PoetryToVideo" component={PoetryToVideoScreen} />
                <Stack.Screen name="ScriptToVideo" component={ScriptToVideoScreen} />
                <Stack.Screen name="ImageEnhancement" component={ImageEnhancementScreen} />
                <Stack.Screen name="Certificate" component={CertificateScreen} />
                <Stack.Screen name="BulkCertificate" component={BulkCertificateScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

