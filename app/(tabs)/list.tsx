// File: (tabs)/list.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Show the users list of ordered drink rankings and their cafes they want to try

import { StatusBar, Pressable, FlatList, ScrollView } from 'react-native';
import { styles } from "../../assets/styles/my_styles"
import { useCallback, useContext, useState } from 'react'
import { ProfileContext, ProfileRefreshContext, ProfileStatusContext } from './_layout'
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Text, View } from '@/components/Themed';
import { ScreenState } from '@/components/ScreenState';

// required default export that returns react native component
export default function TabTwoScreen() {

  // define context data, auth context variables and functions, and state variables
  const profileData = useContext(ProfileContext);
  const refreshProfile = useContext(ProfileRefreshContext);
  const profileStatus = useContext(ProfileStatusContext);
  const { authState } = useAuth();
  const [selectedTab, setSelectedTab] = useState("ratings")
  const [selectedDrinkCategory, setSelectedDrinkCategory] = useState("All")
  const drinkCategories = ["All", "Coffee", "Matcha", "Tea", "Boba", "Juice", "Smoothies", "Soda", "Alcohol", "Other"];

  // refresh profile on changes and auth state changes
  useFocusEffect(
    useCallback(() => {
      if (authState?.access_token) {
        refreshProfile()
      }
    }, [authState?.access_token])
  );

  // sort the user rankings by how high they ranked the drink
  const sortedUserRankings = [...(profileData?.user_rankings ?? [])].sort(
    (a, b) => Number(b.score) - Number(a.score)
  );

  const filteredUserRankings = selectedDrinkCategory === "All"
    ? sortedUserRankings
    : sortedUserRankings.filter((ranking) => ranking.drink_category === selectedDrinkCategory);

  // react native component return 
  return (
    <View style={styles.insideContainer}>
      <StatusBar barStyle="dark-content" />

      {/** tabs for rankings and want to try list */}
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
        //ratings flat list
        <View style={{ flex: 1, width: "100%", backgroundColor: "white" }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.rankingFilterScroller}
            contentContainerStyle={styles.rankingFilterContent}
          >
            {drinkCategories.map((category) => {
              const selected = category === selectedDrinkCategory;

              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedDrinkCategory(category)}
                  style={selected ? styles.rankingFilterChipActive : styles.rankingFilterChip}
                >
                  <Text style={selected ? styles.rankingFilterTextActive : styles.rankingFilterText}>{category}</Text>
                </Pressable>
              )
            })}
          </ScrollView>
          <FlatList
        data={filteredUserRankings}
        style={styles.polishedList}
        contentContainerStyle={[styles.polishedListContent, { flexGrow: 1 }]}
        ListEmptyComponent={
          // screen state component that handles error and loading states
          <ScreenState
            loading={profileStatus.loading && !profileData}
            error={profileStatus.error}
            empty={selectedDrinkCategory === "All" ? "No ratings yet." : `No ${selectedDrinkCategory.toLowerCase()} ratings yet.`}
            onRetry={refreshProfile}
          />
        }
        // component rendered for each item in data
        renderItem={({ item, index }: {item: any, index: number}) => (
          <View style={styles.polishedRow}>
            <View style={styles.polishedRowMain}>

              {/** drink details and ordering */}
              <Text style={{ backgroundColor: "white", color: "black", fontSize: 18, fontWeight: "bold", width: 34 }}>{index + 1}.</Text>
              <View style={{ flex: 1, backgroundColor: "white" }}>
                <Text style={styles.polishedRowTitle}>{item.drink_name}</Text>
                <Text style={styles.polishedRowMeta}>{item.cafe_name}</Text>
                {item.notes ? <Text numberOfLines={2} style={styles.polishedRowMeta}>{item.notes}</Text> : null}
              </View>
            </View>
            <View style={styles.polishedScoreBadge}>
              <Text style={styles.polishedScoreText}>{item.score}</Text>
            </View>
          </View>
        )}
      />
        </View>
      ) : (

        // flatlist for want to try list
        <View style={{ flex: 1, width: "100%", backgroundColor: "white" }}>
          <FlatList
        data={profileData?.want_to_try ?? []}
        style={{ flex: 1, backgroundColor: "white" }}
        contentContainerStyle={[styles.polishedListContent, { flexGrow: 1 }]}
        ListEmptyComponent={
          // screen state component that handles error and loading states
          <ScreenState
            loading={profileStatus.loading && !profileData}
            error={profileStatus.error}
            empty="No saved cafes yet."
            onRetry={refreshProfile}
          />
        }
        // component rendered for each item in data
        renderItem={({ item }: {item: any}) => (
          <View style={styles.polishedRow}>
            <View style={styles.polishedRowMain}>
              <View style={styles.polishedIconCircle}>
                <Ionicons name="bookmark" size={20} color="#2D5A3D" />
              </View>
              
              {/** basic cafe details */}
              <View style={{ flex: 1, backgroundColor: "white" }}>
                <Text style={styles.polishedRowTitle}>{item.cafe.name}</Text>
                {item.cafe.address ? <Text numberOfLines={1} style={styles.polishedRowMeta}>{item.cafe.address}</Text> : null}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="lightgray" />
          </View>
        )}
      />
        </View>
      )}
    </View>
  );
}
