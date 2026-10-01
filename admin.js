/* =========================================================
   HAZI DADA TRAVELS
   admin.js
   Complete Admin Panel Controller
   ========================================================= */


/* =========================================================
   ADMIN CONFIG
   ========================================================= */

const ADMIN_USER_ID =
  "589555e8-5853-4e58-aaac-8038ec833c80";

const ADMIN_MAX_IMAGE_SIZE =
  5 * 1024 * 1024;


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function $a(id) {
  return document.getElementById(id);
}


function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function getFieldValue(id) {
  const el = $a(id);
  return el ? String(el.value ?? "").trim() : "";
}


function setFieldValue(id, value) {
  const el = $a(id);

  if (el) {
    el.value =
      value === null ||
      value === undefined
        ? ""
        : String(value);
  }
}


function showElement(id) {
  const el = $a(id);

  if (el) {
    el.style.display = "";
  }
}


function hideElement(id) {
  const el = $a(id);

  if (el) {
    el.style.display = "none";
  }
}


function showError(id, message) {
  const el = $a(id);

  if (!el) {
    return;
  }

  el.textContent =
    message || "Something went wrong.";

  el.style.display = "block";
}


function clearError(id) {
  const el = $a(id);

  if (!el) {
    return;
  }

  el.textContent = "";
  el.style.display = "none";
}


function setButtonLoading(button, loading, loadingText) {
  if (!button) {
    return;
  }

  if (loading) {
    button.dataset.originalText =
      button.textContent;

    button.disabled = true;

    button.textContent =
      loadingText || "Saving...";
  } else {
    button.disabled = false;

    if (
      button.dataset.originalText !== undefined
    ) {
      button.textContent =
        button.dataset.originalText;

      delete button.dataset.originalText;
    }
  }
}


function actionButton(
  label,
  action,
  id,
  className = "a-btn a-btn-outline a-btn-small"
) {
  return `
    <button
      type="button"
      class="${className}"
      data-action="${escapeHTML(action)}"
      data-id="${escapeHTML(id)}">
      ${escapeHTML(label)}
    </button>
  `;
}


function formatDate(value) {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
  } catch {
    return String(value);
  }
}


function normalizeYouTubeId(value) {
  const raw =
    String(value || "").trim();

  if (!raw) {
    return "";
  }

  /*
   * Already an 11-character YouTube ID.
   */
  if (
    /^[A-Za-z0-9_-]{11}$/.test(raw)
  ) {
    return raw;
  }

  try {
    const url =
      new URL(raw);

    if (
      url.hostname.includes("youtu.be")
    ) {
      return url.pathname
        .replace(/^\/+/, "")
        .split("/")[0];
    }

    if (
      url.hostname.includes("youtube.com")
    ) {
      const v =
        url.searchParams.get("v");

      if (v) {
        return v;
      }

      const parts =
        url.pathname.split("/");

      const index =
        parts.indexOf("shorts");

      if (
        index >= 0 &&
        parts[index + 1]
      ) {
        return parts[index + 1];
      }

      const embedIndex =
        parts.indexOf("embed");

      if (
        embedIndex >= 0 &&
        parts[embedIndex + 1]
      ) {
        return parts[embedIndex + 1];
      }
    }

  } catch {
    /*
     * Not a URL.
     */
  }

  return raw;
}


/* =========================================================
   SUPABASE CLIENT
   ========================================================= */

function authClient() {
  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient ||
    !supabaseClient.auth
  ) {
    throw new Error(
      "Supabase client unavailable."
    );
  }

  return supabaseClient;
}


/* =========================================================
   AUTH
   ========================================================= */

async function isAdminLoggedIn() {
  try {
    const db =
      authClient();

    const {
      data,
      error
    } =
      await db.auth.getSession();

    if (
      error ||
      !data ||
      !data.session ||
      !data.session.user
    ) {
      return false;
    }

    return (
      data.session.user.id ===
      ADMIN_USER_ID
    );

  } catch (error) {
    console.error(
      "[admin.js] Session check failed:",
      error
    );

    return false;
  }
}


async function adminLogin(
  email,
  password
) {
  try {
    const db =
      authClient();

    if (!email) {
      return {
        ok: false,
        message: "Please enter your email."
      };
    }

    if (!password) {
      return {
        ok: false,
        message: "Please enter your password."
      };
    }

    const {
      data,
      error
    } =
      await db.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      return {
        ok: false,
        message:
          error.message ||
          "Login failed."
      };
    }

    if (
      !data ||
      !data.user
    ) {
      return {
        ok: false,
        message:
          "Login failed. No user session was returned."
      };
    }

    /*
     * Only the configured admin UUID is allowed.
     */
    if (
      data.user.id !==
      ADMIN_USER_ID
    ) {
      try {
        await db.auth.signOut();
      } catch (signOutError) {
        console.warn(
          "[admin.js] Unauthorized sign-out failed:",
          signOutError
        );
      }

      return {
        ok: false,
        message:
          "This account is not authorized for the Admin Panel."
      };
    }

    return {
      ok: true,
      data
    };

  } catch (error) {
    console.error(
      "[admin.js] Login error:",
      error
    );

    return {
      ok: false,
      message:
        error.message ||
        "Unable to login. Please try again."
    };
  }
}


async function adminLogout() {
  try {
    const db =
      authClient();

    await db.auth.signOut();

  } catch (error) {
    console.warn(
      "[admin.js] Logout error:",
      error
    );

  } finally {
    window.location.replace(
      "login.html"
    );
  }
}


async function requireAdminAuth() {
  const allowed =
    await isAdminLoggedIn();

  if (!allowed) {
    window.location.replace(
      "login.html"
    );

    return false;
  }

  return true;
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPanel(panelName) {
  const panels =
    document.querySelectorAll(
      ".admin-panel"
    );

  panels.forEach(panel => {
    panel.classList.toggle(
      "active",
      panel.id ===
      `panel-${panelName}`
    );
  });

  const navItems =
    document.querySelectorAll(
      "[data-panel]"
    );

  navItems.forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.panel ===
      panelName
    );
  });

  /*
   * Load the selected panel.
   */
  const loader =
    PANEL_LOADERS[panelName];

  if (loader) {
    Promise.resolve(loader())
      .catch(error => {
        console.error(
          `[admin.js] Failed to load ${panelName}:`,
          error
        );
      });
  }
}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(id) {
  const modal = $a(id);

  if (!modal) {
    return;
  }

  modal.classList.add("active");

  /*
   * Some admin.css implementations use display
   * rather than an active class.
   */
  modal.style.display = "flex";

  document.body.classList.add(
    "modal-open"
  );
}


function closeModal(id) {
  const modal = $a(id);

  if (!modal) {
    return;
  }

  modal.classList.remove("active");
  modal.style.display = "";

  const openModals =
    document.querySelectorAll(
      ".a-modal-overlay.active"
    );

  if (!openModals.length) {
    document.body.classList.remove(
      "modal-open"
    );
  }
}


function closeAllModals() {
  document
    .querySelectorAll(
      ".a-modal-overlay"
    )
    .forEach(modal => {
      modal.classList.remove("active");
      modal.style.display = "";
    });

  document.body.classList.remove(
    "modal-open"
  );
}


/* =========================================================
   IMAGE HELPERS
   ========================================================= */

function readImageFile(file) {
  return new Promise(
    (resolve, reject) => {
      if (!file) {
        resolve("");
        return;
      }

      if (
        !file.type ||
        !file.type.startsWith("image/")
      ) {
        reject(
          new Error(
            "Please select a valid image file."
          )
        );

        return;
      }

      if (
        file.size >
        ADMIN_MAX_IMAGE_SIZE
      ) {
        reject(
          new Error(
            "Image must be 5 MB or smaller."
          )
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        resolve(
          String(
            reader.result || ""
          )
        );
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Failed to read image."
          )
        );
      };

      reader.readAsDataURL(file);
    }
  );
}


function setupImagePreview(
  inputId,
  previewId
) {
  const input =
    $a(inputId);

  const preview =
    $a(previewId);

  if (
    !input ||
    !preview
  ) {
    return;
  }

  input.addEventListener(
    "change",
    () => {
      const file =
        input.files &&
        input.files[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        return;
      }

      if (
        file.size >
        ADMIN_MAX_IMAGE_SIZE
      ) {
        alert(
          "Image must be 5 MB or smaller."
        );

        input.value = "";
        return;
      }

      const url =
        URL.createObjectURL(file);

      preview.src = url;
      preview.style.display =
        "block";
    }
  );
}


/* =========================================================
   TRIP VEHICLE SELECT
   ========================================================= */

async function loadTripVehicleOptions(
  selectedVehicle = ""
) {
  const container =
    $a("trip-vehicle-checkboxes");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <select
      id="trip-vehicle-select"
      name="vehicle"
      style="width:100%;">
      <option value="">No vehicle selected</option>
    </select>
  `;

  const select =
    $a("trip-vehicle-select");

  try {
    const vehicles =
      await getVehicles();

    vehicles.forEach(vehicle => {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        vehicle.name || "";

      option.textContent =
        vehicle.name
          ? `${vehicle.name}${vehicle.type ? ` — ${vehicle.type}` : ""}`
          : "Unnamed vehicle";

      if (
        String(vehicle.name || "") ===
        String(selectedVehicle || "")
      ) {
        option.selected = true;
      }

      select.appendChild(
        option
      );
    });

    /*
     * Preserve a vehicle value that may no longer
     * exist in the vehicles table.
     */
    if (
      selectedVehicle &&
      !Array.from(
        select.options
      ).some(
        option =>
          option.value ===
          selectedVehicle
      )
    ) {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        selectedVehicle;

      option.textContent =
        `${selectedVehicle} (existing trip vehicle)`;

      option.selected = true;

      select.appendChild(
        option
      );
    }

  } catch (error) {
    console.warn(
      "[admin.js] Could not load trip vehicles:",
      error
    );

    if (selectedVehicle) {
      const option =
        document.createElement(
          "option"
        );

      option.value =
        selectedVehicle;

      option.textContent =
        selectedVehicle;

      option.selected = true;

      select.appendChild(
        option
      );
    }
  }
}


/* =========================================================
   TRIP MODAL
   ========================================================= */

let editingTripId =
  null;


async function openTripModal(
  tripId = null
) {
  editingTripId =
    tripId;

  const form =
    $a("trip-form");

  if (form) {
    form.reset();
  }

  clearError(
    "trip-error"
  );

  const title =
    $a("trip-modal-title");

  const preview =
    $a("trip-image-preview");

  if (preview) {
    preview.src = "";
  }

  if (title) {
    title.textContent =
      tripId
        ? "Edit Trip"
        : "Add Trip";
  }

  let trip =
    null;

  if (tripId) {
    try {
      trip =
        await getTrip(tripId);

      if (!trip) {
        throw new Error(
          "Trip not found."
        );
      }

      setFieldValue(
        "trip-name",
        trip.name
      );

      setFieldValue(
        "trip-destination",
        trip.destination
      );

      setFieldValue(
        "trip-duration",
        trip.duration
      );

      setFieldValue(
        "trip-price",
        trip.price
      );

      setFieldValue(
        "trip-description",
        trip.description
      );

      if (
        preview &&
        trip.image_url
      ) {
        preview.src =
          trip.image_url;
      }

    } catch (error) {
      showError(
        "trip-error",
        error.message
      );

      return;
    }
  }

  await loadTripVehicleOptions(
    trip
      ? trip.vehicle
      : ""
  );

  openModal(
    "trip-modal"
  );
}


async function saveTripForm() {
  const form =
    $a("trip-form");

  if (!form) {
    return;
  }

  const errorId =
    "trip-error";

  clearError(errorId);

  const name =
    getFieldValue(
      "trip-name"
    );

  const destination =
    getFieldValue(
      "trip-destination"
    );

  if (!name) {
    showError(
      errorId,
      "Please enter the trip name."
    );

    return;
  }

  if (!destination) {
    showError(
      errorId,
      "Please enter the destination."
    );

    return;
  }

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  setButtonLoading(
    submitButton,
    true,
    "Saving..."
  );

  try {
    let imageUrl = "";

    const existing =
      editingTripId
        ? await getTrip(
            editingTripId
          )
        : null;

    imageUrl =
      existing
        ? existing.image_url || ""
        : "";

    const input =
      $a("trip-image-input");

    if (
      input &&
      input.files &&
      input.files[0]
    ) {
      imageUrl =
        await readImageFile(
          input.files[0]
        );
    }

    const vehicleSelect =
      $a("trip-vehicle-select");

    const vehicle =
      vehicleSelect
        ? vehicleSelect.value.trim()
        : "";

    const saved =
      await saveTrip({
        ...(existing || {}),
        ...(editingTripId
          ? { id: editingTripId }
          : {}),

        name,
        destination,

        duration:
          getFieldValue(
            "trip-duration"
          ),

        price:
          getFieldValue(
            "trip-price"
          ),

        description:
          getFieldValue(
            "trip-description"
          ),

        image_url:
          imageUrl,

        vehicle
      });

    closeModal(
      "trip-modal"
    );

    await loadTrips();

    await loadDashboardStats();

    console.log(
      "[admin.js] Trip saved:",
      saved
    );

  } catch (error) {
    showError(
      errorId,
      error.message ||
        "Failed to save trip."
    );

  } finally {
    setButtonLoading(
      submitButton,
      false
    );
  }
}


/* =========================================================
   VEHICLE MODAL
   ========================================================= */

let editingVehicleId =
  null;


async function openVehicleModal(
  vehicleId = null
) {
  editingVehicleId =
    vehicleId;

  const form =
    $a("vehicle-form");

  if (form) {
    form.reset();
  }

  clearError(
    "vehicle-error"
  );

  const title =
    $a("vehicle-modal-title");

  const preview =
    $a("vehicle-image-preview");

  if (preview) {
    preview.src = "";
  }

  if (title) {
    title.textContent =
      vehicleId
        ? "Edit Vehicle"
        : "Add Vehicle";
  }

  if (!vehicleId) {
    setFieldValue(
      "vehicle-available",
      "true"
    );

    openModal(
      "vehicle-modal"
    );

    return;
  }

  try {
    const vehicle =
      await getVehicle(
        vehicleId
      );

    if (!vehicle) {
      throw new Error(
        "Vehicle not found."
      );
    }

    setFieldValue(
      "vehicle-name",
      vehicle.name
    );

    setFieldValue(
      "vehicle-type",
      vehicle.type
    );

    setFieldValue(
      "vehicle-capacity",
      vehicle.capacity
    );

    setFieldValue(
      "vehicle-registration",
      vehicle.registration
    );

    setFieldValue(
      "vehicle-available",
      String(
        vehicle.available
      )
    );

    if (
      preview &&
      vehicle.image_url
    ) {
      preview.src =
        vehicle.image_url;
    }

    openModal(
      "vehicle-modal"
    );

  } catch (error) {
    showError(
      "vehicle-error",
      error.message
    );
  }
}


async function saveVehicleForm() {
  const form =
    $a("vehicle-form");

  if (!form) {
    return;
  }

  clearError(
    "vehicle-error"
  );

  const name =
    getFieldValue(
      "vehicle-name"
    );

  if (!name) {
    showError(
      "vehicle-error",
      "Please enter the vehicle name."
    );

    return;
  }

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  setButtonLoading(
    submitButton,
    true,
    "Saving..."
  );

  try {
    const existing =
      editingVehicleId
        ? await getVehicle(
            editingVehicleId
          )
        : null;

    let imageUrl =
      existing
        ? existing.image_url || ""
        : "";

    const input =
      $a("vehicle-image-input");

    if (
      input &&
      input.files &&
      input.files[0]
    ) {
      imageUrl =
        await readImageFile(
          input.files[0]
        );
    }

    const capacityText =
      getFieldValue(
        "vehicle-capacity"
      );

    const saved =
      await saveVehicle({
        ...(existing || {}),
        ...(editingVehicleId
          ? { id: editingVehicleId }
          : {}),

        name,

        type:
          getFieldValue(
            "vehicle-type"
          ),

        capacity:
          capacityText,

        registration:
          getFieldValue(
            "vehicle-registration"
          ),

        image_url:
          imageUrl,

        available:
          getFieldValue(
            "vehicle-available"
          ) === "true"
      });

    closeModal(
      "vehicle-modal"
    );

    await loadVehicles();
    await loadDashboardStats();

    console.log(
      "[admin.js] Vehicle saved:",
      saved
    );

  } catch (error) {
    showError(
      "vehicle-error",
      error.message ||
        "Failed to save vehicle."
    );

  } finally {
    setButtonLoading(
      submitButton,
      false
    );
  }
}


/* =========================================================
   GALLERY
   ========================================================= */

async function saveGalleryForm() {
  const form =
    $a("gallery-add-form");

  if (!form) {
    return;
  }

  const input =
    $a("g-image");

  clearInlineGalleryMessage();

  if (
    !input ||
    !input.files ||
    !input.files[0]
  ) {
    showGalleryMessage(
      "Please select an image.",
      "error"
    );

    return;
  }

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  setButtonLoading(
    submitButton,
    true,
    "Adding..."
  );

  try {
    const imageUrl =
      await readImageFile(
        input.files[0]
      );

    const saved =
      await saveGallery({
        title:
          getFieldValue(
            "g-caption"
          ),

        description:
          getFieldValue(
            "g-description"
          ),

        media_url:
          imageUrl,

        media_type:
          "image",

        /*
         * Admin-added images are immediately
         * visible on the public website.
         */
        approved:
          true
      });

    form.reset();

    await loadGallery();

    await loadDashboardStats();

    showGalleryMessage(
      "Image added successfully.",
      "success"
    );

    console.log(
      "[admin.js] Gallery saved:",
      saved
    );

  } catch (error) {
    showGalleryMessage(
      error.message ||
        "Failed to add image.",
      "error"
    );

  } finally {
    setButtonLoading(
      submitButton,
      false
    );
  }
}


function showGalleryMessage(
  message,
  type
) {
  const form =
    $a("gallery-add-form");

  if (!form) {
    return;
  }

  let box =
    $a("gallery-form-message");

  if (!box) {
    box =
      document.createElement(
        "p"
      );

    box.id =
      "gallery-form-message";

    form.appendChild(box);
  }

  box.className =
    `a-msg ${type || "error"}`;

  box.textContent =
    message;

  box.style.display =
    "block";
}


function clearInlineGalleryMessage() {
  const box =
    $a("gallery-form-message");

  if (box) {
    box.textContent = "";
    box.style.display =
      "none";
  }
}


/* =========================================================
   VIDEO MODAL
   ========================================================= */

let editingVideoId =
  null;


async function openVideoModal(
  videoId = null
) {
  editingVideoId =
    videoId;

  const form =
    $a("video-form");

  if (form) {
    form.reset();
  }

  clearError(
    "video-error"
  );

  const title =
    $a("video-modal-title");

  if (title) {
    title.textContent =
      videoId
        ? "Edit Video"
        : "Add Video";
  }

  if (videoId) {
    try {
      const videos =
        await getVideos();

      const video =
        videos.find(
          item =>
            String(item.id) ===
            String(videoId)
        );

      if (!video) {
        throw new Error(
          "Video not found."
        );
      }

      setFieldValue(
        "video-title",
        video.title
      );

      setFieldValue(
        "video-description",
        video.description
      );

      setFieldValue(
        "video-youtube",
        video.youtube_id
      );

    } catch (error) {
      showError(
        "video-error",
        error.message
      );

      return;
    }
  }

  openModal(
    "video-modal"
  );
}


async function saveVideoForm() {
  const form =
    $a("video-form");

  if (!form) {
    return;
  }

  clearError(
    "video-error"
  );

  const title =
    getFieldValue(
      "video-title"
    );

  if (!title) {
    showError(
      "video-error",
      "Please enter the video title."
    );

    return;
  }

  const youtube =
    normalizeYouTubeId(
      getFieldValue(
        "video-youtube"
      )
    );

  if (!youtube) {
    showError(
      "video-error",
      "Please enter a YouTube ID or URL."
    );

    return;
  }

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  setButtonLoading(
    submitButton,
    true,
    "Saving..."
  );

  try {
    let existing =
      null;

    if (editingVideoId) {
      const videos =
        await getVideos();

      existing =
        videos.find(
          item =>
            String(item.id) ===
            String(editingVideoId)
        ) || null;
    }

    await saveVideo({
      ...(existing || {}),

      ...(editingVideoId
        ? { id: editingVideoId }
        : {}),

      title,

      description:
        getFieldValue(
          "video-description"
        ),

      youtube_id:
        youtube
    });

    closeModal(
      "video-modal"
    );

    await loadVideos();
    await loadDashboardStats();

  } catch (error) {
    showError(
      "video-error",
      error.message ||
        "Failed to save video."
    );

  } finally {
    setButtonLoading(
      submitButton,
      false
    );
  }
}


/* =========================================================
   REVIEW MODAL
   ========================================================= */

let editingReviewId =
  null;


async function openReviewModal(
  reviewId = null
) {
  editingReviewId =
    reviewId;

  const form =
    $a("review-form-admin");

  if (form) {
    form.reset();
  }

  clearError(
    "review-error"
  );

  const title =
    $a("review-modal-title");

  if (title) {
    title.textContent =
      reviewId
        ? "Edit Review"
        : "Add Review";
  }

  /*
   * Default for admin-created review:
   * approved.
   */
  setFieldValue(
    "review-approved",
    "true"
  );

  if (reviewId) {
    try {
      const reviews =
        await getAllReviews();

      const review =
        reviews.find(
          item =>
            String(item.id) ===
            String(reviewId)
        );

      if (!review) {
        throw new Error(
          "Review not found."
        );
      }

      setFieldValue(
        "review-name",
        review.name
      );

      setFieldValue(
        "review-rating",
        review.rating
      );

      setFieldValue(
        "review-text",
        review.comment
      );

      setFieldValue(
        "review-approved",
        String(
          review.approved
        )
      );

    } catch (error) {
      showError(
        "review-error",
        error.message
      );

      return;
    }
  }

  openModal(
    "review-modal"
  );
}


async function saveReviewForm() {
  const form =
    $a("review-form-admin");

  if (!form) {
    return;
  }

  clearError(
    "review-error"
  );

  const name =
    getFieldValue(
      "review-name"
    );

  const reviewText =
    getFieldValue(
      "review-text"
    );

  if (!name) {
    showError(
      "review-error",
      "Please enter the customer name."
    );

    return;
  }

  if (!reviewText) {
    showError(
      "review-error",
      "Please enter the review."
    );

    return;
  }

  const requestedApproved =
    getFieldValue(
      "review-approved"
    ) === "true";

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  setButtonLoading(
    submitButton,
    true,
    "Saving..."
  );

  try {
    let existing =
      null;

    if (editingReviewId) {
      const reviews =
        await getAllReviews();

      existing =
        reviews.find(
          item =>
            String(item.id) ===
            String(editingReviewId)
        ) || null;
    }

    /*
     * Existing review can be updated directly.
     */
    if (editingReviewId) {
      await saveReview({
        ...(existing || {}),
        id:
          editingReviewId,

        name,

        rating:
          Number(
            getFieldValue(
              "review-rating"
            )
          ) || 0,

        comment:
          reviewText,

        approved:
          requestedApproved
      });

    } else {
      /*
       * New review is deliberately inserted as
       * unapproved by data.js for RLS safety.
       */
      const created =
        await saveReview({
          name,

          rating:
            Number(
              getFieldValue(
                "review-rating"
              )
            ) || 0,

          comment:
            reviewText
        });

      /*
       * If admin selected Approved = Yes,
       * approve it after creation.
       */
      if (
        requestedApproved &&
        created &&
        created.id
      ) {
        await approveReview(
          created.id
        );
      }
    }

    closeModal(
      "review-modal"
    );

    await loadReviews();
    await loadDashboardStats();

  } catch (error) {
    showError(
      "review-error",
      error.message ||
        "Failed to save review."
    );

  } finally {
    setButtonLoading(
      submitButton,
      false
    );
  }
}


/* =========================================================
   DASHBOARD STATS
   ========================================================= */

async function loadDashboardStats() {
  try {
    const [
      trips,
      vehicles,
      gallery,
      videos,
      reviews,
      enquiries
    ] = await Promise.all([
      getTrips(),
      getVehicles(),
      getAllGallery(),
      getVideos(),
      getAllReviews(),
      getEnquiries()
    ]);

    const values = {
      "stat-trips":
        trips.length,

      "stat-vehicles":
        vehicles.length,

      "stat-gallery":
        gallery.length,

      "stat-videos":
        videos.length,

      "stat-reviews":
        reviews.length,

      "stat-enquiries":
        enquiries.length
    };

    Object.entries(values)
      .forEach(
        ([id, value]) => {
          const el =
            $a(id);

          if (el) {
            el.textContent =
              String(value);
          }
        }
      );

    renderRecentEnquiries(
      enquiries.slice(0, 5)
    );

    renderRecentReviews(
      reviews.slice(0, 5)
    );

    renderRecentTrips(
      trips.slice(0, 5)
    );

  } catch (error) {
    console.error(
      "[admin.js] Dashboard stats failed:",
      error
    );
  }
}


function renderRecentEnquiries(
  enquiries
) {
  const container =
    $a("recent-enquiries");

  if (!container) {
    return;
  }

  if (!enquiries.length) {
    container.innerHTML =
      `<p class="a-item-meta">No enquiries yet.</p>`;

    return;
  }

  container.innerHTML =
    enquiries
      .map(
        item => `
          <div class="a-list-row">
            <div>
              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <div class="a-item-meta">
                ${escapeHTML(item.phone)}
                ${item.trip
                  ? ` • ${escapeHTML(item.trip)}`
                  : ""}
              </div>
            </div>

            <span class="a-item-meta">
              ${escapeHTML(item.status)}
            </span>
          </div>
        `
      )
      .join("");
}


function renderRecentReviews(
  reviews
) {
  const container =
    $a("recent-reviews");

  if (!container) {
    return;
  }

  if (!reviews.length) {
    container.innerHTML =
      `<p class="a-item-meta">No reviews yet.</p>`;

    return;
  }

  container.innerHTML =
    reviews
      .map(
        item => `
          <div class="a-list-row">
            <div>
              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <div>
                ${"★".repeat(
                  Math.max(
                    0,
                    Math.min(
                      5,
                      Number(
                        item.rating
                      ) || 0
                    )
                  )
                )}
              </div>
            </div>

            <span class="a-item-meta">
              ${
                item.approved
                  ? "Approved"
                  : "Pending"
              }
            </span>
          </div>
        `
      )
      .join("");
}


function renderRecentTrips(
  trips
) {
  const container =
    $a("recent-trips");

  if (!container) {
    return;
  }

  if (!trips.length) {
    container.innerHTML =
      `<p class="a-item-meta">No trips yet.</p>`;

    return;
  }

  container.innerHTML =
    trips
      .map(
        item => `
          <div class="a-list-row">
            <div>
              <strong>
                ${escapeHTML(item.name)}
              </strong>

              <div class="a-item-meta">
                ${escapeHTML(
                  item.destination
                )}
              </div>
            </div>

            <span class="a-item-meta">
              ${escapeHTML(
                item.price
              )}
            </span>
          </div>
        `
      )
      .join("");
}


/* =========================================================
   TRIPS LIST
   ========================================================= */

let cachedTrips =
  [];


async function loadTrips() {
  const container =
    $a("trips-list");

  if (!container) {
    return;
  }

  container.innerHTML =
    `<p class="a-item-meta">Loading trips...</p>`;

  try {
    cachedTrips =
      await getTrips();

    renderTrips(
      cachedTrips
    );

  } catch (error) {
    container.innerHTML =
      `<p class="a-msg error">
        ${escapeHTML(
          error.message
        )}
      </p>`;
  }
}


function renderTrips(
  trips
) {
  const container =
    $a("trips-list");

  if (!container) {
    return;
  }

  if (!trips.length) {
    container.innerHTML =
      `<p class="a-item-meta">No trips found.</p>`;

    return;
  }

  container.innerHTML =
    trips
      .map(
        trip => `
          <div class="a-item-card">
            <div class="a-item-main">

              ${
                trip.image_url
                  ? `
                    <img
                      src="${escapeHTML(
                        trip.image_url
                      )}"
                      alt="${escapeHTML(
                        trip.name
                      )}"
                      style="width:90px;height:65px;object-fit:cover;border-radius:8px;">
                  `
                  : ""
              }

              <div>
                <h3>
                  ${escapeHTML(
                    trip.name
                  )}
                </h3>

                <div class="a-item-meta">
                  ${escapeHTML(
                    trip.destination
                  )}
                </div>

                <div class="a-item-meta">
                  ${
                    trip.duration
                      ? escapeHTML(
                          trip.duration
                        )
                      : ""
                  }

                  ${
                    trip.price
                      ? ` • ${escapeHTML(
                          trip.price
                        )}`
                      : ""
                  }

                  ${
                    trip.vehicle
                      ? ` • ${escapeHTML(
                          trip.vehicle
                        )}`
                      : ""
                  }
                </div>
              </div>

            </div>

            <div class="a-item-actions">

              ${actionButton(
                "Edit",
                "edit-trip",
                trip.id
              )}

              ${actionButton(
                "Delete",
                "delete-trip",
                trip.id,
                "a-btn a-btn-danger a-btn-small"
              )}

            </div>
          </div>
        `
      )
      .join("");
}


/* =========================================================
   VEHICLES LIST
   ========================================================= */

async function loadVehicles() {
  const container =
    $a("vehicles-list");

  if (!container) {
    return;
  }

  container.innerHTML =
    `<p class="a-item-meta">Loading vehicles...</p>`;

  try {
    const vehicles =
      await getVehicles();

    if (!vehicles.length) {
      container.innerHTML =
        `<p class="a-item-meta">No vehicles found.</p>`;

      return;
    }

    container.innerHTML =
      vehicles
        .map(
          vehicle => `
            <div class="a-item-card">

              <div class="a-item-main">

                ${
                  vehicle.image_url
                    ? `
                      <img
                        src="${escapeHTML(
                          vehicle.image_url
                        )}"
                        alt="${escapeHTML(
                          vehicle.name
                        )}"
                        style="width:90px;height:65px;object-fit:cover;border-radius:8px;">
                    `
                    : ""
                }

                <div>
                  <h3>
                    ${escapeHTML(
                      vehicle.name
                    )}
                  </h3>

                  <div class="a-item-meta">
                    ${escapeHTML(
                      vehicle.type
                    )}

                    ${
                      vehicle.capacity !==
                        "" &&
                      vehicle.capacity !==
                        null
                        ? ` • ${escapeHTML(
                            vehicle.capacity
                          )} seats`
                        : ""
                    }
                  </div>

                  ${
                    vehicle.registration
                      ? `
                        <div class="a-item-meta">
                          ${escapeHTML(
                            vehicle.registration
                          )}
                        </div>
                      `
                      : ""
                  }

                  <div class="a-item-meta">
                    ${
                      vehicle.available
                        ? "Available"
                        : "Unavailable"
                    }
                  </div>
                </div>

              </div>

              <div class="a-item-actions">

                ${actionButton(
                  "Edit",
                  "edit-vehicle",
                  vehicle.id
                )}

                ${actionButton(
                  "Delete",
                  "delete-vehicle",
                  vehicle.id,
                  "a-btn a-btn-danger a-btn-small"
                )}

              </div>

            </div>
          `
        )
        .join("");

  } catch (error) {
    container.innerHTML =
      `<p class="a-msg error">
        ${escapeHTML(
          error.message
        )}
      </p>`;
  }
}


/* =========================================================
   GALLERY LIST
   ========================================================= */

async function loadGallery() {
  const container =
    $a("gallery-list");

  if (!container) {
    return;
  }

  container.innerHTML =
    `<p class="a-item-meta">Loading gallery...</p>`;

  try {
    /*
     * Admin must see both approved and pending.
     */
    const gallery =
      await getAllGallery();

    if (!gallery.length) {
      container.innerHTML =
        `<p class="a-item-meta">No gallery items found.</p>`;

      return;
    }

    container.innerHTML =
      gallery
        .map(
          item => `
            <div class="a-item-card">

              <div class="a-item-main">

                ${
                  item.media_url
                    ? `
                      <img
                        src="${escapeHTML(
                          item.media_url
                        )}"
                        alt="${escapeHTML(
                          item.title
                        )}"
                        style="width:90px;height:65px;object-fit:cover;border-radius:8px;">
                    `
                    : ""
                }

                <div>
                  <h3>
                    ${escapeHTML(
                      item.title ||
                      "Untitled"
                    )}
                  </h3>

                  ${
                    item.description
                      ? `
                        <div class="a-item-meta">
                          ${escapeHTML(
                            item.description
                          )}
                        </div>
                      `
                      : ""
                  }

                  <div class="a-item-meta">
                    ${
                      item.approved
                        ? "Approved / Public"
                        : "Pending / Hidden"
                    }
                  </div>
                </div>

              </div>

              <div class="a-item-actions">

                ${actionButton(
                  item.approved
                    ? "Hide"
                    : "Approve",
                  "toggle-gallery",
                  item.id
                )}

                ${actionButton(
                  "Delete",
                  "delete-gallery",
                  item.id,
                  "a-btn a-btn-danger a-btn-small"
                )}

              </div>

            </div>
          `
        )
        .join("");

  } catch (error) {
    container.innerHTML =
      `<p class="a-msg error">
        ${escapeHTML(
          error.message
        )}
      </p>`;
  }
}


/* =========================================================
   VIDEOS LIST
   ========================================================= */

async function loadVideos() {
  const container =
    $a("videos-list");

  if (!container) {
    return;
  }

  container.innerHTML =
    `<p class="a-item-meta">Loading videos...</p>`;

  try {
    const videos =
      await getVideos();

    if (!videos.length) {
      container.innerHTML =
        `<p class="a-item-meta">No videos found.</p>`;

      return;
    }

    container.innerHTML =
      videos
        .map(
          video => `
            <div class="a-item-card">

              <div class="a-item-main">
                <div>
                  <h3>
                    ${escapeHTML(
                      video.title
                    )}
                  </h3>

                  ${
                    video.description
                      ? `
                        <div class="a-item-meta">
                          ${escapeHTML(
                            video.description
                          )}
                        </div>
                      `
                      : ""
                  }

                  <div class="a-item-meta">
                    YouTube ID:
                    ${escapeHTML(
                      video.youtube_id
                    )}
                  </div>
                </div>
              </div>

              <div class="a-item-actions">

                ${actionButton(
                  "Edit",
                  "edit-video",
                  video.id
                )}

                ${actionButton(
                  "Delete",
                  "delete-video",
                  video.id,
                  "a-btn a-btn-danger a-btn-small"
                )}

              </div>

            </div>
          `
        )
        .join("");

  } catch (error) {
    container.innerHTML =
      `<p class="a-msg error">
        ${escapeHTML(
          error.message
        )}
      </p>`;
  }
}


/* =========================================================
   REVIEWS LIST
   ========================================================= */

async function loadReviews() {
  const container =
    $a("reviews-list");

  if (!container) {
    return;
  }

  container.innerHTML =
    `<p class="a-item-meta">Loading reviews...</p>`;

  try {
    /*
     * Admin must see approved and pending reviews.
     */
    const reviews =
      await getAllReviews();

    if (!reviews.length) {
      container.innerHTML =
        `<p class="a-item-meta">No reviews found.</p>`;

      return;
    }

    container.innerHTML =
      reviews
        .map(
          review => `
            <div class="a-item-card">

              <div class="a-item-main">
                <div>

                  <h3>
                    ${escapeHTML(
                      review.name
                    )}
                  </h3>

                  <div>
                    ${"★".repeat(
                      Math.max(
                        0,
                        Math.min(
                          5,
                          Number(
                            review.rating
                          ) || 0
                        )
                      )
                    )}
                  </div>

                  <div class="a-item-meta">
                    ${escapeHTML(
                      review.comment
                    )}
                  </div>

                  <div class="a-item-meta">
                    ${
                      review.approved
                        ? "Approved / Public"
                        : "Pending / Hidden"
                    }
                  </div>

                  ${
                    review.created_at
                      ? `
                        <div class="a-item-meta">
                          ${escapeHTML(
                            formatDate(
                              review.created_at
                            )
                          )}
                        </div>
                      `
                      : ""
                  }

                </div>
              </div>

              <div class="a-item-actions">

                ${actionButton(
                  "Edit",
                  "edit-review",
                  review.id
                )}

                ${actionButton(
                  review.approved
                    ? "Reject"
                    : "Approve",
                  "toggle-review",
                  review.id
                )}

                ${actionButton(
                  "Delete",
                  "delete-review",
                  review.id,
                  "a-btn a-btn-danger a-btn-small"
                )}

              </div>

            </div>
          `
        )
        .join("");

  } catch (error) {
    container.innerHTML =
      `<p class="a-msg error">
        ${escapeHTML(
          error.message
        )}
      </p>`;
  }
}


/* =========================================================
   ENQUIRIES LIST
   ========================================================= */

let cachedEnquiries =
  [];


async function loadEnquiries() {
  const container =
    $a("enquiries-list");

  if (!container) {
    return;
  }

  container.innerHTML =
    `<p class="a-item-meta">Loading enquiries...</p>`;

  try {
    cachedEnquiries =
      await getEnquiries();

    renderEnquiries(
      cachedEnquiries
    );

  } catch (error) {
    container.innerHTML =
      `<p class="a-msg error">
        ${escapeHTML(
          error.message
        )}
      </p>`;
  }
}


function renderEnquiries(
  enquiries
) {
  const container =
    $a("enquiries-list");

  if (!container) {
    return;
  }

  const filter =
    getFieldValue(
      "enquiry-filter"
    ).toLowerCase();

  const filtered =
    filter
      ? enquiries.filter(
          item =>
            String(
              item.status || ""
            ).toLowerCase() ===
            filter
        )
      : enquiries;

  if (!filtered.length) {
    container.innerHTML =
      `<p class="a-item-meta">No enquiries found.</p>`;

    return;
  }

  container.innerHTML =
    filtered
      .map(
        enquiry => `
          <div class="a-item-card">

            <div class="a-item-main">
              <div>

                <h3>
                  ${escapeHTML(
                    enquiry.name
                  )}
                </h3>

                <div class="a-item-meta">
                  Phone:
                  ${escapeHTML(
                    enquiry.phone
                  )}
                </div>

                ${
                  enquiry.trip
                    ? `
                      <div class="a-item-meta">
                        Trip:
                        ${escapeHTML(
                          enquiry.trip
                        )}
                      </div>
                    `
                    : ""
                }

                ${
                  enquiry.message
                    ? `
                      <div class="a-item-meta">
                        ${escapeHTML(
                          enquiry.message
                        )}
                      </div>
                    `
                    : ""
                }

                ${
                  enquiry.created_at
                    ? `
                      <div class="a-item-meta">
                        ${escapeHTML(
                          formatDate(
                            enquiry.created_at
                          )
                        )}
                      </div>
                    `
                    : ""
                }

              </div>
            </div>

            <div class="a-item-actions">

              <select
                class="enquiry-status-select"
                data-enquiry-id="${escapeHTML(
                  enquiry.id
                )}">

                ${[
                  "new",
                  "contacted",
                  "confirmed",
                  "closed"
                ]
                  .map(
                    status => `
                      <option
                        value="${status}"
                        ${
                          String(
                            enquiry.status ||
                              "new"
                          ).toLowerCase() ===
                          status
                            ? "selected"
                            : ""
                        }>
                        ${status.charAt(0).toUpperCase() +
                          status.slice(1)}
                      </option>
                    `
                  )
                  .join("")}

              </select>

              ${actionButton(
                "Delete",
                "delete-enquiry",
                enquiry.id,
                "a-btn a-btn-danger a-btn-small"
              )}

            </div>

          </div>
        `
      )
      .join("");
}


/* =========================================================
   SETTINGS
   ========================================================= */

async function loadSettings() {
  try {
    const settings =
      await getSettings();

    if (!settings) {
      return;
    }

    setFieldValue(
      "settings-phone",
      settings.phone
    );

    setFieldValue(
      "settings-whatsapp",
      settings.whatsapp
    );

    setFieldValue(
      "settings-email",
      settings.email
    );

    setFieldValue(
      "settings-address",
      settings.address
    );

    setFieldValue(
      "settings-hours",
      settings.hours
    );

    setFieldValue(
      "settings-map",
      settings.map_url
    );

    setFieldValue(
      "settings-facebook",
      settings.facebook
    );

    setFieldValue(
      "settings-instagram",
      settings.instagram
    );

    setFieldValue(
      "settings-youtube",
      settings.youtube
    );

    setFieldValue(
      "settings-about",
      settings.about_text ||
      settings.description
    );

    setFieldValue(
      "settings-footer",
      settings.footer_text
    );

  } catch (error) {
    console.error(
      "[admin.js] Settings load failed:",
      error
    );
  }
}


async function saveSettingsForm() {
  const form =
    $a("settings-form");

  if (!form) {
    return;
  }

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  setButtonLoading(
    submitButton,
    true,
    "Saving..."
  );

  try {
    /*
     * IMPORTANT:
     * Load existing settings first so business_name,
     * description and other fields not shown in the
     * dashboard are preserved.
     */
    const existing =
      await getSettings();

    const settings = {
      ...(existing || {}),

      phone:
        getFieldValue(
          "settings-phone"
        ),

      whatsapp:
        getFieldValue(
          "settings-whatsapp"
        ),

      email:
        getFieldValue(
          "settings-email"
        ),

      address:
        getFieldValue(
          "settings-address"
        ),

      hours:
        getFieldValue(
          "settings-hours"
        ),

      map_url:
        getFieldValue(
          "settings-map"
        ),

      facebook:
        getFieldValue(
          "settings-facebook"
        ),

      instagram:
        getFieldValue(
          "settings-instagram"
        ),

      youtube:
        getFieldValue(
          "settings-youtube"
        ),

      about_text:
        getFieldValue(
          "settings-about"
        ),

      footer_text:
        getFieldValue(
          "settings-footer"
        )
    };

    await saveSettings(
      settings
    );

    alert(
      "Settings saved successfully."
    );

    await refreshBusinessCache();

  } catch (error) {
    alert(
      error.message ||
        "Failed to save settings."
    );

  } finally {
    setButtonLoading(
      submitButton,
      false
    );
  }
}


/* =========================================================
   CHANGE PASSWORD
   ========================================================= */

async function changeAdminPassword(
  event
) {
  event.preventDefault();

  const form =
    event.currentTarget;

  const errorBox =
    $a("change-password-error");

  const successBox =
    $a(
      "change-password-success"
    );

  if (errorBox) {
    errorBox.textContent = "";
    errorBox.style.display =
      "none";
  }

  if (successBox) {
    successBox.textContent = "";
    successBox.style.display =
      "none";
  }

  const currentPassword =
    getFieldValue(
      "current-admin-password"
    );

  const newPassword =
    getFieldValue(
      "new-admin-password"
    );

  const confirmPassword =
    getFieldValue(
      "confirm-admin-password"
    );

  if (!currentPassword) {
    showError(
      "change-password-error",
      "Enter your current password."
    );

    return;
  }

  if (
    newPassword.length < 8
  ) {
    showError(
      "change-password-error",
      "New password must contain at least 8 characters."
    );

    return;
  }

  if (
    newPassword !==
    confirmPassword
  ) {
    showError(
      "change-password-error",
      "New passwords do not match."
    );

    return;
  }

  const button =
    form.querySelector(
      'button[type="submit"]'
    );

  setButtonLoading(
    button,
    true,
    "Changing..."
  );

  try {
    const db =
      authClient();

    /*
     * Re-authenticate using the current password.
     */
    const session =
      await db.auth.getSession();

    const email =
      session &&
      session.data &&
      session.data.session &&
      session.data.session.user
        ? session.data.session.user.email
        : "";

    if (!email) {
      throw new Error(
        "Your admin session has expired. Please login again."
      );
    }

    const {
      error: loginError
    } =
      await db.auth.signInWithPassword({
        email,
        password:
          currentPassword
      });

    if (loginError) {
      throw loginError;
    }

    const {
      error
    } =
      await db.auth.updateUser({
        password:
          newPassword
      });

    if (error) {
      throw error;
    }

    form.reset();

    if (successBox) {
      successBox.textContent =
        "Password changed successfully.";

      successBox.style.display =
        "block";
    }

  } catch (error) {
    showError(
      "change-password-error",
      error.message ||
        "Failed to change password."
    );

  } finally {
    setButtonLoading(
      button,
      false
    );
  }
}


/* =========================================================
   PANEL LOADERS
   ========================================================= */

const PANEL_LOADERS = {
  dashboard:
    loadDashboardStats,

  trips:
    loadTrips,

  vehicles:
    loadVehicles,

  gallery:
    loadGallery,

  videos:
    loadVideos,

  reviews:
    loadReviews,

  enquiries:
    loadEnquiries,

  settings:
    loadSettings
};


/* =========================================================
   DELETE / TOGGLE ACTIONS
   ========================================================= */

async function handleAdminAction(
  action,
  id
) {
  if (!action) {
    return;
  }

  switch (action) {

    case "edit-trip":
      await openTripModal(id);
      break;


    case "delete-trip":
      if (
        !confirm(
          "Delete this trip?"
        )
      ) {
        return;
      }

      await deleteTrip(id);
      await loadTrips();
      await loadDashboardStats();
      break;


    case "edit-vehicle":
      await openVehicleModal(id);
      break;


    case "delete-vehicle":
      if (
        !confirm(
          "Delete this vehicle?"
        )
      ) {
        return;
      }

      await deleteVehicle(id);
      await loadVehicles();
      await loadDashboardStats();
      break;


    case "toggle-gallery": {
      const gallery =
        await getAllGallery();

      const item =
        gallery.find(
          entry =>
            String(entry.id) ===
            String(id)
        );

      if (!item) {
        throw new Error(
          "Gallery item not found."
        );
      }

      await saveGallery({
        ...item,
        approved:
          !item.approved
      });

      await loadGallery();
      await loadDashboardStats();

      break;
    }


    case "delete-gallery":
      if (
        !confirm(
          "Delete this gallery item?"
        )
      ) {
        return;
      }

      await deleteGallery(id);
      await loadGallery();
      await loadDashboardStats();
      break;


    case "edit-video":
      await openVideoModal(id);
      break;


    case "delete-video":
      if (
        !confirm(
          "Delete this video?"
        )
      ) {
        return;
      }

      await deleteVideo(id);
      await loadVideos();
      await loadDashboardStats();
      break;


    case "edit-review":
      await openReviewModal(id);
      break;


    case "toggle-review": {
      const reviews =
        await getAllReviews();

      const review =
        reviews.find(
          entry =>
            String(entry.id) ===
            String(id)
        );

      if (!review) {
        throw new Error(
          "Review not found."
        );
      }

      if (review.approved) {
        await rejectReview(id);
      } else {
        await approveReview(id);
      }

      await loadReviews();
      await loadDashboardStats();

      break;
    }


    case "delete-review":
      if (
        !confirm(
          "Delete this review?"
        )
      ) {
        return;
      }

      await deleteReview(id);
      await loadReviews();
      await loadDashboardStats();
      break;


    case "delete-enquiry":
      if (
        !confirm(
          "Delete this enquiry?"
        )
      ) {
        return;
      }

      await deleteEnquiry(id);
      await loadEnquiries();
      await loadDashboardStats();
      break;

  }
}


/* =========================================================
   EVENT HANDLERS
   ========================================================= */

function bindNavigation() {
  document.addEventListener(
    "click",
    event => {
      const link =
        event.target.closest(
          "[data-panel]"
        );

      if (!link) {
        return;
      }

      event.preventDefault();

      showPanel(
        link.dataset.panel
      );
    }
  );
}


function bindLogout() {
  document.addEventListener(
    "click",
    event => {
      const button =
        event.target.closest(
          ".a-logout-btn, #logout-btn, [data-logout]"
        );

      if (!button) {
        return;
      }

      event.preventDefault();

      adminLogout();
    }
  );
}


function bindQuickActions() {
  document.addEventListener(
    "click",
    event => {
      const button =
        event.target.closest(
          "[data-quick]"
        );

      if (!button) {
        return;
      }

      const type =
        button.dataset.quick;

      switch (type) {
        case "trip":
          openTripModal();
          break;

        case "vehicle":
          openVehicleModal();
          break;

        case "gallery":
          showPanel(
            "gallery"
          );

          setTimeout(
            () => {
              const input =
                $a("g-image");

              if (input) {
                input.focus();
              }
            },
            100
          );

          break;

        case "video":
          openVideoModal();
          break;

        case "review":
          openReviewModal();
          break;
      }
    }
  );
}


function bindActionButtons() {
  document.addEventListener(
    "click",
    async event => {
      const button =
        event.target.closest(
          "[data-action]"
        );

      if (!button) {
        return;
      }

      event.preventDefault();

      const action =
        button.dataset.action;

      const id =
        button.dataset.id;

      if (!action) {
        return;
      }

      try {
        button.disabled =
          true;

        await handleAdminAction(
          action,
          id
        );

      } catch (error) {
        console.error(
          "[admin.js] Action failed:",
          error
        );

        alert(
          error.message ||
            "Action failed."
        );

      } finally {
        button.disabled =
          false;
      }
    }
  );
}


function bindModalClose() {
  document.addEventListener(
    "click",
    event => {
      const closeButton =
        event.target.closest(
          "[data-close]"
        );

      if (!closeButton) {
        return;
      }

      event.preventDefault();

      closeModal(
        closeButton.dataset.close
      );
    }
  );


  document.addEventListener(
    "click",
    event => {
      if (
        event.target.classList.contains(
          "a-modal-overlay"
        )
      ) {
        closeModal(
          event.target.id
        );
      }
    }
  );


  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key !== "Escape"
      ) {
        return;
      }

      closeAllModals();
    }
  );
}


function bindForms() {
  const tripForm =
    $a("trip-form");

  if (tripForm) {
    tripForm.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        saveTripForm()
          .catch(error => {
            console.error(
              "[admin.js] Trip form error:",
              error
            );
          });
      }
    );
  }


  const vehicleForm =
    $a("vehicle-form");

  if (vehicleForm) {
    vehicleForm.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        saveVehicleForm()
          .catch(error => {
            console.error(
              "[admin.js] Vehicle form error:",
              error
            );
          });
      }
    );
  }


  const galleryForm =
    $a("gallery-add-form");

  if (galleryForm) {
    galleryForm.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        saveGalleryForm()
          .catch(error => {
            console.error(
              "[admin.js] Gallery form error:",
              error
            );
          });
      }
    );
  }


  const videoForm =
    $a("video-form");

  if (videoForm) {
    videoForm.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        saveVideoForm()
          .catch(error => {
            console.error(
              "[admin.js] Video form error:",
              error
            );
          });
      }
    );
  }


  const reviewForm =
    $a("review-form-admin");

  if (reviewForm) {
    reviewForm.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        saveReviewForm()
          .catch(error => {
            console.error(
              "[admin.js] Review form error:",
              error
            );
          });
      }
    );
  }


  const settingsForm =
    $a("settings-form");

  if (settingsForm) {
    settingsForm.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        saveSettingsForm()
          .catch(error => {
            console.error(
              "[admin.js] Settings form error:",
              error
            );
          });
      }
    );
  }


  const passwordForm =
    $a("change-password-form");

  if (passwordForm) {
    passwordForm.addEventListener(
      "submit",
      changeAdminPassword
    );
  }


  const enquiryFilter =
    $a("enquiry-filter");

  if (enquiryFilter) {
    enquiryFilter.addEventListener(
      "change",
      () => {
        renderEnquiries(
          cachedEnquiries
        );
      }
    );
  }


  const search =
    $a("trip-search");

  if (search) {
    search.addEventListener(
      "input",
      () => {
        const query =
          search.value
            .trim()
            .toLowerCase();

        const filtered =
          cachedTrips.filter(
            trip =>
              [
                trip.name,
                trip.destination,
                trip.description,
                trip.vehicle,
                trip.price
              ]
                .join(" ")
                .toLowerCase()
                .includes(query)
          );

        renderTrips(
          filtered
        );
      }
    );
  }
}


function bindAddButtons() {
  const addTrip =
    $a("add-trip-btn");

  if (addTrip) {
    addTrip.addEventListener(
      "click",
      () => openTripModal()
    );
  }


  const addVehicle =
    $a("add-vehicle-btn");

  if (addVehicle) {
    addVehicle.addEventListener(
      "click",
      () => openVehicleModal()
    );
  }


  const addVideo =
    $a("add-video-btn");

  if (addVideo) {
    addVideo.addEventListener(
      "click",
      () => openVideoModal()
    );
  }


  const addReview =
    $a("add-review-btn");

  if (addReview) {
    addReview.addEventListener(
      "click",
      () => openReviewModal()
    );
  }
}


function bindEnquiryActions() {
  document.addEventListener(
    "change",
    async event => {
      const select =
        event.target.closest(
          ".enquiry-status-select"
        );

      if (!select) {
        return;
      }

      const id =
        select.dataset.enquiryId;

      const status =
        select.value;

      try {
        select.disabled =
          true;

        await updateEnquiryStatus(
          id,
          status
        );

        await loadEnquiries();
        await loadDashboardStats();

      } catch (error) {
        alert(
          error.message ||
            "Failed to update enquiry."
        );

      } finally {
        select.disabled =
          false;
      }
    }
  );
}


/* =========================================================
   IMAGE PREVIEWS
   ========================================================= */

function bindImagePreviews() {
  setupImagePreview(
    "trip-image-input",
    "trip-image-preview"
  );

  setupImagePreview(
    "vehicle-image-input",
    "vehicle-image-preview"
  );
}


/* =========================================================
   INITIALIZE ADMIN
   ========================================================= */

let adminInitialized =
  false;


async function initAdmin() {
  if (adminInitialized) {
    return true;
  }

  adminInitialized =
    true;

  try {
    /*
     * Bind all handlers once.
     */
    bindNavigation();
    bindLogout();
    bindQuickActions();
    bindActionButtons();
    bindModalClose();
    bindForms();
    bindAddButtons();
    bindEnquiryActions();
    bindImagePreviews();

    /*
     * Keep dashboard visible immediately.
     */
    showPanel(
      "dashboard"
    );

    /*
     * Load dashboard information.
     */
    await loadDashboardStats();

    return true;

  } catch (error) {
    console.error(
      "[admin.js] Admin initialization failed:",
      error
    );

    adminInitialized =
      false;

    return false;
  }
}


/* =========================================================
   GLOBAL EXPORTS
   ========================================================= */

if (
  typeof window !== "undefined"
) {
  window.adminLogin =
    adminLogin;

  window.adminLogout =
    adminLogout;

  window.isAdminLoggedIn =
    isAdminLoggedIn;

  window.requireAdminAuth =
    requireAdminAuth;

  window.initAdmin =
    initAdmin;

  window.openTripModal =
    openTripModal;

  window.openVehicleModal =
    openVehicleModal;

  window.openVideoModal =
    openVideoModal;

  window.openReviewModal =
    openReviewModal;

  window.showPanel =
    showPanel;
}
