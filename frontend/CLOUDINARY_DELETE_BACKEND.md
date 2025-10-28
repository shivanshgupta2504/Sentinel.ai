# Cloudinary Delete - Backend Implementation Guide

## ⚠️ Important Security Notice

**The current implementation removes videos from the UI and local storage, but does NOT delete from Cloudinary.**

Cloudinary deletion requires authentication using your API Secret, which **MUST NEVER** be exposed in client-side code. You need a backend server to securely handle deletions.

## 🎯 Current Behavior

When you click delete:
1. ✅ Video is removed from the UI immediately
2. ✅ Video reference is deleted from local storage
3. ⚠️ Video still exists in Cloudinary (requires backend)

## 🔧 Production Implementation

### Option 1: Node.js/Express Backend

1. **Install Cloudinary SDK**
```bash
npm install cloudinary
```

2. **Create Backend Endpoint**
```javascript
// server.js
const express = require('express');
const cloudinary = require('cloudinary').v2;
const app = express();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(express.json());

// Delete video endpoint
app.delete('/api/videos/:publicId', async (req, res) => {
    try {
        const publicId = req.params.publicId;
        
        // Verify user is authenticated (add your auth logic here)
        // if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        
        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'video'
        });
        
        if (result.result === 'ok') {
            res.json({ success: true, message: 'Video deleted' });
        } else {
            res.status(400).json({ error: 'Failed to delete video' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

3. **Update Frontend Code**

Replace the `deleteFromCloudinary` function in `uploads.js`:

```javascript
async function deleteFromCloudinary(videoId) {
    const response = await fetch(`/api/videos/${encodeURIComponent(videoId)}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            // Add authentication header if needed
            // 'Authorization': `Bearer ${yourAuthToken}`
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete from Cloudinary');
    }
    
    return await response.json();
}
```

### Option 2: Python/Flask Backend

1. **Install Dependencies**
```bash
pip install cloudinary flask flask-cors
```

2. **Create Backend Endpoint**
```python
# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import cloudinary
import cloudinary.uploader
import os

app = Flask(__name__)
CORS(app)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

@app.route('/api/videos/<path:public_id>', methods=['DELETE'])
def delete_video(public_id):
    try:
        # Add authentication check here
        # if not current_user.is_authenticated:
        #     return jsonify({'error': 'Unauthorized'}), 401
        
        # Delete from Cloudinary
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type='video'
        )
        
        if result.get('result') == 'ok':
            return jsonify({'success': True, 'message': 'Video deleted'})
        else:
            return jsonify({'error': 'Failed to delete video'}), 400
            
    except Exception as e:
        print(f'Delete error: {e}')
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(port=3000, debug=True)
```

### Option 3: Serverless (Vercel/Netlify Functions)

**Vercel Function** (`api/delete-video.js`):
```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = async (req, res) => {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { publicId } = req.query;
        
        if (!publicId) {
            return res.status(400).json({ error: 'Public ID required' });
        }
        
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'video'
        });
        
        if (result.result === 'ok') {
            res.json({ success: true, message: 'Video deleted' });
        } else {
            res.status(400).json({ error: 'Failed to delete video' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
```

**Frontend Update for Serverless**:
```javascript
async function deleteFromCloudinary(videoId) {
    const response = await fetch(`/api/delete-video?publicId=${encodeURIComponent(videoId)}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        throw new Error('Failed to delete from Cloudinary');
    }
    
    return await response.json();
}
```

## 🔐 Security Best Practices

### 1. Environment Variables
Never hardcode credentials. Use environment variables:

```bash
# .env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Authentication
Always verify user identity before allowing deletion:

```javascript
// Example middleware
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

app.delete('/api/videos/:publicId', requireAuth, async (req, res) => {
    // Delete logic here
});
```

### 3. Authorization
Verify user owns the video before deletion:

```javascript
app.delete('/api/videos/:publicId', requireAuth, async (req, res) => {
    const publicId = req.params.publicId;
    const userId = req.user.id;
    
    // Check database if user owns this video
    const video = await db.videos.findOne({ publicId, userId });
    
    if (!video) {
        return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Proceed with deletion
    // ...
});
```

### 4. Rate Limiting
Prevent abuse with rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const deleteLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 delete requests per windowMs
    message: 'Too many delete requests, please try again later'
});

app.delete('/api/videos/:publicId', deleteLimit, requireAuth, async (req, res) => {
    // Delete logic here
});
```

## 📊 Database Integration

For production, store video metadata in a database:

```javascript
// When uploading
app.post('/api/videos/upload-complete', requireAuth, async (req, res) => {
    const { publicId, url, filename, environment } = req.body;
    const userId = req.user.id;
    
    await db.videos.create({
        userId,
        publicId,
        url,
        filename,
        environment,
        uploadedAt: new Date()
    });
    
    res.json({ success: true });
});

// When deleting
app.delete('/api/videos/:publicId', requireAuth, async (req, res) => {
    const publicId = req.params.publicId;
    const userId = req.user.id;
    
    // Delete from database
    const deleted = await db.videos.deleteOne({ publicId, userId });
    
    if (!deleted) {
        return res.status(404).json({ error: 'Video not found' });
    }
    
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    
    res.json({ success: true });
});
```

## 🧪 Testing

Test your delete endpoint:

```bash
# Using curl
curl -X DELETE \
  http://localhost:3000/api/videos/your-public-id \
  -H 'Authorization: Bearer your-token'

# Using httpie
http DELETE localhost:3000/api/videos/your-public-id \
  Authorization:"Bearer your-token"
```

## 🚀 Deployment Checklist

- [ ] Backend deployed with environment variables set
- [ ] CORS configured correctly
- [ ] Authentication implemented
- [ ] Authorization checks in place
- [ ] Rate limiting enabled
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Frontend updated to use backend endpoint
- [ ] SSL/HTTPS enabled
- [ ] Database backups configured

## 📝 Manual Deletion (Temporary Solution)

Until you implement a backend, you can manually delete videos from Cloudinary:

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Click **Media Library**
3. Navigate to `sentinel-videos` folder
4. Select videos to delete
5. Click the trash icon
6. Confirm deletion

## 🔗 Additional Resources

- [Cloudinary Delete API Documentation](https://cloudinary.com/documentation/image_upload_api_reference#destroy_method)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Cloudinary Python SDK](https://cloudinary.com/documentation/django_integration)
- [Secure REST API Design](https://restfulapi.net/security-essentials/)

---

**Remember**: Never expose your API Secret in client-side code! Always use a backend server for operations that require authentication.

