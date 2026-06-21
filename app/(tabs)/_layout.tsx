import React, { useEffect, useState, createContext } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, Redirect, router, Stack, Tabs } from 'expo-router';
import { Pressable, Image, Text } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '../../context/AuthContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
const logo = require("../../assets/images/sipy.png")
export const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
export const ProfileContext = createContext<any>(null);


function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const headerValue = useClientOnlyValue(false, true);

  const { authState, onLogout, refreshToken } = useAuth();
  const [error, setError] = useState<string>("");
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (authState?.access_token && authState?.authenticated) {
      getProfile();
    }
  }, [authState]);

  if (!authState?.authenticated) {
    return <Redirect href="/login" />;
  }

  const handleLogout = async () => {
    const result = await onLogout!();
    if (result && result.error) {
        alert(result.msg);
    } else {
        console.log("Logout successful");
    }
  };

  const getProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/get_profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.access_token}`
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, try to refresh it
          const refreshed = await refreshToken!();
          if (refreshed?.error) {
            handleLogout();
          }
        }
        console.log(await response.text());
        return;
        
      }
      const data = await response.json();
      setError("");
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to fetch profile');
    }
  };

  

  return (
    <ProfileContext.Provider value={profileData}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: headerValue,
        headerTitle: "",
        headerStyle: {
          borderBottomWidth: 0,
          shadowOpacity: 0,
        },
        headerLeft: () => {
          return <Image source={logo} style={{ width: 50, height: 50, marginLeft: 20 }} />;
        },
        headerRight: () => {
          return <Pressable onPress={handleLogout}><Ionicons style={{marginRight: 20}}name="exit" size={24} color="gray" /></Pressable>
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
          tabBarButton: (props) => {
            const { ref, ...pressableProps } = props;

            return (
              <Pressable
                {...pressableProps}
                onPress={() => router.push("/searchModal")}
              />
            );
          }
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
          headerTitle: "",
          headerStyle: {
            borderBottomWidth: 0,
            shadowOpacity: 0,
          },
          headerLeft: () => {
            return <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 20 }}>{profileData.first_name} {profileData.last_name}</Text>;
          },
          headerRight: () => {
            return <Pressable onPress={handleLogout}><Ionicons style={{marginRight: 20}}name="exit" size={24} color="gray" /></Pressable>
          }
          }}
      />
    </Tabs>
    </ProfileContext.Provider>
  );
}
