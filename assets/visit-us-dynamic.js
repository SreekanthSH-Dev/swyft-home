// Store Locator Functionality
let map;
let markers = [];
let infoWindows = [];

// Initialize Google Map - Make it available globally BEFORE Maps loads
window.createStoreMap = async function() {
  console.log('Initializing map...');
  
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

  // Calculate center based on valid store locations
  const bounds = new google.maps.LatLngBounds();
  
  // Create map centered on UK
  map = new google.maps.Map(document.getElementById('store-map'), {
    zoom: 6,
    center: { lat: 54.5, lng: -2.0 },
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  });

  console.log('Map created successfully');

  // Add markers for all valid stores
  addMarkers(validStores);
  
  // Fit map to show all markers
  validStores.forEach(store => {
    bounds.extend(new google.maps.LatLng(store.lat, store.lng));
  });
  
  if (validStores.length > 0) {
    map.fitBounds(bounds);
    console.log('Map bounds set to fit all markers');
  }

  // Update count on initial load
  updateStoreCount();
};

// Add markers to map
function addMarkers(stores = window.storeLocations) {
  // Clear existing markers and info windows
  markers.forEach(marker => marker.setMap(null));
  infoWindows.forEach(infoWindow => infoWindow.close());
  markers = [];
  infoWindows = [];

  stores.forEach((store, index) => {
    // Skip if coordinates are invalid
    if (isNaN(store.lat) || isNaN(store.lng)) {
      console.warn('Skipping marker for store with invalid coordinates:', store.name);
      return;
    }

    // Create marker
    const marker = new google.maps.Marker({
      position: { lat: store.lat, lng: store.lng },
      map: map,
      title: store.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#E57373',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 3
      }
    });

    // Create info window content
    const infoContent = `
      <div class="info-window-content">
        <h3>${store.name}</h3>
        <p>${store.address}<br>${store.city}, ${store.postcode}</p>
        ${store.phone ? `<a href="tel:${store.phone}" class="info-phone">📞 ${store.phone}</a>` : ''}
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: infoContent
    });

    // Click marker to show info and highlight card
    marker.addListener('click', () => {
      // Close all other info windows
      infoWindows.forEach(iw => iw.close());
      
      // Open this info window
      infoWindow.open(map, marker);
      
      // Highlight corresponding store card
      highlightStoreCard(store.id);
    });

    markers.push(marker);
    infoWindows.push(infoWindow);
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
      marker.setMap(map);
    } else {
      marker.setMap(null);
    }
  });

  // Fit bounds to visible markers
  if (visibleStoreIds.length > 0) {
    const bounds = new google.maps.LatLngBounds();
    visibleStoreIds.forEach(id => {
      const store = window.storeLocations.find(s => s.id === id);
      if (store && !isNaN(store.lat) && !isNaN(store.lng)) {
        bounds.extend(new google.maps.LatLng(store.lat, store.lng));
      }
    });
    map.fitBounds(bounds);
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
        
        // Pan to marker and zoom
        map.panTo({ lat: store.lat, lng: store.lng });
        map.setZoom(14);
        
        // Open info window
        const markerIndex = storeId - 1;
        if (infoWindows[markerIndex]) {
          infoWindows.forEach(iw => iw.close());
          infoWindows[markerIndex].open(map, markers[markerIndex]);
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

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Add this debug function to identify the map loading issue
// Add this debug function to identify the map loading issue
function debugMapLoading() {
  console.log('=== MAP DEBUGGING ===');
  
  // Check if API key is present - removed Liquid syntax
  const apiKey = window.googleMapsApiKey || '';
  console.log('1. API Key present:', !!apiKey, '(length:', apiKey?.length + ')');
  
  // Check if store data is loaded
  console.log('2. Store locations loaded:', window.storeLocations?.length || 0, 'stores');
  if (window.storeLocations) {
    window.storeLocations.forEach(store => {
      console.log(`   Store "${store.name}": lat=${store.lat}, lng=${store.lng}`);
    });
  }
  
  // Check if initMap is defined
  console.log('3. initMap function defined:', typeof window.initMap === 'function');
  
  // Check if map container exists
  const mapContainer = document.getElementById('store-map');
  console.log('4. Map container found:', !!mapContainer);
  if (mapContainer) {
    console.log('   Container dimensions:', mapContainer.offsetWidth + 'x' + mapContainer.offsetHeight);
    console.log('   Container styles:', window.getComputedStyle(mapContainer).display, window.getComputedStyle(mapContainer).visibility);
  }
  
  // Check if Google Maps library is loaded
  console.log('5. Google Maps loaded:', typeof google !== 'undefined');
  if (typeof google !== 'undefined') {
    console.log('   Google Maps version available');
    console.log('   google.maps.Map:', typeof google.maps.Map);
  }
  
  // Check for any console errors
  console.log('6. Checking for common issues:');
  console.log('   - API key format:', apiKey?.startsWith('AIza'));
  console.log('   - Store coordinates valid:', window.storeLocations?.every(store => 
    store && !isNaN(store.lat) && !isNaN(store.lng)
  ));
  
  console.log('=== END DEBUG ===');
}


// Also add this to your init function
function init() {
  console.log('Initializing store locator...');
  debugMapLoading(); // Add this line
  setupSearch();
  setupStoreCardClicks();
  setupDistanceFilter();
}