// File: postModal.tsx
// Author: Nithin Senthilvel (nsent01@bu.edu), 06/15/2026
// Description: Modal to display post along with its comments

import { FlatList, Image, View, Text, Pressable, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { styles } from '../assets/styles/my_styles'
import Ionicons from '@expo/vector-icons/Ionicons';
import { API_URL, useAuth } from "../context/AuthContext"
import { Redirect, useLocalSearchParams, router } from 'expo-router'
import { ScreenState } from '@/components/ScreenState';

// commentdisplay typescript type to format incoming api data
type CommentDisplay = {
  id: number;
  user_id: number;
  username: string;
  profile_image: string | null;
  text?: string;
  comment?: string;
  content?: string;
};

// rankingdisplay typescript type to format incoming api data
type RankingDisplay = {
  id: number;
  score: string;
  notes: string;
  image: string | null;

  drink_name: string;
  drink_category: string;

  cafe_name: string;

  liked_by_user: boolean;
  num_likes?: number;
  num_comments?: number;
  comments: CommentDisplay[];

  username: string;
  profile_image: string | null;
};

// functions for any given post to get their like and comment counts, and standardize to 0 if its missing
const getLikeCount = (post: RankingDisplay | any) => Number(post?.num_likes ?? 0);
const getCommentCount = (post: RankingDisplay | any) => Number(post?.num_comments ?? post?.comments?.length ?? 0);

// default export function
const postModal = () => {

  // postid path parameter
  const params = useLocalSearchParams<{ post?: string }>();

  // instantiate authstate variable and functions
  const { authState, authFetch } = useAuth();

  // instantiate state variables
  const [post, setPost] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // comments list used by flatlist data prop
  const comments = post?.comments ?? [];

  // on load of page and if the user is authorized and params contains the post id, fetch the post data and the current user data
    useEffect(() => {
        const getData = async () => {
            await handleGetPost();
            await handleGetCurrentUser();
        }
        if (authState?.access_token && params.post) {
            getData()
        }
    }, [authState?.access_token, params.post])

    // if user is not authenticated route to login page
    if (!authState?.authenticated) {
        return <Redirect href="/login" />;
    }
  
    // api function to get the post details 
  const handleGetPost = async () => {
          try {
              setLoading(true);
              const response = await authFetch!(`${API_URL}/get_ranking/?id=${encodeURIComponent(String(params.post))}`, {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json",
                  }
              })
              
              // if api response errors, log, set error for error state, and return
              if (!response.ok) {
                  const responseText = await response.text();
                  console.log(responseText);
                  setError("There was an error fetching the post");
                  return;
              }
              
              // set state variables and clear errors
              const data = await response.json()
              setPost(data)
              setError("")
              
          } catch (error) {
            // error handling
            console.error("There was an error fetching the post:", error);
            setError("There was an error fetching the post");
          } finally {
            // close loading state
            setLoading(false);
          }
      }
    
    // api function to get the current users details to verify if they can delete a comment, and to display likes accurately
  const handleGetCurrentUser = async () => {
      try {
          const response = await authFetch!(`${API_URL}/get_profile/`, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
              }
          })

          // if api response errors log, set error for error state and return
          if (!response.ok) {
              const responseText = await response.text();
              console.log(responseText);
              setError("There was an error fetching the current user");
              return;
          }

          // set state variables
          const data = await response.json()
          setCurrentUser(data)
      } catch (error) {
        // error handling
        console.error("There was an error fetching the current user:", error);
        setError("There was an error fetching the current user");
      }
  }

  // function for POSTing a comment to the database, contains only API call and loading state is offloaded to handleCreateComment
  const createComment = async (text: string) => {
      return await authFetch!(`${API_URL}/create_comment/`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              post: post?.id ?? params.post,
              text: text,
          })
      })
  }

  // offload loading state and error handling to larger function
  const handleCreateComment = async () => {

      // if the user didnt comment anything, just return without writing anything to the database
      const trimmedComment = commentText.trim();
      if (!trimmedComment || submittingComment) {
          return;
      }

      // set loading state and call api helper function
      try {
          setSubmittingComment(true);
          let response = await createComment(trimmedComment);

          // if api response fails, log and return
          if (!response.ok) {
              console.log(await response.text());
              return;
          }

          // otherwise set post state variable to api data, part the response text, and append and recompute data fields for comments and num_comments
          const responseText = await response.text();
          if (responseText) {
              const newComment = JSON.parse(responseText);
              setPost((currentPost: any) => ({
                  ...currentPost,
                  comments: [...(currentPost?.comments ?? []), newComment],
                  num_comments: getCommentCount(currentPost) + 1,
              }));
          } else {
              // refetch the post
              await handleGetPost();
          }

          // reset comment state variable so user can comment again and reset error
          setCommentText("");
          setError("");
      } catch (error) {
        // error handling
          console.error("There was an error creating this comment:", error);
          setError("There was an error creating this comment");
      } finally {
        // close loading state
          setSubmittingComment(false);
      }
  }

  // delete comment api call helper function
  const deleteComment = async (commentId: number) => {
      return await authFetch!(`${API_URL}/delete_comment/?id=${encodeURIComponent(String(commentId))}`, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json",
          }
      })
  }

  // main delete comment function with loading states, error handling, etc.
  const handleDeleteComment = async (commentId: number) => {
      try {
        // call api call helper function
          let response = await deleteComment(commentId);

        // if response fails, log and return
          if (!response.ok) {
              console.log(await response.text());
              return;
          }

          // otherwise set post data and filter comments and recompute the number of comments
          setPost((currentPost: any) => ({
              ...currentPost,
              comments: (currentPost?.comments ?? []).filter((comment: CommentDisplay) => comment.id !== commentId),
              num_comments: Math.max(getCommentCount(currentPost) - 1, 0),
          }));
          setError("");
      } catch (error) {
        //error handling
          console.error("There was an error deleting this comment:", error);
          setError("There was an error deleting this comment");
      }
  }

  // function to verify if a user owns a comment so that they can delete it
  const ownsComment = (comment: CommentDisplay) => {
      const currentUserId = currentUser?.user?.id ?? currentUser?.id;
      const currentUsername = currentUser?.user?.username ?? currentUser?.username;

      return comment.user_id === currentUserId || comment.username === currentUsername;
  }

  // standardize comment text displays
  const getCommentText = (comment: CommentDisplay) => {
      return comment.text ?? comment.comment ?? comment.content ?? "";
  }

  // react native component that is returned
  return (
    <View style={styles.container}>
      {/** header with back navigation */}
        <View style={{  width: '100%', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', backgroundColor: "white" }}>
        <Pressable style={{ marginLeft: 20, marginBottom: 10, justifyContent: 'center' }} onPress={() => router.back()}>
            <Ionicons name='chevron-back' size={24} color="black" />
        </Pressable>
        </View>

      {/** flatlist display of comments */}
      <FlatList
        data={comments}
        keyExtractor={(item) => String(item.id)}
        style={{ width: "100%", backgroundColor: "white", padding: 20 }}
        contentContainerStyle={{ paddingVertical: 10 }}
        // header is the post card itself
        ListHeaderComponent={
          post ? (
            // if post has already been fetched display it
            <View style={[styles.postCard, { marginBottom: 10 }]}>
              <View style={styles.postHeader}>
                <View style={styles.postAuthorRow}>
                  {post.profile_image && (
                    <Image
                      source={{ uri: post.profile_image }}
                      style={[styles.profileImageSmaller, { marginBottom: 0, marginRight: 10 }]}
                    />
                  )}
                  <View style={{ flex: 1, backgroundColor: "white" }}>
                    <Text style={styles.polishedRowTitle}>{post.drink_name}</Text>
                    <Text style={styles.polishedRowMeta}>@{post.username} at {post.cafe_name}</Text>
                  </View>
                </View>

                <View style={styles.polishedScoreBadge}>
                  <Text style={styles.polishedScoreText}>{post.score}</Text>
                </View>
              </View>

              {post.image && (
                <Image
                  source={{ uri: post.image }}
                  style={styles.postImage}
                />
              )}

              {post.notes ? <Text style={styles.postNotes}>{post.notes}</Text> : null}

              <View style={styles.postActions}>
                <View style={styles.feedActionButton}>
                  <Ionicons name={post.liked_by_user ? "heart" : "heart-outline"} size={24} color={post.liked_by_user ? "red" : "black"} />
                  <Text style={styles.postActionCount}>{getLikeCount(post)}</Text>
                </View>
                <View style={styles.feedActionButton}>
                  <Ionicons name="chatbubble-outline" size={24} color="black" />
                  <Text style={styles.postActionCount}>{getCommentCount(post)}</Text>
                </View>
              </View>

              <View style={{ width: "100%", height: 1, backgroundColor: "lightgray", marginTop: 10 }} />

              <Text style={{ color: "black", fontSize: 22, fontWeight: "bold", marginTop: 10, backgroundColor: "white" }}>
                Comments
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "white", marginTop: 10 }}>
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Add a comment"
                  placeholderTextColor="gray"
                  style={{
                    flex: 1,
                    height: 40,
                    borderWidth: 1,
                    borderColor: "lightgray",
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    color: "black",
                    backgroundColor: "white",
                  }}
                />
                <Pressable
                  onPress={handleCreateComment}
                  disabled={submittingComment || !commentText.trim()}
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                  }}
                >
                  <Ionicons name="send" size={22} color={commentText.trim() && !submittingComment ? "#2D5A3D" : "gray"} />
                </Pressable>
              </View>
            </View>
          ) : (
            // loading state if post has not yet been fetched
            <ScreenState
              loading={loading}
              error={error}
              empty="Post unavailable."
              onRetry={handleGetPost}
              compact
            />
          )
        }
        // if no comments, display generic no comments view, and if comments are loading handle loading sate view
        ListEmptyComponent={
          post ? (
            <ScreenState
              error={error}
              empty="No comments yet."
              onRetry={handleGetPost}
              compact
            />
          ) : null
        }
        // component that is rendered for each comment to display beneath the post
        renderItem={({ item }: { item: CommentDisplay }) => (
          <View style={{ flexDirection: "row", width: "100%", backgroundColor: "white", paddingVertical: 10, justifyContent: "center", alignItems: "center" }}>
            {item.profile_image ? (
              <Image source={{ uri: item.profile_image }} style={styles.profileImageSmaller} />
            ) : (
              <View style={styles.profileImageSmall} />
            )}

            <View style={{ flex: 1, flexShrink: 1, marginLeft: 8, backgroundColor: "white" }}>
              <Text style={{ color: "black", fontWeight: "bold", backgroundColor: "white" }}>
                @{item.username}
              </Text>
              <Text style={{ color: "black", backgroundColor: "white", flexShrink: 1, marginTop: 2 }}>
                {getCommentText(item)}
              </Text>
            </View>
            {ownsComment(item) ? (
              <Pressable onPress={() => handleDeleteComment(item.id)} hitSlop={10}>
                <Ionicons name="trash-outline" size={22} color="black" />
              </Pressable>
            ) : null}
          </View>
        )}
      />
    </View>
  )
}

export default postModal
