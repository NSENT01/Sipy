import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, Redirect, router, Tabs } from 'expo-router';
import { Pressable, Image } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '../../context/AuthContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
const logo = require("../../assets/images/sipy.png")
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { authState, onLogout } = useAuth();

  if (!authState?.authenticated) {
    return <Redirect href="/" />;
  }

  const handleLogout = async () => {
    const result = await onLogout!();
    if (result && result.error) {
        alert(result.msg);
    } else {
        console.log("Logout successful");
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        headerLeft: () => {
          return <Image source={logo} style={{ width: 30, height: 30, marginLeft: 10 }} />;
        },
        headerRight: () => {
          return <Pressable onPress={handleLogout}><Ionicons name="exit" size={24} color="black" /></Pressable>
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Ionicons name="newspaper-outline" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Your Lists',
          tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle-sharp" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color }) => <Ionicons name="trophy-outline" size={24} color="black" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="at-outline" size={24} color="black" />,
        }}
      />
    </Tabs>
  );
}
