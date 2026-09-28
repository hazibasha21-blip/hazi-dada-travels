/* =========================================================
   HAZI DADA TRAVELS V1
   APP.JS
   UI + ROUTING + INTERACTIONS
   ========================================================= */
window.addEventListener("error", function (event) {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div style="background:#ff0000;color:#fff;padding:15px;font-size:16px;position:fixed;top:0;left:0;right:0;z-index:99999;">
      ERROR: ${event.message}
    </div>`
  );
});
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
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
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

  function placeholderImage(text = "Hazi Dada Travels") {
    return (
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600">
          <rect width="100%" height="100%" fill="#18222d"/>
          <text x="50%" y="50%"
            dominant-baseline="middle"
            text-anchor="middle"
            fill="white"
            font-size="42"
            font-family="Arial">
            ${text}
          </text>
        </svg>
      `)
    );
  }

  function imageUrl(url, label) {
    return safeUrl(url) || placeholderImage(label);
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
    } catch (e) {}

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
      image: trip.image || trip.image_url || ""
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
      image_url: item.image_url || item.media_url || "",
      media_type: item.media_type || "image",
      description: item.description || item.caption || ""
    };
  }

  function normalizeReview(review) {
    if (!review) return null;

    return {
      ...review,
      id: review.id,
      name: review.name || "Guest",
      rating: Number(review.rating || 5),
      review: review.review || review.comment || ""
    };
  }

  function setLoading() {
    if (!app) return;

    app.innerHTML = `
      <section class="page-section loading-section">
        <div class="loader"></div>
        <p>Loading...</p>
      </section>
    `;
  }

  function showError(message) {
    if (!app) return;

    app.innerHTML = `
      <section class="page-section error-section">
        <div class="error-card">
          <h2>Something went wrong</h2>
          <p>${escapeHtml(message)}</p>
          <button class="btn primary-btn" data-nav="home">
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
      return {
        page: "home"
      };
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
      : `#${path.startsWith("/") ? path : "/" + path}`;

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

  /* =========================================================
     NAVIGATION
     ========================================================= */

  function bindNavigation() {
    document.addEventListener("click", function (event) {
      const navElement = event.target.closest("[data-nav]");

      if (!navElement) return;

      event.preventDefault();

      const destination = navElement.getAttribute("data-nav");

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
        <section class="hero-section">
          <div class="hero-content">
            <span class="hero-badge">
              Hazi Dada Travels
            </span>

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
              <button class="btn primary-btn" data-nav="trips">
                ${escapeHtml(
                  getText("view_trips", "View Trips")
                )}
              </button>

              <button class="btn secondary-btn" data-open-booking>
                ${escapeHtml(
                  getText("book_now", "Book Now")
                )}
              </button>
            </div>
          </div>
        </section>

        <section class="page-section">
          <div class="section-heading">
            <div>
              <span class="section-kicker">EXPLORE</span>
              <h2>${escapeHtml(
                getText("nav_trips", "Trips")
              )}</h2>
            </div>

            <button class="text-btn" data-nav="trips">
              View All →
            </button>
          </div>

          ${
            featured.length
              ? `
                <div class="trip-grid">
                  ${featured.map(tripCardHtml).join("")}
                </div>
              `
              : `
                <div class="empty-card">
                  <h3>No trips available yet</h3>
                  <p>Trips added from your database will appear here.</p>
                </div>
              `
          }
        </section>

        <section class="quick-section">
          <button class="quick-card" data-nav="vehicles">
            <span class="quick-icon">🚌</span>
            <strong>Vehicles</strong>
            <small>View our vehicles</small>
          </button>

          <button class="quick-card" data-nav="gallery">
            <span class="quick-icon">📸</span>
            <strong>Gallery</strong>
            <small>See our travel moments</small>
          </button>

          <button class="quick-card" data-nav="reviews">
            <span class="quick-icon">⭐</span>
            <strong>Reviews</strong>
            <small>What travellers say</small>
          </button>

          <button class="quick-card" data-nav="contact">
            <span class="quick-icon">📞</span>
            <strong>Contact</strong>
            <small>Get in touch</small>
          </button>
        </section>
      `;
    } catch (error) {
      console.error("Home error:", error);

      if (token !== renderToken) return;

      showError(
        "Unable to load the website data. Please check your Supabase connection."
      );
    }
  }

  /* =========================================================
     TRIP CARD
     ========================================================= */

  function tripCardHtml(trip) {
    const image = imageUrl(
      trip.image,
      trip.name || "Trip"
    );

    return `
      <article class="trip-card">

        <div class="trip-image-wrap">
          <img
            src="${image}"
            alt="${escapeHtml(trip.name)}"
            class="trip-image"
            loading="lazy"
          >
        </div>

        <div class="trip-content">

          <span class="trip-destination">
            ${escapeHtml(trip.destination)}
          </span>

          <h3>
            ${escapeHtml(trip.name)}
          </h3>

          ${
            trip.description
              ? `<p>${escapeHtml(trip.description)}</p>`
              : ""
          }

          <div class="trip-meta">

            ${
              trip.duration
                ? `
                  <span>
                    ⏱ ${escapeHtml(trip.duration)}
                  </span>
                `
                : ""
            }

            ${
              trip.price
                ? `
                  <strong>
                    ${escapeHtml(trip.price)}
                  </strong>
                `
                : ""
            }

          </div>

          <div class="trip-actions">

            <button
              class="btn primary-btn"
              data-nav="trip/${encodeURIComponent(trip.id)}"
            >
              View Details
            </button>

            <button
              class="btn secondary-btn"
              data-open-booking
              data-trip-name="${escapeHtml(trip.name)}"
            >
              Book Now
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
        <section class="page-section">

          <div class="page-header">
            <span class="section-kicker">JOURNEYS</span>

            <h1>
              ${escapeHtml(
                getText("nav_trips", "Trips")
              )}
            </h1>

            <p>
              Explore our available travel packages.
            </p>
          </div>

          ${
            list.length
              ? `
                <div class="trip-grid">
                  ${list.map(tripCardHtml).join("")}
                </div>
              `
              : `
                <div class="empty-card">
                  <h3>No trips available</h3>
                  <p>
                    Add trips to your Supabase
                    <strong>trips</strong> table.
                  </p>
                </div>
              `
          }

        </section>
      `;
    } catch (error) {
      console.error("Trips error:", error);

      if (token !== renderToken) return;

      showError(
        "Unable to load trips. Please check your Supabase connection."
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
          <section class="page-section">
            <div class="empty-card">
              <h2>Trip not found</h2>
              <button
                class="btn primary-btn"
                data-nav="trips"
              >
                Back to Trips
              </button>
            </div>
          </section>
        `;

        return;
      }

      app.innerHTML = `
        <section class="page-section trip-detail-page">

          <button
            class="back-btn"
            data-nav="trips"
          >
            ← Back to Trips
          </button>

          <div class="detail-card">

            <div class="detail-image">
              <img
                src="${imageUrl(
                  trip.image,
                  trip.name
                )}"
                alt="${escapeHtml(trip.name)}"
              >
            </div>

            <div class="detail-content">

              <span class="trip-destination">
                ${escapeHtml(trip.destination)}
              </span>

              <h1>
                ${escapeHtml(trip.name)}
              </h1>

              ${
                trip.description
                  ? `
                    <p class="detail-description">
                      ${escapeHtml(trip.description)}
                    </p>
                  `
                  : ""
              }

              <div class="detail-info">

                ${
                  trip.duration
                    ? `
                      <div>
                        <small>Duration</small>
                        <strong>
                          ${escapeHtml(trip.duration)}
                        </strong>
                      </div>
                    `
                    : ""
                }

                ${
                  trip.price
                    ? `
                      <div>
                        <small>Price</small>
                        <strong>
                          ${escapeHtml(trip.price)}
                        </strong>
                      </div>
                    `
                    : ""
                }

              </div>

              <button
                class="btn primary-btn large-btn"
                data-open-booking
                data-trip-name="${escapeHtml(trip.name)}"
              >
                Book This Trip
              </button>

            </div>

          </div>

        </section>
      `;
    } catch (error) {
      console.error("Trip details error:", error);

      if (token !== renderToken) return;

      showError("Unable to load this trip.");
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
        <section class="page-section">

          <div class="page-header">
            <span class="section-kicker">OUR FLEET</span>

            <h1>Vehicles</h1>

            <p>
              Comfortable vehicles for your journey.
            </p>
          </div>

          ${
            list.length
              ? `
                <div class="vehicle-grid">
                  ${list.map(vehicleCardHtml).join("")}
                </div>
              `
              : `
                <div class="empty-card">
                  <h3>No vehicles available</h3>
                  <p>
                    Vehicles added to Supabase will appear here.
                  </p>
                </div>
              `
          }

        </section>
      `;
    } catch (error) {
      console.error("Vehicles error:", error);

      if (token !== renderToken) return;

      showError("Unable to load vehicles.");
    }
  }

  function vehicleCardHtml(vehicle) {
    return `
      <article class="vehicle-card">

        <div class="vehicle-image-wrap">

          <img
            src="${imageUrl(
              vehicle.image_url,
              vehicle.name
            )}"
            alt="${escapeHtml(vehicle.name)}"
            loading="lazy"
          >

          <span class="availability ${
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

        <div class="vehicle-content">

          <h3>
            ${escapeHtml(vehicle.name)}
          </h3>

          ${
            vehicle.type
              ? `<p>${escapeHtml(vehicle.type)}</p>`
              : ""
          }

          <div class="vehicle-meta">

            ${
              vehicle.capacity
                ? `
                  <span>
                    👥 ${escapeHtml(
                      vehicle.capacity
                    )}
                  </span>
                `
                : ""
            }

            ${
              vehicle.registration
                ? `
                  <span>
                    ${escapeHtml(
                      vehicle.registration
                    )}
                  </span>
                `
                : ""
            }

          </div>

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
        <section class="page-section">

          <div class="page-header">
            <span class="section-kicker">MEMORIES</span>

            <h1>Gallery</h1>

            <p>
              Moments from Hazi Dada Travels.
            </p>
          </div>

          ${
            list.length
              ? `
                <div class="gallery-grid">

                  ${list
                    .map(
                      (item, index) => `
                        <button
                          class="gallery-item"
                          data-gallery-index="${index}"
                        >

                          <img
                            src="${imageUrl(
                              item.image_url,
                              item.title || "Gallery"
                            )}"
                            alt="${escapeHtml(
                              item.title ||
                                "Hazi Dada Travels"
                            )}"
                            loading="lazy"
                          >

                          ${
                            item.title
                              ? `
                                <span>
                                  ${escapeHtml(
                                    item.title
                                  )}
                                </span>
                              `
                              : ""
                          }

                        </button>
                      `
                    )
                    .join("")}

                </div>
              `
              : `
                <div class="empty-card">
                  <h3>Gallery is empty</h3>
                  <p>
                    Approved gallery items will appear here.
                  </p>
                </div>
              `
          }

        </section>
      `;
    } catch (error) {
      console.error("Gallery error:", error);

      if (token !== renderToken) return;

      showError("Unable to load gallery.");
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

      if (!Array.isArray(videos) || videos.length === 0) {
        app.innerHTML = `
          <section class="page-section">

            <div class="page-header">
              <span class="section-kicker">WATCH</span>

              <h1>Videos</h1>

              <p>
                Travel videos will appear here.
              </p>
            </div>

            <div class="empty-card">
              <div class="empty-icon">🎥</div>

              <h3>No videos available yet</h3>

              <p>
                Videos backend is not configured yet.
              </p>
            </div>

          </section>
        `;

        return;
      }

      app.innerHTML = `
        <section class="page-section">

          <div class="page-header">
            <span class="section-kicker">WATCH</span>

            <h1>Videos</h1>
          </div>

          <div class="video-grid">

            ${videos
              .map(
                (video, index) => `
                  <button
                    class="video-card"
                    data-video-index="${index}"
                  >
                    <div class="video-thumbnail">
                      ▶
                    </div>

                    <strong>
                      ${escapeHtml(
                        video.title ||
                          `Video ${index + 1}`
                      )}
                    </strong>
                  </button>
                `
              )
              .join("")}

          </div>

        </section>
      `;
    } catch (error) {
      console.error("Videos error:", error);

      if (token !== renderToken) return;

      showError("Unable to load videos.");
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
        <section class="page-section">

          <div class="page-header">
            <span class="section-kicker">TRAVELLER FEEDBACK</span>

            <h1>Reviews</h1>

            <p>
              See what our travellers have to say.
            </p>
          </div>

          ${
            list.length
              ? `
                <div class="review-grid">
                  ${list.map(reviewCardHtml).join("")}
                </div>
              `
              : `
                <div class="empty-card">
                  <h3>No reviews yet</h3>
                  <p>
                    Be the first traveller to leave a review.
                  </p>
                </div>
              `
          }

          <div class="review-form-card">

            <div class="form-heading">
              <h2>Leave a Review</h2>
              <p>
                Your review will be checked before appearing publicly.
              </p>
            </div>

            <form id="reviewForm">

              <div class="form-grid">

                <label>
                  <span>Your Name</span>
                  <input
                    type="text"
                    name="name"
                    required
                    maxlength="100"
                  >
                </label>

                <label>
                  <span>Rating</span>

                  <select
                    name="rating"
                    required
                  >
                    <option value="5">★★★★★ 5</option>
                    <option value="4">★★★★☆ 4</option>
                    <option value="3">★★★☆☆ 3</option>
                    <option value="2">★★☆☆☆ 2</option>
                    <option value="1">★☆☆☆☆ 1</option>
                  </select>

                </label>

              </div>

              <label>
                <span>Your Review</span>

                <textarea
                  name="review"
                  rows="5"
                  required
                  maxlength="1000"
                ></textarea>
              </label>

              <button
                type="submit"
                class="btn primary-btn"
              >
                Submit Review
              </button>

              <div
                id="reviewMessage"
                class="form-message"
              ></div>

            </form>

          </div>

        </section>
      `;

      bindReviewForm();
    } catch (error) {
      console.error("Reviews error:", error);

      if (token !== renderToken) return;

      showError("Unable to load reviews.");
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

        <p class="review-text">
          “${escapeHtml(review.review)}”
        </p>

        <div class="review-author">
          <div class="review-avatar">
            ${escapeHtml(
              String(review.name).charAt(0).toUpperCase()
            )}
          </div>

          <strong>
            ${escapeHtml(review.name)}
          </strong>
        </div>

      </article>
    `;
  }

  function bindReviewForm() {
    const form = document.getElementById("reviewForm");

    if (!form) return;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const message =
        document.getElementById("reviewMessage");

      const formData = new FormData(form);

      const data = {
        name: String(formData.get("name") || "").trim(),
        rating: Number(formData.get("rating") || 5),
        review: String(
          formData.get("review") || ""
        ).trim()
      };

      if (!data.name || !data.review) {
        if (message) {
          message.textContent =
            "Please complete all fields.";
        }

        return;
      }

      const button = form.querySelector(
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
        console.error("Review submit error:", error);

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
        business?.phone || "+91XXXXXXXXXX";

      const whatsapp =
        business?.whatsapp || phone;

      const email =
        business?.email ||
        "hazidadatravels5786@gmail.com";

      const address =
        business?.address || "";

      app.innerHTML = `
        <section class="page-section">

          <div class="page-header">
            <span class="section-kicker">GET IN TOUCH</span>

            <h1>Contact Us</h1>

            <p>
              Contact us directly for bookings and enquiries.
            </p>
          </div>

          <div class="contact-layout">

            <div class="contact-info-card">

              <div class="contact-item">
                <span class="contact-icon">📞</span>

                <div>
                  <small>Phone</small>
                  <a
                    href="tel:${escapeHtml(phone)}"
                  >
                    ${escapeHtml(phone)}
                  </a>
                </div>
              </div>

              <div class="contact-item">
                <span class="contact-icon">💬</span>

                <div>
                  <small>WhatsApp</small>

                  <a
                    href="${safeUrl(
                      "https://wa.me/" +
                        whatsapp.replace(
                          /[^0-9]/g,
                          ""
                        )
                    )}"
                    target="_blank"
                    rel="noopener"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              <div class="contact-item">
                <span class="contact-icon">✉️</span>

                <div>
                  <small>Email</small>

                  <a
                    href="mailto:${escapeHtml(email)}"
                  >
                    ${escapeHtml(email)}
                  </a>
                </div>
              </div>

              ${
                address
                  ? `
                    <div class="contact-item">
                      <span class="contact-icon">📍</span>

                      <div>
                        <small>Address</small>
                        <p>
                          ${escapeHtml(address)}
                        </p>
                      </div>
                    </div>
                  `
                  : ""
              }

            </div>

            <div class="enquiry-card">

              <h2>Send an Enquiry</h2>

              <form id="enquiryForm">

                <label>
                  <span>Name</span>

                  <input
                    type="text"
                    name="name"
                    required
                    maxlength="100"
                  >
                </label>

                <label>
                  <span>Phone</span>

                  <input
                    type="tel"
                    name="phone"
                    required
                    maxlength="20"
                  >
                </label>

                <label>
                  <span>Trip</span>

                  <input
                    type="text"
                    name="trip"
                    maxlength="200"
                  >
                </label>

                <label>
                  <span>Message</span>

                  <textarea
                    name="message"
                    rows="5"
                    maxlength="1000"
                  ></textarea>
                </label>

                <button
                  type="submit"
                  class="btn primary-btn"
                >
                  Send Enquiry
                </button>

                <div
                  id="enquiryMessage"
                  class="form-message"
                ></div>

              </form>

            </div>

          </div>

        </section>
      `;

      bindEnquiryForm();
    } catch (error) {
      console.error("Contact error:", error);

      if (token !== renderToken) return;

      showError("Unable to load contact information.");
    }
  }

  function bindEnquiryForm() {
    const form =
      document.getElementById("enquiryForm");

    if (!form) return;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const message =
        document.getElementById("enquiryMessage");

      const formData = new FormData(form);

      const data = {
        name: String(formData.get("name") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        trip: String(formData.get("trip") || "").trim(),
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

      const button = form.querySelector(
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
          button.textContent = "Send Enquiry";
        }
      }
    });
  }

  /* =========================================================
     BOOKING SHEET
     ========================================================= */

  function openBooking(tripName = "") {
    const sheet =
      document.getElementById("bookingSheet");

    if (!sheet) return;

    const tripInput =
      sheet.querySelector(
        '[name="trip"], #bookingTrip'
      );

    if (tripInput && tripName) {
      tripInput.value = tripName;
    }

    sheet.classList.add("active");
    sheet.setAttribute("aria-hidden", "false");
  }

  function closeBooking() {
    const sheet =
      document.getElementById("bookingSheet");

    if (!sheet) return;

    sheet.classList.remove("active");
    sheet.setAttribute("aria-hidden", "true");
  }

  function bindBooking() {
    document.addEventListener("click", function (event) {
      const openButton =
        event.target.closest("[data-open-booking]");

      if (openButton) {
        const tripName =
          openButton.getAttribute("data-trip-name") || "";

        openBooking(tripName);
        return;
      }

      const closeButton =
        event.target.closest("[data-close-booking]");

      if (closeButton) {
        closeBooking();
        return;
      }

      if (
        event.target.id === "bookingSheet"
      ) {
        closeBooking();
      }
    });

    const callButton =
      document.getElementById("bookingCall");

    if (callButton) {
      callButton.addEventListener("click", async function () {
        const business =
          await Promise.resolve(getBusiness());

        const phone =
          business?.phone || "";

        if (phone) {
          window.location.href =
            `tel:${phone.replace(
              /[^0-9+]/g,
              ""
            )}`;
        }
      });
    }

    const whatsappButton =
      document.getElementById("bookingWhatsapp");

    if (whatsappButton) {
      whatsappButton.addEventListener(
        "click",
        async function () {
          const business =
            await Promise.resolve(getBusiness());

          const phone =
            business?.whatsapp ||
            business?.phone ||
            "";

          const cleanPhone =
            phone.replace(/[^0-9]/g, "");

          if (!cleanPhone) return;

          const url =
            `https://wa.me/${cleanPhone}`;

          window.open(
            url,
            "_blank",
            "noopener"
          );
        }
      );
    }

    const copyButton =
      document.getElementById("bookingCopy");

    if (copyButton) {
      copyButton.addEventListener(
        "click",
        async function () {
          const business =
            await Promise.resolve(getBusiness());

          const phone =
            business?.phone || "";

          try {
            await navigator.clipboard.writeText(phone);

            copyButton.textContent =
              "Copied ✓";

            setTimeout(() => {
              copyButton.textContent =
                "Copy Number";
            }, 1500);
          } catch (error) {
            alert(phone);
          }
        }
      );
    }
  }

  /* =========================================================
     MOBILE MENU
     ========================================================= */

  function openMobileMenu() {
    const drawer =
      document.querySelector(".mobile-drawer");

    const overlay =
      document.querySelector(".mobile-overlay");

    if (drawer) {
      drawer.classList.add("active");
    }

    if (overlay) {
      overlay.classList.add("active");
    }

    document.body.classList.add(
      "menu-open"
    );
  }

  function closeMobileMenu() {
    const drawer =
      document.querySelector(".mobile-drawer");

    const overlay =
      document.querySelector(".mobile-overlay");

    if (drawer) {
      drawer.classList.remove("active");
    }

    if (overlay) {
      overlay.classList.remove("active");
    }

    document.body.classList.remove(
      "menu-open"
    );
  }

  function bindMobileMenu() {
    document.addEventListener("click", function (event) {
      const menuButton =
        event.target.closest(
          "[data-menu-toggle]"
        );

      if (menuButton) {
        openMobileMenu();
        return;
      }

      const closeButton =
        event.target.closest(
          "[data-menu-close]"
        );

      if (closeButton) {
        closeMobileMenu();
        return;
      }

      const mobileNav =
        event.target.closest(
          ".mobile-drawer [data-nav]"
        );

      if (mobileNav) {
        closeMobileMenu();
      }
    });
  }

  /* =========================================================
     LANGUAGE
     ========================================================= */

  function bindLanguage() {
    document.addEventListener("click", function (event) {
      const languageButton =
        event.target.closest(
          "[data-lang]"
        );

      if (!languageButton) return;

      const language =
        languageButton.getAttribute(
          "data-lang"
        );

      if (!language) return;

      currentLanguage = language;

      localStorage.setItem(
        "hdt_language",
        language
      );

      document
        .querySelectorAll("[data-lang]")
        .forEach((button) => {
          button.classList.toggle(
            "active",
            button.getAttribute("data-lang") ===
              language
          );
        });

      applyStaticTranslations();

      renderRoute();
    });
  }

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

  function applyStaticTranslations() {
    document
      .querySelectorAll("[data-i18n]")
      .forEach((element) => {
        const key =
          element.getAttribute(
            "data-i18n"
          );

        if (!key) return;

        element.textContent =
          getText(key, element.textContent);
      });

    document
      .querySelectorAll("[data-i18n-nav]")
      .forEach((element) => {
        const key =
          element.getAttribute(
            "data-i18n-nav"
          );

        if (!key) return;

        element.textContent =
          getText(key, element.textContent);
      });

    document
      .querySelectorAll("[data-lang]")
      .forEach((button) => {
        button.classList.toggle(
          "active",
          button.getAttribute("data-lang") ===
            currentLanguage
        );
      });
  }

  /* =========================================================
     GALLERY LIGHTBOX
     ========================================================= */

  function openLightbox(index) {
    const item =
      lightboxImages[index];

    if (!item) return;

    lightboxIndex = index;

    const overlay =
      document.getElementById(
        "lightbox"
      );

    if (!overlay) return;

    const image =
      overlay.querySelector(
        "img"
      );

    const title =
      overlay.querySelector(
        "[data-lightbox-title]"
      );

    if (image) {
      image.src = imageUrl(
        item.image_url,
        item.title || "Gallery"
      );

      image.alt =
        item.title || "Gallery";
    }

    if (title) {
      title.textContent =
        item.title || "";
    }

    overlay.classList.add("active");
  }

  function closeLightbox() {
    const overlay =
      document.getElementById(
        "lightbox"
      );

    if (overlay) {
      overlay.classList.remove(
        "active"
      );
    }
  }

  function moveLightbox(direction) {
    if (!lightboxImages.length) return;

    lightboxIndex =
      (lightboxIndex +
        direction +
        lightboxImages.length) %
      lightboxImages.length;

    openLightbox(lightboxIndex);
  }

  function bindLightbox() {
    document.addEventListener("click", function (event) {
      const item =
        event.target.closest(
          "[data-gallery-index]"
        );

      if (item) {
        const index = Number(
          item.getAttribute(
            "data-gallery-index"
          )
        );

        openLightbox(index);
        return;
      }

      const close =
        event.target.closest(
          "[data-lightbox-close]"
        );

      if (close) {
        closeLightbox();
        return;
      }

      const next =
        event.target.closest(
          "[data-lightbox-next]"
        );

      if (next) {
        moveLightbox(1);
        return;
      }

      const previous =
        event.target.closest(
          "[data-lightbox-prev]"
        );

      if (previous) {
        moveLightbox(-1);
      }
    });

    document.addEventListener(
      "keydown",
      function (event) {
        const overlay =
          document.getElementById(
            "lightbox"
          );

        if (
          !overlay ||
          !overlay.classList.contains("active")
        ) {
          return;
        }

        if (event.key === "Escape") {
          closeLightbox();
        }

        if (event.key === "ArrowRight") {
          moveLightbox(1);
        }

        if (event.key === "ArrowLeft") {
          moveLightbox(-1);
        }
      }
    );
  }

  /* =========================================================
     VIDEO OVERLAY
     ========================================================= */

  function bindVideoOverlay() {
    document.addEventListener("click", function (event) {
      const videoCard =
        event.target.closest(
          "[data-video-index]"
        );

      if (!videoCard) return;

      const overlay =
        document.getElementById(
          "videoOverlay"
        );

      if (!overlay) return;

      const close =
        overlay.querySelector(
          "[data-video-close]"
        );

      if (close) {
        close.onclick = () => {
          overlay.classList.remove(
            "active"
          );
        };
      }

      overlay.classList.add("active");
    });
  }

  /* =========================================================
     FLOATING BUTTONS
     ========================================================= */

  function bindFloatingButtons() {
    const call =
      document.querySelector(
        "[data-floating-call]"
      );

    if (call) {
      call.addEventListener(
        "click",
        async function () {
          const business =
            await Promise.resolve(
              getBusiness()
            );

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
      document.querySelector(
        "[data-floating-whatsapp]"
      );

    if (whatsapp) {
      whatsapp.addEventListener(
        "click",
        async function () {
          const business =
            await Promise.resolve(
              getBusiness()
            );

          const phone =
            business?.whatsapp ||
            business?.phone ||
            "";

          const cleanPhone =
            phone.replace(
              /[^0-9]/g,
              ""
            );

          if (cleanPhone) {
            window.open(
              `https://wa.me/${cleanPhone}`,
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

    const token = ++renderToken;
    const route = getRoute();

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
          break;
      }

      applyStaticTranslations();
    } catch (error) {
      console.error(
        "Route render error:",
        error
      );

      if (token === renderToken) {
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
        "Website initialization failed. Please check data.js and app.js."
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
