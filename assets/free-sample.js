jQuery(function($) {
    // Open popup
    const FREE_SAMPLE_VARIANT_ID = '51205222629685';

$("#HeaderMenu-free-samples").on("click", function(e) {
    e.preventDefault();

    fetch('/cart.js')
        .then(res => res.json())
        .then(cart => {
            const freeSampleItem = cart.items.find(item => item.variant_id == FREE_SAMPLE_VARIANT_ID);
            if (!freeSampleItem) {
                preselectFreeSampleFromProps([], null);
                return;
            }

            const propsArray = Object.entries(freeSampleItem.properties || {});
            preselectFreeSampleFromProps(propsArray, freeSampleItem.index);
        });
});
$(".swatch-popup-btn").on("click", function(e) {
    e.preventDefault();

    fetch('/cart.js')
        .then(res => res.json())
        .then(cart => {
            const freeSampleItem = cart.items.find(item => item.variant_id == FREE_SAMPLE_VARIANT_ID);
            if (!freeSampleItem) {
                preselectFreeSampleFromProps([], null);
                return;
            }

            const propsArray = Object.entries(freeSampleItem.properties || {});
            preselectFreeSampleFromProps(propsArray, freeSampleItem.index);
        });
});



    // Close popup
    $(".free-sample-popup-close").click(function(){
        $('.free-sample-popup-overlay').css('display', 'none'); // Hide
        $('body').removeClass('no-scroll'); // Restore scrolling
    });
});
    const FREE_SAMPLE_VARIANT_ID = '51205222629685';
function preselectFreeSampleFromProps(propsArray, lineIndex = null) {
    // Extract just the value strings ("Ivory | /cdn...")
    const propertyValues = propsArray.map(pair => pair[1]);

    // Reset and pre-check
    document.querySelectorAll('input[name="free-sample-option"]').forEach(chk => {
        chk.checked = false;

        const variantTitle = chk.getAttribute('data-variant-title')?.trim();
        const variantImage = chk.getAttribute('data-variant-image')?.trim();

        // Match if the stored value contains BOTH title and image path
        if (propertyValues.some(val => val.includes(variantTitle) && val.includes(variantImage))) {
            chk.checked = true;
        }
    });

    // Update preview immediately
    updateSelectedVariantsDisplay();

    // Store line index (for edit mode)
    if (lineIndex !== null) {
        document.querySelector('#add-to-cart-button').setAttribute('data-edit-line', lineIndex);
    } else {
        document.querySelector('#add-to-cart-button').removeAttribute('data-edit-line');
    }

    // Open popup
    document.querySelector('.free-sample-popup-overlay').style.display = 'flex';
    document.body.classList.add('no-scroll');
}

// Edit button click — get properties from button attribute
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.edit-sample-btn');
    if (!btn) return; // Click wasn't on an edit button

    e.preventDefault();

    const lineIndex = btn.getAttribute('data-line');
    const currentProps = JSON.parse(btn.getAttribute('data-properties') || '[]');

    preselectFreeSampleFromProps(currentProps, lineIndex);
});


// Main menu button click — fetch from cart
document.getElementById('HeaderMenu-free-samples').addEventListener('click', function(e) {
    e.preventDefault();

    fetch('/cart.js')
        .then(res => res.json())
        .then(cart => {
            const freeSampleItem = cart.items.find(item => item.variant_id == FREE_SAMPLE_VARIANT_ID);
            if (!freeSampleItem) {
                // No free sample in cart — open empty popup
                preselectFreeSampleFromProps([], null);
                return;
            }

            // Convert Shopify properties object to array-of-arrays like edit button expects
            const propsArray = Object.entries(freeSampleItem.properties || {});
            preselectFreeSampleFromProps(propsArray, freeSampleItem.index);
        });
});

// ✅ Global function so edit button can call it
function updateSelectedVariantsDisplay() {
    const checkedItems = Array.from(document.querySelectorAll('input[name="free-sample-option"]:checked'));
    
    document.querySelectorAll('.select-varient-item').forEach(container => {
        container.innerHTML = '';
    });
  
    checkedItems.forEach((chk, index) => {
        if (index >= 6) return;
        
        const container = document.getElementById(`select-varient-item${index + 1}`);
        if (!container) return;
        
        const imgSrc = chk.getAttribute('data-variant-image');
        const title = chk.getAttribute('data-variant-title');
        
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = title;
        img.width = 60;
        img.height = 60;
        img.style.border = '1px solid #ddd';
        
        const label = document.createElement('p');
        label.textContent = title;
        label.className = 'select-varient-class';
        
        container.appendChild(img);
        container.appendChild(label);
    });
  
    for (let i = checkedItems.length; i < 6; i++) {
        const container = document.getElementById(`select-varient-item${i + 1}`);
        if (container) {
            container.innerHTML = '<span class="empty-slot">+</span>';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('input[name="free-sample-option"]');
    const maxSelection = 6;

    checkboxes.forEach(chk => {
        chk.addEventListener('change', () => {
            const checkedCount = document.querySelectorAll('input[name="free-sample-option"]:checked').length;
            if (checkedCount > maxSelection) {
                alert(`You can only select up to ${maxSelection} variants.`);
                chk.checked = false;
            }
            updateSelectedVariantsDisplay();
        });
    });

    const addToCartButton = document.getElementById('add-to-cart-button');
addToCartButton.addEventListener('click', function () {
    const checkedBoxes = document.querySelectorAll('input[name="free-sample-option"]:checked');

    if (checkedBoxes.length === 0) {
        alert('Please select at least one option before adding to cart');
        return;
    }

    this.classList.add('loading');
    this.querySelector('span').textContent = 'Adding...';

    const properties = {};
    checkedBoxes.forEach((chk, index) => {
        const title = chk.getAttribute('data-variant-title');
        const img = chk.getAttribute('data-variant-image') || '';
        properties[`Sample ${index + 1}`] = title + (img ? ` | ${img}` : '');
    });

    const parentVariantId = '51205222629685';

    fetch('/cart.js')
        .then(res => res.json())
        .then(cart => {
            const freeSampleItem = cart.items.find(item => item.variant_id == parentVariantId);

            if (freeSampleItem) {
                // ✅ Always update existing if in cart
                fetch('/cart/change.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        line: freeSampleItem.index,
                        quantity: 1,
                        id: parentVariantId,
                        properties
                    })
                })
                    .then(res => res.json())
                    .then(() => window.location.reload());
            } else {
                // Add new
                fetch('/cart/add.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        items: [{ id: parentVariantId, quantity: 1, properties }]
                    })
                })
                    .then(res => res.json())
                    .then(() => window.location.href = '/cart');
            }
        });
});

});
