import { useAuth } from "@/context/AuthContext";
import { Post, usePosts } from "@/hooks/usePosts";
import { formatTimeAgo, formatTimeRemaining } from "@/lib/supabase/date-helper";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
}

const PostCard = ({ post, currentUserId }: PostCardProps) => {
  const postUser = post.profiles;
  const isOwnPost = post.user_id === currentUserId;

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          {postUser?.profile_image_uri ? (
            <Image
              source={{ uri: postUser.profile_image_uri }}
              style={styles.avatar}
              cachePolicy={"none"}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceHolder]}>
              <Text style={styles.avatarText}>
                {postUser?.name?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
          )}

          <View>
            <Text style={styles.username}>
              {isOwnPost ? "You" : `@${postUser?.username}`}
            </Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
          </View>
        </View>

        {/* post content */}
        <View style={styles.timeRemainingBadge}>
          <Text style={styles.timeRemainingText}>
            {formatTimeRemaining(post.expires_at)}
          </Text>
        </View>
      </View>

      <Image
        source={{ uri: post.image_url }}
        style={styles.postImage}
        contentFit="cover"
      />

      <View style={styles.postFooter}>
        <View style={styles.postInfoHeader}>
          <Text style={styles.username}>{postUser?.name}</Text>
          {post.description && (
            <Text style={styles.postDescription}>{post.description}</Text>
          )}
        </View>

        <Text style={styles.postInfo}>
          Expires in {formatTimeRemaining(post.expires_at)}
        </Text>
      </View>
    </View>
  );
};

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { createPost, posts, isLoading, refreshPosts } = usePosts();

  //check if user has an active post
  const userActivePost = posts.find(
    (post) =>
      post.user_id === user?.id &&
      post.is_active &&
      new Date(post.expires_at) > new Date(),
  );

  const hasActivePost = !!userActivePost;

  const onRefresh = () => {
    setRefreshing(true);
    try {
      refreshPosts();
    } catch (err) {
      console.error("Error refreshing post: ", err);
    } finally {
      setRefreshing(false);
    }
  };

  const showImagePicker = () => {
    Alert.alert("Select an image", "Choose an option", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Camera",
        onPress: takePhoto,
      },
      {
        text: "Gallery",
        onPress: pickImage,
      },
    ]);
  };
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Permission needed to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPreviewImage(result.assets[0].uri);
      setShowPreview(true);
      setDescription("");
    }
  };
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Permission needed to select a profile picture.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPreviewImage(result.assets[0].uri);
      setShowPreview(true);
      setDescription("");
    }
  };

  const handlePost = async () => {
    if (!previewImage) return;

    setIsUploading(true);
    try {
      await createPost(previewImage, description);
      setPreviewImage(null);
      setDescription("");
      setShowPreview(false);
    } catch (err) {
      console.error("Error creating post: ", err);
      Alert.alert("Error", "Failed to create post. Try again later.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderPost = ({ item }: { item: Post }) => {
    return <PostCard post={item} currentUserId={user?.id} />;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "height" : "padding"}
      style={styles.keyboard}
    >
      <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
        {/* POST LIST */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              posts.length === 0 ? styles.emptyContent : styles.content
            }
            ListEmptyComponent={<Text>No posts found</Text>}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        <TouchableOpacity style={styles.fab} onPress={showImagePicker}>
          <Text style={styles.add}>{hasActivePost ? "⟳" : "+"}</Text>
        </TouchableOpacity>

        <Modal visible={showPreview} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {hasActivePost ? "Replace your post" : "Preview your post"}
              </Text>
              {previewImage && (
                <Image
                  source={{ uri: previewImage }}
                  contentFit="cover"
                  style={styles.previewImage}
                  cachePolicy={"none"}
                />
              )}
              <TextInput
                placeholder="description (optional)"
                placeholderTextColor={"#999"}
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={500}
                textAlignVertical="top"
                style={styles.descriptionInput}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowPreview(false);
                    setPreviewImage(null);
                    setDescription("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.postButton]}
                  onPress={handlePost}
                >
                  {isUploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.add}>{hasActivePost ? "⟳" : "+"}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    width: "100%",
  },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 26,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowColor: "black",
    elevation: 8,
  },
  add: {
    fontSize: 32,
    fontWeight: "400",
    color: "white",
    lineHeight: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 4,
  },
  descriptionInput: {
    width: "100%",
    minHeight: 80,
    maxHeight: 120,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#000",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#f5f5f5" },
  cancelButtonText: { fontWeight: "bold" },
  postButton: { backgroundColor: "#000" },
  postButtonText: { fontWeight: "bold", color: "white" },
  postContainer: {
    backgroundColor: "#fff",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPlaceHolder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  timeAgo: {
    fontSize: 12,
    color: "#666",
  },
  timeRemainingBadge: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeRemainingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  postImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
  },
  postFooter: {
    padding: 16,
  },
  postDescription: {
    fontSize: 15,
    color: "#000",
  },
  postInfo: {
    fontSize: 14,
    color: "#666",
  },
  postInfoHeader: {
    flexDirection: "row",
    textAlign: "center",
    gap: 6,
  },
  emptyContent: { padding: 16, paddingBottom: 100 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    padding: 12,
  },
});
