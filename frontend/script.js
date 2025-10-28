// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const toggleBtnCollapsed = document.getElementById('toggleBtnCollapsed');

// Sidebar Toggle Functionality
const toggleSidebar = () => {
    sidebar.classList.toggle('expanded');
    document.body.classList.toggle('sidebar-expanded');
};

toggleBtn.addEventListener('click', toggleSidebar);
toggleBtnCollapsed.addEventListener('click', toggleSidebar);

// Removed: Click outside to reset functionality
// Once environment is selected, user must complete upload or refresh page to start over

// Drag and Drop Functionality
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    // Don't show dragover effect if file already selected
    if (!uploadZone.classList.contains('file-selected')) {
    uploadZone.classList.add('dragover');
    }
});

uploadZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    
    // Don't accept new files if one is already selected
    if (uploadZone.classList.contains('file-selected')) {
        return;
    }
    
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// Click to upload
uploadZone.addEventListener('click', (e) => {
    // Don't open file dialog if a file is already selected
    if (uploadZone.classList.contains('file-selected')) {
        return;
    }
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// Global variables
let selectedFile = null;
let selectedEnvironment = null;

// File handling function
function handleFiles(files) {
    const videoFiles = Array.from(files).filter(file => 
        file.type.startsWith('video/')
    );
    
    if (videoFiles.length === 0) {
        alert('Please select video files only.');
        return;
    }
    
    // Store the first video file
    selectedFile = videoFiles[0];
    
    // Show file selected state
    showFileSelected(selectedFile);
}

// Show file selected state with filename
function showFileSelected(file) {
    const originalContent = uploadZone.querySelector('.upload-content');
    
    // Mark upload zone as having a file selected
    uploadZone.classList.add('file-selected');
    
    const fileSelectedContent = document.createElement('div');
    fileSelectedContent.className = 'upload-content';
    fileSelectedContent.innerHTML = `
        <div class="video-thumbnail-container" id="thumbnailContainer">
            <div class="thumbnail-loading">
                <div class="loading-spinner"></div>
            </div>
        </div>
        <p class="file-name-small">${file.name}</p>
        <button class="select-environment-btn" id="selectEnvironmentBtn">Select Environment</button>
    `;
    
    uploadZone.replaceChild(fileSelectedContent, originalContent);
    
    // Generate video thumbnail
    generateVideoThumbnail(file);
    
    // Add event listener for Select Environment button
    const envBtn = document.getElementById('selectEnvironmentBtn');
    envBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering upload zone click
        showEnvironmentTiles();
    });
}

// Show environment selection tiles
function showEnvironmentTiles() {
    const uploadZone = document.getElementById('uploadZone');
    const selectBtn = document.getElementById('selectEnvironmentBtn');
    
    // Transform the button into a label instead of removing it
    if (selectBtn) {
        selectBtn.classList.add('transformed');
        selectBtn.textContent = 'Select Environment';
    }
    
    // Add expanded class to enlarge the box smoothly - everything happens in sync
    uploadZone.classList.add('expanded-for-tiles');
    
    // Create environment tiles container
    const tilesContainer = document.createElement('div');
    tilesContainer.className = 'environment-tiles-container';
    tilesContainer.id = 'environmentTiles';
    tilesContainer.style.opacity = '0';
    
    const environments = [
        { name: 'Jewellery Shop', icon: 'jewellery' },
        { name: 'Billing Counter', icon: 'billing' },
        { name: 'Petrol Pump', icon: 'petrol' },
        { name: 'Vending Machine', icon: 'vending' }
    ];
    
    tilesContainer.innerHTML = environments.map((env, index) => `
        <div class="environment-tile" data-environment="${env.name}" style="animation-delay: ${index * 0.1 + 0.3}s">
            <div class="tile-icon">
                ${getEnvironmentIcon(env.icon)}
            </div>
            <h3 class="tile-title">${env.name}</h3>
        </div>
    `).join('');
    
    // Add tiles with proper timing
    setTimeout(() => {
        uploadZone.querySelector('.upload-content').appendChild(tilesContainer);
        
        // Fade in tiles after a brief delay
        setTimeout(() => {
            tilesContainer.style.transition = 'opacity 0.5s ease';
            tilesContainer.style.opacity = '1';
        }, 50);
        
        // Add click handlers to tiles
        document.querySelectorAll('.environment-tile').forEach(tile => {
            tile.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering upload zone click
                const environment = tile.dataset.environment;
                handleEnvironmentSelection(environment);
            });
        });
    }, 300);
}

// Get icon SVG for each environment
function getEnvironmentIcon(type) {
    const icons = {
        jewellery: `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="iconGradient1" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#8B5CF6"/>
                        <stop offset="100%" stop-color="#06B6D4"/>
                    </linearGradient>
                </defs>
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#iconGradient1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="url(#iconGradient1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="url(#iconGradient1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `,
        billing: `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="iconGradient2" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#8B5CF6"/>
                        <stop offset="100%" stop-color="#06B6D4"/>
                    </linearGradient>
                </defs>
                <rect x="4" y="3" width="16" height="18" rx="2" stroke="url(#iconGradient2)" stroke-width="2"/>
                <line x1="8" y1="7" x2="16" y2="7" stroke="url(#iconGradient2)" stroke-width="2" stroke-linecap="round"/>
                <line x1="8" y1="11" x2="16" y2="11" stroke="url(#iconGradient2)" stroke-width="2" stroke-linecap="round"/>
                <line x1="8" y1="15" x2="12" y2="15" stroke="url(#iconGradient2)" stroke-width="2" stroke-linecap="round"/>
                <circle cx="16" cy="16" r="3" fill="url(#iconGradient2)" fill-opacity="0.2" stroke="url(#iconGradient2)" stroke-width="1.5"/>
                <path d="M15 16L15.5 16.5L17 15" stroke="url(#iconGradient2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
        `,
        petrol: `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="iconGradient3" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#8B5CF6"/>
                        <stop offset="100%" stop-color="#06B6D4"/>
                    </linearGradient>
                </defs>
                <path d="M3 6C3 4.89543 3.89543 4 5 4H13C14.1046 4 15 4.89543 15 6V20H3V6Z" stroke="url(#iconGradient3)" stroke-width="2"/>
                <path d="M15 10H17C18.1046 10 19 10.8954 19 12V15C19 16.1046 19.8954 17 21 17V17" stroke="url(#iconGradient3)" stroke-width="2" stroke-linecap="round"/>
                <rect x="6" y="8" width="6" height="4" rx="1" stroke="url(#iconGradient3)" stroke-width="2"/>
            </svg>
        `,
        vending: `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="iconGradient4" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#8B5CF6"/>
                        <stop offset="100%" stop-color="#06B6D4"/>
                    </linearGradient>
                </defs>
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="url(#iconGradient4)" stroke-width="2"/>
                <rect x="7" y="5" width="4" height="3" rx="1" stroke="url(#iconGradient4)" stroke-width="1.5"/>
                <rect x="13" y="5" width="4" height="3" rx="1" stroke="url(#iconGradient4)" stroke-width="1.5"/>
                <rect x="7" y="10" width="4" height="3" rx="1" stroke="url(#iconGradient4)" stroke-width="1.5"/>
                <rect x="13" y="10" width="4" height="3" rx="1" stroke="url(#iconGradient4)" stroke-width="1.5"/>
                <rect x="7" y="17" width="10" height="3" rx="1" stroke="url(#iconGradient4)" stroke-width="1.5"/>
            </svg>
        `
    };
    return icons[type] || '';
}

// Handle environment selection
function handleEnvironmentSelection(environment) {
    console.log('Environment selected:', environment);
    // Store selected environment
    selectedEnvironment = environment;
    
    // Hide tiles and show selected environment
    const uploadZone = document.getElementById('uploadZone');
    const tilesContainer = document.getElementById('environmentTiles');
    const selectEnvBtn = document.getElementById('selectEnvironmentBtn');
    
    // Remove tiles with fade out and scale animation
    if (tilesContainer) {
        tilesContainer.style.transition = 'all 0.4s ease-out';
        tilesContainer.style.opacity = '0';
        tilesContainer.style.transform = 'scale(0.95) translateY(-10px)';
        setTimeout(() => {
            tilesContainer.remove();
        }, 400);
    }
    
    // Fade out the "Select Environment" label
    if (selectEnvBtn) {
        selectEnvBtn.style.transition = 'all 0.3s ease';
        selectEnvBtn.style.opacity = '0';
        selectEnvBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            selectEnvBtn.remove();
        }, 300);
    }
    
    // Add transitioning class for smoother animation
    uploadZone.classList.add('transitioning');
    
    // Shrink the box back after tiles start fading
    setTimeout(() => {
        uploadZone.classList.remove('expanded-for-tiles');
    }, 200);
    
    // Remove transitioning class after animation completes
    setTimeout(() => {
        uploadZone.classList.remove('transitioning');
    }, 1000);
    
    // Add selected environment display with stagger
    setTimeout(() => {
        showSelectedEnvironment(environment);
    }, 600);
}

// Show selected environment beside video
function showSelectedEnvironment(environment) {
    const uploadContent = document.querySelector('.upload-content');
    
    // Create a container for video info and environment
    const videoInfoContainer = document.createElement('div');
    videoInfoContainer.className = 'video-info-container';
    videoInfoContainer.style.opacity = '0';
    videoInfoContainer.style.transform = 'translateY(20px)';
    videoInfoContainer.innerHTML = `
        <div class="selected-environment-badge">
            <div class="environment-icon-small">
                ${getEnvironmentIcon(getEnvironmentIconType(environment))}
            </div>
            <div class="environment-info">
                <span class="environment-label">Environment</span>
                <span class="environment-name">${environment}</span>
            </div>
        </div>
    `;
    
    // Insert after the file name
    const fileName = uploadContent.querySelector('.file-name-small');
    if (fileName) {
        fileName.after(videoInfoContainer);
    }
    
    // Animate in the badge
    setTimeout(() => {
        videoInfoContainer.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        videoInfoContainer.style.opacity = '1';
        videoInfoContainer.style.transform = 'translateY(0)';
    }, 50);
    
    // Add Upload Video button with delay
    const uploadButton = document.createElement('button');
    uploadButton.className = 'upload-video-btn';
    uploadButton.id = 'uploadVideoBtn';
    uploadButton.innerHTML = 'Upload Video';
    uploadButton.style.opacity = '0';
    uploadButton.style.transform = 'translateY(20px) scale(0.95)';
    
    uploadButton.addEventListener('click', (e) => {
        e.stopPropagation();
        handleVideoUpload();
    });
    
    uploadContent.appendChild(uploadButton);
    
    // Animate in the button with delay
    setTimeout(() => {
        uploadButton.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        uploadButton.style.opacity = '1';
        uploadButton.style.transform = 'translateY(0) scale(1)';
    }, 250);
}

// Helper to get icon type from environment name
function getEnvironmentIconType(environmentName) {
    const mapping = {
        'Jewellery Shop': 'jewellery',
        'Billing Counter': 'billing',
        'Petrol Pump': 'petrol',
        'Vending Machine': 'vending'
    };
    return mapping[environmentName] || 'jewellery';
}

// Handle video upload
function handleVideoUpload() {
    console.log('Uploading video:', selectedFile);
    console.log('Selected environment:', selectedEnvironment);
    
    // Start upload animation
    startUploadAnimation();
    
    // Upload to Cloudinary
    uploadToCloudinary(selectedFile, selectedEnvironment);
}

// Upload video to Cloudinary with real-time progress
function uploadToCloudinary(file, environment) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', CLOUDINARY_CONFIG.folder);
    
    // Add metadata as tags and context
    formData.append('tags', `sentinel,${environment.toLowerCase().replace(/\s+/g, '-')}`);
    formData.append('context', `environment=${environment}|uploadDate=${new Date().toISOString()}`);
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`;
    const xhr = new XMLHttpRequest();
    
    // Track real upload progress
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percentage = (e.loaded / e.total) * 100;
            updateRealProgress(percentage);
        }
    });
    
    // Handle successful upload
    xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            console.log('✅ Upload successful:', response);
            
            // Save minimal reference locally (full data comes from Cloudinary)
            saveVideoReference({
                id: response.public_id,
                url: response.secure_url,
                filename: file.name,
                environment: environment,
                uploadDate: new Date().toISOString()
            });
            
            setTimeout(() => {
                updateRealProgress(100);
                setTimeout(() => showUploadSuccess(), 500);
            }, 500);
        } else {
            console.error('❌ Upload failed:', xhr.statusText);
            showUploadError('Upload failed. Please try again.');
        }
    });
    
    xhr.addEventListener('error', () => {
        console.error('❌ Network error');
        showUploadError('Network error. Please check your connection.');
    });
    
    xhr.addEventListener('abort', () => {
        console.log('⚠️ Upload aborted');
        showUploadError('Upload was cancelled.');
    });
    
    xhr.open('POST', cloudinaryUrl);
    xhr.send(formData);
}

// Update progress bar with real upload percentage (smooth animation)
function updateRealProgress(percentage) {
    const progressCircle = document.getElementById('progressCircle');
    const percentageNumber = document.getElementById('percentageNumber');
    
    if (!progressCircle || !percentageNumber) return;
    
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    // Add smooth transition if not already set
    if (!progressCircle.style.transition) {
        progressCircle.style.transition = 'stroke-dashoffset 0.5s ease-out';
    }
    
    progressCircle.style.strokeDashoffset = offset;
    
    // Animate number change smoothly
    animateNumberChange(percentageNumber, percentage);
}

// Store animation interval to prevent overlaps
let numberAnimationInterval = null;

// Animate number change smoothly
function animateNumberChange(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const difference = targetValue - currentValue;
    
    // If difference is small, just update directly
    if (Math.abs(difference) < 1) {
        element.textContent = Math.floor(targetValue);
        return;
    }
    
    // Clear any existing animation
    if (numberAnimationInterval) {
        clearInterval(numberAnimationInterval);
    }
    
    const duration = 300; // ms
    const steps = Math.min(Math.abs(difference), 20); // Adaptive steps
    const stepValue = difference / steps;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    numberAnimationInterval = setInterval(() => {
        currentStep++;
        const newValue = currentValue + (stepValue * currentStep);
        element.textContent = Math.floor(newValue);
        
        if (currentStep >= steps) {
            clearInterval(numberAnimationInterval);
            numberAnimationInterval = null;
            element.textContent = Math.floor(targetValue);
        }
    }, stepDuration);
}

// Save video reference to local storage
function saveVideoReference(videoData) {
    try {
        const videos = getStoredVideos();
        videos.unshift(videoData);
        localStorage.setItem(STORAGE_KEYS.videos, JSON.stringify(videos));
        console.log('💾 Video reference saved');
    } catch (error) {
        console.error('❌ Error saving video reference:', error);
    }
}

// Get stored video references
function getStoredVideos() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.videos);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('❌ Error retrieving videos:', error);
        return [];
    }
}

// Show error message when upload fails
function showUploadError(message) {
    const uploadZone = document.getElementById('uploadZone');
    const uploadContent = uploadZone.querySelector('.upload-content');
    
    uploadContent.style.transition = 'opacity 0.3s ease';
    uploadContent.style.opacity = '0';
    
    setTimeout(() => {
        uploadContent.innerHTML = `
            <div class="upload-error-container">
                <div class="error-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2" fill="none"/>
                        <path d="M12 8V12" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="12" cy="16" r="0.5" fill="#ef4444" stroke="#ef4444" stroke-width="1.5"/>
                    </svg>
                </div>
                <h3 class="error-title">Upload Failed</h3>
                <p class="error-message">${message}</p>
                <button class="retry-upload-btn" id="retryUploadBtn">Try Again</button>
            </div>
        `;
        uploadContent.style.opacity = '1';
        
        document.getElementById('retryUploadBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            resetUploadZone();
        });
    }, 300);
}

// Start upload animation with circular progress
function startUploadAnimation() {
    const uploadZone = document.getElementById('uploadZone');
    const uploadContent = uploadZone.querySelector('.upload-content');
    
    // Fade out current content
    uploadContent.style.transition = 'opacity 0.4s ease';
    uploadContent.style.opacity = '0';
    
    setTimeout(() => {
        // Clear content and create circular progress indicator
        uploadContent.innerHTML = '';
        
        // Create circular progress container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'circular-progress-container';
        progressContainer.innerHTML = `
            <div class="circular-progress-wrapper">
                <svg class="circular-progress-svg" viewBox="0 0 200 200">
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#8B5CF6"/>
                            <stop offset="100%" stop-color="#06B6D4"/>
                        </linearGradient>
                    </defs>
                    <circle class="progress-bg" cx="100" cy="100" r="80" />
                    <circle class="progress-bar" id="progressCircle" cx="100" cy="100" r="80" />
                </svg>
                <div class="upload-percentage-display">
                    <span class="percentage-number" id="percentageNumber">0</span>
                    <span class="percentage-symbol">%</span>
                </div>
            </div>
            <p class="upload-status-text">Uploading...</p>
        `;
        
        uploadContent.appendChild(progressContainer);
        
        // Initialize the progress circle
        const progressCircle = document.getElementById('progressCircle');
        if (progressCircle) {
            const radius = 80;
            const circumference = 2 * Math.PI * radius;
            progressCircle.style.strokeDasharray = circumference;
            progressCircle.style.strokeDashoffset = circumference;
            progressCircle.style.transition = 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        
        // Fade in the progress container
        uploadContent.style.opacity = '1';
        
        // Small delay before starting to ensure smooth start
        setTimeout(() => {
            updateRealProgress(0);
        }, 100);
    }, 400);
}

// Animate circular progress with natural, non-linear progress
function animateCircularProgress() {
    const progressCircle = document.getElementById('progressCircle');
    const percentageNumber = document.getElementById('percentageNumber');
    
    // Calculate circle circumference
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    
    // Set initial stroke dash
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = circumference;
    
    let progress = 0;
    let phase = 1; // 1: fast to 37%, 2: random to 93%, 3: finish to 100%
    let lastUpdate = Date.now();
    
    const updateInterval = 100; // Update every 100ms for smoother animation
    
    const progressInterval = setInterval(() => {
        const now = Date.now();
        const deltaTime = now - lastUpdate;
        lastUpdate = now;
        
        // Phase 1: Fast rise to 37% in 3 seconds
        if (phase === 1) {
            const increment = (37 / 3000) * deltaTime; // 37% in 3000ms
            progress += increment;
            
            if (progress >= 37) {
                progress = 37;
                phase = 2;
            }
        }
        // Phase 2: Random increments to 93% over 15 seconds
        else if (phase === 2) {
            // Random increment with occasional pauses for natural feel
            const randomChance = Math.random();
            if (randomChance > 0.3) { // 70% chance to increment
                const randomIncrement = Math.random() * 0.5 + 0.1; // 0.1-0.6% increment
                progress += randomIncrement;
            }
            // Occasional small decrements for realism (buffer fluctuation)
            else if (randomChance < 0.05) {
                progress -= Math.random() * 0.2;
            }
            
            if (progress >= 93) {
                progress = 93;
                phase = 3;
            }
        }
        // Phase 3: Quick finish to 100%
        else if (phase === 3) {
            const increment = (7 / 1000) * deltaTime; // 7% in 1000ms
            progress += increment;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                
                // Show completion
                setTimeout(() => {
                    showUploadComplete();
                }, 500);
            }
        }
        
        // Ensure progress doesn't go below current phase minimum
        if (phase === 2 && progress < 37) progress = 37;
        if (phase === 3 && progress < 93) progress = 93;
        
        // Update circular progress bar
        const offset = circumference - (progress / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        
        // Update percentage text
        percentageNumber.textContent = Math.floor(progress);
        
    }, updateInterval);
}

// Show upload complete state
function showUploadComplete() {
    const uploadContent = document.querySelector('.upload-content');
    const statusText = document.querySelector('.upload-status-text');
    
    if (statusText) {
        statusText.textContent = 'Upload Complete!';
        statusText.style.color = 'rgba(6, 182, 212, 1)';
    }
    
    // Wait a bit then show success message
    setTimeout(() => {
        uploadContent.style.transition = 'opacity 0.5s ease';
        uploadContent.style.opacity = '0';
        
        setTimeout(() => {
            showUploadSuccess();
        }, 500);
    }, 1500);
}

// Show success message
function showUploadSuccess() {
    const uploadZone = document.getElementById('uploadZone');
    const uploadContent = uploadZone.querySelector('.upload-content');
    
    uploadContent.innerHTML = `
        <div class="upload-success-container">
            <div class="success-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="successGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stop-color="#8B5CF6"/>
                            <stop offset="100%" stop-color="#06B6D4"/>
                        </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="10" stroke="url(#successGradient)" stroke-width="2" fill="none"/>
                    <path d="M8 12L11 15L16 9" stroke="url(#successGradient)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h3 class="success-title">Video Uploaded Successfully!</h3>
            <p class="success-subtitle">Your video has been saved to Cloudinary</p>
            <div class="success-actions">
                <button class="view-uploads-btn" id="viewUploadsBtn">View Uploads</button>
                <button class="upload-another-btn" id="uploadAnotherBtn">Upload Another</button>
            </div>
        </div>
    `;
    
    uploadContent.style.opacity = '1';
    
    // Add event listeners to action buttons
    const viewUploadsBtn = document.getElementById('viewUploadsBtn');
    const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
    
    viewUploadsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = 'uploads.html';
    });
    
    uploadAnotherBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUploadZone();
    });
}

// Generate thumbnail from video file
function generateVideoThumbnail(file) {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    video.onloadedmetadata = function() {
        // Seek to 1 second to get a better thumbnail
        video.currentTime = Math.min(1, video.duration / 2);
    };
    
    video.onseeked = function() {
        // Set canvas dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to image
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        // Update thumbnail container with actual thumbnail
        const thumbnailContainer = document.getElementById('thumbnailContainer');
        if (thumbnailContainer) {
            thumbnailContainer.innerHTML = `
                <img src="${thumbnailUrl}" alt="Video thumbnail" class="video-thumbnail">
                <div class="play-icon-overlay">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="playGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#8B5CF6"/>
                                <stop offset="100%" stop-color="#06B6D4"/>
                            </linearGradient>
                        </defs>
                        <circle cx="12" cy="12" r="10" fill="rgba(0, 0, 0, 0.6)" stroke="url(#playGradient)" stroke-width="2"/>
                        <path d="M10 8L16 12L10 16V8Z" fill="url(#playGradient)"/>
                    </svg>
                </div>
            `;
        }
        
        // Clean up
        URL.revokeObjectURL(video.src);
    };
    
    video.onerror = function() {
        // If thumbnail generation fails, show default icon
        const thumbnailContainer = document.getElementById('thumbnailContainer');
        if (thumbnailContainer) {
            thumbnailContainer.innerHTML = `
                <div class="thumbnail-error">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="errorGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#8B5CF6"/>
                                <stop offset="100%" stop-color="#06B6D4"/>
                            </linearGradient>
                        </defs>
                        <rect x="2" y="6" width="14" height="12" rx="2" stroke="url(#errorGradient)" stroke-width="2"/>
                        <circle cx="9" cy="12" r="2.5" stroke="url(#errorGradient)" stroke-width="1.5"/>
                        <path d="M16 9.5L21 7V17L16 14.5" stroke="url(#errorGradient)" stroke-width="2" fill="url(#errorGradient)" fill-opacity="0.2"/>
                    </svg>
                </div>
            `;
        }
        URL.revokeObjectURL(video.src);
    };
    
    // Load video file
    video.src = URL.createObjectURL(file);
}


function resetUploadZone() {
    // Clear selected file and environment
    selectedFile = null;
    selectedEnvironment = null;
    
    // Remove classes
    uploadZone.classList.remove('file-selected');
    uploadZone.classList.remove('expanded-for-tiles');
    
    const currentContent = uploadZone.querySelector('.upload-content');
    const originalContent = document.createElement('div');
    originalContent.className = 'upload-content';
    originalContent.innerHTML = `
        <div class="upload-icon">
            <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="uploadGradient2" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#8B5CF6"/>
                        <stop offset="100%" stop-color="#06B6D4"/>
                    </linearGradient>
                </defs>
                <rect x="2" y="6" width="14" height="12" rx="2" stroke="url(#uploadGradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="9" cy="12" r="2.5" stroke="url(#uploadGradient2)" stroke-width="1.5"/>
                <path d="M16 9.5L21 7V17L16 14.5" stroke="url(#uploadGradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="url(#uploadGradient2)" fill-opacity="0.2"/>
            </svg>
        </div>
        <h3 class="upload-title">Drag & Drop your video here</h3>
        <p class="upload-subtitle">or click to browse files</p>
        <div class="upload-formats">
            <span>Supports: MP4, MOV, AVI, MKV</span>
        </div>
    `;
    
    uploadZone.replaceChild(originalContent, currentContent);
    fileInput.value = '';
}


// Fire spark animation from bottom
function createFireSpark() {
    const spark = document.createElement('div');
    
    // Random spark properties
    const size = Math.random() * 3 + 2; // 2-5px
    const startX = Math.random() * window.innerWidth;
    const drift = (Math.random() - 0.5) * 100; // Random horizontal drift
    const riseDistance = 300 + Math.random() * 400; // How high it rises
    const duration = 2000 + Math.random() * 2000; // 2-4 seconds
    
    // Use gradient colors
    const colors = [
        'rgba(139, 92, 246, 0.9)',
        'rgba(6, 182, 212, 0.9)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(6, 182, 212, 0.8)'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    spark.style.position = 'fixed';
    spark.style.width = size + 'px';
    spark.style.height = size + 'px';
    spark.style.background = randomColor;
    spark.style.borderRadius = '50%';
    spark.style.pointerEvents = 'none';
    spark.style.zIndex = '1';
    spark.style.left = startX + 'px';
    spark.style.bottom = '-10px';
    spark.style.boxShadow = `0 0 ${size * 2}px ${randomColor}`;
    spark.style.filter = 'blur(0.5px)';
    
    document.body.appendChild(spark);
    
    // Animate spark rising with drift
    const animation = spark.animate([
        { 
            transform: 'translate(0px, 0px) scale(1)',
            opacity: 1,
            filter: 'blur(0.5px)'
        },
        { 
            transform: `translate(${drift}px, -${riseDistance * 0.5}px) scale(0.8)`,
            opacity: 0.8,
            filter: 'blur(1px)',
            offset: 0.5
        },
        { 
            transform: `translate(${drift * 1.5}px, -${riseDistance}px) scale(0.3)`,
            opacity: 0,
            filter: 'blur(2px)'
        }
    ], {
        duration: duration,
        easing: 'ease-out'
    });
    
    animation.onfinish = () => {
        spark.remove();
    };
}

// Create sparks continuously with varying frequency
function startFireSparks() {
    const createMultipleSparks = () => {
        const count = Math.floor(Math.random() * 5) + 3; // 3-7 sparks at a time
        for (let i = 0; i < count; i++) {
            setTimeout(() => createFireSpark(), Math.random() * 300);
        }
    };
    
    // Initial burst
    createMultipleSparks();
    
    // Continue creating sparks at varying intervals (more frequent)
    setInterval(createMultipleSparks, 250 + Math.random() * 200);
}

// Start the fire spark animation
startFireSparks();


