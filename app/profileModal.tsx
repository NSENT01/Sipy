// File: profileModal.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Modal view of OTHER users profiles

import { Pressable, StatusBar, Image, FlatList, ScrollView } from 'react-native';
import { styles } from "../assets/styles/my_styles"
import { useState, useEffect } from 'react';
import { API_URL, useAuth } from "../context/AuthContext"
import { Redirect, useLocalSearchParams, router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from '@/components/Themed';
import { TasteProfileData, TasteProfileSummary } from '@/components/TasteProfileSummary';
import { ScreenState } from '@/components/ScreenState';

// get likes and comment counts for given post
const getLikeCount = (post: any) => Number(post?.num_likes ?? 0);
const getCommentCount = (post: any) => Number(post?.num_comments ?? post?.comments?.length ?? 0);

// default export function
const profileModal = () => {
    // instantiate path params from expo router
    const params = useLocalSearchParams()

    // isntantiate auth context variables and functions
    const { authState, onLogout, authFetch } = useAuth();

    // instantiate state variables
    const [selectedTab, setSelectedTab] = useState('activity');
    const [profileData, setProfileData] = useState<any>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [error, setError] = useState("");
    const [followed, setFollowed] = useState<any>(null);
    const [tasteProfile, setTasteProfile] = useState<TasteProfileData | null>(null);
    const [tasteProfileLoading, setTasteProfileLoading] = useState(false);

    // on load of page, if user is authorized and params contains profile id, set followed null, then fetch profile
    useEffect(() => {
        if (authState?.access_token && params.profileId) {
            setFollowed(null);
            handleProfileGet();
        }
    }, [authState?.access_token, params.profileId]);

    // then if authorized and username in params, and follows is null, get whether the user follows them
    useEffect(() => {
        if (authState?.access_token && profileData?.user?.username && followed === null) {
            handleFollowGet();
        }
    }, [authState?.access_token, profileData?.user?.username, followed]);

    // if user is authroized and username is in params, get the users taste profile
    useEffect(() => {
        if (authState?.access_token && profileData?.user?.username) {
            handleTasteProfileGet(profileData.user.username);
        }
    }, [authState?.access_token, profileData?.user?.username]);
        
    // if user is not authenticated redirect to login
    if (!authState?.authenticated) {
        return <Redirect href="/login" />;
    }

    // api call to get follow instance, if it exists then set followed to true, otherwise false
    const handleFollowGet = async () => {
        try {
            const username = profileData?.user?.username;

            if (!username) return;

            const response = await authFetch!(`${API_URL}/get_follow/?followed=${encodeURIComponent(String(username))}`, {
                method: "GET",
                headers: {
                    "Content-Type": 'application/json',
                }
            })

            // if response fails and throws not found error, follow edge does not exist so set followed false, otherwise log and return
            if (!response.ok) {
                if (response.status === 404) {
                    setFollowed(false);
                    return
                }
                console.log(await response.text());
                return;
            }

            // if response succeeds follow edge exists so set state variable and clear errors
            setFollowed(true);
            setError("")
        } catch (error) {
            // error handling
            console.error("There was an error fetching the follow data on this user:", error)
            setError("There was an error fetching the following data on this user")
        }
    }

    // if a user follows this profile, handle writing follow edge to backend
    const handleFollow = async () => {
        try {
            const response = await authFetch!(`${API_URL}/create_follow/`, {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json',
                },
                body: JSON.stringify({
                    followed: profileData?.user?.username
                })
            })

            // if api call fails, log and return
            if (!response.ok) {
                console.log(await response.text());
                return;
            }

            // if it succeeds update follow state and recompute the profile data, clear error state
            setFollowed(true);
            setProfileData((currentProfile: any) => ({
                ...currentProfile,
                num_followers: Number(currentProfile?.num_followers ?? 0) + 1,
            }));
            setError("")

        } catch (error) {
            // error handling
            console.error("There was an error following this user:", error);
            setError("There was an error following this user")
        }
    }

    // same process for the unfollow api call handler
    const handleUnfollow = async () => {
        try {
            const response = await authFetch!(`${API_URL}/delete_follow/?followed=${encodeURIComponent(String(profileData?.user?.username))}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": 'application/json',
                },
            })
            if (!response.ok) {
                console.log(await response.text());
                return;
            }

            setFollowed(false);
            setProfileData((currentProfile: any) => ({
                ...currentProfile,
                num_followers: Math.max(Number(currentProfile?.num_followers ?? 0) - 1, 0),
            }));
            setError("")

        } catch (error) {
            console.error("There was an error unfollowing this user:", error);
            setError("There was an error unfollowing this user")
        }
    }

    // handle post likes within the activity view of other users
    const handlePostLike = async (post: any) => {
        try {
            const response = await authFetch!(`${API_URL}/create_like/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    post: post
                })
            })

            // if api call fails log and return
            if (!response.ok) {
                console.log(await response.text());
                return false;
            }

            // clear error state and return boolean to automatically update state of like button
            setError("")
            return true
        } catch (error) {
            // error handling
            console.error("There was an error liking this post:", error);
            setError("There was an error adding a like")
            return false
        }
    }

    // same api process logic for removing a like from a post
    const handlePostRemoveLike = async (post: any) => {
        try {
            const response = await authFetch!(`${API_URL}/delete_like/?post=${encodeURIComponent(String(post))}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                console.log(await response.text());
                return false;
            }

            setError("")
            return true
        } catch (error) {
            console.error("There was an error removing a like on this post:", error);
            setError("There was an error removing a like")
            return false
        }
    }

    //update post like function sets the profile data num likes nested field to 1 greater than current
    const updatePostLike = (postId: any, liked: boolean) => {
        setProfileData((currentProfile: any) => ({
            ...currentProfile,
            user_rankings: (currentProfile?.user_rankings ?? []).map((ranking: any) =>
                ranking.id === postId
                    ? { ...ranking, liked_by_user: liked, num_likes: Math.max(getLikeCount(ranking) + (liked ? 1 : -1), 0) }
                    : ranking
            )
        }));
    }

    // async function for fetching the users taste profile
    async function handleTasteProfileGet(username: string) {
        try {
            setTasteProfileLoading(true);

            const response = await authFetch!(`${API_URL}/get_taste_profile/?username=${encodeURIComponent(username)}`, {
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

            // set tasteprofile state variable and clear error state
            const data = await response.json();
            setTasteProfile({
                countries: data.countries ?? [],
                cities: data.cities ?? [],
            });
            setError("")
        } catch (error) {
            // error handling
            console.error("There was an error fetching the taste profile:", error);
            setError("There was an error fetching the taste profile")
        } finally {
            // close loading state
            setTasteProfileLoading(false);
        }
    }

    // api call function for getting the profile details of the user for which the modal is displaying their profile
    const handleProfileGet = async () => {
        try {
            setProfileLoading(true);
            const response = await authFetch!(`${API_URL}/get_other_profile/?id=${encodeURIComponent(String(params.profileId))}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                }
            })

            // if fails log, set error state and return
            if (!response.ok) {
                const responseText = await response.text();
                console.log(responseText);
                setError("There was an error fetching the profile");
                return;
            }

            // otherwise set state variables and clear error state
            const data = await response.json()
            setProfileData(data)
            setError("")
            
        } catch (error) {
            // error handling
            console.error("There was an error fetching the profile:", error);
            setError("There was an error fetching the profile");
        } finally {
            // close loading state
            setProfileLoading(false);
        }
    }

// react native component returned
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={{ width: "100%", flex: 1, backgroundColor: "white" }}
        contentContainerStyle={{ alignItems: "center", backgroundColor: "white", paddingBottom: 28 }}
      >
        {/** header for navigating back and displaying users first and last name */}
        <View style={{  width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: "white" }}>
        <Pressable style={{ marginLeft: 20, marginBottom: 10, justifyContent: 'center' }} onPress={() => router.back()}>
            <Ionicons name='chevron-back' size={24} color="black" />
        </Pressable>
        <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 20, color: "black" }}>{profileData?.first_name} {profileData?.last_name}</Text>
        </View>
      {!profileData && (profileLoading || error) ? (
        // if profileData does not exist yet, show loading or error state
        <ScreenState
          loading={profileLoading}
          error={error}
          title="Loading profile"
          onRetry={handleProfileGet}
        />
      ) : (
      <>
      <View style={styles.separator} />
      {/** users analytics and profile details */}
      <Pressable style={styles.profileImage}>
        {profileData?.profile_image && <Image source={{ uri: profileData?.profile_image }} style={styles.profileImage} />}
      </Pressable>
      <Text style={styles.username}>@{profileData?.user.username}</Text>
      <Text style={styles.bioText}>{profileData?.bio_text}</Text>
      <View style={styles.profileInfo}>

        {/** users follower, following, and ranking counts */}
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

        {/** dynamic follow or unfollow button */}
      </View>
      { followed ? (
        <Pressable onPress={() => handleUnfollow()} style={styles.profileButton}>
          <Text style={styles.profileButtonText}>Unfollow</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => handleFollow()} style={[styles.profileButton, styles.profileButtonMatcha]}>
          <Text style={styles.profileButtonTextLight}>Follow</Text>
        </Pressable>
      )}

      {/** tabs for seeing a users activity or their taste profile */}
      <View style={styles.searchTabs}>
        <Pressable onPress={() => setSelectedTab('activity')} style={selectedTab === 'activity' ? styles.activeTab : styles.inactiveTab}>
          <Ionicons name="cafe-outline" size={24} color={selectedTab === 'activity' ? "#2D5A3D" : "black"} /><Text style={selectedTab === 'activity' ? styles.activeTabText : styles.inactiveTabText}>Your Activity</Text>
        </Pressable>

        <Pressable onPress={() => setSelectedTab('taste')} style={selectedTab === 'taste' ? styles.activeTab : styles.inactiveTab}>
          <Ionicons name="people-outline" size={24} color={selectedTab === 'taste' ? "#2D5A3D" : "black"} /><Text style={selectedTab === 'taste' ? styles.activeTabText : styles.inactiveTabText}>Taste Profile</Text>
        </Pressable>
      </View>

      {/** views based on selected tab */}
      { selectedTab === "activity" ? (
        <View style={styles.postListWrap}>
            {/** flatlist for users posts */}
          <FlatList
            data={profileData?.user_rankings ?? []}
            scrollEnabled={false}
            style={{ width: '100%', backgroundColor: "white" }}
            contentContainerStyle={styles.polishedListContent}
            ListEmptyComponent={
                // empty and error state handling
                <ScreenState
                    error={error}
                    empty="No activity yet."
                    onRetry={handleProfileGet}
                    compact
                />
        }
        // component rendered for each post, the same post card used in feed, postModal, and profile
        renderItem={({ item }: {item: any}) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthorRow}>
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

            <View style={styles.postActions}>
              { !item.liked_by_user ? (
              <Pressable style={styles.feedActionButton} onPress={async () => {
                const liked = await handlePostLike(item.id);
                if (liked) {
                  updatePostLike(item.id, true);
                }
              }}>
                <Ionicons name="heart-outline" size={24} color="black" />
                <Text style={styles.postActionCount}>{getLikeCount(item)}</Text>
              </Pressable>
              ) : (
              <Pressable style={styles.feedActionButton} onPress={async () => {
                const removed = await handlePostRemoveLike(item.id);
                if (removed) {
                  updatePostLike(item.id, false);
                }
              }}>
                <Ionicons name="heart" size={24} color="red" />
                <Text style={styles.postActionCount}>{getLikeCount(item)}</Text>
              </Pressable>
              )}
              <View style={styles.feedActionButton}>
                <Ionicons name="chatbubble-outline" size={24} color="black" />
                <Text style={styles.postActionCount}>{getCommentCount(item)}</Text>
              </View>
            </View>
          </View>
        )}
      />
        </View>
      ) : (
        // if its not the activity tab, display custom taste profile summary component, passing in data as custom props
        <TasteProfileSummary tasteProfile={tasteProfile} loading={tasteProfileLoading} />
      )}
      </>
      )}
      </ScrollView>
    </View>
  )
}

export default profileModal
