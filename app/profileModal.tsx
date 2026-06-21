import { Pressable, StatusBar, Image, FlatList } from 'react-native';
import { styles } from "../assets/styles/my_styles"
import { useContext, useState, useEffect } from 'react';
import { API_URL, useAuth } from "../context/AuthContext"
import { Redirect, useLocalSearchParams, router } from 'expo-router'

import Ionicons from '@expo/vector-icons/Ionicons';

import { Text, View } from '@/components/Themed';

const profileModal = () => {
    const params = useLocalSearchParams()
    const { authState, refreshToken, onLogout } = useAuth();
    const [selectedTab, setSelectedTab] = useState('activity');
    const [profileData, setProfileData] = useState<any>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const getProfileData = async () => {
            await handleProfileGet()
        }
        if (authState?.access_token && !profileData) {
            getProfileData()
        }
        
    }, [authState?.access_token, profileData])
        

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

    const handleProfileGet = async () => {
        try {
            const response = await fetch(`${API_URL}/get_other_profile/?id=${encodeURIComponent(String(params.profileId))}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authState?.access_token}`
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

            const data = await response.json()
            setProfileData(data)
            
        } catch (error) {
            console.error("There was an error fetching the profile:", error);
            setError("There was an error fetching the profile");
        }
    }


  return (
    <View style={styles.container}>
        <View style={{  width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: "white" }}>
        <Pressable style={{ marginLeft: 20, marginBottom: 10, justifyContent: 'center' }} onPress={() => router.back()}>
            <Ionicons name='chevron-back' size={24} color="black" />
        </Pressable>
        <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 20, color: "black" }}>{profileData?.first_name} {profileData?.last_name}</Text>
        </View>
      <StatusBar barStyle="dark-content" />
      <View style={styles.separator} />
      <Pressable style={styles.profileImage}>
        {profileData?.profile_image && <Image source={{ uri: profileData?.profile_image }} style={styles.profileImage} />}
      </Pressable>
      <Text style={styles.username}>@{profileData?.user.username}</Text>
      <Text style={styles.bioText}>{profileData?.bio_text}</Text>
      <View style={styles.profileInfo}>
        <View style={styles.profileInfoItem}>
          <Text style={styles.profileInfoNum}>{profileData?.num_followers}</Text>
          <Text style={styles.profileInfoText}>Followers</Text>
        </View>

        <View style={styles.profileInfoItem}>
          <Text style={styles.profileInfoNum}>{profileData?.num_following}</Text>
          <Text style={styles.profileInfoText}>Following</Text>
        </View>

        <View style={styles.profileInfoItem}>
          <Text style={styles.profileInfoNum}>{profileData?.num_rankings}</Text>
          <Text style={styles.profileInfoText}>Ratings</Text>
        </View>
      </View>
      <View style={styles.searchTabs}>
        <Pressable onPress={() => setSelectedTab('activity')} style={selectedTab === 'activity' ? styles.activeTab : styles.inactiveTab}>
          <Ionicons name="cafe-outline" size={24} color={selectedTab === 'activity' ? "#2D5A3D" : "black"} /><Text style={selectedTab === 'activity' ? styles.activeTabText : styles.inactiveTabText}>Your Activity</Text>
        </Pressable>

        <Pressable onPress={() => setSelectedTab('taste')} style={selectedTab === 'taste' ? styles.activeTab : styles.inactiveTab}>
          <Ionicons name="people-outline" size={24} color={selectedTab === 'taste' ? "#2D5A3D" : "black"} /><Text style={selectedTab === 'taste' ? styles.activeTabText : styles.inactiveTabText}>Taste Profile</Text>
        </Pressable>
      </View>
      { selectedTab === "activity" ? (
        <View>
          <FlatList
        data={profileData?.user_rankings}
        style={{ width: '100%', flex: 1, backgroundColor: "white", marginBottom: 340 }}
        renderItem={({ item }: {item: any}) => (
          <View
            style={{ flexDirection: "column", gap: 10, width: "100%", marginVertical: 10, backgroundColor: "white" }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                backgroundColor: "white"
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "white" }}>
                <Image
                  source={{ uri: item.profile_image as string }}
                  style={styles.profileImageSmall}
                />
                <Text style={{ marginLeft: 6, backgroundColor: "white", color: "black" }}>
                  {item.username} ranked {item.drink_name} {"\n"}from {item.cafe_name}
                </Text>
              </View>

              <View style={styles.scoreContainerSmallInside}>
                <Text style={styles.scoreCardRateSmall}>{item.score}</Text>
              </View>
            </View>

            <Image
              source={{ uri: item.image as string }}
              style={{ borderRadius: 8, width: 130, height: 130, zIndex: 2 }}
            />

            <Text style={{backgroundColor: "white", color: "black"}}>{item.notes}</Text>

            <View style={{ flexDirection: "row", backgroundColor: "white" }}>
              <Ionicons name="heart-outline" size={24} color="black" />
              <Ionicons name="chatbubble-outline" size={24} color="black" />
            </View>
            <View style={{width: "100%", height: 1, backgroundColor: "lightgray", marginTop: 10}}></View>
          </View>
        )}
      />
        </View>
      ) : (
        <View>
          
        </View>
      )}
    </View>
  )
}

export default profileModal