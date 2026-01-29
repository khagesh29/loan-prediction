const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const formTitle = document.getElementById("form-title");
const toggleText = document.getElementById("toggle-text");

// Toggle Login / Signup
function toggleForms() {
  loginForm.classList.toggle("active");
  signupForm.classList.toggle("active");

  if (signupForm.classList.contains("active")) {
    formTitle.textContent = "Create Account";
    toggleText.innerHTML =
      `Already have an account? <a onclick="toggleForms()">Login</a>`;
  } else {
    formTitle.textContent = "Login Account";
    toggleText.innerHTML =
      `Don't have an account? <a onclick="toggleForms()">Sign Up</a>`;
  }
}

// Signup Logic
signupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("new-password").value;

  if (!fullname || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  if (users.some(user => user.email === email)) {
    alert("Email already registered");
    return;
  }

  users.push({ fullname, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup successful!");
  signupForm.reset();
  toggleForms();
});

// Login Logic (NO redirect, NO page change)
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const validUser = users.find(
    user => user.email === email && user.password === password
  );

  if (validUser) {
    alert("Login successful!");
    // NOTHING ELSE HAPPENS HERE
  } else {
    alert("Invalid email or password");
  }
});
