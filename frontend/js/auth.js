const API_BASE = window.location.origin.includes(":5000") ? "/api" : "http://localhost:5000/api";

// Helper toast trigger
function notify(msg, type = "success") {
  if (typeof showToast === "function") {
    showToast(msg, type);
  } else {
    alert(msg);
  }
}

// REGISTER
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("loggedIn", "true");

        notify("Account registered successfully! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = "profile.html";
        }, 1200);
      } else {
        notify(data.message || "Registration failed. Try again.", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error connecting to server. Make sure MongoDB backend is running.", "error");
    }
  });
}

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("loggedIn", "true");

        notify(`Welcome back, ${data.user.name}!`, "success");

        setTimeout(() => {
          if (data.user.role === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "profile.html";
          }
        }, 1000);
      } else {
        notify(data.message || "Invalid Email or Password", "error");
      }
    } catch (err) {
      console.error(err);
      notify("Error connecting to server. Make sure backend is running.", "error");
    }
  });
}