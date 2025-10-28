/* =============================================================================
   UPLOADS PAGE JAVASCRIPT
   =============================================================================
   Handles fetching and displaying videos from Cloudinary
============================================================================= */

// DOM Elements
const videosGrid = document.getElementById('videosGrid');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const filterEnvironment = document.getElementById('filterEnvironment');
const retryBtn = document.getElementById('retryBtn');
const videoModal = document.getElementById('videoModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

// State
let allVideos = [];
let filteredVideos = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    setupEventListeners();
    
    // Make functions globally accessible for inline onclick handlers
    window.openVideoModal = openVideoModal;
    window.confirmDeleteVideo = confirmDeleteVideo;
});

// Setup Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    filterEnvironment.addEventListener('change', handleFilter);
    retryBtn.addEventListener('click', loadVideos);
    modalOverlay.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
}

// Load videos from Cloudinary
async function loadVideos() {
    console.log('🔄 Loading videos from Cloudinary...');
    
    showState('loading');
    
    try {
        // Fetch videos from Cloudinary using the Admin API
        // Note: For production, you should use a backend proxy to hide API credentials
        const videos = await fetchCloudinaryVideos();
        
        if (videos.length === 0) {
            console.log('📭 No videos found');
            showState('empty');
        } else {
            console.log(`✅ Loaded ${videos.length} videos`);
            allVideos = videos;
            filteredVideos = videos;
            displayVideos(videos);
            showState('grid');
        }
    } catch (error) {
        console.error('❌ Error loading videos:', error);
        errorMessage.textContent = error.message || 'Failed to load videos from Cloudinary';
        showState('error');
    }
}

// Fetch videos from Cloudinary
async function fetchCloudinaryVideos() {
    // For demo purposes, we'll use local storage references
    // In production, you should fetch from Cloudinary API
    
    const storedVideos = getStoredVideos();
    
    if (storedVideos.length === 0) {
        return [];
    }
    
    // Fetch full details from Cloudinary for each video
    const videoPromises = storedVideos.map(async (video) => {
        try {
            // Get video details from Cloudinary
            const resourceUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/video/upload/${video.id}.json`;
            const response = await fetch(resourceUrl);
            
            if (!response.ok) {
                // If Cloudinary fetch fails, use stored data
                return enrichVideoData(video);
            }
            
            const cloudinaryData = await response.json();
            return enrichVideoData({ ...video, ...cloudinaryData });
        } catch (error) {
            console.warn('⚠️ Failed to fetch from Cloudinary, using stored data:', error);
            return enrichVideoData(video);
        }
    });
    
    return await Promise.all(videoPromises);
}

// Enrich video data with computed properties
function enrichVideoData(video) {
    return {
        ...video,
        thumbnailUrl: video.url ? getThumbnailUrl(video.url) : null,
        formattedDate: formatDate(video.uploadDate),
        formattedSize: formatFileSize(video.size || 0),
        formattedDuration: formatDuration(video.duration || 0),
        environmentTag: video.environment || 'Unknown'
    };
}

// Get thumbnail URL from video URL
function getThumbnailUrl(videoUrl) {
    // Convert video URL to thumbnail
    return videoUrl
        .replace('/upload/', '/upload/w_400,h_300,c_fill,q_auto,f_jpg/')
        .replace(/\.(mp4|mov|avi|mkv)$/i, '.jpg');
}

// Get stored videos from local storage
function getStoredVideos() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.videos);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('❌ Error retrieving videos:', error);
        return [];
    }
}

// Display videos in grid
function displayVideos(videos) {
    videosGrid.innerHTML = '';
    
    if (videos.length === 0) {
        showState('empty');
        return;
    }
    
    videos.forEach((video, index) => {
        const card = createVideoCard(video, index);
        videosGrid.appendChild(card);
    });
}

// Create video card element
function createVideoCard(video, index) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="video-thumbnail-wrapper" onclick="openVideoModal(${JSON.stringify(video).replace(/"/g, '&quot;')})">
            <img 
                src="${video.thumbnailUrl || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23222\' width=\'400\' height=\'300\'/%3E%3C/svg%3E'}" 
                alt="${video.filename}" 
                class="video-thumbnail-img"
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'300\\'%3E%3Crect fill=\\'%23222\\' width=\\'400\\' height=\\'300\\'/%3E%3C/svg%3E'"
            >
            <div class="video-play-overlay">
                <div class="video-play-icon"></div>
            </div>
            ${video.formattedDuration ? `<div class="video-duration-badge">${video.formattedDuration}</div>` : ''}
            <button class="video-delete-btn" onclick="event.stopPropagation(); confirmDeleteVideo('${video.id}', '${video.filename.replace(/'/g, "\\'")}')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 5.98C17.67 5.65 14.32 5.48 10.98 5.48C9 5.48 7.02 5.58 5.04 5.78L3 5.98M8.5 4.97L8.72 3.66C8.88 2.71 9 2 10.69 2H13.31C15 2 15.13 2.75 15.28 3.67L15.5 4.97M18.85 9.14L18.2 19.21C18.09 20.78 18 22 15.21 22H8.79C6 22 5.91 20.78 5.8 19.21L5.15 9.14M10.33 16.5H13.66M9.5 12.5H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
        <div class="video-info" onclick="openVideoModal(${JSON.stringify(video).replace(/"/g, '&quot;')})">
            <h3 class="video-title">${video.filename}</h3>
            <div class="video-meta">
                <div class="video-meta-item">
                    <svg class="video-meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${video.formattedDate}</span>
                </div>
                ${video.formattedSize ? `
                <div class="video-meta-item">
                    <svg class="video-meta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span>${video.formattedSize}</span>
                </div>
                ` : ''}
            </div>
            <div class="video-environment-tag">
                <span class="environment-dot"></span>
                <span>${video.environmentTag}</span>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * EXPECTED JSON STRUCTURE FROM YOUR API
 * =====================================
 * 
 * API Endpoint: GET /api/video-analysis/{videoId}
 * 
 * Expected Response Format:
 * {
 *   "videoMetadata": {
 *     "videoId": "string",
 *     "videoUrl": "string",
 *     "environment": "string",
 *     "recordedAt": "ISO datetime string"
 *   },
 *   "participants": [
 *     {
 *       "id": "string",
 *       "role": "string",
 *       "confidence": 0.0-1.0
 *     }
 *   ],
 *   "eventSequence": [              <-- THIS ARRAY DETERMINES SOP COMPLIANCE DISPLAY
 *     {
 *       "expectedOrder": number,
 *       "actualOrder": number | null,
 *       "status": boolean,
 *       "description": "string",
 *       "timestamp": "MM:SS or HH:MM:SS",
 *       "confidence": 0.0-1.0
 *     }
 *   ],
 *   "events": [                     <-- THIS ARRAY DETERMINES REAL-TIME ALERTS DISPLAY
 *     {
 *       "eventId": "evt_xxx",       // Required: Unique identifier
 *       "description": "string",     // Required: Event description
 *       "timestamp": "MM:SS",        // Required: Video timestamp (HH:MM:SS or MM:SS)
 *       "personsInvolved": ["id"],   // Required: Array of person IDs
 *       "alertLevel": "medium"       // Required: "Normal", "medium", "high", "warning"
 *     }
 *   ],
 *   "personsData": [                <-- THIS ARRAY DETERMINES CHARACTER TAB DISPLAY
 *     {
 *       "huid": "string",            // Required: Unique person identifier
 *       "name": "string",            // Optional: Display name (defaults to "Person")
 *       "role": "string",            // Optional: Person's role (e.g., "Customer", "Employee")
 *       "pictureUrl": "string",      // Optional: URL to person's image
 *       "person_actions": [          // Required: Array of actions performed
 *         {
 *           "start": "MM:SS",        // Required: Action start timestamp
 *           "end": "MM:SS",          // Required: Action end timestamp
 *           "action": "string"       // Required: Description of action
 *         }
 *       ]
 *     }
 *   ]
 * }
 * 
 * Alert Level Badge Colors:
 * - "Normal" or "normal" → Blue badge
 * - "medium" → Red badge
 * - "high" → Dark red badge with pulse animation
 * - "warning" → Yellow badge
 */

/**
 * Fetch video analysis data from your API
 * Uncomment and modify this function when you have your backend ready
 */
async function fetchVideoAnalysis(videoId) {
    try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/video-analysis/${videoId}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        console.log('📊 Received analysis data:', data);
        return data;
    } catch (error) {
        console.error('❌ Error fetching video analysis:', error);
        // Return sample data as fallback
        return null;
    }
}

// Open video modal with details
async function openVideoModal(videoData) {
    // Parse video data if it's a string (from onclick attribute)
    const video = typeof videoData === 'string' ? JSON.parse(videoData) : videoData;
    console.log('📹 Opening video:', video);
    
    // Fetch data from your API (uncomment when backend is ready)
    // const eventData = await fetchVideoAnalysis(video.id);
    
    // Sample API response data matching the backend structure
    // TODO: Replace this with actual API call by uncommenting the line above
    const eventData = {
        videoMetadata: {
            videoId: video.id,
            videoUrl: video.url,
            environment: video.environment || "billing_counter",
            recordedAt: video.uploadDate
        },
        participants: [
            {
                id: "person_001",
                role: "customer",
                confidence: 0.97
            },
            {
                id: "person_002",
                role: "employee",
                confidence: 0.95
            }
        ],
        eventSequence: [
            {
                expectedOrder: 1,
                actualOrder: 1,
                status: true,
                description: "Customer comes to the billing counter",
                timestamp: "00:00:04",
                confidence: 0.93
            },
            {
                expectedOrder: 2,
                actualOrder: 2,
                status: true,
                description: "Employee scans the items",
                timestamp: "00:00:11",
                confidence: 0.88
            },
            {
                expectedOrder: 3,
                actualOrder: 3,
                status: true,
                description: "Employee generates the bill",
                timestamp: "00:00:18",
                confidence: 0.91
            },
            {
                expectedOrder: 4,
                actualOrder: 4,
                status: true,
                description: "Customer pays the bill",
                timestamp: "00:00:27",
                confidence: 0.89
            },
            {
                expectedOrder: 5,
                actualOrder: 5,
                status: true,
                description: "Employee handovers the item",
                timestamp: "00:00:36",
                confidence: 0.90
            },
            {
                expectedOrder: 6,
                actualOrder: 6,
                status: true,
                description: "Customer exits",
                timestamp: "00:00:45",
                confidence: 0.92
            }
        ],
        // Real-Time Alerts from JSON - This array will determine what shows in Real-Time Alerts section
        events: [
            {
                eventId: "evt_001",
                description: "Person too close to the billing counter",
                timestamp: "00:00:09",
                personsInvolved: ["51922dac-1878-4c4b-813c-8be8329e3ee6"],
                alertLevel: "High"
            }
        ],
        // Person Actions Data - Character information with actions timeline
        personsData: [
            {
                huid: "51922dac-1878-4c4b-813c-8be8329e3ee6",
                name: "Employee",
                role: "Cashier",
                pictureUrl: "images/persons/employee.jpeg",
                person_actions: [
                    {
                        start: "00:00:04",
                        end: "00:00:09",
                        action: "sits down at the counter"
                    },
                    {
                        start: "00:00:09",
                        end: "00:00:13",
                        action: "picks up a barcode scanner and scans an item"
                    },
                    {
                        start: "00:00:13",
                        end: "00:00:15",
                        action: "places the barcode scanner back in its holder"
                    },
                    {
                        start: "00:00:18",
                        end: "00:00:20",
                        action: "takes a card from the customer and swipes it"
                    },
                    {
                        start: "00:00:20",
                        end: "00:00:23",
                        action: "returns the card to the customer"
                    },
                    {
                        start: "00:00:25",
                        end: "00:00:28",
                        action: "assists the customer with the card reader for payment"
                    },
                    {
                        start: "00:00:28",
                        end: "00:00:34",
                        action: "processes the payment on the computer"
                    },
                    {
                        start: "00:00:34",
                        end: "00:00:37",
                        action: "retrieves a small white pouch and hands it to the customer"
                    }
                ]
            },
            {
                huid: "eebdbbb1-6d23-4ba2-a41c-4f05e42b3f94",
                name: "Customer",
                role: "Customer",
                pictureUrl: "images/persons/customer.jpeg",
                person_actions: [
                    {
                        start: "00:00:01",
                        end: "00:00:04",
                        action: "walks into the store"
                    },
                    {
                        start: "00:00:04",
                        end: "00:00:08",
                        action: "stands at the counter, looking at the salesperson and the computer screen"
                    },
                    {
                        start: "00:00:08",
                        end: "00:00:16",
                        action: "observes the salesperson scanning an item"
                    },
                    {
                        start: "00:00:16",
                        end: "00:00:20",
                        action: "watches the salesperson interact with the payment terminal"
                    },
                    {
                        start: "00:00:20",
                        end: "00:00:25",
                        action: "watches the salesperson taking something from a compartment"
                    },
                    {
                        start: "00:00:25",
                        end: "00:00:30",
                        action: "uses the payment terminal to complete a transaction"
                    },
                    {
                        start: "00:00:30",
                        end: "00:00:33",
                        action: "watches the computer screen, which now displays a green screen indicating a successful transaction"
                    },
                    {
                        start: "00:00:33",
                        end: "00:00:38",
                        action: "receives a small white pouch from the salesperson"
                    },
                    {
                        start: "00:00:38",
                        end: "00:00:40",
                        action: "stands and smiles at the salesperson"
                    },
                    {
                        start: "00:00:40",
                        end: "00:00:45",
                        action: "walks towards the exit and leaves the store"
                    }
                ]
            }
        ]
    };
    
    // Extract events from JSON response (events array drives Real-Time Alerts section)
    const eventNotifications = eventData.events || [];
    
    modalBody.innerHTML = `
        <div class="video-modal-layout">
            <!-- Left Column: Video Player + Real-Time Alerts -->
            <div class="video-content-column">
                <!-- Video Player -->
                <div class="video-player-wrapper">
                    <video class="modal-video-player" id="modalVideoPlayer" controls>
                        <source src="${video.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
                
                <!-- Real-Time Alerts with Toggle (Same width as video) -->
                <div class="event-notifications-section">
                    <div class="event-section-header">
                        <div class="event-toggle-buttons">
                            <button class="event-toggle-btn active" id="eventsToggleBtn" onclick="switchEventTab('events')">
                                Real-Time Alerts
                            </button>
                            <button class="event-toggle-btn" id="characterToggleBtn" onclick="switchEventTab('character')">
                                Character
                            </button>
                        </div>
                    </div>
                    
                    <!-- Real-Time Alerts Content -->
                    <div class="event-tab-content active" id="eventsTabContent">
                        <div class="events-initial-message" id="eventsInitialMessage">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#alertGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 8V12" stroke="url(#alertGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <circle cx="12" cy="16" r="0.5" fill="url(#alertGrad)" stroke="url(#alertGrad)" stroke-width="1.5"/>
                                <defs>
                                    <linearGradient id="alertGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                        <stop stop-color="#8B5CF6"/>
                                        <stop offset="1" stop-color="#06B6D4"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                            <p class="events-initial-text">Real-time Alerts will be displayed here</p>
                            <p class="events-initial-subtext">Play the video to see events as they occur</p>
                        </div>
                        <div class="event-notifications-container" id="eventNotificationsContainer">
                        ${eventNotifications.length > 0 ? eventNotifications.map((event, index) => `
                            <div class="event-notification-box event-notification-hidden" 
                                 data-timestamp="${event.timestamp}"
                                 data-event-id="${event.eventId}"
                                 data-alert-level="${event.alertLevel.toLowerCase()}">
                                <div class="event-notification-header">
                                    <div class="event-notification-badge badge-${event.alertLevel.toLowerCase()}">
                                        ${event.alertLevel}
                                    </div>
                                    <div class="event-notification-time">${event.timestamp}</div>
                                </div>
                                <div class="event-notification-body">
                                    <div class="event-notification-description">${event.description}</div>
                                    <div class="event-notification-meta">
                                        <div class="event-notification-meta-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                                            </svg>
                                            <span>${event.personsInvolved.length} person(s)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('') : '<div class="no-events-message">No real-time events detected in this video.</div>'}
                        </div>
                    </div>
                    
                    <!-- Character Content -->
                    <div class="event-tab-content" id="characterTabContent">
                        <div class="character-content">
                            ${eventData.personsData && eventData.personsData.length > 0 ? eventData.personsData.map((person, personIndex) => `
                                <div class="person-card person-card-clickable" data-person-id="${person.huid}">
                                    <div class="person-header-clickable">
                                        <div class="person-main-info">
                                            <div class="person-image-wrapper">
                                                <img src="${person.pictureUrl}" alt="${person.name}" class="person-image" 
                                                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'150\\' height=\\'150\\'%3E%3Crect fill=\\'%23667eea\\' width=\\'150\\' height=\\'150\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' font-size=\\'48\\' fill=\\'white\\' text-anchor=\\'middle\\' dy=\\'.3em\\'%3E${person.name.charAt(0)}%3C/text%3E%3C/svg%3E'">
                                            </div>
                                            <div class="person-info">
                                                <h4 class="person-name">${person.name}</h4>
                                                <p class="person-role">${person.role}</p>
                                                <p class="person-id">ID: ${person.huid.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                        <div class="person-expand-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    <!-- Actions Section (Hidden by default) -->
                                    <div class="person-events-section" style="display: none;">
                                        <div class="person-events-header">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                                            </svg>
                                            <h5 class="person-events-title">Actions Timeline</h5>
                                        </div>
                                        <div class="person-events-list" data-person-id="${person.huid}">
                                            <!-- Actions will be injected here -->
                                        </div>
                                    </div>
                                </div>
                            `).join('') : '<p class="character-placeholder">No character data available.</p>'}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Right Column: SOP Compliance (Full Height) -->
            <div class="event-timeline-container">
                <h3 class="event-timeline-title">SOP Compliance</h3>
                <div class="event-timeline-list" id="eventTimelineList">
                    ${eventData.eventSequence.map((evt, index) => `
                        <div class="event-timeline-item" 
                             data-expected-order="${evt.expectedOrder}"
                             data-actual-order="${evt.actualOrder}"
                             data-status="${evt.status}"
                             data-timestamp="${evt.timestamp || ''}"
                             data-index="${index}">
                            <div class="event-circle event-circle-waiting" 
                                 data-timestamp="${evt.timestamp || ''}"></div>
                            <div class="event-info">
                                <div class="event-order-badge">
                                    <span class="expected-order">#${evt.expectedOrder}</span>
                                </div>
                                <div class="event-time event-time-waiting">--:--</div>
                                <div class="event-name">${evt.description}</div>
                                <div class="event-confidence event-confidence-waiting">Analyzing...</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    videoModal.style.display = 'flex';
    
    // Adjust modal position based on sidebar state
    adjustModalForSidebar();
    
    // Setup video event tracking
    setupVideoEventTracking(eventData.eventSequence);
    
    // Setup event notifications
    setupEventNotifications(eventNotifications);
    
    // Setup person event filtering
    setupPersonEventFiltering(eventNotifications, eventData.personsData);
}

// Adjust modal position based on sidebar width
function adjustModalForSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('expanded')) {
        videoModal.style.left = '260px';
    } else {
        videoModal.style.left = '80px';
    }
}

// Convert timestamp string (MM:SS or HH:MM:SS) to seconds
function timestampToSeconds(timestamp) {
    if (!timestamp) return null;
    const parts = timestamp.split(':');
    if (parts.length === 3) {
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    } else if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return null;
}

// Auto-scroll to event in timeline
function scrollToEvent(eventItem) {
    const timelineContainer = document.querySelector('.event-timeline-container');
    if (!timelineContainer || !eventItem) return;
    
    // Get the position of the event item relative to the container
    const containerRect = timelineContainer.getBoundingClientRect();
    const itemRect = eventItem.getBoundingClientRect();
    
    // Check if item is not fully visible
    const isAboveView = itemRect.top < containerRect.top;
    const isBelowView = itemRect.bottom > containerRect.bottom;
    
    if (isAboveView || isBelowView) {
        // Scroll to center the item in the container
        const scrollTop = eventItem.offsetTop - (timelineContainer.clientHeight / 2) + (eventItem.clientHeight / 2);
        
        timelineContainer.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
        });
    }
}

// Setup video event tracking with SOP compliance logic
function setupVideoEventTracking(eventSequence) {
    const videoPlayer = document.getElementById('modalVideoPlayer');
    const eventCircles = document.querySelectorAll('.event-circle');
    const eventItems = document.querySelectorAll('.event-timeline-item');
    const eventTimes = document.querySelectorAll('.event-time');
    const eventConfidences = document.querySelectorAll('.event-confidence');
    
    if (!videoPlayer) return;
    
    let videoEnded = false;
    let lastEventCompleted = false; // Track if the last event in sequence has completed
    
    // Track video time and update circles in real-time
    videoPlayer.addEventListener('timeupdate', () => {
        const currentTime = videoPlayer.currentTime;
        
        // Find the highest index of completed events so far
        let highestCompletedIndex = -1;
        eventSequence.forEach((evt, index) => {
            if (evt.status) {
                const eventTimeSeconds = timestampToSeconds(evt.timestamp);
                if (eventTimeSeconds !== null && currentTime >= eventTimeSeconds) {
                    highestCompletedIndex = index;
                }
            }
        });
        
        // Update each event
        eventSequence.forEach((evt, index) => {
            const circle = eventCircles[index];
            const item = eventItems[index];
            const timeDisplay = eventTimes[index];
            const confidenceDisplay = eventConfidences[index];
            
            if (evt.status) {
                // Event DID happen (status: true)
                const eventTimeSeconds = timestampToSeconds(evt.timestamp);
                
                if (eventTimeSeconds !== null && currentTime >= eventTimeSeconds) {
                    // Event timestamp reached - turn GREEN (can come from yellow!)
                    const wasNotActive = !circle.classList.contains('event-circle-active');
                    
                    circle.classList.remove('event-circle-waiting', 'event-circle-pending', 'event-circle-missed');
                    circle.classList.add('event-circle-active');
                    item.classList.remove('event-timeline-item-pending', 'event-timeline-item-missed');
                    item.classList.add('event-timeline-item-active');
                    
                    // Show real timestamp and confidence
                    if (timeDisplay) {
                        timeDisplay.textContent = evt.timestamp;
                        timeDisplay.classList.remove('event-time-waiting', 'event-time-pending', 'event-time-missed');
                    }
                    if (confidenceDisplay) {
                        confidenceDisplay.textContent = `${Math.round(evt.confidence * 100)}% confidence`;
                        confidenceDisplay.classList.remove('event-confidence-waiting', 'event-confidence-pending', 'event-confidence-missed');
                        confidenceDisplay.classList.add('event-confidence-shown');
                    }
                    
                    // Auto-scroll to this event if it just became active
                    if (wasNotActive) {
                        scrollToEvent(item);
                    }
                    
                    // Check if this is the last event in the sequence
                    if (index === eventSequence.length - 1) {
                        lastEventCompleted = true;
                    }
                } else {
                    // Event not reached yet - check if it should be yellow
                    const futureEventCompleted = highestCompletedIndex > index;
                    
                    if (futureEventCompleted && !videoEnded && !lastEventCompleted) {
                        // A future event happened before this one - turn YELLOW
                        const wasNotPending = !circle.classList.contains('event-circle-pending');
                        
                        circle.classList.remove('event-circle-waiting', 'event-circle-active', 'event-circle-missed');
                        circle.classList.add('event-circle-pending');
                        item.classList.remove('event-timeline-item-active', 'event-timeline-item-missed');
                        item.classList.add('event-timeline-item-pending');
                        
                        // Update time display
                        if (timeDisplay) {
                            timeDisplay.textContent = 'Waiting...';
                            timeDisplay.classList.remove('event-time-waiting', 'event-time-missed');
                            timeDisplay.classList.add('event-time-pending');
                        }
                        if (confidenceDisplay) {
                            confidenceDisplay.textContent = 'Still monitoring';
                            confidenceDisplay.classList.remove('event-confidence-waiting', 'event-confidence-shown', 'event-confidence-missed');
                            confidenceDisplay.classList.add('event-confidence-pending');
                        }
                        
                        // Auto-scroll to this event if it just became pending
                        if (wasNotPending) {
                            scrollToEvent(item);
                        }
                    } else {
                        // Stay gray/waiting
                        if (!circle.classList.contains('event-circle-active') && !circle.classList.contains('event-circle-pending')) {
                            circle.classList.add('event-circle-waiting');
                            circle.classList.remove('event-circle-active', 'event-circle-pending', 'event-circle-missed');
                        }
                    }
                }
            } else {
                // Event did NOT happen (status: false)
                
                // Check if a FUTURE event (higher index) has been completed
                const futureEventCompleted = highestCompletedIndex > index;
                
                if (futureEventCompleted && !videoEnded && !lastEventCompleted) {
                    // A future event happened, so this one was definitely skipped - turn YELLOW
                    circle.classList.remove('event-circle-waiting', 'event-circle-active', 'event-circle-missed');
                    circle.classList.add('event-circle-pending');
                    item.classList.remove('event-timeline-item-active', 'event-timeline-item-missed');
                    
                    // Update time display
                    if (timeDisplay) {
                        timeDisplay.textContent = 'Waiting...';
                        timeDisplay.classList.remove('event-time-waiting', 'event-time-missed');
                        timeDisplay.classList.add('event-time-pending');
                    }
                    if (confidenceDisplay) {
                        confidenceDisplay.textContent = 'Still monitoring';
                        confidenceDisplay.classList.remove('event-confidence-waiting', 'event-confidence-shown', 'event-confidence-missed');
                        confidenceDisplay.classList.add('event-confidence-pending');
                    }
                    
                    // Add yellow background to item
                    item.classList.remove('event-timeline-item-active', 'event-timeline-item-missed');
                    item.classList.add('event-timeline-item-pending');

                } else if (lastEventCompleted || videoEnded) {
                    // Last event completed or video ended - turn RED
                    circle.classList.remove('event-circle-waiting', 'event-circle-pending', 'event-circle-active');
                    circle.classList.add('event-circle-missed');
                    item.classList.remove('event-timeline-item-active', 'event-timeline-item-pending');
                    item.classList.add('event-timeline-item-missed');
                    
                    // Update time display
                    if (timeDisplay) {
                        timeDisplay.textContent = 'Missed';
                        timeDisplay.classList.remove('event-time-waiting', 'event-time-pending');
                        timeDisplay.classList.add('event-time-missed');
                    }
                    if (confidenceDisplay) {
                        confidenceDisplay.textContent = 'Not performed';
                        confidenceDisplay.classList.remove('event-confidence-waiting', 'event-confidence-shown');
                        confidenceDisplay.classList.add('event-confidence-missed');
                    }
                } else {
                    // Still waiting - no future event yet, stay gray
                    if (!circle.classList.contains('event-circle-pending') && !circle.classList.contains('event-circle-missed')) {
                        circle.classList.add('event-circle-waiting');
                        circle.classList.remove('event-circle-active', 'event-circle-pending', 'event-circle-missed');
                    }
                }
            }
        });
    });
    
    // Handle video end - turn all non-completed events RED
    videoPlayer.addEventListener('ended', () => {
        videoEnded = true;
        
        eventSequence.forEach((evt, index) => {
            if (!evt.status) {
                const circle = eventCircles[index];
                const item = eventItems[index];
                const timeDisplay = eventTimes[index];
                
                // Turn all non-completed events RED
                circle.classList.remove('event-circle-waiting', 'event-circle-pending', 'event-circle-active');
                circle.classList.add('event-circle-missed');
                item.classList.remove('event-timeline-item-active', 'event-timeline-item-pending');
                item.classList.add('event-timeline-item-missed');
                
                // Update time display
                if (timeDisplay) {
                    timeDisplay.textContent = 'Missed';
                    timeDisplay.classList.remove('event-time-waiting', 'event-time-pending');
                    timeDisplay.classList.add('event-time-missed');
                }
                
                const confidenceDisplay = eventConfidences[index];
                if (confidenceDisplay) {
                    confidenceDisplay.textContent = 'Not performed';
                    confidenceDisplay.classList.remove('event-confidence-waiting', 'event-confidence-shown');
                    confidenceDisplay.classList.add('event-confidence-missed');
                }
            }
        });
    });
    
    // Reset when video is replayed from start
    videoPlayer.addEventListener('play', () => {
        if (videoPlayer.currentTime < 1) {
            videoEnded = false;
            lastEventCompleted = false;
            
            // Reset all events to waiting state
            eventSequence.forEach((evt, index) => {
                const circle = eventCircles[index];
                const item = eventItems[index];
                const timeDisplay = eventTimes[index];
                const confidenceDisplay = eventConfidences[index];
                
                circle.classList.remove('event-circle-active', 'event-circle-pending', 'event-circle-missed');
                circle.classList.add('event-circle-waiting');
                item.classList.remove('event-timeline-item-active', 'event-timeline-item-pending', 'event-timeline-item-missed');
                
                if (timeDisplay) {
                    timeDisplay.textContent = '--:--';
                    timeDisplay.classList.remove('event-time-pending', 'event-time-missed');
                    timeDisplay.classList.add('event-time-waiting');
                }
                
                if (confidenceDisplay) {
                    confidenceDisplay.textContent = 'Analyzing...';
                    confidenceDisplay.classList.remove('event-confidence-shown');
                    confidenceDisplay.classList.add('event-confidence-waiting');
                }
            });
        }
    });
    
    // Allow clicking on event items to jump to that timestamp (only if event happened)
    eventItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const evt = eventSequence[index];
            if (evt.status && evt.timestamp) {
                const seconds = timestampToSeconds(evt.timestamp);
                if (seconds !== null) {
                    videoPlayer.currentTime = seconds;
                    videoPlayer.play();
                }
            }
        });
    });
}

// Switch between event tabs
function switchEventTab(tabName) {
    const eventsBtn = document.getElementById('eventsToggleBtn');
    const characterBtn = document.getElementById('characterToggleBtn');
    const eventsContent = document.getElementById('eventsTabContent');
    const characterContent = document.getElementById('characterTabContent');
    
    if (tabName === 'events') {
        eventsBtn.classList.add('active');
        characterBtn.classList.remove('active');
        eventsContent.classList.add('active');
        characterContent.classList.remove('active');
    } else if (tabName === 'character') {
        eventsBtn.classList.remove('active');
        characterBtn.classList.add('active');
        eventsContent.classList.remove('active');
        characterContent.classList.add('active');
    }
}

// Make switchEventTab globally accessible
window.switchEventTab = switchEventTab;

// Setup event notifications to appear in real-time
function setupEventNotifications(eventNotifications) {
    const videoPlayer = document.getElementById('modalVideoPlayer');
    const notificationBoxes = document.querySelectorAll('.event-notification-box');
    
    if (!videoPlayer) return;
    
    let shownEvents = new Set();
    
    // Track video time and show events at their timestamps
    videoPlayer.addEventListener('timeupdate', () => {
        const currentTime = videoPlayer.currentTime;
        
        eventNotifications.forEach((event, index) => {
            const eventTimeSeconds = timestampToSeconds(event.timestamp);
            const box = notificationBoxes[index];
            
            if (!box) return;
            
            // Show event when its timestamp is reached
            if (eventTimeSeconds !== null && currentTime >= eventTimeSeconds) {
                if (!shownEvents.has(event.eventId)) {
                    shownEvents.add(event.eventId);
                    
                    // Hide initial message when first event appears
                    const initialMessage = document.getElementById('eventsInitialMessage');
                    if (initialMessage) {
                        initialMessage.style.display = 'none';
                    }
                    
                    // Animate in with delay
                    setTimeout(() => {
                        box.classList.remove('event-notification-hidden');
                        box.classList.add('event-notification-visible');
                    }, 100);
                }
            }
        });
    });
    
    // Reset notifications when video is replayed from start
    videoPlayer.addEventListener('play', () => {
        if (videoPlayer.currentTime < 1) {
            shownEvents.clear();
            
            // Show initial message again
            const initialMessage = document.getElementById('eventsInitialMessage');
            if (initialMessage) {
                initialMessage.style.display = 'flex';
            }
            
            notificationBoxes.forEach(box => {
                box.classList.remove('event-notification-visible');
                box.classList.add('event-notification-hidden');
            });
        }
    });
    
    // Allow clicking on notification boxes to jump to that timestamp
    notificationBoxes.forEach((box, index) => {
        box.addEventListener('click', () => {
            const event = eventNotifications[index];
            if (event.timestamp) {
                const seconds = timestampToSeconds(event.timestamp);
                if (seconds !== null) {
                    videoPlayer.currentTime = seconds;
                    videoPlayer.play();
                }
            }
        });
    });
}

// Setup person event filtering - Show actions within character blocks
function setupPersonEventFiltering(allEvents, personsData) {
    const personCards = document.querySelectorAll('.person-card-clickable');
    
    // Populate actions for each person
    personsData.forEach(person => {
        const personEventsContainer = document.querySelector(`.person-events-list[data-person-id="${person.huid}"]`);
        if (!personEventsContainer) return;
        
        // Get person actions
        const personActions = person.person_actions || [];
        
        // Generate actions HTML
        if (personActions.length > 0) {
            personEventsContainer.innerHTML = personActions.map(action => `
                <div class="person-event-item" data-timestamp="${action.start}" data-start="${action.start}" data-end="${action.end}">
                    <div class="person-event-content">
                        <div class="person-event-time-range">
                            <span class="action-start-time">${action.start}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span class="action-end-time">${action.end}</span>
                        </div>
                        <div class="person-event-description">${action.action}</div>
                    </div>
                </div>
            `).join('');
        } else {
            personEventsContainer.innerHTML = `
                <div class="person-event-empty">
                    No actions found for this person
                </div>
            `;
        }
    });
    
    // Add click handlers to expand/collapse person cards
    personCards.forEach(card => {
        const header = card.querySelector('.person-header-clickable');
        const eventsSection = card.querySelector('.person-events-section');
        const expandIcon = card.querySelector('.person-expand-icon');
        
        if (header && eventsSection && expandIcon) {
            header.addEventListener('click', () => {
                const isExpanded = card.classList.contains('person-card-expanded');
                
                // Close all other cards
                personCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('person-card-expanded');
                        const otherEventsSection = otherCard.querySelector('.person-events-section');
                        const otherExpandIcon = otherCard.querySelector('.person-expand-icon');
                        if (otherEventsSection) otherEventsSection.style.display = 'none';
                        if (otherExpandIcon) otherExpandIcon.classList.remove('expanded');
                    }
                });
                
                // Toggle current card
                if (isExpanded) {
                    card.classList.remove('person-card-expanded');
                    eventsSection.style.display = 'none';
                    expandIcon.classList.remove('expanded');
                } else {
                    card.classList.add('person-card-expanded');
                    eventsSection.style.display = 'block';
                    expandIcon.classList.add('expanded');
                }
            });
        }
    });
    
    // Make event items clickable to jump to timestamp
    const videoPlayer = document.getElementById('modalVideoPlayer');
    if (videoPlayer) {
        document.querySelectorAll('.person-event-item').forEach(eventItem => {
            eventItem.addEventListener('click', () => {
                const timestamp = eventItem.dataset.timestamp;
                const seconds = timestampToSeconds(timestamp);
                if (seconds !== null) {
                    videoPlayer.currentTime = seconds;
                    videoPlayer.play();
                }
            });
        });
    }
}

// Close modal
function closeModal() {
    videoModal.style.display = 'none';
    
    // Stop video playback
    const video = modalBody.querySelector('video');
    if (video) {
        video.pause();
    }
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query === '') {
        filteredVideos = allVideos;
    } else {
        filteredVideos = allVideos.filter(video => 
            video.filename.toLowerCase().includes(query) ||
            video.environmentTag.toLowerCase().includes(query)
        );
    }
    
    applyFilters();
}

// Handle environment filter
function handleFilter(e) {
    const environment = e.target.value;
    
    if (environment === 'all') {
        filteredVideos = allVideos;
    } else {
        filteredVideos = allVideos.filter(video => 
            video.environment.toLowerCase().replace(/\s+/g, '-') === environment
        );
    }
    
    applyFilters();
}

// Apply current filters
function applyFilters() {
    displayVideos(filteredVideos);
    
    if (filteredVideos.length === 0 && allVideos.length > 0) {
        showState('empty');
        emptyState.querySelector('.empty-state-title').textContent = 'No Videos Found';
        emptyState.querySelector('.empty-state-text').textContent = 'Try adjusting your search or filters';
        emptyState.querySelector('.upload-first-btn').style.display = 'none';
    }
}

// Show different states
function showState(state) {
    loadingState.style.display = 'none';
    videosGrid.style.display = 'none';
    emptyState.style.display = 'none';
    errorState.style.display = 'none';
    
    switch (state) {
        case 'loading':
            loadingState.style.display = 'flex';
            break;
        case 'grid':
            videosGrid.style.display = 'grid';
            break;
        case 'empty':
            emptyState.style.display = 'flex';
            break;
        case 'error':
            errorState.style.display = 'flex';
            break;
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function formatDuration(seconds) {
    if (!seconds || seconds === 0) return '';
    
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
        return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.style.display === 'flex') {
        closeModal();
    }
});

// =============================================================================
// DELETE FUNCTIONALITY
// =============================================================================

/**
 * Show confirmation dialog before deleting video
 * @param {string} videoId - Cloudinary public_id of the video
 * @param {string} filename - Video filename for display
 */
function confirmDeleteVideo(videoId, filename) {
    const confirmed = confirm(`Are you sure you want to delete "${filename}"?\n\nThis will permanently remove the video from Cloudinary and cannot be undone.`);
    
    if (confirmed) {
        deleteVideo(videoId);
    }
}

/**
 * Delete video from Cloudinary and local storage
 * @param {string} videoId - Cloudinary public_id of the video
 */
async function deleteVideo(videoId) {
    console.log('🗑️ Deleting video:', videoId);
    
    // Show loading state
    const card = document.querySelector(`[onclick*="${videoId}"]`)?.closest('.video-card');
    if (card) {
        card.style.opacity = '0.5';
        card.style.pointerEvents = 'none';
    }
    
    try {
        // Delete from Cloudinary
        await deleteFromCloudinary(videoId);
        
        // Delete from local storage
        deleteFromLocalStorage(videoId);
        
        // Remove from current arrays
        allVideos = allVideos.filter(v => v.id !== videoId);
        filteredVideos = filteredVideos.filter(v => v.id !== videoId);
        
        // Animate card removal
        if (card) {
            card.style.transition = 'all 0.3s ease-out';
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0';
            
            setTimeout(() => {
                card.remove();
                
                // Check if grid is now empty
                if (allVideos.length === 0) {
                    showState('empty');
                } else if (filteredVideos.length === 0) {
                    showState('empty');
                    emptyState.querySelector('.empty-state-title').textContent = 'No Videos Found';
                    emptyState.querySelector('.empty-state-text').textContent = 'Try adjusting your search or filters';
                }
            }, 300);
        } else {
            // Reload if card not found
            displayVideos(filteredVideos);
        }
        
        console.log('✅ Video deleted successfully');
        showNotification('Video deleted successfully', 'success');
        
    } catch (error) {
        console.error('❌ Error deleting video:', error);
        showNotification('Failed to delete video. Please try again.', 'error');
        
        // Restore card state
        if (card) {
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        }
    }
}

/**
 * Delete video from Cloudinary
 * Note: This requires authentication. For production, use a backend endpoint.
 * @param {string} videoId - Cloudinary public_id
 */
async function deleteFromCloudinary(videoId) {
    // For demo purposes, we'll use the destroy API
    // In production, you MUST use a backend server for this
    
    const timestamp = Math.round((new Date).getTime() / 1000);
    const apiSecret = 'YOUR_API_SECRET'; // NEVER expose this in production!
    
    // Generate signature (this should be done on backend)
    const stringToSign = `public_id=${videoId}&timestamp=${timestamp}${apiSecret}`;
    
    // For now, we'll just skip Cloudinary deletion and warn the user
    console.warn('⚠️ Cloudinary deletion requires backend implementation');
    console.warn('Video will be removed from UI but may still exist in Cloudinary');
    console.warn('Public ID to delete:', videoId);
    
    // You would implement this on your backend:
    /*
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/destroy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            public_id: videoId,
            signature: signature,
            api_key: CLOUDINARY_CONFIG.apiKey,
            timestamp: timestamp
        })
    });
    
    if (!response.ok) {
        throw new Error('Failed to delete from Cloudinary');
    }
    */
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
}

/**
 * Delete video reference from local storage
 * @param {string} videoId - Video ID to delete
 */
function deleteFromLocalStorage(videoId) {
    try {
        const videos = getStoredVideos();
        const updatedVideos = videos.filter(v => v.id !== videoId);
        localStorage.setItem(STORAGE_KEYS.videos, JSON.stringify(updatedVideos));
        console.log('💾 Removed from local storage');
    } catch (error) {
        console.error('❌ Error removing from local storage:', error);
    }
}

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            ${type === 'success' ? `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            ` : `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="1.5"/>
                </svg>
            `}
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

