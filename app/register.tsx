import { View, Text, TextInput, Pressable } from 'react-native'
import { useState, useEffect } from 'react'
import { Redirect, router, Stack } from 'expo-router';
import  { useAuth } from '../context/AuthContext'
import { styles } from "../assets/styles/my_styles"
import Colors from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/build/Ionicons';

const register = () => {
    const{ authState, onRegister, onLogin } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [step, setStep] = useState(1);


    if (authState?.authenticated) {
        return <Redirect href="/(tabs)" />;
    }

    const handleLogin = async () => {
    const result = await onLogin!(username, password);
    if (result && result.error) {
        alert(result.msg);
    } else {
        console.log("Login successful");
        router.push("/(tabs)");
    }
}

    const handleRegister = async () => {
        const result = await onRegister!(username, password, firstName, lastName, bio, profileImage);
        if (result && result.error) {
            alert(result.msg);
        } else {
            console.log("Registration successful");
            handleLogin();
            router.push("/(tabs)");
        }
    }
  return (
    <>
    <Stack.Screen
        options={{
          title: "Register",
          headerTransparent: false,
            headerShadowVisible: false,
          headerShown: true,
        }}
      />
    <View style={styles.container}>
        <Text style={styles.title}>First, let's create your account</Text>
        <TextInput 
        style={styles.mainInput}
        placeholder='Username'
        placeholderTextColor="gray"
        value={username}
        onChangeText={setUsername}
        />
        <TextInput 
        style={styles.mainInput}
        placeholder="Password"
        placeholderTextColor="gray"
        value={password}
        onChangeText={setPassword}
        secureTextEntry 
        />
        
    </View>
    </>
  )
}

export default register