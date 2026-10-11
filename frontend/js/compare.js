const API = window.location.origin.includes(":5000") ? "/api" : "http://localhost:5000/api";

let allCars = [];

function resolveImage(img) {
  if (!img) return "images/mercedes.jpg";
  const clean = img.replace(/^(images[\/\\]+)+/, "").trim();
  return "images/" + clean;
}

function formatINR(val) {
  if (!val) return "₹0";
  return "₹" + Number(val).toLocaleString("en-IN");
}

async function initCompare() {
  try {
    const res = await fetch(`${API}/cars`);
    allCars = await res.json();

    if (!allCars || allCars.length === 0) return;

    const s1 = document.getElementById("selectCar1");
    const s2 = document.getElementById("selectCar2");

    s1.innerHTML = allCars.map((c, i) => `<option value="${c._id || c.id}" ${i === 0 ? "selected" : ""}>${c.name} (${c.brand})</option>`).join("");
    s2.innerHTML = allCars.map((c, i) => `<option value="${c._id || c.id}" ${i === 1 ? "selected" : ""}>${c.name} (${c.brand})</option>`).join("");

    updateComparison();
  } catch (err) {
    console.error("Comparison load error:", err);
  }
}

function renderCarColumn(car, targetId) {
  const col = document.getElementById(targetId);
  if (!col || !car) return;

  const imgSrc = resolveImage(car.image);
  const carId = car._id || car.id;

  col.innerHTML = `
    <img src="${imgSrc}" alt="${car.name}" onerror="this.src='images/mercedes.jpg'">
    <div class="compare-body">
      <span class="category-badge" style="position:static;display:inline-block;margin-bottom:8px;">${car.category || "Luxury"}</span>
      <h2 style="font-family:var(--font-heading);font-size:1.6rem;margin-bottom:4px;">${car.name}</h2>
      <p style="color:var(--text-secondary);margin-bottom:12px;"><b>Manufacturer:</b> ${car.brand}</p>
      <h3 style="font-size:1.8rem;color:#10b981;font-weight:800;margin-bottom:15px;">${formatINR(car.price)}</h3>

      <table class="compare-table">
        <tr>
          <td>⚡ Horsepower</td>
          <td class="highlight-stat">${car.power || "N/A"}</td>
        </tr>
        <tr>
          <td>⏱️ 0-100 km/h</td>
          <td class="highlight-stat">${car.acceleration || "N/A"}</td>
        </tr>
        <tr>
          <td>🏁 Top Speed</td>
          <td>${car.topSpeed || "N/A"}</td>
        </tr>
        <tr>
          <td>⛽ Powertrain / Fuel</td>
          <td>${car.fuelType || "Petrol"}</td>
        </tr>
        <tr>
          <td>🏷️ Segment Class</td>
          <td>${car.category || "Luxury"}</td>
        </tr>
      </table>

      <div style="background:var(--bg-primary);padding:14px;border-radius:10px;font-size:0.86rem;line-height:1.5;margin-bottom:20px;color:var(--text-secondary);">
        <b>Engineering Highlights:</b><br>
        ${car.specs || "Handcrafted engineering and acoustic insulation."}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <button class="btn-primary" onclick="window.location.href='purchase.html?id=${carId}&name=${encodeURIComponent(car.name)}&image=${encodeURIComponent(car.image)}'">💳 Buy</button>
        <button class="btn-secondary" onclick="window.location.href='testdrive.html?id=${carId}&name=${encodeURIComponent(car.name)}&image=${encodeURIComponent(car.image)}'">📅 Test Drive</button>
      </div>
    </div>
  `;
}

function updateComparison() {
  const id1 = document.getElementById("selectCar1").value;
  const id2 = document.getElementById("selectCar2").value;

  const car1 = allCars.find((c) => (c._id || c.id) === id1) || allCars[0];
  const car2 = allCars.find((c) => (c._id || c.id) === id2) || allCars[1];

  renderCarColumn(car1, "colCar1");
  renderCarColumn(car2, "colCar2");
}

window.addEventListener("DOMContentLoaded", initCompare);
