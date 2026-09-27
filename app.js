/* =========================================================
   HAZI DADA TRAVELS — APP (app.js)
   SPA navigation (History API), view rendering, booking sheet,
   lightbox, video modal, toasts, language switching.
   Relies only on functions/data exposed by js/data.js.
   ========================================================= */

/* ---------------------------------------------------------
   STATE
   --------------------------------------------------------- */
let currentLang = localStorage.getItem("hdt_lang") || "en";
let currentTripsCategory = "All";
let currentGalleryIndex = 0;
let currentGalleryList = [];
let currentBookingTripName = "";

const $app = () => document.getElementById("app");
function t(key) {
  const dict = translations[currentLang] || translations.en;
  return dict[key] || translations.en[key] || key;
}

/* ---------------------------------------------------------
   ROUTER
   --------------------------------------------------------- */
const KNOWN_ROUTES = ["home", "trips", "vehicles", "gallery", "videos", "reviews", "contact"];

function parseRouteFromHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  if (!raw) return { name: "home", params: {} };
  const parts = raw.split("/");
  if (parts[0] === "trip" && parts[1]) return { name: "trip-details", params: { id: parts[1] } };
  if (KNOWN_ROUTES.includes(parts[0])) return { name: parts[0], params: {} };
  return { name: "home", params: {} };
}
function routeToHash(name, params) {
  if (name === "trip-details") return `#/trip/${params.id}`;
  if (name === "home") return "#/";
  return `#/${name}`;
}
function navigate(name, params = {}, replace = false) {
  const state = { name, params };
  const hash = routeToHash(name, params);
  if (replace) history.replaceState(state, "", hash);
  else history.pushState(state, "", hash);
  render(state);
}
window.addEventListener("popstate", e => render(e.state || parseRouteFromHash()));

async function render(state) {
  closeMobileNav();
  closeSheet();
  closeLightbox();
  closeVideoModal();
  updateActiveNav(state.name);
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

  try {
    switch (state.name) {
      case "home": return await renderHome();
      case "trips": return await renderTrips();
      case "trip-details": return await renderTripDetails(state.params.id);
      case "vehicles": return await renderVehicles();
      case "gallery": return await renderGallery();
      case "videos": return await renderVideos();
      case "reviews": return await renderReviews();
      case "contact": return await renderContact();
      default: return await renderHome();
    }
  } catch (err) {
    console.error("[render error]", err);
    $app().innerHTML = `<div class="state-msg">${escapeHtml(t("error_generic"))}</div>`;
  }
}

function updateActiveNav(routeName) {
  document.querySelectorAll("[data-nav]").forEach(el => {
    el.classList.toggle("active", el.dataset.nav === routeName);
  });
}

/* ---------------------------------------------------------
   SMALL HELPERS
   --------------------------------------------------------- */
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function onImgError(imgEl) {
  imgEl.onerror = null;
  imgEl.src = PLACEHOLDER_FALLBACK;
}
function loadingBlock(message) {
  return `<div class="state-msg"><div class="spinner"></div>${escapeHtml(message)}</div>`;
}
function emptyBlock(message) {
  return `<div class="state-msg">${escapeHtml(message)}</div>`;
}
function hScroll(innerHtml) {
  return `<div class="h-scroll-wrap"><div class="h-scroll">${innerHtml}</div></div>`;
}
function renderStars(rating) {
  const full = Math.round(rating);
  let out = "";
  for (let i = 1; i <= 5; i++) out += i <= full ? "★" : "☆";
  return out;
}

/* ---------------------------------------------------------
   HOME
   --------------------------------------------------------- */
async function renderHome() {
  $app().innerHTML = `
    <section class="hero">
      <div class="hero-inner">
        <h1>${escapeHtml(t("hero_title"))}</h1>
        <p>${escapeHtml(t("hero_subtitle"))}</p>
        <div class="hero-actions">
          <button class="btn btn-primary" data-nav="trips">${escapeHtml(t("btn_explore_trips"))}</button>
          <button class="btn btn-ghost" data-nav="contact">${escapeHtml(t("btn_contact_us"))}</button>
        </div>
      </div>
    </section>

    <section class="quick-actions">
      ${hScroll(quickActionsHtml())}
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">${escapeHtml(t("section_featured"))}</h2>
      </div>
      <div id="featured-trips">${loadingBlock(t("loading_trips"))}</div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">${escapeHtml(t("section_vehicles"))}</h2>
      </div>
      <div id="home-vehicles">${loadingBlock(t("loading_vehicles"))}</div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">${escapeHtml(t("section_reviews"))}</h2>
      </div>
      <div id="home-reviews">${loadingBlock(t("loading_reviews"))}</div>
    </section>
  `;
  bindNavClicks();

  const trips = await getTrips();
  document.getElementById("featured-trips").innerHTML = trips.length
    ? hScroll(trips.slice(0, 6).map(tripCardHtml).join(""))
    : emptyBlock(t("empty_trips"));
  bindTripCardClicks();

  const vehicles = (await getVehicles()).filter(v => v.available);
  document.getElementById("home-vehicles").innerHTML = vehicles.length
    ? hScroll(vehicles.map(vehicleCardHtml).join(""))
    : emptyBlock(t("empty_vehicles"));

  const reviews = await getReviews();
  document.getElementById("home-reviews").innerHTML = reviews.length
    ? hScroll(reviews.map(reviewCardHtml).join(""))
    : emptyBlock(t("empty_reviews"));
}

function quickActionsHtml() {
  const items = [
    ["trips", "🧳", t("nav_trips")], ["vehicles", "🚌", t("nav_vehicles")], ["gallery", "🖼️", t("nav_gallery")],
    ["videos", "▶️", t("nav_videos")], ["reviews", "⭐", t("nav_reviews")], ["contact", "📞", t("nav_contact")]
  ];
  return items.map(([route, icon, label]) => `
    <button class="quick-action-pill" data-nav="${route}">
      <span class="qa-icon">${icon}</span><span class="qa-label">${escapeHtml(label)}</span>
    </button>
  `).join("");
}

function tripCardHtml(trip) {
  return `
    <button class="trip-card" data-trip-id="${trip.id}" aria-label="${escapeHtml(trip.name)}">
      <img src="${trip.image}" alt="${escapeHtml(trip.name)}" loading="lazy" onerror="onImgError(this)">
      <div class="trip-card-body">
        <h3>${escapeHtml(trip.name)}</h3>
        <div class="trip-meta-row">
          <span>📍 ${escapeHtml(trip.destination)}</span>
          <span>📅 ${escapeHtml(trip.duration)}</span>
        </div>
        <div class="flex-between">
          <span class="price-tag">${escapeHtml(trip.price)}</span>
          <span class="chip">${escapeHtml(t("btn_view_details"))}</span>
        </div>
      </div>
    </button>
  `;
}
function bindTripCardClicks() {
  document.querySelectorAll(".trip-card[data-trip-id]").forEach(card => {
    card.addEventListener("click", () => navigate("trip-details", { id: card.dataset.tripId }));
  });
}

function vehicleCardHtml(v) {
  return `
    <div class="vehicle-card">
      <img src="${v.image_url}" alt="${escapeHtml(v.name)}" loading="lazy" onerror="onImgError(this)">
      <div class="vehicle-card-body">
        <h3 style="margin:0;font-size:1rem;color:var(--blue-900);">${escapeHtml(v.name)}</h3>
        <div class="trip-meta-row"><span>🚐 ${escapeHtml(v.type)}</span><span>🧑‍🤝‍🧑 ${escapeHtml(v.capacity)}</span></div>
        <p class="muted" style="font-size:.85rem;margin:.2rem 0 0;">${escapeHtml(v.description)}</p>
        <span class="availability-badge ${v.available ? "available" : "unavailable"}">${v.available ? "Available" : "Unavailable"}</span>
      </div>
    </div>
  `;
}

function reviewCardHtml(r) {
  return `
    <article class="review-card">
      <div class="review-stars">${renderStars(r.rating)}</div>
      <p style="margin:0;">"${escapeHtml(r.review)}"</p>
      <p class="review-name">— ${escapeHtml(r.name)}</p>
      ${String(r.name).includes("[Sample") ? `<span class="badge-demo">Sample / Demo Review</span>` : ""}
    </article>
  `;
}

/* ---------------------------------------------------------
   TRIPS (with horizontal category filters)
   --------------------------------------------------------- */
async function renderTrips() {
  $app().innerHTML = `
    <div class="section" style="padding-bottom:0;">
      <div class="container"><h1 class="section-title">${escapeHtml(t("section_trips"))}</h1></div>
      <div class="h-scroll-wrap"><div class="h-scroll" id="category-filters"></div></div>
    </div>
    <div class="section" id="trips-list-wrap">${loadingBlock(t("loading_trips"))}</div>
  `;
  const categories = [
    ["All", t("cat_all")], ["One Day", t("cat_oneday")], ["Weekend", t("cat_weekend")],
    ["Family", t("cat_family")], ["Pilgrimage", t("cat_pilgrimage")], ["Other", t("cat_other")]
  ];
  document.getElementById("category-filters").innerHTML = categories.map(([val, label]) => `
    <button class="category-pill ${currentTripsCategory === val ? "active" : ""}" data-cat="${val}">${escapeHtml(label)}</button>
  `).join("");

  const allTrips = await getTrips();
  renderTripsList(allTrips);

  document.querySelectorAll(".category-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      currentTripsCategory = btn.dataset.cat;
      document.querySelectorAll(".category-pill").forEach(b => b.classList.toggle("active", b.dataset.cat === currentTripsCategory));
      renderTripsList(allTrips);
    });
  });
}
function renderTripsList(allTrips) {
  const filtered = currentTripsCategory === "All" ? allTrips : allTrips.filter(t => t.category === currentTripsCategory);
  const wrap = document.getElementById("trips-list-wrap");
  wrap.innerHTML = filtered.length ? hScroll(filtered.map(tripCardHtml).join("")) : emptyBlock(t("empty_trips"));
  bindTripCardClicks();
}

/* ---------------------------------------------------------
   TRIP DETAILS
   --------------------------------------------------------- */
async function renderTripDetails(id) {
  $app().innerHTML = loadingBlock(t("loading_trips"));
  const trip = await getTripById(id);
  if (!trip) { $app().innerHTML = emptyBlock(t("error_trip_not_found")); return; }

  const vehicles = await getVehiclesByIds(trip.vehicleIds);
  const availableVehicles = vehicles.filter(v => v.available);

  $app().innerHTML = `
    <div class="trip-details-wrap">
      <button class="back-btn" id="trip-back-btn">← ${escapeHtml(t("nav_home"))}</button>
      <img class="trip-hero-image" src="${trip.image}" alt="${escapeHtml(trip.name)}" onerror="onImgError(this)">
    </div>
    <div class="container mt-1">
      <h1 style="margin:0 0 .3rem;color:var(--blue-900);">${escapeHtml(trip.name)}</h1>
      <p class="muted" style="margin:0 0 1rem;">${escapeHtml(trip.destination)}</p>
    </div>
    <div class="h-scroll-wrap">
      <div class="h-scroll">
        <div class="info-card"><span class="info-label">📍 ${escapeHtml(t("label_destination"))}</span><span class="info-value">${escapeHtml(trip.destination)}</span></div>
        <div class="info-card"><span class="info-label">📅 ${escapeHtml(t("label_duration"))}</span><span class="info-value">${escapeHtml(trip.duration)}</span></div>
        <div class="info-card"><span class="info-label">💰 ${escapeHtml(t("label_price"))}</span><span class="info-value">${escapeHtml(trip.price)}</span></div>
      </div>
    </div>
    <div class="container mt-2">
      <p>${escapeHtml(trip.description)}</p>
    </div>

    ${trip.highlights && trip.highlights.length ? `
    <div class="container"><h2 class="section-title" style="font-size:1.05rem;">${escapeHtml(t("label_highlights"))}</h2></div>
    <div class="h-scroll-wrap"><div class="h-scroll">${trip.highlights.map(h => `<span class="chip">${escapeHtml(h)}</span>`).join("")}</div></div>
    ` : ""}

    <div class="container mt-1"><h2 class="section-title" style="font-size:1.05rem;">${escapeHtml(t("label_available_vehicles"))}</h2></div>
    <div class="h-scroll-wrap">
      <div class="h-scroll">
        ${availableVehicles.length ? availableVehicles.map(vehicleCardHtml).join("") : emptyBlock(t("empty_vehicles"))}
      </div>
    </div>

    ${trip.gallery && trip.gallery.length ? `
    <div class="container mt-1"><h2 class="section-title" style="font-size:1.05rem;">${escapeHtml(t("label_trip_gallery"))}</h2></div>
    <div class="h-scroll-wrap"><div class="h-scroll" id="trip-gallery-scroll">
      ${trip.gallery.map((src, i) => `<button class="gallery-thumb" data-index="${i}"><img src="${src}" alt="${escapeHtml(trip.name)} photo ${i + 1}" loading="lazy" onerror="onImgError(this)"></button>`).join("")}
    </div></div>
    ` : ""}

    <div class="container mt-2" style="padding-bottom:6.5rem;">
      <button class="btn btn-primary btn-block" id="trip-book-now-btn">📩 ${escapeHtml(t("btn_book_now"))}</button>
    </div>
  `;

  document.getElementById("trip-back-btn").addEventListener("click", () => {
    if (history.state && history.length > 1) history.back(); else navigate("home", {}, true);
  });
  document.getElementById("trip-book-now-btn").addEventListener("click", () => openBookingSheet(trip.name));
  if (trip.gallery && trip.gallery.length) {
    currentGalleryList = trip.gallery.map((src, i) => ({ image_url: src, caption: `${trip.name} — ${i + 1}` }));
    document.querySelectorAll("#trip-gallery-scroll .gallery-thumb").forEach(btn => {
      btn.addEventListener("click", () => openLightbox(parseInt(btn.dataset.index, 10)));
    });
  }
}

/* ---------------------------------------------------------
   VEHICLES
   --------------------------------------------------------- */
async function renderVehicles() {
  $app().innerHTML = `
    <div class="section"><div class="container"><h1 class="section-title">${escapeHtml(t("section_vehicles"))}</h1></div>
    <div id="vehicles-wrap">${loadingBlock(t("loading_vehicles"))}</div></div>
  `;
  const vehicles = await getVehicles();
  document.getElementById("vehicles-wrap").innerHTML = vehicles.length
    ? hScroll(vehicles.map(vehicleCardHtml).join(""))
    : emptyBlock(t("empty_vehicles"));
}

/* ---------------------------------------------------------
   GALLERY
   --------------------------------------------------------- */
async function renderGallery() {
  $app().innerHTML = `
    <div class="section"><div class="container"><h1 class="section-title">${escapeHtml(t("section_gallery"))}</h1></div>
    <div id="gallery-wrap">${loadingBlock(t("loading_gallery"))}</div></div>
  `;
  const items = await getGallery();
  currentGalleryList = items;
  document.getElementById("gallery-wrap").innerHTML = items.length
    ? hScroll(items.map((g, i) => `
        <button class="gallery-thumb" data-index="${i}">
          <img src="${g.image_url}" alt="${escapeHtml(g.caption)}" loading="lazy" onerror="onImgError(this)">
        </button>
      `).join(""))
    : emptyBlock(t("empty_gallery"));
  document.querySelectorAll("#gallery-wrap .gallery-thumb").forEach(btn => {
    btn.addEventListener("click", () => openLightbox(parseInt(btn.dataset.index, 10)));
  });
}

function openLightbox(index) {
  currentGalleryIndex = index;
  renderLightbox();
  document.getElementById("lightbox-overlay").classList.add("open");
  document.body.classList.add("no-scroll");
}
function renderLightbox() {
  const item = currentGalleryList[currentGalleryIndex];
  if (!item) return closeLightbox();
  document.getElementById("lightbox-img").src = item.image_url;
  document.getElementById("lightbox-img").alt = item.caption || "";
  document.getElementById("lightbox-caption-text").textContent = item.caption || "";
}
function closeLightbox() {
  document.getElementById("lightbox-overlay")?.classList.remove("open");
  document.body.classList.remove("no-scroll");
}

/* ---------------------------------------------------------
   VIDEOS
   --------------------------------------------------------- */
async function renderVideos() {
  $app().innerHTML = `
    <div class="section"><div class="container"><h1 class="section-title">${escapeHtml(t("section_videos"))}</h1></div>
    <div id="videos-wrap">${loadingBlock(t("loading_videos"))}</div></div>
  `;
  const videos = await getVideos();
  document.getElementById("videos-wrap").innerHTML = videos.length
    ? hScroll(videos.map(v => `
        <button class="video-card" data-yt="${escapeHtml(v.youtubeId || "")}" data-title="${escapeHtml(v.title)}">
          <div class="video-thumb-wrap"><span class="play-icon">▶️</span></div>
          <div class="video-card-body"><h4>${escapeHtml(v.title)}</h4><p class="muted" style="font-size:.85rem;margin:0;">${escapeHtml(v.description)}</p></div>
        </button>
      `).join(""))
    : emptyBlock(t("empty_videos"));
  document.querySelectorAll("#videos-wrap .video-card").forEach(card => {
    card.addEventListener("click", () => openVideoModal(card.dataset.yt, card.dataset.title));
  });
}
function openVideoModal(youtubeId, title) {
  const wrap = document.getElementById("video-frame-wrap");
  if (!youtubeId) {
    wrap.innerHTML = `<div class="state-msg" style="color:#fff;">[No video link added yet for "${escapeHtml(title)}"]</div>`;
  } else {
    wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1" title="${escapeHtml(title)}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  }
  document.getElementById("video-overlay").classList.add("open");
  document.body.classList.add("no-scroll");
}
function closeVideoModal() {
  const overlay = document.getElementById("video-overlay");
  if (overlay) { overlay.classList.remove("open"); document.getElementById("video-frame-wrap").innerHTML = ""; }
  document.body.classList.remove("no-scroll");
}

/* ---------------------------------------------------------
   REVIEWS
   --------------------------------------------------------- */
async function renderReviews() {
  $app().innerHTML = `
    <div class="section"><div class="container"><h1 class="section-title">${escapeHtml(t("section_reviews"))}</h1></div>
    <div id="reviews-wrap">${loadingBlock(t("loading_reviews"))}</div></div>
    <div class="section"><div class="form-card">
      <h2 class="section-title" style="font-size:1.05rem;">${escapeHtml(t("btn_submit"))} — ${escapeHtml(t("section_reviews"))}</h2>
      <form id="review-form">
        <div class="form-group"><label>${escapeHtml(t("form_your_name"))}</label><input type="text" name="name" required></div>
        <div class="form-group"><label>${escapeHtml(t("form_rating"))}</label>
          <select name="rating"><option value="5">★★★★★ (5)</option><option value="4">★★★★☆ (4)</option><option value="3">★★★☆☆ (3)</option><option value="2">★★☆☆☆ (2)</option><option value="1">★☆☆☆☆ (1)</option></select>
        </div>
        <div class="form-group"><label>${escapeHtml(t("form_review_text"))}</label><textarea name="review" required></textarea></div>
        <button type="submit" class="btn btn-primary btn-block">${escapeHtml(t("btn_submit"))}</button>
      </form>
    </div></div>
  `;
  const reviews = await getReviews();
  document.getElementById("reviews-wrap").innerHTML = reviews.length ? hScroll(reviews.map(reviewCardHtml).join("")) : emptyBlock(t("empty_reviews"));

  document.getElementById("review-form").addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    const name = f.name.value.trim();
    const review = f.review.value.trim();
    const rating = parseInt(f.rating.value, 10);
    if (!name || !review) return;
    await saveReview({ name, rating, review, image_url: "" });
    showToast(t("toast_review_submitted"), "success");
    f.reset();
    renderReviews();
  });
}

/* ---------------------------------------------------------
   CONTACT
   --------------------------------------------------------- */
async function renderContact() {
  const biz = getBusiness();
  $app().innerHTML = `
    <div class="section"><div class="container"><h1 class="section-title">${escapeHtml(t("section_contact"))}</h1></div>
    <div class="h-scroll-wrap"><div class="h-scroll">
      <button class="contact-action-card" id="contact-call-btn"><span class="ca-icon">📞</span><span class="ca-label">${escapeHtml(t("contact_call"))}</span></button>
      <button class="contact-action-card" id="contact-whatsapp-btn"><span class="ca-icon">💬</span><span class="ca-label">${escapeHtml(t("contact_whatsapp"))}</span></button>
      <a class="contact-action-card" href="${biz.mapUrl}" target="_blank" rel="noopener"><span class="ca-icon">📍</span><span class="ca-label">${escapeHtml(t("contact_location"))}</span></a>
    </div></div>
    <div class="container mt-2">
      <div class="form-card">
        <p><strong>${escapeHtml(t("contact_call"))}:</strong> ${escapeHtml(biz.phone)}</p>
        <p><strong>${escapeHtml(t("contact_whatsapp"))}:</strong> ${escapeHtml(biz.whatsapp)}</p>
        <p><strong>Email:</strong> ${escapeHtml(biz.email)}</p>
        <p><strong>${escapeHtml(t("contact_location"))}:</strong> ${escapeHtml(biz.address)}</p>
        <p><strong>Hours:</strong> ${escapeHtml(biz.hours)}</p>
      </div>
    </div></div>
  `;
  document.getElementById("contact-call-btn").addEventListener("click", () => { window.location.href = `tel:${biz.phone}`; });
  document.getElementById("contact-whatsapp-btn").addEventListener("click", () => {
    window.open(buildWhatsAppLink(`Hello ${biz.name}, I would like to know more about your trips.`), "_blank");
  });
}

/* ---------------------------------------------------------
   BOOKING BOTTOM SHEET
   --------------------------------------------------------- */
function buildWhatsAppLink(message) {
  const biz = getBusiness();
  return `https://wa.me/${biz.whatsapp}?text=${encodeURIComponent(message)}`;
}
function openBookingSheet(tripName) {
  currentBookingTripName = tripName;
  document.getElementById("sheet-title-text").textContent = t("book_title");
  document.getElementById("sheet-overlay").classList.add("open");
  document.body.classList.add("no-scroll");
}
function closeSheet() {
  document.getElementById("sheet-overlay")?.classList.remove("open");
  document.body.classList.remove("no-scroll");
}
function handleSheetCall() {
  const biz = getBusiness();
  window.location.href = `tel:${biz.phone}`;
}
function handleSheetWhatsApp() {
  const biz = getBusiness();
  const msg = currentBookingTripName
    ? `Hello ${biz.name}, I am interested in the ${currentBookingTripName} trip. Please provide more details.`
    : `Hello ${biz.name}, I would like to know more about your trips.`;
  window.open(buildWhatsAppLink(msg), "_blank");
}
async function handleSheetCopy() {
  const biz = getBusiness();
  try {
    await navigator.clipboard.writeText(biz.phone);
  } catch (e) {
    const el = document.createElement("textarea");
    el.value = biz.phone; document.body.appendChild(el); el.select();
    try { document.execCommand("copy"); } catch (e2) {}
    document.body.removeChild(el);
  }
  showToast(t("toast_copied"), "success");
}

/* ---------------------------------------------------------
   TOAST
   --------------------------------------------------------- */
function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) { container = document.createElement("div"); container.className = "toast-container"; document.body.appendChild(container); }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); }, 3000);
}

/* ---------------------------------------------------------
   NAV / LANGUAGE / MOBILE MENU (chrome around the SPA)
   --------------------------------------------------------- */
function bindNavClicks() {
  document.querySelectorAll("[data-nav]").forEach(el => {
    if (el.dataset.bound) return;
    el.dataset.bound = "1";
    el.addEventListener("click", () => navigate(el.dataset.nav));
  });
}
function closeMobileNav() {
  document.getElementById("mobile-nav")?.classList.remove("open");
}
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("hdt_lang", lang);
  document.querySelectorAll(".lang-pill").forEach(p => p.classList.toggle("active", p.dataset.lang === lang));
  renderChrome();
  render(parseRouteFromHash());
}

/* Re-render the static chrome (nav labels) when language changes */
function renderChrome() {
  document.querySelectorAll("[data-i18n-nav]").forEach(el => {
    el.textContent = t(el.dataset.i18nNav);
  });
}

/* ---------------------------------------------------------
   INIT
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  // language pills
  document.querySelectorAll(".lang-pill").forEach(p => {
    p.classList.toggle("active", p.dataset.lang === currentLang);
    p.addEventListener("click", () => setLang(p.dataset.lang));
  });
  renderChrome();

  // mobile nav toggle
  document.getElementById("nav-toggle-btn")?.addEventListener("click", () => document.getElementById("mobile-nav").classList.add("open"));
  document.getElementById("mobile-nav-close-btn")?.addEventListener("click", closeMobileNav);
  document.getElementById("mobile-nav")?.addEventListener("click", e => { if (e.target.id === "mobile-nav") closeMobileNav(); });

  // floating call/whatsapp buttons
  const biz = getBusiness();
  document.getElementById("float-call-btn")?.addEventListener("click", () => { window.location.href = `tel:${biz.phone}`; });
  document.getElementById("float-whatsapp-btn")?.addEventListener("click", () => {
    window.open(buildWhatsAppLink(`Hello ${biz.name}, I would like to know more about your trips.`), "_blank");
  });

  // bottom sheet controls
  document.getElementById("sheet-call-btn")?.addEventListener("click", handleSheetCall);
  document.getElementById("sheet-whatsapp-btn")?.addEventListener("click", handleSheetWhatsApp);
  document.getElementById("sheet-copy-btn")?.addEventListener("click", handleSheetCopy);
  document.getElementById("sheet-cancel-btn")?.addEventListener("click", closeSheet);
  document.getElementById("sheet-overlay")?.addEventListener("click", e => { if (e.target.id === "sheet-overlay") closeSheet(); });

  // lightbox controls
  document.getElementById("lightbox-close-btn")?.addEventListener("click", closeLightbox);
  document.getElementById("lightbox-prev-btn")?.addEventListener("click", () => { currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryList.length) % currentGalleryList.length; renderLightbox(); });
  document.getElementById("lightbox-next-btn")?.addEventListener("click", () => { currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryList.length; renderLightbox(); });
  document.getElementById("lightbox-overlay")?.addEventListener("click", e => { if (e.target.id === "lightbox-overlay") closeLightbox(); });

  // video modal controls
  document.getElementById("video-close-btn")?.addEventListener("click", closeVideoModal);
  document.getElementById("video-overlay")?.addEventListener("click", e => { if (e.target.id === "video-overlay") closeVideoModal(); });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeLightbox(); closeVideoModal(); closeSheet(); closeMobileNav(); }
  });

  bindNavClicks();

  // initial route
  const initial = parseRouteFromHash();
  history.replaceState(initial, "", routeToHash(initial.name, initial.params));
  render(initial);
});
