// File: followModal.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Modal to display the logged in users followers and following

import { Pressable, StatusBar, Image, FlatList } from 'react-native';
import { styles } from "../assets/styles/my_styles"
import { useState, useEffect } from 'react';
import { API_URL, useAuth } from "../context/AuthContext"
import { Redirect, useLocalSearchParams, router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from '@/components/Themed';
import { ScreenState } from '@/components/ScreenState';

const followModal = () => {

    // instantiate auth context variables and functions, state variables, and router parameters, which are normalized to a variable
    // to determine whether to display following or followers
    const { authState, authFetch } = useAuth()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const params = useLocalSearchParams()
    const [followData, setFollowData] = useState<any>(null)
    const title = params.view === "following" ? "Following" : "Followers"

    // get follow data when state variable is empty, modal is booted up, and auth state changes
    useEffect(() => {
        const getData = async () => {
            await handleFollowGet()
        }
        if (authState?.access_token && !followData) {
            getData()
        }
    }, [authState?.access_token, followData])

    // redirect if user is not authenticated
    if (!authState?.authenticated) {
        return <Redirect href="/login" />;
    }

    // api call to get the users followers
    const handleFollowGet = async () => {
        try {
            setLoading(true);
            if (params.view === "followers") {
                const response = await authFetch!(`${API_URL}/get_followers/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })

                // if api call errors, log, set error, and return
                if (!response.ok) {
                    const responseText = await response.text();
                    console.log(responseText);
                    setError("There was an error fetching follow data");
                    return;
                }

                // reset error and set state variable to api data
                const data = await response.json()
                setError("")
                setFollowData(data)
            } else if (params.view === "following") {

                // same process but for following if that is the router param input
                const response = await authFetch!(`${API_URL}/get_following/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    }
                })

                if (!response.ok) {
                    const responseText = await response.text();
                    console.log(responseText);
                    setError("There was an error fetching follow data");
                    return;
                }

                const data = await response.json()
                setError("")
                setFollowData(data)
            }
        } catch (error) {
            // error handling
            console.error("there was an error fetching follow data:", error);
            setError("There was an error fetching follow data")
        } finally {
            // close loading state
            setLoading(false);
        }
    }

    // react native component return
  return (
    <View style={styles.insideContainer}>
        {/** header for exiting modal, displaying whether its following or followers */}
        <View style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: StatusBar.currentHeight || 70,
            paddingHorizontal: 20,
            paddingBottom: 18,
            backgroundColor: "white",
        }}>
          <Text style={{
            color: "black",
            fontSize: 24,
            fontWeight: "bold",
            fontFamily: "arial",
            backgroundColor: "white",
          }}>{title}</Text>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={{
                position: "absolute",
                right: 20,
                bottom: 16,
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
            }}
          >
            <Ionicons name="close" size={28} color="black"/>
          </Pressable>
        </View>
        
        {/** flatlist view of users following or followers */}
        <FlatList
            data={followData ?? []}
            style={{ width: '100%', flex: 1, backgroundColor: "white" }}
            contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 24,
                flexGrow: 1,
            }}
            ListEmptyComponent={
                <ScreenState
                    loading={loading && !followData}
                    error={error}
                    empty={`No ${title.toLowerCase()} yet`}
                    onRetry={handleFollowGet}
                />
            }
            // component rendered for each follower or following item in data
            renderItem={({item}: {item: any}) => {
                const username = item.user?.username ?? item.username;
                const profileImage = item.profile_image ?? item.user?.profile_image;

                return (
                    // on press push profile modal onto stack
                    <Pressable onPress={() => {
                        router.push({
                            pathname: "/profileModal",
                            params: {
                            profileId: username
                            }
                        })
                        }}>
                        <View style={styles.polishedRow}>
                            <View style={styles.polishedRowMain}>
                            <Image source={{ uri: profileImage }} style={[styles.profileImageSmaller, { marginBottom: 0, marginRight: 12 }]} />
                            <View style={{ flex: 1, backgroundColor: "white" }}>
                                <Text style={styles.polishedRowTitle}>@{username}</Text>
                                <Text style={styles.polishedRowMeta}>View profile</Text>
                            </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="lightgray" />
                        </View>
                    </Pressable>
                )
            }}
        />
    </View>
  )
}

export default followModal
