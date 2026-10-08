import imageCompression from 'browser-image-compression';
import { cloudinaryConfig } from '../config/cloudinary.js';

/**
 * Compresses an image and uploads it to Cloudinary using an unsigned upload preset.
 * 
 * @param {File|Blob} file 
 * @returns {Promise<string>} The uploaded image secure_url
 */
export async function uploadToCloudinary(file) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
    throw new Error('Cloudinary is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your environment.');
  }

  // 1. Compress image to max 1200px and ~200KB
  const compressionOptions = {
    maxSizeMB: 0.2, // ~200KB
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: 'image/jpeg',
  };

  let fileToUpload = file;
  try {
    fileToUpload = await imageCompression(file, compressionOptions);
  } catch (compErr) {
    console.warn('Image compression failed or skipped, uploading original file:', compErr);
  }

  // 2. Prepare FormData
  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('folder', 'shantigram');

  // 3. POST to Cloudinary
  const response = await fetch(cloudinaryConfig.uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Cloudinary upload failed with status ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error('Cloudinary response did not contain a secure_url.');
  }

  return data.secure_url;
}
