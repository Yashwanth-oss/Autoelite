// AUTOELITE THEME & DARK MODE MANAGER

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

window.toggleDarkMode = toggleDarkMode;
window.toggleDark = toggleDarkMode;

// Auto-apply saved preference immediately
(function initTheme() {
  const saved = localStorage.getItem("theme") || localStorage.getItem("dark");
  if (saved === "dark" || saved === "true") {
    document.body.classList.add("dark");
  }
})();