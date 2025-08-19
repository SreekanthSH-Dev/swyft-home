document.addEventListener("DOMContentLoaded", function () {
    const overlay = document.querySelector(".swatch-popup-overlay");
    const closeButton = document.querySelector(".swatch-popup-close");
    const popupcloseandopen = document.querySelector(".swatch-popup-btn");
    const OVERLAY_KEY = "swatchOverlayLastShown";
    const SHOW_INTERVAL_MINUTES = 30;

    function shouldShowOverlay() {
        const lastShown = localStorage.getItem(OVERLAY_KEY);
        if (!lastShown) return true;
        const lastShownTime = parseInt(lastShown, 10);
        const now = Date.now();
        const diffMinutes = (now - lastShownTime) / (1000 * 60);
        return diffMinutes >= SHOW_INTERVAL_MINUTES;
    }

    function showOverlay() {
        document.body.classList.add("no-scroll");
        overlay.classList.remove("swatch-hidden");
        localStorage.setItem(OVERLAY_KEY, Date.now());
    }

    function hideOverlay() {
        document.body.classList.remove("no-scroll");
        overlay.classList.add("swatch-hidden");
    }

    overlay.classList.add("swatch-hidden"); // Ensure hidden initially

    if (shouldShowOverlay()) {
        showOverlay();
    }
    popupcloseandopen.addEventListener("click",hideOverlay);
    closeButton.addEventListener("click", hideOverlay);
});
