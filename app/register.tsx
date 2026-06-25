// File: register.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: View for registering a user

import { View, Text, TextInput, Pressable, Keyboard, TouchableWithoutFeedback, Alert, Image } from 'react-native'
import { useState, useEffect } from 'react'
import { Redirect, router } from 'expo-router';
import  { useAuth } from '../context/AuthContext'
import { styles } from "../assets/styles/my_styles"
import Ionicons from '@expo/vector-icons/build/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenState } from '@/components/ScreenState';

// default function export
const register = () => {
    // instantiate auth context variables and functions amd state variables
    const{ authState, onRegister, onLogin, loading, error: authError, clearError } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState('https://static.vecteezy.com/system/resources/previews/036/280/651/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg');
    const [step, setStep] = useState<number>(1);
    const [error, setError] = useState<string>('');

    // when page is loaded clear the error message from other authentication routes
    useEffect(() => {
        clearError?.();
        setError('');
    }, []);

    // if user is authenticated then route to protected views
    if (authState?.authenticated) {
        return <Redirect href="/(tabs)" />;
    }

    
    // function for handling register using auth context onRegister function definition, display error message if errors
    const handleRegister = async () => {
        const result = await onRegister!(username, password, firstName, lastName, bio, profileImage);
        if (result && result.error) {
            setError(result.msg ?? "There was an error registering the user");
        } else {
            const loginResult = await onLogin!(username, password);

            if (loginResult?.error) {
                setError(loginResult.msg ?? "There was an error logging in the user");
                return;
            }
            setError("");
        }
    }

    // expo image picker library (copy paste from documentation)
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
          setProfileImage( result.assets[0].uri );
        }
      };
    

    // function for rendering different react native components based on the registration step
    const renderStep = () => {
        switch (step) {
          case 1:
            return (
              // first step with user creation
              <>
                <Text style={styles.title}>First, let's create your account</Text>
      
                <TextInput
                  style={styles.mainInput}
                  placeholder="Username"
                  placeholderTextColor="gray"
                  value={username}
                  onChangeText={setUsername}
                />
      
                <TextInput
                  style={styles.mainInput}
                  placeholder="Password"
                  placeholderTextColor="gray"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
      
                <Pressable
                  style={styles.largeButton}
                  onPress={() => setStep(2)}
                >
                  <Text style={{ color: "white", fontSize: 17, fontFamily: 'arial' }}>
                    Next
                  </Text>
                </Pressable>
              </>
            );
      
          case 2:
            return (
              // second step with first and last name
              <>
                <Text style={styles.title}>
                  Enter your name so you can be found!
                </Text>
      
                <TextInput
                  style={styles.mainInput}
                  placeholder="First Name"
                  placeholderTextColor="gray"
                  value={firstName}
                  onChangeText={setFirstName}
                />
      
                <TextInput
                  style={styles.mainInput}
                  placeholder="Last Name"
                  placeholderTextColor="gray"
                  value={lastName}
                  onChangeText={setLastName}
                />
      
                <Pressable onPress={() => setStep(3)} style={styles.largeButton}>
                  <Text style={{ color: "white", fontSize: 17, fontFamily: 'arial' }}>
                    Next
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.largeBackButton}
                  onPress={() => setStep(1)}
                >
                  <Text style={{ color: "white", fontSize: 17, fontFamily: 'arial' }}>
                    Back
                  </Text>
                </Pressable>
              </>
            );
      
          case 3:
            return (
              //third step with bio
              <>
                <Text style={styles.title}>
                  Tell people a bit about yourself!
                </Text>
      
                <TextInput
                  style={styles.mainInput}
                  placeholder="Bio"
                  value={bio}
                  placeholderTextColor="gray"
                  onChangeText={setBio}
                />
      
                <Pressable onPress={() => setStep(4)} style={styles.largeButton}>
                  <Text style={{ color: "white", fontSize: 17, fontFamily: 'arial' }}>
                    Next
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.largeBackButton}
                  onPress={() => setStep(2)}
                >
                  <Text style={{ color: "white", fontSize: 17, fontFamily: 'arial' }}>
                    Back
                  </Text>
                </Pressable>
              </>
            );
      
          case 4:
            return (
              //last step with profile picture and registration submission
              <>
                <Text style={styles.title}>
                  Choose your profile picture
                </Text>

                <Pressable style={styles.profileImage} onPress={handleImagePicker}>
                {profileImage && <Image source={{ uri: profileImage }} style={styles.profileImage} />}
                </Pressable>
      
                <Pressable  onPress={() => handleRegister()} style={styles.largeButton} disabled={loading?.registering || loading?.loggingIn}>
                  <Text style={{ color: "white", fontSize: 17, fontFamily: 'arial' }}>
                    {loading?.registering || loading?.loggingIn ? "Creating profile" : "Make Profile"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.largeBackButton}
                  onPress={() => setStep(3)}
                >
                  <Text style={{ color: "white", fontSize: 17, fontFamily: 'arial' }}>
                    Back
                  </Text>
                </Pressable>
              </>
            );
      
          default:
            return null;
        }
      };

    // main react native component returned by default export function
  return (

    // enables user to touch out of keyboard 
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.loginContainer}>
       {/** back button if stack is not empty below this item */}
        <Pressable
            onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/");
                }
              }}
            style={styles.backButton}
        >
            <Ionicons name="arrow-back" size={32} color="#2D5A3D" />
        </Pressable>
        
        {/** render step component from prior */}
        {renderStep()}

        {/** handle error and loading states */}
        <ScreenState
          loading={loading?.registering || loading?.loggingIn}
          error={error || authError}
          compact
        />
    </View>
    </TouchableWithoutFeedback>
  );
}

export default register;
