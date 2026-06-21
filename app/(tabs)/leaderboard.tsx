import { StatusBar, FlatList, Image } from 'react-native';
import { styles } from "../../assets/styles/my_styles"
import { useState, useEffect } from 'react';
import { Redirect } from 'expo-router'

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import {useAuth} from '../../context/AuthContext'
import { API_URL } from './_layout';

type Profile = {
  id: number,
  user: {
    username: string,
  }
  firstName: string,
  lastName: string,
  bioText: string,
  profileImage: string,
  friendRankings: string,
  userRankings: string,
  numRankings: number,
}

export default function TabTwoScreen() {
  const { authState, onLogout, refreshToken } = useAuth();
  const [profiles, setProfiles] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProfileData = async () => {
      if (authState?.access_token && !profiles){
        await getProfiles()
      }
    }

    getProfileData();
  }, [authState?.access_token, profiles])

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

  const getProfiles = async () => {
    try {
      const response = await fetch(`${API_URL}/get_profiles/`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState?.access_token}`
        }
      })

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
      const profileData = await response.json()
      setError("");
      setProfiles(profileData)
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to fetching profiles');
    }
  }

  return (
    <View style={styles.insideContainer}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={profiles}
        style={{ width: '100%', flex: 1, padding: 20, backgroundColor: "white" }}
        ListHeaderComponent={
          <>
            <Text style={{fontFamily: "georgia", fontWeight: "bold", fontSize: 30, color: "black"}}>Leaderboard</Text>
          </>
        }
        renderItem={({ item, index }: {item: any, index: number}) => (
          <View
            style={{ flexDirection: "row", justifyContent: 'space-between', gap: 10, width: "100%", marginVertical: 10, backgroundColor: "white", alignItems: "center" }}
          >
            <View style={{flexDirection: "row", gap: 10, backgroundColor: "white", justifyContent: "center", alignItems: "center"}}>
              <Text style={{backgroundColor: "white", color: "black", fontSize: 24, fontWeight: "bold"}}>{index + 1}</Text>
              <Image source={{ uri: item.profile_image }} style={styles.profileImageSmaller}/>
              <Text style={{backgroundColor: "white", color: "black", fontSize: 18}}>{item.user.username}</Text>
            </View>
            <Text style={{backgroundColor: "white", color: "black", fontSize: 16, fontWeight: "bold"}}>{item.num_rankings}</Text>
          </View>
        )}
      />
    </View>
  );
}
