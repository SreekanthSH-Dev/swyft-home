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

let allProducts = []; // store full collection with variants
let originalGridHTML = ''; // store original grid HTML

// Store the original grid content when page loads
function storeOriginalGrid() {
  const grid = document.querySelector('ul#product-grid');
  if (grid && !originalGridHTML) {
    originalGridHTML = grid.innerHTML;
    console.log("📦 Original grid HTML stored");
  }
}

// Restore the original grid content
function restoreOriginalGrid() {
  const grid = document.querySelector('ul#product-grid');
  if (grid && originalGridHTML) {
    grid.innerHTML = originalGridHTML;
    console.log("🔄 Original grid restored");
  }
}

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

// Enhanced function to filter products and render with your card structure
async function filterProducts(params) {
  const paramObj = {};
  new URLSearchParams(params).forEach((value, key) => paramObj[key] = value.toLowerCase());

  // If no params, restore the original grid content
  if (Object.keys(paramObj).length === 0) {
    console.log("ℹ️ No filters applied, restoring original grid");
    restoreOriginalGrid();
    return;
  }

  const matchedVariants = [];

  // Loop through products + variants
  for (const [collectionHandle, products] of Object.entries(window.variantData["all-collections"])) {
    for (const [productHandle, variants] of Object.entries(products)) {
      for (const [variantId, variantData] of Object.entries(variants)) {
        let match = true;

        if (paramObj['filter.v.m.swyfthome.color_image'] &&
            variantData["data-color"].toLowerCase() !== paramObj['filter.v.m.swyfthome.color_image']) {
          match = false;
        }
        if (paramObj['filter.v.m.swyft.material_image'] &&
            variantData["data-material"].toLowerCase() !== paramObj['filter.v.m.swyft.material_image']) {
          match = false;
        }
        if (paramObj['filter.p.m.swyft.type'] &&
            variantData["data-type"].toLowerCase() !== paramObj['filter.p.m.swyft.type']) {
          match = false;
        }
        if (paramObj['filter.p.m.swyft.size'] &&
            variantData["data-size"].toLowerCase() !== paramObj['filter.p.m.swyft.size']) {
          match = false;
        }

        if (match) {
          matchedVariants.push({
            product: productHandle,
            variantId,
            variantData: variantData
          });
        }
      }
    }
  }

  console.log("✅ Total Matches:", matchedVariants);

  const grid = document.querySelector('ul#product-grid');
  grid.innerHTML = ""; // clear before appending

  if (matchedVariants.length === 0) {
    grid.innerHTML = `<li class="grid__item"><div class="no-results">No products match your filters.</div></li>`;
    return;
  }

  // Pre-fetch all product data first
  const uniqueProducts = [...new Set(matchedVariants.map(match => match.product))];
  const productDataMap = {};

  // Fetch all unique products
  for (const productHandle of uniqueProducts) {
    try {
      const productResponse = await fetch(`/products/${productHandle}.js`);
      const productData = await productResponse.json();
      productDataMap[productHandle] = productData;
    } catch (err) {
      console.error("❌ Error fetching product:", productHandle, err);
    }
  }

  // Now create LI elements using your exact card structure
  for (const match of matchedVariants) {
    try {
      const productData = productDataMap[match.product];
      if (!productData) continue;
      
      // Find the specific variant
      const variant = productData.variants.find(v => v.id.toString() === match.variantId.toString());
      
      if (!variant) {
        console.warn(`Variant ${match.variantId} not found in product ${match.product}`);
        continue;
      }
      
      // Get the image for this variant
      let imageUrl = productData.featured_image || productData.images[0] || '';
      let imageAlt = productData.title;
      
      // Try to find variant-specific image
      if (variant.featured_image) {
        imageUrl = variant.featured_image.src;
        imageAlt = variant.featured_image.alt || productData.title;
      }

      // Format prices
      const regularPrice = variant.compare_at_price ? `€${(variant.compare_at_price / 100).toFixed(0)}` : null;
      const salePrice = `€${(variant.price / 100).toFixed(0)}`;
      const isOnSale = variant.compare_at_price && variant.compare_at_price > variant.price;

      // Generate color variants HTML
      const colorVariantsHTML = generateColorVariants(productData, variant.id);

      // Create the LI element with your exact structure
      const li = document.createElement('li');
      li.className = 'grid__item scroll-trigger animate--slide-in';
      li.setAttribute('data-cascade', '');
      li.style.setProperty('--animation-order', '0');
      li.setAttribute('data-variant-id', match.variantId);
      li.setAttribute('data-color', match.variantData["data-color"]);
      li.setAttribute('data-material', match.variantData["data-material"]);
      li.setAttribute('data-type', match.variantData["data-type"]);
      li.setAttribute('data-size', match.variantData["data-size"] || '');

      // Your exact card HTML structure with dynamic data
      li.innerHTML = `
        <link href="/cdn/shop/t/15/assets/component-rating.css?v=179577762467860590411755490321" rel="stylesheet" type="text/css" media="all">
        <link href="/cdn/shop/t/15/assets/component-volume-pricing.css?v=111870094811454961941755490324" rel="stylesheet" type="text/css" media="all">
        <link href="/cdn/shop/t/15/assets/component-price.css?v=19372312944525830951755518107" rel="stylesheet" type="text/css" media="all">
        <link href="/cdn/shop/t/15/assets/quick-order-list.css?v=86354568948591544181755490323" rel="stylesheet" type="text/css" media="all">
        <link href="/cdn/shop/t/15/assets/quantity-popover.css?v=160630540099520878331755490321" rel="stylesheet" type="text/css" media="all">

        <div class="card-wrapper product-card-wrapper underline-links-hover">
          <div class="card card--card card--media color-scheme-1 gradient" style="--ratio-percent: 125.0%;">
            <div class="card__inner ratio" style="--ratio-percent: 66.66666666666666%;">
              <div class="card__media">
                <div class="media media--transparent media--hover-effect">
                  <img srcset="${imageUrl}?width=165 165w,${imageUrl}?width=360 360w,${imageUrl}?width=533 533w,${imageUrl} 713w" 
                       src="${imageUrl}?width=533" 
                       sizes="(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)" 
                       alt="${imageAlt}" 
                       class="motion-reduce" 
                       width="713" 
                       height="475">
                </div>
              </div>
              <div class="card__content">
                <div class="card__information">
                  <h3 class="card__heading">
                    <a href="/products/${match.product}?variant=${match.variantId}" 
                       class="full-unstyled-link">
                      ${productData.title}ProductVariantDrop
                    </a>
                  </h3>
                </div>
                ${isOnSale ? '<div class="card__badge bottom left"><span class="badge badge--bottom-left color-scheme-5">Sale</span></div>' : ''}
              </div>
            </div>
            <div class="card__content">
              <div class="card__information">
                <a href="/collections/${productData}" class="product__title">
                  <h2 class="h1 collection-name-product-home">
                    ${productData.product_type || 'Model 1'}
                  </h2>
                </a>
                <h3 class="card__heading h5">
                  <a href="/products/${match.product}?variant=${match.variantId}" class="full-unstyled-link">
                    ${productData.title}
                    ${variant.option1 && variant.option1 !== 'Default Title' ? ` | ${variant.option1}` : ''}
                  </a>
                </h3>
                <div class="card-information">
                  <span class="caption-large light"></span>
                  <div class="price ${isOnSale ? 'price--on-sale' : ''}">
                    <div class="price__container">
                      ${!isOnSale ? `
                        <div class="price__regular">
                          <span class="visually-hidden visually-hidden--inline">Regular price</span>
                          <span class="price-item price-item--regular">${salePrice}</span>
                        </div>
                      ` : `
                        <div class="price__regular">
                          <span class="visually-hidden visually-hidden--inline">Regular price</span>
                          <span class="price-item price-item--regular">${salePrice}</span>
                        </div>
                        <div class="price__sale">
                          <span class="visually-hidden visually-hidden--inline">Regular price</span>
                          <span><s class="price-item price-item--regular">${regularPrice}</s></span>
                          <span class="visually-hidden visually-hidden--inline">Sale price</span>
                          <span class="price-item price-item--sale price-item--last">${salePrice}</span>
                        </div>
                      `}
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-variant-swatches">
                <fieldset class="js product-form__input product-form__input--pill">
                  <div class="product-varient-picker">
                    ${colorVariantsHTML}
                    <a href="" class="product-card-swatch more">More colours available</a>
                  </div>
                </fieldset>
              </div>
              <div class="card-product-add-to-cart">
                <div>
                  <product-form class="product-form" data-hide-errors="false">
                    <div class="product-form__error-message-wrapper" role="alert" hidden="">
                      <span class="svg-wrapper">
                        <svg class="icon icon-error" viewBox="0 0 13 13">
                          <circle cx="6.5" cy="6.5" r="5.5" stroke="#fff" stroke-width="2"></circle>
                          <circle cx="6.5" cy="6.5" r="5.5" fill="#EB001B" stroke="#EB001B" stroke-width=".7"></circle>
                          <path fill="#fff" d="m5.874 3.528.1 4.044h1.053l.1-4.044zm.627 6.133c.38 0 .68-.288.68-.656s-.3-.656-.68-.656-.681.288-.681.656.3.656.68.656"></path>
                        </svg>
                      </span>
                      <span class="product-form__error-message"></span>
                    </div>
                    <form method="post" action="/cart/add" class="form" enctype="multipart/form-data" novalidate="novalidate" data-type="add-to-cart-form">
                      <input type="hidden" name="form_type" value="product">
                      <input type="hidden" name="utf8" value="✓">
                      <input type="hidden" name="id" value="${match.variantId}" class="product-variant-id">
                      <div class="product-form__buttons">
                        <button type="submit" name="add" class="product-form__submit button button--full-width button--primary">
                          <span>Add to cart</span>
                          <div class="loading__spinner hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" class="spinner" viewBox="0 0 66 66">
                              <circle stroke-width="6" cx="33" cy="33" r="30" fill="none" class="path"></circle>
                            </svg>
                          </div>
                        </button>
                      </div>
                      <input type="hidden" name="product-id" value="${productData.id}">
                    </form>
                  </product-form>
                </div>
              </div>
            </div>
            ${isOnSale ? '<div class="card__badge bottom left"><span class="badge badge--bottom-left color-scheme-5">Sale</span></div>' : ''}
          </div>
        </div>
      `;
      
      grid.appendChild(li);

    } catch (err) {
      console.error("❌ Error rendering product card:", match.product, match.variantId, err);
    }
  }
}

// Helper function to generate color variant swatches
function generateColorVariants(productData, currentVariantId) {
  if (!productData.variants || productData.variants.length <= 1) {
    return '';
  }

  let variantsHTML = '';
  const maxSwatches = 5; // Show max 5 swatches
  let swatchCount = 0;

  for (const variant of productData.variants) {
    if (swatchCount >= maxSwatches) break;
    
    const isActive = variant.id.toString() === currentVariantId.toString();
    const colorName = variant.option1 || 'Default';
    const colorImage = getColorSwatchImage(colorName);
    
    variantsHTML += `
      <a href="/products/${productData.handle}?variant=${variant.id}" 
         class="variant__pill ${isActive ? 'active' : ''}" 
         data-variant-id="${variant.id}" 
         ${variant.featured_image ? `data-variant-image="${variant.featured_image.src}"` : ''}
         aria-label="${colorName}">
        <span class="variant__pill__label">   
          <img class="colour-switch-varient" 
               src="${colorImage}" 
               width="25" 
               height="25" 
               alt="${colorName}">
        </span>
      </a>
      <h3 class="product-card-swatch more"></h3>
    `;
    
    swatchCount++;
  }

  return variantsHTML;
}

// Helper function to get color swatch image
function getColorSwatchImage(colorName) {
  const colorMap = {
    'pumice': '/cdn/shop/files/Pumice.webp?v=1754654294&width=25',
    'vine': '/cdn/shop/files/Vine.webp?v=1754642586&width=25',
    'standen': '/cdn/shop/files/standan.avif?v=1755761088&width=25',
    'indigo': '/cdn/shop/files/Indigo.webp?v=1754989931&width=25',
    'shadow': '/cdn/shop/files/Ivory.webp?v=1754989932&width=25'
  };
  
  return colorMap[colorName.toLowerCase()] || '/cdn/shop/files/default-color.webp?width=25';
}

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
      const newParams = new URLSearchParams();
      
      // Keep non-filter params (like page, sort, etc.)
      params.forEach((value, key) => {
        if (!key.startsWith('filter.')) {
          newParams.set(key, value);
        }
      });
  
      // Build the URL
      const newQuery = newParams.toString();
      const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
  
      // Update URL without reload
      window.history.pushState({}, '', newUrl);
  
      // Restore original grid content instead of re-filtering
      restoreOriginalGrid();
  
      // Remove the button after clearing
      updateClearAllButton();
    });
  
    filterActions.appendChild(btn);
  }
}

// Main DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function() {
  console.log("DOM loaded, initializing filters...");
  
  // Store original grid content first
  storeOriginalGrid();
  
  // Fetch all products
  fetchAllProducts();
  
  // Set up quick swatch click handlers
  document.querySelectorAll(".quick-swatch-item").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const url = new URL(link.href);
      const params = url.searchParams.toString();
      
      // Update URL without reload
      window.history.pushState({}, '', `${window.location.pathname}?${params}`);
      
      // Run the filter
      filterProducts(params);
      updateClearAllButton();
    });
  });
  
  // Handle browser back/forward
  window.addEventListener("popstate", function() {
    const currentParams = window.location.search.substring(1);
    const hasFilters = new URLSearchParams(currentParams).toString().includes('filter.');
    
    if (hasFilters) {
      filterProducts(currentParams);
    } else {
      restoreOriginalGrid();
    }
    updateClearAllButton();
  });
  
  // Set up clear all button
  updateClearAllButton();
  
  // Initial filter based on URL params (only if there are filters)
  const initialParams = window.location.search.substring(1);
  if (initialParams && initialParams.includes('filter.')) {
    console.log("Initial filter with params:", initialParams);
    filterProducts(initialParams);
  }
  
  // Store reference to our listeners
  window._filterEventListeners = {
    quickSwatch: true,
    popstate: true,
    clearButton: true
  };
});