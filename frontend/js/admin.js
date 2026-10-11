const API = window.location.origin.includes(":5000") ? "/api" : "http://localhost:5000/api";
const token = localStorage.getItem("token");

function formatINR(val) {
  if (!val) return "₹0";
  return "₹" + Number(val).toLocaleString("en-IN");
}

function resolveImage(img) {
  if (!img) return "images/mercedes.jpg";
  const clean = img.replace(/^(images[\/\\]+)+/, "").trim();
  return "images/" + clean;
}

let fleetList = [];

// Handle image file upload directly to backend
async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const statusText = document.getElementById("uploadStatusText");
  const preview = document.getElementById("imgPreview");

  statusText.innerText = "Uploading photo to server...";

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`${API}/cars/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById("image").value = data.filename;
      statusText.innerText = `Uploaded: ${data.filename}`;
      preview.src = resolveImage(data.filename);
      preview.style.display = "block";
      if (typeof showToast === "function") showToast("Image uploaded successfully!", "success");
    } else {
      statusText.innerText = "Upload failed. Try again.";
      if (typeof showToast === "function") showToast(data.message || "Upload error", "error");
    }
  } catch (err) {
    console.error(err);
    statusText.innerText = "Server upload error.";
  }
}

async function loadAnalytics() {
  try {
    const res = await fetch(`${API}/admin/analytics`);
    if (!res.ok) throw new Error("Failed to load metrics");
    const data = await res.json();

    document.getElementById("statCars").innerText = data.cars ?? 0;
    document.getElementById("statUsers").innerText = data.users ?? 0;
    document.getElementById("statBookings").innerText = data.bookings ?? 0;
    document.getElementById("statPurchases").innerText = data.purchases ?? 0;
    document.getElementById("statRevenue").innerText = formatINR(data.revenue);

    // Bookings table with dynamic status dropdown
    const bBody = document.getElementById("bookingsTableBody");
    if (bBody && data.recentBookings) {
      if (data.recentBookings.length === 0) {
        bBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No bookings recorded yet.</td></tr>`;
      } else {
        bBody.innerHTML = data.recentBookings
          .map((b) => {
            const dateStr = new Date(b.bookingDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
            return `
            <tr>
              <td><b>${b.userName || "Customer"}</b><br><small style="color:#64748b;">${b.phone || b.email}</small></td>
              <td>${b.carName || "Vehicle"}</td>
              <td>${dateStr}<br><small style="color:#64748b;">${b.timeSlot || ""}</small></td>
              <td>
                <select style="padding:4px 8px;border-radius:6px;border:1px solid var(--border-subtle);font-size:0.8rem;background:var(--bg-primary);color:var(--text-primary);" onchange="updateBookingStatus('${b._id}', this.value)">
                  <option value="Confirmed" ${b.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                  <option value="Completed" ${b.status === "Completed" ? "selected" : ""}>Completed</option>
                  <option value="Cancelled" ${b.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                </select>
              </td>
            </tr>
          `;
          })
          .join("");
      }
    }

    // Purchases table
    const pBody = document.getElementById("purchasesTableBody");
    if (pBody && data.recentPurchases) {
      if (data.recentPurchases.length === 0) {
        pBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No vehicle orders recorded yet.</td></tr>`;
      } else {
        pBody.innerHTML = data.recentPurchases
          .map(
            (p) => `
          <tr>
            <td><b>${p.name || "Buyer"}</b></td>
            <td>${p.carName || "Vehicle"}</td>
            <td>${formatINR(p.amount)}</td>
            <td><small style="color:#64748b;">${p.transactionId || "TXN"}</small></td>
          </tr>
        `
          )
          .join("");
      }
    }

    loadFleet();
  } catch (err) {
    console.error("Error loading analytics:", err);
  }
}

// Load Full Fleet for Inventory Management
async function loadFleet() {
  try {
    const res = await fetch(`${API}/cars`);
    fleetList = await res.json();

    document.getElementById("fleetCount").innerText = fleetList.length;

    const tbody = document.getElementById("fleetTableBody");
    if (!tbody) return;

    if (fleetList.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#94a3b8;">No cars found in fleet.</td></tr>`;
      return;
    }

    tbody.innerHTML = fleetList
      .map(
        (c) => `
      <tr>
        <td><img src="${resolveImage(c.image)}" style="width:60px;height:40px;object-fit:cover;border-radius:6px;" onerror="this.src='images/mercedes.jpg'"></td>
        <td><b>${c.name}</b></td>
        <td>${c.brand}</td>
        <td><span class="category-badge" style="position:static;display:inline-block;">${c.category || "Luxury"}</span></td>
        <td>${formatINR(c.price)}</td>
        <td>${c.power || "N/A"}</td>
        <td>
          <button class="action-btn btn-edit" onclick="openEditCar('${c._id || c.id}')">✏️ Edit</button>
          <button class="action-btn btn-del" onclick="deleteCar('${c._id || c.id}', '${encodeURIComponent(c.name)}')">🗑️ Del</button>
        </td>
      </tr>
    `
      )
      .join("");
  } catch (err) {
    console.error(err);
  }
}

// Delete vehicle from MongoDB
async function deleteCar(id, encodedName) {
  const name = decodeURIComponent(encodedName);
  if (!confirm(`Are you sure you want to permanently delete "${name}" from MongoDB?`)) return;

  try {
    const res = await fetch(`${API}/cars/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      if (typeof showToast === "function") showToast(`Deleted "${name}" from database.`, "info");
      loadAnalytics();
    } else {
      alert("Failed to delete vehicle.");
    }
  } catch (err) {
    console.error(err);
  }
}

// Open Edit Car Modal
function openEditCar(id) {
  const car = fleetList.find((c) => (c._id || c.id) === id);
  if (!car) return;

  document.getElementById("editCarId").value = car._id || car.id;
  document.getElementById("editName").value = car.name;
  document.getElementById("editPrice").value = car.price;
  document.getElementById("editPower").value = car.power || "";
  document.getElementById("editSpecs").value = car.specs || "";

  document.getElementById("editCarModal").style.display = "flex";
}

function closeEditCarModal() {
  document.getElementById("editCarModal").style.display = "none";
}

// Save edited vehicle to MongoDB
async function saveCarEdit(e) {
  e.preventDefault();
  const id = document.getElementById("editCarId").value;

  const payload = {
    name: document.getElementById("editName").value.trim(),
    price: Number(document.getElementById("editPrice").value),
    power: document.getElementById("editPower").value.trim(),
    specs: document.getElementById("editSpecs").value.trim(),
  };

  try {
    const res = await fetch(`${API}/cars/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      if (typeof showToast === "function") showToast("Vehicle details updated successfully in MongoDB!", "success");
      closeEditCarModal();
      loadAnalytics();
    } else {
      alert("Failed to update vehicle");
    }
  } catch (err) {
    console.error(err);
  }
}

// Update booking status from dropdown
async function updateBookingStatus(bookingId, status) {
  try {
    const res = await fetch(`${API}/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      if (typeof showToast === "function") showToast(`Booking status updated to ${status}`, "success");
    } else {
      alert("Failed to update booking status.");
    }
  } catch (err) {
    console.error(err);
  }
}

// Add car form submission
const addCarForm = document.getElementById("addCarForm");
if (addCarForm) {
  addCarForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const btn = document.getElementById("submitCarBtn");
    btn.disabled = true;
    btn.innerText = "Saving to MongoDB...";

    const payload = {
      name: document.getElementById("name").value.trim(),
      brand: document.getElementById("brand").value.trim(),
      price: document.getElementById("price").value,
      category: document.getElementById("category").value,
      image: document.getElementById("image").value.trim(),
      power: document.getElementById("power").value.trim(),
      specs: document.getElementById("specs").value.trim(),
    };

    try {
      const res = await fetch(`${API}/cars/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if (typeof showToast === "function") showToast("New vehicle successfully added to MongoDB!", "success");
        addCarForm.reset();
        document.getElementById("imgPreview").style.display = "none";
        document.getElementById("uploadStatusText").innerText = "📸 Click to upload image file";
        loadAnalytics();
      } else {
        if (typeof showToast === "function") showToast(data.message || "Failed to add car", "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.innerText = "Add Vehicle to MongoDB";
    }
  });
}

window.addEventListener("DOMContentLoaded", loadAnalytics);