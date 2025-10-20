// ==========================
// Initial Data and Helpers
// ==========================
const cars = load("cars") || [
  {id:1,name:"Toyota Vios",price:2000,img:"https://content.toyota.com.ph/uploads/vehicles/4/001_4_1701833619358_000.jpg"},
  {id:2,name:"Honda City",price:1800,img:"https://img.philkotse.com/2023/08/14/KjJYY7r3/city-v-withmodulo-1-453f-wm-57b7_wm.png"},
  {id:3,name:"Toyota Fortuner",price:4000,img:"https://th.bing.com/th/id/OIP.JeAM20E6pxFKpEhkanefmgHaE8"},
  {id:4,name:"Hyundai Accent",price:1500,img:"https://cdn.shopify.com/s/files/1/1034/4435/products/2017_Hyundai_Accent_2048x.jpg?v=1489146951"}
];
const state = {
  users: load("users") || [],
  currentUser: load("currentUser") || null,
  bookings: load("bookings") || []
};

// ==========================
// Shared Helper Functions
// ==========================
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
function load(k) { return JSON.parse(localStorage.getItem(k) || "null"); }

// ==========================
// User Page (index.html)
// ==========================
if (document.getElementById("carGrid")) {
  const grid = document.getElementById("carGrid");
  document.getElementById("year").textContent = new Date().getFullYear();
  renderCars(cars);

  // Render cars
  function renderCars(list) {
    grid.innerHTML = "";
    list.forEach(c => {
      const el = document.createElement("div");
      el.className = "card";
      el.innerHTML = `
        <img src="${c.img}">
        <h3>${c.name}</h3>
        <div class="muted">₱${c.price}/day</div>
        <button class="btn" onclick="openBook(${c.id})">Rent</button>
      `;
      grid.appendChild(el);
    });
  }

  // Search
  document.getElementById("search").addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    renderCars(cars.filter(c => c.name.toLowerCase().includes(q)));
  });

  // Booking
  let currentCar = null;
  const bookModal = document.getElementById("bookModal");
  window.openBook = function(id) {
    if (!state.currentUser) return alert("Please login first.");
    currentCar = cars.find(c => c.id === id);
    document.getElementById("carName").value = currentCar.name;
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("totalPrice").textContent = "₱0";
    bookModal.style.display = "flex";
  };
  document.getElementById("cancelBook").onclick = () => bookModal.style.display = "none";
  document.getElementById("confirmBook").onclick = () => {
    const s = new Date(document.getElementById("startDate").value);
    const e = new Date(document.getElementById("endDate").value);
    const days = (e - s) / (1000 * 60 * 60 * 24);
    if (days <= 0 || isNaN(days)) return alert("Invalid dates");
    const total = currentCar.price * days;
    const booking = {
      id: Date.now(),
      user: state.currentUser.username,
      car: currentCar.name,
      total
    };
    state.bookings.push(booking);
    save("bookings", state.bookings);
    renderBookings();
    bookModal.style.display = "none";
    alert(`Booked ${currentCar.name} for ₱${total}`);
  };

  // Bookings list + cancel
  function renderBookings() {
    const list = document.getElementById("bookingsList");
    if (!state.currentUser) {
      list.innerHTML = `<p class="muted">Login to see bookings.</p>`;
      return;
    }
    const my = state.bookings.filter(b => b.user === state.currentUser.username);
    if (!my.length) {
      list.innerHTML = `<p class="muted">No bookings yet.</p>`;
      return;
    }
    list.innerHTML = my.map(b => `
      <div class="card">
        <strong>${b.car}</strong> — ₱${b.total}
        <div class="right">
          <button class="btn secondary" onclick="cancelBooking(${b.id})">Cancel</button>
        </div>
      </div>`).join("");
  }

  // Cancel booking
  window.cancelBooking = function(id) {
    if (!confirm("Cancel this booking?")) return;
    state.bookings = state.bookings.filter(b => b.id !== id);
    save("bookings", state.bookings);
    renderBookings();
    alert("Booking canceled.");
  };

  // Auth (login/signup/logout)
  const auth = document.getElementById("authModal");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  document.getElementById("loginBtn").onclick = () => auth.style.display = "flex";
  document.getElementById("logoutBtn").onclick = () => {
    state.currentUser = null;
    localStorage.removeItem("currentUser");
    updateUserUI();
    renderBookings();
  };
  document.getElementById("showSignup").onclick = () => { loginForm.style.display = "none"; signupForm.style.display = "block"; };
  document.getElementById("showLogin").onclick = () => { loginForm.style.display = "block"; signupForm.style.display = "none"; };
  document.getElementById("closeAuth").onclick = () => auth.style.display = "none";
  document.getElementById("closeAuth2").onclick = () => auth.style.display = "none";

  signupForm.onsubmit = e => {
    e.preventDefault();
    const u = suUser.value.trim(), e1 = suEmail.value.trim(), p = suPass.value;
    if (state.users.some(x => x.username === u)) return alert("Username taken");
    state.users.push({ username: u, email: e1, password: p });
    save("users", state.users);
    state.currentUser = { username: u, email: e1 };
    save("currentUser", state.currentUser);
    auth.style.display = "none";
    updateUserUI();
    renderBookings();
    alert("Account created!");
  };
  loginForm.onsubmit = e => {
    e.preventDefault();
    const u = loginUser.value.trim(), p = loginPass.value;
    const found = state.users.find(x => x.username === u && x.password === p);
    if (!found) return alert("Invalid login");
    state.currentUser = { username: found.username, email: found.email };
    save("currentUser", state.currentUser);
    auth.style.display = "none";
    updateUserUI();
    renderBookings();
    alert("Logged in!");
  };

  function updateUserUI() {
    const greet = document.getElementById("userGreeting");
    const login = document.getElementById("loginBtn");
    const logout = document.getElementById("logoutBtn");
    if (state.currentUser) {
      greet.style.display = "inline";
      greet.textContent = `Welcome, ${state.currentUser.username}!`;
      login.style.display = "none";
      logout.style.display = "inline";
    } else {
      greet.style.display = "none";
      login.style.display = "inline";
      logout.style.display = "none";
    }
  }
  updateUserUI();
  renderBookings();
}

// ==========================
// Admin Page (admin.html)
// ==========================
if (document.getElementById("adminCars")) {
  document.getElementById("year").textContent = new Date().getFullYear();

  renderAdminDashboard();

  // Add new car
  document.getElementById("addCar").onclick = () => {
    const name = prompt("Car name?");
    const price = prompt("Price per day?");
    if (!name || !price) return;
    const all = load("cars") || [];
    all.push({ id: Date.now(), name, price: Number(price), img: "https://via.placeholder.com/300x150" });
    save("cars", all);
    alert("Car added!");
    renderAdminDashboard();
  };
}

// Admin rendering functions
function renderAdminDashboard() {
  const cars = load("cars") || [];
  const bookings = load("bookings") || [];
  const carsDiv = document.getElementById("adminCars");
  const bookingsDiv = document.getElementById("adminBookings");

  // Render cars
  carsDiv.innerHTML = cars.length
    ? cars.map(c => `
      <div class="card">
        <strong>${c.name}</strong> — ₱${c.price}/day
        <div class="right">
          <button class="btn secondary" onclick="deleteCar(${c.id}, true)">Delete</button>
        </div>
      </div>`).join("")
    : `<p class="muted">No cars yet.</p>`;

  // Render bookings with cancel
  bookingsDiv.innerHTML = bookings.length
    ? bookings.map(b => `
      <div class="card">
        <strong>${b.user}</strong> — ${b.car}<br>
        <span class="muted">₱${b.total}</span>
        <div class="right">
          <button class="btn secondary" onclick="cancelAdminBooking(${b.id})">Cancel</button>
        </div>
      </div>`).join("")
    : `<p class="muted">No bookings yet.</p>`;
}

// Cancel booking (Admin)
function cancelAdminBooking(id) {
  if (!confirm("Cancel this booking?")) return;
  const bookings = load("bookings") || [];
  const updated = bookings.filter(b => b.id !== id);
  save("bookings", updated);
  alert("Booking canceled by admin.");
  renderAdminDashboard();
}

// Delete car (used by admin + shared)
function deleteCar(id, reloadAdmin = false) {
  if (!confirm("Delete this car?")) return;
  const cars = load("cars") || [];
  const i = cars.findIndex(c => c.id === id);
  if (i >= 0) cars.splice(i, 1);
  save("cars", cars);
  alert("Car deleted!");
  if (reloadAdmin) renderAdminDashboard();
  else if (document.getElementById("carGrid")) renderCars(cars);
}
// ==========================
// Admin Button (from index.html)
// ==========================
const adminBtn = document.getElementById("adminBtn");
if (adminBtn) {
  adminBtn.addEventListener("click", () => {
    const pass = prompt("Enter admin password:");
    if (pass === "admin123") {
      window.location.href = "admin.html";
    } else {
      alert("Incorrect password.");
    }
  });
}
