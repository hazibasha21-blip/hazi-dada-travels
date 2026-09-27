/* =========================================================
   HAZI DADA TRAVELS V1
   app.js
   Supabase-compatible SPA
   ========================================================= */

/* =========================
   STATE
   ========================= */

let currentLang = localStorage.getItem("hdt_lang") || "en";
let currentTripsCategory = "All";

let currentGalleryIndex = 0;
let currentGalleryList = [];

let currentBookingTripName = "";

let renderToken = 0;


/* =========================
   HELPERS
   ========================= */

const $app = () => document.getElementById("app");

function t(key) {
  const dict = translations[currentLang] || translations.en;
  return dict[key] || translations.en[key] || key;
}

function escapeHtml(value) {
  if (value === undefined || value === null) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function onImgError(img) {
  if (!img) return;

  img.onerror = null;
  img.src = PLACEHOLDER_FALLBACK;
}

function loadingBlock(message) {
  return `
    <div class="state-msg">
      <div class="spinner"></div>
      ${escapeHtml(message)}
    </div>
  `;
}

function emptyBlock(message) {
  return `
    <div class="state-msg">
      ${escapeHtml(message)}
    </div>
  `;
}

function hScroll(content) {
  return `
    <div class="h-scroll-wrap">
      <div class="h-scroll">
        ${content}
      </div>
    </div>
  `;
}

function renderStars(rating) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));

  let output = "";

  for (let i = 1; i <= 5; i++) {
    output += i <= value ? "★" : "☆";
  }

  return output;
}


/* =========================
   ROUTER
   ========================= */

const KNOWN_ROUTES = [
  "home",
  "trips",
  "vehicles",
  "gallery",
  "videos",
  "reviews",
  "contact"
];

function parseRouteFromHash() {

  const raw = location.hash.replace(/^#\/?/, "");

  if (!raw) {
    return {
      name: "home",
      params: {}
    };
  }

  const parts = raw.split("/");

  if (parts[0] === "trip" && parts[1]) {

    return {
      name: "trip-details",
      params: {
        id: decodeURIComponent(parts.slice(1).join("/"))
      }
    };
  }

  if (KNOWN_ROUTES.includes(parts[0])) {

    return {
      name: parts[0],
      params: {}
    };
  }

  return {
    name: "home",
    params: {}
  };
}

function routeToHash(name, params = {}) {

  if (name === "trip-details") {

    return `#/trip/${encodeURIComponent(params.id)}`;
  }

  if (name === "home") {
    return "#/";
  }

  return `#/${name}`;
}

function navigate(name, params = {}, replace = false) {

  const state = {
    hdt: true,
    name,
    params
  };

  const hash = routeToHash(name, params);

  if (replace) {
    history.replaceState(state, "", hash);
  } else {
    history.pushState(state, "", hash);
  }

  render(state);
}


/* =========================
   NAVIGATION EVENTS
   ========================= */

window.addEventListener("popstate", event => {

  const state =
    event.state && event.state.hdt
      ? event.state
      : parseRouteFromHash();

  render(state);
});


window.addEventListener("hashchange", () => {

  const state = parseRouteFromHash();

  if (
    !history.state ||
    !history.state.hdt
  ) {
    history.replaceState(
      {
        hdt: true,
        ...state
      },
      "",
      routeToHash(state.name, state.params)
    );
  }

  render(state);
});


/* =========================
   MAIN RENDER
   ========================= */

async function render(state) {

  const token = ++renderToken;

  closeMobileNav();
  closeSheet();
  closeLightbox();
  closeVideoModal();

  updateActiveNav(state.name);

  window.scrollTo({
    top: 0,
    behavior: "auto"
  });

  try {

    switch (state.name) {

      case "home":
        await renderHome();
        break;

      case "trips":
        await renderTrips();
        break;

      case "trip-details":
        await renderTripDetails(state.params.id);
        break;

      case "vehicles":
        await renderVehicles();
        break;

      case "gallery":
        await renderGallery();
        break;

      case "videos":
        await renderVideos();
        break;

      case "reviews":
        await renderReviews();
        break;

      case "contact":
        await renderContact();
        break;

      default:
        await renderHome();
    }

  } catch (error) {

    console.error("[HDT render error]", error);

    if (token !== renderToken) return;

    if ($app()) {

      $app().innerHTML = `
        <div class="section">
          ${emptyBlock(
            "Unable to load this page. Please refresh and try again."
          )}
        </div>
      `;
    }
  }
}


/* =========================
   ACTIVE NAV
   ========================= */

function updateActiveNav(routeName) {

  const navRoute =
    routeName === "trip-details"
      ? "trips"
      : routeName;

  document
    .querySelectorAll("[data-nav]")
    .forEach(element => {

      element.classList.toggle(
        "active",
        element.dataset.nav === navRoute
      );
    });
}


/* =========================
   HOME
   ========================= */

async function renderHome() {

  $app().innerHTML = `

    <section class="hero">

      <div class="hero-inner">

        <h1>
          ${escapeHtml(t("hero_title"))}
        </h1>

        <p>
          ${escapeHtml(t("hero_subtitle"))}
        </p>

        <div class="hero-actions">

          <button
            class="btn btn-primary"
            data-nav="trips">
            ${escapeHtml(t("btn_explore_trips"))}
          </button>

          <button
            class="btn btn-ghost"
            data-nav="contact">
            ${escapeHtml(t("btn_contact_us"))}
          </button>

        </div>

      </div>

    </section>


    <section class="quick-actions">

      ${hScroll(quickActionsHtml())}

    </section>


    <section class="section">

      <div class="container">
        <h2 class="section-title">
          ${escapeHtml(t("section_featured"))}
        </h2>
      </div>

      <div id="featured-trips">
        ${loadingBlock(t("loading_trips"))}
      </div>

    </section>


    <section class="section">

      <div class="container">
        <h2 class="section-title">
          ${escapeHtml(t("section_vehicles"))}
        </h2>
      </div>

      <div id="home-vehicles">
        ${loadingBlock(t("loading_vehicles"))}
      </div>

    </section>


    <section class="section">

      <div class="container">
        <h2 class="section-title">
          ${escapeHtml(t("section_reviews"))}
        </h2>
      </div>

      <div id="home-reviews">
        ${loadingBlock(t("loading_reviews"))}
      </div>

    </section>
  `;


  const trips = await getTrips();

  const tripsContainer =
    document.getElementById("featured-trips");

  if (!tripsContainer) return;

  tripsContainer.innerHTML =
    trips.length
      ? hScroll(
          trips
            .slice(0, 6)
            .map(tripCardHtml)
            .join("")
        )
      : emptyBlock(t("empty_trips"));


  const vehicles = await getVehicles();

  const vehiclesContainer =
    document.getElementById("home-vehicles");

  if (vehiclesContainer) {

    const available =
      vehicles.filter(vehicle =>
        vehicle.available !== false
      );

    vehiclesContainer.innerHTML =
      available.length
        ? hScroll(
            available
              .map(vehicleCardHtml)
              .join("")
          )
        : emptyBlock(t("empty_vehicles"));
  }


  const reviews = await getReviews();

  const reviewsContainer =
    document.getElementById("home-reviews");

  if (reviewsContainer) {

    reviewsContainer.innerHTML =
      reviews.length
        ? hScroll(
            reviews
              .map(reviewCardHtml)
              .join("")
          )
        : emptyBlock(t("empty_reviews"));
  }
}


/* =========================
   QUICK ACTIONS
   ========================= */

function quickActionsHtml() {

  const items = [

    ["trips", "🧳", t("nav_trips")],

    ["vehicles", "🚌", t("nav_vehicles")],

    ["gallery", "🖼️", t("nav_gallery")],

    ["videos", "▶️", t("nav_videos")],

    ["reviews", "⭐", t("nav_reviews")],

    ["contact", "📞", t("nav_contact")]

  ];

  return items.map(
    ([route, icon, label]) => `

      <button
        class="quick-action-pill"
        data-nav="${escapeHtml(route)}">

        <span class="qa-icon">
          ${icon}
        </span>

        <span class="qa-label">
          ${escapeHtml(label)}
        </span>

      </button>

    `
  ).join("");
}


/* =========================
   TRIP CARD
   ========================= */

function tripCardHtml(trip) {

  const image =
    trip.image_url ||
    PLACEHOLDER_FALLBACK;

  return `

    <button
      class="trip-card"
      data-trip-id="${escapeHtml(trip.id)}"
      aria-label="${escapeHtml(trip.name)}">

      <img
        src="${escapeHtml(image)}"
        alt="${escapeHtml(trip.name)}"
        loading="lazy"
        onerror="onImgError(this)">

      <div class="trip-card-body">

        <h3>
          ${escapeHtml(trip.name)}
        </h3>

        <div class="trip-meta-row">

          <span>
            📍 ${escapeHtml(trip.destination)}
          </span>

          <span>
            📅 ${escapeHtml(trip.duration)}
          </span>

        </div>

        <div class="flex-between">

          <span class="price-tag">
            ${escapeHtml(trip.price)}
          </span>

          <span class="chip">
            ${escapeHtml(t("btn_view_details"))}
          </span>

        </div>

      </div>

    </button>
  `;
}


function bindTripCardClicks() {

  document
    .querySelectorAll(".trip-card[data-trip-id]")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          navigate(
            "trip-details",
            {
              id: card.dataset.tripId
            }
          );

        }
      );

    });
}


/* =========================
   VEHICLE CARD
   ========================= */

function vehicleCardHtml(vehicle) {

  const image =
    vehicle.image_url ||
    PLACEHOLDER_FALLBACK;

  return `

    <div class="vehicle-card">

      <img
        src="${escapeHtml(image)}"
        alt="${escapeHtml(vehicle.name || "Vehicle")}"
        loading="lazy"
        onerror="onImgError(this)">

      <div class="vehicle-card-body">

        <h3
          style="
            margin:0;
            font-size:1rem;
            color:var(--blue-900);
          ">

          ${escapeHtml(vehicle.name)}

        </h3>

        <div class="trip-meta-row">

          <span>
            🚐 ${escapeHtml(vehicle.type || "")}
          </span>

          <span>
            🧑‍🤝‍🧑 ${escapeHtml(vehicle.capacity || "")}
          </span>

        </div>

        ${
          vehicle.registration
            ? `
              <p
                class="muted"
                style="font-size:.85rem;margin:.2rem 0 0;">

                ${escapeHtml(vehicle.registration)}

              </p>
            `
            : ""
        }

        <span
          class="availability-badge ${
            vehicle.available
              ? "available"
              : "unavailable"
          }">

          ${
            vehicle.available
              ? "Available"
              : "Unavailable"
          }

        </span>

      </div>

    </div>

  `;
}


/* =========================
   REVIEW CARD
   ========================= */

function reviewCardHtml(review) {

  return `

    <article class="review-card">

      <div class="review-stars">
        ${renderStars(review.rating)}
      </div>

      <p style="margin:0;">
        "${escapeHtml(review.comment)}"
      </p>

      <p class="review-name">
        — ${escapeHtml(review.name)}
      </p>

    </article>

  `;
}


/* =========================
   TRIPS PAGE
   ========================= */

async function renderTrips() {

  $app().innerHTML = `

    <div class="section">

      <div class="container">

        <h1 class="section-title">
          ${escapeHtml(t("section_trips"))}
        </h1>

      </div>

      <div
        class="h-scroll-wrap">

        <div
          class="h-scroll"
          id="category-filters">

          <button
            class="category-pill active"
            data-cat="All">

            ${escapeHtml(t("btn_all"))}

          </button>

        </div>

      </div>

    </div>


    <div
      class="section"
      id="trips-list-wrap">

      ${loadingBlock(t("loading_trips"))}

    </div>

  `;


  const allTrips = await getTrips();

  renderTripsList(allTrips);

  bindTripCardClicks();
}


function renderTripsList(allTrips) {

  const wrap =
    document.getElementById("trips-list-wrap");

  if (!wrap) return;

  wrap.innerHTML =
    allTrips.length
      ? hScroll(
          allTrips
            .map(tripCardHtml)
            .join("")
        )
      : emptyBlock(t("empty_trips"));

  bindTripCardClicks();
}


/* =========================
   TRIP DETAILS
   ========================= */

async function renderTripDetails(id) {

  $app().innerHTML =
    loadingBlock(t("loading_trips"));

  const trip =
    await getTripById(id);

  if (!trip) {

    $app().innerHTML =
      emptyBlock(t("error_trip_not_found"));

    return;
  }


  const allVehicles =
    await getVehicles();

  const image =
    trip.image_url ||
    PLACEHOLDER_FALLBACK;


  $app().innerHTML = `

    <div class="trip-details-wrap">

      <button
        class="back-btn"
        id="trip-back-btn">

        ← ${escapeHtml(t("nav_trips"))}

      </button>

      <img
        class="trip-hero-image"
        src="${escapeHtml(image)}"
        alt="${escapeHtml(trip.name)}"
        onerror="onImgError(this)">

    </div>


    <div class="container mt-1">

      <h1
        style="
          margin:0 0 .3rem;
          color:var(--blue-900);
        ">

        ${escapeHtml(trip.name)}

      </h1>

      <p
        class="muted"
        style="margin:0 0 1rem;">

        ${escapeHtml(trip.destination)}

      </p>

    </div>


    <div class="h-scroll-wrap">

      <div class="h-scroll">

        <div class="info-card">

          <span class="info-label">
            📍 ${escapeHtml(t("label_destination"))}
          </span>

          <span class="info-value">
            ${escapeHtml(trip.destination)}
          </span>

        </div>


        <div class="info-card">

          <span class="info-label">
            📅 ${escapeHtml(t("label_duration"))}
          </span>

          <span class="info-value">
            ${escapeHtml(trip.duration)}
          </span>

        </div>


        <div class="info-card">

          <span class="info-label">
            💰 ${escapeHtml(t("label_price"))}
          </span>

          <span class="info-value">
            ${escapeHtml(trip.price)}
          </span>

        </div>

      </div>

    </div>


    <div class="container mt-2">

      <p>
        ${escapeHtml(trip.description)}
      </p>

    </div>


    <div class="container mt-1">

      <h2
        class="section-title"
        style="font-size:1.05rem;">

        ${escapeHtml(t("label_available_vehicles"))}

      </h2>

    </div>


    <div class="h-scroll-wrap">

      <div class="h-scroll">

        ${
          allVehicles.length
            ? allVehicles
                .filter(v => v.available !== false)
                .map(vehicleCardHtml)
                .join("")
            : emptyBlock(t("empty_vehicles"))
        }

      </div>

    </div>


    <div
      class="container mt-2"
      style="padding-bottom:6.5rem;">

      <button
        class="btn btn-primary btn-block"
        id="trip-book-now-btn">

        📩 ${escapeHtml(t("btn_book_now"))}

      </button>

    </div>

  `;


  document
    .getElementById("trip-back-btn")
    ?.addEventListener(
      "click",
      () => {

        if (
          history.state &&
          history.state.hdt
        ) {

          history.back();

        } else {

          navigate(
            "trips",
            {},
            true
          );

        }

      }
    );


  document
    .getElementById("trip-book-now-btn")
    ?.addEventListener(
      "click",
      () => openBookingSheet(trip.name)
    );
}


/* =========================
   VEHICLES PAGE
   ========================= */

async function renderVehicles() {

  $app().innerHTML = `

    <div class="section">

      <div class="container">

        <h1 class="section-title">
          ${escapeHtml(t("section_vehicles"))}
        </h1>

      </div>

      <div id="vehicles-wrap">

        ${loadingBlock(t("loading_vehicles"))}

      </div>

    </div>

  `;


  const vehicles =
    await getVehicles();

  const wrap =
    document.getElementById("vehicles-wrap");

  if (!wrap) return;

  wrap.innerHTML =
    vehicles.length
      ? hScroll(
          vehicles
            .map(vehicleCardHtml)
            .join("")
        )
      : emptyBlock(t("empty_vehicles"));
}


/* =========================
   GALLERY
   ========================= */

async function renderGallery() {

  $app().innerHTML = `

    <div class="section">

      <div class="container">

        <h1 class="section-title">
          ${escapeHtml(t("section_gallery"))}
        </h1>

      </div>

      <div id="gallery-wrap">

        ${loadingBlock(t("loading_gallery"))}

      </div>

    </div>

  `;


  const items =
    await getGallery();

  currentGalleryList =
    items;


  const wrap =
    document.getElementById("gallery-wrap");

  if (!wrap) return;


  wrap.innerHTML =
    items.length

      ? hScroll(

          items
            .map(
              (item, index) => `

                <button
                  class="gallery-thumb"
                  data-index="${index}">

                  <img
                    src="${escapeHtml(
                      item.media_url ||
                      PLACEHOLDER_FALLBACK
                    )}"
                    alt="${escapeHtml(
                      item.title || ""
                    )}"
                    loading="lazy"
                    onerror="onImgError(this)">

                </button>

              `
            )
            .join("")

        )

      : emptyBlock(t("empty_gallery"));


  document
    .querySelectorAll(
      "#gallery-wrap .gallery-thumb"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openLightbox(
            Number(button.dataset.index)
          );

        }
      );

    });
}


/* =========================
   LIGHTBOX
   ========================= */

function openLightbox(index) {

  if (!currentGalleryList.length) return;

  currentGalleryIndex =
    Math.max(
      0,
      Math.min(
        index,
        currentGalleryList.length - 1
      )
    );

  renderLightbox();

  document
    .getElementById("lightbox-overlay")
    ?.classList.add("open");

  document.body.classList.add("no-scroll");
}


function renderLightbox() {

  const item =
    currentGalleryList[currentGalleryIndex];

  if (!item) return;

  const image =
    item.media_url ||
    item.image_url ||
    PLACEHOLDER_FALLBACK;

  const caption =
    item.title ||
    item.caption ||
    "";

  const imageElement =
    document.getElementById("lightbox-img");

  const captionElement =
    document.getElementById(
      "lightbox-caption-text"
    );

  if (imageElement) {

    imageElement.src = image;
    imageElement.alt = caption;
  }

  if (captionElement) {

    captionElement.textContent =
      caption;
  }
}


function closeLightbox() {

  document
    .getElementById("lightbox-overlay")
    ?.classList.remove("open");

  document.body.classList.remove(
    "no-scroll"
  );
}


function lightboxPrevious() {

  if (!currentGalleryList.length) return;

  currentGalleryIndex =
    (
      currentGalleryIndex -
      1 +
      currentGalleryList.length
    ) %
    currentGalleryList.length;

  renderLightbox();
}


function lightboxNext() {

  if (!currentGalleryList.length) return;

  currentGalleryIndex =
    (
      currentGalleryIndex +
      1
    ) %
    currentGalleryList.length;

  renderLightbox();
}


/* =========================
   VIDEOS
   ========================= */

async function renderVideos() {

  $app().innerHTML = `

    <div class="section">

      <div class="container">

        <h1 class="section-title">
          ${escapeHtml(t("section_videos"))}
        </h1>

      </div>

      <div id="videos-wrap">

        ${loadingBlock(t("loading_videos"))}

      </div>

    </div>

  `;


  const videos =
    await getVideos();

  const wrap =
    document.getElementById("videos-wrap");

  if (!wrap) return;


  wrap.innerHTML =
    videos.length

      ? hScroll(

          videos
            .map(
              video => `

                <button
                  class="video-card"
                  data-video-url="${escapeHtml(
                    video.media_url ||
                    video.url ||
                    ""
                  )}"
                  data-title="${escapeHtml(
                    video.title || ""
                  )}">

                  <div
                    class="video-thumb-wrap">

                    <span
                      class="play-icon">

                      ▶️

                    </span>

                  </div>

                  <div
                    class="video-card-body">

                    <h4>
                      ${escapeHtml(
                        video.title || ""
                      )}
                    </h4>

                    <p
                      class="muted"
                      style="
                        font-size:.85rem;
                        margin:0;
                      ">

                      ${escapeHtml(
                        video.description || ""
                      )}

                    </p>

                  </div>

                </button>

              `
            )
            .join("")

        )

      : emptyBlock(t("empty_videos"));


  document
    .querySelectorAll(
      "#videos-wrap .video-card"
    )
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          openVideoModal(
            card.dataset.videoUrl,
            card.dataset.title
          );

        }
      );

    });
}


function openVideoModal(url, title) {

  const wrap =
    document.getElementById(
      "video-frame-wrap"
    );

  if (!wrap) return;


  if (!url) {

    wrap.innerHTML = `
      <div
        class="state-msg"
        style="color:#fff;">

        No video link added yet.

      </div>
    `;

  } else {

    let embedUrl = url;

    const youtubeMatch =
      url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/
      );

    if (youtubeMatch) {

      embedUrl =
        `https://www.youtube.com/embed/${encodeURIComponent(
          youtubeMatch[1]
        )}?autoplay=1`;

    }

    wrap.innerHTML = `

      <iframe
        src="${escapeHtml(embedUrl)}"
        title="${escapeHtml(title || "Video")}"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen>

      </iframe>

    `;
  }


  document
    .getElementById("video-overlay")
    ?.classList.add("open");

  document.body.classList.add("no-scroll");
}


function closeVideoModal() {

  const overlay =
    document.getElementById(
      "video-overlay"
    );

  const frame =
    document.getElementById(
      "video-frame-wrap"
    );

  if (overlay) {
    overlay.classList.remove("open");
  }

  if (frame) {
    frame.innerHTML = "";
  }

  document.body.classList.remove(
    "no-scroll"
  );
}


/* =========================
   REVIEWS
   ========================= */

async function renderReviews() {

  $app().innerHTML = `

    <div class="section">

      <div class="container">

        <h1 class="section-title">
          ${escapeHtml(t("section_reviews"))}
        </h1>

      </div>

      <div id="reviews-wrap">

        ${loadingBlock(t("loading_reviews"))}

      </div>

    </div>


    <div class="section">

      <div class="container">

        <div class="form-card">

          <h2
            class="section-title"
            style="font-size:1.05rem;">

            Share Your Review

          </h2>

          <form id="review-form">

            <div class="form-group">

              <label>
                ${escapeHtml(
                  t("form_name")
                )}
              </label>

              <input
                type="text"
                name="name"
                required>

            </div>


            <div class="form-group">

              <label>
                ${escapeHtml(
                  t("form_rating")
                )}
              </label>

              <select name="rating">

                <option value="5">
                  ★★★★★ (5)
                </option>

                <option value="4">
                  ★★★★☆ (4)
                </option>

                <option value="3">
                  ★★★☆☆ (3)
                </option>

                <option value="2">
                  ★★☆☆☆ (2)
                </option>

                <option value="1">
                  ★☆☆☆☆ (1)
                </option>

              </select>

            </div>


            <div class="form-group">

              <label>
                Review
              </label>

              <textarea
                name="comment"
                required>
              </textarea>

            </div>


            <button
              type="submit"
              class="btn btn-primary btn-block">

              Submit Review

            </button>

          </form>

        </div>

      </div>

    </div>

  `;


  const reviews =
    await getReviews();

  const wrap =
    document.getElementById(
      "reviews-wrap"
    );

  if (wrap) {

    wrap.innerHTML =
      reviews.length

        ? hScroll(
            reviews
              .map(reviewCardHtml)
              .join("")
          )

        : emptyBlock(
            t("empty_reviews")
          );
  }


  const form =
    document.getElementById(
      "review-form"
    );

  if (!form) return;


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      const button =
        form.querySelector(
          'button[type="submit"]'
        );

      if (button) {
        button.disabled = true;
      }


      try {

        const name =
          form.name.value.trim();

        const rating =
          Number(form.rating.value);

        const comment =
          form.comment.value.trim();


        if (!name || !comment) {

          throw new Error(
            "Please complete all fields."
          );
        }


        await saveReview({

          name,
          rating,
          comment

        });


        showToast(
          t("toast_review_submitted"),
          "success"
        );


        form.reset();

        await renderReviews();

      } catch (error) {

        console.error(
          "Review submission error:",
          error
        );

        showToast(
          error.message ||
          t("error_generic"),
          "error"
        );

      } finally {

        if (button) {
          button.disabled = false;
        }

      }

    }
  );
}


/* =========================
   CONTACT
   ========================= */

async function renderContact() {

  const biz =
    await getBusiness();


  $app().innerHTML = `

    <div class="section">

      <div class="container">

        <h1 class="section-title">
          ${escapeHtml(t("section_contact"))}
        </h1>

      </div>


      <div class="h-scroll-wrap">

        <div class="h-scroll">

          <button
            class="contact-action-card"
            id="contact-call-btn">

            <span class="ca-icon">
              📞
            </span>

            <span class="ca-label">
              ${escapeHtml(
                t("contact_call")
              )}
            </span>

          </button>


          <button
            class="contact-action-card"
            id="contact-whatsapp-btn">

            <span class="ca-icon">
              💬
            </span>

            <span class="ca-label">
              ${escapeHtml(
                t("contact_whatsapp")
              )}
            </span>

          </button>


          <a
            class="contact-action-card"
            href="${escapeHtml(
              biz.mapUrl || "#"
            )}"
            target="_blank"
            rel="noopener">

            <span class="ca-icon">
              📍
            </span>

            <span class="ca-label">
              ${escapeHtml(
                t("contact_location")
              )}
            </span>

          </a>

        </div>

      </div>


      <div class="container mt-2">

        <div class="form-card">

          <p>
            <strong>Call:</strong>
            ${escapeHtml(
              biz.phone || "Not provided"
            )}
          </p>

          <p>
            <strong>WhatsApp:</strong>
            ${escapeHtml(
              biz.whatsapp || "Not provided"
            )}
          </p>

          <p>
            <strong>Email:</strong>
            ${escapeHtml(
              biz.email || ""
            )}
          </p>

          <p>
            <strong>Location:</strong>
            ${escapeHtml(
              biz.address || ""
            )}
          </p>

          <p>
            <strong>Hours:</strong>
            ${escapeHtml(
              biz.hours || ""
            )}
          </p>

        </div>

      </div>

    </div>

  `;


  document
    .getElementById("contact-call-btn")
    ?.addEventListener(
      "click",
      () => {

        if (biz.phone) {

          window.location.href =
            `tel:${biz.phone}`;

        }

      }
    );


  document
    .getElementById(
      "contact-whatsapp-btn"
    )
    ?.addEventListener(
      "click",
      () => {

        window.open(
          buildWhatsAppLink(
            `Hello ${biz.name}, I would like to know more about your trips.`
          ),
          "_blank"
        );

      }
    );
}


/* =========================
   BOOKING
   ========================= */

function buildWhatsAppLink(message) {

  const number =
    "91XXXXXXXXXX";

  return `
    https://wa.me/${number}?text=${
      encodeURIComponent(message)
    }
  `;
}


async function openBookingSheet(tripName) {

  currentBookingTripName =
    tripName || "";

  const title =
    document.getElementById(
      "sheet-title-text"
    );

  if (title) {

    title.textContent =
      t("book_title");

  }

  document
    .getElementById("sheet-overlay")
    ?.classList.add("open");

  document.body.classList.add(
    "no-scroll"
  );
}


function closeSheet() {

  document
    .getElementById("sheet-overlay")
    ?.classList.remove("open");

  document.body.classList.remove(
    "no-scroll"
  );
}


async function handleSheetCall() {

  const biz =
    await getBusiness();

  if (biz.phone) {

    window.location.href =
      `tel:${biz.phone}`;

  }
}


async function handleSheetWhatsApp() {

  const biz =
    await getBusiness();

  const message =
    currentBookingTripName

      ? `Hello ${biz.name}, I am interested in the ${currentBookingTripName} trip. Please provide more details.`

      : `Hello ${biz.name}, I would like to know more about your trips.`;


  window.open(
    buildWhatsAppLink(message),
    "_blank"
  );
}


async function handleSheetCopy() {

  const biz =
    await getBusiness();

  if (!biz.phone) return;


  try {

    await navigator.clipboard.writeText(
      biz.phone
    );

  } catch {

    const textarea =
      document.createElement(
        "textarea"
      );

    textarea.value =
      biz.phone;

    document.body.appendChild(
      textarea
    );

    textarea.select();

    try {
      document.execCommand("copy");
    } catch {}

    textarea.remove();

  }


  showToast(
    t("toast_copied"),
    "success"
  );
}


/* =========================
   TOAST
   ========================= */

function showToast(
  message,
  type = "info"
) {

  let container =
    document.querySelector(
      ".toast-container"
    );


  if (!container) {

    container =
      document.createElement(
        "div"
      );

    container.className =
      "toast-container";

    document.body.appendChild(
      container
    );
  }


  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    `toast toast-${type}`;

  toast.textContent =
    message;

  container.appendChild(
    toast
  );


  requestAnimationFrame(
    () => toast.classList.add("show")
  );


  setTimeout(
    () => {

      toast.classList.remove(
        "show"
      );

      setTimeout(
        () => toast.remove(),
        300
      );

    },
    3000
  );
}


/* =========================
   NAVIGATION CLICK HANDLER
   ========================= */

function bindNavClicks() {

  document
    .querySelectorAll("[data-nav]")
    .forEach(element => {

      if (element.dataset.bound === "1") {
        return;
      }

      element.dataset.bound = "1";

      element.addEventListener(
        "click",
        event => {

          event.preventDefault();

          navigate(
            element.dataset.nav
          );

          closeMobileNav();

        }
      );

    });
}


/* =========================
   MOBILE MENU
   ========================= */

function closeMobileNav() {

  document
    .getElementById("mobile-nav")
    ?.classList.remove("open");
}


/* =========================
   LANGUAGE
   ========================= */

function setLang(lang) {

  if (!translations[lang]) {
    return;
  }

  currentLang =
    lang;

  localStorage.setItem(
    "hdt_lang",
    lang
  );


  document
    .querySelectorAll(".lang-pill")
    .forEach(pill => {

      pill.classList.toggle(
        "active",
        pill.dataset.lang === lang
      );

    });


  renderChrome();

  render(
    parseRouteFromHash()
  );
}


function renderChrome() {

  document
    .querySelectorAll("[data-i18n-nav]")
    .forEach(element => {

      element.textContent =
        t(
          element.dataset.i18nNav
        );

    });
}


/* =========================
   INIT
   ========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* Language buttons */

    document
      .querySelectorAll(".lang-pill")
      .forEach(pill => {

        pill.classList.toggle(
          "active",
          pill.dataset.lang === currentLang
        );

        pill.addEventListener(
          "click",
          () => setLang(
            pill.dataset.lang
          )
        );

      });


    renderChrome();


    /* Mobile menu */

    document
      .getElementById("nav-toggle-btn")
      ?.addEventListener(
        "click",
        () => {

          document
            .getElementById(
              "mobile-nav"
            )
            ?.classList.add("open");

        }
      );


    document
      .getElementById(
        "mobile-nav-close-btn"
      )
      ?.addEventListener(
        "click",
        closeMobileNav
      );


    document
      .getElementById("mobile-nav")
      ?.addEventListener(
        "click",
        event => {

          if (
            event.target.id ===
            "mobile-nav"
          ) {

            closeMobileNav();

          }

        }
      );


    /* Floating buttons */

    document
      .getElementById(
        "float-call-btn"
      )
      ?.addEventListener(
        "click",
        async () => {

          const biz =
            await getBusiness();

          if (biz.phone) {

            window.location.href =
              `tel:${biz.phone}`;

          }

        }
      );


    document
      .getElementById(
        "float-whatsapp-btn"
      )
      ?.addEventListener(
        "click",
        async () => {

          const biz =
            await getBusiness();

          window.open(
            buildWhatsAppLink(
              `Hello ${biz.name}, I would like to know more about your trips.`
            ),
            "_blank"
          );

        }
      );


    /* Booking sheet */

    document
      .getElementById(
        "sheet-call-btn"
      )
      ?.addEventListener(
        "click",
        handleSheetCall
      );


    document
      .getElementById(
        "sheet-whatsapp-btn"
      )
      ?.addEventListener(
        "click",
        handleSheetWhatsApp
      );


    document
      .getElementById(
        "sheet-copy-btn"
      )
      ?.addEventListener(
        "click",
        handleSheetCopy
      );


    document
      .getElementById(
        "sheet-cancel-btn"
      )
      ?.addEventListener(
        "click",
        closeSheet
      );


    document
      .getElementById(
        "sheet-overlay"
      )
      ?.addEventListener(
        "click",
        event => {

          if (
            event.target.id ===
            "sheet-overlay"
          ) {

            closeSheet();

          }

        }
      );


    /* Lightbox */

    document
      .getElementById(
        "lightbox-close-btn"
      )
      ?.addEventListener(
        "click",
        closeLightbox
      );


    document
      .getElementById(
        "lightbox-prev-btn"
      )
      ?.addEventListener(
        "click",
        lightboxPrevious
      );


    document
      .getElementById(
        "lightbox-next-btn"
      )
      ?.addEventListener(
        "click",
        lightboxNext
      );


    document
      .getElementById(
        "lightbox-overlay"
      )
      ?.addEventListener(
        "click",
        event => {

          if (
            event.target.id ===
            "lightbox-overlay"
          ) {

            closeLightbox();

          }

        }
      );


    /* Video modal */

    document
      .getElementById(
        "video-close-btn"
      )
      ?.addEventListener(
        "click",
        closeVideoModal
      );


    document
      .getElementById(
        "video-overlay"
      )
      ?.addEventListener(
        "click",
        event => {

          if (
            event.target.id ===
            "video-overlay"
          ) {

            closeVideoModal();

          }

        }
      );


    /* Escape key */

    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Escape"
        ) {

          closeLightbox();
          closeVideoModal();
          closeSheet();
          closeMobileNav();

        }

      }
    );


    /* Navigation */

    bindNavClicks();


    /* Initial route */

    const initial =
      parseRouteFromHash();


    history.replaceState(
      {
        hdt: true,
        ...initial
      },
      "",
      routeToHash(
        initial.name,
        initial.params
      )
    );


    render(initial);

  }
);
