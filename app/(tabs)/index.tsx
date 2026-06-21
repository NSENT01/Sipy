import { ScrollView, TextInput, Pressable, StatusBar, Image, FlatList } from 'react-native';
import { styles } from "../../assets/styles/my_styles"

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useContext } from 'react';
import {ProfileContext} from './_layout'

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

export default function TabOneScreen() {
  const profileData = useContext(ProfileContext);

  const handleSearch = () => {
    router.push('/searchModal');
  };

  return (
    <View style={styles.insideContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.searchBox}>
        <Pressable 
          onPress={handleSearch}
          style={styles.restaurantSearch} 
        ><Ionicons name="search" size={20} color="gray" /><Text style={styles.searchPlaceholder}>  Search cafes or profiles</Text></Pressable>
      </View>
      {profileData?.friend_rankings ? (
      <FlatList
        data={profileData.friend_rankings}
        style={{ width: '100%', flex: 1, padding: 20, backgroundColor: "white" }}
        ListHeaderComponent={
          <>
            <Text style={{fontFamily: "serif", fontWeight: "bold", fontSize: 18, color: "black"}}>YOUR FEED</Text>
          </>
        }
        renderItem={({ item }: {item: RankingDisplay}) => (
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
                  style={styles.profileImageSmall}
                />
                </Pressable>
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
      ) : (
        <View style={{ width: '100%', flex: 1, padding: 20 }}> 
          <Text style={{fontFamily: "serif", fontWeight: "bold", fontSize: 18, color: "black"}}>YOUR FEED</Text>
        </View>
      )}
    </View>
  );
}


