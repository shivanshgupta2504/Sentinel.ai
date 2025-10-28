# API Integration Guide for Real-Time Alerts

## Overview
The **Real-Time Alerts** section in the video player is dynamically driven by the `events` array in your API response. This document explains how to integrate your backend API to populate this section.

## Current Implementation
The system uses sample data by default. To connect to your real API:

1. Open `uploads.js`
2. Find the `openVideoModal()` function (around line 278)
3. Uncomment this line:
   ```javascript
   const eventData = await fetchVideoAnalysis(video.id);
   ```
4. Comment out or remove the sample `eventData` object

## API Endpoint

### Expected Endpoint
```
GET /api/video-analysis/{videoId}
```

### Authentication
Add your authentication headers in the `fetchVideoAnalysis()` function:
```javascript
const response = await fetch(`/api/video-analysis/${videoId}`, {
    headers: {
        'Authorization': `Bearer ${YOUR_TOKEN}`,
        'Content-Type': 'application/json'
    }
});
```

## JSON Response Structure

### Complete Example
```json
{
  "videoMetadata": {
    "videoId": "video_12345",
    "videoUrl": "https://cloudinary.com/your-video.mp4",
    "environment": "billing_counter",
    "recordedAt": "2025-01-15T10:30:00Z"
  },
  "participants": [
    {
      "id": "person_001",
      "role": "customer",
      "confidence": 0.97
    },
    {
      "id": "person_002",
      "role": "employee",
      "confidence": 0.95
    }
  ],
  "eventSequence": [
    {
      "expectedOrder": 1,
      "actualOrder": 1,
      "status": true,
      "description": "Customer approaches billing counter",
      "timestamp": "00:00:04",
      "confidence": 0.93
    }
  ],
  "events": [
    {
      "eventId": "evt_001",
      "description": "Unidentified metallic object resembling a weapon detected near counter",
      "timestamp": "00:00:18",
      "personsInvolved": ["person_001"],
      "confidence": 0.97,
      "classification": "Danger",
      "alertLevel": "high"
    },
    {
      "eventId": "evt_002",
      "description": "Customer exits the shop",
      "timestamp": "00:00:34",
      "personsInvolved": ["person_001"],
      "confidence": 0.94,
      "classification": "info",
      "alertLevel": "Normal"
    }
  ]
}
```

## Events Array Specification

The `events` array is what populates the **Real-Time Alerts** section. Each event object must have:

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `eventId` | string | Unique identifier for the event | `"evt_001"` |
| `description` | string | Human-readable event description | `"Weapon detected near counter"` |
| `timestamp` | string | Video timestamp in `MM:SS` or `HH:MM:SS` format | `"00:00:18"` |
| `personsInvolved` | array | Array of person IDs involved in the event | `["person_001", "person_002"]` |
| `confidence` | number | Confidence score between 0.0 and 1.0 | `0.97` |
| `classification` | string | Event type/category (any string) | `"Danger"`, `"info"`, `"warning"` |
| `alertLevel` | string | Alert severity level | `"Normal"`, `"medium"`, `"high"`, `"warning"` |

### Alert Level Styling

The `alertLevel` field determines the badge color:

- **`"Normal"`** or **`"normal"`** → Blue badge (informational)
- **`"medium"`** → Red badge (moderate danger)
- **`"high"`** → Dark red badge with pulsing animation (critical)
- **`"warning"`** → Yellow badge (caution)

### Timestamp Format

Timestamps must be in one of these formats:
- `MM:SS` (e.g., `"00:18"`)
- `HH:MM:SS` (e.g., `"00:00:18"`)

Events will automatically appear at their specified timestamp during video playback.

## Empty Events Handling

If the `events` array is empty or missing:
```json
{
  "events": []
}
```

The UI will display: **"No real-time events detected in this video."**

## Example: Adding Multiple Events

```json
{
  "events": [
    {
      "eventId": "evt_001",
      "description": "Person loitering near entrance for extended period",
      "timestamp": "00:02:30",
      "personsInvolved": ["person_003"],
      "confidence": 0.89,
      "classification": "Suspicious Activity",
      "alertLevel": "warning"
    },
    {
      "eventId": "evt_002",
      "description": "Unattended bag detected in restricted area",
      "timestamp": "00:05:12",
      "personsInvolved": ["person_003"],
      "confidence": 0.95,
      "classification": "Security Alert",
      "alertLevel": "high"
    },
    {
      "eventId": "evt_003",
      "description": "Customer completed transaction successfully",
      "timestamp": "00:07:45",
      "personsInvolved": ["person_001", "person_002"],
      "confidence": 0.98,
      "classification": "Transaction",
      "alertLevel": "Normal"
    }
  ]
}
```

## Testing Your Integration

### 1. Update the API Endpoint
In `uploads.js`, modify the `fetchVideoAnalysis()` function:
```javascript
async function fetchVideoAnalysis(videoId) {
    try {
        const response = await fetch(`https://your-api.com/video-analysis/${videoId}`, {
            headers: {
                'Authorization': 'Bearer YOUR_TOKEN_HERE'
            }
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching video analysis:', error);
        return null;
    }
}
```

### 2. Enable API Calls
Uncomment this line in `openVideoModal()`:
```javascript
const eventData = await fetchVideoAnalysis(video.id);
```

### 3. Test
1. Upload a video
2. Click on the video to open the modal
3. Check browser console for API calls
4. Events should appear at their specified timestamps

## UI Behavior

### Real-Time Appearance
- Events start **hidden** (opacity: 0, translated left)
- When video reaches event timestamp → smooth slide-in animation
- Events appear left-to-right in chronological order

### Interactions
- **Click event box** → Jump to that timestamp in video
- **Horizontal scroll** → View all events
- **Replay video** → Events hide and re-appear on replay

## Error Handling

If API call fails:
```javascript
// The function returns null and continues with sample data
console.error('❌ Error fetching video analysis:', error);
return null;
```

Consider adding user-facing error messages:
```javascript
if (!eventData) {
    showNotification('Failed to load event data', 'error');
    // Use fallback or empty events
    eventData = { events: [] };
}
```

## Need Help?

1. Check browser console for API errors
2. Verify JSON structure matches specification
3. Test with sample data first
4. Ensure timestamps match video duration

---

**Last Updated:** January 2025  
**Version:** 1.0

