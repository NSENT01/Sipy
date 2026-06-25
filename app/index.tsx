// File: index.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Generic landing page of app

import { View, Text, Pressable, ImageBackground, Image, Button } from 'react-native'
import React from 'react'
import { Redirect, router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { styles } from "../assets/styles/my_styles"
import { LinearGradient } from 'expo-linear-gradient'

// import background image and logo from assets
const background = require('../assets/images/matcha.png');
const sipy = require('../assets/images/sipy.png')

// default export function with react component returned
const index = () => {

    // initialize authState variable
    const { authState } = useAuth();

    // if the user is already authenticated, route them to protected views
    if (authState?.authenticated) {
        return <Redirect href="/(tabs)" />;
    }

    // react native component return 
  return (
    <View style={styles.landingContainer}>
            <ImageBackground source={background} resizeMode="cover" style={styles.gradientBackground}>
            <LinearGradient colors={['rgba(255, 255, 255, 0)', 'white']} style={styles.imageBackground}>
                {/** Top text phrases */}
                <View style={styles.topPadding}>
                    <Text style={styles.landingTitle}>Discover the best cafes in the world</Text>
                    <Text style={styles.secondary}>Ranked by people you trust</Text>
                </View>

                {/** bottom logo, register button to route to register, and login button to route to login */}
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
