
// File: /_layout.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Define un authenticated stack screens, and all other stack screens outside of tab screens, as well as their routing

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext'
import { ScreenState } from '@/components/ScreenState';

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

// wrap root layout in auth context provider
function AuthenticatedLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav/>
    </AuthProvider>
  )
}


// rootlayout main function
function RootLayoutNav() {
  const { authState } = useAuth();

  // if the auth state hasnt been loaded yet display the activity indicator
  if (authState?.authenticated === null) {
    return <ScreenState loading title="Loading app" />;
  }

  
  // default react native component return
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/** includes all screens, from unprotected login to tabs to modals */}
        <Stack.Screen name="index" options={{ animation: "slide_from_left" }}/>
        <Stack.Screen name="login" options={{ animation: "slide_from_right" }}/>
        <Stack.Screen name="register" options={{ animation: "slide_from_right" }}/>

        {/** protected screens */}
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
      <Stack.Screen
        name="profileModal"
        options={{
          presentation: "fullScreenModal",
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="postModal"
        options={{
          presentation: "fullScreenModal",
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="followModal"
        options={{
          presentation: "fullScreenModal",
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profileEditModal"
        options={{
          presentation: "modal",
          title: "",
          headerShown: false,
        }}
      />
      </Stack>
    </ThemeProvider>
  );
}
