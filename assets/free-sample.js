jQuery(function($) {
    // Open popup
    $("#HeaderMenu-free-samples").click(function() {
        $('.free-sample-popup-overlay').css('display', 'flex'); // Use flex
        $('body').addClass('no-scroll'); // Prevent scrolling
    });

    // Close popup
    $(".free-sample-popup-close").click(function(){
        $('.free-sample-popup-overlay').css('display', 'none'); // Hide
        $('body').removeClass('no-scroll'); // Restore scrolling
    });
});

document.addEventListener('DOMContentLoaded', function() {
  const checkboxes = document.querySelectorAll('input[name="free-sample-option"]');
  const maxSelection = 6;

  checkboxes.forEach(chk => {
    chk.addEventListener('change', () => {
      const checkedCount = document.querySelectorAll('input[name="free-sample-option"]:checked').length;
      if (checkedCount > maxSelection) {
        alert(`You can only select up to ${maxSelection} variants.`);
        chk.checked = false; // revert
      }
      updateSelectedVariantsDisplay();
    });
  });

function updateSelectedVariantsDisplay() {
  // Get all checked checkboxes
  const checkedItems = Array.from(document.querySelectorAll('input[name="free-sample-option"]:checked'));
  
  // Clear all existing content from the numbered containers
  document.querySelectorAll('.select-varient-item').forEach(container => {
    container.innerHTML = '';
  });
  
  // Add each selected variant to the corresponding numbered container
  checkedItems.forEach((chk, index) => {
    // Don't exceed our 6 containers
    if (index >= 6) return;
    
    const container = document.getElementById(`select-varient-item${index + 1}`);
    if (!container) return;
    
    const imgSrc = chk.getAttribute('data-variant-image');
    const title = chk.getAttribute('data-variant-title');
    
    // Create image element
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = title;
    img.width = 60;
    img.height = 60;
    img.style.border = '1px solid #ddd';
    
    // Create title element
    const label = document.createElement('p');
    label.textContent = title;
    label.className = 'select-varient-class';

    
    // Add elements to container
    container.appendChild(img);
    container.appendChild(label);
  });
  
  // Show empty state for remaining containers
  for (let i = checkedItems.length; i < 6; i++) {
    const container = document.getElementById(`select-varient-item${i + 1}`);
    if (container) {
      container.innerHTML = '<span class="empty-slot">+</span>';
    }
  }
}
});
document.addEventListener('DOMContentLoaded', function() {
  const addToCartButton = document.getElementById('add-to-cart-button');
  
  addToCartButton.addEventListener('click', function() {
    // Check if at least one checkbox is selected
    const checkedBoxes = document.querySelectorAll('input[name="free-sample-option"]:checked');
    
    if (checkedBoxes.length === 0) {
      alert('Please select at least one option before adding to cart');
      return; // Stop execution if no checkboxes are selected
    }
    
    // Show loading state
    this.classList.add('loading');
    this.querySelector('span').textContent = 'Adding...';
    
    // Product variant ID to add
    const variantId = '51205222629685';
    
    // Shopify AJAX API call
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        items: [{
          id: variantId,
          quantity: 1
        }]
      })
    })
    .then(response => response.json())
    .then(data => {
      // Success - you could refresh the cart or show a success message
      console.log('Product added to cart:', data);
      
      // Option 1: Refresh the page to show updated cart
      window.location.href = '/cart';
      
      // Option 2: Show success message without redirect
      // this.querySelector('span').textContent = 'Added!';
      // setTimeout(() => {
      //   this.querySelector('span').textContent = 'Add to cart';
      //   this.classList.remove('loading');
      // }, 2000);
    })
    .catch(error => {
      console.error('Error:', error);
      this.querySelector('span').textContent = 'Error - Try Again';
      this.classList.remove('loading');
    });
  });
});