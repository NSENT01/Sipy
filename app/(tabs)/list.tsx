import { StatusBar, Pressable, FlatList, Image } from 'react-native';
import { styles } from "../../assets/styles/my_styles"
import { useState, useEffect, useContext } from 'react'
import { ProfileContext } from './_layout'
import Ionicons from '@expo/vector-icons/Ionicons';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';

export default function TabTwoScreen() {
  const profileData = useContext(ProfileContext);
  const [selectedTab, setSelectedTab] = useState("ratings")

  const sortedUserRankings = [...(profileData?.user_rankings ?? [])].sort(
    (a, b) => Number(b.score) - Number(a.score)
  );

  return (
    <View style={styles.insideContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.searchTabs}>
        <Pressable onPress={() => setSelectedTab('ratings')} style={selectedTab === 'ratings' ? styles.activeTab : styles.inactiveTab}>
          <Ionicons name="cafe-outline" size={24} color={selectedTab === 'ratings' ? "#2D5A3D" : "black"} /><Text style={selectedTab === 'ratings' ? styles.activeTabText : styles.inactiveTabText}>Your Ratings</Text>
        </Pressable>

        <Pressable onPress={() => setSelectedTab('taste')} style={selectedTab === 'taste' ? styles.activeTab : styles.inactiveTab}>
          <Ionicons name="people-outline" size={24} color={selectedTab === 'taste' ? "#2D5A3D" : "black"} /><Text style={selectedTab === 'taste' ? styles.activeTabText : styles.inactiveTabText}>Want To Try</Text>
        </Pressable>
      </View>
      <View>

      </View>
      { selectedTab === "ratings" ? (
        <View>
          <FlatList
        data={sortedUserRankings}
        style={{ width: '100%', flex: 1, backgroundColor: "white", padding: 20 }}
        renderItem={({ item, index }: {item: any, index: number}) => (
          <View
            style={{ flexDirection: "column", gap: 10, width: "100%", marginVertical: 10, backgroundColor: "white" }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
                backgroundColor: "white",
                width: '100%'
              }}
            >
                <View style={{flexDirection: "row", flex: 1, flexShrink: 1, marginRight: 8, alignItems: "flex-start", backgroundColor: "white"}}>
                  <Text style={{backgroundColor: "white", color: "black", fontSize: 20, fontWeight: "bold"}}>{index + 1}.{" "}</Text>
                  <Text style={{ backgroundColor: "white", color: "black", fontSize: 20, fontWeight: "bold", flex: 1, flexShrink: 1 }}>
                    {item.drink_name} from {item.cafe_name}
                  </Text>
                </View>
              

              <View style={styles.scoreContainerSmallInside}>
                <Text style={styles.scoreCardRateSmall}>{item.score}</Text>
              </View>
            </View>

            <Text style={{backgroundColor: "white", color: "gray"}}>{item.notes}</Text>

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
  );
}


