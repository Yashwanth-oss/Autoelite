// AUTOELITE LUXURY SIDEBAR COMPONENT

(function initAutoEliteSidebar() {
  function setupSidebar() {
    // 1. Invert/inject toggle button into nav if missing
    const nav = document.querySelector("nav");
    if (nav && !document.getElementById("sidebarToggle")) {
      const toggleBtn = document.createElement("button");
      toggleBtn.id = "sidebarToggle";
      toggleBtn.className = "sidebar-toggle-btn";
      toggleBtn.setAttribute("aria-label", "Toggle Navigation Sidebar");
      toggleBtn.innerHTML = "☰";
      toggleBtn.onclick = toggleSidebar;

      // Insert at the very start of nav before logo
      nav.insertBefore(toggleBtn, nav.firstChild);
    }

    // 2. Build Backdrop if missing
    let backdrop = document.getElementById("sidebarBackdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "sidebarBackdrop";
      backdrop.className = "sidebar-backdrop";
      backdrop.onclick = closeSidebar;
      document.body.appendChild(backdrop);
    }

    // 3. Build Sidebar Drawer if missing
    let sidebar = document.getElementById("appSidebar");
    if (!sidebar) {
      sidebar = document.createElement("aside");
      sidebar.id = "appSidebar";
      sidebar.className = "sidebar-drawer";
      document.body.appendChild(sidebar);
    }

    // Determine current user
    let user = null;
    try {
      const stored = localStorage.getItem("user");
      if (stored) user = JSON.parse(stored);
    } catch (e) {}

    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <h2>🚗 AutoElite</h2>
        <button class="sidebar-close-btn" onclick="closeSidebar()" aria-label="Close Sidebar">✕</button>
      </div>

      <!-- USER PROFILE SNIPPET -->
      <div class="sidebar-user-card" onclick="window.location.href='${user ? 'profile.html' : 'login.html'}'" style="cursor:pointer;">
        <div class="sidebar-user-avatar">
          ${user ? user.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${user ? user.name : 'Guest Explorer'}</div>
          <span class="sidebar-user-badge">
            ${user ? (user.role === 'admin' ? '🛡️ Administrator' : '⭐ VIP Member') : 'Click to Sign In'}
          </span>
        </div>
      </div>

      <!-- SCROLLABLE NAVIGATION -->
      <div class="sidebar-content">
        <div class="sidebar-section-title">Main Navigation</div>
        <a href="index.html" class="sidebar-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}">
          <span class="sidebar-link-icon">🏠</span> Home
        </a>
        <a href="cars.html" class="sidebar-link ${currentPage === 'cars.html' ? 'active' : ''}">
          <span class="sidebar-link-icon">🏎️</span> Showroom Fleet
          <span class="sidebar-link-badge">26+</span>
        </a>
        <a href="featured.html" class="sidebar-link ${currentPage === 'featured.html' ? 'active' : ''}">
          <span class="sidebar-link-icon">⭐</span> Featured Supercars
        </a>
        <a href="compare.html" class="sidebar-link ${currentPage === 'compare.html' ? 'active' : ''}">
          <span class="sidebar-link-icon">⚔️</span> Vehicle Comparison Matrix
        </a>
        <a href="calculator.html" class="sidebar-link ${currentPage === 'calculator.html' ? 'active' : ''}">
          <span class="sidebar-link-icon">🧮</span> EMI & Financing Calculator
        </a>
        <a href="testdrive.html" class="sidebar-link ${currentPage === 'testdrive.html' ? 'active' : ''}">
          <span class="sidebar-link-icon">📅</span> Book VIP Test Drive
        </a>

        <div class="sidebar-section-title">Account & Portals</div>
        <a href="profile.html" class="sidebar-link ${currentPage === 'profile.html' ? 'active' : ''}">
          <span class="sidebar-link-icon">👤</span> My VIP Customer Portal
        </a>
        <a href="admin.html" class="sidebar-link ${currentPage === 'admin.html' ? 'active' : ''}">
          <span class="sidebar-link-icon">🛡️</span> Admin Fleet Center
        </a>

        <div class="sidebar-section-title">Quick Fleet Filter</div>
        <a href="cars.html" onclick="sessionStorage.setItem('filter', 'Luxury')" class="sidebar-link">
          <span class="sidebar-link-icon">💎</span> Luxury Flagships
        </a>
        <a href="cars.html" onclick="sessionStorage.setItem('filter', 'Sports')" class="sidebar-link">
          <span class="sidebar-link-icon">🏁</span> Sports & Hypercars
        </a>
        <a href="cars.html" onclick="sessionStorage.setItem('filter', 'SUV')" class="sidebar-link">
          <span class="sidebar-link-icon">🏔️</span> Premium SUVs
        </a>
        <a href="cars.html" onclick="sessionStorage.setItem('filter', 'Electric')" class="sidebar-link">
          <span class="sidebar-link-icon">⚡</span> Pure Electric (EV)
        </a>
      </div>

      <!-- SIDEBAR FOOTER -->
      <div class="sidebar-footer">
        <button class="sidebar-footer-btn" onclick="toggleDarkMode()">
          <span>🌙</span> Toggle Dark / Light Mode
        </button>
        ${
          user
            ? `<button class="sidebar-footer-btn" style="color:#ef4444;" onclick="handleSidebarLogout()">
                <span>🚪</span> Sign Out
              </button>`
            : `<button class="sidebar-footer-btn" style="background:var(--accent-primary);color:white;" onclick="window.location.href='login.html'">
                <span>🔑</span> Sign In / Register
              </button>`
        }
      </div>
    `;

    // Keyboard navigation (ESC to close)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSidebar();
    });
  }

  window.openSidebar = function () {
    const sidebar = document.getElementById("appSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (sidebar) sidebar.classList.add("open");
    if (backdrop) backdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  window.closeSidebar = function () {
    const sidebar = document.getElementById("appSidebar");
    const backdrop = document.getElementById("sidebarBackdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");
    document.body.style.overflow = "";
  };

  window.toggleSidebar = function () {
    const sidebar = document.getElementById("appSidebar");
    if (sidebar && sidebar.classList.contains("open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  };

  window.handleSidebarLogout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("loggedIn");
    if (typeof showToast === "function") {
      showToast("Signed out successfully.", "info");
      setTimeout(() => (window.location.href = "login.html"), 600);
    } else {
      window.location.href = "login.html";
    }
  };

  // Run on DOM load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupSidebar);
  } else {
    setupSidebar();
  }
})();
