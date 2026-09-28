/* =========================================================
HAZI DADA TRAVELS V1
APP.JS
Clean Customer UI + Routing + Interactions
========================================================= */

(function () {
"use strict";

let currentLanguage = "en";
let renderToken = 0;
let lightboxImages = [];
let lightboxIndex = 0;

const app = document.getElementById("app");

/* =========================================================
HELPERS
========================================================= */

function escapeHtml(value) {
return String(value ?? "")
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}

function safeUrl(url) {
if (!url) return "";

try {
  const parsed = new URL(url, window.location.href);

  if (
    parsed.protocol === "http:" ||
    parsed.protocol === "https:"
  ) {
    return parsed.href;
  }

  return "";
} catch {
  return "";
}

}

function imageUrl(url, label = "Hazi Dada Travels") {
const valid = safeUrl(url);

if (valid) return valid;

return (
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#0b3d66"/>
          <stop offset="100%" stop-color="#2f9bff"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="50%" y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="white"
        font-size="42"
        font-family="Arial">
        ${String(label)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}
      </text>
    </svg>
  `)
);

}

function getText(key, fallback) {
try {
if (
typeof translations !== "undefined" &&
translations[currentLanguage] &&
translations[currentLanguage][key]
) {
return translations[currentLanguage][key];
}
} catch (error) {}

return fallback || key;

}

function normalizeTrip(trip) {
if (!trip) return null;

return {
  ...trip,
  id: trip.id,
  name: trip.name || "Trip",
  destination: trip.destination || "",
  description: trip.description || "",
  price: trip.price || "",
  duration: trip.duration || "",
  image_url: trip.image_url || trip.image || "",
  image: trip.image_url || trip.image || ""
};

}

function normalizeVehicle(vehicle) {
if (!vehicle) return null;

return {
  ...vehicle,
  id: vehicle.id,
  name: vehicle.name || "Vehicle",
  type: vehicle.type || "",
  capacity: vehicle.capacity || "",
  registration: vehicle.registration || "",
  image_url: vehicle.image_url || "",
  available: vehicle.available !== false
};

}

function normalizeGallery(item) {
if (!item) return null;

return {
  ...item,
  id: item.id,
  title: item.title || "",
  media_url: item.media_url || item.image_url || "",
  media_type: item.media_type || "image",
  description: item.description || ""
};

}

function normalizeReview(review) {
if (!review) return null;

return {
  ...review,
  id: review.id,
  name: review.name || "Guest",
  rating: Number(review.rating || 5),
  comment: review.comment || review.review || ""
};

}

function setLoading() {
if (!app) return;

app.innerHTML = `
  <section class="section">
    <div class="state-msg">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  </section>
`;

}

function showError(message) {
if (!app) return;

app.innerHTML = `
  <section class="section">
    <div class="form-card center">
      <h2>Something went wrong</h2>
      <p class="muted">${escapeHtml(message)}</p>
      <button class="btn btn-primary" data-nav="home">
        Go Home
      </button>
    </div>
  </section>
`;

}

/* =========================================================
ROUTING
========================================================= */

function getRoute() {
let hash = window.location.hash || "#/";

hash = hash.replace(/^#/, "");

if (!hash || hash === "/") {
  return { page: "home" };
}

const parts = hash
  .replace(/^\/+/, "")
  .split("/")
  .filter(Boolean);

if (parts[0] === "trip" && parts[1]) {
  return {
    page: "trip",
    id: decodeURIComponent(parts[1])
  };
}

return {
  page: parts[0] || "home"
};

}

function navigate(path) {
const target = path.startsWith("#")
? path
: "#${path.startsWith("/") ? path : "/" + path}";

if (window.location.hash !== target) {
  window.location.hash = target;
} else {
  renderRoute();
}

window.scrollTo({
  top: 0,
  behavior: "smooth"
});

closeMobileMenu();

}

function bindNavigation() {
document.addEventListener("click", function (event) {
const element = event.target.closest("[data-nav]");

  if (!element) return;

  event.preventDefault();

  const destination =
    element.getAttribute("data-nav");

  if (destination) {
    navigate(destination);
  }
});

}

function bindHistory() {
window.addEventListener("hashchange", renderRoute);
window.addEventListener("popstate", renderRoute);
}

/* =========================================================
HOME
========================================================= */

async function renderHome(token) {
setLoading();

try {
  const trips = await getTrips();

  if (token !== renderToken) return;

  const list = Array.isArray(trips)
    ? trips.map(normalizeTrip).filter(Boolean)
    : [];

  const featured = list.slice(0, 6);

  app.innerHTML = `
    <section class="hero">

      <div class="hero-inner">

        <h1>
          ${escapeHtml(
            getText(
              "hero_title",
              "Travel with comfort and confidence"
            )
          )}
        </h1>

        <p>
          ${escapeHtml(
            getText(
              "hero_subtitle",
              "Your trusted travel partner for memorable journeys."
            )
          )}
        </p>

        <div class="hero-actions">

          <button
            class="btn btn-primary"
            data-nav="trips">
            ${escapeHtml(
              getText("view_trips", "View Trips")
            )}
          </button>

          <button
            class="btn btn-ghost"
            data-open-booking>
            ${escapeHtml(
              getText("book_now", "Book Now")
            )}
          </button>

        </div>

      </div>

    </section>

    <section class="section">

      <div class="container">

        <div class="flex-between">

          <div>
            <p class="muted">EXPLORE</p>

            <h2 class="section-title">
              ${escapeHtml(
                getText("nav_trips", "Trips")
              )}
            </h2>
          </div>

          <button
            class="btn btn-outline btn-small"
            data-nav="trips">
            View All →
          </button>

        </div>

        ${
          featured.length
            ? `
              <div class="h-scroll-wrap">
                <div class="h-scroll">
                  ${featured
                    .map(tripCardHtml)
                    .join("")}
                </div>
              </div>
            `
            : `
              <div class="state-msg">
                <h3>No trips available yet</h3>
                <p>
                  Trips added to your database will appear here.
                </p>
              </div>
            `
        }

      </div>

    </section>

    <section class="quick-actions">

      <div class="h-scroll-wrap">

        <div class="h-scroll">

          <button
            class="quick-action-pill"
            data-nav="vehicles">
            <span class="qa-icon">🚌</span>
            <span class="qa-label">Vehicles</span>
          </button>

          <button
            class="quick-action-pill"
            data-nav="gallery">
            <span class="qa-icon">📸</span>
            <span class="qa-label">Gallery</span>
          </button>

          <button
            class="quick-action-pill"
            data-nav="videos">
            <span class="qa-icon">🎥</span>
            <span class="qa-label">Videos</span>
          </button>

          <button
            class="quick-action-pill"
            data-nav="reviews">
            <span class="qa-icon">⭐</span>
            <span class="qa-label">Reviews</span>
          </button>

          <button
            class="quick-action-pill"
            data-nav="contact">
            <span class="qa-icon">📞</span>
            <span class="qa-label">Contact</span>
          </button>

        </div>

      </div>

    </section>
  `;
} catch (error) {
  console.error("Home error:", error);

  if (token !== renderToken) return;

  showError(
    "Unable to load the website data."
  );
}

}

/* =========================================================
TRIP CARD
========================================================= */

function tripCardHtml(trip) {
return `
<article class="trip-card">

    <img
      src="${imageUrl(
        trip.image,
        trip.name
      )}"
      alt="${escapeHtml(trip.name)}"
      loading="lazy">

    <div class="trip-card-body">

      ${
        trip.destination
          ? `
            <span class="chip">
              ${escapeHtml(trip.destination)}
            </span>
          `
          : ""
      }

      <h3>
        ${escapeHtml(trip.name)}
      </h3>

      ${
        trip.description
          ? `
            <p class="muted">
              ${escapeHtml(trip.description)}
            </p>
          `
          : ""
      }

      <div class="trip-meta-row">

        ${
          trip.duration
            ? `<span>⏱ ${escapeHtml(trip.duration)}</span>`
            : ""
        }

        ${
          trip.price
            ? `
              <span class="price-tag">
                ${escapeHtml(trip.price)}
              </span>
            `
            : ""
        }

      </div>

      <div class="flex-between mt-1">

        <button
          class="btn btn-outline btn-small"
          data-nav="trip/${encodeURIComponent(trip.id)}">
          Details
        </button>

        <button
          class="btn btn-primary btn-small"
          data-open-booking
          data-trip-name="${escapeHtml(trip.name)}">
          Book
        </button>

      </div>

    </div>

  </article>
`;

}

/* =========================================================
TRIPS
========================================================= */

async function renderTrips(token) {
setLoading();

try {
  const trips = await getTrips();

  if (token !== renderToken) return;

  const list = Array.isArray(trips)
    ? trips.map(normalizeTrip).filter(Boolean)
    : [];

  app.innerHTML = `
    <section class="section">

      <div class="container">

        <p class="muted">JOURNEYS</p>

        <h1 class="section-title">
          ${escapeHtml(
            getText("nav_trips", "Trips")
          )}
        </h1>

        <p class="muted">
          Explore our available travel packages.
        </p>

        ${
          list.length
            ? `
              <div class="h-scroll-wrap mt-2">
                <div class="h-scroll">
                  ${list
                    .map(tripCardHtml)
                    .join("")}
                </div>
              </div>
            `
            : `
              <div class="state-msg">
                <h3>No trips available</h3>
                <p>
                  Add trips to your Supabase
                  <strong>trips</strong> table.
                </p>
              </div>
            `
        }

      </div>

    </section>
  `;
} catch (error) {
  console.error("Trips error:", error);

  if (token !== renderToken) return;

  showError(
    "Unable to load trips."
  );
}

}

/* =========================================================
TRIP DETAILS
========================================================= */

async function renderTripDetails(id, token) {
setLoading();

try {
  const trip = normalizeTrip(
    await getTripById(id)
  );

  if (token !== renderToken) return;

  if (!trip) {
    app.innerHTML = `
      <section class="section">
        <div class="container center">

          <h2>Trip not found</h2>

          <button
            class="btn btn-primary"
            data-nav="trips">
            Back to Trips
          </button>

        </div>
      </section>
    `;

    return;
  }

  app.innerHTML = `
    <section class="section">

      <div class="container">

        <button
          class="btn btn-outline btn-small"
          data-nav="trips">
          ← Back to Trips
        </button>

        <div class="trip-details-wrap mt-2">

          <img
            class="trip-hero-image"
            src="${imageUrl(
              trip.image,
              trip.name
            )}"
            alt="${escapeHtml(trip.name)}">

          <div class="trip-details-header">

            ${
              trip.destination
                ? `
                  <span class="chip">
                    ${escapeHtml(trip.destination)}
                  </span>
                `
                : ""
            }

            <h1>
              ${escapeHtml(trip.name)}
            </h1>

            ${
              trip.description
                ? `
                  <p class="muted">
                    ${escapeHtml(trip.description)}
                  </p>
                `
                : ""
            }

          </div>

          <div class="h-scroll-wrap">

            <div class="h-scroll">

              ${
                trip.duration
                  ? `
                    <div class="info-card">
                      <span class="info-label">
                        Duration
                      </span>
                      <span class="info-value">
                        ${escapeHtml(trip.duration)}
                      </span>
                    </div>
                  `
                  : ""
              }

              ${
                trip.price
                  ? `
                    <div class="info-card">
                      <span class="info-label">
                        Price
                      </span>
                      <span class="info-value">
                        ${escapeHtml(trip.price)}
                      </span>
                    </div>
                  `
                  : ""
              }

            </div>

          </div>

          <button
            class="btn btn-primary btn-block mt-2"
            data-open-booking
            data-trip-name="${escapeHtml(trip.name)}">
            Book This Trip
          </button>

        </div>

      </div>

    </section>
  `;
} catch (error) {
  console.error("Trip details error:", error);

  if (token !== renderToken) return;

  showError(
    "Unable to load this trip."
  );
}

}

/* =========================================================
VEHICLES
========================================================= */

async function renderVehicles(token) {
setLoading();

try {
  const vehicles = await getVehicles();

  if (token !== renderToken) return;

  const list = Array.isArray(vehicles)
    ? vehicles.map(normalizeVehicle).filter(Boolean)
    : [];

  app.innerHTML = `
    <section class="section">

      <div class="container">

        <p class="muted">OUR FLEET</p>

        <h1 class="section-title">
          Vehicles
        </h1>

        <p class="muted">
          Comfortable vehicles for your journey.
        </p>

        ${
          list.length
            ? `
              <div class="h-scroll-wrap mt-2">

                <div class="h-scroll">
                  ${list
                    .map(vehicleCardHtml)
                    .join("")}
                </div>

              </div>
            `
            : `
              <div class="state-msg">
                <h3>No vehicles available</h3>
                <p>
                  Vehicles added to Supabase will appear here.
                </p>
              </div>
            `
        }

      </div>

    </section>
  `;
} catch (error) {
  console.error("Vehicles error:", error);

  if (token !== renderToken) return;

  showError(
    "Unable to load vehicles."
  );
}

}

function vehicleCardHtml(vehicle) {
return `
<article class="vehicle-card">

    <img
      src="${imageUrl(
        vehicle.image_url,
        vehicle.name
      )}"
      alt="${escapeHtml(vehicle.name)}"
      loading="lazy">

    <div class="vehicle-card-body">

      <h3>
        ${escapeHtml(vehicle.name)}
      </h3>

      ${
        vehicle.type
          ? `
            <span class="muted">
              ${escapeHtml(vehicle.type)}
            </span>
          `
          : ""
      }

      ${
        vehicle.capacity
          ? `
            <span>
              👥 ${escapeHtml(vehicle.capacity)}
            </span>
          `
          : ""
      }

      ${
        vehicle.registration
          ? `
            <span class="muted">
              ${escapeHtml(vehicle.registration)}
            </span>
          `
          : ""
      }

      <span class="availability-badge ${
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

  </article>
`;

}

/* =========================================================
GALLERY
========================================================= */

async function renderGallery(token) {
setLoading();

try {
  const gallery = await getGallery();

  if (token !== renderToken) return;

  const list = Array.isArray(gallery)
    ? gallery.map(normalizeGallery).filter(Boolean)
    : [];

  lightboxImages = list;

  app.innerHTML = `
    <section class="section">

      <div class="container">

        <p class="muted">MEMORIES</p>

        <h1 class="section-title">
          Gallery
        </h1>

        <p class="muted">
          Moments from Hazi Dada Travels.
        </p>

        ${
          list.length
            ? `
              <div class="h-scroll-wrap mt-2">

                <div class="h-scroll">

                  ${list
                    .map(
                      (item, index) => `
                        <button
                          class="gallery-thumb"
                          type="button"
                          data-gallery-index="${index}">

                          <img
                            src="${imageUrl(
                              item.media_url,
                              item.title || "Gallery"
                            )}"
                            alt="${escapeHtml(
                              item.title || "Gallery"
                            )}"
                            loading="lazy">

                        </button>
                      `
                    )
                    .join("")}

                </div>

              </div>
            `
            : `
              <div class="state-msg">
                <h3>Gallery is empty</h3>
                <p>
                  Approved gallery items will appear here.
                </p>
              </div>
            `
        }

      </div>

    </section>
  `;
} catch (error) {
  console.error("Gallery error:", error);

  if (token !== renderToken) return;

  showError(
    "Unable to load gallery."
  );
}

}

/* =========================================================
VIDEOS
========================================================= */

async function renderVideos(token) {
setLoading();

try {
  const videos = await getVideos();

  if (token !== renderToken) return;

  app.innerHTML = `
    <section class="section">

      <div class="container">

        <p class="muted">WATCH</p>

        <h1 class="section-title">
          Videos
        </h1>

        <p class="muted">
          Travel videos from Hazi Dada Travels.
        </p>

        ${
          Array.isArray(videos) && videos.length
            ? `
              <div class="h-scroll-wrap mt-2">

                <div class="h-scroll">

                  ${videos
                    .map(
                      (video, index) => `
                        <button
                          class="video-card"
                          type="button"
                          data-video-index="${index}">

                          <div class="video-thumb-wrap">
                            <span class="play-icon">
                              ▶
                            </span>
                          </div>

                          <div class="video-card-body">
                            <h4>
                              ${escapeHtml(
                                video.title ||
                                  `Video ${index + 1}`
                              )}
                            </h4>
                          </div>

                        </button>
                      `
                    )
                    .join("")}

                </div>

              </div>
            `
            : `
              <div class="state-msg">
                <h3>No videos available yet</h3>
                <p>
                  Videos will appear here when added.
                </p>
              </div>
            `
        }

      </div>

    </section>
  `;
} catch (error) {
  console.error("Videos error:", error);

  if (token !== renderToken) return;

  showError(
    "Unable to load videos."
  );
}

}

/* =========================================================
REVIEWS
========================================================= */

async function renderReviews(token) {
setLoading();

try {
  const reviews = await getReviews();

  if (token !== renderToken) return;

  const list = Array.isArray(reviews)
    ? reviews.map(normalizeReview).filter(Boolean)
    : [];

  app.innerHTML = `
    <section class="section">

      <div class="container">

        <p class="muted">
          TRAVELLER FEEDBACK
        </p>

        <h1 class="section-title">
          Reviews
        </h1>

        <p class="muted">
          See what our travellers have to say.
        </p>

        ${
          list.length
            ? `
              <div class="h-scroll-wrap mt-2">

                <div class="h-scroll">
                  ${list
                    .map(reviewCardHtml)
                    .join("")}
                </div>

              </div>
            `
            : `
              <div class="state-msg">
                <h3>No reviews yet</h3>
                <p>
                  Be the first traveller to leave a review.
                </p>
              </div>
            `
        }

        <div class="form-card mt-2">

          <h2>Leave a Review</h2>

          <p class="muted">
            Your review will be checked before appearing publicly.
          </p>

          <form id="reviewForm">

            <div class="form-group">

              <label for="review-name">
                Your Name
              </label>

              <input
                id="review-name"
                type="text"
                name="name"
                required
                maxlength="100">

            </div>

            <div class="form-group">

              <label for="review-rating">
                Rating
              </label>

              <select
                id="review-rating"
                name="rating"
                required>

                <option value="5">★★★★★ 5</option>
                <option value="4">★★★★☆ 4</option>
                <option value="3">★★★☆☆ 3</option>
                <option value="2">★★☆☆☆ 2</option>
                <option value="1">★☆☆☆☆ 1</option>

              </select>

            </div>

            <div class="form-group">

              <label for="review-comment">
                Your Review
              </label>

              <textarea
                id="review-comment"
                name="comment"
                required
                maxlength="1000"></textarea>

            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block">
              Submit Review
            </button>

            <p
              id="reviewMessage"
              class="muted center mt-1">
            </p>

          </form>

        </div>

      </div>

    </section>
  `;

  bindReviewForm();

} catch (error) {
  console.error("Reviews error:", error);

  if (token !== renderToken) return;

  showError(
    "Unable to load reviews."
  );
}

}

function reviewCardHtml(review) {
const rating = Math.max(
1,
Math.min(5, Number(review.rating || 5))
);

return `
  <article class="review-card">

    <div class="review-stars">
      ${"★".repeat(rating)}
      ${"☆".repeat(5 - rating)}
    </div>

    <p>
      “${escapeHtml(review.comment)}”
    </p>

    <p class="review-name">
      ${escapeHtml(review.name)}
    </p>

  </article>
`;

}

function bindReviewForm() {
const form =
document.getElementById("reviewForm");

if (!form) return;

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const message =
    document.getElementById("reviewMessage");

  const formData = new FormData(form);

  const data = {
    name: String(
      formData.get("name") || ""
    ).trim(),

    rating: Number(
      formData.get("rating") || 5
    ),

    comment: String(
      formData.get("comment") || ""
    ).trim()
  };

  if (!data.name || !data.comment) {
    if (message) {
      message.textContent =
        "Please complete all fields.";
    }
    return;
  }

  const button =
    form.querySelector(
      'button[type="submit"]'
    );

  if (button) {
    button.disabled = true;
    button.textContent = "Submitting...";
  }

  try {
    await saveReview(data);

    form.reset();

    if (message) {
      message.textContent =
        "Thank you! Your review has been submitted for approval.";
    }

  } catch (error) {
    console.error(
      "Review submit error:",
      error
    );

    if (message) {
      message.textContent =
        "Unable to submit your review. Please try again.";
    }

  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Submit Review";
    }
  }
});

}

/* =========================================================
CONTACT
========================================================= */

async function renderContact(token) {
setLoading();

try {
  const business = await Promise.resolve(
    getBusiness()
  );

  if (token !== renderToken) return;

  const phone =
    business?.phone || "";

  const whatsapp =
    business?.whatsapp || phone;

  const email =
    business?.email ||
    "hazidadatravels5786@gmail.com";

  const address =
    business?.address || "";

  app.innerHTML = `
    <section class="section">

      <div class="container">

        <p class="muted">
          GET IN TOUCH
        </p>

        <h1 class="section-title">
          Contact Us
        </h1>

        <p class="muted">
          Contact us directly for bookings and enquiries.
        </p>

        <div class="h-scroll-wrap mt-2">

          <div class="h-scroll">

            <a
              class="contact-action-card"
              href="tel:${escapeHtml(phone)}">

              <span class="ca-icon">📞</span>

              <span class="ca-label">
                Call
              </span>

            </a>

            <a
              class="contact-action-card"
              href="https://wa.me/${whatsapp.replace(
                /[^0-9]/g,
                ""
              )}"
              target="_blank"
              rel="noopener">

              <span class="ca-icon">💬</span>

              <span class="ca-label">
                WhatsApp
              </span>

            </a>

            <a
              class="contact-action-card"
              href="mailto:${escapeHtml(email)}">

              <span class="ca-icon">✉️</span>

              <span class="ca-label">
                Email
              </span>

            </a>

          </div>

        </div>

        ${
          address
            ? `
              <div class="state-msg">
                📍 ${escapeHtml(address)}
              </div>
            `
            : ""
        }

        <div class="form-card mt-2">

          <h2>Send an Enquiry</h2>

          <form id="enquiryForm">

            <div class="form-group">

              <label for="enquiry-name">
                Name
              </label>

              <input
                id="enquiry-name"
                type="text"
                name="name"
                required
                maxlength="100">

            </div>

            <div class="form-group">

              <label for="enquiry-phone">
                Phone
              </label>

              <input
                id="enquiry-phone"
                type="tel"
                name="phone"
                required
                maxlength="20">

            </div>

            <div class="form-group">

              <label for="enquiry-trip">
                Trip
              </label>

              <input
                id="enquiry-trip"
                type="text"
                name="trip"
                maxlength="200">

            </div>

            <div class="form-group">

              <label for="enquiry-message">
                Message
              </label>

              <textarea
                id="enquiry-message"
                name="message"
                maxlength="1000"></textarea>

            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block">
              Send Enquiry
            </button>

            <p
              id="enquiryMessage"
              class="muted center mt-1">
            </p>

          </form>

        </div>

      </div>

    </section>
  `;

  bindEnquiryForm();

} catch (error) {
  console.error(
    "Contact error:",
    error
  );

  if (token !== renderToken) return;

  showError(
    "Unable to load contact information."
  );
}

}

function bindEnquiryForm() {
const form =
document.getElementById(
"enquiryForm"
);

if (!form) return;

form.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    const message =
      document.getElementById(
        "enquiryMessage"
      );

    const formData =
      new FormData(form);

    const data = {
      name: String(
        formData.get("name") || ""
      ).trim(),

      phone: String(
        formData.get("phone") || ""
      ).trim(),

      trip: String(
        formData.get("trip") || ""
      ).trim(),

      message: String(
        formData.get("message") || ""
      ).trim()
    };

    if (!data.name || !data.phone) {
      if (message) {
        message.textContent =
          "Please enter your name and phone number.";
      }

      return;
    }

    const button =
      form.querySelector(
        'button[type="submit"]'
      );

    if (button) {
      button.disabled = true;
      button.textContent = "Sending...";
    }

    try {
      await saveEnquiry(data);

      form.reset();

      if (message) {
        message.textContent =
          "Your enquiry has been sent successfully.";
      }

    } catch (error) {
      console.error(
        "Enquiry submit error:",
        error
      );

      if (message) {
        message.textContent =
          "Unable to send your enquiry. Please try again.";
      }

    } finally {
      if (button) {
        button.disabled = false;
        button.textContent =
          "Send Enquiry";
      }
    }
  }
);

}

/* =========================================================
BOOKING SHEET
========================================================= */

function openBooking(tripName = "") {
const overlay =
document.getElementById(
"sheet-overlay"
);

const title =
  document.getElementById(
    "sheet-title-text"
  );

if (!overlay) return;

if (title) {
  title.textContent =
    tripName
      ? `Book: ${tripName}`
      : "Book / Enquire";
}

overlay.classList.add("open");

document.body.classList.add(
  "no-scroll"
);

}

function closeBooking() {
const overlay =
document.getElementById(
"sheet-overlay"
);

if (!overlay) return;

overlay.classList.remove("open");

document.body.classList.remove(
  "no-scroll"
);

}

async function getBusinessSafe() {
try {
return await Promise.resolve(
getBusiness()
);
} catch {
return {};
}
}

function bindBooking() {
document.addEventListener("click", function (event) {

  const openButton =
    event.target.closest(
      "[data-open-booking]"
    );

  if (openButton) {
    openBooking(
      openButton.getAttribute(
        "data-trip-name"
      ) || ""
    );

    return;
  }

  const overlay =
    document.getElementById(
      "sheet-overlay"
    );

  if (
    overlay &&
    event.target === overlay
  ) {
    closeBooking();
  }

  if (
    event.target.closest(
      "#sheet-cancel-btn"
    )
  ) {
    closeBooking();
  }
});

const callButton =
  document.getElementById(
    "sheet-call-btn"
  );

if (callButton) {
  callButton.addEventListener(
    "click",
    async function () {

      const business =
        await getBusinessSafe();

      const phone =
        business?.phone || "";

      if (phone) {
        window.location.href =
          `tel:${phone.replace(
            /[^0-9+]/g,
            ""
          )}`;
      }
    }
  );
}

const whatsappButton =
  document.getElementById(
    "sheet-whatsapp-btn"
  );

if (whatsappButton) {
  whatsappButton.addEventListener(
    "click",
    async function () {

      const business =
        await getBusinessSafe();

      const phone =
        business?.whatsapp ||
        business?.phone ||
        "";

      const clean =
        phone.replace(
          /[^0-9]/g,
          ""
        );

      if (clean) {
        window.open(
          `https://wa.me/${clean}`,
          "_blank",
          "noopener"
        );
      }
    }
  );
}

const copyButton =
  document.getElementById(
    "sheet-copy-btn"
  );

if (copyButton) {
  copyButton.addEventListener(
    "click",
    async function () {

      const business =
        await getBusinessSafe();

      const phone =
        business?.phone || "";

      try {
        await navigator.clipboard.writeText(
          phone
        );

        copyButton.textContent =
          "✓ Copied";

        setTimeout(() => {
          copyButton.textContent =
            "📋 Copy Number";
        }, 1500);

      } catch {
        window.prompt(
          "Copy this number:",
          phone
        );
      }
    }
  );
}

}

/* =========================================================
MOBILE MENU
========================================================= */

function openMobileMenu() {
const nav =
document.getElementById(
"mobile-nav"
);

if (nav) {
  nav.classList.add("open");
}

document.body.classList.add(
  "no-scroll"
);

}

function closeMobileMenu() {
const nav =
document.getElementById(
"mobile-nav"
);

if (nav) {
  nav.classList.remove("open");
}

document.body.classList.remove(
  "no-scroll"
);

}

function bindMobileMenu() {
const openButton =
document.getElementById(
"nav-toggle-btn"
);

const closeButton =
  document.getElementById(
    "mobile-nav-close-btn"
  );

const mobileNav =
  document.getElementById(
    "mobile-nav"
  );

if (openButton) {
  openButton.addEventListener(
    "click",
    openMobileMenu
  );
}

if (closeButton) {
  closeButton.addEventListener(
    "click",
    closeMobileMenu
  );
}

if (mobileNav) {
  mobileNav.addEventListener(
    "click",
    function (event) {

      if (
        event.target === mobileNav
      ) {
        closeMobileMenu();
      }

      const link =
        event.target.closest(
          "[data-nav]"
        );

      if (link) {
        closeMobileMenu();
      }
    }
  );
}

}

/* =========================================================
LANGUAGE
========================================================= */

function loadLanguage() {
const saved =
localStorage.getItem(
"hdt_language"
);

if (
  saved === "en" ||
  saved === "te" ||
  saved === "hi"
) {
  currentLanguage = saved;
}

}

function bindLanguage() {
document.addEventListener(
"click",
function (event) {

    const button =
      event.target.closest(
        "[data-lang]"
      );

    if (!button) return;

    const language =
      button.getAttribute(
        "data-lang"
      );

    if (
      language !== "en" &&
      language !== "te" &&
      language !== "hi"
    ) {
      return;
    }

    currentLanguage =
      language;

    localStorage.setItem(
      "hdt_language",
      language
    );

    applyStaticTranslations();

    renderRoute();
  }
);

}

function applyStaticTranslations() {
document
.querySelectorAll(
"[data-i18n], [data-i18n-nav]"
)
.forEach((element) => {

    const key =
      element.getAttribute(
        "data-i18n"
      ) ||
      element.getAttribute(
        "data-i18n-nav"
      );

    if (!key) return;

    element.textContent =
      getText(
        key,
        element.textContent
      );
  });

document
  .querySelectorAll(
    "[data-lang]"
  )
  .forEach((button) => {

    button.classList.toggle(
      "active",
      button.getAttribute(
        "data-lang"
      ) === currentLanguage
    );
  });

}

/* =========================================================
LIGHTBOX
========================================================= */

function openLightbox(index) {
const item =
lightboxImages[index];

if (!item) return;

lightboxIndex = index;

const overlay =
  document.getElementById(
    "lightbox-overlay"
  );

const image =
  document.getElementById(
    "lightbox-img"
  );

const caption =
  document.getElementById(
    "lightbox-caption-text"
  );

if (!overlay || !image) return;

image.src = imageUrl(
  item.media_url,
  item.title || "Gallery"
);

image.alt =
  item.title || "Gallery";

if (caption) {
  caption.textContent =
    item.title || "";
}

overlay.classList.add("open");

document.body.classList.add(
  "no-scroll"
);

}

function closeLightbox() {
const overlay =
document.getElementById(
"lightbox-overlay"
);

if (overlay) {
  overlay.classList.remove(
    "open"
  );
}

document.body.classList.remove(
  "no-scroll"
);

}

function moveLightbox(direction) {
if (!lightboxImages.length) return;

lightboxIndex =
  (lightboxIndex +
    direction +
    lightboxImages.length) %
  lightboxImages.length;

openLightbox(
  lightboxIndex
);

}

function bindLightbox() {
document.addEventListener(
"click",
function (event) {

    const item =
      event.target.closest(
        "[data-gallery-index]"
      );

    if (item) {
      openLightbox(
        Number(
          item.getAttribute(
            "data-gallery-index"
          )
        )
      );

      return;
    }

    if (
      event.target.closest(
        "#lightbox-close-btn"
      )
    ) {
      closeLightbox();
      return;
    }

    if (
      event.target.closest(
        "#lightbox-prev-btn"
      )
    ) {
      moveLightbox(-1);
      return;
    }

    if (
      event.target.closest(
        "#lightbox-next-btn"
      )
    ) {
      moveLightbox(1);
    }
  }
);

document.addEventListener(
  "keydown",
  function (event) {

    const overlay =
      document.getElementById(
        "lightbox-overlay"
      );

    if (
      !overlay ||
      !overlay.classList.contains(
        "open"
      )
    ) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      moveLightbox(-1);
    }

    if (event.key === "ArrowRight") {
      moveLightbox(1);
    }
  }
);

}

/* =========================================================
VIDEO MODAL
========================================================= */

function bindVideoOverlay() {
document.addEventListener(
"click",
function (event) {

    const card =
      event.target.closest(
        "[data-video-index]"
      );

    if (!card) return;

    const overlay =
      document.getElementById(
        "video-overlay"
      );

    if (!overlay) return;

    overlay.classList.add(
      "open"
    );

    document.body.classList.add(
      "no-scroll"
    );
  }
);

const close =
  document.getElementById(
    "video-close-btn"
  );

if (close) {
  close.addEventListener(
    "click",
    function () {

      const overlay =
        document.getElementById(
          "video-overlay"
        );

      if (overlay) {
        overlay.classList.remove(
          "open"
        );
      }

      document.body.classList.remove(
        "no-scroll"
      );
    }
  );
}

}

/* =========================================================
FLOATING CALL / WHATSAPP
========================================================= */

function bindFloatingButtons() {
const call =
document.getElementById(
"float-call-btn"
);

if (call) {
  call.addEventListener(
    "click",
    async function () {

      const business =
        await getBusinessSafe();

      const phone =
        business?.phone || "";

      if (phone) {
        window.location.href =
          `tel:${phone.replace(
            /[^0-9+]/g,
            ""
          )}`;
      }
    }
  );
}

const whatsapp =
  document.getElementById(
    "float-whatsapp-btn"
  );

if (whatsapp) {
  whatsapp.addEventListener(
    "click",
    async function () {

      const business =
        await getBusinessSafe();

      const phone =
        business?.whatsapp ||
        business?.phone ||
        "";

      const clean =
        phone.replace(
          /[^0-9]/g,
          ""
        );

      if (clean) {
        window.open(
          `https://wa.me/${clean}`,
          "_blank",
          "noopener"
        );
      }
    }
  );
}

}

/* =========================================================
ROUTE RENDERER
========================================================= */

async function renderRoute() {
if (!app) return;

const token =
  ++renderToken;

const route =
  getRoute();

closeMobileMenu();

try {

  switch (route.page) {

    case "home":
      await renderHome(token);
      break;

    case "trips":
      await renderTrips(token);
      break;

    case "trip":
      await renderTripDetails(
        route.id,
        token
      );
      break;

    case "vehicles":
      await renderVehicles(token);
      break;

    case "gallery":
      await renderGallery(token);
      break;

    case "videos":
      await renderVideos(token);
      break;

    case "reviews":
      await renderReviews(token);
      break;

    case "contact":
      await renderContact(token);
      break;

    default:
      navigate("/");
      return;
  }

  if (token === renderToken) {
    applyStaticTranslations();
  }

} catch (error) {

  console.error(
    "Route render error:",
    error
  );

  if (
    token === renderToken
  ) {
    showError(
      "Unable to load this page."
    );
  }
}

}

/* =========================================================
INITIALIZATION
========================================================= */

async function init() {

try {

  loadLanguage();

  if (
    typeof initDataLayer ===
    "function"
  ) {
    await initDataLayer();
  }

  bindNavigation();
  bindHistory();
  bindBooking();
  bindMobileMenu();
  bindLanguage();
  bindLightbox();
  bindVideoOverlay();
  bindFloatingButtons();

  applyStaticTranslations();

  await renderRoute();

} catch (error) {

  console.error(
    "Hazi Dada Travels initialization error:",
    error
  );

  showError(
    "Website initialization failed."
  );
}

}

/* =========================================================
START
========================================================= */

if (
document.readyState ===
"loading"
) {

document.addEventListener(
  "DOMContentLoaded",
  init
);

} else {

init();

}

})();
