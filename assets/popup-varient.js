document.addEventListener('DOMContentLoaded', () => {
  const popupOverlay = document.getElementById('product-popup-overlay');

  // Function to update popup title with product name + selected variant
  function updatePopupTitle(selectedInput) {
const baseProductTitle = document.querySelector('.base-name')?.textContent.trim() || '';
    const variantTitle = selectedInput?.dataset.variantTitle || '';
    const productcatName = document.querySelector('.collection-name-product');

    // Format title
document.querySelector('#popup-product-title').textContent =
  variantTitle ? `${baseProductTitle} | ${variantTitle}` : baseProductTitle;


    document.querySelector('#popup-product-price').textContent = selectedInput?.dataset.variantPrice || '';
    document.querySelector('#popup-product-image').src = selectedInput?.dataset.variantImage || '';

    if (productcatName) {
      document.querySelector('#popup-product-collection').textContent = productcatName.textContent;
    }
  }

  // Event delegation for the trigger button
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.product-popup-trigger');
    if (!btn) return;

    // Populate popup
    document.body.classList.add('no-scroll');

    // Find selected variant on main page
    const mainSelectedVariant = document.querySelector('.product-form__input input[type="radio"]:checked');

    // Find matching variant input inside popup (if exists)
    if (mainSelectedVariant) {
      const popupVariant = popupOverlay.querySelector(`.product-variant-picker input[type="radio"][value="${mainSelectedVariant.value}"]`);
      if (popupVariant) {
        popupVariant.checked = true;
        updatePopupTitle(popupVariant);
      }
    } else {
      // Fallback: just set base product info
      updatePopupTitle(null);
    }

    popupOverlay.style.display = 'flex';
  });

  // Confirm selection
const confirmBtn = popupOverlay.querySelector('.modal__footer button');


// Select all radios from both groups
const variantRadios = document.querySelectorAll(
  '.variant-options-wrapper input[type="radio"], .variant-material-option input[type="radio"]'
);

variantRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      // Uncheck all others across both groups
      variantRadios.forEach(other => {
        if (other !== radio) {
          other.checked = false;
        }
      });
    }
  });
});

confirmBtn.addEventListener('click', () => {
  // Find the single checked radio from both groups
  const selectedPopupVariant = popupOverlay.querySelector(
    '.variant-options-wrapper input[type="radio"]:checked, .variant-material-option input[type="radio"]:checked'
  );

  if (selectedPopupVariant) {
    const variantValue = selectedPopupVariant.value;
    const mainPageVariant = document.querySelector(
      `.product-form__input input[type="radio"][value="${variantValue}"]`
    );
    if (mainPageVariant) {
      mainPageVariant.checked = true;
      mainPageVariant.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  document.body.classList.remove('no-scroll');
  popupOverlay.style.display = 'none';
});



  // Close popup
  popupOverlay.addEventListener('click', function (e) {
    if (e.target.matches('.popup-close') || e.target === popupOverlay || e.target.closest('[data-close-modal]')) {
      document.body.classList.remove('no-scroll');
      popupOverlay.style.display = 'none';
    }
  });

  // Variant change inside popup
  document.addEventListener('change', function (e) {
    if (!e.target.matches('.product-variant-picker input[type="radio"]')) return;
    updatePopupTitle(e.target);
  });
});
