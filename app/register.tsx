import { View, Text, TextInput, Pressable, Keyboard, TouchableWithoutFeedback, Alert, Image } from 'react-native'
import { useState, useEffect } from 'react'
import { Redirect, router, Stack } from 'expo-router';
import  { useAuth } from '../context/AuthContext'
import { styles } from "../assets/styles/my_styles"
import Colors from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/build/Ionicons';
import * as ImagePicker from 'expo-image-picker';

const register = () => {
    const{ authState, onRegister, onLogin } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState('https://static.vecteezy.com/system/resources/previews/036/280/651/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg');
    const [step, setStep] = useState<number>(1);
    const [error, setError] = useState<string>('');


    if (authState?.authenticated) {
        return <Redirect href="/(tabs)" />;
    }

    

    const handleRegister = async () => {
        const result = await onRegister!(username, password, firstName, lastName, bio, profileImage);
        if (result && result.error) {
            alert(result.msg);
        } else {
            const loginResult = await onLogin!(username, password);

            if (loginResult?.error) {
                alert(loginResult.msg);
                return;
            }
        }
    }

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
    

    const renderStep = () => {
        switch (step) {
          case 1:
            return (
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
              <>
                <Text style={styles.title}>
                  Choose your profile picture
                </Text>

                <Pressable style={styles.profileImage} onPress={handleImagePicker}>
                {profileImage && <Image source={{ uri: profileImage }} style={styles.profileImage} />}
                </Pressable>
      
                <Pressable  onPress={() => handleRegister()} style={styles.largeButton}>
                  <Text style={{ color: "white", fontSize: 17, fontFamily: 'arial' }}>
                    Make Profile
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


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.loginContainer}>
        <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
        >
            <Ionicons name="arrow-back" size={32} color="#2D5A3D" />
        </Pressable>
        
        {renderStep()}
    </View>
    </TouchableWithoutFeedback>
  );
}

export default register;