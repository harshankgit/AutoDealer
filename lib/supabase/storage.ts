import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads an image file to Supabase storage and returns the public URL
 * @param file The image file to upload
 * @param folder The folder in storage to upload to (optional)
 * @returns The public URL of the uploaded image
 */
export const uploadImageToStorage = async (file: File, folder: string = 'slider'): Promise<string | null> => {
  try {
    // Generate a unique filename
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${file.name}`;

    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from('images') // You'll need to create an 'images' bucket in your Supabase project
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file to storage:', error);
      throw error;
    }

    // Get the public URL for the uploaded file
    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return publicData.publicUrl || null;
  } catch (error) {
    console.error('Error in uploadImageToStorage:', error);
    return null;
  }
};

/**
 * Deletes an image from Supabase storage
 * @param filePath The path of the file to delete
 */
export const deleteImageFromStorage = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file from storage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteImageFromStorage:', error);
    return false;
  }
};

/**
 * Uploads an image from a URL to Supabase storage and returns the public URL
 * @param imageUrl The URL of the image to upload
 * @param folder The folder in storage to upload to (optional)
 * @returns The public URL of the uploaded image
 */
export const uploadImageUrlToStorage = async (imageUrl: string, folder: string = 'slider'): Promise<string | null> => {
  try {
    // Fetch the image from the URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBlob = await response.blob();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;

    // Upload the blob to Supabase storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, imageBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image URL to storage:', error);
      throw error;
    }

    // Get the public URL for the uploaded file
    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return publicData.publicUrl || null;
  } catch (error) {
    console.error('Error in uploadImageUrlToStorage:', error);
    return null;
  }
};