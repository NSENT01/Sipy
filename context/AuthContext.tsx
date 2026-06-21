import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from "expo-secure-store";

// Define props for auth components
interface AuthProps {
    authState?: {access_token: string | null, refresh_token: string | null, authenticated: boolean | null};
    onRegister?: (username: string, password: string, first_name: string, last_name: string, bio_text: string, profile_image_uri: string) => Promise<any>;
    onLogin?: (username: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
    refreshToken?: () => Promise<any>;
}

// token key and api url to access tokens and fetch from api using secure store
const TOKEN_KEY = process.env.EXPO_PUBLIC_ACCESS_TOKEN_KEY as string;
const REFRESH_TOKEN_KEY = process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY as string;
export const API_URL = process.env.EXPO_PUBLIC_API_URL as string;
export const TOKEN_API_URL = process.env.EXPO_PUBLIC_TOKEN_API_URL as string;

// create context component with react createContext
const AuthContext = createContext<AuthProps>({});


// userAuth function for validation on protected pages
export const useAuth = () => {
    return useContext(AuthContext);
};

// AuthProvider to wrap app so determine auth based routing and protected views
export const AuthProvider = ({children}: any) => {
    // Define state variables for all async functions and for auth state
    const [authState, setAuthState] = useState<{
        access_token: string | null;
        refresh_token: string | null;
        authenticated: boolean | null;
    }>({
        access_token: null,
        refresh_token: null,
        authenticated: null,
    })
    const [isRegistering, setIsRegistering] = useState<boolean>(false);
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        // Get authstate on page accesses
        const loadToken = async () => {
            const access_token = await SecureStore.getItemAsync(TOKEN_KEY);
            const refresh_token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

            if (access_token && refresh_token) {
                setAuthState({
                    access_token: access_token,
                    refresh_token: refresh_token,
                    authenticated: true,
                })
            } else {
                setAuthState({
                    access_token: null,
                    refresh_token: null,
                    authenticated: false,
                });
            }
        };
        loadToken();
    }, [])
    
    // Function for registering a user
    const register = async (username: string, password: string, first_name: string, last_name: string, bio_text: string, profile_image_uri: string) => {
        try {
            setIsRegistering(true);

            // Define form data for post method
            const formData = new FormData();

            formData.append("username", username);
            formData.append("password", password);
            formData.append("bio_text", bio_text);
            formData.append("first_name", first_name);
            formData.append("last_name", last_name);
            
            // define image object attribtutes
            formData.append("profile_image", {
                uri: profile_image_uri,
                name: `${username}_profile_image.jpg`,
                type: "image/jpeg",
            } as any);

            const response = await fetch(`${API_URL}/register/`, {
                // define method, headers, and content
                    method: 'post',
                    body: formData,
                }
            );

            if (!response.ok) {
                console.log("status", response.status);
                const text = await response.text();
                console.log("body", text);
                throw new Error("Register failed");
            }

            const data = await response.json();

            setIsRegistering(false);
            setError("");

            return data;
        } catch (error) {
            // error handling
            console.error("There was an error registering the user:", error);
            setIsRegistering(false);
            setError("There was an error registering the user");
            return {error: true, msg: "There was an error registering the user"};
        } finally {
            setIsRegistering(false);
        }
    }

    // method for handling user login
    const login = async (username: string, password: string) => {
        try {
            setIsLoggingIn(true);

            // get tokens from simple-jwt token endpoints
            const response = await fetch(`${TOKEN_API_URL}/token/`, {
                method: "post",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                })
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const tokenData = await response.json();

            // set auth state
            setAuthState({
                access_token: tokenData.access,
                refresh_token: tokenData.refresh,
                authenticated: true,
            });

            // set tokens in secure store
            await SecureStore.setItemAsync(TOKEN_KEY, tokenData.access);
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenData.refresh);

            return tokenData

        } catch (error) {
            console.error("There was an error logging the user in:", error);
            setIsLoggingIn(false);
            setError("There was an error loggin in the user");
            return {error: true, msg: "There was an error logging in the user"};
        } finally {
            setIsLoggingIn(false);
        }
    }

    const logout = async () => {
        try {
            setIsLoggingOut(true);

            // for logout just delete tokens and reset auth state
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

            setAuthState({
                access_token: null,
                refresh_token: null,
                authenticated: false,
            });

            setIsLoggingOut(false)
            setError("")
        } catch (error) {
            console.error("There was an error logging the user out:", error);
            setIsLoggingOut(false);
            setError("There was an error logging the user out")
            return {error: true, msg: "There was an error logging the user out"};
        }
    }

    const refreshToken = async () => {
        try {
            const response = await fetch(`${TOKEN_API_URL}/token/refresh/`, {
                method: "post",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    refresh: authState.refresh_token,
                })
            });

            if (!response.ok) {
                throw new Error("Failed to refresh token");
            }

            const tokenData = await response.json();

            // Update auth state with new tokens
            if (!tokenData.refresh) {
                tokenData.refresh = authState.refresh_token;
                setAuthState({
                    access_token: tokenData.access,
                    refresh_token: authState.refresh_token,
                    authenticated: true,
                });
            } else {
                setAuthState({
                    access_token: tokenData.access,
                    refresh_token: tokenData.refresh,
                    authenticated: true,
                });
            }

            // Update tokens in secure store
            await SecureStore.setItemAsync(TOKEN_KEY, tokenData.access);
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenData.refresh);

            return tokenData;
        } catch (error) {
            console.error("There was an error refreshing the token:", error);
            return {error: true, msg: "There was an error refreshing the token"};
        }
    };

    // define all the props on our auth context provider component
    const value = {
        onRegister: register,
        onLogin: login,
        onLogout: logout,
        refreshToken: refreshToken,
        authState,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}