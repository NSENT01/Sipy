import { View, Text, Pressable, ImageBackground, Image, Button } from 'react-native'
import React from 'react'
import { Redirect, router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { styles } from "../assets/styles/my_styles"
import { LinearGradient } from 'expo-linear-gradient'

const background = require('../assets/images/matcha.png');
const sipy = require('../assets/images/sipy.png')

const index = () => {
    const { authState } = useAuth();
    
        if (authState?.authenticated) {
            return <Redirect href="/(tabs)" />;
        }
        
  return (
    <View style={styles.landingContainer}>
            <ImageBackground source={background} resizeMode="cover" style={styles.gradientBackground}>
            <LinearGradient colors={['rgba(255, 255, 255, 0)', 'white']} style={styles.imageBackground}>
                <View style={styles.topPadding}>
                    <Text style={styles.landingTitle}>Discover the best cafes in the world</Text>
                    <Text style={styles.secondary}>Ranked by people you trust</Text>
                </View>
                <View style={styles.bottomPadding}>
                    <Image source={sipy} style={styles.largeLogo} />
                    <Pressable style={styles.largeButton} onPress={() => {router.push('/register')}}><Text style={{ color: "white", fontSize: 20, fontFamily: 'arial' }}>Get Started</Text></Pressable>
                    <Button color='#2D5A3D' title="Login" onPress={() => {router.push('/login')}} />
                </View>
                </LinearGradient>
            </ImageBackground>
    </View>
  )
}

export default index
