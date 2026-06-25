// File: profileEditModal.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Non full screen modal for updating a users profile

import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from '@/components/Themed';
import { API_URL } from './(tabs)/_layout';
import { useAuth } from '../context/AuthContext';
import { styles } from '../assets/styles/my_styles';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Image, Keyboard, Pressable, TextInput, TouchableWithoutFeedback } from 'react-native';
import { ScreenState } from '@/components/ScreenState';


// deftaul export function
const profileEditModal = () => {
    // path params for populating form with current user profile data
  const params = useLocalSearchParams<{
    firstName?: string;
    lastName?: string;
    bio?: string;
    profileImage?: string;
    username?: string;
  }>();

  // state variables and auth context variables and functions
  const { authState, authFetch } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [imageChanged, setImageChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // on load populate the form with current profile data
  useEffect(() => {
    setFirstName(params.firstName ?? '');
    setLastName(params.lastName ?? '');
    setBio(params.bio ?? '');
    setProfileImage(params.profileImage ?? '');
    setImageChanged(false);
  }, [params.firstName, params.lastName, params.bio, params.profileImage]);

  // if user is not authenticated redirect to login page
  if (!authState?.authenticated) {
    return <Redirect href="/login" />;
  }

  // image picker from expo image picker npm package (copy paste from documentation)
  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setImageChanged(true);
    }
  };

  // create the form data for submission of profile update
  const buildProfileForm = () => {
    const formData = new FormData();

    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('bio_text', bio);

    // if the user changed their profile image also add this media to the form with its uri, name, and image type
    if (imageChanged && profileImage) {
      formData.append('profile_image', {
        uri: profileImage,
        name: `${params.username || 'profile'}_profile_image.jpg`,
        type: 'image/jpeg',
      } as any);
    }

    return formData;
  };

  // api call helper function to update profile, PATCH method enables HTTP request to update only some fields of a record 
  const updateProfile = async () => {
    return await authFetch!(`${API_URL}/update_profile/`, {
      method: 'PATCH',
      body: buildProfileForm(),
    });
  };

  // main function to handle updating profile
  const handleSave = async () => {
    try {
        // set loading state
      setSaving(true);

        // wait for helper api call
      let response = await updateProfile();

      // if update fails log, set error for error state and return
      if (!response.ok) {
        const responseText = await response.text();
        console.log(responseText);
        setError('There was an error updating your profile');
        return;
      }

      //empty error if succeeds and close edit profile modal
      setError('');
      router.back();
    } catch (error) {
        // error handling
      console.error('There was an error updating the profile:', error);
      setError('There was an error updating your profile');
    } finally {
        // close loading state
      setSaving(false);
    }
  };

    // react native component returned
  return (
    // enabled user to touch out of keyboard
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.editModalSurface}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          marginBottom: 4,
        }}>
            {/** cancel button if user does not want to edit */}
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={{ color: '#2D5A3D', fontSize: 17, backgroundColor: 'white' }}>Cancel</Text>
          </Pressable>
          <Text style={{
            color: 'black',
            fontSize: 22,
            fontWeight: 'bold',
            fontFamily: 'georgia',
            backgroundColor: 'white',
          }}>Edit Profile</Text>

          {/** save profile edits button in header */}
          <Pressable onPress={handleSave} disabled={saving} hitSlop={12}>
            <Text style={{ color: saving ? 'gray' : '#2D5A3D', fontSize: 17, fontWeight: '600', backgroundColor: 'white' }}>
              {saving ? 'Saving' : 'Save'}
            </Text>
          </Pressable>
    </View>

          {/** all profile edit fields, image picker, names, bio */}
        <Pressable style={styles.editProfileImageWrap} onPress={handleImagePicker}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={[styles.profileImage, { marginBottom: 0 }]} />
          ) : (
            <Ionicons name="person-outline" size={42} color="gray" />
          )}
        </Pressable>
        <Pressable style={styles.editPhotoButton} onPress={handleImagePicker}>
          <Text style={styles.editPhotoText}>Change Photo</Text>
        </Pressable>

        <TextInput
          style={[styles.mainInput, { borderColor: "lightgray", borderWidth: 1, borderBottomWidth: 1 }]}
          placeholder="First Name"
          placeholderTextColor="gray"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={[styles.mainInput, { borderColor: "lightgray", borderWidth: 1, borderBottomWidth: 1 }]}
          placeholder="Last Name"
          placeholderTextColor="gray"
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          style={[styles.mainInput, { height: 100, textAlignVertical: 'top', borderColor: "lightgray", borderWidth: 1, borderBottomWidth: 1 }]}
          placeholder="Bio"
          placeholderTextColor="gray"
          value={bio}
          multiline
          onChangeText={setBio}
        />

        <ScreenState loading={saving} error={error} compact />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default profileEditModal;
