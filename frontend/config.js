/* =============================================================================
   CLOUDINARY CONFIGURATION
   ============================================================================= */

const CLOUDINARY_CONFIG = {
    // Replace these with your Cloudinary credentials
    cloudName: 'dtrktjcxf',        // From Cloudinary Dashboard
    uploadPreset: 'security_footage',  // Create an unsigned upload preset
    apiKey: '269242833568928',              // From Cloudinary Dashboard
    folder: 'sentinel-videos'            // Folder to organize videos
};

// For demo purposes, you can use this test cloud name
// Replace with your own for production
// To set up:
// 1. Go to https://cloudinary.com/console
// 2. Sign up/Login
// 3. Get your cloud_name from the dashboard
// 4. Go to Settings > Upload > Add upload preset
// 5. Create an "unsigned" preset and copy the name

const STORAGE_KEYS = {
    videos: 'sentinel_uploaded_videos'
};

