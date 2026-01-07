// ==================== GLOBAL STATE ====================
let map;
let isTracking = false;
let currentTrack = [];
let trackPolyline = null;
let currentMarker = null;
let currentPosition = null;
let startTime = null;
let durationInterval = null;
let totalDistance = 0;
let poiMarkers = [];
let savedTracks = [];
let currentUser = null;
let currentView = 'map';
let userSubscription = 'free'; // free, explorer, pro

// Map layers
let currentMapLayer = null;
const mapLayers = {
    satellite: null,
    street: null,
    terrain: null,
    dark: null
};

// Demo places data
const demoPlaces = [
    {
        id: 1,
        name: 'كثبان ليوا',
        description: 'أكبر صحراء رملية في شبه الجزيرة العربية مع كثبان ذهبية خلابة',
        emoji: '🏜️',
        distance: 45.2,
        duration: 180,
        difficulty: 'متوسط',
        rating: 4.8,
        reviews: 124,
        tier: 'free',
        coordinates: [23.8859, 53.7656],
        images: ['🌅', '🏜️', '⛺']
    },
    {
        id: 2,
        name: 'جبل حفيت',
        description: 'ثاني أعلى قمة في الإمارات مع إطلالات بانورامية مذهلة',
        emoji: '⛰️',
        distance: 32.5,
        duration: 120,
        difficulty: 'سهل',
        rating: 4.9,
        reviews: 256,
        tier: 'free',
        coordinates: [24.0753, 55.7851],
        images: ['🏔️', '🌄', '🚗']
    },
    {
        id: 3,
        name: 'الوثبة الأحفورية',
        description: 'موقع أثري مذهل مع أحافير عمرها 7 ملايين سنة',
        emoji: '🦕',
        distance: 28.3,
        duration: 90,
        difficulty: 'سهل',
        rating: 4.6,
        reviews: 89,
        tier: 'explorer',
        coordinates: [24.2461, 54.5847],
        images: ['🦴', '🗿', '📸']
    },
    {
        id: 4,
        name: 'وادي شوكة',
        description: 'واحة جبلية مخفية مع برك ماء طبيعية وشلالات موسمية',
        emoji: '💧',
        distance: 52.8,
        duration: 240,
        difficulty: 'صعب',
        rating: 4.9,
        reviews: 167,
        tier: 'pro',
        coordinates: [25.3264, 56.0136],
        images: ['🏞️', '💦', '🥾']
    },
    {
        id: 5,
        name: 'محمية المرموم الصحراوية',
        description: 'محمية طبيعية واسعة مع حياة برية متنوعة',
        emoji: '🦎',
        distance: 38.7,
        duration: 150,
        difficulty: 'متوسط',
        rating: 4.7,
        reviews: 143,
        tier: 'explorer',
        coordinates: [24.8207, 55.1547],
        images: ['🌿', '🦎', '🐪']
    },
    {
        id: 6,
        name: 'الختم الصحراوي',
        description: 'منطقة كثبان رملية مثالية لسباقات السيارات والتخييم',
        emoji: '🏁',
        distance: 41.2,
        duration: 180,
        difficulty: 'متوسط',
        rating: 4.8,
        reviews: 198,
        tier: 'free',
        coordinates: [24.5729, 54.3894],
        images: ['🏎️', '🏕️', '🔥']
    },
    {
        id: 7,
        name: 'قلعة الجاهلي',
        description: 'قلعة تاريخية مع مناظر خلابة ومسارات جبلية',
        emoji: '🏰',
        distance: 36.5,
        duration: 120,
        difficulty: 'سهل',
        rating: 4.5,
        reviews: 112,
        tier: 'free',
        coordinates: [24.2144, 55.7505],
        images: ['🏰', '🗺️', '📷']
    },
    {
        id: 8,
        name: 'شاطئ الرمس الشرقي',
        description: 'شاطئ منعزل مع مياه صافية ومرجان حي',
        emoji: '🏖️',
        distance: 67.3,
        duration: 180,
        difficulty: 'سهل',
        rating: 4.9,
        reviews: 234,
        tier: 'pro',
        coordinates: [25.8514, 56.0847],
        images: ['🏝️', '🐠', '🤿']
    }
];

// Demo groups data
const demoGroups = [
    {
        id: 1,
        name: 'عشاق البر الإماراتي',
        description: 'مجموعة لمحبي رحلات البر والتخييم في الإمارات',
        members: 45,
        admin: 'أحمد الفلاسي',
        status: 'active',
        nextTrip: 'كثبان ليوا - الجمعة 12 يناير',
        type: 'my'
    },
    {
        id: 2,
        name: 'مغامرات الجبال',
        description: 'تسلق الجبال والمشي في الطبيعة',
        members: 28,
        admin: 'سارة المهيري',
        status: 'active',
        nextTrip: 'جبل حفيت - السبت 13 يناير',
        type: 'joined'
    },
    {
        id: 3,
        name: 'رحلات العائلات',
        description: 'رحلات برية مناسبة للعائلات والأطفال',
        members: 62,
        admin: 'محمد خليفة',
        status: 'active',
        nextTrip: 'محمية المرموم - الخميس 18 يناير',
        type: 'discover'
    }
];

// ==================== INITIALIZATION ====================
function initApp() {
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
        document.getElementById('authScreen').classList.remove('hidden');
    } else {
        startApp();
    }
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {
            console.log('Service Worker registration failed');
        });
    }
}

function startApp() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.add('active');
    
    // Get user subscription
    userSubscription = currentUser.plan || 'free';
    
    // Initialize map
    setTimeout(() => {
        initMap();
        loadSavedTracks();
        loadExploreData();
        loadGroupsData();
        showNotification('مرحباً!', 'تم تسجيل الدخول بنجاح');
    }, 300);
}

// ==================== AUTH ====================
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    showLoading();
    
    setTimeout(() => {
        currentUser = {
            name: 'مستخدم تجريبي',
            email: 'demo@deserttracker.ae',
            plan: 'free'
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        hideLoading();
        startApp();
    }, 1000);
    
    return false;
}

function handleRegister(e) {
    e.preventDefault();
    showLoading();
    
    setTimeout(() => {
        currentUser = {
            name: e.target[0].value,
            email: e.target[1].value,
            plan: 'free'
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        hideLoading();
        startApp();
    }, 1000);
    
    return false;
}

function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('currentUser');
        location.reload();
    }
}

// ==================== NAVIGATION ====================
function navigateTo(view) {
    currentView = view;
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
    
    // Hide all containers
    document.getElementById('mapContainer').classList.remove('active');
    document.getElementById('exploreContainer').classList.remove('active');
    document.getElementById('groupsContainer').classList.remove('active');
    document.getElementById('settingsContainer').classList.remove('active');
    
    // Show selected container
    switch(view) {
        case 'map':
            document.getElementById('mapContainer').classList.add('active');
            if (map) map.invalidateSize();
            break;
        case 'explore':
            document.getElementById('exploreContainer').classList.add('active');
            break;
        case 'groups':
            document.getElementById('groupsContainer').classList.add('active');
            break;
        case 'settings':
            document.getElementById('settingsContainer').classList.add('active');
            break;
        case 'tracks':
            showTracksModal();
            break;
    }
}

// ==================== MAP ====================
function initMap() {
    map = L.map('map', {
        zoomControl: false
    }).setView([24.4539, 54.3773], 13);
    
    // Initialize all map layers
    mapLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
    });
    
    mapLayers.street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    });
    
    mapLayers.terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenTopoMap',
        maxZoom: 17
    });
    
    mapLayers.dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB',
        maxZoom: 19
    });
    
    // Set default layer
    currentMapLayer = mapLayers.satellite;
    currentMapLayer.addTo(map);

    // Start watching position
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(
            updatePosition,
            handleError,
            { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
        );
    } else {
        showNotification('خطأ', 'المتصفح لا يدعم تحديد الموقع', 'error');
    }
}

function changeMapType(type) {
    if (currentMapLayer) {
        map.removeLayer(currentMapLayer);
    }
    
    currentMapLayer = mapLayers[type];
    currentMapLayer.addTo(map);
    
    document.querySelectorAll('.map-type-option').forEach(option => {
        option.classList.remove('active');
    });
    event.target.closest('.map-type-option').classList.add('active');
    
    const types = {
        'satellite': 'أقمار صناعية',
        'street': 'الشوارع',
        'terrain': 'التضاريس',
        'dark': 'الوضع الليلي'
    };
    
    showNotification('تم التغيير', `تم تغيير الخريطة إلى: ${types[type]}`);
}

function zoomIn() {
    map.zoomIn();
}

function zoomOut() {
    map.zoomOut();
}

function updatePosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    currentPosition = [lat, lon];

    if (currentMarker) {
        currentMarker.setLatLng(currentPosition);
    } else {
        currentMarker = L.marker(currentPosition, {
            icon: L.divIcon({
                className: 'current-location',
                html: '<div style="background: #4CAF50; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map);
    }

    if (isTracking) {
        if (currentTrack.length > 0) {
            const lastPoint = currentTrack[currentTrack.length - 1];
            const dist = calculateDistance(
                [lastPoint.lat, lastPoint.lon],
                currentPosition
            );
            totalDistance += dist;
        }
        
        currentTrack.push({
            lat: lat,
            lon: lon,
            timestamp: Date.now(),
            speed: position.coords.speed || 0
        });

        updateTrackLine();
        updateStats();
    }

    if (position.coords.speed) {
        const speedKmh = (position.coords.speed * 3.6).toFixed(1);
        document.getElementById('speed').textContent = speedKmh + ' كم/س';
    }
}

function handleError(error) {
    console.error("GPS Error:", error.message);
}

function centerMap() {
    if (currentPosition) {
        map.setView(currentPosition, 15);
        showNotification('تم', 'تم توسيط الخريطة على موقعك');
    }
}

// ==================== TRACKING ====================
function toggleTracking() {
    isTracking = !isTracking;
    const button = document.getElementById('trackButton');

    if (isTracking) {
        button.classList.remove('start');
        button.classList.add('stop');
        button.innerHTML = '<i class="fas fa-pause"></i>';
        startTime = Date.now();
        
        if (durationInterval) clearInterval(durationInterval);
        durationInterval = setInterval(updateDuration, 1000);
        
        showNotification('بدأ التتبع', 'تم بدء تتبع مسارك');
    } else {
        button.classList.remove('stop');
        button.classList.add('start');
        button.innerHTML = '<i class="fas fa-play"></i>';
        
        if (durationInterval) {
            clearInterval(durationInterval);
            durationInterval = null;
        }
        
        if (currentTrack.length > 0) {
            showSaveModal();
        }
    }
}

function updateTrackLine() {
    if (trackPolyline) {
        map.removeLayer(trackPolyline);
    }

    const latlngs = currentTrack.map(p => [p.lat, p.lon]);
    trackPolyline = L.polyline(latlngs, {
        color: '#4CAF50',
        weight: 4,
        opacity: 0.8
    }).addTo(map);
}

function updateStats() {
    document.getElementById('distance').textContent = totalDistance.toFixed(2) + ' كم';
    document.getElementById('points').textContent = currentTrack.length;
}

function updateDuration() {
    if (startTime) {
        const elapsed = Date.now() - startTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        document.getElementById('duration').textContent = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

function calculateDistance(point1, point2) {
    const R = 6371;
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
             Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// ==================== POI ====================
function addPOI() {
    if (!currentPosition) {
        showNotification('تنبيه', 'يرجى الانتظار حتى يتم تحديد موقعك', 'warning');
        return;
    }
    
    const name = prompt('اسم النقطة:', 'نقطة مهمة');
    if (!name) return;

    const marker = L.marker(currentPosition, {
        icon: L.divIcon({
            className: 'poi-marker',
            html: '<div style="background: #FF9800; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">📍</div>',
            iconSize: [30, 30]
        })
    }).addTo(map);

    marker.bindPopup(`<b style="color: #4CAF50;">${name}</b><br>${new Date().toLocaleString('ar')}`);
    marker.openPopup();

    poiMarkers.push({
        marker: marker,
        name: name,
        position: currentPosition,
        timestamp: Date.now()
    });

    showNotification('تمت الإضافة', `تم إضافة علامة: ${name}`);
}

// ==================== EXPLORE SECTION ====================
function loadExploreData() {
    const grid = document.getElementById('exploreGrid');
    grid.innerHTML = demoPlaces.map(place => createPlaceCard(place)).join('');
}

function createPlaceCard(place) {
    const tierBadges = {
        'free': '<span class="place-badge badge-free">مجاني</span>',
        'explorer': '<span class="place-badge badge-explorer">EXPLORER</span>',
        'pro': '<span class="place-badge badge-pro">PRO</span>'
    };
    
    const canAccess = checkPlaceAccess(place.tier);
    const actionButton = canAccess 
        ? `<button class="place-action" onclick="viewPlace(${place.id})">عرض المسار</button>`
        : `<button class="place-action locked" onclick="showUpgradeModal()"><i class="fas fa-lock"></i> ترقية</button>`;
    
    return `
        <div class="place-card" style="position: relative;">
            ${tierBadges[place.tier]}
            <div class="place-image">${place.emoji}</div>
            <div class="place-content">
                <div class="place-title">${place.name}</div>
                <div class="place-description">${place.description}</div>
                <div class="place-stats">
                    <div class="place-stat">
                        <i class="fas fa-route"></i>
                        <span>${place.distance} كم</span>
                    </div>
                    <div class="place-stat">
                        <i class="fas fa-clock"></i>
                        <span>${place.duration} دقيقة</span>
                    </div>
                    <div class="place-stat">
                        <i class="fas fa-signal"></i>
                        <span>${place.difficulty}</span>
                    </div>
                </div>
                <div class="place-footer">
                    <div class="place-rating">
                        <i class="fas fa-star"></i>
                        <span>${place.rating}</span>
                        <span style="color: var(--gray-light);">(${place.reviews})</span>
                    </div>
                    ${actionButton}
                </div>
            </div>
        </div>
    `;
}

function checkPlaceAccess(tier) {
    const tiers = { 'free': 0, 'explorer': 1, 'pro': 2 };
    const userTier = tiers[userSubscription] || 0;
    const placeTier = tiers[tier] || 0;
    return userTier >= placeTier;
}

function filterExplore(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    let filtered = demoPlaces;
    
    switch(filter) {
        case 'popular':
            filtered = demoPlaces.filter(p => p.rating >= 4.7);
            break;
        case 'free':
            filtered = demoPlaces.filter(p => p.tier === 'free');
            break;
        case 'premium':
            filtered = demoPlaces.filter(p => p.tier !== 'free');
            break;
    }
    
    const grid = document.getElementById('exploreGrid');
    grid.innerHTML = filtered.map(place => createPlaceCard(place)).join('');
}

function viewPlace(placeId) {
    const place = demoPlaces.find(p => p.id === placeId);
    if (!place) return;
    
    // Switch to map view
    navigateTo('map');
    
    // Center on place
    map.setView(place.coordinates, 13);
    
    // Add marker
    L.marker(place.coordinates, {
        icon: L.divIcon({
            className: 'place-marker',
            html: `<div style="font-size: 40px;">${place.emoji}</div>`,
            iconSize: [40, 40]
        })
    }).addTo(map).bindPopup(`
        <div style="text-align: center;">
            <h3 style="color: #4CAF50; margin-bottom: 10px;">${place.name}</h3>
            <p style="margin-bottom: 10px;">${place.description}</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
                <span><i class="fas fa-route"></i> ${place.distance} كم</span>
                <span><i class="fas fa-star"></i> ${place.rating}</span>
            </div>
        </div>
    `).openPopup();
    
    showNotification('تم', `يتم عرض موقع: ${place.name}`);
}

// ==================== GROUPS SECTION ====================
function loadGroupsData() {
    const list = document.getElementById('groupsList');
    list.innerHTML = demoGroups.map(group => createGroupCard(group)).join('');
}

function createGroupCard(group) {
    const statusClass = group.status === 'active' ? 'status-active' : 'status-ended';
    const statusText = group.status === 'active' ? 'نشط' : 'منتهي';
    
    return `
        <div class="group-card">
            <div class="group-card-header">
                <div class="group-info">
                    <h3>${group.name}</h3>
                    <div class="group-members">
                        <i class="fas fa-users"></i>
                        <span>${group.members} عضو</span>
                    </div>
                </div>
                <div class="group-status ${statusClass}">${statusText}</div>
            </div>
            <div class="group-description">${group.description}</div>
            <div style="padding: 10px; background: rgba(76, 175, 80, 0.1); border-radius: 8px; margin-bottom: 15px;">
                <i class="fas fa-calendar"></i> الرحلة القادمة: ${group.nextTrip}
            </div>
            <div class="group-footer">
                <button style="background: var(--primary); color: white;" onclick="viewGroup(${group.id})">
                    <i class="fas fa-eye"></i> عرض
                </button>
                <button style="background: var(--secondary); color: white;" onclick="joinGroup(${group.id})">
                    <i class="fas fa-user-plus"></i> انضم
                </button>
            </div>
        </div>
    `;
}

function switchGroupTab(tab) {
    document.querySelectorAll('.group-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const filtered = demoGroups.filter(g => g.type === tab || tab === 'all');
    const list = document.getElementById('groupsList');
    list.innerHTML = filtered.map(group => createGroupCard(group)).join('');
}

function showCreateGroupModal() {
    const modal = createModal('إنشاء مجموعة جديدة', `
        <div class="form-group">
            <label>اسم المجموعة</label>
            <input type="text" id="groupName" placeholder="مثال: عشاق البر">
        </div>
        <div class="form-group">
            <label>الوصف</label>
            <textarea id="groupDesc" rows="3" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 2px solid var(--gray); border-radius: 10px; color: white; resize: vertical;" placeholder="وصف المجموعة..."></textarea>
        </div>
        <div class="form-group">
            <label>الخصوصية</label>
            <select style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 2px solid var(--gray); border-radius: 10px; color: white;">
                <option>عامة - يمكن للجميع الانضمام</option>
                <option>خاصة - بالدعوة فقط</option>
            </select>
        </div>
    `, () => {
        showNotification('تم', 'تم إنشاء المجموعة بنجاح!');
    });
}

function viewGroup(groupId) {
    showNotification('معلومة', 'عرض تفاصيل المجموعة - قيد التطوير', 'warning');
}

function joinGroup(groupId) {
    showNotification('تم', 'تم الانضمام للمجموعة بنجاح!');
}

// ==================== SAVE & TRACKS ====================
function showSaveModal() {
    if (currentTrack.length === 0) {
        showNotification('تنبيه', 'لا يوجد مسار لحفظه', 'warning');
        return;
    }
    
    const modal = createModal('حفظ المسار', `
        <div class="form-group">
            <label>اسم المسار</label>
            <input type="text" id="trackName" placeholder="مثال: رحلة ليوا">
        </div>
        <div class="form-group">
            <label>وصف الرحلة (اختياري)</label>
            <textarea id="trackDescription" rows="3" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.05); border: 2px solid var(--gray); border-radius: 10px; color: white; resize: vertical;" placeholder="أضف وصفاً لرحلتك..."></textarea>
        </div>
    `, saveTrack);
}

function saveTrack() {
    const name = document.getElementById('trackName').value || 'رحلة بدون اسم';
    const description = document.getElementById('trackDescription').value || '';

    const track = {
        id: Date.now(),
        name: name,
        description: description,
        points: currentTrack,
        distance: totalDistance,
        duration: startTime ? Date.now() - startTime : 0,
        date: new Date().toISOString(),
        pois: poiMarkers.length
    };

    savedTracks.push(track);
    localStorage.setItem('tracks', JSON.stringify(savedTracks));

    showNotification('تم الحفظ', `تم حفظ المسار: ${name}`);
    closeModal();
    
    currentTrack = [];
    totalDistance = 0;
    if (trackPolyline) {
        map.removeLayer(trackPolyline);
        trackPolyline = null;
    }
    updateStats();
    document.getElementById('duration').textContent = '00:00:00';
}

function showTracksModal() {
    loadSavedTracks();
    
    if (savedTracks.length === 0) {
        const modal = createModal('المسارات المحفوظة', `
            <div style="text-align: center; padding: 40px; color: var(--gray-light);">
                <i class="fas fa-folder-open" style="font-size: 48px; margin-bottom: 20px;"></i>
                <p>لا توجد مسارات محفوظة</p>
            </div>
        `);
        return;
    }
    
    const tracksHtml = savedTracks.map(track => `
        <div class="track-card">
            <div class="track-card-header">
                <div>
                    <div class="track-name">${track.name}</div>
                    <div class="track-date">${new Date(track.date).toLocaleDateString('ar')}</div>
                </div>
            </div>
            <div class="track-stats">
                <div class="track-stat">
                    <div class="track-stat-value">${track.distance.toFixed(1)}</div>
                    <div class="track-stat-label">كم</div>
                </div>
                <div class="track-stat">
                    <div class="track-stat-value">${Math.floor(track.duration / 60000)}</div>
                    <div class="track-stat-label">دقيقة</div>
                </div>
                <div class="track-stat">
                    <div class="track-stat-value">${track.points.length}</div>
                    <div class="track-stat-label">نقطة</div>
                </div>
            </div>
            <div class="track-actions">
                <button onclick="viewTrack(${track.id})" style="background: var(--primary); color: white;">
                    <i class="fas fa-eye"></i> عرض
                </button>
                <button onclick="shareTrack(${track.id})" style="background: var(--secondary); color: white;">
                    <i class="fas fa-share"></i> مشاركة
                </button>
                <button onclick="deleteTrack(${track.id})" style="background: var(--danger); color: white;">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        </div>
    `).join('');
    
    const modal = createModal('المسارات المحفوظة', `<div class="track-list">${tracksHtml}</div>`);
}

function loadSavedTracks() {
    savedTracks = JSON.parse(localStorage.getItem('tracks') || '[]');
}

function viewTrack(trackId) {
    const track = savedTracks.find(t => t.id === trackId);
    if (!track) return;

    closeModal();
    navigateTo('map');
    
    if (trackPolyline) map.removeLayer(trackPolyline);
    
    const latlngs = track.points.map(p => [p.lat, p.lon]);
    trackPolyline = L.polyline(latlngs, {
        color: '#2196F3',
        weight: 4,
        opacity: 0.8
    }).addTo(map);

    map.fitBounds(trackPolyline.getBounds());
    
    if (latlngs.length > 0) {
        L.marker(latlngs[0], {
            icon: L.divIcon({
                html: '<div style="background: var(--primary); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; font-weight: bold;">🏁</div>',
                iconSize: [30, 30]
            })
        }).addTo(map).bindPopup('نقطة البداية');

        L.marker(latlngs[latlngs.length - 1], {
            icon: L.divIcon({
                html: '<div style="background: var(--danger); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; font-weight: bold;">🎯</div>',
                iconSize: [30, 30]
            })
        }).addTo(map).bindPopup('نقطة النهاية');
    }

    showNotification('تم العرض', `يتم عرض المسار: ${track.name}`);
}

function shareTrack(trackId) {
    const track = savedTracks.find(t => t.id === trackId);
    if (!track) return;

    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Desert Tracker">
    <metadata>
        <name>${track.name}</name>
        <desc>${track.description}</desc>
    </metadata>
    <trk>
        <name>${track.name}</name>
        <trkseg>
${track.points.map(p => `            <trkpt lat="${p.lat}" lon="${p.lon}">
                <time>${new Date(p.timestamp).toISOString()}</time>
            </trkpt>`).join('\n')}
        </trkseg>
    </trk>
</gpx>`;
    
    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${track.name}.gpx`;
    a.click();

    showNotification('تم التصدير', `تم تصدير المسار بصيغة GPX`);
}

function deleteTrack(trackId) {
    if (!confirm('هل تريد حذف هذا المسار؟')) return;

    savedTracks = savedTracks.filter(t => t.id !== trackId);
    localStorage.setItem('tracks', JSON.stringify(savedTracks));
    
    showTracksModal();
    showNotification('تم الحذف', 'تم حذف المسار بنجاح');
}

// ==================== SUBSCRIPTION ====================
function showUpgradeModal() {
    const modal = createModal('خطط الاشتراك', `
        <div class="plans-container">
            <div class="plan-card">
                <div class="plan-badge" style="background: var(--primary); color: white;">مجاني</div>
                <div class="plan-name">FREE</div>
                <div class="plan-price">0 درهم</div>
                <div class="plan-duration">مجاناً للأبد</div>
                <ul class="plan-features">
                    <li><i class="fas fa-check"></i> تتبع GPS أساسي</li>
                    <li><i class="fas fa-check"></i> حفظ 5 مسارات</li>
                    <li><i class="fas fa-check"></i> تصدير GPX</li>
                    <li><i class="fas fa-check"></i> 3 أماكن مجانية</li>
                </ul>
                <button class="btn-subscribe" disabled>الخطة الحالية</button>
            </div>
            
            <div class="plan-card recommended">
                <div class="plan-badge" style="background: var(--explorer); color: var(--dark);">موصى به</div>
                <div class="plan-name">EXPLORER</div>
                <div class="plan-price">29 درهم</div>
                <div class="plan-duration">شهرياً</div>
                <ul class="plan-features">
                    <li><i class="fas fa-check"></i> كل مميزات FREE</li>
                    <li><i class="fas fa-check"></i> مسارات غير محدودة</li>
                    <li><i class="fas fa-check"></i> تتبع جماعي (5 أشخاص)</li>
                    <li><i class="fas fa-check"></i> 5 أماكن مميزة</li>
                    <li><i class="fas fa-check"></i> بدون إعلانات</li>
                </ul>
                <button class="btn-subscribe" onclick="subscribe('explorer')">اشترك الآن</button>
            </div>
            
            <div class="plan-card">
                <div class="plan-badge" style="background: var(--pro); color: var(--dark);">الأفضل</div>
                <div class="plan-name">PRO</div>
                <div class="plan-price">99 درهم</div>
                <div class="plan-duration">شهرياً</div>
                <ul class="plan-features">
                    <li><i class="fas fa-check"></i> كل مميزات EXPLORER</li>
                    <li><i class="fas fa-check"></i> تتبع جماعي (50 شخص)</li>
                    <li><i class="fas fa-check"></i> جميع الأماكن المميزة</li>
                    <li><i class="fas fa-check"></i> خرائط offline</li>
                    <li><i class="fas fa-check"></i> SOS متقدم</li>
                    <li><i class="fas fa-check"></i> تكامل الساعات الذكية</li>
                </ul>
                <button class="btn-subscribe" onclick="subscribe('pro')">اشترك الآن</button>
            </div>
        </div>
    `);
}

function subscribe(plan) {
    showNotification('معلومة', 'نظام الدفع قيد التطوير - سيتم إضافته قريباً', 'warning');
}

// ==================== SETTINGS ====================
function showStatsModal() {
    const totalTracks = savedTracks.length;
    const totalDist = savedTracks.reduce((sum, t) => sum + t.distance, 0);
    const totalDur = savedTracks.reduce((sum, t) => sum + t.duration, 0);
    
    const modal = createModal('الإحصائيات', `
        <div style="display: grid; gap: 20px;">
            <div style="background: rgba(76, 175, 80, 0.1); padding: 20px; border-radius: 15px;">
                <div style="font-size: 48px; color: var(--primary); font-weight: bold; margin-bottom: 10px;">${totalTracks}</div>
                <div style="color: var(--gray-light);">إجمالي المسارات</div>
            </div>
            <div style="background: rgba(33, 150, 243, 0.1); padding: 20px; border-radius: 15px;">
                <div style="font-size: 48px; color: var(--secondary); font-weight: bold; margin-bottom: 10px;">${totalDist.toFixed(1)} كم</div>
                <div style="color: var(--gray-light);">إجمالي المسافة</div>
            </div>
            <div style="background: rgba(255, 152, 0, 0.1); padding: 20px; border-radius: 15px;">
                <div style="font-size: 48px; color: var(--accent); font-weight: bold; margin-bottom: 10px;">${Math.floor(totalDur / 60000)} دقيقة</div>
                <div style="color: var(--gray-light);">إجمالي الوقت</div>
            </div>
        </div>
    `);
}

function showAccountModal() {
    showNotification('معلومة', 'صفحة الملف الشخصي قيد التطوير', 'warning');
}

function clearData() {
    if (confirm('هل تريد مسح جميع البيانات المحلية؟ لن يمكن التراجع عن هذا الإجراء.')) {
        localStorage.removeItem('tracks');
        savedTracks = [];
        showNotification('تم', 'تم مسح البيانات بنجاح');
    }
}

// ==================== UI HELPERS ====================
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function showNotification(title, message, type = 'success') {
    const notification = document.getElementById('notification');
    document.getElementById('notificationTitle').textContent = title;
    document.getElementById('notificationMessage').textContent = message;
    
    notification.style.borderLeftColor = type === 'error' ? 'var(--danger)' : 
                                          type === 'warning' ? 'var(--accent)' : 
                                          'var(--primary)';
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function hideNotification() {
    document.getElementById('notification').classList.remove('show');
}

function showLoading() {
    document.getElementById('loading').classList.add('show');
}

function hideLoading() {
    document.getElementById('loading').classList.remove('show');
}

function createModal(title, content, onConfirm = null) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-info-circle"></i> ${title}</h2>
                <button class="btn-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${onConfirm ? `
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="executeModalAction()">
                    <i class="fas fa-check"></i> تأكيد
                </button>
                <button class="btn btn-secondary" onclick="closeModal()">
                    إلغاء
                </button>
            </div>
            ` : ''}
        </div>
    `;
    document.body.appendChild(modal);
    
    window.currentModalAction = onConfirm;
    return modal;
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.remove());
}

function executeModalAction() {
    if (window.currentModalAction) {
        window.currentModalAction();
        closeModal();
    }
}

// ==================== START APP ====================
window.onload = initApp;