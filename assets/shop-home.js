
  document.addEventListener("DOMContentLoaded", function () {
    const drawer = document.getElementById("mobile-drawer-header");
    const openBtn = document.querySelector(".drawer-open");
    const closeBtn = document.querySelector(".drawer-close");
    const overlay = drawer.querySelector(".drawer-overlay");

    openBtn.addEventListener("click", () => {
        console.log('clicked');
      drawer.classList.remove("hidden");
      setTimeout(() => drawer.classList.add("active"), 10);
    });

    function closeDrawer() {
      drawer.classList.remove("active");
      setTimeout(() => drawer.classList.add("hidden"), 300);
    }

    closeBtn.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);

    // Accordion functionality
    document.querySelectorAll(".accordion-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const item = btn.closest(".accordion-item");
        item.classList.toggle("active");
      });
    });
  });

