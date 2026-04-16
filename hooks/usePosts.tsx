import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { uploadPostImage } from "@/lib/supabase/storage";
import { useEffect, useState } from "react";

export interface PostUser {
  id: string;
  name: string;
  username: string;
  profile_image_uri?: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  description: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
  profiles?: PostUser;
}

export const usePosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(`*, profiles(id, name, username, profile_image_uri)`)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error loading posts:", postsError);
        throw postsError;
      }

      setPosts(
        (postsData ?? []).map((post) => ({
          ...post,
          profiles: post.profiles || null,
        })),
      );
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (imageUri: string, description?: string) => {
    if (!user) throw new Error("User not authenticated");

    try {
      // 1. Deactivate previous active posts — only on create, never on load
      const { error: deactivateError } = await supabase
        .from("posts")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (deactivateError) {
        console.error("Error deactivating old posts:", deactivateError);
        throw deactivateError;
      }

      // 2. Upload image
      const imageUrl = await uploadPostImage(user.id, imageUri);

      // 3. Insert new post
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString();

      const { error: insertError } = await supabase.from("posts").insert({
        user_id: user.id,
        image_url: imageUrl,
        description: description || null,
        expires_at: expiresAt,
        is_active: true,
      });

      if (insertError) {
        console.error("Error creating post:", insertError);
        throw insertError;
      }

      // 4. Refresh feed
      await loadPosts();
    } catch (err) {
      console.error("Error creating post:", err);
      throw err;
    }
  };

  const refreshPosts = async () => {
    await loadPosts();
  };

  return {
    createPost,
    posts,
    isLoading,
    refreshPosts,
  };
};
