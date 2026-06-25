// File: login.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Generic login view with api handlers

import { View, Text, TextInput, Pressable, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Redirect, router } from 'expo-router';
import { styles } from "../assets/styles/my_styles"
import Ionicons from '@expo/vector-icons/build/Ionicons';
import { ScreenState } from '@/components/ScreenState';

// default export of login page
const login = () => {

    // initialize all auth context variables and functions required for logging user in 
    const{ authState, onLogin, loading, error, clearError } = useAuth();

    // state variables to collect input and send to api for authentication
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // this function specifically clears errors from other auth views, such as if a user registers with an existing account
    // which will display an error
    useEffect(() => {
        clearError?.();
    }, []);

    // if user is authenticated already redirect them to protected views
    if (authState?.authenticated) {
        return <Redirect href="/(tabs)" />;
    }

    // handle login view, sends username and password to backend simplejwt endpoints, returns tokens if authenticated
    const handleLogin = async () => {
        const result = await onLogin!(username, password);
        if (result && result.error) {
            return;
        } else {
            console.log("Login successful");
        }
    }

    // react native component returned
  return (
    // allows user to touch out of keyboard
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.loginContainer}>

      {/** back button */}
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

        {/** header text */}
      <Text style={styles.title}>Welcome back!</Text>
      <Text>Already created an account? Login below.</Text>

      {/** inputs for username and password */}
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

      {/** calls handleLogin function to log user in */}
      <Pressable style={styles.largeButton} onPress={handleLogin} disabled={loading?.loggingIn}>
        <Text style={{ color: "white", fontSize: 17, fontFamily: 'arial' }}>{loading?.loggingIn ? "Logging in" : "Login"}</Text>
      </Pressable>
      <ScreenState loading={loading?.loggingIn} error={error} compact />
    </View>
    
    </TouchableWithoutFeedback>
  )
}

export default login
