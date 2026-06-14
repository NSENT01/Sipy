import { View, Text, TextInput, Pressable, Button, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Redirect, router, Stack } from 'expo-router';
import { styles } from "../assets/styles/my_styles"
import Colors from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/build/Ionicons';

const login = () => {
    const{ authState, onLogin } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    if (authState?.authenticated) {
        return <Redirect href="/(tabs)" />;
    }

    const handleLogin = async () => {
        const result = await onLogin!(username, password);
        if (result && result.error) {
            alert(result.msg);
        } else {
            console.log("Login successful");
        }
    }
  return (
    
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View style={styles.loginContainer}>
    <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
    >
        <Ionicons name="arrow-back" size={32} color="#2D5A3D" />
    </Pressable>
      <Text style={styles.title}>Welcome back!</Text>
      <Text>Already created an account? Login below.</Text>
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
      <Pressable style={styles.largeButton}onPress={handleLogin}><Text style={{ color: "white", fontSize: 17, fontFamily: 'arial' }}>Login</Text></Pressable>
    </View>
    
    </TouchableWithoutFeedback>
  )
}

export default login