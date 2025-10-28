# Cloudinary Integration Setup Guide

This guide will help you set up Cloudinary integration for Sentinel.AI video uploads.

## 📋 Prerequisites

- A Cloudinary account (free tier available)
- Basic understanding of video uploads

## 🚀 Step-by-Step Setup

### Step 1: Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address
4. Log in to your Cloudinary Console

### Step 2: Get Your Credentials

1. From your Cloudinary Dashboard, you'll see:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (keep this private!)

2. Copy your **Cloud Name** - you'll need this!

### Step 3: Create an Upload Preset

An upload preset allows unsigned uploads from your web app.

1. In Cloudinary Console, go to **Settings** (⚙️ icon)
2. Click on **Upload** tab
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure:
   - **Signing Mode**: Select **Unsigned**
   - **Preset name**: Enter a name (e.g., `sentinel_videos`)
   - **Folder**: Enter `sentinel-videos` (optional but recommended)
   - **Resource type**: Select **Video**
   - **Access mode**: Select **Public**
6. Click **Save**
7. Copy the **preset name**

### Step 4: Configure Your Application

1. Open `config.js` in your project
2. Update the following values:

```javascript
const CLOUDINARY_CONFIG = {
    cloudName: 'YOUR_CLOUD_NAME',        // Replace with your cloud name from Step 2
    uploadPreset: 'YOUR_UPLOAD_PRESET',  // Replace with preset name from Step 3
    apiKey: 'YOUR_API_KEY',              // Replace with your API key from Step 2
    folder: 'sentinel-videos'            // Folder to organize videos
};
```

**Example:**
```javascript
const CLOUDINARY_CONFIG = {
    cloudName: 'dxyz123abc',
    uploadPreset: 'sentinel_videos',
    apiKey: '123456789012345',
    folder: 'sentinel-videos'
};
```

### Step 5: Test the Integration

1. Open `index.html` in your browser
2. Upload a test video
3. Select an environment
4. Click "Upload Video"
5. Wait for the upload to complete
6. Click "View Uploads" to see your video

### Step 6: Verify in Cloudinary

1. Go to your Cloudinary Console
2. Click **Media Library** in the left sidebar
3. Navigate to the `sentinel-videos` folder
4. You should see your uploaded video with:
   - Tags: `sentinel`, `environment-name`
   - Context: `environment`, `uploadDate`

## 🎯 How It Works

### Upload Flow

1. **User selects video** → File is validated (must be video format)
2. **User selects environment** → Environment metadata is attached
3. **Upload to Cloudinary** → Video is uploaded with:
   - Upload preset (for authentication)
   - Folder path (`sentinel-videos`)
   - Tags (for categorization)
   - Context (for metadata)
4. **Save reference** → Cloudinary response is saved locally
5. **Display in uploads** → Videos are fetched and displayed

### Metadata Storage

The application stores video metadata in two places:

1. **Cloudinary** (primary source):
   - Video file and thumbnails
   - Duration, format, size
   - Tags: `sentinel`, `{environment}`
   - Context: `environment`, `uploadDate`

2. **Local Storage** (reference only):
   - Video ID (public_id)
   - Video URL
   - Filename
   - Environment
   - Upload date

## 📁 File Structure

```
sentinel.ai/
├── config.js           # Cloudinary configuration
├── index.html          # Upload page
├── uploads.html        # Uploads list page
├── script.js           # Upload logic
├── uploads.js          # List and display logic
├── styles.css          # Main styles
└── uploads.css         # Uploads page styles
```

## 🔒 Security Best Practices

### For Development
- Use **unsigned upload presets** (no authentication required)
- Limit upload size and file types in Cloudinary settings

### For Production
1. **Use a backend server** to:
   - Hide API credentials
   - Generate signed upload URLs
   - Validate uploads server-side
   - Store metadata in a database

2. **Example backend endpoint**:
```javascript
// Node.js/Express example
app.post('/api/get-upload-signature', (req, res) => {
    const signature = cloudinary.utils.api_sign_request({
        timestamp: Math.round((new Date).getTime()/1000),
        folder: 'sentinel-videos'
    }, process.env.CLOUDINARY_API_SECRET);
    
    res.json({ signature, timestamp, api_key: process.env.CLOUDINARY_API_KEY });
});
```

## 🎨 Customization

### Upload Preset Settings

In Cloudinary Console → Settings → Upload → Your Preset:

- **Format**: Convert to specific format (e.g., MP4)
- **Quality**: Adjust video quality (e.g., auto:good)
- **Transformation**: Apply automatic optimizations
- **Eager transformations**: Generate thumbnails automatically
- **Access control**: Set expiration times
- **Notifications**: Get webhooks on upload

### Video Transformations

Cloudinary allows real-time video transformations:

```javascript
// Generate different thumbnail sizes
const thumbnailUrl = video.url
    .replace('/upload/', '/upload/w_800,h_600,c_fill,q_auto/')
    .replace(/\.[^.]+$/, '.jpg');

// Apply video effects
const transformedUrl = video.url
    .replace('/upload/', '/upload/e_blur:1000,q_auto:low/');
```

## 🐛 Troubleshooting

### Upload Fails with "Invalid Signature"
- **Solution**: Ensure your upload preset is set to **Unsigned**

### Upload Fails with "Invalid cloud_name"
- **Solution**: Check that `cloudName` in `config.js` matches your Cloudinary dashboard

### Videos Don't Appear in Uploads Page
- **Solution**: 
  1. Check browser console for errors
  2. Verify videos uploaded successfully in Cloudinary Media Library
  3. Check local storage (F12 → Application → Local Storage)

### Thumbnails Not Generating
- **Solution**: Cloudinary generates thumbnails automatically. If they don't appear:
  1. Wait a few seconds (thumbnails take time to process)
  2. Check the transformation URL in browser console
  3. Ensure video uploaded successfully

### CORS Errors
- **Solution**: Enable CORS in Cloudinary:
  1. Settings → Security → Allowed fetch domains
  2. Add your domain (e.g., `localhost` for development)

## 📊 Cloudinary Limits

### Free Tier
- Storage: 25 GB
- Bandwidth: 25 GB/month
- Transformations: 25,000/month
- Videos: Up to 500 MB each

### Paid Plans
- Higher limits available
- Advanced features (AI tagging, auto-captioning)
- Better support

## 🔗 Useful Links

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Video Upload API](https://cloudinary.com/documentation/video_upload_api_reference)
- [Upload Presets](https://cloudinary.com/documentation/upload_presets)
- [Video Transformations](https://cloudinary.com/documentation/video_manipulation_and_delivery)

## 💡 Advanced Features

### Auto-Tagging with AI
Enable automatic video tagging in Cloudinary:
- Settings → Add-ons → Enable AI-based auto-tagging

### Video Transcoding
Convert videos to optimal formats automatically:
- Enable eager transformations in upload preset
- Cloudinary will generate multiple formats (MP4, WebM, etc.)

### Adaptive Bitrate Streaming
Deliver videos at different qualities based on connection:
```javascript
<video controls>
    <source src="${video.url.replace('/upload/', '/upload/q_auto,f_auto/')}" type="video/mp4">
</video>
```

## 🎓 Next Steps

1. ✅ Set up Cloudinary account
2. ✅ Configure upload preset
3. ✅ Update config.js
4. ✅ Test video upload
5. ⬜ Add backend for production
6. ⬜ Implement user authentication
7. ⬜ Add video analytics
8. ⬜ Enable AI features

---

**Need Help?** Check the [Cloudinary Community Forum](https://community.cloudinary.com/) or reach out to their support team.

