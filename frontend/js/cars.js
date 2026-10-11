const API = window.location.origin.includes(":5000") ? "/api" : "http://localhost:5000/api";

function formatPrice(num) {
  if (!num) return "₹0";
  return "₹" + Number(num).toLocaleString("en-IN");
}

function resolveImage(img) {
  if (!img) return "images/mercedes.jpg";
  const clean = img.replace(/^(images[\/\\]+)+/, "").trim();
  return "images/" + clean;
}

/* LOAD CARS */
function loadCars(filterCategory = "all", featuredOnly = false) {
  let url = `${API}/cars`;
  const params = [];
  if (filterCategory && filterCategory !== "all") params.push(`category=${encodeURIComponent(filterCategory)}`);
  if (featuredOnly) params.push("featured=true");
  if (params.length > 0) url += `?${params.join("&")}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("carsContainer");
      if (!container) return;

      container.innerHTML = "";

      if (!data || data.length === 0) {
        container.innerHTML = `<div style="text-align:center;width:100%;padding:40px;color:var(--text-secondary);">No vehicles found in this category.</div>`;
        return;
      }

      data.forEach((car) => {
        const carId = car._id || car.id;
        const imgSrc = resolveImage(car.image);

        container.innerHTML += `
          <div class="car-card" data-category="${car.category || 'Luxury'}">
            <div class="card-img-wrap">
              <img src="${imgSrc}" alt="${car.name}" onerror="this.src='images/mercedes.jpg'">
              <span class="category-badge">${featuredOnly ? '⭐ FEATURED' : (car.category || 'Luxury')}</span>
            </div>
            <div class="card-body">
              <h3>${car.name}</h3>
              <p class="brand"><b>Brand:</b> ${car.brand}</p>
              <p class="price"><b>Price:</b> ${formatPrice(car.price)}</p>
              ${car.power ? `<p class="specs-preview">⚡ ${car.power} • 0-100: ${car.acceleration || 'N/A'}</p>` : ''}
              <div class="card-actions">
                <button class="btn-primary" onclick="buyCar('${carId}', '${encodeURIComponent(car.name)}', '${encodeURIComponent(car.image)}')">💳 Buy</button>
                <button class="btn-secondary" onclick="testDrive('${carId}', '${encodeURIComponent(car.name)}', '${encodeURIComponent(car.image)}')">📅 Test Drive</button>
                <button class="btn-outline" onclick="viewDetails('${carId}')">🔍 Details</button>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch((err) => {
      console.error("Error loading cars:", err);
      const container = document.getElementById("carsContainer");
      if (container) {
        container.innerHTML = `<div style="text-align:center;color:#e74c3c;padding:30px;">Error loading cars from MongoDB. Please verify server is running.</div>`;
      }
    });
}

/* BUY CAR */
function buyCar(id, name, image) {
  window.location.href = `purchase.html?id=${id}&name=${name}&image=${image}`;
}

/* TEST DRIVE */
function testDrive(id, name, image) {
  window.location.href = `testdrive.html?id=${id}&name=${name}&image=${image}`;
}

/* VIEW DETAILS */
function viewDetails(id) {
  window.location.href = `car-details.html?id=${id}`;
}

/* SEARCH CARS */
function searchCars() {
  const input = document.getElementById("search").value.toLowerCase();
  const cars = document.querySelectorAll(".car-card");

  cars.forEach((car) => {
    const text = car.innerText.toLowerCase();
    if (text.includes(input)) {
      car.style.display = "flex";
    } else {
      car.style.display = "none";
    }
  });
}

/* CATEGORY FILTER */
function filterCategory(category) {
  document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
  const clickedBtn = document.getElementById(`filter-${category.toLowerCase()}`);
  if (clickedBtn) clickedBtn.classList.add("active");
  loadCars(category);
}

/* LOGOUT */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("loggedIn");
  if (typeof showToast === "function") {
    showToast("Signed out successfully.", "info");
    setTimeout(() => (window.location.href = "login.html"), 600);
  } else {
    window.location.href = "login.html";
  }
}

/* AUTO INITIALIZATION */
window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("carsContainer");
  if (!container) return;

  // Avoid running default "all" if this is featured page
  if (window.location.pathname.includes("featured.html")) return;

  const initialCategory = sessionStorage.getItem("filter") || "all";
  sessionStorage.removeItem("filter");
  filterCategory(initialCategory);
});