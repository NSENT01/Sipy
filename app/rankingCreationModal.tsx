import { View, Text, ScrollView, TextInput, Pressable, FlatList, Modal, Alert, Image } from 'react-native'
import { useEffect, useState, ReactNode} from 'react'
import { useLocalSearchParams, Redirect, router } from 'expo-router'
import { useAuth } from '../context/AuthContext'
import { styles } from '../assets/styles/my_styles'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import Slider from '@react-native-community/slider';

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

type Drink = {
    name: string,
    id: number,
}

type Ranking = {
    score: number,
    notes: string,
    image: string,
    drink: Drink,
}


const rankingCreationModal = () => {
    const { authState, onLogout, refreshToken } = useAuth();
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
    const [score, setScore] = useState(0);
    const [notes, setNotes] = useState("");
    const [drinkCategory, setDrinkCategory] = useState("Coffee");
    const [drinkName, setDrinkName] = useState("");
    const [imageUri, setImageUri] = useState(null);
    const [error, setError] = useState("");
    const [rankingDetails, setRankingDetails] = useState<Ranking | null>(null);

    const categoryIcon: Record<string, ReactNode> = {
      Coffee: <Ionicons name="cafe-outline" size={24} color={drinkCategory === "Coffee" ? "white" : "black"} />,
      Matcha: <MaterialCommunityIcons name="bowl-mix-outline" size={24} color={drinkCategory === "Matcha" ? "white" : "black"} />,
      Tea: <Ionicons name="leaf-outline" size={24} color={drinkCategory === "Tea" ? "white" : "black"} />,
      Boba: <Ionicons name="ellipse-outline" size={24} color={drinkCategory === "Boba" ? "white" : "black"} />,
      Juice: <Ionicons name="nutrition-outline" size={24} color={drinkCategory === "Juice" ? "white" : "black"} />,
      Smoothies: <Ionicons name="color-fill-outline" size={24} color={drinkCategory === "Smoothies" ? "white" : "black"} />,
      Soda: <Ionicons name="wine-outline" size={24} color={drinkCategory === "Soda" ? "white" : "black"} />,
      Alcohol: <Ionicons name="beer-outline" size={24} color={drinkCategory === "Alcohol" ? "white" : "black"} />,
      Other: <Ionicons name="grid-outline" size={24} color={drinkCategory === "Other" ? "white" : "black"} />,
    };

      const handleImagePicker = async () => {
              // No permissions request is necessary for launching the image library.
              // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
              // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
              // so the app users aren't surprised by a system dialog after picking a video.
              // See "Invoke permissions for videos" sub section for more details.
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
          
              if (!permissionResult.granted) {
                Alert.alert('Permission required', 'Permission to access the media library is required.');
                return;
              }
          
              let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images', 'videos'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
              });
          
              console.log(result);
          
              if (!result.canceled) {
                setImageUri( result.assets[0].uri as any);
              }
            };
    
      const handleLogout = async () => {
        const result = await onLogout!();
        if (result && result.error) {
            alert(result.msg);
        } else {
            console.log("Logout successful");
        }
      };

      const handleRankingPost = async () => {
        // Define form data for post method
        const formData = new FormData();

        formData.append("score", (score?.toFixed(1)) as any);
        formData.append("notes", notes as any);
        formData.append("drink_category", drinkCategory as any);
        formData.append("drink_name", drinkName as any);
        formData.append("cafe_id", cafe.placeId as any);
        
        

        formData.append("image", {
            uri: imageUri,
            name: `${drinkName}.jpg`,
            type: "image/jpeg",
        } as any);

        try {
            const response = await fetch(`${API_URL}/create_ranking/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${authState?.access_token}`
              },
              body: formData,
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
            setRankingDetails(responseData);
          } catch (error) {
            console.error('Error writing ranking to db:', error);
            setError('Failed to write ranking to db');
          }
      }


  return (
    <View style={styles.backdropContainer}>
      <ScrollView style={styles.rankingModal}>
        <View style={styles.modalTitle}>
          <Text style={styles.modalTitleText}>{cafe.name}</Text>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="black"/>
          </Pressable>
        </View>

        <View style={styles.modalCategory}>
          <Text>Drink name</Text>
          <TextInput style={styles.mainInput} placeholderTextColor="gray" value={drinkName} onChangeText={setDrinkName} placeholder='Drink name'/>
        </View>
        
        <View style={styles.modalCategory}>
          <Text style={styles.modalText}>Add to my list of </Text>
          <ScrollView horizontal style={{flexDirection: "row"}}>
          {Object.keys(categoryIcon).map((category) => (
          <Pressable key={category} onPress={async () => {setDrinkCategory(category)}} style={category === drinkCategory ? styles.drinkCategorySelect : styles.drinkCategory}>
            <View style={{flexDirection: "row", alignItems: "center"}}>{categoryIcon[category]}<Text style={category === drinkCategory ? styles.drinkTextSelected : styles.drinkText}>  {category}</Text></View>
          </Pressable>))}
          </ScrollView>
        </View>

        <View style={styles.modalCategory}>
          <Text style={styles.modalText}>How was it?</Text>
          <Slider
            style={{width: 325, height: 40}}
            value={score}
            step={0.1}
            onValueChange={async (value) => setScore(value as number)}
            minimumValue={0}
            maximumValue={10}
            minimumTrackTintColor="#2D5A3D"
            maximumTrackTintColor="gray"
            thumbSize={24}
          />
          <Text style={{alignSelf: "center", fontSize: 24, fontFamily: "serif", color:"#2D5A3D"}}>{score?.toFixed(1)}</Text>
        </View>

        <View style={styles.modalCategory}>
        <Text style={styles.modalText}>Add an image</Text>
          <Pressable onPress={handleImagePicker} style={{borderRadius: 16, width: 300, height: 300, backgroundColor: "lightgray", justifyContent: "center", alignItems: "center", alignSelf: "center", borderStyle: "dashed", borderWidth: 1, borderColor: "gray"}}>
            { !imageUri ? (
              <Ionicons name="add" size={32} color="gray"/>
            ) : (
              <Image source={{ uri: imageUri }} style={{width: 300, height: 300, borderRadius: 8}} />
            )}
          </Pressable>
        </View>

        <View style={styles.modalCategory}>
          <Text style={styles.modalText}>Add notes</Text>
          <TextInput value={notes} onChangeText={setNotes} style={{ padding: 15, alignItems: "flex-start", justifyContent: "flex-start", borderRadius: 12, width: "100%", height: 150, borderWidth: 1, borderColor: "gray"}} textAlignVertical="top" placeholder='Add your notes here' placeholderTextColor={"gray"}></TextInput>
        </View>

        <Pressable onPress={async () => {
          await handleRankingPost();
          router.back()
        }} style={styles.submitModal}>
          <Text style={{color: "white", fontSize: 20, fontWeight: 400, fontFamily: "serif"}}>Submit</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}

export default rankingCreationModal