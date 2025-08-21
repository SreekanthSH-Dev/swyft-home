  // Function to toggle filter groups
  function toggleFilterGroup(filterType) {
    // Get the target group and active button
    const targetGroup = document.querySelector(`.filter-group-${filterType}`);
    const activeButton = document.querySelector(`.filter-toggle-btn[data-filter-type="${filterType}"]`);
    
    // Check if the clicked button is already active
    const isAlreadyActive = activeButton.classList.contains('active');
    
    // Hide all filter groups first
    document.querySelectorAll('.quick-swatch-group').forEach(group => {
      group.style.display = 'none';
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.filter-toggle-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // If the button was not already active, show the target group and activate the button
    if (!isAlreadyActive && targetGroup) {
      targetGroup.style.display = 'block';
      activeButton.classList.add('active');
    }
    // If it was already active, just hide it (already done above) and don't activate the button
  }
  
  // Function to open specific filter in sidebar (original functionality)
  function openFilter(e, paramName) {
    try {
      // Find the filter details element
      const details = document.querySelector(`details[id*="${paramName}"]`);
      if (details) {
        // Open the filter
        details.open = true;
        
        // Scroll to the filter
        details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Prevent default behavior
        if (e) e.preventDefault();
      }
    } catch (err) {
      console.warn('openFilter error', err);
    }
  }
  document.addEventListener("DOMContentLoaded", function() {
  // Catch clicks on quick swatches
  document.querySelectorAll(".quick-swatch-item").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault(); // stop reload

      const url = new URL(link.href); // parse link target
      const params = url.searchParams.toString();

      // Update URL without reload
      window.history.pushState({}, '', `${window.location.pathname}?${params}`);

      // Run your custom filter function
      filterProducts(params);
    });
  });

  // Handle back/forward browser buttons
  window.addEventListener("popstate", function() {

    filterProducts(window.location.search.substring(1));
  });
});
let allProducts = []; // store full collection with variants

async function fetchAllProducts() {
  const collectionHandle = 'all'; // change as needed
  const url = `/collections/${collectionHandle}/products.json?limit=250`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    allProducts = data.products || [];
  } catch (err) {
    console.error("Failed to fetch products:", err);
  }
}


// Function to filter products based on data attributes
function filterProducts(params) {
    const productContainer = document.querySelector('#product-grid');
    if (!productContainer) return;
  
    const paramObj = {};
    new URLSearchParams(params).forEach((value, key) => paramObj[key] = value);
  
    let visibleCount = 0;
  
    productContainer.querySelectorAll('li.grid__item').forEach(li => {
      let visible = true;
  
      const colorParam = paramObj['filter.v.m.swyfthome.color_image']?.toLowerCase();
      const materialParam = paramObj['filter.v.m.swyft.material_image']?.toLowerCase();
      const typeParam = paramObj['filter.p.m.swyft.type']?.toLowerCase();
      const sizeParam = paramObj['filter.p.m.swyft.size']?.toLowerCase();
  
      const color = (li.dataset.color || '').toLowerCase();
      const material = (li.dataset.material || '').toLowerCase();
      const type = (li.dataset.type || '').toLowerCase();
      const size = (li.dataset.size || '').toLowerCase();
  
      if (colorParam) visible = visible && color === colorParam;
      if (materialParam) visible = visible && material === materialParam;
      if (typeParam) visible = visible && type === typeParam;
      if (sizeParam) visible = visible && size === sizeParam;
  
      li.style.display = visible ? 'block' : 'none';
  
      if (visible) visibleCount++;
    });
  
    // Update the result count
    const resultCountEl = document.getElementById('result-count');
    resultCountEl.textContent = `${visibleCount} product${visibleCount !== 1 ? 's' : ''}`;
    
    // Update Clear All button
    updateClearAllButton();
  }
  

  
  // Handle quick swatch clicks
  document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".quick-swatch-item").forEach(link => {
      link.addEventListener("click", function(e) {
        e.preventDefault();
  
        const url = new URL(link.href);
        const params = url.searchParams.toString();
  
        // Update URL without reload
        window.history.pushState({}, '', `${window.location.pathname}?${params}`);
  
        // Run the filter
        filterProducts(params);
      });
    });
  
    // Handle browser back/forward
    window.addEventListener("popstate", function() {
      filterProducts(window.location.search.substring(1));
    });
  
    // Initial load
    filterProducts(window.location.search.substring(1));
  });
  
  function updateClearAllButton() {
    const filterActions = document.getElementById('result-remove');
    const params = new URLSearchParams(window.location.search);
    
    // Check if any filter param exists
    const hasFilter = [...params.keys()].some(key => key.startsWith('filter.'));
    
    // Clear previous button
    filterActions.innerHTML = '';
  
    if (hasFilter) {
        const btn = document.createElement('a');
        btn.textContent = 'Clear Filters';
        btn.className = 'clear-all-btn';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
          // Remove all filter params
          params.forEach((value, key) => {
            if (key.startsWith('filter.')) params.delete(key);
          });
      
          // Build the URL
          const newQuery = params.toString();
          const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
      
          // Update URL without reload
          window.history.pushState({}, '', newUrl);
      
          // Re-run filtering with no params
          filterProducts(params.toString());
      
          // Remove the button after clearing
          updateClearAllButton();
        });
      
        filterActions.appendChild(btn);
      }
      
  }
  document.addEventListener('DOMContentLoaded', function() {
    // Run on initial load
    updateClearAllButton();
  
    // Also update whenever a swatch is clicked
    document.body.addEventListener("click", function(e) {
      if (e.target.closest(".quick-swatch-item")) {
        const url = new URL(e.target.closest(".quick-swatch-item").href);
        const params = url.searchParams.toString();
        window.history.pushState({}, '', `${window.location.pathname}?${params}`);
        filterProducts(params);
        updateClearAllButton(); // show button if filter active
      }
    });
  
    // Back/forward navigation
    window.addEventListener("popstate", function() {
      filterProducts(window.location.search.substring(1));
      updateClearAllButton();
    });
  });
    