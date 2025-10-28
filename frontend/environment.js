/* =============================================================================
   ENVIRONMENT PAGE JAVASCRIPT
   =============================================================================
   Handles displaying environments and their Standard Operating Procedures
============================================================================= */

// Environment Data with SOPs
const environmentsData = [
    {
        id: 'billing-counter',
        name: 'Billing Counter',
        description: 'Standard checkout and payment processing area',
        icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z" stroke="url(#grad1)" stroke-width="2"/>
            <path d="M2 9H22M7 15H7.01M12 15H12.01" stroke="url(#grad1)" stroke-width="2" stroke-linecap="round"/>
            <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#8B5CF6"/>
                    <stop offset="1" stop-color="#06B6D4"/>
                </linearGradient>
            </defs>
        </svg>`,
        totalSteps: 6,
        avgDuration: '3-5 min',
        sop: [
            {
                title: 'Customer Approaches Billing Counter',
                description: 'Customer arrives at the billing counter with items. Employee greets the customer and prepares to process the transaction.'
            },
            {
                title: 'Employee Scans Items',
                description: 'Employee scans each item\'s barcode. System displays item details and price. All items are verified and added to the transaction.'
            },
            {
                title: 'Bill Generation',
                description: 'System calculates total amount including taxes and discounts. Final bill is displayed on screen and presented to customer.'
            },
            {
                title: 'Customer Makes Payment',
                description: 'Customer pays via cash, card, or digital payment. Employee processes payment and verifies transaction completion.'
            },
            {
                title: 'Receipt & Item Handover',
                description: 'Receipt is printed and handed to customer. Employee carefully hands over all purchased items to customer.'
            },
            {
                title: 'Customer Leaves',
                description: 'Customer collects items and receipt, thanks the employee, and exits the billing area.'
            }
        ]
    },
    {
        id: 'jewellery-shop',
        name: 'Jewellery Shop',
        description: 'High-security retail environment for valuable items',
        icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#grad2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="url(#grad2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
                <linearGradient id="grad2" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#8B5CF6"/>
                    <stop offset="1" stop-color="#06B6D4"/>
                </linearGradient>
            </defs>
        </svg>`,
        totalSteps: 3,
        avgDuration: '5-8 min',
        sop: [
            {
                title: 'Customer Enters Shop',
                description: 'Customer enters the jewellery shop premises. Initial security check is performed at the entrance. Customer is acknowledged by the security personnel.'
            },
            {
                title: 'Employee Greets',
                description: 'Employee warmly greets the customer and welcomes them to the shop. Staff asks about customer preferences and requirements. Customer is escorted to the appropriate display area.'
            },
            {
                title: 'Item Inspection',
                description: 'Customer inspects jewellery items through secured glass displays. Staff assists by retrieving selected items for closer examination. Customer examines quality, design, and craftsmanship with staff guidance.'
            }
        ]
    },
    {
        id: 'petrol-pump',
        name: 'Petrol Pump',
        description: 'Fuel dispensing and vehicle service station',
        icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 3H14V20H4V3Z" stroke="url(#grad3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 12H14M14 7H18L20 9V17C20 17.5304 19.7893 18.0391 19.4142 18.4142C19.0391 18.7893 18.5304 19 18 19H14M18 12V9" stroke="url(#grad3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="20" cy="7" r="1" fill="url(#grad3)"/>
            <defs>
                <linearGradient id="grad3" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#8B5CF6"/>
                    <stop offset="1" stop-color="#06B6D4"/>
                </linearGradient>
            </defs>
        </svg>`,
        totalSteps: 7,
        avgDuration: '5-7 min',
        sop: [
            {
                title: 'Vehicle Arrival',
                description: 'Vehicle enters the petrol pump premises and approaches the designated fuel dispenser. Attendant signals the driver to the appropriate pump.'
            },
            {
                title: 'Fuel Type Selection',
                description: 'Driver communicates fuel type (petrol/diesel) and quantity (full tank/specific amount). Attendant confirms selection and prepares the nozzle.'
            },
            {
                title: 'Vehicle Positioning',
                description: 'Vehicle is properly positioned next to the pump. Engine is turned off for safety. Fuel tank cap is opened.'
            },
            {
                title: 'Fuel Dispensing',
                description: 'Attendant inserts nozzle into fuel tank. Fuel is dispensed while monitoring the meter. Process continues until tank is full or requested amount is reached.'
            },
            {
                title: 'Nozzle Removal & Tank Closure',
                description: 'Nozzle is carefully removed and returned to pump. Fuel tank cap is securely closed. Any spills are immediately cleaned.'
            },
            {
                title: 'Payment Processing',
                description: 'Attendant informs total amount. Driver pays via cash, card, or digital payment. Receipt is issued upon request.'
            },
            {
                title: 'Vehicle Exit',
                description: 'Driver starts vehicle, verifies everything is secure, and exits the fuel station premises safely.'
            }
        ]
    },
    {
        id: 'vending-machine',
        name: 'Vending Machine',
        description: 'Automated self-service product dispenser',
        icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="2" width="14" height="20" rx="2" stroke="url(#grad4)" stroke-width="2"/>
            <path d="M9 6H15M9 10H15M9 14H15" stroke="url(#grad4)" stroke-width="2" stroke-linecap="round"/>
            <rect x="8" y="18" width="8" height="2" rx="1" fill="url(#grad4)"/>
            <defs>
                <linearGradient id="grad4" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#8B5CF6"/>
                    <stop offset="1" stop-color="#06B6D4"/>
                </linearGradient>
            </defs>
        </svg>`,
        totalSteps: 6,
        avgDuration: '1-2 min',
        sop: [
            {
                title: 'Customer Comes Near Vending Machine',
                description: 'Customer approaches the vending machine and stands in front of it. Customer views available products through the display window. Machine display shows "Ready" status and available items.'
            },
            {
                title: 'Presses Some Buttons',
                description: 'Customer browses products and presses buttons on the keypad to select desired item. Customer enters product code (e.g., A1, B3, C2) using the numerical/alphabetical buttons. Machine displays selected product and price.'
            },
            {
                title: 'Scans QR to Make Payment',
                description: 'Customer opens mobile payment app and scans the QR code displayed on the vending machine screen. Payment is processed digitally through UPI, PayTM, Google Pay, or other digital wallet. Machine confirms successful payment.'
            },
            {
                title: 'Product is Dispensed',
                description: 'Machine validates the payment and initiates dispensing mechanism. Product coil/pusher rotates and the selected item is released. Product drops down to the collection compartment at the bottom.'
            },
            {
                title: 'Collection',
                description: 'Customer opens the collection door/flap at the bottom of the machine. Customer retrieves the purchased product from the collection bin. Customer verifies they received the correct item.'
            },
            {
                title: 'Exit',
                description: 'Customer closes the collection door properly. Customer walks away from the vending machine with their product. Machine returns to "Ready" state for the next customer.'
            }
        ]
    }
];

// DOM Elements
const environmentsGrid = document.getElementById('environmentsGrid');
const environmentModal = document.getElementById('environmentModal');
const envModalOverlay = document.getElementById('envModalOverlay');
const envModalClose = document.getElementById('envModalClose');
const envModalBody = document.getElementById('envModalBody');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayEnvironments();
    setupEventListeners();
});

// Display all environments
function displayEnvironments() {
    environmentsGrid.innerHTML = '';
    
    environmentsData.forEach((env, index) => {
        const card = createEnvironmentCard(env, index);
        environmentsGrid.appendChild(card);
    });
}

// Create environment card
function createEnvironmentCard(env, index) {
    const card = document.createElement('div');
    card.className = 'environment-card';
    card.style.animationDelay = `${index * 0.1}s`;
    card.onclick = () => openEnvironmentModal(env);
    
    card.innerHTML = `
        <div class="environment-icon">
            ${env.icon}
        </div>
        <h3 class="environment-name">${env.name}</h3>
        <p class="environment-description">${env.description}</p>
        <div class="environment-stats">
            <div class="environment-stat">
                <span class="stat-label">Steps</span>
                <span class="stat-value">${env.totalSteps}</span>
            </div>
            <div class="environment-stat">
                <span class="stat-label">Duration</span>
                <span class="stat-value">${env.avgDuration}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Open environment detail modal
function openEnvironmentModal(env) {
    console.log('📋 Opening environment:', env.name);
    
    envModalBody.innerHTML = `
        <div class="modal-env-header">
            <div class="modal-env-icon">
                ${env.icon}
            </div>
            <div class="modal-env-info">
                <h2 class="modal-env-name">${env.name}</h2>
                <p class="modal-env-description">${env.description}</p>
            </div>
        </div>
        
        <div class="sop-section">
            <h3 class="sop-title">Standard Operating Procedure</h3>
            <div class="sop-steps">
                ${env.sop.map((step, index) => `
                    <div class="sop-step" style="animation-delay: ${index * 0.05}s">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">
                            <h4 class="step-title">${step.title}</h4>
                            <p class="step-description">${step.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    environmentModal.style.display = 'flex';
    adjustModalForSidebar();
}

// Close modal
function closeEnvironmentModal() {
    environmentModal.style.display = 'none';
}

// Setup event listeners
function setupEventListeners() {
    envModalOverlay.addEventListener('click', closeEnvironmentModal);
    envModalClose.addEventListener('click', closeEnvironmentModal);
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && environmentModal.style.display === 'flex') {
            closeEnvironmentModal();
        }
    });
}

// Adjust modal position based on sidebar width
function adjustModalForSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('expanded')) {
        environmentModal.style.left = '260px';
    } else {
        environmentModal.style.left = '80px';
    }
}

