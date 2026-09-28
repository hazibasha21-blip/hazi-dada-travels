/* =========================================================
   HAZI DADA TRAVELS — PUBLIC APP (app.js)   [Phase 1: UI]
   SPA routing (History API), views, booking sheet, enquiry
   form, lightbox, video modal, language switching.
   Data comes ONLY from data.js functions (temporary local
   data now; Supabase in Phase 3).
   ========================================================= */

let currentLang = localStorage.getItem("hdt_lang") || "en";
let currentRoute = null;
let booking = { kind: "general", name: "" };
let lbList = [];
let lbIndex = 0;

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || translations.en[key] || key;
}
function esc(v) {
  return String(v === undefined || v === null ? "" : v)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
const $ = id => document.getElementById(id);
const app = () => $("app");
function onImgError(img) { img.onerror = null; img.src = PLACEHOLDER_FALLBACK; }
function stars(n) { let s = ""; for (let i = 1; i <= 5; i++) s += i <= Math.round(n) ? "★" : "☆"; return s; }
function loadingBlock(key) { return `<div class="state-msg"><div class="spinner"></div>${esc(t(key))}</div>`; }
function emptyBlock(text) { return `<div class="state-msg">${esc(text)}</div>`; }
function errorBlock() {
  return `<div class="state-msg">${esc(t("err_load"))}<br><button class="btn btn-outline btn-small mt-1" data-action="retry">${esc(t("btn_retry"))}</button></div>`;
}
function hScroll(html, extra = "") { return `<div class="h-scroll-wrap"><div class="h-scroll ${extra}">${html}</div></div>`; }
function sectionHead(titleKey, route) {
  return `<div class="container section-head"><h2 class="section-title">${esc(t(titleKey))}</h2>
    ${route ? `<button class="link-btn" data-action="nav" data-route="${route}">${esc(t("btn_see_all"))} →</button>` : ""}</div>`;
}
function catLabel(c) {
  const key = "cat_" + String(c).toLowerCase().replace(/\s+/g, "");
  return translations[currentLang][key] || translations.en[key] || c;
}
function isSample(name) { return String(name).includes("[Sample"); }

/* ---------------------------------------------------------
   ROUTER (History API, overlay-aware so Android Back closes
   sheets/lightbox first, then steps back through pages)
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
  if (name === "trip-details") return "#/trip/" + params.id;
  return name === "home" ? "#/" : "#/" + name;
}
function sameRoute(a, b) {
  return !!a && !!b && a.name === b.name && String((a.params || {}).id || "") === String((b.params || {}).id || "");
}
function navigate(name, params = {}, replace = false) {
  const state = { name, params };
  if (replace) history.replaceState(state, "", routeToHash(name, params));
  else history.pushState(state, "", routeToHash(name, params));
  render(state);
}
window.addEventListener("popstate", e => {
  const s = e.state && e.state.name ? e.state : parseRouteFromHash();
  const hadOverlay = anyOverlayOpen();
  closeAllOverlays();
  if (hadOverlay && sameRoute(s, currentRoute)) return; // only an overlay was closed
  render(s);
});

async function render(state) {
  currentRoute = { name: state.name, params: state.params || {} };
  closeAllOverlays();
  closeMenu();
  document.querySelectorAll("[data-route]").forEach(el => {
    if (el.dataset.action === "nav") {
      const active = el.dataset.route === (state.name === "trip-details" ? "trips" : state.name);
      el.classList.toggle("active", active);
    }
  });
  window.scrollTo(0, 0);
  try {
    switch (state.name) {
      case "trips": await renderTrips(); break;
      case "trip-details": await renderTripDetails(state.params.id); break;
      case "vehicles": await renderVehicles(); break;
      case "gallery": await renderGallery(); break;
      case "videos": await renderVideos(); break;
      case "reviews": await renderReviews(); break;
      case "contact": await renderContact(); break;
      default: await renderHome();
    }
  } catch (err) {
    console.error("[render]", err);
    app().innerHTML = errorBlock();
  }
  renderFooter();
}

/* Load data into a container; a failure only affects that one block */
async function fill(id, loader, build, emptyKey) {
  const el = $(id);
  if (!el) return;
  try {
    const data = await loader();
    el.innerHTML = data && data.length ? build(data) : emptyBlock(t(emptyKey));
  } catch (err) {
    console.error("[fill " + id + "]", err);
    el.innerHTML = errorBlock();
  }
}

/* ---------------------------------------------------------
   CARDS
   --------------------------------------------------------- */
function tripCard(tr) {
  return `<article class="trip-card">
    <div class="tc-media" data-action="trip" data-id="${tr.id}">
      <img src="${esc(tr.image)}" alt="${esc(tr.name)}" loading="lazy" onerror="onImgError(this)">
      ${tr.category ? `<span class="tc-cat">${esc(catLabel(tr.category))}</span>` : ""}
    </div>
    <div class="trip-card-body">
      <h3 data-action="trip" data-id="${tr.id}">${esc(tr.name)}</h3>
      <div class="trip-meta-row"><span>📍 ${esc(tr.destination)}</span><span>📅 ${esc(tr.duration)}</span></div>
      <p class="tc-desc">${esc(tr.description)}</p>
      <div class="tc-price">${tr.price ? `<span class="price-tag">${esc(tr.price)}</span>` : ""}</div>
      <div class="tc-actions">
        <button class="btn btn-outline btn-small" data-action="trip" data-id="${tr.id}">${esc(t("btn_view_details"))}</button>
        <button class="btn btn-primary btn-small" data-action="book" data-kind="trip" data-name="${esc(tr.name)}">${esc(t("btn_book_now"))}</button>
      </div>
    </div>
  </article>`;
}
function vehicleCard(v) {
  const ok = v.available !== false;
  return `<article class="vehicle-card">
    <img src="${esc(v.image_url)}" alt="${esc(v.name)}" loading="lazy" onerror="onImgError(this)">
    <div class="vehicle-card-body">
      <h3>${esc(v.name)}</h3>
      <div class="trip-meta-row"><span>🚐 ${esc(v.type)}</span><span>💺 ${esc(v.capacity)}</span></div>
      <p class="tc-desc">${esc(v.description)}</p>
      <span class="availability-badge ${ok ? "available" : "unavailable"}">${esc(t(ok ? "label_available" : "label_unavailable"))}</span>
      <button class="btn btn-primary btn-small" data-action="book" data-kind="vehicle" data-name="${esc(v.name)}">${esc(t("btn_book_vehicle"))}</button>
    </div>
  </article>`;
}
function reviewCard(r) {
  return `<article class="review-card">
    <div class="rc-top">
      ${r.image_url ? `<img class="rc-avatar" src="${esc(r.image_url)}" alt="${esc(r.name)}" loading="lazy" onerror="onImgError(this)">` : `<span class="rc-avatar rc-initial">${esc((r.name || "?").replace("[", "").charAt(0).toUpperCase())}</span>`}
      <div><p class="review-name">${esc(r.name)}</p><div class="review-stars">${stars(r.rating)}</div></div>
    </div>
    <p class="rc-text">"${esc(r.review)}"</p>
    ${isSample(r.name) ? `<span class="badge-demo">${esc(t("sample_badge"))}</span>` : ""}
  </article>`;
}
function videoThumbUrl(v) { return v.youtubeId ? `https://img.youtube.com/vi/${encodeURIComponent(v.youtubeId)}/hqdefault.jpg` : ""; }
function videoCard(v) {
  const thumb = videoThumbUrl(v);
  return `<article class="video-card" data-action="video" data-yt="${esc(v.youtubeId || "")}" data-title="${esc(v.title)}" role="button" tabindex="0">
    <div class="video-thumb-wrap">
      ${thumb ? `<img src="${esc(thumb)}" alt="${esc(v.title)}" loading="lazy" onerror="this.style.display='none'">` : ""}
      <span class="play-icon">▶</span>
    </div>
    <div class="video-card-body"><h4>${esc(v.title)}</h4><p class="muted tc-desc">${esc(v.description)}</p></div>
  </article>`;
}
function galleryThumb(g, i, cls = "") {
  return `<button class="gallery-thumb ${cls}" data-action="lightbox" data-index="${i}" aria-label="${esc(g.caption || "Photo")}">
    <img src="${esc(g.image_url)}" alt="${esc(g.caption || "Gallery photo")}" loading="lazy" onerror="onImgError(this)"></button>`;
}

/* ---------------------------------------------------------
   HOME
   --------------------------------------------------------- */
async function renderHome() {
  app().innerHTML = `
    <section class="hero"><div class="hero-inner">
      <h1>${esc(t("hero_title"))}</h1>
      <p>${esc(t("hero_subtitle"))}</p>
      <div class="hero-actions">
        <button class="btn btn-primary" data-action="nav" data-route="trips">${esc(t("btn_explore_trips"))}</button>
        <button class="btn btn-ghost" data-action="book" data-kind="general">${esc(t("btn_book_now"))}</button>
      </div>
    </div></section>
    <section class="section">${sectionHead("section_featured", "trips")}<div id="h-trips">${loadingBlock("loading_trips")}</div></section>
    <section class="section">${sectionHead("section_vehicles", "vehicles")}<div id="h-vehicles">${loadingBlock("loading_vehicles")}</div></section>
    <section class="section section-tint"><div class="container">
      <h2 class="section-title">${esc(t("why_title"))}</h2>
      <div class="why-grid">
        ${[1, 2, 3, 4].map(n => `<div class="why-card"><span class="why-icon">${["🧾", "🚌", "🗺️", "🤝"][n - 1]}</span><h3>${esc(t("why_" + n + "_t"))}</h3><p class="muted">${esc(t("why_" + n + "_d"))}</p></div>`).join("")}
      </div></div></section>
    <section class="section">${sectionHead("section_gallery", "gallery")}<div id="h-gallery">${loadingBlock("loading_gallery")}</div></section>
    <section class="section">${sectionHead("section_video_preview", "videos")}<div id="h-videos">${loadingBlock("loading_videos")}</div></section>
    <section class="section">${sectionHead("section_reviews", "reviews")}<div id="h-reviews">${loadingBlock("loading_reviews")}</div></section>
    <section class="cta"><div class="container center">
      <h2>${esc(t("cta_title"))}</h2><p>${esc(t("cta_sub"))}</p>
      <div class="hero-actions">
        <button class="btn btn-primary" data-action="book" data-kind="general">${esc(t("btn_book_now"))}</button>
        <button class="btn btn-ghost" data-action="nav" data-route="contact">${esc(t("btn_contact_us"))}</button>
      </div></div></section>`;
  fill("h-trips", getTrips, d => hScroll(d.slice(0, 6).map(tripCard).join("")), "empty_trips");
  fill("h-vehicles", getVehicles, d => hScroll(d.map(vehicleCard).join("")), "empty_vehicles");
  fill("h-gallery", async () => { lbList = await getGallery(); return lbList; },
    d => hScroll(d.slice(0, 8).map((g, i) => galleryThumb(g, i)).join("")), "empty_gallery");
  fill("h-videos", getVideos, d => hScroll(d.slice(0, 4).map(videoCard).join("")), "empty_videos");
  fill("h-reviews", getReviews, d => hScroll(d.map(reviewCard).join("")), "empty_reviews");
}

/* ---------------------------------------------------------
   TRIPS (dynamic category filters)
   --------------------------------------------------------- */
let tripsFilter = "All";
async function renderTrips() {
  app().innerHTML = `<section class="section"><div class="container"><h1 class="section-title">${esc(t("section_trips"))}</h1></div>
    <div id="cat-bar"></div><div id="trips-list">${loadingBlock("loading_trips")}</div></section>`;
  let trips = [];
  try { trips = await getTrips(); } catch (e) { $("trips-list").innerHTML = errorBlock(); return; }
  const cats = ["All", ...new Set(trips.map(x => x.category).filter(Boolean))];
  if (!cats.includes(tripsFilter)) tripsFilter = "All";
  const draw = () => {
    $("cat-bar").innerHTML = hScroll(cats.map(c =>
      `<button class="category-pill ${c === tripsFilter ? "active" : ""}" data-action="cat" data-cat="${esc(c)}">${esc(c === "All" ? t("cat_all") : catLabel(c))}</button>`).join(""), "cat-scroll");
    const list = tripsFilter === "All" ? trips : trips.filter(x => x.category === tripsFilter);
    $("trips-list").innerHTML = list.length ? hScroll(list.map(tripCard).join(""), "wrap-desktop") : emptyBlock(t("empty_trips"));
  };
  window.__drawTrips = draw; // used by the category pill handler
  draw();
}

/* ---------------------------------------------------------
   TRIP DETAILS
   --------------------------------------------------------- */
async function renderTripDetails(id) {
  app().innerHTML = loadingBlock("loading_trips");
  const trip = await getTripById(id);
  if (!trip) { app().innerHTML = emptyBlock(t("error_trip_not_found")); return; }
  let vehicles = [];
  try { vehicles = (await getVehiclesByIds(trip.vehicleIds)).filter(v => v.available !== false); } catch (e) { vehicles = []; }
  lbList = (trip.gallery || []).map((src, i) => ({ image_url: src, caption: `${trip.name} — ${i + 1}` }));
  const biz = getBusiness();
  app().innerHTML = `
    <div class="td-hero">
      <img src="${esc(trip.image)}" alt="${esc(trip.name)}" onerror="onImgError(this)">
      <button class="back-btn" data-action="back">← ${esc(t("btn_back"))}</button>
    </div>
    <div class="container td-head">
      ${trip.category ? `<span class="chip">${esc(catLabel(trip.category))}</span>` : ""}
      <h1>${esc(trip.name)}</h1>
    </div>
    ${hScroll(`
      <div class="info-card"><span class="info-label">📍 ${esc(t("label_destination"))}</span><span class="info-value">${esc(trip.destination)}</span></div>
      <div class="info-card"><span class="info-label">📅 ${esc(t("label_duration"))}</span><span class="info-value">${esc(trip.duration)}</span></div>
      <div class="info-card"><span class="info-label">💰 ${esc(t("label_price"))}</span><span class="info-value">${esc(trip.price || "—")}</span></div>`)}
    <div class="container mt-2"><p class="td-desc">${esc(trip.description)}</p></div>
    ${(trip.highlights || []).length ? `<div class="container mt-1"><h2 class="section-title sm">${esc(t("label_highlights"))}</h2></div>${hScroll(trip.highlights.map(h => `<span class="chip">${esc(h)}</span>`).join(""))}` : ""}
    ${(trip.gallery || []).length ? `<div class="container mt-2"><h2 class="section-title sm">${esc(t("label_trip_gallery"))}</h2></div>${hScroll(lbList.map((g, i) => galleryThumb(g, i)).join(""))}` : ""}
    <div class="container mt-2"><h2 class="section-title sm">${esc(t("label_available_vehicles"))}</h2></div>
    ${vehicles.length ? hScroll(vehicles.map(vehicleCard).join("")) : `<div class="container">${emptyBlock(t("empty_vehicles"))}</div>`}
    <div class="container td-actions">
      <button class="btn btn-primary" data-action="book" data-kind="trip" data-name="${esc(trip.name)}">${esc(t("btn_book_now"))}</button>
      <button class="btn btn-outline" data-action="call">📞 ${esc(t("btn_call"))}</button>
      <button class="btn btn-whatsapp" data-action="whatsapp-trip" data-name="${esc(trip.name)}">💬 ${esc(t("btn_whatsapp"))}</button>
    </div>`;
  void biz;
}

/* ---------------------------------------------------------
   VEHICLES / GALLERY / VIDEOS / REVIEWS / CONTACT
   --------------------------------------------------------- */
async function renderVehicles() {
  app().innerHTML = `<section class="section"><div class="container"><h1 class="section-title">${esc(t("section_vehicles"))}</h1></div><div id="v-list">${loadingBlock("loading_vehicles")}</div></section>`;
  fill("v-list", getVehicles, d => hScroll(d.map(vehicleCard).join(""), "wrap-desktop"), "empty_vehicles");
}
async function renderGallery() {
  app().innerHTML = `<section class="section"><div class="container"><h1 class="section-title">${esc(t("section_gallery"))}</h1><div id="g-list">${loadingBlock("loading_gallery")}</div></div></section>`;
  fill("g-list", async () => { lbList = await getGallery(); return lbList; },
    d => `<div class="gallery-grid">${d.map((g, i) => galleryThumb(g, i, "grid-item")).join("")}</div>`, "empty_gallery");
}
async function renderVideos() {
  app().innerHTML = `<section class="section"><div class="container"><h1 class="section-title">${esc(t("section_videos"))}</h1></div><div id="vd-list">${loadingBlock("loading_videos")}</div></section>`;
  fill("vd-list", getVideos, d => hScroll(d.map(videoCard).join(""), "wrap-desktop"), "empty_videos");
}
async function renderReviews() {
  app().innerHTML = `<section class="section"><div class="container"><h1 class="section-title">${esc(t("section_reviews"))}</h1></div><div id="r-list">${loadingBlock("loading_reviews")}</div></section>
    <section class="section"><div class="form-card"><h2 class="section-title sm">${esc(t("write_review"))}</h2>
    <form id="review-form" novalidate>
      <div class="form-group"><label for="rv-name">${esc(t("form_your_name"))}</label><input id="rv-name" name="name" type="text"></div>
      <div class="form-group"><label for="rv-rating">${esc(t("form_rating"))}</label><select id="rv-rating" name="rating"><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select></div>
      <div class="form-group"><label for="rv-text">${esc(t("form_review_text"))}</label><textarea id="rv-text" name="review"></textarea></div>
      <p class="form-error" id="rv-error"></p>
      <button class="btn btn-primary btn-block" type="submit">${esc(t("btn_submit"))}</button>
    </form></div></section>`;
  fill("r-list", getReviews, d => hScroll(d.map(reviewCard).join(""), "wrap-desktop"), "empty_reviews");
}
async function renderContact() {
  const b = getBusiness();
  const social = [["Facebook", b.facebook], ["Instagram", b.instagram], ["YouTube", b.youtube]].filter(s => s[1] && s[1] !== "#");
  app().innerHTML = `<section class="section"><div class="container"><h1 class="section-title">${esc(t("section_contact"))}</h1>
    ${hScroll(`
      <button class="contact-action-card" data-action="call"><span class="ca-icon">📞</span><span class="ca-label">${esc(t("btn_call"))}</span></button>
      <button class="contact-action-card" data-action="float-whatsapp"><span class="ca-icon">💬</span><span class="ca-label">${esc(t("btn_whatsapp"))}</span></button>
      <a class="contact-action-card" href="mailto:${esc(b.email)}"><span class="ca-icon">✉️</span><span class="ca-label">${esc(t("btn_email"))}</span></a>
      <a class="contact-action-card" href="${esc(b.mapUrl)}" target="_blank" rel="noopener"><span class="ca-icon">📍</span><span class="ca-label">${esc(t("btn_open_map"))}</span></a>`)}
    <div class="info-panel mt-2">
      <p><strong>📞 ${esc(t("contact_phone") || "Phone")}:</strong> ${esc(b.phone)}</p>
      <p><strong>💬 ${esc(t("btn_whatsapp"))}:</strong> ${esc(b.whatsapp)}</p>
      <p><strong>✉️ ${esc(t("contact_email"))}:</strong> ${esc(b.email)}</p>
      <p><strong>📍 ${esc(t("contact_address"))}:</strong> ${esc(b.address)}</p>
      <p><strong>🕘 ${esc(t("contact_hours"))}:</strong> ${esc(b.hours)}</p>
      ${social.length ? `<p><strong>${esc(t("contact_social"))}:</strong> ${social.map(s => `<a class="inline-link" href="${esc(s[1])}" target="_blank" rel="noopener">${s[0]}</a>`).join(" · ")}</p>` : ""}
    </div>
    <div class="center mt-2"><button class="btn btn-primary" data-action="book" data-kind="general">${esc(t("btn_enquire"))}</button></div>
  </div></section>`;
}

function renderFooter() {
  const b = getBusiness();
  $("site-footer").innerHTML = `<div class="container footer-grid">
    <div><div class="footer-brand"><img src="logo.png" alt="Hazi Dada Travels logo"><h4>Hazi Dada Travels</h4></div>
      <p>${esc(b.footerText && !b.footerText.startsWith("[") ? b.footerText : t("footer_about"))}</p></div>
    <div class="footer-links"><h4>${esc(t("footer_quick_links"))}</h4>
      ${KNOWN_ROUTES.map(r => `<a href="#/${r === "home" ? "" : r}" data-action="nav" data-route="${r}">${esc(t("nav_" + r))}</a>`).join("")}</div>
    <div class="footer-links"><h4>${esc(t("footer_contact"))}</h4>
      <span>📞 ${esc(b.phone)}</span><span>✉️ ${esc(b.email)}</span>
      ${["facebook", "instagram", "youtube"].filter(k => b[k] && b[k] !== "#").map(k => `<a href="${esc(b[k])}" target="_blank" rel="noopener">${k[0].toUpperCase() + k.slice(1)}</a>`).join("")}
      <a href="login.html" class="admin-link">Admin</a></div>
  </div><div class="footer-bottom">© ${new Date().getFullYear()} Hazi Dada Travels. ${esc(t("footer_rights"))}</div>`;
}

/* ---------------------------------------------------------
   OVERLAYS (booking sheet, enquiry form, lightbox, video)
   Each open pushes ONE history entry so Android Back closes it.
   --------------------------------------------------------- */
const OVERLAYS = ["sheet-overlay", "enquiry-overlay", "lightbox-overlay", "video-overlay"];
function anyOverlayOpen() { return OVERLAYS.some(id => $(id) && $(id).classList.contains("open")); }
function closeAllOverlays() {
  OVERLAYS.forEach(id => $(id) && $(id).classList.remove("open"));
  const w = $("video-frame-wrap"); if (w) w.innerHTML = "";
  document.body.classList.remove("no-scroll");
}
function openOverlay(id) {
  const s = { ...(currentRoute || { name: "home", params: {} }), overlay: true };
  if (history.state && history.state.overlay) history.replaceState(s, "", location.hash);
  else history.pushState(s, "", location.hash);
  OVERLAYS.forEach(o => $(o).classList.toggle("open", o === id));
  document.body.classList.add("no-scroll");
}
function dismissOverlay() {
  if (history.state && history.state.overlay) history.back();
  else closeAllOverlays();
}
function openMenu() { $("mobile-nav").classList.add("open"); }
function closeMenu() { $("mobile-nav").classList.remove("open"); }

function openBooking(kind, name) {
  booking = { kind, name: name || "" };
  $("sheet-context").textContent = name || "";
  openOverlay("sheet-overlay");
}
function waMessage() {
  const n = getBusiness().name;
  if (booking.kind === "trip") return `Hello ${n}, I am interested in the ${booking.name} trip. Please provide more details.`;
  if (booking.kind === "vehicle") return `Hello ${n}, I would like to enquire about the ${booking.name} vehicle. Please provide more details.`;
  return `Hello ${n}, I would like to know more about your trips and vehicles.`;
}
function openWhatsApp(message) {
  window.location.href = `https://wa.me/${getBusiness().whatsapp}?text=${encodeURIComponent(message)}`;
}
function callNow() { window.location.href = `tel:${getBusiness().phone}`; }

async function openEnquiry() {
  const f = $("enquiry-form");
  f.reset();
  $("enq-error").textContent = "";
  f.trip.value = booking.name || "";
  try { $("enq-trip-list").innerHTML = (await getTrips()).map(x => `<option value="${esc(x.name)}"></option>`).join(""); } catch (e) { /* optional */ }
  openOverlay("enquiry-overlay");
}
async function submitEnquiry(e) {
  e.preventDefault();
  const f = e.target;
  const name = f.name.value.trim(), phone = f.phone.value.trim();
  if (!name || !/^[0-9+\-\s()]{7,15}$/.test(phone)) { $("enq-error").textContent = t("err_required"); return; }
  const btn = $("enq-submit"); btn.disabled = true;
  try {
    // Temporary: stored locally. Phase 3 inserts into the existing `enquiries` table.
    await saveEnquiry({ name, phone, trip: f.trip.value.trim(), travel_date: f.travel_date.value, people: f.people.value, message: f.message.value.trim() });
    toast(t("toast_enquiry_sent"), "success");
    dismissOverlay();
  } catch (err) {
    $("enq-error").textContent = t("error_generic");
  } finally { btn.disabled = false; }
}

/* Lightbox */
function openLightbox(i) { lbIndex = i; drawLightbox(); openOverlay("lightbox-overlay"); }
function drawLightbox() {
  const it = lbList[lbIndex]; if (!it) return;
  $("lightbox-img").src = it.image_url; $("lightbox-img").alt = it.caption || "";
  $("lightbox-caption").textContent = it.caption || "";
}
function lbStep(d) { if (!lbList.length) return; lbIndex = (lbIndex + d + lbList.length) % lbList.length; drawLightbox(); }

/* Video */
function openVideo(yt, title) {
  const wrap = $("video-frame-wrap"), ext = $("video-external");
  if (!yt) { wrap.innerHTML = `<div class="state-msg light">${esc(t("no_video_link"))}</div>`; ext.classList.add("hidden"); }
  else {
    wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${encodeURIComponent(yt)}?autoplay=1&rel=0" title="${esc(title)}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
    ext.href = `https://www.youtube.com/watch?v=${encodeURIComponent(yt)}`; ext.classList.remove("hidden");
  }
  openOverlay("video-overlay");
}

/* Toast */
function toast(msg, type = "info") {
  let c = document.querySelector(".toast-container");
  if (!c) { c = document.createElement("div"); c.className = "toast-container"; document.body.appendChild(c); }
  const el = document.createElement("div"); el.className = "toast toast-" + type; el.textContent = msg; c.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3200);
}

/* ---------------------------------------------------------
   LANGUAGE
   --------------------------------------------------------- */
function applyStaticI18n() {
  document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.documentElement.lang = currentLang;
  $("lang-select").value = currentLang;
}
function setLang(l) {
  currentLang = l; localStorage.setItem("hdt_lang", l);
  applyStaticI18n();
  render(currentRoute || parseRouteFromHash());
}

/* ---------------------------------------------------------
   EVENT DELEGATION (one listener for every button)
   --------------------------------------------------------- */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const a = el.dataset.action;
  if (el.tagName === "A" && a === "nav") e.preventDefault();
  switch (a) {
    case "nav": if (sameRoute({ name: el.dataset.route, params: {} }, currentRoute)) { closeMenu(); window.scrollTo(0, 0); } else navigate(el.dataset.route); break;
    case "trip": navigate("trip-details", { id: el.dataset.id }); break;
    case "back": if (history.length > 1 && currentRoute && currentRoute.name !== "home") history.back(); else navigate("trips", {}, true); break;
    case "book": openBooking(el.dataset.kind, el.dataset.name); break;
    case "cat": tripsFilter = el.dataset.cat; window.__drawTrips && window.__drawTrips(); break;
    case "lightbox": openLightbox(parseInt(el.dataset.index, 10)); break;
    case "lb-prev": lbStep(-1); break;
    case "lb-next": lbStep(1); break;
    case "video": openVideo(el.dataset.yt, el.dataset.title); break;
    case "dismiss": dismissOverlay(); break;
    case "sheet-call": callNow(); break;
    case "sheet-whatsapp": openWhatsApp(waMessage()); break;
    case "sheet-enquire": openEnquiry(); break;
    case "call": callNow(); break;
    case "whatsapp-trip": booking = { kind: "trip", name: el.dataset.name }; openWhatsApp(waMessage()); break;
    case "float-call": callNow(); break;
    case "float-whatsapp": booking = { kind: "general", name: "" }; openWhatsApp(waMessage()); break;
    case "open-menu": openMenu(); break;
    case "close-menu": closeMenu(); break;
    case "retry": render(currentRoute || parseRouteFromHash()); break;
  }
});
document.addEventListener("submit", e => {
  if (e.target.id === "enquiry-form") submitEnquiry(e);
  if (e.target.id === "review-form") submitReview(e);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && anyOverlayOpen()) dismissOverlay();
  if (anyOverlayOpen() && $("lightbox-overlay").classList.contains("open")) {
    if (e.key === "ArrowLeft") lbStep(-1);
    if (e.key === "ArrowRight") lbStep(1);
  }
  if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("[role=button][data-action]")) { e.preventDefault(); e.target.click(); }
});
$("mobile-nav").addEventListener("click", e => { if (e.target.id === "mobile-nav") closeMenu(); });
["sheet-overlay", "enquiry-overlay", "lightbox-overlay", "video-overlay"].forEach(id =>
  $(id).addEventListener("click", e => { if (e.target.id === id) dismissOverlay(); }));
$("lang-select").addEventListener("change", e => setLang(e.target.value));

async function submitReview(e) {
  e.preventDefault();
  const f = e.target;
  const name = f.name.value.trim(), review = f.review.value.trim();
  if (!name || !review) { $("rv-error").textContent = t("err_required").replace(/ and a valid phone number/, ""); return; }
  try {
    // Temporary: stored locally. Phase 3 inserts into the existing `reviews` table.
    await saveReview({ name, rating: parseInt(f.rating.value, 10), review, image_url: "" });
    toast(t("toast_review_submitted"), "success");
    f.reset();
    renderReviews();
  } catch (err) { $("rv-error").textContent = t("error_generic"); }
}

/* ---------------------------------------------------------
   INIT
   --------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  applyStaticI18n();
  const initial = parseRouteFromHash();
  history.replaceState(initial, "", routeToHash(initial.name, initial.params));
  render(initial);
});
