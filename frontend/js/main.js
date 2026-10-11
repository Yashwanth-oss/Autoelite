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

/* LOAD CARS ON HOMEPAGE */
function loadCars() {
  fetch(`${API}/cars`)
    .then((res) => res.json())
    .then((data) => {
      const container = document.getElementById("carsContainer");
      if (!container) return;

      container.innerHTML = "";

      // Show top 6 cars on index page
      const displayCars = data.slice(0, 6);

      displayCars.forEach((car) => {
        const carId = car._id || car.id;
        const imgSrc = resolveImage(car.image);

        container.innerHTML += `
          <div class="car-card">
            <div class="card-img-wrap">
              <img src="${imgSrc}" alt="${car.name}" onerror="this.src='images/mercedes.jpg'">
              <span class="category-badge">${car.category || "Luxury"}</span>
            </div>
            <div class="card-body">
              <h3>${car.name}</h3>
              <p class="brand"><b>Brand:</b> ${car.brand}</p>
              <p class="price"><b>Price:</b> ${formatPrice(car.price)}</p>
              ${car.power ? `<p class="specs-preview">⚡ ${car.power} • ${car.acceleration || "Performance"}</p>` : ""}
              
              <div class="card-actions">
                <button class="btn-primary" onclick="openBuyForm('${carId}', '${encodeURIComponent(car.name)}', '${encodeURIComponent(car.image)}')">💳 Buy</button>
                <button class="btn-secondary" onclick="openTestDrive('${carId}', '${encodeURIComponent(car.name)}', '${encodeURIComponent(car.image)}')">📅 Test Drive</button>
                <button class="btn-outline" onclick="window.location.href='car-details.html?id=${carId}'">🔍 Details</button>
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
        container.innerHTML = `<div style="text-align:center;color:#888;padding:30px;">Error loading vehicles from server. Verify backend is running.</div>`;
      }
    });
}

function openTestDrive(carId, name, image) {
  window.location.href = `testdrive.html?id=${carId}&name=${name}&image=${image}`;
}

function openBuyForm(carId, name, image) {
  window.location.href = `purchase.html?id=${carId}&name=${name}&image=${image}`;
}

/* SEARCH CARS */
function searchCars() {
  const input = document.getElementById("search").value.toLowerCase();
  const cars = document.querySelectorAll(".car-card");

  cars.forEach((car) => {
    const text = car.innerText.toLowerCase();
    if (text.includes(input)) {
      car.style.display = "block";
    } else {
      car.style.display = "none";
    }
  });
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

window.addEventListener("DOMContentLoaded", loadCars);