/* =========================================================
   HAZI DADA TRAVELS — ADMIN (admin.js)
   =========================================================
   AUTH: real Supabase Email + Password authentication using the
   existing client from supabase.js (`supabaseClient`). Supabase
   is the only source of truth: no localStorage/sessionStorage
   flag, no password stored, no credentials in code. The admin
   user is created in Supabase Dashboard -> Authentication -> Users.

   Requires (in this order) on login.html and dashboard.html:
     supabase-js library (CDN)  ->  supabase.js  ->  admin.js

   DATA: all reads/writes go through data.js functions only
   (unchanged by the Phase 4 database work beyond the small
   field additions noted inline below).
   ========================================================= */

/* ---------------- AUTH (Supabase Auth) — unchanged from Phase 3 ---------------- */
function authClient() {
  if (typeof supabaseClient === "undefined" || !supabaseClient || !supabaseClient.auth) throw new Error("Supabase client unavailable");
  return supabaseClient;
}
/* Friendly text only - raw Supabase errors are never shown to users */
function authErrorMessage(err) {
  const msg = String((err && err.message) || "").toLowerCase();
  const status = err && err.status;
  if (status === 429 || msg.includes("rate limit") || msg.includes("too many")) return "Too many attempts. Please wait a moment and try again.";
  if (msg.includes("email not confirmed")) return "Your email is not confirmed yet. Please confirm it from your inbox.";
  if (msg.includes("invalid login credentials") || status === 400 || status === 401) return "Invalid email or password.";
  if (!status || msg.includes("fetch") || msg.includes("network")) return "Unable to connect right now. Please try again.";
  return "Sign-in failed. Please try again.";
}
/* -> { ok: true } | { ok: false, message } */
async function adminLogin(email, password) {
  try {
    const { data, error } = await authClient().auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: authErrorMessage(error) };
    if (!data || !data.session) return { ok: false, message: "Sign-in failed. Please try again." };
    return { ok: true };
  } catch (e) { return { ok: false, message: "Unable to connect right now. Please try again." }; }
}
/* true only when Supabase reports a real session (fails closed) */
async function isAdminLoggedIn() {
  try {
    const { data, error } = await authClient().auth.getSession();
    return !error && !!(data && data.session);
  } catch (e) { return false; }
}
/* must be awaited: signOut() ends the Supabase session before the redirect */
let _loggingOut = false;
async function adminLogout() {
  _loggingOut = true; // stop the SIGNED_OUT listener redirecting a second time
  try { await authClient().auth.signOut(); } catch (e) { /* redirect anyway */ }
}
/* Dashboard guard. dashboard.html keeps the page hidden until this returns true. */
async function requireAdminAuth() {
  const goLogin = () => { location.replace("login.html"); return false; };
  try {
    const c = authClient();
    const { data, error } = await c.auth.getSession();
    if (error || !data || !data.session) return goLogin();
    const u = await c.auth.getUser(); // server-side check that the user/token is still valid
    if (u.error && u.error.status >= 400 && u.error.status < 500) { await c.auth.signOut(); return goLogin(); }
    c.auth.onAuthStateChange(evt => { if (evt === "SIGNED_OUT" && !_loggingOut) location.replace("login.html"); });
    document.documentElement.style.visibility = "";
    return true;
  } catch (e) { return goLogin(); }
}

/* ---------------- HELPERS ---------------- */
const $a = id => document.getElementById(id);
function ea(v) {
  return String(v === undefined || v === null ? "" : v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function starsA(n) { let s = ""; for (let i = 1; i <= 5; i++) s += i <= n ? "★" : "☆"; return s; }
function fmtDate(iso) { try { return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return ""; } }
function imgFallback(src) { return src || PLACEHOLDER_FALLBACK; }

function adminToast(message, type = "info") {
  let c = document.querySelector(".a-toast-container");
  if (!c) { c = document.createElement("div"); c.className = "a-toast-container"; document.body.appendChild(c); }
  const el = document.createElement("div"); el.className = "a-toast " + type; el.textContent = message; c.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3000);
}
/* Run an action; show a friendly message on failure */
async function guard(fn, fallbackMsg = "Something went wrong. Please try again.") {
  try { return await fn(); } catch (err) { console.error(err); adminToast(err && err.message && err.message.length < 90 ? err.message : fallbackMsg, "error"); }
}
function showError(id, msg) { const el = $a(id); el.textContent = msg; el.style.display = msg ? "block" : "none"; }

/* Resize + compress an uploaded image (keeps payloads small since they're
   stored as text in Supabase - see the Image Handling note in the write-up) */
function readImage(file, maxSize = 1000) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) return reject(new Error("Please choose a PNG, JPG, WEBP or GIF image."));
    if (file.size > 8 * 1024 * 1024) return reject(new Error("Image is too large (max 8MB)."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read the image."));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function openModal(id) { $a(id).classList.add("open"); }
function closeModal(id) { $a(id).classList.remove("open"); }

/* ---------------- PANELS ---------------- */
const PANEL_LOADERS = {};
function showPanel(name) {
  document.querySelectorAll(".admin-panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + name));
  document.querySelectorAll("[data-panel]").forEach(a => a.classList.toggle("active", a.dataset.panel === name));
  if (PANEL_LOADERS[name]) guard(PANEL_LOADERS[name]);
  window.scrollTo(0, 0);
}
function empty(msg) { return `<div class="a-empty">${ea(msg)}</div>`; }
function itemCard(img, title, lines, actionsHtml, extraHtml = "") {
  return `<div class="a-item-card">
    ${img === null ? "" : `<img src="${ea(imgFallback(img))}" alt="" onerror="this.onerror=null;this.src=PLACEHOLDER_FALLBACK">`}
    <div class="a-item-info"><h3>${title}</h3>${lines}${extraHtml}<div class="a-item-actions">${actionsHtml}</div></div></div>`;
}
function btn(label, attr, cls = "a-btn-outline") { return `<button class="a-btn ${cls} a-btn-small" ${attr}>${label}</button>`; }

/* ---------- Dashboard ---------- */
PANEL_LOADERS.dashboard = async () => {
  const [trips, vehicles, gallery, videos, reviews, enquiries] =
    await Promise.all([getTrips(), getVehicles(), getGallery(), getVideos(), getReviews(), getEnquiries()]);
  $a("stat-trips").textContent = trips.length; $a("stat-vehicles").textContent = vehicles.length;
  $a("stat-gallery").textContent = gallery.length; $a("stat-videos").textContent = videos.length;
  $a("stat-reviews").textContent = reviews.length; $a("stat-enquiries").textContent = enquiries.length;
  const latest = arr => [...arr].sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || ""))).slice(0, 5);
  const rows = (arr, fn, none) => arr.length ? arr.map(x => `<div class="a-recent-row">${fn(x)}</div>`).join("") : `<div class="a-recent-row">${none}</div>`;
  $a("recent-enquiries").innerHTML = rows(latest(enquiries), e => `<strong>${ea(e.name)}</strong> — ${ea(e.trip || "General")} <span class="a-badge ${ea(String(e.status).toLowerCase())}">${ea(e.status)}</span>`, "No enquiries found.");
  $a("recent-reviews").innerHTML = rows(latest(reviews), r => `<strong>${ea(r.name)}</strong> ${starsA(r.rating)}<br>${ea(r.review)}`, "No reviews available.");
  $a("recent-trips").innerHTML = rows(latest(trips), t => `<strong>${ea(t.name)}</strong><br>${ea(t.destination)}`, "No trips available yet.");
};

/* ---------- Trips ---------- */
PANEL_LOADERS.trips = async () => {
  const list = $a("trips-list");
  const trips = await getTrips();
  const sel = $a("trip-filter"), cur = sel.value;
  const cats = [...new Set(trips.map(t => t.category).filter(Boolean))];
  sel.innerHTML = `<option value="">All categories</option>` + cats.map(c => `<option>${ea(c)}</option>`).join("");
  sel.value = cats.includes(cur) ? cur : "";
  const q = $a("trip-search").value.trim().toLowerCase();
  const rows = trips.filter(t => (!sel.value || t.category === sel.value) &&
    (!q || [t.name, t.destination, t.category].some(v => String(v || "").toLowerCase().includes(q))));
  list.innerHTML = rows.length ? rows.map(t => itemCard(t.image, ea(t.name),
    `<p>${ea(t.destination)} · ${ea(t.category)} · ${ea(t.duration)} · ${ea(t.price)}</p>`,
    btn("Edit", `data-edit-trip="${t.id}"`) + btn("Delete", `data-delete-trip="${t.id}"`, "a-btn-danger"))).join("")
    : empty(trips.length ? "No trips match your search." : "No trips available yet.");
};

let tripGalleryDraft = [], tripImageDraft = "";
async function openTripModal(id) {
  const trip = id ? await getTripById(id) : null;
  const vehicles = await getVehicles();
  const f = $a("trip-form"); f.reset(); showError("trip-error", "");
  f.dataset.id = trip ? trip.id : "";
  $a("trip-modal-title").textContent = trip ? "Edit Trip" : "Add Trip";
  f.name.value = trip ? trip.name : ""; f.destination.value = trip ? trip.destination : "";
  f.category.value = trip ? trip.category : ""; f.duration.value = trip ? trip.duration : "";
  f.price.value = trip ? trip.price : ""; f.description.value = trip ? trip.description : "";
  f.highlights.value = trip ? (trip.highlights || []).join("\n") : "";
  tripImageDraft = trip ? trip.image : ""; tripGalleryDraft = trip ? [...(trip.gallery || [])] : [];
  $a("trip-image-preview").src = imgFallback(tripImageDraft);
  drawTripGalleryDraft();
  $a("trip-vehicle-checkboxes").innerHTML = vehicles.length ? vehicles.map(v =>
    `<label><input type="checkbox" value="${v.id}" ${trip && (trip.vehicleIds || []).includes(v.id) ? "checked" : ""}> ${ea(v.name)} — ${ea(v.capacity)}${v.available === false ? " (unavailable)" : ""}</label>`).join("")
    : `<span class="a-item-meta">No vehicles yet. Add one in Vehicles first.</span>`;
  openModal("trip-modal");
}
function drawTripGalleryDraft() {
  $a("trip-gallery-preview").innerHTML = tripGalleryDraft.map((src, i) =>
    `<span style="position:relative;display:inline-block;margin:0 .4rem .4rem 0;"><img src="${ea(src)}" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
     <button type="button" data-remove-tg="${i}" aria-label="Remove image" style="position:absolute;top:-6px;right:-6px;background:#c0392b;color:#fff;border:none;width:22px;height:22px;border-radius:50%;">×</button></span>`).join("");
}
async function saveTripForm(e) {
  e.preventDefault();
  const f = e.target;
  if (!f.name.value.trim() || !f.destination.value.trim()) return showError("trip-error", "Trip name and destination are required.");
  const payload = {
    name: f.name.value.trim(), destination: f.destination.value.trim(), category: f.category.value.trim(),
    duration: f.duration.value.trim(), price: f.price.value.trim(), description: f.description.value.trim(),
    highlights: f.highlights.value.split("\n").map(s => s.trim()).filter(Boolean),
    gallery: tripGalleryDraft, image: tripImageDraft || PLACEHOLDER_FALLBACK,
    vehicleIds: [...document.querySelectorAll("#trip-vehicle-checkboxes input:checked")].map(c => parseInt(c.value, 10))
  };
  await guard(async () => {
    if (f.dataset.id) await updateTrip(f.dataset.id, payload); else await saveTrip(payload);
    adminToast(f.dataset.id ? "Trip updated successfully." : "Trip added successfully.", "success");
    closeModal("trip-modal"); PANEL_LOADERS.trips();
  });
}

/* ---------- Vehicles ---------- */
PANEL_LOADERS.vehicles = async () => {
  const vs = await getVehicles();
  $a("vehicles-list").innerHTML = vs.length ? vs.map(v => itemCard(v.image_url, ea(v.name),
    `<p>${ea(v.type)} · ${ea(v.capacity ?? "—")} seats${v.registration ? " · " + ea(v.registration) : ""}</p><p>${ea(v.description)}</p>`,
    btn("Edit", `data-edit-vehicle="${v.id}"`) + btn(v.available === false ? "Mark Available" : "Mark Unavailable", `data-toggle-vehicle="${v.id}"`) + btn("Delete", `data-delete-vehicle="${v.id}"`, "a-btn-danger"),
    `<span class="a-badge ${v.available === false ? "off" : "ok"}">${v.available === false ? "Unavailable" : "Available"}</span>`)).join("")
    : empty("No vehicles available yet.");
};
let vehicleImageDraft = "";
async function openVehicleModal(id) {
  const v = id ? (await getVehicles()).find(x => x.id === Number(id)) : null;
  const f = $a("vehicle-form"); f.reset(); showError("vehicle-error", "");
  f.dataset.id = v ? v.id : ""; $a("vehicle-modal-title").textContent = v ? "Edit Vehicle" : "Add Vehicle";
  f.name.value = v ? v.name : ""; f.type.value = v ? v.type : ""; f.capacity.value = v ? v.capacity : "";
  f.description.value = v ? v.description : ""; f.registration.value = v ? (v.registration || "") : "";
  f.available.value = v && v.available === false ? "false" : "true";
  vehicleImageDraft = v ? v.image_url : ""; $a("vehicle-image-preview").src = imgFallback(vehicleImageDraft);
  openModal("vehicle-modal");
}
async function saveVehicleForm(e) {
  e.preventDefault();
  const f = e.target;
  if (!f.name.value.trim()) return showError("vehicle-error", "Vehicle name is required.");
  const payload = { name: f.name.value.trim(), type: f.type.value.trim(), capacity: f.capacity.value.trim(),
    registration: f.registration.value.trim(), description: f.description.value.trim(),
    available: f.available.value === "true", image_url: vehicleImageDraft || PLACEHOLDER_FALLBACK };
  await guard(async () => {
    if (f.dataset.id) await updateVehicle(f.dataset.id, payload); else await saveVehicle(payload);
    adminToast(f.dataset.id ? "Vehicle updated successfully." : "Vehicle added successfully.", "success");
    closeModal("vehicle-modal"); PANEL_LOADERS.vehicles();
  });
}

/* ---------- Gallery ---------- */
PANEL_LOADERS.gallery = async () => {
  const items = await getGallery();
  $a("gallery-list").innerHTML = items.length ? items.map(g => itemCard(g.image_url, ea(g.caption || "No caption"),
    `<div class="a-inline-edit"><input type="text" value="${ea(g.caption)}" data-caption-input="${g.id}" aria-label="Caption">${btn("Save caption", `data-save-caption="${g.id}"`)}</div>`,
    btn(g.approved === false ? "Show on site" : "Hide from site", `data-toggle-gallery="${g.id}"`) + btn("Delete", `data-delete-photo="${g.id}"`, "a-btn-danger"),
    `<span class="a-badge ${g.approved === false ? "off" : "ok"}">${g.approved === false ? "Hidden" : "Visible on site"}</span>`)).join("") : empty("No gallery images available.");
};

/* ---------- Videos ---------- */
PANEL_LOADERS.videos = async () => {
  const vs = await getVideos();
  $a("videos-list").innerHTML = vs.length ? vs.map(v => itemCard(v.youtubeId ? `https://img.youtube.com/vi/${encodeURIComponent(v.youtubeId)}/default.jpg` : "",
    ea(v.title), `<p>${ea(v.description)}</p><p class="a-item-meta">YouTube ID: ${ea(v.youtubeId || "not set")}</p>`,
    btn("Edit", `data-edit-video="${v.id}"`) + btn("Delete", `data-delete-video="${v.id}"`, "a-btn-danger"))).join("") : empty("No videos available yet.");
};
async function openVideoModal(id) {
  const v = id ? (await getVideos()).find(x => x.id === Number(id)) : null;
  const f = $a("video-form"); f.reset(); showError("video-error", "");
  f.dataset.id = v ? v.id : ""; $a("video-modal-title").textContent = v ? "Edit Video" : "Add Video";
  f.title.value = v ? v.title : ""; f.description.value = v ? v.description : ""; f.youtube.value = v ? v.youtubeId : "";
  openModal("video-modal");
}
async function saveVideoForm(e) {
  e.preventDefault();
  const f = e.target;
  if (!f.title.value.trim()) return showError("video-error", "Video title is required.");
  const raw = f.youtube.value.trim(), id = extractYouTubeId(raw);
  if (raw && !id) return showError("video-error", "Please enter a valid YouTube link or 11-character ID.");
  const payload = { title: f.title.value.trim(), description: f.description.value.trim(), youtubeId: id };
  await guard(async () => {
    if (f.dataset.id) await updateVideo(f.dataset.id, payload); else await saveVideo(payload);
    adminToast(f.dataset.id ? "Video updated successfully." : "Video added successfully.", "success");
    closeModal("video-modal"); PANEL_LOADERS.videos();
  });
}

/* ---------- Reviews ---------- */
PANEL_LOADERS.reviews = async () => {
  const rs = await getReviews();
  $a("reviews-list").innerHTML = rs.length ? rs.map(r => itemCard(r.image_url || null, `${ea(r.name)} <span style="color:#ffb020;font-size:.85rem;">${starsA(r.rating)}</span>`,
    `<p>${ea(r.review)}</p>`,
    btn("Edit", `data-edit-review="${r.id}"`) + btn(r.approved ? "Hide from site" : "Approve", `data-toggle-review="${r.id}"`) + btn("Delete", `data-delete-review="${r.id}"`, "a-btn-danger"),
    `<span class="a-badge ${r.approved ? "ok" : "off"}">${r.approved ? "Visible on site" : "Pending approval"}</span>`)).join("") : empty("No reviews available.");
};
let reviewImageDraft = "";
async function openReviewModal(id) {
  const r = id ? (await getReviews()).find(x => x.id === Number(id)) : null;
  const f = $a("review-form-admin"); f.reset(); showError("review-error", "");
  f.dataset.id = r ? r.id : ""; $a("review-modal-title").textContent = r ? "Edit Review" : "Add Review";
  f.name.value = r ? r.name : ""; f.rating.value = r ? r.rating : "5"; f.review.value = r ? r.review : "";
  f.approved.value = r ? String(!!r.approved) : "true";
  reviewImageDraft = r ? r.image_url || "" : "";
  const p = $a("review-image-preview"); p.src = reviewImageDraft; p.style.display = reviewImageDraft ? "block" : "none";
  openModal("review-modal");
}
async function saveReviewForm(e) {
  e.preventDefault();
  const f = e.target;
  if (!f.name.value.trim() || !f.review.value.trim()) return showError("review-error", "Name and review text are required.");
  const payload = { name: f.name.value.trim(), rating: parseInt(f.rating.value, 10), review: f.review.value.trim(), approved: f.approved.value === "true", image_url: reviewImageDraft };
  await guard(async () => {
    if (f.dataset.id) await updateReview(f.dataset.id, payload); else await saveReview(payload);
    adminToast(f.dataset.id ? "Review updated successfully." : "Review added successfully.", "success");
    closeModal("review-modal"); PANEL_LOADERS.reviews();
  });
}

/* ---------- Enquiries ---------- */
const ENQUIRY_STATUSES = ["New", "Contacted", "Confirmed", "Closed"];
PANEL_LOADERS.enquiries = async () => {
  const filter = $a("enquiry-filter").value;
  const all = await getEnquiries();
  const rows = all.filter(e => !filter || e.status === filter).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  $a("enquiries-list").innerHTML = rows.length ? rows.map(e => itemCard(null, ea(e.name),
    `<p>📞 <a href="tel:${ea(e.phone)}">${ea(e.phone)}</a> · 🧳 ${ea(e.trip || "General enquiry")}</p>
     <p>${ea(e.message || "—")}</p>
     <p class="a-item-meta">${ea(fmtDate(e.created_at))}</p>`,
    `<select data-enquiry-status="${e.id}" aria-label="Status">${ENQUIRY_STATUSES.map(s => `<option ${s === e.status ? "selected" : ""}>${s}</option>`).join("")}</select>` +
    btn("Delete", `data-delete-enquiry="${e.id}"`, "a-btn-danger"),
    `<span class="a-badge ${ea(String(e.status).toLowerCase())}">${ea(e.status)}</span>`)).join("") : empty("No enquiries found.");
};

/* ---------- Settings ---------- */
PANEL_LOADERS.settings = async () => {
  const b = getBusiness(), f = $a("settings-form");
  ["phone", "whatsapp", "email", "address", "hours", "mapUrl", "facebook", "instagram", "youtube", "aboutText", "footerText"].forEach(k => { f[k].value = b[k] || ""; });
};
async function saveSettingsForm(e) {
  e.preventDefault();
  const f = e.target, data = {};
  ["phone", "whatsapp", "email", "address", "hours", "mapUrl", "facebook", "instagram", "youtube", "aboutText", "footerText"].forEach(k => { data[k] = f[k].value.trim(); });
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) return adminToast("Please enter a valid email address.", "error");
  await guard(async () => { await saveSettings(data); adminToast("Settings updated successfully.", "success"); });
}

/* ---------------- INIT / EVENTS ---------------- */
function initAdmin() {
  document.addEventListener("click", async e => {
    const el = e.target.closest("button, a"); if (!el) return;
    const d = el.dataset;
    if (d.panel) { e.preventDefault(); showPanel(d.panel); return; }
    if (d.close) { closeModal(d.close); return; }
    if (d.quick) {
      const map = { trip: ["trips", () => openTripModal(null)], vehicle: ["vehicles", () => openVehicleModal(null)], gallery: ["gallery", null], video: ["videos", () => openVideoModal(null)], review: ["reviews", () => openReviewModal(null)] };
      const [panel, open] = map[d.quick]; showPanel(panel); if (open) guard(open); return;
    }
    if (el.classList.contains("a-logout-btn")) { await adminLogout(); location.replace("login.html"); return; }
    if (d.editTrip) return guard(() => openTripModal(d.editTrip));
    if (d.deleteTrip) { if (!confirm("Delete this trip? This cannot be undone.")) return;
      return guard(async () => { await deleteTrip(d.deleteTrip); adminToast("Trip deleted successfully.", "success"); PANEL_LOADERS.trips(); }); }
    if (d.removeTg) { tripGalleryDraft.splice(parseInt(d.removeTg, 10), 1); drawTripGalleryDraft(); return; }
    if (d.editVehicle) return guard(() => openVehicleModal(d.editVehicle));
    if (d.toggleVehicle) return guard(async () => {
      const v = (await getVehicles()).find(x => x.id === Number(d.toggleVehicle));
      await updateVehicle(v.id, { available: v.available === false }); adminToast("Vehicle updated successfully.", "success"); PANEL_LOADERS.vehicles(); });
    if (d.deleteVehicle) { if (!confirm("Delete this vehicle? It will also be removed from trips using it.")) return;
      return guard(async () => {
        const vid = Number(d.deleteVehicle); await deleteVehicle(vid);
        for (const t of await getTrips()) if ((t.vehicleIds || []).includes(vid)) await updateTrip(t.id, { vehicleIds: t.vehicleIds.filter(x => x !== vid) });
        adminToast("Vehicle deleted successfully.", "success"); PANEL_LOADERS.vehicles(); }); }
    if (d.saveCaption) return guard(async () => {
      const v = document.querySelector(`[data-caption-input="${d.saveCaption}"]`).value.trim();
      await updateGalleryItem(d.saveCaption, { caption: v }); adminToast("Caption updated successfully.", "success"); PANEL_LOADERS.gallery(); });
    if (d.toggleGallery) return guard(async () => {
      const items = await getGallery();
      const g = items.find(x => x.id === Number(d.toggleGallery));
      await updateGalleryItem(d.toggleGallery, { approved: g.approved === false });
      adminToast("Photo visibility updated.", "success"); PANEL_LOADERS.gallery(); });
    if (d.deletePhoto) { if (!confirm("Delete this image?")) return;
      return guard(async () => { await deleteGalleryItem(d.deletePhoto); adminToast("Image deleted successfully.", "success"); PANEL_LOADERS.gallery(); }); }
    if (d.editVideo) return guard(() => openVideoModal(d.editVideo));
    if (d.deleteVideo) { if (!confirm("Delete this video?")) return;
      return guard(async () => { await deleteVideo(d.deleteVideo); adminToast("Video deleted successfully.", "success"); PANEL_LOADERS.videos(); }); }
    if (d.editReview) return guard(() => openReviewModal(d.editReview));
    if (d.deleteReview) { if (!confirm("Delete this review?")) return;
      return guard(async () => { await deleteReview(d.deleteReview); adminToast("Review deleted successfully.", "success"); PANEL_LOADERS.reviews(); }); }
    if (d.toggleReview) return guard(async () => {
      const rs = await getReviews();
      const r = rs.find(x => x.id === Number(d.toggleReview));
      await updateReview(d.toggleReview, { approved: !r.approved });
      adminToast("Review visibility updated.", "success"); PANEL_LOADERS.reviews(); });
    if (d.deleteEnquiry) { if (!confirm("Delete this enquiry?")) return;
      return guard(async () => { await deleteEnquiry(d.deleteEnquiry); adminToast("Enquiry deleted successfully.", "success"); PANEL_LOADERS.enquiries(); }); }
  });
  document.addEventListener("change", e => {
    if (e.target.dataset.enquiryStatus) guard(async () => {
      await updateEnquiry(e.target.dataset.enquiryStatus, { status: e.target.value }); adminToast("Enquiry status updated.", "success"); PANEL_LOADERS.enquiries(); });
    if (e.target.id === "enquiry-filter") guard(PANEL_LOADERS.enquiries);
    if (e.target.id === "trip-filter") guard(PANEL_LOADERS.trips);
  });
  $a("trip-search").addEventListener("input", () => guard(PANEL_LOADERS.trips));

  $a("add-trip-btn").addEventListener("click", () => guard(() => openTripModal(null)));
  $a("add-vehicle-btn").addEventListener("click", () => guard(() => openVehicleModal(null)));
  $a("add-video-btn").addEventListener("click", () => guard(() => openVideoModal(null)));
  $a("add-review-btn").addEventListener("click", () => guard(() => openReviewModal(null)));

  $a("trip-image-input").addEventListener("change", ev => guard(async () => { const s = await readImage(ev.target.files[0]); if (s) { tripImageDraft = s; $a("trip-image-preview").src = s; } }));
  $a("trip-gallery-input").addEventListener("change", ev => guard(async () => {
    for (const file of ev.target.files) { const s = await readImage(file, 900); if (s) tripGalleryDraft.push(s); }
    drawTripGalleryDraft(); ev.target.value = ""; }));
  $a("vehicle-image-input").addEventListener("change", ev => guard(async () => { const s = await readImage(ev.target.files[0]); if (s) { vehicleImageDraft = s; $a("vehicle-image-preview").src = s; } }));
  $a("review-image-input").addEventListener("change", ev => guard(async () => {
    const s = await readImage(ev.target.files[0], 300); if (s) { reviewImageDraft = s; const p = $a("review-image-preview"); p.src = s; p.style.display = "block"; } }));

  $a("trip-form").addEventListener("submit", saveTripForm);
  $a("vehicle-form").addEventListener("submit", saveVehicleForm);
  $a("video-form").addEventListener("submit", saveVideoForm);
  $a("review-form-admin").addEventListener("submit", saveReviewForm);
  $a("settings-form").addEventListener("submit", saveSettingsForm);
  $a("gallery-add-form").addEventListener("submit", ev => { ev.preventDefault(); guard(async () => {
    const f = ev.target, file = f.image.files[0];
    if (!file) return adminToast("Please choose an image.", "error");
    const src = await readImage(file, 1200);
    await saveGalleryItem({ image_url: src, caption: f.caption.value.trim(), description: f.description.value.trim() });
    adminToast("Image added successfully.", "success"); f.reset(); PANEL_LOADERS.gallery(); }); });

  showPanel("dashboard");
}
