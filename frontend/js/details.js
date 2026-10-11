const API = window.location.origin.includes(":5000") ? "/api" : "http://localhost:5000/api";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

function resolveImage(img) {
  if (!img) return "images/mercedes.jpg";
  const clean = img.replace(/^(images[\/\\]+)+/, "").trim();
  return "images/" + clean;
}

function formatPrice(num) {
  if (!num) return "₹0";
  return "₹" + Number(num).toLocaleString("en-IN");
}

if (!id) {
  document.getElementById("carDetails").innerHTML = `
    <div style="text-align:center;padding:40px;">
      <h3>No car selected.</h3>
      <a href="cars.html"><button class="btn-primary">Browse All Cars</button></a>
    </div>
  `;
} else {
  fetch(`${API}/cars/${id}`)
    .then((res) => {
      if (!res.ok) throw new Error("Car not found");
      return res.json();
    })
    .then((c) => {
      const car = Array.isArray(c) ? c[0] : c;
      const imgSrc = resolveImage(car.image);
      const carId = car._id || car.id;

      document.getElementById("carDetails").innerHTML = `
        <div class="detail-card">
          <div class="detail-image-box">
            <img src="${imgSrc}" alt="${car.name}" onerror="this.src='images/mercedes.jpg'">
          </div>
          <div class="detail-info">
            <span class="detail-badge">${car.category || "Luxury"}</span>
            <h2>${car.name}</h2>
            <p class="detail-brand"><b>Brand:</b> ${car.brand}</p>
            <h3 class="detail-price">${formatPrice(car.price)}</h3>
            
            <div class="specs-grid">
              ${car.power ? `<div class="spec-pill"><span>Horsepower</span><b>${car.power}</b></div>` : ""}
              ${car.acceleration ? `<div class="spec-pill"><span>0-100 km/h</span><b>${car.acceleration}</b></div>` : ""}
              ${car.topSpeed ? `<div class="spec-pill"><span>Top Speed</span><b>${car.topSpeed}</b></div>` : ""}
              ${car.fuelType ? `<div class="spec-pill"><span>Fuel Type</span><b>${car.fuelType}</b></div>` : ""}
            </div>

            <div class="detail-description">
              <h4>Overview & Technical Specifications</h4>
              <p>${car.specs || "Premium luxury engineering with unmatched comfort and performance."}</p>
            </div>

            <div class="detail-buttons">
              <button class="btn-primary" onclick="window.location.href='purchase.html?id=${carId}&name=${encodeURIComponent(car.name)}&image=${encodeURIComponent(car.image)}'">💳 Buy Vehicle</button>
              <button class="btn-secondary" onclick="window.location.href='testdrive.html?id=${carId}&name=${encodeURIComponent(car.name)}&image=${encodeURIComponent(car.image)}'">📅 Book Test Drive</button>
              <button class="btn-outline" onclick="window.location.href='calculator.html?id=${carId}'">🧮 Calculate Monthly EMI</button>
              <button class="btn-outline" onclick="window.location.href='compare.html'">⚔️ Compare with Other Cars</button>
              <button class="btn-outline" onclick="window.location.href='cars.html'">← Back to Showroom</button>
            </div>
          </div>
        </div>
      `;
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("carDetails").innerHTML = `
        <div style="text-align:center;padding:40px;color:#e74c3c;">
          <h3>Failed to load vehicle details.</h3>
          <p>${err.message}</p>
          <a href="cars.html"><button class="btn-primary">Back to Showroom</button></a>
        </div>
      `;
    });
}