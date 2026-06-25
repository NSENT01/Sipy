// File: searchModal.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: When a user wants to search for a cafe or a user

import { View, Text, TouchableWithoutFeedback, Keyboard, Image, Pressable, TextInput, FlatList } from 'react-native'
import { useState, useEffect } from 'react'
import { styles } from '../assets/styles/my_styles'
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Redirect } from 'expo-router'
import { useAuth } from '@/context/AuthContext';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { ScreenState } from '@/components/ScreenState';

// import logo asset
const logo = require('../assets/images/sipy.png')

// define typescript type for google places api incoming data with only data required by our api
type GooglePlaceDetailsNew = {
  formattedAddress?: string;
  websiteUri?: string;
  internationalPhoneNumber?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  postalAddress?: {
    locality?: string;
    administrativeArea?: string;
    regionCode?: string;
    postalCode?: string;
    addressLines?: string[];
  };
};

// load api url from .env
const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

// default export functiom
const searchModal = () => {
  // instantiate auth context variables and functions, and state variables
  const { authState, authFetch } = useAuth();
  const [activeTab, setActiveTab] = useState('cafes');
  const [search, setSearch] = useState("")
  const [searchData, setSearchData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("")
  
  // if user is not authenticated route to login
  if (!authState?.authenticated) {
    return <Redirect href="/login" />;
  }
  
  // trigger search when search text changes
  useEffect(() => {
    let cancelled = false;

    if (activeTab === 'members') {
      const runSearch = async () => {
        if (!search.trim()) {
          setSearchData([]);
          return;
        }

        try {
          // set loading state and make search api call with query parameter
          setLoading(true);
          const response = await authFetch!(`${API_URL}/search_profiles/?q=${encodeURIComponent(search)}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            }
          })

          // if response fails log, set error for error state and return
          if (!response.ok) {
            const responseText = await response.text();
            console.log(responseText);
            setError("There was an error searching for profiles");
            return;
          }

          // otherwise reset the search data
          const data = await response.json();
          if (!cancelled) {
            setSearchData(data);
            setError("");
          }
        } catch (error) {
          // error handling
          console.error("There was an error searching for profiles:", error);
          if (!cancelled) {
            setSearchData([]);
            setError("There was an error searching for profiles");
          }
        } finally {
          // close loading state
          if (!cancelled) {
            setLoading(false);
          }
        }
      }

      runSearch();
    }

    return () => {
      cancelled = true;
    }
  }, [search, activeTab, authFetch]);

  // Clear search when switching tabs
  useEffect(() => {
    setSearch("");
    setSearchData([]);
    setError("");
  }, [activeTab]);

  return (
    // enables user to touch out of keyboard
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>

          {/** header with logo and exit button */}
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Image source={logo} style={{ width: 50, height: 50, marginLeft: 20 }} />
            <Pressable style={{ marginRight: 20, justifyContent: 'center' }} onPress={() => router.back()}>
              <Ionicons name='close-circle' size={24} color="gray" />
            </Pressable>
          </View>

          {/** tabs for different searches */}
          <View style={styles.searchTabs}>
            <Pressable onPress={() => setActiveTab('cafes')} style={activeTab === 'cafes' ? styles.activeTab : styles.inactiveTab}>
              <Ionicons name="cafe-outline" size={24} color={activeTab === 'cafes' ? "#2D5A3D" : "black"} />
              <Text style={activeTab === 'cafes' ? styles.activeTabText : styles.inactiveTabText}>Cafes</Text>
            </Pressable>

            <Pressable onPress={() => setActiveTab('members')} style={activeTab === 'members' ? styles.activeTab : styles.inactiveTab}>
              <Ionicons name="people-outline" size={24} color={activeTab === 'members' ? "#2D5A3D" : "black"} />
              <Text style={activeTab === 'members' ? styles.activeTabText : styles.inactiveTabText}>Members</Text>
            </Pressable>
          </View>

          {/** different tab bodies */}
          {activeTab === 'cafes' ? (
            <View style={styles.searchBoxGoogle}>

              {/** google places autocomplete api imported component */}
              <GooglePlacesAutocomplete
                isNewPlacesAPI={true}

                // specify url to request data from
                requestUrl={{
                  useOnPlatform: "all",
                  url: "https://places.googleapis.com",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }}

                // placeholders, details fetched, and fail/timeout handling
                placeholder='Search cafes'
                isRowScrollable={false}
                fetchDetails={true}
                onFail={(error) => {
                  console.error("Google Places:", error);
                  setError("There was an error searching cafes");
                }}
                onTimeout={() => {
                  console.error("Google Places request timed out");
                  setError("Cafe search timed out");
                }}
                timeout={10000}

                // on press function
                onPress={(data, details = null) => {
                  const placeDetails = details as GooglePlaceDetailsNew | null;
                  
                  // on press push the cafe detail modal onto stack with data from google places api as path params
                  router.push({
                    pathname: "/cafeDetailModal",
                    params: {
                      placeId: data.place_id,
                      name: data.structured_formatting?.main_text,
                      address: placeDetails?.formattedAddress,
                      latitude: placeDetails?.location?.latitude?.toString(),
                      longitude: placeDetails?.location?.longitude?.toString(),
                      website: placeDetails?.websiteUri,
                      phoneNumber: placeDetails?.internationalPhoneNumber,
                      city: placeDetails?.postalAddress?.locality,
                      region: placeDetails?.postalAddress?.administrativeArea,
                      country: placeDetails?.postalAddress?.regionCode,
                    },
                  });
                }}

                // query configurations, specifically only allow display and fetch of places with types that pertain to our app function
                query={{
                  key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
                  languageCode: "en",
                  includedPrimaryTypes: ["cafe", "restaurant", "bar", "bakery", "coffee_shop"],
                }}

                // custom row styling within google places api
                renderRow={(result) => (
                  <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Ionicons name="location-sharp" size={25} color="red" />
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text numberOfLines={1} style={{ fontWeight: "600", fontSize: 16, marginBottom: 4 }}>
                        {result.structured_formatting?.main_text}
                      </Text>
                      <Text numberOfLines={1} style={{ color: "gray" }}>
                        {result.structured_formatting?.secondary_text}
                      </Text>
                    </View>
                  </View>
                )}

                // style defintions following google autocomplete libarry component definitions
                styles={{
                  textInput: {
                    backgroundColor: "lightgray",
                    borderColor: "lightgray",
                    borderRadius: 8,
                    padding: 8,
                    borderBottomWidth: 0,
                    display: 'flex',
                    flexDirection: 'row',
                    height: 40,
                    width: '100%',
                    alignSelf: 'center',
                    alignItems: 'center',
                  },
                  container: {
                    zIndex: 10,
                  },
                  row: {
                    width: "100%",
                    padding: 14,
                    backgroundColor: "white",
                  }
                }}
              />
              {/** if error, show error state */}
              {error ? <ScreenState error={error} compact /> : null}
            </View>
          ) : (
            // search for profiles
            <View style={{ flex: 1, width: '100%'}}>
              <View style={styles.searchBox}>

                {/** profile search box */}
                <View style={styles.restaurantSearch}>
                  <Ionicons name="search" size={20} color="gray" />
                  <TextInput
                    placeholderTextColor="gray"
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search members"
                  />
                </View>
              </View>

              {/** flatlist display of search profiles fetched with each api call */}
              <FlatList
                data={searchData}
                style={{ width: '100%', flex: 1, backgroundColor: "white", marginBottom: 20, padding: 20 }}
                ListEmptyComponent={
                  search.trim() ? (
                    <ScreenState
                      loading={loading}
                      error={error}
                      empty="No members found."
                      compact
                    />
                  ) : (
                    // display empty state if no users match query
                    <ScreenState empty="Search for members by username." compact />
                  )
                }

                // component to be displayed for each profile
                renderItem={({ item }: { item: any }) => (

                  // route to profile modal if user clicks a component
                  <Pressable onPress={() => {
                    router.push({
                      pathname: "/profileModal",
                      params: {
                        profileId: item.username
                      }
                    })
                  }}>
                    {/** generic display with profile image and username */}
                    <View style={{ flexDirection: "row", justifyContent: 'space-between', gap: 10, width: "100%", marginTop: 10, backgroundColor: "white", alignItems: "center" }}>
                      <View style={{ flexDirection: "row", gap: 10, backgroundColor: "white", justifyContent: "center", alignItems: "center" }}>
                        <Image source={{ uri: item.profile_image }} style={styles.profileImageSmaller} />
                        <Text style={{ backgroundColor: "white", color: "black", fontSize: 18 }}>{item.username}</Text>
                      </View>
                    </View>
                    <View style={{ width: "100%", height: 1, backgroundColor: "lightgray", marginTop: 10 }} />
                  </Pressable>
                )}
              />
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default searchModal
