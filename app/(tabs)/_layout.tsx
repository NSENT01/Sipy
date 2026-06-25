// File: (tabs)/_layout.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Define tabs routing and tabs in protected view

import React, { useEffect, useState, createContext } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router, Tabs } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Pressable, Image, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuth } from '../../context/AuthContext';

// static assets, environment variables and context data initialized
const logo = require("../../assets/images/sipy.png")
export const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
export const ProfileContext = createContext<any>(null);
export const ProfileRefreshContext = createContext<() => Promise<void>>(async () => {});
export const ProfileStatusContext = createContext<{ loading: boolean, error: string }>({ loading: false, error: "" });

// default export of tab, defines the tab layout, navigation, context hooks, and headers
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const headerValue = useClientOnlyValue(false, true);

  // define our auth components from our auth context and state variables
  const { authState, onLogout, authFetch } = useAuth();
  const [error, setError] = useState<string>("");
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<any>(null);

  //get the users profile when their tokens are authenticated and authorized
  useEffect(() => {
    if (authState?.access_token && authState?.authenticated) {
      getProfile();
    }
  }, [authState]);

  // get the users profile when any data is modified by the user
  useFocusEffect(
    React.useCallback(() => {
      if (authState?.access_token && authState?.authenticated) {
        getProfile();
      }
    }, [authState?.access_token, authState?.authenticated])
  );

  // if the user is not authenticated, route them to the login page
  if (!authState?.authenticated) {
    return <Redirect href="/login" />;
  }

  // log the user out using auth context
  const handleLogout = async () => {
    const result = await onLogout!();
    if (result && result.error) {
        alert(result.msg);
    } else {
        console.log("Logout successful");
    }
  };

  // alert to confirm that a user would like to delete their profile, called delete profile function
  const showDeleteProfileAlert = () =>
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile? This cannot be undone.',
      [
        {
          text: 'Delete',
          onPress: async () => await handleProfileDelete(),
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );

  // deletes a users profile by making DELETE request to API
  const handleProfileDelete = async () => {
    try {
      const deleteProfile = async () => {
        return await authFetch!(`${API_URL}/delete_profile/`, {
          method: "DELETE",
          headers: {
            "Content-Type": 'application/json',
          }
        })
      }

      let response = await deleteProfile()

      // catch error
      if (!response.ok) {
        console.log(await response.text());
        return;
      }

      await handleLogout();
    } catch (error) {
      // error handling
      console.error("there was an error deleting this profile:", error);
      setError("There was an error deleting this profile")
    }
  }

  // fetch the users profile from the API
  const getProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await authFetch!(`${API_URL}/get_profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // catch errors
      if (!response.ok) {
        const responseText = await response.text();
        console.log(responseText);
        setError('Failed to fetch profile');
        return;
        
      }
      const data = await response.json();
      setError("");
      setProfileData(data);
    } catch (error) {
      //error handling
      console.error('Error fetching profile:', error);
      setError('Failed to fetch profile');
    } finally {
      setProfileLoading(false);
    }
  };

  
  // react native component that is rendered on the users screen
  return (
    // provide profile context data to all tabs for use in displaying information
    <ProfileContext.Provider value={profileData}>
    <ProfileRefreshContext.Provider value={getProfile}>
    <ProfileStatusContext.Provider value={{ loading: profileLoading, error }}>

      {/** Define the tabs supported in the protected logged in view of this app */}
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

      {/** Feed tab file definition, icon, and headers */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <Ionicons name="newspaper-outline" size={24} color="black" />,
        }}
      />

      {/** List tab file definition, icon, and headers */}
      <Tabs.Screen
        name="list"
        options={{
          title: 'Your Lists',
          tabBarIcon: ({ color }) => <Ionicons name="list-outline" size={24} color="black" />,
        }}
      />

      {/** Search tab file definition, icon, and headers */}
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

      {/** Leaderboard tab file definition, icon, and headers */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color }) => <Ionicons name="trophy-outline" size={24} color="black" />,
        }}
      />

      {/** Profile tab file definition, icon, and headers (including profile deletion) */}
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
            return <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 20 }}>{profileData?.first_name ?? ""} {profileData?.last_name ?? ""}</Text>;
          },
          headerRight: () => {
            return (
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}>
                <Pressable onPress={showDeleteProfileAlert} hitSlop={10}>
                  <Ionicons style={{ marginRight: 18 }} name="trash-outline" size={24} color="black" />
                </Pressable>
                <Pressable onPress={handleLogout} hitSlop={10}>
                  <Ionicons name="exit" size={24} color="gray" />
                </Pressable>
              </View>
            )
          }
          }}
      />
    </Tabs>
    </ProfileStatusContext.Provider>
    </ProfileRefreshContext.Provider>
    </ProfileContext.Provider>
  );
}
