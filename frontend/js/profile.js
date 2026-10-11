const API = window.location.origin.includes(":5000") ? "/api" : "http://localhost:5000/api";
const token = localStorage.getItem("token");

function resolveImage(img) {
  if (!img) return "images/mercedes.jpg";
  const clean = img.replace(/^(images[\/\\]+)+/, "").trim();
  return "images/" + clean;
}

function formatINR(val) {
  if (!val) return "₹0";
  return "₹" + Number(val).toLocaleString("en-IN");
}

let profileData = null;

async function loadProfile() {
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${API}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("loggedIn");
      window.location.href = "login.html";
      return;
    }

    if (!res.ok) throw new Error("Could not load profile");

    profileData = await res.json();
    const { user, bookings, purchases } = profileData;

    // Header info
    document.getElementById("userName").innerText = user.name;
    document.getElementById("userEmail").innerText = user.email;
    document.getElementById("userInitial").innerText = user.name.charAt(0).toUpperCase();
    document.getElementById("userRole").innerText = user.role === "admin" ? "🛡️ Administrator" : "⭐ VIP Member";

    document.getElementById("countBookings").innerText = bookings.length;
    document.getElementById("countPurchases").innerText = purchases.length;

    renderBookings(bookings);
    renderPurchases(purchases);
  } catch (err) {
    console.error(err);
    if (typeof showToast === "function") {
      showToast("Error loading account data. Try logging in again.", "error");
    }
  }
}

function renderBookings(bookings) {
  const container = document.getElementById("bookingsList");
  if (!container) return;

  if (bookings.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:50px;background:var(--bg-surface);border-radius:16px;border:1px solid var(--border-subtle);">
        <h3>No test drives scheduled yet</h3>
        <p style="color:var(--text-secondary);margin:10px 0 20px;">Explore the fleet and book an exclusive track or showroom experience.</p>
        <a href="cars.html"><button class="btn-primary">Browse Vehicles</button></a>
      </div>
    `;
    return;
  }

  container.innerHTML = bookings
    .map((b) => {
      const dateStr = new Date(b.bookingDate).toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      const statusClass = `status-${(b.status || "confirmed").toLowerCase()}`;

      return `
      <div class="activity-card">
        <img src="${resolveImage(b.carImage)}" alt="${b.carName}" onerror="this.src='images/mercedes.jpg'">
        <div class="activity-info">
          <h3>${b.carName}</h3>
          <p>📅 <b>Date:</b> ${dateStr} • <b>Slot:</b> ${b.timeSlot || "10:00 AM - 11:30 AM"}</p>
          <p>📍 <b>Location:</b> ${b.locationType || "Showroom Visit"}</p>
          <p>Status: <span class="status-badge ${statusClass}">${b.status || "Confirmed"}</span></p>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <button class="btn-secondary" onclick="viewVIPPass('${b._id}')">🎫 View VIP Pass</button>
          ${
            b.status !== "Cancelled"
              ? `<button class="btn-outline" style="color:#ef4444;" onclick="cancelBooking('${b._id}')">Cancel</button>`
              : ""
          }
        </div>
      </div>
    `;
    })
    .join("");
}

function renderPurchases(purchases) {
  const container = document.getElementById("purchasesList");
  if (!container) return;

  if (purchases.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:50px;background:var(--bg-surface);border-radius:16px;border:1px solid var(--border-subtle);">
        <h3>No vehicle orders recorded</h3>
        <p style="color:var(--text-secondary);margin:10px 0 20px;">Acquire your dream machine from our premier inventory.</p>
        <a href="cars.html"><button class="btn-primary">Visit Showroom</button></a>
      </div>
    `;
    return;
  }

  container.innerHTML = purchases
    .map((p) => {
      const dateStr = new Date(p.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      return `
      <div class="activity-card">
        <img src="${resolveImage(p.carImage)}" alt="${p.carName}" onerror="this.src='images/mercedes.jpg'">
        <div class="activity-info">
          <h3>${p.carName}</h3>
          <p>💰 <b>Order Amount:</b> ${formatINR(p.amount)}</p>
          <p>💳 <b>Method:</b> ${p.payment || "UPI"} • <b>Ref ID:</b> ${p.transactionId || "TXN-CONFIRMED"}</p>
          <p>📅 <b>Ordered on:</b> ${dateStr} • Status: <span class="status-badge status-confirmed">${p.status || "Completed"}</span></p>
        </div>
        <div>
          <button class="btn-primary" onclick="viewInvoiceReceipt('${p.transactionId}', '${encodeURIComponent(p.carName)}', ${p.amount}, '${encodeURIComponent(p.name)}')">🧾 Print Invoice</button>
        </div>
      </div>
    `;
    })
    .join("");
}

function switchTab(tab) {
  if (tab === "bookings") {
    document.getElementById("bookingsSection").style.display = "block";
    document.getElementById("purchasesSection").style.display = "none";
    document.getElementById("tabBookings").classList.add("active");
    document.getElementById("tabPurchases").classList.remove("active");
  } else {
    document.getElementById("bookingsSection").style.display = "none";
    document.getElementById("purchasesSection").style.display = "block";
    document.getElementById("tabPurchases").classList.add("active");
    document.getElementById("tabBookings").classList.remove("active");
  }
}

async function cancelBooking(id) {
  if (!confirm("Are you sure you wish to cancel this VIP test drive booking?")) return;

  try {
    const res = await fetch(`${API}/bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      if (typeof showToast === "function") showToast("Booking cancelled successfully.", "info");
      loadProfile();
    } else {
      alert("Failed to cancel booking.");
    }
  } catch (e) {
    console.error(e);
  }
}

function viewVIPPass(bookingId) {
  const b = profileData.bookings.find((item) => item._id === bookingId);
  if (!b) return;

  const dateStr = new Date(b.bookingDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  document.getElementById("passDetails").innerHTML = `
    <div style="background:var(--bg-primary);padding:18px;border-radius:12px;border:1px dashed var(--border-subtle);">
      <h4 style="margin:0 0 10px;color:var(--accent-primary);">🚗 Vehicle: ${b.carName}</h4>
      <p>👤 <b>VIP Client:</b> ${b.userName}</p>
      <p>📅 <b>Appointment Date:</b> ${dateStr}</p>
      <p>⏰ <b>Slot:</b> ${b.timeSlot || "10:00 AM - 11:30 AM"}</p>
      <p>📍 <b>Format:</b> ${b.locationType || "Showroom Visit"}</p>
      <p>🔒 <b>Pass ID:</b> ${b._id}</p>
      <small style="color:var(--text-secondary);display:block;margin-top:10px;">Please present this digital pass upon arrival at the showroom concierge.</small>
    </div>
  `;
  document.getElementById("passModal").style.display = "flex";
}

function viewInvoiceReceipt(txnId, carName, amount, name) {
  document.getElementById("passDetails").innerHTML = `
    <div style="background:var(--bg-primary);padding:18px;border-radius:12px;border:1px dashed var(--border-subtle);">
      <h3 style="margin:0 0 10px;color:#10b981;">🧾 AutoElite Acquisition Receipt</h3>
      <p>🆔 <b>Transaction Reference:</b> ${txnId}</p>
      <p>👤 <b>Acquired By:</b> ${decodeURIComponent(name)}</p>
      <p>🚗 <b>Model:</b> ${decodeURIComponent(carName)}</p>
      <p>💰 <b>Total Paid:</b> ${formatINR(amount)}</p>
      <p>🔒 <b>Status:</b> Payment Verified (256-Bit SSL)</p>
      <small style="color:var(--text-secondary);display:block;margin-top:10px;">Official documentation and title transfer documents sent to registered email.</small>
    </div>
  `;
  document.getElementById("passModal").style.display = "flex";
}

function closePassModal() {
  document.getElementById("passModal").style.display = "none";
}

function openEditProfile() {
  if (!profileData) return;
  document.getElementById("editName").value = profileData.user.name;
  document.getElementById("editPhone").value = profileData.user.phone || "";
  document.getElementById("editProfileModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editProfileModal").style.display = "none";
}

async function saveProfile(e) {
  e.preventDefault();
  const name = document.getElementById("editName").value.trim();
  const phone = document.getElementById("editPhone").value.trim();

  try {
    const res = await fetch(`${API}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, phone }),
    });

    if (res.ok) {
      if (typeof showToast === "function") showToast("Profile updated successfully!", "success");
      closeEditModal();
      loadProfile();
    } else {
      alert("Failed to update profile");
    }
  } catch (err) {
    console.error(err);
  }
}

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", loadProfile);
