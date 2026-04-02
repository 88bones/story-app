import { File } from "expo-file-system";
import { supabase } from "./client";

export const uploadProfileImage = async (userId: string, imageUri: string) => {
  try {
    const fileExtension = imageUri.split(".").pop() || "jpg";
    const fileName = `${userId}/profile.${fileExtension}`;
    const file = new File(imageUri);
    const bytes = await file.bytes();

    const { error: uploadError } = await supabase.storage
      .from("profiles")
      .upload(fileName, bytes, {
        contentType: `image/${fileExtension}`,
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from("profiles")
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      throw new Error("Failed to get public URL for profile image");
    }

    return urlData.publicUrl;
  } catch (err) {
    console.error("uploadProfileImage error:", err);
    throw err;
  }
};
