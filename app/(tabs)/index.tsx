// File: (tabs)/index.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Define the feed view of the logged in user

import { Pressable, StatusBar, Image, FlatList } from 'react-native';
import { styles } from "../../assets/styles/my_styles"
import { Text, View } from '@/components/Themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Redirect } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import {API_URL, ProfileContext, ProfileRefreshContext, ProfileStatusContext} from './_layout'
import { useAuth } from '../../context/AuthContext'
import { useFocusEffect } from '@react-navigation/native';
import { ScreenState } from '@/components/ScreenState';

// typescript type definition for incoming ranking display data
type RankingDisplay = {
  id: number;
  score: string;
  notes: string;
  image: string | null;

  drink_name: string;
  drink_category: string;

  cafe_name: string;

  liked_by_user: boolean;
  num_likes?: number;
  num_comments?: number;
  comments?: any[];

  username: string;
  profile_image: string | null;
};

const getLikeCount = (post: RankingDisplay) => Number(post.num_likes ?? 0);
const getCommentCount = (post: RankingDisplay) => Number(post.num_comments ?? post.comments?.length ?? 0);

// required export default function that returns react native component
export default function TabOneScreen() {

  // initialize auth context functions, types, and state variables, along with context data
  const { authState, onLogout, authFetch } = useAuth();
  const profileData = useContext(ProfileContext);
  const refreshProfile = useContext(ProfileRefreshContext);
  const profileStatus = useContext(ProfileStatusContext);
  const [error, setError] = useState("")
  const [feed, setFeed] = useState<RankingDisplay[]>([]);

  // set the feed state variable once profileData is loaded
  useEffect(() => {
    setFeed(profileData?.friend_rankings ?? []);
  }, [profileData?.friend_rankings]);

  // refresh the profile data fetch on authState change
  useFocusEffect(
    useCallback(() => {
      if (authState?.access_token) {
        refreshProfile()
      }
    }, [authState?.access_token])
  );

  // if the user is not authenticated redirect to login
  if (!authState?.authenticated) {
      return <Redirect href="/login" />;
    }
  
  // push search modal onto screen stack
  const handleSearch = () => {
    router.push('/searchModal');
  };


  // create a like on a post with the post id as data for the backend
  const handleLike = async (post: any) => {
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

      // if response errors, log the error and return false
      if (!response.ok) {
        console.log(await response.text());
        return false;
      }

      setError("")
      return true


    } catch (error) {
      // error handling
      console.error("There was an error liking this post:", error);
      setError("There was an error adding a like")
    }
  }

  // handle removing a like from a post with the post id as data for the backend
  const handleRemoveLike = async (post: any) => {
    try {
      const response = await authFetch!(`${API_URL}/delete_like/?post=${encodeURIComponent(String(post))}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // if the response errors log it and return false
      if (!response.ok) {
        console.log(await response.text());
        return false;
      }

      setError("")
      return true

    } catch (error) {
      //error handling
      console.error("There was an error removing a like on this post:", error);
      setError("There was an error removing a like")
    }
  }

  // react native component returned
  return (
    // container
    <View style={styles.insideContainer}>
      <StatusBar barStyle="dark-content" />

      {/** Top search box, pushes search modal on press */}
      <View style={styles.searchBox}>
        <Pressable 
          onPress={handleSearch}
          style={styles.restaurantSearch} 
        ><Ionicons name="search" size={20} color="gray" /><Text style={styles.searchPlaceholder}>  Search cafes or profiles</Text></Pressable>
      </View>

      {/**Feed display via flatlist with empty state handling */}
      <FlatList
        data={feed}
        style={{ width: '100%', flex: 1, backgroundColor: "white" }}
        contentContainerStyle={[styles.polishedListContent, { flexGrow: 1 }]}
        ListHeaderComponent={
          <>
            <Text style={{fontFamily: "serif", fontWeight: "bold", fontSize: 18, color: "black"}}>YOUR FEED</Text>
          </>
        }
        ListEmptyComponent={
          <ScreenState
            loading={profileStatus.loading && !profileData}
            error={error || profileStatus.error}
            empty="No feed posts yet."
            onRetry={refreshProfile}
          />
        }
        // component rendered for each data item
        renderItem={({ item }: {item: RankingDisplay}) => (
          <Pressable onPress={() => router.push({pathname: "/postModal", params: {post: item.id}})}>
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthorRow}>

                {/**profile image routes to profile modal on press */}
                <Pressable onPress={() => {
                  router.push({
                    pathname: "/profileModal",
                    params: {
                      profileId: item.username
                    }
                  })
                }}>
                <Image
                  source={{ uri: item.profile_image as string }}
                  style={[styles.profileImageSmaller, { marginBottom: 0, marginRight: 10 }]}
                />
                </Pressable>

                {/** ranking details displayed */}
                <View style={{ flex: 1, backgroundColor: "white" }}>
                  <Text style={styles.polishedRowTitle}>{item.drink_name}</Text>
                  <Text style={styles.polishedRowMeta}>@{item.username} at {item.cafe_name}</Text>
                </View>
              </View>

                {/** ranking score */}
              <View style={styles.polishedScoreBadge}>
                <Text style={styles.polishedScoreText}>{item.score}</Text>
              </View>
            </View>

                {/** ranking image */}
            {item.image ? (
              <Image
                source={{ uri: item.image as string }}
                style={styles.postImage}
              />
            ) : null}

            {item.notes ? <Text style={styles.postNotes}>{item.notes}</Text> : null}

            {/** dynamic display of likes */}
            <View style={styles.postActions}>
              { !item.liked_by_user ? (
              <Pressable style={styles.feedActionButton} onPress={async () => {
                const liked = await handleLike(item.id);
                if (liked) {
                  setFeed((currentFeed) =>
                    currentFeed.map((ranking) =>
                      ranking.id === item.id
                        ? { ...ranking, liked_by_user: true, num_likes: getLikeCount(ranking) + 1 }
                        : ranking
                    )
                  );
                }
                }}>
                <Ionicons name="heart-outline" size={24} color="black" />
                <Text style={styles.postActionCount}>{getLikeCount(item)}</Text>
              </Pressable>
              ) : (
                <Pressable style={styles.feedActionButton} onPress={async () => {
                  const removed = await handleRemoveLike(item.id)
                  if (removed) {
                    setFeed((currentFeed) =>
                      currentFeed.map((ranking) =>
                        ranking.id === item.id
                          ? { ...ranking, liked_by_user: false, num_likes: Math.max(getLikeCount(ranking) - 1, 0) }
                          : ranking
                      )
                    );
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
          </Pressable>
        )}
      />
    </View>
  );
}
