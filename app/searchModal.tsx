import { View, Text, TouchableWithoutFeedback, Keyboard, Image, Pressable, TextInput, ScrollView } from 'react-native'
import { useState, useEffect } from 'react'
import { styles } from '../assets/styles/my_styles'
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Redirect } from 'expo-router'
import { useAuth } from '@/context/AuthContext';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const logo = require('../assets/images/sipy.png')

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

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

const searchModal = () => {
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState('cafes');
  

  if (!authState?.authenticated) {
    return <Redirect href="/login" />;
  }
  

  return (
    
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={{flex:1}}>
    <View style={styles.container}>
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Image source={logo} style={{ width: 50, height: 50, marginLeft: 20 }} />
      <Pressable style={{ marginRight: 20, justifyContent: 'center' }} onPress={() => router.back()}>
          <Ionicons name='close-circle' size={24} color="gray" />
        </Pressable>
      </View>
      <View style={styles.searchTabs}>
        <Pressable onPress={() => setActiveTab('cafes')} style={activeTab === 'cafes' ? styles.activeTab : styles.inactiveTab}>
          <Ionicons name="cafe-outline" size={24} color={activeTab === 'cafes' ? "#2D5A3D" : "black"} /><Text style={activeTab === 'cafes' ? styles.activeTabText : styles.inactiveTabText}>Cafes</Text>
        </Pressable>

        <Pressable onPress={() => setActiveTab('members')} style={activeTab === 'members' ? styles.activeTab : styles.inactiveTab}>
          <Ionicons name="people-outline" size={24} color={activeTab === 'members' ? "#2D5A3D" : "black"} /><Text style={activeTab === 'members' ? styles.activeTabText : styles.inactiveTabText}>Members</Text>
        </Pressable>
      </View>
      { activeTab === 'cafes' ? (
        <View style={styles.searchBoxGoogle}>
        
        
        <GooglePlacesAutocomplete
          isNewPlacesAPI={true}
          requestUrl={{
            useOnPlatform: "all",
            url: "https://places.googleapis.com",
            headers: {
              "Content-Type": "application/json",
            },
          }}
          placeholder='Search cafes'
          isRowScrollable={false}
          fetchDetails={true}
          onFail={(error) => console.error("Google Places:", error)}
          onTimeout={() => console.error("Google Places request timed out")}
          timeout={10000}
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            const placeDetails = details as GooglePlaceDetailsNew | null;

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
          query={{
            key: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
            languageCode: "en",
            includedPrimaryTypes: ["cafe", "restaurant", "bar", "bakery", "coffee_shop"],
          }}
          renderRow={(result) => (
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Ionicons name="location-sharp" size={25} color="red"/>
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
        
      </View>
      ) : (
      
        <View style={styles.searchBox}>
        <View style={styles.restaurantSearch} >
          <Ionicons name="search" size={20} color="gray" />
          <TextInput 
                placeholderTextColor="gray" 
                placeholder={activeTab === 'cafes' ? "Search cafes" : "Search members"}
          ></TextInput>
        </View>
      </View>
      
      )}
    </View>
    </View>
  </TouchableWithoutFeedback>
  
  )
}

export default searchModal