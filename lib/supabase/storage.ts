import { File } from "expo-file-system";
import { supabase } from "./client";

// Safely extract clean file extension from URI
const getFileExtension = (uri: string): string => {
  const clean = uri.split("?")[0];
  return clean.split(".").pop() || "jpg";
};

// Map file extensions to correct MIME types
const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };
  return mimeTypes[extension.toLowerCase()] || "image/jpeg";
};

export const uploadProfileImage = async (userId: string, imageUri: string) => {
  try {
    const fileExtension = getFileExtension(imageUri);
    const fileName = `${userId}/profile.${fileExtension}`;
    const file = new File(imageUri);
    const bytes = await file.bytes();

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(fileName, bytes, {
        contentType: getMimeType(fileExtension),
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL for profile image");
    }

    return `${urlData.publicUrl}?t=${Date.now()}`;
  } catch (err) {
    console.error("uploadProfileImage error:", err);
    throw err;
  }
};

export const uploadPostImage = async (userId: string, imageUri: string) => {
  try {
    const fileExtension = getFileExtension(imageUri);
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}.${fileExtension}`;
    const file = new File(imageUri);
    const bytes = await file.bytes();

    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(fileName, bytes, {
        contentType: getMimeType(fileExtension),
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("posts")
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL for post image");
    }

    return urlData.publicUrl;
  } catch (err) {
    console.error("uploadPostImage error:", err);
    throw err;
  }
};
