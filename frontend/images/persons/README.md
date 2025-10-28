# Person Images

This directory contains images for the character profiles displayed in the Character tab.

## How to Add Your Images

1. **Save the employee image** (woman in gray suit) as: `employee.jpg`
2. **Save the customer image** (older man) as: `customer.jpg`
3. Place both images in this directory: `/Users/somya/Desktop/sentinel.ai/images/persons/`

## Image Requirements

- **Format**: JPG, PNG, or WEBP
- **Recommended size**: 150x150px to 400x400px
- **Aspect ratio**: Square (1:1) works best
- **File size**: Keep under 500KB for optimal loading

## Current Configuration

The app is configured to display:
- **Employee**: `images/persons/employee.jpg`
- **Customer**: `images/persons/customer.jpg`

Once you add the images to this folder, they will automatically appear in the character blocks when you open a video in the uploads page.

## Alternative: Using URLs

If you prefer to host images online (e.g., on Cloudinary, Imgur, or your server), you can update the `pictureUrl` field in `uploads.js` (around line 406 and 454) with the full image URLs.


