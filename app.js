/* =========================================================
   HAZI DADA TRAVELS — PUBLIC APP (app.js)
   Compatible with current Supabase data.js
   ========================================================= */

let currentLang = localStorage.getItem("hdt_lang") || "en";
let currentRoute = null;
let booking = { kind: "general", name: "" };
let lbList = [];
let lbIndex = 0;

/* ---------------------------------------------------------
   HELPERS
   --------------------------------------------------------- */

function t(key, fallback = "") {
  try {
    if (
      typeof translations !== "undefined" &&
      translations[currentLang] &&
      translations[currentLang][key] !== undefined
    ) {
      return translations[currentLang][key];
    }

    if (
      typeof translations !== "undefined" &&
      translations.en &&
      translations.en[key] !== undefined
    ) {
      return translations.en[key];
    }
  } catch (e) {}

  return fallback || key;
}

function esc(v) {
  return String(v === undefined || v === null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const $ = id => document.getElementById(id);
const app = () => $("app");

function onImgError(img) {
  img.onerror = null;

  if (
    typeof PLACEHOLDER_FALLBACK !== "undefined" &&
    PLACEHOLDER_FALLBACK
  ) {
    img.src = PLACEHOLDER_FALLBACK;
  }
}

function stars(n) {
  let s = "";
  for (let i = 1; i <= 5; i++) {
    s += i <= Math.round(Number(n) || 0) ? "★" : "☆";
  }
  return s;
}

function loadingBlock(key = "loading") {
  return `
    <div class="state-msg">
      <div class="spinner"></div>
      ${esc(t(key, "Loading..."))}
    </div>
  `;
}

function emptyBlock(text) {
  return `<div class="state-msg">${esc(text)}</div>`;
}

function errorBlock() {
  return `
    <div class="state-msg">
      ${esc(t("err_load", "Unable to load this section."))}
      <br>
      <button class="btn btn-outline btn-small mt-1" data-action="retry">
        ${esc(t("btn_retry", "Retry"))}
      </button>
    </div>
  `;
}

function hScroll(html, extra = "") {
  return `
    <div class="h-scroll-wrap">
      <div class="h-scroll ${extra}">
        ${html}
      </div>
    </div>
  `;
}

function sectionHead(titleKey, route) {
  return `
    <div class="container section-head">
      <h2 class="section-title">
        ${esc(t(titleKey, titleKey))}
      </h2>
      ${
        route
          ? `
            <button
              class="link-btn"
              data-action="nav"
              data-route="${esc(route)}"
            >
              ${esc(t("btn_see_all", "See all"))} →
            </button>
          `
          : ""
      }
    </div>
  `;
}

function catLabel(c) {
  const key =
    "cat_" +
    String(c || "")
      .toLowerCase()
      .replace(/\s+/g, "");

  try {
    return (
      (translations[currentLang] &&
        translations[currentLang][key]) ||
      (translations.en && translations.en[key]) ||
      c
    );
  } catch (e) {
    return c;
  }
}

function isSample(name) {
  return String(name || "").includes("[Sample");
}

/* ---------------------------------------------------------
   ROUTER
   --------------------------------------------------------- */

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
        id: parts[1]
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
    return "#/trip/" + encodeURIComponent(params.id);
  }

  return name === "home" ? "#/" : "#/" + name;
}

function sameRoute(a, b) {
  return (
    !!a &&
    !!b &&
    a.name === b.name &&
    String((a.params || {}).id || "") ===
      String((b.params || {}).id || "")
  );
}

function navigate(name, params = {}, replace = false) {
  const state = {
    name,
    params
  };

  if (replace) {
    history.replaceState(
      state,
      "",
      routeToHash(name, params)
    );
  } else {
    history.pushState(
      state,
      "",
      routeToHash(name, params)
    );
  }

  render(state);
}

window.addEventListener("popstate", e => {
  const s =
    e.state && e.state.name
      ? e.state
      : parseRouteFromHash();

  const hadOverlay = anyOverlayOpen();

  closeAllOverlays();

  if (
    hadOverlay &&
    sameRoute(s, currentRoute)
  ) {
    return;
  }

  render(s);
});

/* ---------------------------------------------------------
   MAIN RENDER
   --------------------------------------------------------- */

async function render(state) {
  currentRoute = {
    name: state.name,
    params: state.params || {}
  };

  closeAllOverlays();
  closeMenu();

  document
    .querySelectorAll("[data-route]")
    .forEach(el => {
      if (el.dataset.action === "nav") {
        const active =
          el.dataset.route ===
          (
            state.name === "trip-details"
              ? "trips"
              : state.name
          );

        el.classList.toggle("active", active);
      }
    });

  window.scrollTo(0, 0);

  try {
    switch (state.name) {
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
        break;
    }
  } catch (err) {
    console.error("[render]", err);

    if (app()) {
      app().innerHTML = errorBlock();
    }
  }

  renderFooter();
}

/* ---------------------------------------------------------
   DATA LOADER
   --------------------------------------------------------- */

async function fill(id, loader, build, emptyKey) {
  const el = $(id);

  if (!el) return;

  try {
    const data = await loader();

    el.innerHTML =
      data && data.length
        ? build(data)
        : emptyBlock(
            t(
              emptyKey,
              "Nothing available right now."
            )
          );
  } catch (err) {
    console.error("[fill " + id + "]", err);

    el.innerHTML = errorBlock();
  }
}

/* ---------------------------------------------------------
   CARDS
   --------------------------------------------------------- */

function tripCard(tr) {
  return `
    <article class="trip-card">

      <div
        class="tc-media"
        data-action="trip"
        data-id="${esc(tr.id)}"
      >
        <img
          src="${esc(tr.image || tr.image_url || "")}"
          alt="${esc(tr.name)}"
          loading="lazy"
          onerror="onImgError(this)"
        >

        ${
          tr.category
            ? `
              <span class="tc-cat">
                ${esc(catLabel(tr.category))}
              </span>
            `
            : ""
        }
      </div>

      <div class="trip-card-body">

        <h3
          data-action="trip"
          data-id="${esc(tr.id)}"
        >
          ${esc(tr.name)}
        </h3>

        <div class="trip-meta-row">
          <span>📍 ${esc(tr.destination)}</span>
          <span>📅 ${esc(tr.duration)}</span>
        </div>

        ${
          tr.description
            ? `
              <p class="tc-desc">
                ${esc(tr.description)}
              </p>
            `
            : ""
        }

        <div class="tc-price">
          ${
            tr.price
              ? `<span class="price-tag">${esc(tr.price)}</span>`
              : ""
          }
        </div>

        <div class="tc-actions">

          <button
            class="btn btn-outline btn-small"
            data-action="trip"
            data-id="${esc(tr.id)}"
          >
            ${esc(
              t(
                "btn_view_details",
                "View Details"
              )
            )}
          </button>

          <button
            class="btn btn-primary btn-small"
            data-action="book"
            data-kind="trip"
            data-name="${esc(tr.name)}"
          >
            ${esc(
              t(
                "btn_book_now",
                "Book Now"
              )
            )}
          </button>

        </div>

      </div>
    </article>
  `;
}

function vehicleCard(v) {
  const ok = v.available !== false;

  return `
    <article class="vehicle-card">

      <img
        src="${esc(v.image_url || v.image || "")}"
        alt="${esc(v.name)}"
        loading="lazy"
        onerror="onImgError(this)"
      >

      <div class="vehicle-card-body">

        <h3>${esc(v.name)}</h3>

        <div class="trip-meta-row">
          <span>🚐 ${esc(v.type)}</span>
          ${
            v.capacity
              ? `<span>💺 ${esc(v.capacity)}</span>`
              : ""
          }
        </div>

        <span
          class="availability-badge ${
            ok ? "available" : "unavailable"
          }"
        >
          ${esc(
            t(
              ok
                ? "label_available"
                : "label_unavailable",
              ok ? "Available" : "Unavailable"
            )
          )}
        </span>

        <button
          class="btn btn-primary btn-small"
          data-action="book"
          data-kind="vehicle"
          data-name="${esc(v.name)}"
        >
          ${esc(
            t(
              "btn_book_vehicle",
              "Book Vehicle"
            )
          )}
        </button>

      </div>
    </article>
  `;
}

function reviewCard(r) {
  return `
    <article class="review-card">

      <div class="rc-top">

        ${
          r.image_url
            ? `
              <img
                class="rc-avatar"
                src="${esc(r.image_url)}"
                alt="${esc(r.name)}"
                loading="lazy"
                onerror="onImgError(this)"
              >
            `
            : `
              <span class="rc-avatar rc-initial">
                ${esc(
                  (r.name || "?")
                    .replace("[", "")
                    .charAt(0)
                    .toUpperCase()
                )}
              </span>
            `
        }

        <div>
          <p class="review-name">
            ${esc(r.name)}
          </p>

          <div class="review-stars">
            ${stars(r.rating)}
          </div>
        </div>

      </div>

      <p class="rc-text">
        "${esc(r.review || r.comment || "")}"
      </p>

      ${
        isSample(r.name)
          ? `
            <span class="badge-demo">
              ${esc(
                t(
                  "sample_badge",
                  "Sample"
                )
              )}
            </span>
          `
          : ""
      }

    </article>
  `;
}

function videoThumbUrl(v) {
  return v.youtubeId
    ? `https://img.youtube.com/vi/${encodeURIComponent(
        v.youtubeId
      )}/hqdefault.jpg`
    : "";
}

function videoCard(v) {
  const thumb = videoThumbUrl(v);

  return `
    <article
      class="video-card"
      data-action="video"
      data-yt="${esc(v.youtubeId || "")}"
      data-title="${esc(v.title)}"
      role="button"
      tabindex="0"
    >

      <div class="video-thumb-wrap">

        ${
          thumb
            ? `
              <img
                src="${esc(thumb)}"
                alt="${esc(v.title)}"
                loading="lazy"
                onerror="this.style.display='none'"
              >
            `
            : ""
        }

        <span class="play-icon">▶</span>

      </div>

      <div class="video-card-body">

        <h4>${esc(v.title)}</h4>

        ${
          v.description
            ? `
              <p class="muted tc-desc">
                ${esc(v.description)}
              </p>
            `
            : ""
        }

      </div>

    </article>
  `;
}

function galleryThumb(g, i, cls = "") {
  return `
    <button
      class="gallery-thumb ${cls}"
      data-action="lightbox"
      data-index="${i}"
      aria-label="${esc(
        g.caption ||
          g.title ||
          "Photo"
      )}"
    >
      <img
        src="${esc(
          g.image_url ||
            g.media_url ||
            ""
        )}"
        alt="${esc(
          g.caption ||
            g.title ||
            "Gallery photo"
        )}"
        loading="lazy"
        onerror="onImgError(this)"
      >
    </button>
  `;
}

/* ---------------------------------------------------------
   HOME
   --------------------------------------------------------- */

async function renderHome() {
  app().innerHTML = `
    <section class="hero">
      <div class="hero-inner">

        <h1>
          ${esc(
            t(
              "hero_title",
              "Travel with Hazi Dada Travels"
            )
          )}
        </h1>

        <p>
          ${esc(
            t(
              "hero_subtitle",
              "Comfortable travel, trusted service."
            )
          )}
        </p>

        <div class="hero-actions">

          <button
            class="btn btn-primary"
            data-action="nav"
            data-route="trips"
          >
            ${esc(
              t(
                "btn_explore_trips",
                "Explore Trips"
              )
            )}
          </button>

          <button
            class="btn btn-ghost"
            data-action="book"
            data-kind="general"
          >
            ${esc(
              t(
                "btn_book_now",
                "Book Now"
              )
            )}
          </button>

        </div>

      </div>
    </section>

    <section class="section">
      ${sectionHead(
        "section_featured",
        "trips"
      )}

      <div id="h-trips">
        ${loadingBlock("loading_trips")}
      </div>
    </section>

    <section class="section">
      ${sectionHead(
        "section_vehicles",
        "vehicles"
      )}

      <div id="h-vehicles">
        ${loadingBlock("loading_vehicles")}
      </div>
    </section>

    <section class="section section-tint">
      <div class="container">

        <h2 class="section-title">
          ${esc(
            t(
              "why_title",
              "Why Choose Us"
            )
          )}
        </h2>

        <div class="why-grid">

          ${[1, 2, 3, 4]
            .map(
              n => `
                <div class="why-card">

                  <span class="why-icon">
                    ${
                      ["🧾", "🚌", "🗺️", "🤝"][
                        n - 1
                      ]
                    }
                  </span>

                  <h3>
                    ${esc(
                      t(
                        "why_" + n + "_t",
                        [
                          "Easy Booking",
                          "Comfortable Vehicles",
                          "Flexible Trips",
                          "Trusted Service"
                        ][n - 1]
                      )
                    )}
                  </h3>

                  <p class="muted">
                    ${esc(
                      t(
                        "why_" + n + "_d",
                        ""
                      )
                    )}
                  </p>

                </div>
              `
            )
            .join("")}

        </div>

      </div>
    </section>

    <section class="section">
      ${sectionHead(
        "section_gallery",
        "gallery"
      )}

      <div id="h-gallery">
        ${loadingBlock("loading_gallery")}
      </div>
    </section>

    <section class="section">
      ${sectionHead(
        "section_video_preview",
        "videos"
      )}

      <div id="h-videos">
        ${loadingBlock("loading_videos")}
      </div>
    </section>

    <section class="section">
      ${sectionHead(
        "section_reviews",
        "reviews"
      )}

      <div id="h-reviews">
        ${loadingBlock("loading_reviews")}
      </div>
    </section>

    <section class="cta">
      <div class="container center">

        <h2>
          ${esc(
            t(
              "cta_title",
              "Plan Your Journey"
            )
          )}
        </h2>

        <p>
          ${esc(
            t(
              "cta_sub",
              "Contact us for trips and vehicle bookings."
            )
          )}
        </p>

        <div class="hero-actions">

          <button
            class="btn btn-primary"
            data-action="book"
            data-kind="general"
          >
            ${esc(
              t(
                "btn_book_now",
                "Book Now"
              )
            )}
          </button>

          <button
            class="btn btn-ghost"
            data-action="nav"
            data-route="contact"
          >
            ${esc(
              t(
                "btn_contact_us",
                "Contact Us"
              )
            )}
          </button>

        </div>

      </div>
    </section>
  `;

  fill(
    "h-trips",
    getTrips,
    d =>
      hScroll(
        d
          .slice(0, 6)
          .map(tripCard)
          .join("")
      ),
    "empty_trips"
  );

  fill(
    "h-vehicles",
    getVehicles,
    d =>
      hScroll(
        d
          .map(vehicleCard)
          .join("")
      ),
    "empty_vehicles"
  );

  fill(
    "h-gallery",
    async () => {
      lbList = await getGallery();
      return lbList;
    },
    d =>
      hScroll(
        d
          .slice(0, 8)
          .map((g, i) =>
            galleryThumb(g, i)
          )
          .join("")
      ),
    "empty_gallery"
  );

  fill(
    "h-videos",
    getVideos,
    d =>
      hScroll(
        d
          .slice(0, 4)
          .map(videoCard)
          .join("")
      ),
    "empty_videos"
  );

  fill(
    "h-reviews",
    getReviews,
    d =>
      hScroll(
        d
          .map(reviewCard)
          .join("")
      ),
    "empty_reviews"
  );
}

/* ---------------------------------------------------------
   TRIPS
   --------------------------------------------------------- */

let tripsFilter = "All";

async function renderTrips() {
  app().innerHTML = `
    <section class="section">

      <div class="container">
        <h1 class="section-title">
          ${esc(
            t(
              "section_trips",
              "Trips"
            )
          )}
        </h1>
      </div>

      <div id="cat-bar"></div>

      <div id="trips-list">
        ${loadingBlock("loading_trips")}
      </div>

    </section>
  `;

  let trips = [];

  try {
    trips = await getTrips();
  } catch (e) {
    console.error("[trips]", e);

    $("trips-list").innerHTML =
      errorBlock();

    return;
  }

  const cats = [
    "All",
    ...new Set(
      trips
        .map(x => x.category)
        .filter(Boolean)
    )
  ];

  if (!cats.includes(tripsFilter)) {
    tripsFilter = "All";
  }

  const draw = () => {
    $("cat-bar").innerHTML = hScroll(
      cats
        .map(
          c => `
            <button
              class="category-pill ${
                c === tripsFilter
                  ? "active"
                  : ""
              }"
              data-action="cat"
              data-cat="${esc(c)}"
            >
              ${esc(
                c === "All"
                  ? t(
                      "cat_all",
                      "All"
                    )
                  : catLabel(c)
              )}
            </button>
          `
        )
        .join(""),
      "cat-scroll"
    );

    const list =
      tripsFilter === "All"
        ? trips
        : trips.filter(
            x =>
              x.category ===
              tripsFilter
          );

    $("trips-list").innerHTML =
      list.length
        ? hScroll(
            list
              .map(tripCard)
              .join(""),
            "wrap-desktop"
          )
        : emptyBlock(
            t(
              "empty_trips",
              "No trips available."
            )
          );
  };

  window.__drawTrips = draw;

  draw();
}

/* ---------------------------------------------------------
   TRIP DETAILS
   --------------------------------------------------------- */

async function renderTripDetails(id) {
  app().innerHTML =
    loadingBlock("loading_trips");

  let trip = null;

  try {
    /*
      Current data.js provides getTrip().
      Older app.js expected getTripById().
    */
    trip = await getTrip(id);
  } catch (err) {
    console.error(
      "[trip details]",
      err
    );
  }

  if (!trip) {
    app().innerHTML = emptyBlock(
      t(
        "error_trip_not_found",
        "Trip not found."
      )
    );

    return;
  }

  /*
    Current trips table contains a single
    vehicle text field, not vehicleIds.
    Therefore we load all vehicles and show
    available vehicles.
  */
  let vehicles = [];

  try {
    const allVehicles =
      await getVehicles();

    vehicles = Array.isArray(
      allVehicles
    )
      ? allVehicles.filter(
          v =>
            v.available !== false
        )
      : [];
  } catch (e) {
    console.error(
      "[trip vehicles]",
      e
    );

    vehicles = [];
  }

  const gallery =
    Array.isArray(trip.gallery)
      ? trip.gallery
      : [];

  lbList = gallery.map(
    (src, i) => ({
      image_url: src,
      caption:
        `${trip.name} — ${i + 1}`
    })
  );

  app().innerHTML = `
    <div class="td-hero">

      <img
        src="${esc(
          trip.image ||
            trip.image_url ||
            ""
        )}"
        alt="${esc(trip.name)}"
        onerror="onImgError(this)"
      >

      <button
        class="back-btn"
        data-action="back"
      >
        ← ${esc(
          t(
            "btn_back",
            "Back"
          )
        )}
      </button>

    </div>

    <div class="container td-head">

      ${
        trip.category
          ? `
            <span class="chip">
              ${esc(
                catLabel(
                  trip.category
                )
              )}
            </span>
          `
          : ""
      }

      <h1>${esc(trip.name)}</h1>

    </div>

    ${hScroll(`
      <div class="info-card">
        <span class="info-label">
          📍 ${esc(
            t(
              "label_destination",
              "Destination"
            )
          )}
        </span>

        <span class="info-value">
          ${esc(trip.destination)}
        </span>
      </div>

      <div class="info-card">
        <span class="info-label">
          📅 ${esc(
            t(
              "label_duration",
              "Duration"
            )
          )}
        </span>

        <span class="info-value">
          ${esc(trip.duration)}
        </span>
      </div>

      <div class="info-card">
        <span class="info-label">
          💰 ${esc(
            t(
              "label_price",
              "Price"
            )
          )}
        </span>

        <span class="info-value">
          ${esc(
            trip.price || "—"
          )}
        </span>
      </div>
    `)}

    <div class="container mt-2">

      <p class="td-desc">
        ${esc(
          trip.description || ""
        )}
      </p>

    </div>

    ${
      Array.isArray(
        trip.highlights
      ) &&
      trip.highlights.length
        ? `
          <div class="container mt-1">

            <h2 class="section-title sm">
              ${esc(
                t(
                  "label_highlights",
                  "Highlights"
                )
              )}
            </h2>

          </div>

          ${hScroll(
            trip.highlights
              .map(
                h =>
                  `<span class="chip">${esc(
                    h
                  )}</span>`
              )
              .join("")
          )}
        `
        : ""
    }

    ${
      gallery.length
        ? `
          <div class="container mt-2">

            <h2 class="section-title sm">
              ${esc(
                t(
                  "label_trip_gallery",
                  "Trip Gallery"
                )
              )}
            </h2>

          </div>

          ${hScroll(
            lbList
              .map((g, i) =>
                galleryThumb(g, i)
              )
              .join("")
          )}
        `
        : ""
    }

    <div class="container mt-2">

      <h2 class="section-title sm">
        ${esc(
          t(
            "label_available_vehicles",
            "Available Vehicles"
          )
        )}
      </h2>

    </div>

    ${
      vehicles.length
        ? hScroll(
            vehicles
              .map(vehicleCard)
              .join("")
          )
        : `
          <div class="container">
            ${emptyBlock(
              t(
                "empty_vehicles",
                "No vehicles available."
              )
            )}
          </div>
        `
    }

    <div class="container td-actions">

      <button
        class="btn btn-primary"
        data-action="book"
        data-kind="trip"
        data-name="${esc(trip.name)}"
      >
        ${esc(
          t(
            "btn_book_now",
            "Book Now"
          )
        )}
      </button>

      <button
        class="btn btn-outline"
        data-action="call"
      >
        📞 ${esc(
          t(
            "btn_call",
            "Call"
          )
        )}
      </button>

      <button
        class="btn btn-whatsapp"
        data-action="whatsapp-trip"
        data-name="${esc(trip.name)}"
      >
        💬 ${esc(
          t(
            "btn_whatsapp",
            "WhatsApp"
          )
        )}
      </button>

    </div>
  `;
}

/* ---------------------------------------------------------
   VEHICLES
   --------------------------------------------------------- */

async function renderVehicles() {
  app().innerHTML = `
    <section class="section">

      <div class="container">
        <h1 class="section-title">
          ${esc(
            t(
              "section_vehicles",
              "Vehicles"
            )
          )}
        </h1>
      </div>

      <div id="v-list">
        ${loadingBlock(
          "loading_vehicles"
        )}
      </div>

    </section>
  `;

  fill(
    "v-list",
    getVehicles,
    d =>
      hScroll(
        d
          .map(vehicleCard)
          .join(""),
        "wrap-desktop"
      ),
    "empty_vehicles"
  );
}

/* ---------------------------------------------------------
   GALLERY
   --------------------------------------------------------- */

async function renderGallery() {
  app().innerHTML = `
    <section class="section">

      <div class="container">

        <h1 class="section-title">
          ${esc(
            t(
              "section_gallery",
              "Gallery"
            )
          )}
        </h1>

        <div id="g-list">
          ${loadingBlock(
            "loading_gallery"
          )}
        </div>

      </div>

    </section>
  `;

  fill(
    "g-list",
    async () => {
      lbList = await getGallery();
      return lbList;
    },
    d =>
      `<div class="gallery-grid">
        ${d
          .map((g, i) =>
            galleryThumb(
              g,
              i,
              "grid-item"
            )
          )
          .join("")}
      </div>`,
    "empty_gallery"
  );
}

/* ---------------------------------------------------------
   VIDEOS
   --------------------------------------------------------- */

async function renderVideos() {
  app().innerHTML = `
    <section class="section">

      <div class="container">
        <h1 class="section-title">
          ${esc(
            t(
              "section_videos",
              "Videos"
            )
          )}
        </h1>
      </div>

      <div id="vd-list">
        ${loadingBlock(
          "loading_videos"
        )}
      </div>

    </section>
  `;

  fill(
    "vd-list",
    getVideos,
    d =>
      hScroll(
        d
          .map(videoCard)
          .join(""),
        "wrap-desktop"
      ),
    "empty_videos"
  );
}

/* ---------------------------------------------------------
   REVIEWS
   --------------------------------------------------------- */

async function renderReviews() {
  app().innerHTML = `
    <section class="section">

      <div class="container">

        <h1 class="section-title">
          ${esc(
            t(
              "section_reviews",
              "Reviews"
            )
          )}
        </h1>

      </div>

      <div id="r-list">
        ${loadingBlock(
          "loading_reviews"
        )}
      </div>

    </section>

    <section class="section">

      <div class="form-card">

        <h2 class="section-title sm">
          ${esc(
            t(
              "write_review",
              "Write a Review"
            )
          )}
        </h2>

        <form
          id="review-form"
          novalidate
        >

          <div class="form-group">

            <label for="rv-name">
              ${esc(
                t(
                  "form_your_name",
                  "Your Name"
                )
              )}
            </label>

            <input
              id="rv-name"
              name="name"
              type="text"
            >

          </div>

          <div class="form-group">

            <label for="rv-rating">
              ${esc(
                t(
                  "form_rating",
                  "Rating"
                )
              )}
            </label>

            <select
              id="rv-rating"
              name="rating"
            >
              <option value="5">★★★★★</option>
              <option value="4">★★★★☆</option>
              <option value="3">★★★☆☆</option>
              <option value="2">★★☆☆☆</option>
              <option value="1">★☆☆☆☆</option>
            </select>

          </div>

          <div class="form-group">

            <label for="rv-text">
              ${esc(
                t(
                  "form_review_text",
                  "Your Review"
                )
              )}
            </label>

            <textarea
              id="rv-text"
              name="review"
            ></textarea>

          </div>

          <p
            class="form-error"
            id="rv-error"
          ></p>

          <button
            class="btn btn-primary btn-block"
            type="submit"
          >
            ${esc(
              t(
                "btn_submit",
                "Submit"
              )
            )}
          </button>

        </form>

      </div>

    </section>
  `;

  fill(
    "r-list",
    getReviews,
    d =>
      hScroll(
        d
          .map(reviewCard)
          .join(""),
        "wrap-desktop"
      ),
    "empty_reviews"
  );
}

/* ---------------------------------------------------------
   CONTACT
   --------------------------------------------------------- */

async function renderContact() {
  let b;

  try {
    b = getBusiness();
  } catch (e) {
    console.error(
      "[contact settings]",
      e
    );

    b = {};
  }

  b = b || {};

  const social = [
    ["Facebook", b.facebook],
    ["Instagram", b.instagram],
    ["YouTube", b.youtube]
  ].filter(
    s =>
      s[1] &&
      s[1] !== "#"
  );

  app().innerHTML = `
    <section class="section">

      <div class="container">

        <h1 class="section-title">
          ${esc(
            t(
              "section_contact",
              "Contact"
            )
          )}
        </h1>

        ${hScroll(`
          <button
            class="contact-action-card"
            data-action="call"
          >
            <span class="ca-icon">📞</span>
            <span class="ca-label">
              ${esc(
                t(
                  "btn_call",
                  "Call"
                )
              )}
            </span>
          </button>

          <button
            class="contact-action-card"
            data-action="float-whatsapp"
          >
            <span class="ca-icon">💬</span>
            <span class="ca-label">
              ${esc(
                t(
                  "btn_whatsapp",
                  "WhatsApp"
                )
              )}
            </span>
          </button>

          <a
            class="contact-action-card"
            href="mailto:${esc(
              b.email || ""
            )}"
          >
            <span class="ca-icon">✉️</span>
            <span class="ca-label">
              ${esc(
                t(
                  "btn_email",
                  "Email"
                )
              )}
            </span>
          </a>

          ${
            b.mapUrl
              ? `
                <a
                  class="contact-action-card"
                  href="${esc(
                    b.mapUrl
                  )}"
                  target="_blank"
                  rel="noopener"
                >
                  <span class="ca-icon">📍</span>
                  <span class="ca-label">
                    ${esc(
                      t(
                        "btn_open_map",
                        "Open Map"
                      )
                    )}
                  </span>
                </a>
              `
              : ""
          }
        `)}

        <div class="info-panel mt-2">

          <p>
            <strong>
              📞 ${esc(
                t(
                  "contact_phone",
                  "Phone"
                )
              )}:
            </strong>
            ${esc(b.phone || "")}
          </p>

          <p>
            <strong>
              💬 ${esc(
                t(
                  "btn_whatsapp",
                  "WhatsApp"
                )
              )}:
            </strong>
            ${esc(
              b.whatsapp || ""
            )}
          </p>

          <p>
            <strong>
              ✉️ ${esc(
                t(
                  "contact_email",
                  "Email"
                )
              )}:
            </strong>
            ${esc(b.email || "")}
          </p>

          <p>
            <strong>
              📍 ${esc(
                t(
                  "contact_address",
                  "Address"
                )
              )}:
            </strong>
            ${esc(
              b.address || ""
            )}
          </p>

          <p>
            <strong>
              🕘 ${esc(
                t(
                  "contact_hours",
                  "Hours"
                )
              )}:
            </strong>
            ${esc(
              b.hours || ""
            )}
          </p>

          ${
            social.length
              ? `
                <p>
                  <strong>
                    ${esc(
                      t(
                        "contact_social",
                        "Social"
                      )
                    )}:
                  </strong>

                  ${social
                    .map(
                      s =>
                        `<a
                          class="inline-link"
                          href="${esc(
                            s[1]
                          )}"
                          target="_blank"
                          rel="noopener"
                        >
                          ${esc(s[0])}
                        </a>`
                    )
                    .join(" · ")}
                </p>
              `
              : ""
          }

        </div>

        <div class="center mt-2">

          <button
            class="btn btn-primary"
            data-action="book"
            data-kind="general"
          >
            ${esc(
              t(
                "btn_enquire",
                "Enquire Now"
              )
            )}
          </button>

        </div>

      </div>

    </section>
  `;
}

/* ---------------------------------------------------------
   FOOTER
   --------------------------------------------------------- */

function renderFooter() {
  const footer =
    $("site-footer");

  if (!footer) return;

  let b = {};

  try {
    b = getBusiness() || {};
  } catch (e) {
    console.error(
      "[footer settings]",
      e
    );
  }

  footer.innerHTML = `
    <div class="container footer-grid">

      <div>

        <div class="footer-brand">

          <img
            src="logo.png"
            alt="Hazi Dada Travels logo"
          >

          <h4>
            Hazi Dada Travels
          </h4>

        </div>

        <p>
          ${esc(
            b.footerText &&
            !String(
              b.footerText
            ).startsWith("[")
              ? b.footerText
              : t(
                  "footer_about",
                  "Travel with Hazi Dada Travels."
                )
          )}
        </p>

      </div>

      <div class="footer-links">

        <h4>
          ${esc(
            t(
              "footer_quick_links",
              "Quick Links"
            )
          )}
        </h4>

        ${KNOWN_ROUTES
          .map(
            r => `
              <a
                href="#/${
                  r === "home"
                    ? ""
                    : r
                }"
                data-action="nav"
                data-route="${esc(r)}"
              >
                ${esc(
                  t(
                    "nav_" + r,
                    r === "home"
                      ? "Home"
                      : r.charAt(0).toUpperCase() +
                        r.slice(1)
                  )
                )}
              </a>
            `
          )
          .join("")}

      </div>

      <div class="footer-links">

        <h4>
          ${esc(
            t(
              "footer_contact",
              "Contact"
            )
          )}
        </h4>

        <span>
          📞 ${esc(
            b.phone || ""
          )}
        </span>

        <span>
          ✉️ ${esc(
            b.email || ""
          )}
        </span>

        ${
          ["facebook", "instagram", "youtube"]
            .filter(
              k =>
                b[k] &&
                b[k] !== "#"
            )
            .map(
              k =>
                `<a
                  href="${esc(
                    b[k]
                  )}"
                  target="_blank"
                  rel="noopener"
                >
                  ${
                    k.charAt(0).toUpperCase() +
                    k.slice(1)
                  }
                </a>`
            )
            .join("")
        }

        <a
          href="login.html"
          class="admin-link"
        >
          Admin
        </a>

      </div>

    </div>

    <div class="footer-bottom">
      © ${new Date().getFullYear()}
      Hazi Dada Travels.
      ${esc(
        t(
          "footer_rights",
          "All rights reserved."
        )
      )}
    </div>
  `;
}

/* ---------------------------------------------------------
   OVERLAYS
   --------------------------------------------------------- */

const OVERLAYS = [
  "sheet-overlay",
  "enquiry-overlay",
  "lightbox-overlay",
  "video-overlay"
];

function anyOverlayOpen() {
  return OVERLAYS.some(
    id =>
      $(id) &&
      $(id).classList.contains(
        "open"
      )
  );
}

function closeAllOverlays() {
  OVERLAYS.forEach(id => {
    const el = $(id);

    if (el) {
      el.classList.remove(
        "open"
      );
    }
  });

  const w =
    $("video-frame-wrap");

  if (w) {
    w.innerHTML = "";
  }

  document.body.classList.remove(
    "no-scroll"
  );
}

function openOverlay(id) {
  const s = {
    ...(currentRoute || {
      name: "home",
      params: {}
    }),
    overlay: true
  };

  if (
    history.state &&
    history.state.overlay
  ) {
    history.replaceState(
      s,
      "",
      location.hash
    );
  } else {
    history.pushState(
      s,
      "",
      location.hash
    );
  }

  OVERLAYS.forEach(o => {
    const el = $(o);

    if (el) {
      el.classList.toggle(
        "open",
        o === id
      );
    }
  });

  document.body.classList.add(
    "no-scroll"
  );
}

function dismissOverlay() {
  if (
    history.state &&
    history.state.overlay
  ) {
    history.back();
  } else {
    closeAllOverlays();
  }
}

function openMenu() {
  const nav = $("mobile-nav");

  if (nav) {
    nav.classList.add("open");
  }
}

function closeMenu() {
  const nav = $("mobile-nav");

  if (nav) {
    nav.classList.remove("open");
  }
}

/* ---------------------------------------------------------
   BOOKING
   --------------------------------------------------------- */

function openBooking(
  kind,
  name
) {
  booking = {
    kind: kind || "general",
    name: name || ""
  };

  const context =
    $("sheet-context");

  if (context) {
    context.textContent =
      name || "";
  }

  openOverlay(
    "sheet-overlay"
  );
}

function waMessage() {
  let b = {};

  try {
    b = getBusiness() || {};
  } catch (e) {}

  const n =
    b.name ||
    "Hazi Dada Travels";

  if (
    booking.kind ===
    "trip"
  ) {
    return `Hello ${n}, I am interested in the ${booking.name} trip. Please provide more details.`;
  }

  if (
    booking.kind ===
    "vehicle"
  ) {
    return `Hello ${n}, I would like to enquire about the ${booking.name} vehicle. Please provide more details.`;
  }

  return `Hello ${n}, I would like to know more about your trips and vehicles.`;
}

function openWhatsApp(message) {
  let b = {};

  try {
    b = getBusiness() || {};
  } catch (e) {}

  const number =
    b.whatsapp ||
    b.phone ||
    "";

  if (!number) {
    toast(
      "WhatsApp number is not available.",
      "error"
    );
    return;
  }

  window.location.href =
    `https://wa.me/${String(
      number
    ).replace(/\D/g, "")}?text=${encodeURIComponent(
      message || waMessage()
    )}`;
}

function callNow() {
  let b = {};

  try {
    b = getBusiness() || {};
  } catch (e) {}

  if (!b.phone) {
    toast(
      "Phone number is not available.",
      "error"
    );
    return;
  }

  window.location.href =
    `tel:${b.phone}`;
}

/* ---------------------------------------------------------
   ENQUIRY
   --------------------------------------------------------- */

async function openEnquiry() {
  const f =
    $("enquiry-form");

  if (!f) return;

  f.reset();

  const error =
    $("enq-error");

  if (error) {
    error.textContent = "";
  }

  if (f.trip) {
    f.trip.value =
      booking.name || "";
  }

  try {
    const trips =
      await getTrips();

    const list =
      $("enq-trip-list");

    if (list) {
      list.innerHTML =
        trips
          .map(
            x =>
              `<option value="${esc(
                x.name
              )}"></option>`
          )
          .join("");
    }
  } catch (e) {}

  openOverlay(
    "enquiry-overlay"
  );
}

async function submitEnquiry(e) {
  e.preventDefault();

  const f = e.target;

  const name =
    f.name.value.trim();

  const phone =
    f.phone.value.trim();

  if (
    !name ||
    !/^[0-9+\-\s()]{7,15}$/.test(
      phone
    )
  ) {
    $("enq-error").textContent =
      t(
        "err_required",
        "Please enter your name and a valid phone number."
      );

    return;
  }

  const btn =
    $("enq-submit");

  if (btn) {
    btn.disabled = true;
  }

  try {
    await saveEnquiry({
      name,
      phone,
      trip:
        f.trip
          ? f.trip.value.trim()
          : "",
      travel_date:
        f.travel_date
          ? f.travel_date.value
          : "",
      people:
        f.people
          ? f.people.value
          : "",
      message:
        f.message
          ? f.message.value.trim()
          : ""
    });

    toast(
      t(
        "toast_enquiry_sent",
        "Enquiry sent successfully."
      ),
      "success"
    );

    dismissOverlay();
  } catch (err) {
    console.error(
      "[submit enquiry]",
      err
    );

    $("enq-error").textContent =
      t(
        "error_generic",
        "Something went wrong."
      );
  } finally {
    if (btn) {
      btn.disabled = false;
    }
  }
}

/* ---------------------------------------------------------
   LIGHTBOX
   --------------------------------------------------------- */

function openLightbox(i) {
  lbIndex = i;

  drawLightbox();

  openOverlay(
    "lightbox-overlay"
  );
}

function drawLightbox() {
  const it =
    lbList[lbIndex];

  if (!it) return;

  const img =
    $("lightbox-img");

  const caption =
    $("lightbox-caption");

  if (img) {
    img.src =
      it.image_url ||
      it.media_url ||
      "";

    img.alt =
      it.caption ||
      it.title ||
      "";
  }

  if (caption) {
    caption.textContent =
      it.caption ||
      it.title ||
      "";
  }
}

function lbStep(d) {
  if (!lbList.length)
    return;

  lbIndex =
    (lbIndex +
      d +
      lbList.length) %
    lbList.length;

  drawLightbox();
}

/* ---------------------------------------------------------
   VIDEO
   --------------------------------------------------------- */

function openVideo(
  yt,
  title
) {
  const wrap =
    $("video-frame-wrap");

  const ext =
    $("video-external");

  if (!wrap || !ext)
    return;

  if (!yt) {
    wrap.innerHTML = `
      <div class="state-msg light">
        ${esc(
          t(
            "no_video_link",
            "Video link is not available."
          )
        )}
      </div>
    `;

    ext.classList.add(
      "hidden"
    );
  } else {
    wrap.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${encodeURIComponent(
          yt
        )}?autoplay=1&rel=0"
        title="${esc(title)}"
        allow="autoplay; encrypted-media; fullscreen"
        allowfullscreen
      ></iframe>
    `;

    ext.href =
      `https://www.youtube.com/watch?v=${encodeURIComponent(
        yt
      )}`;

    ext.classList.remove(
      "hidden"
    );
  }

  openOverlay(
    "video-overlay"
  );
}

/* ---------------------------------------------------------
   TOAST
   --------------------------------------------------------- */

function toast(
  msg,
  type = "info"
) {
  let c =
    document.querySelector(
      ".toast-container"
    );

  if (!c) {
    c =
      document.createElement(
        "div"
      );

    c.className =
      "toast-container";

    document.body.appendChild(c);
  }

  const el =
    document.createElement(
      "div"
    );

  el.className =
    "toast toast-" +
    type;

  el.textContent =
    msg;

  c.appendChild(el);

  requestAnimationFrame(
    () =>
      el.classList.add(
        "show"
      )
  );

  setTimeout(() => {
    el.classList.remove(
      "show"
    );

    setTimeout(
      () => el.remove(),
      300
    );
  }, 3200);
}

/* ---------------------------------------------------------
   LANGUAGE
   --------------------------------------------------------- */

function applyStaticI18n() {
  document
    .querySelectorAll(
      "[data-i18n]"
    )
    .forEach(el => {
      el.textContent =
        t(
          el.dataset.i18n,
          el.textContent
        );
    });

  document.documentElement.lang =
    currentLang;

  const select =
    $("lang-select");

  if (select) {
    select.value =
      currentLang;
  }
}

function setLang(l) {
  if (
    !["en", "te", "hi"].includes(
      l
    )
  ) {
    l = "en";
  }

  currentLang = l;

  localStorage.setItem(
    "hdt_lang",
    l
  );

  applyStaticI18n();

  render(
    currentRoute ||
      parseRouteFromHash()
  );
}

/* ---------------------------------------------------------
   EVENT DELEGATION
   --------------------------------------------------------- */

document.addEventListener(
  "click",
  e => {
    const el =
      e.target.closest(
        "[data-action]"
      );

    if (!el) return;

    const a =
      el.dataset.action;

    if (
      el.tagName === "A" &&
      a === "nav"
    ) {
      e.preventDefault();
    }

    switch (a) {
      case "nav":
        if (
          sameRoute(
            {
              name:
                el.dataset.route,
              params: {}
            },
            currentRoute
          )
        ) {
          closeMenu();
          window.scrollTo(
            0,
            0
          );
        } else {
          navigate(
            el.dataset.route
          );
        }
        break;

      case "trip":
        navigate(
          "trip-details",
          {
            id:
              el.dataset.id
          }
        );
        break;

      case "back":
        if (
          history.length >
            1 &&
          currentRoute &&
          currentRoute.name !==
            "home"
        ) {
          history.back();
        } else {
          navigate(
            "trips",
            {},
            true
          );
        }
        break;

      case "book":
        openBooking(
          el.dataset.kind,
          el.dataset.name
        );
        break;

      case "cat":
        tripsFilter =
          el.dataset.cat;

        if (
          window.__drawTrips
        ) {
          window.__drawTrips();
        }
        break;

      case "lightbox":
        openLightbox(
          parseInt(
            el.dataset.index,
            10
          )
        );
        break;

      case "lb-prev":
        lbStep(-1);
        break;

      case "lb-next":
        lbStep(1);
        break;

      case "video":
        openVideo(
          el.dataset.yt,
          el.dataset.title
        );
        break;

      case "dismiss":
        dismissOverlay();
        break;

      case "sheet-call":
        callNow();
        break;

      case "sheet-whatsapp":
        openWhatsApp(
          waMessage()
        );
        break;

      case "sheet-enquire":
        openEnquiry();
        break;

      case "call":
        callNow();
        break;

      case "whatsapp-trip":
        booking = {
          kind: "trip",
          name:
            el.dataset.name ||
            ""
        };

        openWhatsApp(
          waMessage()
        );
        break;

      case "float-call":
        callNow();
        break;

      case "float-whatsapp":
        booking = {
          kind: "general",
          name: ""
        };

        openWhatsApp(
          waMessage()
        );
        break;

      case "open-menu":
        openMenu();
        break;

      case "close-menu":
        closeMenu();
        break;

      case "retry":
        render(
          currentRoute ||
            parseRouteFromHash()
        );
        break;
    }
  }
);

/* ---------------------------------------------------------
   FORM SUBMISSION
   --------------------------------------------------------- */

document.addEventListener(
  "submit",
  e => {
    if (
      e.target.id ===
      "enquiry-form"
    ) {
      submitEnquiry(e);
    }

    if (
      e.target.id ===
      "review-form"
    ) {
      submitReview(e);
    }
  }
);

/* ---------------------------------------------------------
   KEYBOARD
   --------------------------------------------------------- */

document.addEventListener(
  "keydown",
  e => {
    if (
      e.key === "Escape" &&
      anyOverlayOpen()
    ) {
      dismissOverlay();
    }

    if (
      anyOverlayOpen() &&
      $("lightbox-overlay") &&
      $("lightbox-overlay").classList.contains(
        "open"
      )
    ) {
      if (
        e.key === "ArrowLeft"
      ) {
        lbStep(-1);
      }

      if (
        e.key === "ArrowRight"
      ) {
        lbStep(1);
      }
    }

    if (
      (e.key === "Enter" ||
        e.key === " ") &&
      e.target.matches &&
      e.target.matches(
        "[role=button][data-action]"
      )
    ) {
      e.preventDefault();
      e.target.click();
    }
  }
);

/* ---------------------------------------------------------
   SAFE DOM EVENTS
   --------------------------------------------------------- */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    const mobileNav =
      $("mobile-nav");

    if (mobileNav) {
      mobileNav.addEventListener(
        "click",
        e => {
          if (
            e.target.id ===
            "mobile-nav"
          ) {
            closeMenu();
          }
        }
      );
    }

    OVERLAYS.forEach(
      id => {
        const el = $(id);

        if (el) {
          el.addEventListener(
            "click",
            e => {
              if (
                e.target.id ===
                id
              ) {
                dismissOverlay();
              }
            }
          );
        }
      }
    );

    const lang =
      $("lang-select");

    if (lang) {
      lang.addEventListener(
        "change",
        e =>
          setLang(
            e.target.value
          )
      );
    }

    applyStaticI18n();

    const initial =
      parseRouteFromHash();

    history.replaceState(
      initial,
      "",
      routeToHash(
        initial.name,
        initial.params
      )
    );

    render(initial);
  }
);

/* ---------------------------------------------------------
   REVIEWS
   --------------------------------------------------------- */

async function submitReview(e) {
  e.preventDefault();

  const f =
    e.target;

  const name =
    f.name.value.trim();

  const review =
    f.review.value.trim();

  if (!name || !review) {
    const error =
      $("rv-error");

    if (error) {
      error.textContent =
        t(
          "err_required",
          "Please fill in the required fields."
        );
    }

    return;
  }

  try {
    await saveReview({
      name,
      rating:
        parseInt(
          f.rating.value,
          10
        ),
      review,
      comment: review,
      image_url: ""
    });

    toast(
      t(
        "toast_review_submitted",
        "Review submitted successfully."
      ),
      "success"
    );

    f.reset();

    renderReviews();
  } catch (err) {
    console.error(
      "[submit review]",
      err
    );

    const error =
      $("rv-error");

    if (error) {
      error.textContent =
        t(
          "error_generic",
          "Something went wrong."
        );
    }
  }
}
