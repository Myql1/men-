// WiFiPay - Main JavaScript File
// Comprehensive functionality for WiFi payment system

// Global state management
const WiFiPay = {
    selectedPackage: null,
    paymentMethod: null,
    phoneNumber: null,
    voucherCode: null,
    paymentStatus: 'pending',
    
    // API configurations
    apiEndpoints: {
        airtelMoney: 'https://api.airtelmoney.com/v1/payments',
        mtnMoney: 'https://api.mtnmoney.com/v1/payments',
        africaTalking: 'https://api.africastalking.com/version1/messaging',
        omadaController: 'https://omada.wifipay.com/api/v1'
    },
    
    // Mock data for demonstration
    mockData: {
        payments: [
            {
                id: 'WFP001',
                phone: '+256770123456',
                package: '1 Day',
                amount: 5000,
                method: 'MTN Mobile Money',
                status: 'success',
                time: '2025-01-03 14:30:25',
                voucher: 'WFP-7X9K-2M4N'
            },
            {
                id: 'WFP002',
                phone: '+256701234567',
                package: '1 Hour',
                amount: 1000,
                method: 'Airtel Money',
                status: 'success',
                time: '2025-01-03 13:15:10',
                voucher: 'WFP-3K8L-9P2Q'
            },
            {
                id: 'WFP003',
                phone: '+256712345678',
                package: '1 Week',
                amount: 25000,
                method: 'MTN Mobile Money',
                status: 'pending',
                time: '2025-01-03 12:45:33',
                voucher: null
            }
        ],
        
        routers: [
            {
                id: 'RT001',
                name: 'Kampala Road Main',
                location: 'Kampala Road, Shop 12',
                ip: '192.168.1.100',
                status: 'online',
                clients: 23,
                model: 'TP-Link Omada'
            },
            {
                id: 'RT002',
                name: 'Garden City Mall',
                location: 'Garden City, Level 2',
                ip: '192.168.1.101',
                status: 'online',
                clients: 15,
                model: 'TP-Link Omada'
            },
            {
                id: 'RT003',
                name: 'Acacia Mall',
                location: 'Acacia Mall, Ground Floor',
                ip: '192.168.1.102',
                status: 'offline',
                clients: 0,
                model: 'TP-Link Omada'
            }
        ],
        
        vouchers: [
            { code: 'WFP-7X9K-2M4N', package: '1 Day', status: 'active', expiry: '23:59:45' },
            { code: 'WFP-3K8L-9P2Q', package: '1 Hour', status: 'used', expiry: '00:00:00' },
            { code: 'WFP-9M2N-5K7L', package: '1 Week', status: 'active', expiry: '6d 23:45:12' }
        ]
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeAnimations();
    
    // Page-specific initialization
    const currentPage = getCurrentPage();
    switch(currentPage) {
        case 'index':
            initializeHomePage();
            break;
        case 'admin':
            initializeAdminPage();
            break;
        case 'status':
            initializeStatusPage();
            break;
    }
});

// Utility Functions
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('admin.html')) return 'admin';
    if (path.includes('status.html')) return 'status';
    return 'index';
}

function initializeApp() {
    // Create floating particles
    createFloatingParticles();
    
    // Initialize scroll reveal animations
    initializeScrollReveal();
    
    // Setup phone number validation
    setupPhoneValidation();
}

function createFloatingParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

function initializeScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => observer.observe(el));
}

function setupPhoneValidation() {
    const phoneInput = document.getElementById('phone-number');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function(e) {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length > 9) {
            e.target.value = value.slice(0, 9);
        } else {
            e.target.value = value;
        }
        
        // Update pay button state
        updatePayButtonState();
    });
}

function updatePayButtonState() {
    const payButton = document.getElementById('pay-button');
    const phoneInput = document.getElementById('phone-number');
    
    if (!payButton || !phoneInput) return;
    
    const phoneValid = phoneInput.value.length === 9;
    const packageSelected = WiFiPay.selectedPackage !== null;
    const paymentMethodSelected = WiFiPay.paymentMethod !== null;
    
    if (phoneValid && packageSelected && paymentMethodSelected) {
        payButton.disabled = false;
        payButton.textContent = `Pay UGX ${WiFiPay.selectedPackage?.price?.toLocaleString()}`;
        payButton.classList.add('bg-orange-500', 'hover:bg-orange-600');
    } else {
        payButton.disabled = true;
        payButton.textContent = 'Select Package & Payment Method';
        payButton.classList.remove('bg-orange-500', 'hover:bg-orange-600');
    }
}

// Home Page Functions
function initializeHomePage() {
    setupPackageSelection();
    setupPaymentMethods();
    setupPaymentProcessing();
}

function setupPackageSelection() {
    const packageCards = document.querySelectorAll('.package-card');
    
    packageCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove previous selection
            packageCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection to clicked card
            this.classList.add('selected');
            
            // Update selected package
            WiFiPay.selectedPackage = {
                type: this.dataset.package,
                price: parseInt(this.dataset.price),
                name: this.querySelector('h4').textContent
            };
            
            // Update selected package display
            updateSelectedPackageDisplay();
            updatePayButtonState();
            
            // Scroll to payment form
            document.getElementById('payment-form').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function updateSelectedPackageDisplay() {
    const selectedPackageDiv = document.getElementById('selected-package');
    if (!selectedPackageDiv || !WiFiPay.selectedPackage) return;
    
    selectedPackageDiv.classList.remove('hidden');
    document.getElementById('package-name').textContent = WiFiPay.selectedPackage.name;
    document.getElementById('package-price').textContent = `UGX ${WiFiPay.selectedPackage.price.toLocaleString()}`;
    
    // Set duration based on package type
    const durations = {
        '1hour': 'Valid for 1 hour',
        '1day': 'Valid for 24 hours',
        '1week': 'Valid for 7 days',
        '1month': 'Valid for 30 days'
    };
    document.getElementById('package-duration').textContent = durations[WiFiPay.selectedPackage.type];
}

function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Remove previous selection
            paymentMethods.forEach(m => m.classList.remove('border-orange-500', 'bg-orange-50'));
            
            // Add selection to clicked method
            this.classList.add('border-orange-500', 'bg-orange-50');
            
            // Update payment method
            WiFiPay.paymentMethod = this.dataset.method;
            updatePayButtonState();
        });
    });
}

function setupPaymentProcessing() {
    const payButton = document.getElementById('pay-button');
    if (!payButton) return;
    
    payButton.addEventListener('click', processPayment);
}

async function processPayment() {
    const phoneInput = document.getElementById('phone-number');
    const phoneNumber = phoneInput.value;
    
    if (!WiFiPay.selectedPackage || !WiFiPay.paymentMethod || !phoneNumber) {
        showNotification('Please complete all fields', 'error');
        return;
    }
    
    // Show payment progress
    showPaymentProgress();
    
    // Simulate payment processing
    try {
        // Step 1: Initiate mobile money payment
        const paymentResult = await initiateMobileMoneyPayment();
        
        if (paymentResult.success) {
            // Step 2: Generate WiFi voucher
            const voucherResult = await generateWiFiVoucher();
            
            if (voucherResult.success) {
                WiFiPay.voucherCode = voucherResult.voucherCode;
                
                // Step 3: Send SMS with voucher
                const smsResult = await sendVoucherSMS();
                
                if (smsResult.success) {
                    // Payment successful
                    WiFiPay.paymentStatus = 'success';
                    hidePaymentProgress();
                    showSuccessModal();
                } else {
                    throw new Error('SMS delivery failed');
                }
            } else {
                throw new Error('Voucher generation failed');
            }
        } else {
            throw new Error('Payment initiation failed');
        }
    } catch (error) {
        console.error('Payment error:', error);
        hidePaymentProgress();
        showNotification('Payment failed. Please try again.', 'error');
    }
}

function showPaymentProgress() {
    const progressDiv = document.getElementById('payment-progress');
    if (progressDiv) {
        progressDiv.classList.remove('hidden');
    }
}

function hidePaymentProgress() {
    const progressDiv = document.getElementById('payment-progress');
    if (progressDiv) {
        progressDiv.classList.add('hidden');
    }
}

// Mock payment processing functions
async function initiateMobileMoneyPayment() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 90% success rate
    const success = Math.random() > 0.1;
    
    return {
        success: success,
        transactionId: success ? 'TXN' + Date.now() : null,
        message: success ? 'Payment initiated successfully' : 'Payment failed'
    };
}

async function generateWiFiVoucher() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate random voucher code
    const voucherCode = 'WFP-' + generateRandomCode(4) + '-' + generateRandomCode(4);
    
    return {
        success: true,
        voucherCode: voucherCode,
        message: 'Voucher generated successfully'
    };
}

function generateRandomCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function sendVoucherSMS() {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
        success: true,
        messageId: 'SMS' + Date.now(),
        message: 'SMS sent successfully'
    };
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Generate QR code
        generateQRCode(WiFiPay.voucherCode);
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function generateQRCode(voucherCode) {
    const qrContainer = document.getElementById('qr-code');
    if (qrContainer) {
        // Simulate QR code generation
        qrContainer.innerHTML = `
            <div class="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                <div class="text-center">
                    <div class="w-16 h-16 mx-auto mb-2 bg-orange-300 rounded"></div>
                    <p class="text-xs text-orange-800 font-mono">${voucherCode}</p>
                </div>
            </div>
        `;
    }
}

// Admin Page Functions
function initializeAdminPage() {
    setupSidebarNavigation();
    initializeCharts();
    populatePaymentTable();
    populateRouterGrid();
    populateVoucherStats();
    startCounterAnimations();
}

function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.section-content');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(s => s.classList.add('hidden'));
            
            // Show target section
            const targetId = this.getAttribute('href').substring(1) + '-section';
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }
        });
    });
}

function initializeCharts() {
    // Revenue Trend Chart
    const revenueChart = echarts.init(document.getElementById('revenue-chart'));
    const revenueOption = {
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: { type: 'value' },
        series: [{
            data: [120000, 200000, 150000, 300000, 250000, 400000, 350000],
            type: 'line',
            smooth: true,
            lineStyle: { color: '#FF6B35' },
            itemStyle: { color: '#FF6B35' },
            areaStyle: { color: 'rgba(255, 107, 53, 0.1)' }
        }]
    };
    revenueChart.setOption(revenueOption);
    
    // Payment Methods Chart
    const paymentChart = echarts.init(document.getElementById('payment-methods-chart'));
    const paymentOption = {
        tooltip: { trigger: 'item' },
        series: [{
            type: 'pie',
            radius: '70%',
            data: [
                { value: 65, name: 'MTN Mobile Money', itemStyle: { color: '#FF6B35' } },
                { value: 35, name: 'Airtel Money', itemStyle: { color: '#0D4F4C' } }
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    paymentChart.setOption(paymentOption);
}

function populatePaymentTable() {
    const tableBody = document.getElementById('payments-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    WiFiPay.mockData.payments.forEach(payment => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50';
        
        const statusBadge = payment.status === 'success' ? 'status-success' : 
                           payment.status === 'pending' ? 'status-pending' : 'status-failed';
        
        row.innerHTML = `
            <td class="py-3 px-4 font-mono text-sm">${payment.id}</td>
            <td class="py-3 px-4">${payment.phone}</td>
            <td class="py-3 px-4">${payment.package}</td>
            <td class="py-3 px-4 font-semibold">UGX ${payment.amount.toLocaleString()}</td>
            <td class="py-3 px-4">${payment.method}</td>
            <td class="py-3 px-4">
                <span class="status-badge ${statusBadge}">${payment.status}</span>
            </td>
            <td class="py-3 px-4 text-sm text-gray-600">${payment.time}</td>
            <td class="py-3 px-4">
                <button class="text-orange-600 hover:text-orange-800 font-semibold">View</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function populateRouterGrid() {
    const routerGrid = document.getElementById('routers-grid');
    if (!routerGrid) return;
    
    routerGrid.innerHTML = '';
    
    WiFiPay.mockData.routers.forEach(router => {
        const statusColor = router.status === 'online' ? 'text-green-600' : 'text-red-600';
        const statusBg = router.status === 'online' ? 'bg-green-100' : 'bg-red-100';
        
        const routerCard = document.createElement('div');
        routerCard.className = 'dashboard-card rounded-xl p-6';
        routerCard.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h4 class="font-semibold text-gray-800">${router.name}</h4>
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${statusBg} ${statusColor}">
                    ${router.status}
                </span>
            </div>
            <p class="text-gray-600 text-sm mb-4">${router.location}</p>
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600 text-sm">IP Address</span>
                    <span class="font-mono text-sm">${router.ip}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 text-sm">Active Clients</span>
                    <span class="font-semibold">${router.clients}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 text-sm">Model</span>
                    <span class="text-sm">${router.model}</span>
                </div>
            </div>
            <div class="mt-4 flex space-x-2">
                <button class="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                    Configure
                </button>
                <button class="flex-1 border border-gray-300 hover:border-orange-400 text-gray-700 hover:text-orange-600 py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                    Monitor
                </button>
            </div>
        `;
        
        routerGrid.appendChild(routerCard);
    });
}

function populateVoucherStats() {
    const recentVouchersDiv = document.getElementById('recent-vouchers');
    if (!recentVouchersDiv) return;
    
    recentVouchersDiv.innerHTML = '';
    
    WiFiPay.mockData.vouchers.forEach(voucher => {
        const voucherDiv = document.createElement('div');
        voucherDiv.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg';
        
        const statusColor = voucher.status === 'active' ? 'text-green-600' : 
                           voucher.status === 'used' ? 'text-blue-600' : 'text-red-600';
        
        voucherDiv.innerHTML = `
            <div>
                <div class="font-mono font-semibold text-sm">${voucher.code}</div>
                <div class="text-xs text-gray-600">${voucher.package}</div>
            </div>
            <div class="text-right">
                <div class="text-xs font-semibold ${statusColor}">${voucher.status}</div>
                <div class="text-xs text-gray-600">${voucher.expiry}</div>
            </div>
        `;
        
        recentVouchersDiv.appendChild(voucherDiv);
    });
}

function startCounterAnimations() {
    const counters = document.querySelectorAll('.animate-counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format number based on size
            if (target > 1000) {
                counter.textContent = Math.floor(current).toLocaleString();
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 16);
    });
}

// Status Page Functions
function initializeStatusPage() {
    startExpiryCountdown();
    generateStatusQRCode();
}

function startExpiryCountdown() {
    const timerElement = document.getElementById('expiry-timer');
    if (!timerElement) return;
    
    let hours = 23;
    let minutes = 59;
    let seconds = 45;
    
    const timer = setInterval(() => {
        seconds--;
        
        if (seconds < 0) {
            seconds = 59;
            minutes--;
        }
        
        if (minutes < 0) {
            minutes = 59;
            hours--;
        }
        
        if (hours < 0) {
            clearInterval(timer);
            timerElement.textContent = 'EXPIRED';
            timerElement.classList.add('text-red-600');
            return;
        }
        
        timerElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function generateStatusQRCode() {
    const qrContainer = document.getElementById('qr-code-display');
    if (!qrContainer) return;
    
    // Simulate QR code generation
    qrContainer.innerHTML = `
        <div class="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
            <div class="text-center">
                <div class="w-20 h-20 mx-auto mb-2 bg-orange-300 rounded flex items-center justify-center">
                    <svg class="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1zm0 0h2a1 1 0 001-1V4a1 1 0 00-1-1H5a1 1 0 00-1 1v3a1 1 0 001 1z"></path>
                    </svg>
                </div>
                <p class="text-xs text-orange-800 font-mono">WFP-7X9K-2M4N</p>
            </div>
        </div>
    `;
}

// Global Functions
function scrollToPackages() {
    document.getElementById('packages').scrollIntoView({ behavior: 'smooth' });
}

function showHowItWorks() {
    document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
}

function copyVoucherCode() {
    const voucherCode = document.getElementById('voucher-code');
    if (!voucherCode) return;
    
    const text = voucherCode.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Voucher code copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy voucher code', 'error');
    });
}

function resendSMS() {
    showNotification('SMS resent successfully!', 'success');
}

function downloadQRCode() {
    showNotification('QR code download started!', 'info');
}

function contactSupport() {
    showNotification('Redirecting to support...', 'info');
}

function showAddRouterModal() {
    const modal = document.getElementById('add-router-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeAddRouterModal() {
    const modal = document.getElementById('add-router-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-24 right-6 z-50 px-6 py-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300`;
    
    // Set notification style based on type
    const styles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-black',
        info: 'bg-blue-500 text-white'
    };
    
    notification.className += ` ${styles[type] || styles.info}`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function setupEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            showNotification('Mobile menu functionality coming soon!', 'info');
        });
    }
    
    // Voucher form submission
    const voucherForm = document.getElementById('voucher-form');
    if (voucherForm) {
        voucherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Vouchers generated successfully!', 'success');
        });
    }
    
    // Add router form submission
    const addRouterForm = document.getElementById('add-router-form');
    if (addRouterForm) {
        addRouterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Router added successfully!', 'success');
            closeAddRouterModal();
        });
    }
}

function initializeAnimations() {
    // Initialize text splitting for animations
    if (typeof Splitting !== 'undefined') {
        Splitting();
    }
    
    // Animate elements on scroll
    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Observe elements with reveal class
    document.querySelectorAll('.reveal').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        animateOnScroll.observe(el);
    });
}

// Export functions for global access
window.WiFiPay = WiFiPay;
window.scrollToPackages = scrollToPackages;
window.showHowItWorks = showHowItWorks;
window.copyVoucherCode = copyVoucherCode;
window.resendSMS = resendSMS;
window.downloadQRCode = downloadQRCode;
window.contactSupport = contactSupport;
window.showAddRouterModal = showAddRouterModal;
window.closeAddRouterModal = closeAddRouterModal;
window.closeSuccessModal = closeSuccessModal;