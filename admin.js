/* =========================================================
   HAZI DADA TRAVELS — ADMIN (admin.js)
   =========================================================
   ⚠️ PROTOTYPE AUTHENTICATION ⚠️
   This is a client-only demo login so the Admin Panel is
   usable immediately, with no backend required. It is NOT
   secure enough for a public production deployment — anyone
   with browser DevTools can inspect client-side JavaScript.
   The project is structured so this can be swapped for real
   authentication (Supabase Auth, or any backend) later:
   just replace adminLogin()/isAdminLoggedIn()/adminLogout()
   below with real API calls — nothing else in this file
   needs to change, since the rest of the CRUD UI only calls
   the data-layer functions from js/data.js.

   The password is hashed with SHA-256 (Web Crypto, built into
   every modern browser) before being stored, so it is at
   least not sitting in localStorage in plain text — but this
   is still a client-side check, not a substitute for real
   server-side authentication.
   ========================================================= */

async function adminLogin(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error || !data.session) {
    return false;
  }

  return true;
}

async function isAdminLoggedIn() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return !!session;
}

async function adminLogout() {
  await supabaseClient.auth.signOut();
}

async function requireAdminAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return false;
  }

  return true;
}

/* ---------------------------------------------------------
   FILE → BASE64 HELPER (used by every image upload field)
   --------------------------------------------------------- */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!file.type.startsWith("image/")) return reject(new Error("Only image files are allowed."));
    if (file.size > 5 * 1024 * 1024) return reject(new Error("Image is too large (max 5MB)."));
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

/* ---------------------------------------------------------
   TOAST
   --------------------------------------------------------- */
function adminToast(message, type = "info") {
  let container = document.querySelector(".a-toast-container");
  if (!container) { container = document.createElement("div"); container.className = "a-toast-container"; document.body.appendChild(container); }
  const el = document.createElement("div");
  el.className = `a-toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3000);
}
function escapeHtmlA(s) { return String(s === undefined || s === null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])); }
function renderStarsA(rating) { let out = ""; for (let i = 1; i <= 5; i++) out += i <= rating ? "★" : "☆"; return out; }
function confirmA(msg) { return window.confirm(msg); }

/* =========================================================
   DASHBOARD SHELL (panel switching)
   ========================================================= */
function showAdminPanel(name) {
  document.querySelectorAll(".admin-panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + name));
  document.querySelectorAll("[data-panel]").forEach(a => a.classList.toggle("active", a.dataset.panel === name));
  if (name === "dashboard") renderDashboardStats();
  if (name === "trips") renderTripsPanel();
  if (name === "vehicles") renderVehiclesPanel();
  if (name === "gallery") renderGalleryPanel();
  if (name === "videos") renderVideosPanel();
  if (name === "reviews") renderReviewsPanel();
  if (name === "settings") renderSettingsPanel();
}
function initAdminNav() {
  document.querySelectorAll("[data-panel]").forEach(a => {
    a.addEventListener("click", e => { e.preventDefault(); showAdminPanel(a.dataset.panel); });
  });
  document.querySelectorAll(".a-logout-btn").forEach(b => b.addEventListener("click", () => { adminLogout(); window.location.href = "login.html"; }));
}

async function renderDashboardStats() {
  const [trips, vehicles, gallery, videos, reviews] = await Promise.all([getTrips(), getVehicles(), getGallery(), getVideos(), getReviews()]);
  document.getElementById("stat-trips").textContent = trips.length;
  document.getElementById("stat-vehicles").textContent = vehicles.length;
  document.getElementById("stat-vehicles-available").textContent = vehicles.filter(v => v.available).length;
  document.getElementById("stat-gallery").textContent = gallery.length;
  document.getElementById("stat-videos").textContent = videos.length;
  document.getElementById("stat-reviews").textContent = reviews.length;
}

/* =========================================================
   TRIPS PANEL
   ========================================================= */
async function renderTripsPanel() {
  const list = document.getElementById("trips-list");
  list.innerHTML = `<div class="a-empty">Loading...</div>`;
  const trips = await getTrips();
  list.innerHTML = trips.length ? trips.map(tripRowHtml).join("") : `<div class="a-empty">No trips yet. Click "+ Add Trip" to create one.</div>`;
  list.querySelectorAll("[data-edit-trip]").forEach(b => b.addEventListener("click", () => openTripModal(parseInt(b.dataset.editTrip, 10))));
  list.querySelectorAll("[data-delete-trip]").forEach(b => b.addEventListener("click", async () => {
    if (!confirmA("Delete this trip? This cannot be undone.")) return;
    await deleteTrip(parseInt(b.dataset.deleteTrip, 10));
    adminToast("Trip deleted successfully.", "success");
    renderTripsPanel(); renderDashboardStats();
  }));
}
function tripRowHtml(trip) {
  return `
    <div class="a-item-card">
      <img src="${trip.image}" alt="${escapeHtmlA(trip.name)}">
      <div class="a-item-info">
        <h3>${escapeHtmlA(trip.name)}</h3>
        <p>${escapeHtmlA(trip.destination)} · ${escapeHtmlA(trip.category)} · ${escapeHtmlA(trip.duration)} · ${escapeHtmlA(trip.price)}</p>
        <div class="a-item-actions">
          <button class="a-btn a-btn-outline a-btn-small" data-edit-trip="${trip.id}">Edit</button>
          <button class="a-btn a-btn-danger a-btn-small" data-delete-trip="${trip.id}">Delete</button>
        </div>
      </div>
    </div>
  `;
}
async function openTripModal(id) {
  const trips = id ? await getTrips() : [];
  const trip = id ? trips.find(t => t.id === id) : null;
  const vehicles = await getVehicles();

  const modal = document.getElementById("trip-modal");
  document.getElementById("trip-modal-title").textContent = trip ? "Edit Trip" : "Add Trip";
  const f = document.getElementById("trip-form");
  f.reset();
  f.dataset.id = trip ? trip.id : "";
  f.name.value = trip ? trip.name : "";
  f.destination.value = trip ? trip.destination : "";
  f.category.value = trip ? trip.category : "One Day";
  f.duration.value = trip ? trip.duration : "";
  f.price.value = trip ? trip.price : "";
  f.description.value = trip ? trip.description : "";
  f.highlights.value = trip ? (trip.highlights || []).join("\n") : "";
  document.getElementById("trip-image-preview").src = trip ? trip.image : PLACEHOLDER_FALLBACK;
  f.dataset.existingImage = trip ? trip.image : "";
  f.dataset.existingGallery = trip ? JSON.stringify(trip.gallery || []) : "[]";
  renderTripGalleryPreview(JSON.parse(f.dataset.existingGallery));

  const vehicleList = document.getElementById("trip-vehicle-checkboxes");
  vehicleList.innerHTML = vehicles.length ? vehicles.map(v => `
    <label><input type="checkbox" value="${v.id}" ${trip && trip.vehicleIds && trip.vehicleIds.includes(v.id) ? "checked" : ""}> ${escapeHtmlA(v.name)} — ${escapeHtmlA(v.capacity)}</label>
  `).join("") : `<p class="muted" style="margin:0;font-size:.85rem;">No vehicles yet — add one in the Vehicles tab first.</p>`;

  modal.classList.add("open");
}
function renderTripGalleryPreview(images) {
  const wrap = document.getElementById("trip-gallery-preview");
  wrap.innerHTML = images.map((src, i) => `
    <div style="position:relative;display:inline-block;margin:0 .4rem .4rem 0;">
      <img src="${src}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
      <button type="button" data-remove-gallery-img="${i}" style="position:absolute;top:-6px;right:-6px;background:#c0392b;color:#fff;border:none;width:20px;height:20px;border-radius:50%;font-size:.7rem;line-height:1;">×</button>
    </div>
  `).join("");
  wrap.querySelectorAll("[data-remove-gallery-img]").forEach(btn => {
    btn.addEventListener("click", () => {
      const f = document.getElementById("trip-form");
      const imgs = JSON.parse(f.dataset.existingGallery);
      imgs.splice(parseInt(btn.dataset.removeGalleryImg, 10), 1);
      f.dataset.existingGallery = JSON.stringify(imgs);
      renderTripGalleryPreview(imgs);
    });
  });
}
function closeTripModal() { document.getElementById("trip-modal").classList.remove("open"); }

function initTripForm() {
  document.getElementById("add-trip-btn").addEventListener("click", () => openTripModal(null));
  document.getElementById("trip-modal-close").addEventListener("click", closeTripModal);
  document.getElementById("trip-image-input").addEventListener("change", async e => {
    try {
      const dataUrl = await fileToDataUrl(e.target.files[0]);
      if (dataUrl) { document.getElementById("trip-image-preview").src = dataUrl; document.getElementById("trip-form").dataset.newImage = dataUrl; }
    } catch (err) { adminToast(err.message, "error"); }
  });
  document.getElementById("trip-gallery-input").addEventListener("change", async e => {
    const f = document.getElementById("trip-form");
    const imgs = JSON.parse(f.dataset.existingGallery || "[]");
    for (const file of e.target.files) {
      try { const dataUrl = await fileToDataUrl(file); if (dataUrl) imgs.push(dataUrl); }
      catch (err) { adminToast(err.message, "error"); }
    }
    f.dataset.existingGallery = JSON.stringify(imgs);
    renderTripGalleryPreview(imgs);
    e.target.value = "";
  });

  document.getElementById("trip-form").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    if (!f.name.value.trim() || !f.destination.value.trim()) { adminToast("Please fill in the required fields.", "error"); return; }
    const vehicleIds = [...document.querySelectorAll("#trip-vehicle-checkboxes input:checked")].map(cb => parseInt(cb.value, 10));
    const payload = {
      name: f.name.value.trim(),
      destination: f.destination.value.trim(),
      category: f.category.value,
      duration: f.duration.value.trim(),
      price: f.price.value.trim(),
      description: f.description.value.trim(),
      highlights: f.highlights.value.split("\n").map(s => s.trim()).filter(Boolean),
      gallery: JSON.parse(f.dataset.existingGallery || "[]"),
      image: f.dataset.newImage || f.dataset.existingImage || PLACEHOLDER_FALLBACK,
      vehicleIds
    };
    if (f.dataset.id) await updateTrip(parseInt(f.dataset.id, 10), payload);
    else await saveTrip(payload);
    adminToast(f.dataset.id ? "Trip updated successfully." : "Trip added successfully.", "success");
    closeTripModal();
    renderTripsPanel(); renderDashboardStats();
    delete f.dataset.newImage;
  });
}

/* =========================================================
   VEHICLES PANEL
   ========================================================= */
async function renderVehiclesPanel() {
  const list = document.getElementById("vehicles-list");
  list.innerHTML = `<div class="a-empty">Loading...</div>`;
  const vehicles = await getVehicles();
  list.innerHTML = vehicles.length ? vehicles.map(vehicleRowHtml).join("") : `<div class="a-empty">No vehicles yet. Click "+ Add Vehicle" to create one.</div>`;
  list.querySelectorAll("[data-edit-vehicle]").forEach(b => b.addEventListener("click", () => openVehicleModal(parseInt(b.dataset.editVehicle, 10))));
  list.querySelectorAll("[data-delete-vehicle]").forEach(b => b.addEventListener("click", async () => {
    if (!confirmA("Delete this vehicle? It will also be removed from any trips using it.")) return;
    await deleteVehicle(parseInt(b.dataset.deleteVehicle, 10));
    const trips = await getTrips();
    for (const trip of trips) {
      if (trip.vehicleIds && trip.vehicleIds.includes(parseInt(b.dataset.deleteVehicle, 10))) {
        await updateTrip(trip.id, { vehicleIds: trip.vehicleIds.filter(id => id !== parseInt(b.dataset.deleteVehicle, 10)) });
      }
    }
    adminToast("Vehicle deleted successfully.", "success");
    renderVehiclesPanel(); renderDashboardStats();
  }));
  list.querySelectorAll("[data-toggle-available]").forEach(b => b.addEventListener("click", async () => {
    const v = vehicles.find(v => v.id === parseInt(b.dataset.toggleAvailable, 10));
    await updateVehicle(v.id, { available: !v.available });
    adminToast("Vehicle updated successfully.", "success");
    renderVehiclesPanel(); renderDashboardStats();
  }));
}
function vehicleRowHtml(v) {
  return `
    <div class="a-item-card">
      <img src="${v.image_url}" alt="${escapeHtmlA(v.name)}">
      <div class="a-item-info">
        <h3>${escapeHtmlA(v.name)}</h3>
        <p>${escapeHtmlA(v.type)} · ${escapeHtmlA(v.capacity)}</p>
        <span class="a-msg ${v.available ? "success" : "error"}" style="display:inline-block;padding:.15rem .5rem;margin:.3rem 0 0;">${v.available ? "Available" : "Unavailable"}</span>
        <div class="a-item-actions">
          <button class="a-btn a-btn-outline a-btn-small" data-edit-vehicle="${v.id}">Edit</button>
          <button class="a-btn a-btn-outline a-btn-small" data-toggle-available="${v.id}">${v.available ? "Mark Unavailable" : "Mark Available"}</button>
          <button class="a-btn a-btn-danger a-btn-small" data-delete-vehicle="${v.id}">Delete</button>
        </div>
      </div>
    </div>
  `;
}
async function openVehicleModal(id) {
  const vehicles = await getVehicles();
  const vehicle = id ? vehicles.find(v => v.id === id) : null;
  document.getElementById("vehicle-modal-title").textContent = vehicle ? "Edit Vehicle" : "Add New Vehicle";
  const f = document.getElementById("vehicle-form");
  f.reset();
  f.dataset.id = vehicle ? vehicle.id : "";
  f.name.value = vehicle ? vehicle.name : "";
  f.type.value = vehicle ? vehicle.type : "";
  f.capacity.value = vehicle ? vehicle.capacity : "";
  f.description.value = vehicle ? vehicle.description : "";
  f.available.value = vehicle ? String(vehicle.available) : "true";
  document.getElementById("vehicle-image-preview").src = vehicle ? vehicle.image_url : PLACEHOLDER_FALLBACK;
  f.dataset.existingImage = vehicle ? vehicle.image_url : "";
  document.getElementById("vehicle-modal").classList.add("open");
}
function closeVehicleModal() { document.getElementById("vehicle-modal").classList.remove("open"); }
function initVehicleForm() {
  document.getElementById("add-vehicle-btn").addEventListener("click", () => openVehicleModal(null));
  document.getElementById("vehicle-modal-close").addEventListener("click", closeVehicleModal);
  document.getElementById("vehicle-image-input").addEventListener("change", async e => {
    try {
      const dataUrl = await fileToDataUrl(e.target.files[0]);
      if (dataUrl) { document.getElementById("vehicle-image-preview").src = dataUrl; document.getElementById("vehicle-form").dataset.newImage = dataUrl; }
    } catch (err) { adminToast(err.message, "error"); }
  });
  document.getElementById("vehicle-form").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    if (!f.name.value.trim()) { adminToast("Vehicle name is required.", "error"); return; }
    const payload = {
      name: f.name.value.trim(), type: f.type.value.trim(), capacity: f.capacity.value.trim(),
      description: f.description.value.trim(), available: f.available.value === "true",
      image_url: f.dataset.newImage || f.dataset.existingImage || PLACEHOLDER_FALLBACK
    };
    if (f.dataset.id) await updateVehicle(parseInt(f.dataset.id, 10), payload);
    else await saveVehicle(payload);
    adminToast(f.dataset.id ? "Vehicle updated successfully." : "Vehicle added successfully.", "success");
    closeVehicleModal();
    renderVehiclesPanel(); renderDashboardStats();
    delete f.dataset.newImage;
  });
}

/* =========================================================
   GALLERY PANEL (Add / Delete only, per spec)
   ========================================================= */
async function renderGalleryPanel() {
  const list = document.getElementById("gallery-list");
  list.innerHTML = `<div class="a-empty">Loading...</div>`;
  const items = await getGallery();
  list.innerHTML = items.length ? items.map(g => `
    <div class="a-item-card">
      <img src="${g.image_url}" alt="${escapeHtmlA(g.caption)}">
      <div class="a-item-info">
        <h3>${escapeHtmlA(g.caption || "Untitled")}</h3>
        <div class="a-item-actions"><button class="a-btn a-btn-danger a-btn-small" data-delete-photo="${g.id}">Delete</button></div>
      </div>
    </div>
  `).join("") : `<div class="a-empty">No photos yet. Add one below.</div>`;
  list.querySelectorAll("[data-delete-photo]").forEach(b => b.addEventListener("click", async () => {
    if (!confirmA("Delete this photo?")) return;
    await deleteGalleryItem(parseInt(b.dataset.deletePhoto, 10));
    adminToast("Photo deleted successfully.", "success");
    renderGalleryPanel(); renderDashboardStats();
  }));
}
function initGalleryForm() {
  document.getElementById("gallery-add-form").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    const file = f.image.files[0];
    if (!file) { adminToast("Please choose an image.", "error"); return; }
    try {
      const dataUrl = await fileToDataUrl(file);
      await saveGalleryItem({ image_url: dataUrl, caption: f.caption.value.trim() });
      adminToast("Photo added successfully.", "success");
      f.reset();
      renderGalleryPanel(); renderDashboardStats();
    } catch (err) { adminToast(err.message, "error"); }
  });
}

/* =========================================================
   VIDEOS PANEL
   ========================================================= */
async function renderVideosPanel() {
  const list = document.getElementById("videos-list");
  list.innerHTML = `<div class="a-empty">Loading...</div>`;
  const items = await getVideos();
  list.innerHTML = items.length ? items.map(v => `
    <div class="a-item-card">
      <div style="width:60px;height:60px;border-radius:10px;background:linear-gradient(135deg,#1450a3,#2f9bff);display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.4rem;flex-shrink:0;">▶</div>
      <div class="a-item-info">
        <h3>${escapeHtmlA(v.title)}</h3>
        <p>${escapeHtmlA(v.youtubeId || "No YouTube ID set")}</p>
        <div class="a-item-actions">
          <button class="a-btn a-btn-outline a-btn-small" data-edit-video="${v.id}">Edit</button>
          <button class="a-btn a-btn-danger a-btn-small" data-delete-video="${v.id}">Delete</button>
        </div>
      </div>
    </div>
  `).join("") : `<div class="a-empty">No videos yet. Click "+ Add Video" to create one.</div>`;
  list.querySelectorAll("[data-edit-video]").forEach(b => b.addEventListener("click", () => openVideoModal(parseInt(b.dataset.editVideo, 10))));
  list.querySelectorAll("[data-delete-video]").forEach(b => b.addEventListener("click", async () => {
    if (!confirmA("Delete this video?")) return;
    await deleteVideo(parseInt(b.dataset.deleteVideo, 10));
    adminToast("Video deleted successfully.", "success");
    renderVideosPanel(); renderDashboardStats();
  }));
}
async function openVideoModal(id) {
  const videos = await getVideos();
  const video = id ? videos.find(v => v.id === id) : null;
  document.getElementById("video-modal-title").textContent = video ? "Edit Video" : "Add Video";
  const f = document.getElementById("video-form");
  f.reset();
  f.dataset.id = video ? video.id : "";
  f.title.value = video ? video.title : "";
  f.description.value = video ? video.description : "";
  f.youtubeId.value = video ? video.youtubeId : "";
  document.getElementById("video-modal").classList.add("open");
}
function closeVideoAdminModal() { document.getElementById("video-modal").classList.remove("open"); }
function initVideoForm() {
  document.getElementById("add-video-btn").addEventListener("click", () => openVideoModal(null));
  document.getElementById("video-modal-close").addEventListener("click", closeVideoAdminModal);
  document.getElementById("video-form").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    if (!f.title.value.trim()) { adminToast("Video title is required.", "error"); return; }
    const payload = { title: f.title.value.trim(), description: f.description.value.trim(), youtubeId: f.youtubeId.value.trim() };
    if (f.dataset.id) await updateVideo(parseInt(f.dataset.id, 10), payload);
    else await saveVideo(payload);
    adminToast(f.dataset.id ? "Video updated successfully." : "Video added successfully.", "success");
    closeVideoAdminModal();
    renderVideosPanel(); renderDashboardStats();
  });
}

/* =========================================================
   REVIEWS PANEL
   ========================================================= */
async function renderReviewsPanel() {
  const list = document.getElementById("reviews-list");
  list.innerHTML = `<div class="a-empty">Loading...</div>`;
  const items = await getReviews();
  list.innerHTML = items.length ? items.map(r => `
    <div class="a-item-card">
      <div style="width:60px;height:60px;border-radius:10px;background:#eaf2fc;display:flex;align-items:center;justify-content:center;font-size:1.6rem;flex-shrink:0;">👤</div>
      <div class="a-item-info">
        <h3>${escapeHtmlA(r.name)} <span style="color:#ffb020;font-size:.85rem;">${renderStarsA(r.rating)}</span></h3>
        <p>${escapeHtmlA(r.review)}</p>
        <div class="a-item-actions">
          <button class="a-btn a-btn-outline a-btn-small" data-edit-review="${r.id}">Edit</button>
          <button class="a-btn a-btn-danger a-btn-small" data-delete-review="${r.id}">Delete</button>
        </div>
      </div>
    </div>
  `).join("") : `<div class="a-empty">No reviews yet.</div>`;
  list.querySelectorAll("[data-edit-review]").forEach(b => b.addEventListener("click", () => openReviewModal(parseInt(b.dataset.editReview, 10))));
  list.querySelectorAll("[data-delete-review]").forEach(b => b.addEventListener("click", async () => {
    if (!confirmA("Delete this review?")) return;
    await deleteReview(parseInt(b.dataset.deleteReview, 10));
    adminToast("Review deleted successfully.", "success");
    renderReviewsPanel(); renderDashboardStats();
  }));
}
async function openReviewModal(id) {
  const reviews = await getReviews();
  const review = id ? reviews.find(r => r.id === id) : null;
  document.getElementById("review-modal-title").textContent = review ? "Edit Review" : "Add Review";
  const f = document.getElementById("review-form-admin");
  f.reset();
  f.dataset.id = review ? review.id : "";
  f.name.value = review ? review.name : "";
  f.rating.value = review ? review.rating : "5";
  f.review.value = review ? review.review : "";
  document.getElementById("review-modal").classList.add("open");
}
function closeReviewModal() { document.getElementById("review-modal").classList.remove("open"); }
function initReviewAdminForm() {
  document.getElementById("add-review-btn").addEventListener("click", () => openReviewModal(null));
  document.getElementById("review-modal-close").addEventListener("click", closeReviewModal);
  document.getElementById("review-form-admin").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    if (!f.name.value.trim() || !f.review.value.trim()) { adminToast("Name and review text are required.", "error"); return; }
    const payload = { name: f.name.value.trim(), rating: parseInt(f.rating.value, 10), review: f.review.value.trim(), image_url: "" };
    if (f.dataset.id) await updateReview(parseInt(f.dataset.id, 10), payload);
    else await saveReview(payload);
    adminToast(f.dataset.id ? "Review updated successfully." : "Review added successfully.", "success");
    closeReviewModal();
    renderReviewsPanel(); renderDashboardStats();
  });
}

/* =========================================================
   SETTINGS PANEL (Business configuration)
   ========================================================= */
function renderSettingsPanel() {
  const biz = getBusiness();
  const f = document.getElementById("settings-form");
  f.phone.value = biz.phone; f.whatsapp.value = biz.whatsapp; f.email.value = biz.email;
  f.address.value = biz.address; f.hours.value = biz.hours; f.mapUrl.value = biz.mapUrl;
  f.facebook.value = biz.facebook; f.instagram.value = biz.instagram; f.youtube.value = biz.youtube;
  f.aboutText.value = biz.aboutText; f.footerText.value = biz.footerText;
}
function initSettingsForm() {
  document.getElementById("settings-form").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    await saveSettings({
      phone: f.phone.value.trim(), whatsapp: f.whatsapp.value.trim(), email: f.email.value.trim(),
      address: f.address.value.trim(), hours: f.hours.value.trim(), mapUrl: f.mapUrl.value.trim(),
      facebook: f.facebook.value.trim(), instagram: f.instagram.value.trim(), youtube: f.youtube.value.trim(),
      aboutText: f.aboutText.value.trim(), footerText: f.footerText.value.trim()
    });
    adminToast("Settings updated successfully. Changes apply site-wide.", "success");
  });
  document.getElementById("change-password-form").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    const msgEl = document.getElementById("change-password-msg");
    const admin = JSON.parse(localStorage.getItem("hdt_admin_auth"));
    const currentHash = await sha256Hex(f.current.value);
    if (currentHash !== admin.passwordHash) { msgEl.innerHTML = `<div class="a-msg error">Current password is incorrect.</div>`; return; }
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(f.next.value);
    if (!strong) { msgEl.innerHTML = `<div class="a-msg error">New password must be 8+ characters with upper, lower, number & special character.</div>`; return; }
    if (f.next.value !== f.confirm.value) { msgEl.innerHTML = `<div class="a-msg error">New passwords do not match.</div>`; return; }
    admin.passwordHash = await sha256Hex(f.next.value);
    localStorage.setItem("hdt_admin_auth", JSON.stringify(admin));
    msgEl.innerHTML = `<div class="a-msg success">Password changed successfully.</div>`;
    f.reset();
  });
}
