// Store Locator Functionality
let map;
let markers = [];
let currentStoreId = 1;

// Initialize Google Map
function initMap() {
  if (!window.storeLocations || window.storeLocations.length === 0) {
    console.error('No store locations found');
    return;
  }

  // Center on first store or UK center
  const center = window.storeLocations[0] 
    ? { lat: window.storeLocations[0].lat, lng: window.storeLocations[0].lng }
    : { lat: 54.5, lng: -2.0 }; // UK center

  map = new google.maps.Map(document.getElementById('store-map'), {
    zoom: 6,
    center: center,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  });

  // Add markers for all stores
  addMarkers();
  
  // Highlight first store
  if (window.storeLocations[0]) {
    highlightStore(1);
  }
}

// Add markers to map
function addMarkers() {
  // Clear existing markers
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  window.storeLocations.forEach((store, index) => {
    const marker = new google.maps.Marker({
      position: { lat: store.lat, lng: store.lng },
      map: map,
      title: store.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#E57373',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2
      }
    });

    marker.addListener('click', () => {
      showStoreDetails(store.id);
    });

    markers.push(marker);
  });
}

// Show store details
function showStoreDetails(storeId) {
  currentStoreId = storeId;
  
  // Hide all detail panels
  document.querySelectorAll('.store-detail-content').forEach(panel => {
    panel.style.display = 'none';
  });
  
  // Show selected panel
  const selectedPanel = document.getElementById(`store-detail-${storeId}`);
  if (selectedPanel) {
    selectedPanel.style.display = 'block';
  }
  
  // Update active state on cards
  document.querySelectorAll('.store-card').forEach(card => {
    card.classList.remove('active');
  });
  
  const activeCard = document.querySelector(`[data-store-id="${storeId}"]`);
  if (activeCard) {
    activeCard.classList.add('active');
    activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  // Center map on selected store
  const store = window.storeLocations.find(s => s.id === storeId);
  if (store && map) {
    map.panTo({ lat: store.lat, lng: store.lng });
    map.setZoom(12);
  }
}

// Highlight store
function highlightStore(storeId) {
  showStoreDetails(storeId);
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById('store-search');
  const findBtn = document.getElementById('find-stores-btn');
  
  function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.store-card');
    
    cards.forEach(card => {
      const searchText = card.getAttribute('data-search');
      if (!query || searchText.includes(query)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', performSearch);
  }
  
  if (findBtn) {
    findBtn.addEventListener('click', performSearch);
  }
}

// Click handlers for store cards
function setupStoreCardClicks() {
  document.querySelectorAll('.store-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on view details button
      if (e.target.classList.contains('view-details-btn')) {
        return;
      }
      const storeId = parseInt(card.getAttribute('data-store-id'));
      showStoreDetails(storeId);
    });
  });
  
  document.querySelectorAll('.view-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const storeId = parseInt(btn.getAttribute('data-store'));
      showStoreDetails(storeId);
    });
  });
}

// Distance filter (optional enhancement)
function setupDistanceFilter() {
  const distanceFilter = document.getElementById('distance-filter');
  
  if (distanceFilter && 'geolocation' in navigator) {
    distanceFilter.addEventListener('change', () => {
      // Get user location and filter stores
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const maxDistance = parseInt(distanceFilter.value);
        
        filterByDistance(userLat, userLng, maxDistance);
      }, (error) => {
        console.log('Geolocation not available:', error);
      });
    });
  }
}

// Calculate distance between two points (Haversine formula)
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
  
  cards.forEach(card => {
    const lat = parseFloat(card.getAttribute('data-lat'));
    const lng = parseFloat(card.getAttribute('data-lng'));
    const distance = calculateDistance(userLat, userLng, lat, lng);
    
    if (distance <= maxDistance) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupSearch();
  setupStoreCardClicks();
  setupDistanceFilter();
});

// Make initMap available globally for Google Maps callback
window.initMap = initMap;