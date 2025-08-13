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
    addToCartButton.addEventListener('click', function() {
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
        const lineToEdit = this.getAttribute('data-edit-line');

        if (lineToEdit) {
            // Update existing
            fetch('/cart/change.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    line: parseInt(lineToEdit),
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

    //  Edit button — now preselects and updates preview with images
document.querySelectorAll('.edit-sample-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const lineIndex = this.getAttribute('data-line');
        const currentProps = JSON.parse(this.getAttribute('data-properties') || '[]'); // now an array of arrays
        console.log('Current properties:', currentProps);

        // Extract just the value strings ("Ivory | /cdn...")
        const propertyValues = currentProps.map(pair => pair[1]);

        // Reset and pre-check
        document.querySelectorAll('input[name="free-sample-option"]').forEach(chk => {
            chk.checked = false;

            const variantTitle = chk.getAttribute('data-variant-title')?.trim();
            const variantImage = chk.getAttribute('data-variant-image')?.trim();

            // Match if the stored value contains BOTH the title and the image path
            if (propertyValues.some(val => val.includes(variantTitle) && val.includes(variantImage))) {
                chk.checked = true;
            }
        });

        // Update preview immediately
        updateSelectedVariantsDisplay();

        // Store for saving
        document.querySelector('#add-to-cart-button').setAttribute('data-edit-line', lineIndex);

        // Open popup
        document.querySelector('.free-sample-popup-overlay').style.display = 'flex';
        document.body.classList.add('no-scroll');
    });
});

});
