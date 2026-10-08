import { env } from './env.js';

export const cloudinaryConfig = {
  cloudName: env.cloudinaryCloudName,
  uploadPreset: env.cloudinaryUploadPreset,
  uploadUrl: `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
};
