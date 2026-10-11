const API = window.location.origin.includes(":5000") ? "/api" : "http://localhost:5000/api";

let carsList = [];
let selectedCar = null;

function formatINR(val) {
  if (!val) return "₹0";
  return "₹" + Math.round(val).toLocaleString("en-IN");
}

async function initCalculator() {
  try {
    const res = await fetch(`${API}/cars`);
    carsList = await res.json();

    const select = document.getElementById("calcCarSelect");
    if (!select || !carsList || carsList.length === 0) return;

    select.innerHTML =
      `<option value="custom">-- Custom Price / Manual --</option>` +
      carsList.map((c) => `<option value="${c._id || c.id}">${c.name} (${formatINR(c.price)})</option>`).join("");

    // Check if ID was passed in query params
    const urlParams = new URLSearchParams(window.location.search);
    const passedId = urlParams.get("id");

    if (passedId) {
      select.value = passedId;
    } else {
      select.value = carsList[0]._id || carsList[0].id;
    }

    handleCarSelect();
  } catch (err) {
    console.error(err);
  }
}

function handleCarSelect() {
  const select = document.getElementById("calcCarSelect");
  const id = select.value;

  if (id === "custom") {
    selectedCar = null;
  } else {
    selectedCar = carsList.find((c) => (c._id || c.id) === id);
    if (selectedCar) {
      document.getElementById("sliderPrice").value = selectedCar.price;
    }
  }

  calculateEMI();
}

function calculateEMI() {
  const price = Number(document.getElementById("sliderPrice").value);
  const downPct = Number(document.getElementById("sliderDownPct").value);
  const tenureMonths = Number(document.getElementById("sliderTenure").value);
  const annualRate = Number(document.getElementById("sliderRate").value);

  const downAmount = price * (downPct / 100);
  const principal = price - downAmount;

  document.getElementById("valPrice").innerText = formatINR(price);
  document.getElementById("valDownPct").innerText = `${downPct}%`;
  document.getElementById("valDown").innerText = formatINR(downAmount);
  document.getElementById("valTenure").innerText = `${tenureMonths} Months (${tenureMonths / 12} Years)`;
  document.getElementById("valRate").innerText = `${annualRate}% p.a.`;

  // EMI formula: [P x R x (1+R)^N] / [(1+R)^N - 1]
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const totalRepayment = emi * tenureMonths;
  const totalInterest = totalRepayment - principal;

  document.getElementById("resEMI").innerText = formatINR(emi);
  document.getElementById("resPrincipal").innerText = formatINR(principal);
  document.getElementById("resInterest").innerText = formatINR(totalInterest);
  document.getElementById("resTotal").innerText = formatINR(totalRepayment);
}

function proceedToBooking() {
  if (selectedCar) {
    window.location.href = `purchase.html?id=${selectedCar._id || selectedCar.id}&name=${encodeURIComponent(
      selectedCar.name
    )}&image=${encodeURIComponent(selectedCar.image)}`;
  } else {
    window.location.href = "cars.html";
  }
}

window.addEventListener("DOMContentLoaded", initCalculator);
