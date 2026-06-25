// File: (tabs)/leaderboard.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Show the global leaderboard of all users

import { StatusBar, FlatList, Image } from 'react-native';
import { styles } from "../../assets/styles/my_styles"
import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { Text, View } from '@/components/Themed';
import {useAuth} from '../../context/AuthContext'
import { API_URL } from './_layout';
import { ScreenState } from '@/components/ScreenState';

// required default export that returns react native component
export default function TabTwoScreen() {
  //define auth context variables and functions, and state variables
  const { authState, authFetch } = useAuth();
  const [profiles, setProfiles] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // load profiles when the state variable is empty or auth state changes
  useEffect(() => {
    const getProfileData = async () => {
      if (authState?.access_token && !profiles){
        await getProfiles()
      }
    }

    getProfileData();
  }, [authState?.access_token, profiles])

  // reload the profile data if auth state changes or data changes
  useFocusEffect(
    React.useCallback(() => {
      if (authState?.access_token) {
        getProfiles()
      }
    }, [authState?.access_token])
  );

  //if not authenticated redirect to login
  if (!authState?.authenticated) {
      return <Redirect href="/login" />;
    }
  
  // api call to get profiles
  const getProfiles = async () => {
    try {
      setLoading(true);
      const response = await authFetch!(`${API_URL}/get_profiles/`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        }
      })

      // if it errors log and return
      if (!response.ok) {
        const responseText = await response.text();
        console.log(responseText);
        setError('Failed to fetch profiles');
        return;
        
      }

      //jsonify and set state variables, clear error state
      const profileData = await response.json()
      setError("");
      setProfiles(profileData)
    } catch (error) {
      //error handling
      console.error('Error fetching profiles:', error);
      setError('Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  }

  // react native component return 
  return (
    <View style={styles.insideContainer}>
      <StatusBar barStyle="dark-content" />
      {/** Flatlist display of profiles ordered by number of rankings */}
      <FlatList
        data={profiles ?? []}
        style={styles.polishedList}
        contentContainerStyle={[styles.polishedListContent, { flexGrow: 1 }]}
        ListHeaderComponent={
          <>
            <Text style={{fontFamily: "georgia", fontWeight: "bold", fontSize: 30, color: "black"}}>Leaderboard</Text>
            <Text style={{ color: "gray", fontSize: 14, marginBottom: 10, backgroundColor: "white" }}>Ranked by number of ratings</Text>
          </>
        }
        //empty state
        ListEmptyComponent={
          // screen state component that handles error and loading states
          <ScreenState
            loading={loading && !profiles}
            error={error}
            empty="No profiles yet."
            onRetry={getProfiles}
          />
        }
        // component rendered for each item in data
        renderItem={({ item, index }: {item: any, index: number}) => (
          <View style={styles.polishedRow}>
            <View style={styles.polishedRowMain}>

              {/** users rank, profile image, and number of rankings */}
              <Text style={{ backgroundColor: "white", color: "black", fontSize: 18, fontWeight: "bold", width: 34 }}>{index + 1}.</Text>
              <Image source={{ uri: item.profile_image }} style={[styles.profileImageSmaller, { marginBottom: 0, marginRight: 12 }]}/>
              <View style={{ flex: 1, backgroundColor: "white" }}>
                <Text style={styles.polishedRowTitle}>@{item.user.username}</Text>
                <Text style={styles.polishedRowMeta}>{item.first_name ?? item.firstName ?? ""} {item.last_name ?? item.lastName ?? ""}</Text>
              </View>
            </View>
            <View style={styles.polishedScoreBadge}>
              <Text style={styles.polishedScoreText}>{item.num_rankings}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
