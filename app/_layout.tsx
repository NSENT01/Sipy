
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Tabs, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext'
import { Redirect } from "expo-router";

import { useColorScheme } from '@/components/useColorScheme';
import { ActivityIndicator, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import Colors from '@/constants/Colors';
import {Image} from 'react-native'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.


export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return <AuthenticatedLayout />;
}

function AuthenticatedLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav/>
    </AuthProvider>
  )
}



function RootLayoutNav() {
  const { authState } = useAuth();

  if (authState?.authenticated === null) {
    return <ActivityIndicator/>; // or loading spinner
  }

  

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: "slide_from_left" }}/>
        <Stack.Screen name="login" options={{ animation: "slide_from_right" }}/>
        <Stack.Screen name="register" options={{ animation: "slide_from_right" }}/>
        <Stack.Screen name="(tabs)"/>
        <Stack.Screen
        name="searchModal"
        options={{
          presentation: "fullScreenModal",
          title: "",
          headerShown: false,
          
        }}
      />
      <Stack.Screen
        name="cafeDetailModal"
        options={{
          presentation: "fullScreenModal",
          title: "",
          headerShown: false,
          animation: 'none'
        }}
      />
      <Stack.Screen
        name="rankingCreationModal"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      </Stack>
    </ThemeProvider>
  );
}
