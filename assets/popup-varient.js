document.addEventListener('DOMContentLoaded', () => {
  const popupOverlay = document.getElementById('product-popup-overlay');

  // Event delegation for the trigger button
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.product-popup-trigger');
    if (!btn) return;

    // Populate popup
    document.body.classList.add('no-scroll');
    document.getElementById('popup-product-title').textContent = btn.dataset.title;
    document.getElementById('popup-product-price').textContent = btn.dataset.price;
    document.getElementById('popup-product-image').src = btn.dataset.image;

    const productcatName = document.querySelector('.collection-name-product');
    if (productcatName) {
      document.getElementById('popup-product-collection').textContent = productcatName.textContent;
    }

    popupOverlay.style.display = 'flex';
  });

  // Confirm selection
  const confirmBtn = popupOverlay.querySelector('.modal__footer button');
  confirmBtn.addEventListener('click', () => {
    const selectedPopupVariant = popupOverlay.querySelector('.product-variant-picker input[type="radio"]:checked');
    if (selectedPopupVariant) {
      const variantValue = selectedPopupVariant.value;
      const mainPageVariant = document.querySelector(`.product-form__input input[type="radio"][value="${variantValue}"]`);
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

    const input = e.target;
    const productName = document.querySelector('.main-product-title')?.textContent.trim() || '';
    const productcatName = document.querySelector('.collection-name-product');

    document.querySelector('#popup-product-title').textContent = `${productName} | ${input.dataset.variantTitle}`;
    document.querySelector('#popup-product-price').textContent = input.dataset.variantPrice;
    document.querySelector('#popup-product-image').src = input.dataset.variantImage;

    if (productcatName) {
      document.querySelector('#popup-product-collection').textContent = productcatName.textContent;
    }
  });
});
