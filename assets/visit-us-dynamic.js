// Store Locator Functionality with Leaflet
let map;
let markers = [];
let popups = [];

// Initialize Leaflet Map
window.createStoreMap = async function() {
  console.log('Initializing Leaflet map...');
  
  if (!window.storeLocations || window.storeLocations.length === 0) {
    console.error('No store locations found');
    document.getElementById('store-map').innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666;">No stores available</div>';
    return;
  }

  console.log('Store locations:', window.storeLocations);

  // Validate store locations have valid coordinates
  const validStores = window.storeLocations.filter(store => {
    const isValid = !isNaN(store.lat) && !isNaN(store.lng) && 
      store.lat !== null && store.lng !== null &&
      store.lat !== 0 && store.lng !== 0;
    if (!isValid) {
      console.warn('Invalid coordinates for store:', store.name, store.lat, store.lng);
    }
    return isValid;
  });

  if (validStores.length === 0) {
    console.error('No stores with valid coordinates found');
    document.getElementById('store-map').innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5; color: #666; padding: 20px; text-align: center;">No stores with valid coordinates found. Please check metaobject data.</div>';
    return;
  }

  console.log('Valid stores with coordinates:', validStores.length);

  // Create Leaflet map centered on UK
  map = L.map('store-map').setView([54.5, -2.0], 6);

  // Add tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  console.log('Leaflet map created successfully');

  // Add markers for all valid stores
  addMarkers(validStores);
  
  // Fit map to show all markers
  if (validStores.length > 0) {
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds());
    console.log('Map bounds set to fit all markers');
  }

  // Update count on initial load
  updateStoreCount();
};

// Add markers to map with Leaflet
function addMarkers(stores = window.storeLocations) {
  // Clear existing markers and popups
  markers.forEach(marker => map.removeLayer(marker));
  popups.forEach(popup => map.removeLayer(popup));
  markers = [];
  popups = [];

  stores.forEach((store, index) => {
    // Skip if coordinates are invalid
    if (isNaN(store.lat) || isNaN(store.lng)) {
      console.warn('Skipping marker for store with invalid coordinates:', store.name);
      return;
    }

    // Create custom icon (similar to your Google Maps icon)
    const customIcon = L.divIcon({
      html: `<div style="background: #E57373; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#E57373"/>
                </svg>
      </div>`,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Create marker
    const marker = L.marker([store.lat, store.lng], { 
      icon: customIcon,
      title: store.name
    }).addTo(map);

    // Create popup content (similar to your info window)
    const popupContent = `
      <div class="info-window-content">
        <h3>${store.name}</h3>
        <p>${store.address}<br>${store.city}, ${store.postcode}</p>
        ${store.phone ? `<a href="tel:${store.phone}" class="info-phone">📞 ${store.phone}</a>` : ''}
      </div>
    `;

    // Bind popup to marker
    marker.bindPopup(popupContent);

    // Click marker to show popup and highlight card
    marker.on('click', () => {
      // Close all other popups
      markers.forEach(m => m.closePopup());
      
      // Open this popup
      marker.openPopup();
      
      // Highlight corresponding store card
      highlightStoreCard(store.id);
    });

    markers.push(marker);
  });

  console.log('Added', markers.length, 'markers to map');
}

// Highlight store card and scroll to it
function highlightStoreCard(storeId) {
  // Remove active class from all cards
  document.querySelectorAll('.store-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Add active class to selected card
  const activeCard = document.querySelector(`[data-store-id="${storeId}"]`);
  if (activeCard) {
    activeCard.classList.add('active');
    activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Update store count display
function updateStoreCount() {
  const visibleCards = document.querySelectorAll('.store-card:not(.hidden)');
  const count = visibleCards.length;
  const resultsDiv = document.getElementById('results-count');
  
  if (resultsDiv) {
    resultsDiv.textContent = `${count} swyft store${count !== 1 ? 's' : ''} found within 30 miles.`;
    resultsDiv.classList.add('show');
  }
}

// Search functionality
function performSearch() {
  const searchInput = document.getElementById('store-search');
  const query = searchInput.value.toLowerCase().trim();
  const cards = document.querySelectorAll('.store-card');
  
  let visibleCount = 0;
  
  cards.forEach(card => {
    const searchText = card.getAttribute('data-search');
    if (!query || searchText.includes(query)) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });
  
  // Update markers on map based on visible cards
  if (map) {
    updateMapMarkers();
  }
  
  // Update count
  const resultsDiv = document.getElementById('results-count');
  if (resultsDiv) {
    resultsDiv.textContent = `${visibleCount} swyft store${visibleCount !== 1 ? 's' : ''} found.`;
    resultsDiv.classList.add('show');
  }
}

// Update map markers based on visible store cards
function updateMapMarkers() {
  if (!map) return;

  const visibleStoreIds = [];
  document.querySelectorAll('.store-card:not(.hidden)').forEach(card => {
    visibleStoreIds.push(parseInt(card.getAttribute('data-store-id')));
  });

  // Update marker visibility
  markers.forEach((marker, index) => {
    const storeId = index + 1;
    if (visibleStoreIds.includes(storeId)) {
      if (!map.hasLayer(marker)) {
        map.addLayer(marker);
      }
    } else {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    }
  });

  // Fit bounds to visible markers
  const visibleMarkers = markers.filter((marker, index) => 
    visibleStoreIds.includes(index + 1)
  );
  
  if (visibleMarkers.length > 0) {
    const group = new L.featureGroup(visibleMarkers);
    map.fitBounds(group.getBounds());
  }
}

// Setup search functionality
function setupSearch() {
  console.log('setupped')
  const searchInput = document.getElementById('store-search');
  const findBtn = document.getElementById('find-stores-btn');
  
  if (searchInput) {
    // Search on input
    searchInput.addEventListener('input', performSearch);
    
    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
  
  if (findBtn) {
    findBtn.addEventListener('click', performSearch);
  }
}

// Click handlers for store cards
function setupStoreCardClicks() {
  document.querySelectorAll('.store-card').forEach(card => {
    card.addEventListener('click', () => {
      const storeId = parseInt(card.getAttribute('data-store-id'));
      const store = window.storeLocations.find(s => s.id === storeId);
      
      if (store && map && !isNaN(store.lat) && !isNaN(store.lng)) {
        // Highlight card
        highlightStoreCard(storeId);
        
        // Pan to marker and zoom (Leaflet equivalent)
        map.setView([store.lat, store.lng], 14);
        
        // Open popup for the corresponding marker
        const markerIndex = storeId - 1;
        if (markers[markerIndex]) {
          markers.forEach(m => m.closePopup());
          markers[markerIndex].openPopup();
        }
      }
    });
  });
}

// Distance filter functionality
function setupDistanceFilter() {
  const distanceFilter = document.getElementById('distance-filter');
  
  if (distanceFilter && 'geolocation' in navigator) {
    distanceFilter.addEventListener('change', () => {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const maxDistance = parseInt(distanceFilter.value);
        
        filterByDistance(userLat, userLng, maxDistance);
      }, (error) => {
        console.log('Geolocation not available:', error);
        alert('Please enable location access to use distance filter');
      });
    });
  }
}

// Calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Filter stores by distance
function filterByDistance(userLat, userLng, maxDistance) {
  const cards = document.querySelectorAll('.store-card');
  let visibleCount = 0;
  
  cards.forEach(card => {
    const lat = parseFloat(card.getAttribute('data-lat'));
    const lng = parseFloat(card.getAttribute('data-lng'));
    
    if (isNaN(lat) || isNaN(lng)) {
      card.classList.add('hidden');
      return;
    }
    
    const distance = calculateDistance(userLat, userLng, lat, lng);
    
    if (distance <= maxDistance) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  // Update markers
  if (map) {
    updateMapMarkers();
  }
  
  // Update count
  const resultsDiv = document.getElementById('results-count');
  if (resultsDiv) {
    resultsDiv.textContent = `${visibleCount} swyft store${visibleCount !== 1 ? 's' : ''} found within ${maxDistance} miles.`;
    resultsDiv.classList.add('show');
  }
}

// Debug function for Leaflet
function debugMapLoading() {
  console.log('=== LEAFLET DEBUGGING ===');
  
  // Check if store data is loaded
  console.log('1. Store locations loaded:', window.storeLocations?.length || 0, 'stores');
  if (window.storeLocations) {
    window.storeLocations.forEach(store => {
      console.log(`   Store "${store.name}": lat=${store.lat}, lng=${store.lng}`);
    });
  }
  
  // Check if createStoreMap is defined
  console.log('2. createStoreMap function defined:', typeof window.createStoreMap === 'function');
  
  // Check if map container exists
  const mapContainer = document.getElementById('store-map');
  console.log('3. Map container found:', !!mapContainer);
  if (mapContainer) {
    console.log('   Container dimensions:', mapContainer.offsetWidth + 'x' + mapContainer.offsetHeight);
    console.log('   Container styles:', window.getComputedStyle(mapContainer).display, window.getComputedStyle(mapContainer).visibility);
  }
  
  // Check if Leaflet library is loaded
  console.log('4. Leaflet loaded:', typeof L !== 'undefined');
  if (typeof L !== 'undefined') {
    console.log('   Leaflet version available');
    console.log('   L.map:', typeof L.map);
  }
  
  // Check for any console errors
  console.log('5. Checking for common issues:');
  console.log('   - Store coordinates valid:', window.storeLocations?.every(store => 
    store && !isNaN(store.lat) && !isNaN(store.lng)
  ));
  
  console.log('=== END DEBUG ===');
}

// Initialize everything when DOM is ready
function init() {
  console.log('Initializing store locator...');
  debugMapLoading();
  setupSearch();
  setupStoreCardClicks();
  setupDistanceFilter();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}