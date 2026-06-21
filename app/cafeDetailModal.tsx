import { View, Text, ScrollView, Image, Pressable, ImageBackground, FlatList } from 'react-native'
import { useEffect, useState} from 'react'
import { useLocalSearchParams, Redirect, router } from 'expo-router'
import { useAuth } from '../context/AuthContext'
import { styles } from '../assets/styles/my_styles'
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient'
import * as Linking from 'expo-linking';

type RankingDisplay = {
  id: number;
  score: string;
  notes: string;
  image: string | null;
  created_at: string;

  drink_name: string;
  drink_category: string;

  cafe_name: string;
  cafe_place_id: string;

  user_id: number;
  username: string;
  profile_image: string | null;
};

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

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY as string

const cafeDetailModal = () => {
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
  const { authState, refreshToken, onLogout } = useAuth()
  const [error, setError] = useState("");
  const [cafeDetails, setCafeDetails] = useState<Cafe | null>(null);
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

  useEffect(() => {
    if (authState?.access_token && authState?.authenticated && cafe.placeId) {
      handleCafeDetailsGet()
      
    }
  }, [authState, cafe.placeId]);
  

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

  const handleCafeDetailsGet = async () => {
    try {
      const response = await fetch(`${API_URL}/get_cafe/?cafe=${encodeURIComponent(String(cafe.placeId))}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState?.access_token}`
        },
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
      console.error('Error fetching cafe item:', error);
      setError('Failed to fetching cafe item');
    }
  }

  const handleCafeDetails = async () => {
      if (cafeDetails) {
        return
      }
      try {
        const response = await fetch(`${API_URL}/create_cafe/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authState?.access_token}`
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
        setError("");
  
        const responseData = await response.json();
        setCafeDetails(responseData)
        
      } catch (error) {
        console.error('Error creating cafe item:', error);
        setError('Failed to create cafe item');
      }
    }

    const handleLike = async () => {
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

    const handleBookmark = async () => {

    }

    const redirectWebsite = async () => {
      if (cafeDetails) {
        const response = await Linking.openURL(`${cafeDetails.website}`)

        if (response) {
          console.log("Succesfully routed to website")
        } else {
          console.log("Website redirection failed")
        }
      } else {
        const response = await Linking.openURL(`${cafe.website}`);

        if (response) {
          console.log("Succesfully routed to website")
        } else {
          console.log("Website redirection failed")
        }
      }
    }

    const normalizePhoneNumber = (phoneNumber: string | null | undefined) => {
      if (!phoneNumber) {
        return
      }
      return phoneNumber.replaceAll(" ", "");
    
    }

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

  return (
    <View style={{flex: 1, backgroundColor: "white"}}>
    { cafeDetails ? (
    <View style={styles.container}>
    <View style={{  width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
    <Pressable style={{ marginLeft: 20, marginBottom: 10, justifyContent: 'center' }} onPress={() => router.back()}>
        <Ionicons name='chevron-back' size={24} color="black" />
      </Pressable>
    </View>

    <ScrollView style={{ width: '100%', flex: 1, flexDirection: 'column' }}>
    <ImageBackground source={{uri: mapImageUrl}} resizeMode="cover" style={styles.gradientBackgroundCafe}>
        <LinearGradient colors={['rgba(255, 255, 255, 0)', 'white']} style={styles.imageBackgroundCafe}>
        <Text style={styles.cafeTitle}>{cafeDetails.name}</Text>
        <View style={styles.cafeRankings}>
          <View style={styles.cafeRankingStats}>
            <View style={styles.avgRankingWrapper}>
              <Text style={styles.avgRanking}>{(cafeDetails.average_rating as number)?.toFixed(1)}</Text>
            </View>
            <Text style={styles.numReviews}>({cafeDetails.num_rankings})</Text>
          </View>
          <View style={styles.cafeActions}>
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
      <View style={{flex: 1, paddingHorizontal: 20, paddingBottom: 30}}>
      <View style={{backgroundColor: 'white'}}>
        <Text style={styles.cafeAddress}>{cafeDetails.address}</Text>
      </View>
      <View style={styles.cafeContacts}>
        <Pressable onPress={redirectWebsite} style={styles.cafeWebsite}>
          <Ionicons name="globe-outline" size={20} color="#2D5A3D"/><Text> Website</Text>
        </Pressable>

        <Pressable onPress={redirectCall} style={styles.cafeWebsite}>
          <Ionicons name="call" size={20} color="#2D5A3D"/><Text> Call</Text>
        </Pressable>
      </View>
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
      
      <Text style={{marginVertical: 10, fontFamily: "serif", fontWeight: 600, fontSize: 22}}>Popular drinks</Text>
      <View style={{flex: 1}}>
        <FlatList 
          data={cafeDetails.images}
          horizontal
          renderItem={({item}: {item: string}) => {
            console.log(item);
            return (
            <Image source={{uri: item}} style={{borderRadius: 8, width: 200, height: 200, marginRight: 15}}/>)
          }}
        />
      </View>
      
      <Text style={{marginVertical: 10, fontFamily: "serif", fontWeight: 600, fontSize: 22}}>What your friends think</Text>
      <View>

      </View>
      {cafeDetails.friend_rankings.map((item: RankingDisplay, index: number) => (
        <View
          key={`${item.username}-${item.drink_name}-${index}`}
          style={{ flexDirection: "column", gap: 10, width: "100%", marginVertical: 10 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{ uri: item.profile_image as string }}
                style={styles.profileImageSmall}
              />
              <Text style={{ marginLeft: 6 }}>
                {item.username} ranked {item.drink_name} {"\n"}from {item.cafe_name}
              </Text>
            </View>

            <View style={styles.scoreContainerSmall}>
              <Text style={styles.scoreCardRateSmall}>{item.score}</Text>
            </View>
          </View>

          <Image
            source={{ uri: item.image as string }}
            style={{ borderRadius: 8, width: 130, height: 130, zIndex: 2 }}
          />

          <Text>{item.notes}</Text>

          <View style={{ flexDirection: "row" }}>
            <Ionicons name="heart-outline" size={24} color="black" />
            <Ionicons name="chatbubble-outline" size={24} color="black" />
          </View>
        </View>
      ))}
      </View>
    </ScrollView>
  </View>
    ) : (
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
                <Text style={styles.avgRanking}>8.3</Text>
              </View>
              <Text style={styles.numReviews}>(6,137 reviews)</Text>
            </View>
            <View style={styles.cafeActions}>
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
        <View style={styles.scoreCards}>
            <View>
                <View>

                </View>

                <View>

                </View>
            </View>

            <View>
                <View>

                </View>

                <View>

                </View>
            </View>

            <View>
                <View>

                </View>

                <View>

                </View>
            </View>
        </View>

        <View>

        </View>

        <View>

        </View>

        </View>
      </ScrollView>
    </View>
    )}
    </View>
  )
}

export default cafeDetailModal