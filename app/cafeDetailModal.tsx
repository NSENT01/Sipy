// File: cafeDetailModal.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Placeholder for tab that pulls up modal

import { View, Text, ScrollView, Image, Pressable, ImageBackground, FlatList, Alert } from 'react-native'
import { useCallback, useEffect, useState} from 'react'
import { useLocalSearchParams, Redirect, router } from 'expo-router'
import { useAuth } from '../context/AuthContext'
import { styles } from '../assets/styles/my_styles'
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient'
import * as Linking from 'expo-linking';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenState } from '@/components/ScreenState';

// ranking display ts type for incoming data from API
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

// cafe ts type for incoming cafe data
type Cafe = {
  id: number;
  placeId: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  website: string;
  phoneNumber: string;
  city: string;
  region: string;
  country: string;

  average_rating: string | number | null;
  num_rankings: number;
  images: string[];

  friend_rankings: RankingDisplay[];
  friend_avg_ranking: string | number | null;

  user_rankings: RankingDisplay[];
  user_avg_ranking: string | number | null;
};

// load api url and api keys from .env file
const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY as string


// required export default, export default is made at the bottom
const cafeDetailModal = () => {

  // define the cafe const with the search params given from google autocomplete api
  const cafe = useLocalSearchParams<{
    placeId?: string;
    name?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    website?: string;
    phoneNumber?: string;
    city?: string;
    region?: string;
    country?: string;
  }>();

  // auth context variables and function, state variables
  const { authState, onLogout, authFetch } = useAuth()
  const [error, setError] = useState("");
  const [cafeDetailsLoading, setCafeDetailsLoading] = useState(false);
  const [wantToTry, setWantToTry] = useState(false);
  const [cafeDetails, setCafeDetails] = useState<Cafe | null>(null);

  // api call to google maps api for map display image
  const [mapImageUrl, setMapImageUrl] = useState(`https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${cafe.latitude},${cafe.longitude}` +
    `&zoom=15` +
    `&size=400x400` +
    `&maptype=roadmap` +
    `&markers=size:small|color:red|${cafe.latitude},${cafe.longitude}` +
    `&style=feature:all|saturation:-20` +
    `&style=feature:poi|visibility:off` +
    `&style=feature:transit|visibility:off` +
    `&key=${GOOGLE_API_KEY}`);


  // get cafe details and want to try details when page is loaded, auth state changes, and when cafe has a place id
  useEffect(() => {
    if (authState?.access_token && authState?.authenticated && cafe.placeId) {
      handleCafeDetailsGet()
      handleWantToTryGet()
    }
  }, [authState?.access_token, cafe?.placeId]);

  // refetch the data when authenticated state or data changes
  useFocusEffect(
    useCallback(() => {
      if (authState?.access_token && authState?.authenticated && cafe.placeId) {
        handleCafeDetailsGet()
        handleWantToTryGet()
      }
    }, [authState?.access_token, authState?.authenticated, cafe?.placeId])
  );
  
  // if the user is not authenticated route them to login
  if (!authState?.authenticated) {
    return <Redirect href="/login" />;
  }

  // async function for whether the user wants to try this cafe
  const handleWantToTryGet = async () => {
    try {
      const response = await authFetch!(`${API_URL}/get_wanttotry/?cafeId=${encodeURIComponent(String(cafe?.placeId))}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // if api call errors set, the want to try value to false and return
      if (!response.ok) {
        if (response.status === 404) {
          setWantToTry(false);
          return;
        } // log and return
        console.log(await response.text());
        return;
      }

      // set want to try boolean and error state to empty
      setWantToTry(true);
      setError("");
    } catch (error) {
      // error handling
      console.error("Failed to fetch favorited:", error);
      setError("Failed to fetch favorited")
    }
  }

  // sync function for api call to get cafe details
  const handleCafeDetailsGet = async () => {
    try {
      setCafeDetailsLoading(true);
      const response = await authFetch!(`${API_URL}/get_cafe/?cafe=${encodeURIComponent(String(cafe.placeId))}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // if call error log and return
      if (!response.ok) {
        const responseText = await response.text();
        console.log(responseText);
        if (response.status !== 404) {
          setError('Failed to fetch cafe item');
        }
        return;
        
      }

      // otherwise empty error state, and set cafe details to response data
      setError("");
      const responseData = await response.json();
      setCafeDetails({
        ...responseData,
        average_rating: Number(responseData.average_rating ?? 0),
        friend_avg_ranking: Number(responseData.friend_avg_ranking ?? 0),
        user_avg_ranking: Number(responseData.user_avg_ranking ?? 0),
        num_rankings: Number(responseData.num_rankings ?? 0),
        images: responseData.images ?? [],
        friend_rankings: responseData.friend_rankings ?? [],
        user_rankings: responseData.user_rankings ?? [],
      });
    } catch (error) {
      // error handling
      console.error('Error fetching cafe item:', error);
      setError('Failed to fetch cafe item');
    } finally {
      setCafeDetailsLoading(false);
    }
  }

  // if a cafe is not in the database, then when a user adds it to their want to try and ranks a drink, add the cafe to the database
  const handleCafeDetails = async () => {
      if (cafeDetails) {
        // if the details already exist in the database and have been fetched, don't execute POST request
        return
      }
      try {
        const response = await authFetch!(`${API_URL}/create_cafe/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: cafe.name,
            address: cafe.address,
            latitude: cafe.latitude,
            longitude: cafe.longitude,
            placeId: cafe.placeId,
            website: cafe.website,
            phone_number: cafe.phoneNumber,
            city: cafe.city,
            region: cafe.region,
            country: cafe.country
          })
        })
        
        // if response errors, log and return
        if (!response.ok) {
          console.log(await response.text());
          return;
          
        }

        // empty error state, set state variable with response data
        setError("");
        const responseData = await response.json();
        setCafeDetails(responseData)
        
      } catch (error) {
        // error handling
        console.error('Error creating cafe item:', error);
        setError('Failed to create cafe item');
      }
    }

    // function to handle when a user wants to rank a drink
    const handleLike = async () => {
      // if the cafe details have been fetched, push the ranking creation modal with paramters from this const and return
      if (cafeDetails) {
        router.push({
          pathname: '/rankingCreationModal',
          params: {
            placeId: cafeDetails.placeId,
            name: cafeDetails.name,
            address: cafeDetails?.address,
            latitude: cafeDetails?.latitude,
            longitude: cafeDetails?.longitude,
            website: cafeDetails?.website,
            phoneNumber: cafeDetails?.phoneNumber,
            city: cafeDetails?.city,
            region: cafeDetails?.region,
            country: cafeDetails?.country,
          }
        })
        return
      }
      // otherwise, use the ones provided by googles autocomplete api
      router.push({
        pathname: '/rankingCreationModal',
        params: {
          placeId: cafe.placeId,
          name: cafe.name,
          address: cafe?.address,
          latitude: cafe?.latitude,
          longitude: cafe?.longitude,
          website: cafe?.website,
          phoneNumber: cafe?.phoneNumber,
          city: cafe?.city,
          region: cafe?.region,
          country: cafe?.country,
        }
      })
    }

    // handle when a user wants to add a restaurant to their want to try list
    const handleBookmark = async () => {
      try {
        const response = await authFetch!(`${API_URL}/create_wanttotry/`, {
          method: "POST",
          headers: {
            "Content-Type": 'application/json',
          },
          body: JSON.stringify({
            cafeId: cafeDetails?.placeId ?? cafe.placeId
          })
        })

        // if the response errors log and return
        if (!response.ok) {
          console.log(await response.text());
          return;
        }

        // set the want to try boolean and empty error state
        setWantToTry(true);
        setError("");

      } catch (error) {
        //error handling
        console.error("There was an error adding this cafe to favorites:", error);
        setError("There was an error adding this cafe to favorites");
      }
    }

    // handle when a user wants to remove a restaurant from their want to try
    const handleBookmarkDelete = async () => {
      try {
        const response = await authFetch!(`${API_URL}/delete_wanttotry/?cafeId=${encodeURIComponent(String(cafe?.placeId))}`, {
          method: "DELETE",
          headers: {
            "Content-Type": 'application/json',
          },
        })

        // if response errors log and return
        if (!response.ok) {
          console.log(await response.text());
          return;
        }
        
        // empty error state and set boolean
        setError("");
        setWantToTry(false);
        setError("");
      } catch (error) {
        // error handling
        console.error("There was an error removing your favorite:", error);
        setError("There was an error removing your favorite");
      }
    }

    // handle when a user wants to like posts from within this modal
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

        // if response fails, log and return
        if (!response.ok) {
          console.log(await response.text());
          return false;
        }

        // set error and return
        setError("")
        return true
      } catch (error) {
        // error handling
        console.error("There was an error liking this post:", error);
        setError("There was an error adding a like")
        return false
      }
    }

    // handle when a user wants to remove a like from a post in this modal
    const handlePostRemoveLike = async (post: any) => {
      try {
        const response = await authFetch!(`${API_URL}/delete_like/?post=${encodeURIComponent(String(post))}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })

        // if response fails log and return
        if (!response.ok) {
          console.log(await response.text());
          return false;
        }

        // set error empty and return
        setError("")
        return true
      } catch (error) {
        // error handling
        console.error("There was an error removing a like on this post:", error);
        setError("There was an error removing a like")
        return false
      }
    }

    // use the post details to determine if the user liked any displayed posts, and display that via boolean 
    const updateFriendPostLike = (postId: any, liked: boolean) => {
      setCafeDetails((currentCafe) => currentCafe
        ? {
            ...currentCafe,
            friend_rankings: (currentCafe.friend_rankings ?? []).map((ranking) =>
              ranking.id === postId
                ? { ...ranking, liked_by_user: liked, num_likes: Math.max(getLikeCount(ranking) + (liked ? 1 : -1), 0) }
                : ranking
            )
          }
        : currentCafe
      );
    }

    // redirect user to website if clicked
    const redirectWebsite = async () => {
      const website = cafeDetails?.website ?? cafe.website;

      if (!website || website.trim().length === 0 || website === "null" || website === "undefined") {
        Alert.alert("No website available", "This cafe does not have a website listed.");
        return;
      }

      const response = await Linking.openURL(website)

      if (response) {
        console.log("Succesfully routed to website")
      } else {
        console.log("Website redirection failed")
      }
    }

    // Linking expects no gaps so standardized stored phone number to match expected input
    const normalizePhoneNumber = (phoneNumber: string | null | undefined) => {
      if (!phoneNumber) {
        return
      }
      return phoneNumber.replaceAll(" ", "");
    
    }

    // redirect the user to calling the cafe if they click call
    const redirectCall = async () => {
      if (cafeDetails) {
        const response = await Linking.openURL(`tel:${normalizePhoneNumber(cafeDetails.phoneNumber)}`)

        if (response) {
          console.log("Succesfully callede")
        } else {
          console.log("Call redirection failed")
        }
      } else {
        const response = await Linking.openURL(`tel:${normalizePhoneNumber(cafe.phoneNumber)}`);

        if (response) {
          console.log("Succesfully called")
        } else {
          console.log("Call redirection failed")
        }
      }
    }

  // react native component return 
  return (
    <View style={{flex: 1, backgroundColor: "white"}}>
    { cafeDetails ? (
      // if api call recognizes existing cafe and loads data display data with metrics
    <View style={styles.container}>

      {/** header with back button */}
    <View style={{  width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
    <Pressable style={{ marginLeft: 20, marginBottom: 10, justifyContent: 'center' }} onPress={() => router.back()}>
        <Ionicons name='chevron-back' size={24} color="black" />
      </Pressable>
    </View>

      {/** Scroll view of cafe details */}
    <ScrollView style={{ width: '100%', flex: 1, flexDirection: 'column' }}>
    <ImageBackground source={{uri: mapImageUrl}} resizeMode="cover" style={styles.gradientBackgroundCafe}>
        <LinearGradient colors={['rgba(255, 255, 255, 0)', 'white']} style={styles.imageBackgroundCafe}>
        <Text style={styles.cafeTitle}>{cafeDetails.name}</Text>
        <View style={styles.cafeRankings}>
          <View style={styles.cafeRankingStats}>

            {/** cafe header details including average rating */}
            <View style={styles.avgRankingWrapper}>
              <Text style={styles.avgRanking}>{(cafeDetails.average_rating as number)?.toFixed(1)}</Text>
            </View>
            <Text style={styles.numReviews}>({cafeDetails.num_rankings})</Text>
          </View>

          {/** Rating a drink or favoriting cafe buttons */}
          <View style={styles.cafeActions}>
            <Pressable 
              onPress={() => {
                handleCafeDetails()
                handleLike()
              }}
            >
              <Ionicons name="heart-outline" size={24} color="#2D5A3D"/>
            </Pressable>
            { !wantToTry ? (
            <Pressable
              onPress={() => {
                handleCafeDetails()
                handleBookmark()
              }}
            >
              <Ionicons name="bookmark-outline" size={24} color="#2D5A3D"/>
            </Pressable>
            ) : (
              <Pressable
              onPress={() => {
                handleCafeDetails()
                handleBookmarkDelete()
              }}
            >
              <Ionicons name="bookmark" size={24} color="#2D5A3D"/>
            </Pressable>
            )}
          </View>
        </View>
        </LinearGradient>
      </ImageBackground>

      {/** main body below cafe header, includes remaining data */}
      <View style={{flex: 1, paddingHorizontal: 20, paddingBottom: 30}}>
      <View style={{backgroundColor: 'white'}}>
        <Text style={styles.cafeAddress}>{cafeDetails.address}</Text>
      </View>

      {/** cafe website and call redirects */}
      <View style={styles.cafeContacts}>
        <Pressable onPress={redirectWebsite} style={styles.cafeWebsite}>
          <Ionicons name="globe-outline" size={20} color="#2D5A3D"/><Text> Website</Text>
        </Pressable>

        <Pressable onPress={redirectCall} style={styles.cafeWebsite}>
          <Ionicons name="call" size={20} color="#2D5A3D"/><Text> Call</Text>
        </Pressable>
      </View>

      {/** cafe user score, average score, and friend score displays */}
      <Text style={{marginVertical: 10, fontFamily: "serif", fontWeight: 600, fontSize: 22}}>Scores</Text>
      <ScrollView horizontal style={styles.scoreCards}>
          <View style={styles.scoreCardContainer}>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreCardRate}>{cafeDetails.user_avg_ranking}</Text>
              </View>

              <View style={{flexDirection: "column"}}>
                <Text style={styles.scoreCardSecondaryText}>Your Sipy Rating</Text>
                <Text style={{fontSize: 12, fontFamily: "serif", color: "gray"}}>Your personal {"\n"}rating</Text>
              </View>
          </View>

          <View style={styles.scoreCardContainer}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreCardRate}>{cafeDetails.friend_avg_ranking}</Text>
            </View>

            <View style={{flexDirection: "column"}}>
              <Text style={styles.scoreCardSecondaryText}>Friend Score</Text>
              <Text style={{fontSize: 12, fontFamily: "serif", color: "gray"}}>What your {"\n"}friends think</Text>
            </View>
          </View>

          <View style={styles.scoreCardContainer}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreCardRate}>{cafeDetails.average_rating}</Text>
            </View>

            <View style={{flexDirection: "column"}}>
              <Text style={styles.scoreCardSecondaryText}>Average Score</Text>
              <Text style={{fontSize: 12, fontFamily: "serif", color: "gray"}}>What all Sipy {"\n"}users think</Text>
            </View>
          </View>
      </ScrollView>
      
      {/** images uploaded by all users display in horizontal flatlist */}
      <Text style={{marginVertical: 10, fontFamily: "serif", fontWeight: 600, fontSize: 22}}>Popular drinks</Text>
      <View style={{flex: 1}}>
        <FlatList 
          data={cafeDetails.images}
          horizontal
          renderItem={({item}: {item: string}) => {
            return (
            <Image source={{uri: item}} style={{borderRadius: 8, width: 200, height: 200, marginRight: 15}}/>)
          }}
        />
      </View>
      
      {/** list of ratings from friends, similar to feed */}
      <Text style={{marginVertical: 10, fontFamily: "serif", fontWeight: 600, fontSize: 22}}>What your friends think</Text>
      {cafeDetails.friend_rankings.length === 0 ? (
        // screen state component that handles error and loading states
        <ScreenState
          error={error}
          empty="No friend ratings yet."
          onRetry={handleCafeDetailsGet}
          compact
        />
      ) : cafeDetails.friend_rankings.map((item: RankingDisplay, index: number) => (
        // map displays require key for each item
        <Pressable
          key={`${item.username}-${item.drink_name}-${index}`}
          onPress={() => router.push({pathname: "/postModal", params: {post: item.id}})}
        >
          {/** Post card same as profile and feed */}
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthorRow}>
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
                  updateFriendPostLike(item.id, true);
                }
              }}>
                <Ionicons name="heart-outline" size={24} color="black" />
                <Text style={styles.postActionCount}>{getLikeCount(item)}</Text>
              </Pressable>
              ) : (
              <Pressable style={styles.feedActionButton} onPress={async () => {
                const removed = await handlePostRemoveLike(item.id);
                if (removed) {
                  updateFriendPostLike(item.id, false);
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
      ))}
      </View>
    </ScrollView>
  </View>
    ) : cafeDetailsLoading ? (
      // if details are loading default to data provided by google autocomplete api
      <View style={styles.container}>
        <View style={{  width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
          <Pressable style={{ marginLeft: 20, marginBottom: 10, justifyContent: 'center' }} onPress={() => router.back()}>
            <Ionicons name='chevron-back' size={24} color="black" />
          </Pressable>
        </View>
        {/** screen state component that handles error and loading states */}
        <ScreenState loading title="Loading cafe" />
      </View>
    ) : (
      // if not, show default display of cafe
      <View style={styles.container}>
      <View style={{  width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
      <Pressable style={{ marginLeft: 20, marginBottom: 10, justifyContent: 'center' }} onPress={() => router.back()}>
          <Ionicons name='chevron-back' size={24} color="black" />
        </Pressable>
      </View>

      <ScrollView style={{ width: '100%', flex: 1, flexDirection: 'column' }}>
      <ImageBackground source={{uri: mapImageUrl}} resizeMode="cover" style={styles.gradientBackgroundCafe}>
          <LinearGradient colors={['rgba(255, 255, 255, 0)', 'white']} style={styles.imageBackgroundCafe}>
          <Text style={styles.cafeTitle}>{cafe.name}</Text>
          <View style={styles.cafeRankings}>
            <View style={styles.cafeRankingStats}>
              <View style={styles.avgRankingWrapper}>
                <Text style={styles.avgRanking}>N/A</Text>
              </View>
              <Text style={styles.numReviews}>(0 Reviews)</Text>
            </View>
            <View style={styles.cafeActions}>
              {/** place holders for redirects, but functional liking and favoriting buttons */}
              <Pressable 
                onPress={() => {
                  handleCafeDetails()
                  handleLike()
                }}
              >
                <Ionicons name="heart-outline" size={24} color="#2D5A3D"/>
              </Pressable>

              <Pressable
                onPress={() => {
                  handleCafeDetails()
                  handleBookmark()
                }}
              >
                <Ionicons name="bookmark-outline" size={24} color="#2D5A3D"/>
              </Pressable>
            </View>
          </View>
          </LinearGradient>
        </ImageBackground>
        <View style={{flex: 1, paddingHorizontal: 20}}>
        <View style={{backgroundColor: 'white'}}>
          <Text style={styles.cafeAddress}>{cafe.address}</Text>
        </View>
        <View style={styles.cafeContacts}>
          <Pressable onPress={redirectWebsite} style={styles.cafeWebsite}>
            <Ionicons name="globe-outline" size={20} color="#2D5A3D"/><Text> Website</Text>
          </Pressable>

          <Pressable onPress={redirectCall} style={styles.cafeWebsite}>
            <Ionicons name="call" size={20} color="#2D5A3D"/><Text> Call</Text>
          </Pressable>
        </View>

        </View>
      </ScrollView>
    </View>
    )}
    </View>
  )
}

export default cafeDetailModal
