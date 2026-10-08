export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'hostel_issues',
  appName: import.meta.env.VITE_APP_NAME || 'Shantigram Gurukul Cleanliness',
  gurukulSiteUrl: import.meta.env.VITE_GURUKUL_SITE_URL || 'https://shantigramgurukul.org',
};
