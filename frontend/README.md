# Sentinel.AI - Video Upload & Management System

A modern, full-featured web application for uploading, managing, and viewing videos with Cloudinary integration.

## 🌟 Features

### ✨ Core Features
- **Drag & Drop Upload** - Intuitive video upload interface
- **Environment Selection** - Categorize videos by environment type
- **Real-time Progress** - Live upload progress tracking
- **Cloudinary Integration** - Professional cloud storage for videos
- **Video Gallery** - Beautiful grid layout to view all uploads
- **Search & Filter** - Find videos quickly by name or environment
- **Video Player** - Built-in modal video player with details
- **Responsive Design** - Works seamlessly on all devices

### 📹 Video Management
- Upload videos to Cloudinary
- Automatic thumbnail generation
- Metadata storage (environment, date, size, duration)
- Video playback with controls
- Download and share capabilities

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Cloudinary account (free tier available)

### Setup Instructions

1. **Clone or Download** the project files

2. **Set up Cloudinary**
   - Follow the detailed guide in `CLOUDINARY_SETUP.md`
   - Get your Cloud Name and create an Upload Preset
   - Update `config.js` with your credentials

3. **Configure the Application**
   ```javascript
   // Edit config.js
   const CLOUDINARY_CONFIG = {
       cloudName: 'YOUR_CLOUD_NAME',
       uploadPreset: 'YOUR_UPLOAD_PRESET',
       apiKey: 'YOUR_API_KEY',
       folder: 'sentinel-videos'
   };
   ```

4. **Open the Application**
   - Simply open `index.html` in your browser
   - No build process required!

## 📁 Project Structure

```
sentinel.ai/
├── index.html              # Main upload page
├── uploads.html            # Uploads gallery page
├── script.js               # Upload functionality
├── uploads.js              # Gallery functionality
├── config.js               # Cloudinary configuration
├── styles.css              # Main stylesheet
├── uploads.css             # Gallery stylesheet
├── README.md               # This file
└── CLOUDINARY_SETUP.md     # Detailed setup guide
```

## 🎯 How It Works

### Upload Flow

1. **Select Video**
   - Drag & drop or click to browse
   - Supports: MP4, MOV, AVI, MKV

2. **Choose Environment**
   - Jewellery Shop
   - Billing Counter
   - Petrol Pump
   - Vending Machine

3. **Upload to Cloudinary**
   - Real-time progress tracking
   - Automatic thumbnail generation
   - Metadata tagging

4. **View in Gallery**
   - Browse all uploads
   - Search and filter
   - Play videos in modal

### Data Storage

- **Cloudinary**: Stores actual video files, thumbnails, and metadata
- **Local Storage**: Stores references to uploaded videos
- **Metadata**: Environment type, upload date, file size, duration

## 💻 Technology Stack

- **Frontend**: Pure HTML, CSS, JavaScript (No frameworks!)
- **Storage**: Cloudinary (Video CDN)
- **Styling**: Custom CSS with modern animations
- **Icons**: SVG (embedded)

## 🎨 Design Features

### Color Scheme
- Primary: Purple (#8B5CF6) to Cyan (#06B6D4) gradient
- Background: Dark theme (#0a0a0a)
- Accents: White with various opacity levels

### Animations
- Smooth transitions throughout
- Loading spinners and progress indicators
- Card hover effects
- Modal animations

### UI Components
- Collapsible sidebar navigation
- Drag & drop upload zone
- Environment selection tiles
- Video cards with thumbnails
- Modal video player
- Search and filter controls

## 🔧 Configuration Options

### Video Upload Settings

In `script.js`, you can customize:
- Accepted file types
- Upload folder structure
- Metadata tagging format

### Display Settings

In `uploads.js`, you can customize:
- Grid layout (columns per row)
- Card animation delays
- Thumbnail dimensions
- Date/time formatting

### Cloudinary Settings

In your Cloudinary dashboard:
- Upload presets
- Video transformations
- Quality settings
- Storage limits

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full features, wide grid layout
- **Tablet**: Adapted layout, touch-friendly
- **Mobile**: Single column, optimized for small screens

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔒 Security Considerations

### Development Mode
- Uses unsigned upload presets (no authentication)
- Local storage for video references
- Client-side only

### Production Recommendations
1. **Backend Server**: Implement server-side upload handling
2. **Authentication**: Add user authentication and authorization
3. **Database**: Store metadata in a proper database
4. **API Security**: Use signed URLs and API secrets
5. **Rate Limiting**: Prevent abuse with rate limits

## 🐛 Troubleshooting

### Common Issues

**Problem**: Upload fails
- **Solution**: Check Cloudinary credentials in `config.js`
- **Solution**: Ensure upload preset is "unsigned"
- **Solution**: Check browser console for errors

**Problem**: Videos don't appear in gallery
- **Solution**: Upload at least one video first
- **Solution**: Check browser's local storage
- **Solution**: Verify Cloudinary Media Library

**Problem**: Thumbnails not loading
- **Solution**: Wait a few seconds for Cloudinary processing
- **Solution**: Check network tab for 404 errors
- **Solution**: Verify video uploaded successfully

**Problem**: CORS errors
- **Solution**: Add your domain to Cloudinary allowed origins
- **Solution**: Use HTTPS if required by Cloudinary settings

## 📈 Performance Optimization

### Current Optimizations
- Lazy loading of thumbnails
- Efficient CSS animations (GPU-accelerated)
- Minimal JavaScript dependencies
- Cloudinary's automatic optimization

### Future Improvements
- Implement pagination for large video lists
- Add virtual scrolling for performance
- Use Web Workers for processing
- Implement caching strategies

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📚 Additional Documentation

- `CLOUDINARY_SETUP.md` - Detailed Cloudinary integration guide
- Inline code comments - Detailed explanations in all files
- Cloudinary Docs - [cloudinary.com/documentation](https://cloudinary.com/documentation)

## 🔄 Version History

### Version 1.0.0 (Current)
- Initial release
- Cloudinary integration
- Upload functionality
- Gallery view
- Search and filter
- Modal video player
- Responsive design

## 🚧 Roadmap

### Planned Features
- [ ] User authentication
- [ ] Video editing capabilities
- [ ] Batch upload support
- [ ] Advanced analytics
- [ ] AI-powered tagging
- [ ] Video transcription
- [ ] Sharing functionality
- [ ] Comments and notes
- [ ] Export functionality
- [ ] Admin dashboard

## 🤝 Contributing

This is a demonstration project. Feel free to:
- Fork the repository
- Add new features
- Improve the code
- Fix bugs
- Enhance documentation

## 📄 License

This project is for educational and demonstration purposes.

## 💡 Tips for Best Results

1. **Video Format**: MP4 works best across all browsers
2. **File Size**: Keep videos under 100MB for faster uploads
3. **Naming**: Use descriptive filenames for easy searching
4. **Organization**: Utilize environment tags consistently
5. **Cleanup**: Regularly review and delete test uploads in Cloudinary

## 🎓 Learning Resources

- **Cloudinary**: Learn about video management and CDN
- **Web APIs**: FormData, XMLHttpRequest, Local Storage
- **CSS**: Modern animations and gradients
- **JavaScript**: Async/await, DOM manipulation

## 📞 Support

For Cloudinary-specific issues:
- [Cloudinary Support](https://support.cloudinary.com/)
- [Community Forum](https://community.cloudinary.com/)
- [Documentation](https://cloudinary.com/documentation)

---

**Built with ❤️ for video management needs**

*Powered by Cloudinary*
