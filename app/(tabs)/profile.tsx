// File: (tabs)/profile.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Show the users profile, their posts, analytics, and taste profile

import { Pressable, StatusBar, Image, FlatList, Alert, ScrollView } from 'react-native';
import { styles } from "../../assets/styles/my_styles"
import { useCallback, useContext, useState } from 'react';
import {API_URL, ProfileContext, ProfileRefreshContext, ProfileStatusContext} from './_layout'
import Ionicons from '@expo/vector-icons/Ionicons';
import {useAuth} from '../../context/AuthContext'
import { Text, View } from '@/components/Themed';
import { router, Redirect } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native';
import { TasteProfileData, TasteProfileSummary } from '@/components/TasteProfileSummary';
import { ScreenState } from '@/components/ScreenState';

const getLikeCount = (post: any) => Number(post?.num_likes ?? 0);
const getCommentCount = (post: any) => Number(post?.num_comments ?? post?.comments?.length ?? 0);

// required default export that returns react native component
export default function TabTwoScreen() {

  // instantiate context data, state variables, and auth context variables and functions
  const profileData = useContext(ProfileContext);
  const refreshProfile = useContext(ProfileRefreshContext);
  const profileStatus = useContext(ProfileStatusContext);
  const { authState, onLogout, authFetch } = useAuth();
  const [selectedTab, setSelectedTab] = useState("activity");
  const [error, setError] = useState("")
  const [tasteProfile, setTasteProfile] = useState<TasteProfileData | null>(null);
  const [tasteProfileLoading, setTasteProfileLoading] = useState(false);

  // refresh data when changed or auth state changes
  useFocusEffect(
    useCallback(() => {
      if (authState?.access_token) {
        refreshProfile()
        handleTasteProfileGet()
      }
    }, [authState?.access_token])
  );

  // if not authenticated redirect to login
  if (!authState?.authenticated) {
        return <Redirect href="/login" />;
    }

  // alert for deleting a ranking confirmation
  const showAlert = (rankingId: any) =>
    Alert.alert(
      'Delete Ranking',
      'Are you sure you would like to delete this ranking?',
      [
        {
          text: 'Delete',
          onPress: async () => await handleRankingDelete(rankingId)
        },
        {
          text: 'Cancel',
          onPress: () => Alert.alert('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
        onDismiss: () =>
          Alert.alert(
            'This alert was dismissed by tapping outside of the alert dialog.',
          ),
      },
    );

    // api call to actually delete ranking if alert is confirmed
    const handleRankingDelete = async (rankingId: any) => {
      try {
        const deleteRanking = async () => {
          return await authFetch!(`${API_URL}/delete_ranking/?id=${encodeURIComponent(String(rankingId))}`, {
            method: "DELETE",
            headers: {
              "Content-Type": 'application/json',
            }
          })
        }

        let response = await deleteRanking()
        
        // if it errors log and return
        if (!response.ok) {
          console.log(await response.text());
          return;
        }

        setError("")
        //refresh profile after delete
        await refreshProfile()
      } catch (error) {
        //error handling
        console.error("there was an error deleting this ranking:", error);
        setError("There was an error deleting this ranking")
      }
    }

    // fetch the taste profile data from the backend
    async function handleTasteProfileGet() {
      try {
        //set loading state
        setTasteProfileLoading(true);

        const response = await authFetch!(`${API_URL}/get_taste_profile/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        // if api call fails log and return
        if (!response.ok) {
          console.log(await response.text());
          return;
        }

        const data = await response.json();

        // set state variable
        setTasteProfile({
          countries: data.countries ?? [],
          cities: data.cities ?? [],
        });
        setError("")
      } catch (error) {
        //error handling
        console.error("There was an error fetching the taste profile:", error);
        setError("There was an error fetching the taste profile")
      } finally {
        //close loading state
        setTasteProfileLoading(false);
      }
    }
  
    // react native component returned
  return (
    <View style={styles.insideContainer}>
      <StatusBar barStyle="dark-content" />
      {/** scroll view for entire profile page */}
      <ScrollView
        style={{ width: "100%", flex: 1, backgroundColor: "white" }}
        contentContainerStyle={{ alignItems: "center", backgroundColor: "white", paddingBottom: 28 }}
      >

      {!profileData && (profileStatus.loading || profileStatus.error) ? (
        // screen state component that handles error and loading states
        <ScreenState
          loading={profileStatus.loading}
          error={profileStatus.error}
          title="Loading profile"
          onRetry={refreshProfile}
        />
      ) : (
      <>
        {/** profile details and analytics */}
      <View style={styles.separator} />
      <Pressable style={styles.profileImage}>
        {profileData?.profile_image && <Image source={{ uri: profileData?.profile_image }} style={styles.profileImage} />}
      </Pressable>
      <Text style={styles.username}>@{profileData?.user.username}</Text>
      <Text style={styles.bioText}>{profileData?.bio_text}</Text>
      <View style={styles.profileInfo}>
        <Pressable onPress={() => router.push({pathname: "/followModal", params: {view: 'followers'}})}>
          <View style={styles.profileInfoItem}>
            <Text style={styles.profileInfoNum}>{profileData?.num_followers}</Text>
            <Text style={styles.profileInfoText}>Followers</Text>
          </View>
        </Pressable>

        <Pressable onPress={() => router.push({pathname: "/followModal", params: {view: 'following'}})}>
          <View style={styles.profileInfoItem}>
            <Text style={styles.profileInfoNum}>{profileData?.num_following}</Text>
            <Text style={styles.profileInfoText}>Following</Text>
          </View>
        </Pressable>

        <View style={styles.profileInfoItem}>
          <Text style={styles.profileInfoNum}>{profileData?.num_rankings}</Text>
          <Text style={styles.profileInfoText}>Ratings</Text>
        </View>
      </View>

      {/** edit profile button */}
      <Pressable
        style={styles.profileButton}
        onPress={() => router.push({
          pathname: "/profileEditModal",
          params: {
            firstName: profileData?.first_name ?? "",
            lastName: profileData?.last_name ?? "",
            bio: profileData?.bio_text ?? "",
            profileImage: profileData?.profile_image ?? "",
            username: profileData?.user?.username ?? "",
          }
        })}
      >
        <Text style={{ color: "black", fontSize: 16 }}>Edit Profile</Text>
      </Pressable>

      {/** tabs for viewing a users posts or taste profile */}
      <View style={styles.searchTabs}>
        <Pressable onPress={() => setSelectedTab('activity')} style={selectedTab === 'activity' ? styles.activeTab : styles.inactiveTab}>
          <Ionicons name="cafe-outline" size={24} color={selectedTab === 'activity' ? "#2D5A3D" : "black"} /><Text style={selectedTab === 'activity' ? styles.activeTabText : styles.inactiveTabText}>Your Activity</Text>
        </Pressable>

        <Pressable onPress={() => setSelectedTab('taste')} style={selectedTab === 'taste' ? styles.activeTab : styles.inactiveTab}>
          <Ionicons name="people-outline" size={24} color={selectedTab === 'taste' ? "#2D5A3D" : "black"} /><Text style={selectedTab === 'taste' ? styles.activeTabText : styles.inactiveTabText}>Taste Profile</Text>
        </Pressable>
      </View>
      { selectedTab === "activity" ? (
        // if the selected tab is activity show their posts
        <View style={styles.postListWrap}>
          <FlatList
        data={profileData?.user_rankings ?? []}
        scrollEnabled={false}
        style={{ width: '100%', backgroundColor: "white" }}
        contentContainerStyle={styles.polishedListContent}
        ListEmptyComponent={
          // screen state component that handles error and loading states
          <ScreenState
            error={error || profileStatus.error}
            empty="No activity yet."
            onRetry={refreshProfile}
            compact
          />
        }
        // component rendered for each item in data
        renderItem={({ item }: {item: any}) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthorRow}>
                {/** same post details as all other views that utilize post cards */}
                <Image
                  source={{ uri: item.profile_image as string }}
                  style={[styles.profileImageSmaller, { marginBottom: 0, marginRight: 10 }]}
                />
                <View style={{ flex: 1, backgroundColor: "white" }}>
                  <Text style={styles.polishedRowTitle}>{item.drink_name}</Text>
                  <Text style={styles.polishedRowMeta}>@{item.username} at {item.cafe_name}</Text>
                </View>
              </View>

              <View style={styles.polishedScoreBadge}>
                <Text style={styles.polishedScoreText}>{item.score}</Text>
              </View>
            </View>

            {item.image ? (
              <Image
                source={{ uri: item.image as string }}
                style={styles.postImage}
              />
            ) : null}

            {item.notes ? <Text style={styles.postNotes}>{item.notes}</Text> : null}

            <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "white", alignItems: "center" }}>
              <View style={{ flexDirection: "row", backgroundColor: "white" }}>
              <View style={styles.feedActionButton}>
                <Ionicons name="heart-outline" size={24} color="black" />
                <Text style={styles.postActionCount}>{getLikeCount(item)}</Text>
              </View>
              <View style={styles.feedActionButton}>
                <Ionicons name="chatbubble-outline" size={24} color="black" />
                <Text style={styles.postActionCount}>{getCommentCount(item)}</Text>
              </View>
              </View>
              <Pressable style={styles.feedActionButton} onPress={() => showAlert(item.id)}>
                <Ionicons name="trash-outline" size={24} color="black" />
              </Pressable>
            </View>
          </View>
        )}
      />
        </View>
      ) : (
        // custom component for taste profile, input data as custom props
        <TasteProfileSummary tasteProfile={tasteProfile} loading={tasteProfileLoading} />
      )}
      </>
      )}
      </ScrollView>
    </View>
  );
}
