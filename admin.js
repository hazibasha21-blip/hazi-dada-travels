/* =========================================================
   HAZI DADA TRAVELS
   ADMIN PANEL CONTROLLER
   ========================================================= */

const ADMIN_USER_ID =
  "589555e8-5853-4e58-aaac-8038ec833c80";


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function $a(id) {
  return document.getElementById(id);
}

function getFieldValue(id) {
  const el = $a(id);
  return el ? String(el.value || "").trim() : "";
}

function setFieldValue(id, value) {
  const el = $a(id);
  if (el) {
    el.value = value ?? "";
  }
}

function setChecked(id, value) {
  const el = $a(id);
  if (el) {
    el.checked = !!value;
  }
}

function ea(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fallbackImage() {
  return "";
}

function showError(id, message) {
  const el = $a(id);

  if (!el) {
    return;
  }

  el.textContent = message || "";
  el.style.display = message ? "block" : "none";
}

function clearError(id) {
  showError(id, "");
}

function adminToast(message, type = "success") {
  let toast = $a("admin-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "admin-toast";

    toast.style.position = "fixed";
    toast.style.right = "20px";
    toast.style.bottom = "20px";
    toast.style.zIndex = "99999";
    toast.style.padding = "14px 18px";
    toast.style.borderRadius = "12px";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.maxWidth = "90vw";
    toast.style.boxShadow = "0 10px 30px rgba(0,0,0,.25)";

    document.body.appendChild(toast);
  }

  toast.textContent = message || "";

  if (type === "error") {
    toast.style.background = "#dc2626";
    toast.style.color = "#fff";
  } else {
    toast.style.background = "#16a34a";
    toast.style.color = "#fff";
  }

  clearTimeout(window.__adminToastTimer);

  window.__adminToastTimer =
    setTimeout(() => {
      toast.remove();
    }, 3500);
}

function readableError(error) {
  if (!error) {
    return "Something went wrong.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error.message) {
    return error.message;
  }

  if (error.error_description) {
    return error.error_description;
  }

  return "Something went wrong.";
}

async function guard(callback) {
  try {
    return await callback();
  } catch (error) {
    console.error("[admin.js]", error);

    adminToast(
      readableError(error),
      "error"
    );

    return null;
  }
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );
  } catch {
    return String(value);
  }
}

function starsA(rating) {
  const count = Math.max(
    0,
    Math.min(5, Number(rating) || 0)
  );

  return "★".repeat(count) +
    "☆".repeat(5 - count);
}

function empty(message) {
  return `
    <div class="a-empty">
      ${ea(message || "No data available.")}
    </div>
  `;
}

function actionButton(
  label,
  attributes = "",
  extraClass = ""
) {
  return `
    <button
      type="button"
      class="a-btn ${extraClass}"
      ${attributes}>
      ${ea(label)}
    </button>
  `;
}


/* =========================================================
   IMAGE READER
   ========================================================= */

function readImageFile(file) {
  return new Promise(
    (resolve, reject) => {

      if (!file) {
        resolve("");
        return;
      }

      if (!file.type.startsWith("image/")) {
        reject(
          new Error("Please select a valid image file.")
        );
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        reject(
          new Error(
            "Image must be smaller than 5 MB."
          )
        );
        return;
      }

      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = () =>
        reject(
          new Error("Unable to read image.")
        );

      reader.readAsDataURL(file);
    }
  );
}


/* =========================================================
   AUTHENTICATION
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

function authErrorMessage(error) {
  const message =
    String(error?.message || "");

  const lower =
    message.toLowerCase();

  if (
    lower.includes("invalid login") ||
    lower.includes("invalid credentials")
  ) {
    return "Invalid email or password.";
  }

  if (
    lower.includes("email not confirmed")
  ) {
    return "Please confirm the admin email address first.";
  }

  if (
    lower.includes("password")
  ) {
    return message;
  }

  return message ||
    "Authentication failed.";
}

async function adminLogin(
  email,
  password
) {
  const db = authClient();

  if (!email || !password) {
    throw new Error(
      "Email and password are required."
    );
  }

  const result =
    await Promise.race([
      db.auth.signInWithPassword({
        email,
        password
      }),

      new Promise(
        (_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "Login request timed out. Please try again."
                )
              ),
            15000
          )
      )
    ]);

  const {
    data,
    error
  } = result;

  if (error) {
    throw new Error(
      authErrorMessage(error)
    );
  }

  if (!data?.session) {
    throw new Error(
      "Login session could not be created."
    );
  }

  if (
    data.user?.id !== ADMIN_USER_ID
  ) {
    await db.auth.signOut();

    throw new Error(
      "This account is not authorized for the Admin Panel."
    );
  }

  return data;
}

async function isAdminLoggedIn() {
  try {
    const db = authClient();

    const {
      data,
      error
    } = await db.auth.getSession();

    if (error || !data?.session) {
      return false;
    }

    return (
      data.session.user?.id ===
      ADMIN_USER_ID
    );
  } catch {
    return false;
  }
}

async function adminLogout() {
  const db = authClient();

  const {
    error
  } = await db.auth.signOut();

  if (error) {
    throw error;
  }

  window.location.href =
    "login.html";
}

async function requireAdminAuth() {
  try {
    const db = authClient();

    const {
      data,
      error
    } = await db.auth.getSession();

    if (
      error ||
      !data?.session ||
      data.session.user?.id !== ADMIN_USER_ID
    ) {
      window.location.href =
        "login.html";

      return false;
    }

    db.auth.onAuthStateChange(
      (event) => {

        if (
          event === "SIGNED_OUT"
        ) {
          window.location.href =
            "login.html";
        }
      }
    );

    return true;

  } catch (error) {

    console.error(
      "Admin authentication failed:",
      error
    );

    window.location.href =
      "login.html";

    return false;
  }
}


/* =========================================================
   PASSWORD CHANGE
   ========================================================= */

async function changeAdminPassword(
  currentPassword,
  newPassword
) {
  const db = authClient();

  const {
    data: sessionData,
    error: sessionError
  } = await db.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const session =
    sessionData?.session;

  const user =
    session?.user;

  if (!user?.email) {
    throw new Error(
      "Admin session is not available."
    );
  }

  if (
    user.id !== ADMIN_USER_ID
  ) {
    throw new Error(
      "Unauthorized admin account."
    );
  }

  /*
   * Re-authenticate with the
   * current password first.
   */
  const {
    data: loginData,
    error: loginError
  } =
    await db.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

  if (loginError) {
    throw new Error(
      "Current password is incorrect."
    );
  }

  if (
    loginData?.user?.id !==
    ADMIN_USER_ID
  ) {
    throw new Error(
      "Unauthorized admin account."
    );
  }

  /*
   * Update password using
   * Supabase Auth.
   */
  const {
    error: updateError
  } =
    await db.auth.updateUser({
      password: newPassword
    });

  if (updateError) {
    throw updateError;
  }

  return true;
}

async function saveChangePasswordForm(
  event
) {
  event.preventDefault();

  clearError(
    "change-password-error"
  );

  const success =
    $a("change-password-success");

  if (success) {
    success.textContent = "";
    success.style.display = "none";
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

  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    showError(
      "change-password-error",
      "Please fill in all password fields."
    );

    return;
  }

  if (newPassword.length < 8) {
    showError(
      "change-password-error",
      "New password must be at least 8 characters."
    );

    return;
  }

  if (
    newPassword !== confirmPassword
  ) {
    showError(
      "change-password-error",
      "New password and confirmation do not match."
    );

    return;
  }

  if (
    currentPassword === newPassword
  ) {
    showError(
      "change-password-error",
      "New password must be different from the current password."
    );

    return;
  }

  const submitButton =
    event.submitter ||
    event.target.querySelector(
      'button[type="submit"]'
    );

  const originalText =
    submitButton?.textContent;

  try {

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent =
        "Changing...";
    }

    await changeAdminPassword(
      currentPassword,
      newPassword
    );

    setFieldValue(
      "current-admin-password",
      ""
    );

    setFieldValue(
      "new-admin-password",
      ""
    );

    setFieldValue(
      "confirm-admin-password",
      ""
    );

    if (success) {
      success.textContent =
        "Password changed successfully.";

      success.style.display =
        "block";
    }

    adminToast(
      "Admin password changed successfully.",
      "success"
    );

  } catch (error) {

    console.error(
      "Password change error:",
      error
    );

    showError(
      "change-password-error",
      readableError(error)
    );

    adminToast(
      readableError(error),
      "error"
    );

  } finally {

    if (submitButton) {
      submitButton.disabled = false;

      submitButton.textContent =
        originalText ||
        "Change Password";
    }
  }
}


/* =========================================================
   PANEL LOADERS
   ========================================================= */

const PANEL_LOADERS = {};


/* =========================================================
   DASHBOARD
   ========================================================= */

function recentDateSort(a, b) {
  const aTime =
    new Date(
      a?.created_at || 0
    ).getTime();

  const bTime =
    new Date(
      b?.created_at || 0
    ).getTime();

  return bTime - aTime;
}

function renderRecentEnquiries(items) {

  const container =
    $a("recent-enquiries");

  if (!container) {
    return;
  }

  if (!items.length) {
    container.innerHTML =
      empty("No enquiries yet.");

    return;
  }

  container.innerHTML =
    items
      .slice(0, 5)
      .map(item => {

        return `
          <div class="a-item-card">

            <div class="a-item-info">

              <h3>
                ${ea(
                  item.name ||
                  "Unnamed customer"
                )}
              </h3>

              <p>
                ${ea(
                  item.trip ||
                  "General enquiry"
                )}
              </p>

              <small>
                ${ea(
                  item.phone ||
                  ""
                )}
                ${item.created_at
                  ? " · " +
                    ea(
                      formatDate(
                        item.created_at
                      )
                    )
                  : ""}
              </small>

            </div>

            <div class="a-item-actions">

              ${actionButton(
                "View Enquiries",
                'data-recent-panel="enquiries"'
              )}

            </div>

          </div>
        `;

      })
      .join("");
}

function renderRecentReviews(items) {

  const container =
    $a("recent-reviews");

  if (!container) {
    return;
  }

  if (!items.length) {
    container.innerHTML =
      empty("No reviews yet.");

    return;
  }

  container.innerHTML =
    items
      .slice(0, 5)
      .map(review => {

        return `
          <div class="a-item-card">

            <div class="a-item-info">

              <h3>
                ${ea(
                  review.name ||
                  "Anonymous"
                )}

                <span
                  style="color:#ffb020;">
                  ${starsA(
                    review.rating
                  )}
                </span>
              </h3>

              <p>
                ${ea(
                  review.review ||
                  review.comment ||
                  ""
                )}
              </p>

              <span class="a-badge">
                ${review.approved
                  ? "Visible"
                  : "Pending"}
              </span>

            </div>

            <div class="a-item-actions">

              ${actionButton(
                "View Reviews",
                'data-recent-panel="reviews"'
              )}

            </div>

          </div>
        `;

      })
      .join("");
}

function renderRecentTrips(items) {

  const container =
    $a("recent-trips");

  if (!container) {
    return;
  }

  if (!items.length) {
    container.innerHTML =
      empty("No trips yet.");

    return;
  }

  container.innerHTML =
    items
      .slice(0, 5)
      .map(trip => {

        return `
          <div class="a-item-card">

            <div class="a-item-info">

              <h3>
                ${ea(
                  trip.name ||
                  "Unnamed trip"
                )}
              </h3>

              <p>
                ${ea(
                  trip.destination ||
                  ""
                )}
              </p>

              <small>
                ${ea(
                  trip.duration ||
                  ""
                )}

                ${
                  trip.price
                    ? " · " +
                      ea(
                        trip.price
                      )
                    : ""
                }
              </small>

            </div>

            <div class="a-item-actions">

              ${actionButton(
                "View Trips",
                'data-recent-panel="trips"'
              )}

            </div>

          </div>
        `;

      })
      .join("");
}

PANEL_LOADERS.dashboard =
  async function () {

    try {

      const results =
        await Promise.allSettled([
          getTrips(),
          getVehicles(),
          getGallery(),
          getVideos(),
          getReviews(),
          getEnquiries()
        ]);

      const [
        tripsResult,
        vehiclesResult,
        galleryResult,
        videosResult,
        reviewsResult,
        enquiriesResult
      ] = results;

      const getArray =
        result =>
          result.status ===
            "fulfilled" &&
          Array.isArray(
            result.value
          )
            ? result.value
            : [];

      const trips =
        getArray(
          tripsResult
        );

      const vehicles =
        getArray(
          vehiclesResult
        );

      const gallery =
        getArray(
          galleryResult
        );

      const videos =
        getArray(
          videosResult
        );

      const reviews =
        getArray(
          reviewsResult
        );

      const enquiries =
        getArray(
          enquiriesResult
        );

      const setText =
        (id, value) => {

          const element =
            $a(id);

          if (element) {
            element.textContent =
              value;
          }
        };

      setText(
        "stat-trips",
        trips.length
      );

      setText(
        "stat-vehicles",
        vehicles.length
      );

      setText(
        "stat-gallery",
        gallery.length
      );

      setText(
        "stat-videos",
        videos.length
      );

      setText(
        "stat-reviews",
        reviews.length
      );

      setText(
        "stat-enquiries",
        enquiries.length
      );

      renderRecentTrips(
        [...trips].sort(
          recentDateSort
        )
      );

      renderRecentReviews(
        [...reviews].sort(
          recentDateSort
        )
      );

      renderRecentEnquiries(
        [...enquiries].sort(
          recentDateSort
        )
      );

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

    }
  };


/* =========================================================
   TRIPS
   ========================================================= */

PANEL_LOADERS.trips =
  async function () {

    const list =
      $a("trips-list");

    if (!list) {
      return;
    }

    try {

      const trips =
        await getTrips();

      if (!trips.length) {
        list.innerHTML =
          empty("No trips available.");

        return;
      }

      list.innerHTML =
        trips.map(trip => {

          return `
            <div
              class="a-item-card"
              data-trip-search="
                ${ea(
                  (
                    trip.name ||
                    ""
                  ) +
                  " " +
                  (
                    trip.destination ||
                    ""
                  )
                ).toLowerCase()}
              ">

              ${
                trip.image_url
                  ? `
                    <img
                      src="${ea(
                        trip.image_url
                      )}"
                      alt="${ea(
                        trip.name ||
                        "Trip"
                      )}"
                      class="a-item-image">
                  `
                  : ""
              }

              <div class="a-item-info">

                <h3>
                  ${ea(
                    trip.name ||
                    "Unnamed trip"
                  )}
                </h3>

                <p>
                  📍
                  ${ea(
                    trip.destination ||
                    ""
                  )}
                </p>

                <p>
                  ${
                    trip.duration
                      ? "📅 " +
                        ea(
                          trip.duration
                        )
                      : ""
                  }

                  ${
                    trip.price
                      ? " · " +
                        ea(
                          trip.price
                        )
                      : ""
                  }
                </p>

                <p>
                  ${ea(
                    trip.description ||
                    ""
                  )}
                </p>

                <div class="a-item-actions">

                  ${actionButton(
                    "Edit",
                    `data-edit-trip="${ea(
                      trip.id
                    )}"`
                  )}

                  ${actionButton(
                    "Delete",
                    `data-delete-trip="${ea(
                      trip.id
                    )}"`,
                    "a-btn-danger"
                  )}

                </div>

              </div>

            </div>
          `;

        }).join("");

    } catch (error) {

      console.error(
        "Trips error:",
        error
      );

      list.innerHTML =
        empty(
          readableError(error)
        );
    }
  };


function openTripModal(trip = null) {

  const modal =
    $a("trip-modal");

  if (!modal) {
    return;
  }

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

  if (title) {
    title.textContent =
      trip
        ? "Edit Trip"
        : "Add Trip";
  }

  if (trip) {

    form.dataset.editId =
      trip.id;

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

    const preview =
      $a("trip-image-preview");

    if (
      preview &&
      trip.image_url
    ) {
      preview.src =
        trip.image_url;

      preview.style.display =
        "block";
    }

  } else {

    if (form) {
      delete form.dataset.editId;
    }

    const preview =
      $a("trip-image-preview");

    if (preview) {
      preview.src = "";
      preview.style.display =
        "none";
    }
  }

  const vehicleBox =
    $a("trip-vehicle-checkboxes");

  if (vehicleBox) {
    vehicleBox.innerHTML =
      "<small>Vehicle selection is handled from the Vehicles panel.</small>";
  }

  modal.style.display =
    "flex";
}

function closeTripModal() {

  const modal =
    $a("trip-modal");

  if (modal) {
    modal.style.display =
      "none";
  }
}

async function saveTripForm(event) {

  event.preventDefault();

  clearError(
    "trip-error"
  );

  const form =
    event.target;

  const editId =
    form.dataset.editId;

  const trip = {

    ...(editId
      ? { id: editId }
      : {}),

    name:
      getFieldValue(
        "trip-name"
      ),

    destination:
      getFieldValue(
        "trip-destination"
      ),

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
      )
  };

  if (!trip.name) {
    showError(
      "trip-error",
      "Trip name is required."
    );

    return;
  }

  try {

    const imageInput =
      $a("trip-image-input");

    if (
      imageInput?.files?.[0]
    ) {

      trip.image_url =
        await readImageFile(
          imageInput.files[0]
        );
    }

    await saveTrip(trip);

    closeTripModal();

    adminToast(
      editId
        ? "Trip updated successfully."
        : "Trip added successfully.",
      "success"
    );

    await PANEL_LOADERS.trips();
    await PANEL_LOADERS.dashboard();

  } catch (error) {

    console.error(
      "Save trip error:",
      error
    );

    showError(
      "trip-error",
      readableError(error)
    );
  }
}


/* =========================================================
   VEHICLES
   ========================================================= */

PANEL_LOADERS.vehicles =
  async function () {

    const list =
      $a("vehicles-list");

    if (!list) {
      return;
    }

    try {

      const vehicles =
        await getVehicles();

      if (!vehicles.length) {
        list.innerHTML =
          empty(
            "No vehicles available."
          );

        return;
      }

      list.innerHTML =
        vehicles.map(vehicle => {

          return `
            <div class="a-item-card">

              ${
                vehicle.image_url
                  ? `
                    <img
                      src="${ea(
                        vehicle.image_url
                      )}"
                      alt="${ea(
                        vehicle.name ||
                        "Vehicle"
                      )}"
                      class="a-item-image">
                  `
                  : ""
              }

              <div class="a-item-info">

                <h3>
                  ${ea(
                    vehicle.name ||
                    "Unnamed vehicle"
                  )}
                </h3>

                <p>
                  ${ea(
                    vehicle.type ||
                    ""
                  )}
                </p>

                <p>
                  💺
                  ${ea(
                    vehicle.capacity ||
                    ""
                  )}
                  ${
                    vehicle.registration
                      ? " · " +
                        ea(
                          vehicle.registration
                        )
                      : ""
                  }
                </p>

                <span class="a-badge">
                  ${
                    vehicle.available
                      ? "Available"
                      : "Unavailable"
                  }
                </span>

                <div class="a-item-actions">

                  ${actionButton(
                    "Edit",
                    `data-edit-vehicle="${ea(
                      vehicle.id
                    )}"`
                  )}

                  ${actionButton(
                    "Delete",
                    `data-delete-vehicle="${ea(
                      vehicle.id
                    )}"`,
                    "a-btn-danger"
                  )}

                </div>

              </div>

            </div>
          `;

        }).join("");

    } catch (error) {

      console.error(
        "Vehicles error:",
        error
      );

      list.innerHTML =
        empty(
          readableError(error)
        );
    }
  };


function openVehicleModal(
  vehicle = null
) {

  const modal =
    $a("vehicle-modal");

  if (!modal) {
    return;
  }

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

  if (title) {
    title.textContent =
      vehicle
        ? "Edit Vehicle"
        : "Add Vehicle";
  }

  if (vehicle) {

    form.dataset.editId =
      vehicle.id;

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

    setChecked(
      "vehicle-available",
      vehicle.available
    );

    const preview =
      $a(
        "vehicle-image-preview"
      );

    if (
      preview &&
      vehicle.image_url
    ) {
      preview.src =
        vehicle.image_url;

      preview.style.display =
        "block";
    }

  } else {

    if (form) {
      delete form.dataset.editId;
    }

    setChecked(
      "vehicle-available",
      true
    );

    const preview =
      $a(
        "vehicle-image-preview"
      );

    if (preview) {
      preview.src = "";
      preview.style.display =
        "none";
    }
  }

  modal.style.display =
    "flex";
}

function closeVehicleModal() {

  const modal =
    $a("vehicle-modal");

  if (modal) {
    modal.style.display =
      "none";
  }
}

async function saveVehicleForm(event) {

  event.preventDefault();

  clearError(
    "vehicle-error"
  );

  const form =
    event.target;

  const editId =
    form.dataset.editId;

  const vehicle = {

    ...(editId
      ? { id: editId }
      : {}),

    name:
      getFieldValue(
        "vehicle-name"
      ),

    type:
      getFieldValue(
        "vehicle-type"
      ),

    capacity:
      Number(
        getFieldValue(
          "vehicle-capacity"
        )
      ) || 0,

    registration:
      getFieldValue(
        "vehicle-registration"
      ),

    available:
      !!$a(
        "vehicle-available"
      )?.checked
  };

  if (!vehicle.name) {
    showError(
      "vehicle-error",
      "Vehicle name is required."
    );

    return;
  }

  try {

    const imageInput =
      $a("vehicle-image-input");

    if (
      imageInput?.files?.[0]
    ) {

      vehicle.image_url =
        await readImageFile(
          imageInput.files[0]
        );
    }

    await saveVehicle(
      vehicle
    );

    closeVehicleModal();

    adminToast(
      editId
        ? "Vehicle updated successfully."
        : "Vehicle added successfully.",
      "success"
    );

    await PANEL_LOADERS.vehicles();
    await PANEL_LOADERS.dashboard();

  } catch (error) {

    console.error(
      "Save vehicle error:",
      error
    );

    showError(
      "vehicle-error",
      readableError(error)
    );
  }
}


/* =========================================================
   GALLERY
   ========================================================= */

PANEL_LOADERS.gallery =
  async function () {

    const list =
      $a("gallery-list");

    if (!list) {
      return;
    }

    try {

      const gallery =
        await getGallery();

      if (!gallery.length) {

        list.innerHTML =
          empty(
            "No gallery items available."
          );

        return;
      }

      list.innerHTML =
        gallery.map(item => {

          const image =
            item.image_url ||
            item.media_url ||
            "";

          return `
            <div class="a-item-card">

              ${
                image
                  ? `
                    <img
                      src="${ea(
                        image
                      )}"
                      alt="${ea(
                        item.title ||
                        "Gallery image"
                      )}"
                      class="a-item-image">
                  `
                  : ""
              }

              <div class="a-item-info">

                <h3>
                  ${ea(
                    item.title ||
                    "Untitled"
                  )}
                </h3>

                <p>
                  ${ea(
                    item.description ||
                    ""
                  )}
                </p>

                <span class="a-badge">
                  ${
                    item.approved
                      ? "Visible"
                      : "Pending"
                  }
                </span>

                <div class="a-item-actions">

                  ${actionButton(
                    item.approved
                      ? "Hide"
                      : "Approve",
                    `data-toggle-gallery="${ea(
                      item.id
                    )}"`
                  )}

                  ${actionButton(
                    "Delete",
                    `data-delete-gallery="${ea(
                      item.id
                    )}"`,
                    "a-btn-danger"
                  )}

                </div>

              </div>

            </div>
          `;

        }).join("");

    } catch (error) {

      console.error(
        "Gallery error:",
        error
      );

      list.innerHTML =
        empty(
          readableError(error)
        );
    }
  };


async function saveGalleryForm(
  event
) {

  event.preventDefault();

  const form =
    event.target;

  const title =
    getFieldValue(
      "gallery-title"
    );

  const description =
    getFieldValue(
      "gallery-description"
    );

  if (!title) {
    adminToast(
      "Gallery title is required.",
      "error"
    );

    return;
  }

  try {

    const input =
      $a("gallery-image-input");

    if (
      !input?.files?.[0]
    ) {
      throw new Error(
        "Please select an image."
      );
    }

    const mediaUrl =
      await readImageFile(
        input.files[0]
      );

    await saveGallery({
      title,
      description,
      media_url: mediaUrl,
      media_type: "image",
      approved: true
    });

    form.reset();

    adminToast(
      "Gallery image added successfully.",
      "success"
    );

    await PANEL_LOADERS.gallery();
    await PANEL_LOADERS.dashboard();

  } catch (error) {

    console.error(
      "Save gallery error:",
      error
    );

    adminToast(
      readableError(error),
      "error"
    );
  }
}


/* =========================================================
   VIDEOS
   ========================================================= */

PANEL_LOADERS.videos =
  async function () {

    const list =
      $a("videos-list");

    if (!list) {
      return;
    }

    try {

      const videos =
        await getVideos();

      if (!videos.length) {
        list.innerHTML =
          empty(
            "No videos available."
          );

        return;
      }

      list.innerHTML =
        videos.map(video => {

          return `
            <div class="a-item-card">

              <div class="a-item-info">

                <h3>
                  ${ea(
                    video.title ||
                    "Untitled video"
                  )}
                </h3>

                <p>
                  ${ea(
                    video.description ||
                    ""
                  )}
                </p>

                <p>
                  YouTube ID:
                  ${ea(
                    video.youtube_id ||
                    video.youtubeId ||
                    ""
                  )}
                </p>

                <div class="a-item-actions">

                  ${actionButton(
                    "Edit",
                    `data-edit-video="${ea(
                      video.id
                    )}"`
                  )}

                  ${actionButton(
                    "Delete",
                    `data-delete-video="${ea(
                      video.id
                    )}"`,
                    "a-btn-danger"
                  )}

                </div>

              </div>

            </div>
          `;

        }).join("");

    } catch (error) {

      console.error(
        "Videos error:",
        error
      );

      list.innerHTML =
        empty(
          readableError(error)
        );
    }
  };


function openVideoModal(
  video = null
) {

  const modal =
    $a("video-modal");

  if (!modal) {
    return;
  }

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
      video
        ? "Edit Video"
        : "Add Video";
  }

  if (video) {

    form.dataset.editId =
      video.id;

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
      video.youtube_id ||
      video.youtubeId ||
      ""
    );

  } else {

    if (form) {
      delete form.dataset.editId;
    }
  }

  modal.style.display =
    "flex";
}

function closeVideoModal() {

  const modal =
    $a("video-modal");

  if (modal) {
    modal.style.display =
      "none";
  }
}

async function saveVideoForm(
  event
) {

  event.preventDefault();

  clearError(
    "video-error"
  );

  const form =
    event.target;

  const editId =
    form.dataset.editId;

  const video = {

    ...(editId
      ? { id: editId }
      : {}),

    title:
      getFieldValue(
        "video-title"
      ),

    description:
      getFieldValue(
        "video-description"
      ),

    youtube_id:
      getFieldValue(
        "video-youtube"
      )
  };

  if (!video.title) {

    showError(
      "video-error",
      "Video title is required."
    );

    return;
  }

  if (!video.youtube_id) {

    showError(
      "video-error",
      "YouTube video ID is required."
    );

    return;
  }

  try {

    await saveVideo(
      video
    );

    closeVideoModal();

    adminToast(
      editId
        ? "Video updated successfully."
        : "Video added successfully.",
      "success"
    );

    await PANEL_LOADERS.videos();
    await PANEL_LOADERS.dashboard();

  } catch (error) {

    console.error(
      "Save video error:",
      error
    );

    showError(
      "video-error",
      readableError(error)
    );
  }
}


/* =========================================================
   REVIEWS
   ========================================================= */

PANEL_LOADERS.reviews =
  async function () {

    const list =
      $a("reviews-list");

    if (!list) {
      return;
    }

    try {

      const reviews =
        await getReviews();

      if (!reviews.length) {

        list.innerHTML =
          empty(
            "No reviews available."
          );

        return;
      }

      list.innerHTML =
        reviews.map(review => {

          return `
            <div class="a-item-card">

              <div class="a-item-info">

                <h3>

                  ${ea(
                    review.name ||
                    "Anonymous"
                  )}

                  <span
                    style="color:#ffb020;">
                    ${starsA(
                      review.rating
                    )}
                  </span>

                </h3>

                <p>
                  ${ea(
                    review.review ||
                    review.comment ||
                    ""
                  )}
                </p>

                <span class="a-badge">

                  ${
                    review.approved
                      ? "Visible"
                      : "Pending"
                  }

                </span>

                <div class="a-item-actions">

                  ${actionButton(
                    "Edit",
                    `data-edit-review="${ea(
                      review.id
                    )}"`
                  )}

                  ${actionButton(
                    review.approved
                      ? "Hide"
                      : "Approve",
                    `data-toggle-review="${ea(
                      review.id
                    )}"`
                  )}

                  ${actionButton(
                    "Delete",
                    `data-delete-review="${ea(
                      review.id
                    )}"`,
                    "a-btn-danger"
                  )}

                </div>

              </div>

            </div>
          `;

        }).join("");

    } catch (error) {

      console.error(
        "Reviews error:",
        error
      );

      list.innerHTML =
        empty(
          readableError(error)
        );
    }
  };


function openReviewModal(
  review = null
) {

  const modal =
    $a("review-modal");

  if (!modal) {
    return;
  }

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
      review
        ? "Edit Review"
        : "Add Review";
  }

  if (review) {

    form.dataset.editId =
      review.id;

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
      review.review ||
      review.comment
    );

    setChecked(
      "review-approved",
      review.approved
    );

  } else {

    if (form) {
      delete form.dataset.editId;
    }

    setChecked(
      "review-approved",
      true
    );
  }

  modal.style.display =
    "flex";
}

function closeReviewModal() {

  const modal =
    $a("review-modal");

  if (modal) {
    modal.style.display =
      "none";
  }
}

async function saveReviewForm(
  event
) {

  event.preventDefault();

  clearError(
    "review-error"
  );

  const form =
    event.target;

  const editId =
    form.dataset.editId;

  const review = {

    ...(editId
      ? { id: editId }
      : {}),

    name:
      getFieldValue(
        "review-name"
      ),

    rating:
      Number(
        getFieldValue(
          "review-rating"
        )
      ) || 0,

    review:
      getFieldValue(
        "review-text"
      ),

    approved:
      !!$a(
        "review-approved"
      )?.checked
  };

  if (!review.name) {

    showError(
      "review-error",
      "Reviewer name is required."
    );

    return;
  }

  if (
    review.rating < 1 ||
    review.rating > 5
  ) {

    showError(
      "review-error",
      "Rating must be between 1 and 5."
    );

    return;
  }

  if (!review.review) {

    showError(
      "review-error",
      "Review text is required."
    );

    return;
  }

  try {

    await saveReview(
      review
    );

    closeReviewModal();

    adminToast(
      editId
        ? "Review updated successfully."
        : "Review added successfully.",
      "success"
    );

    await PANEL_LOADERS.reviews();
    await PANEL_LOADERS.dashboard();

  } catch (error) {

    console.error(
      "Save review error:",
      error
    );

    showError(
      "review-error",
      readableError(error)
    );
  }
}


/* =========================================================
   ENQUIRIES
   ========================================================= */

PANEL_LOADERS.enquiries =
  async function () {

    const list =
      $a("enquiries-list");

    if (!list) {
      return;
    }

    try {

      const enquiries =
        await getEnquiries();

      const filter =
        getFieldValue(
          "enquiry-filter"
        ).toLowerCase();

      let filtered =
        [...enquiries];

      if (filter) {

        filtered =
          filtered.filter(
            item =>
              String(
                item.status ||
                ""
              ).toLowerCase() ===
              filter
          );
      }

      filtered.sort(
        recentDateSort
      );

      if (!filtered.length) {

        list.innerHTML =
          empty(
            "No enquiries available."
          );

        return;
      }

      list.innerHTML =
        filtered.map(item => {

          return `
            <div class="a-item-card">

              <div class="a-item-info">

                <h3>
                  ${ea(
                    item.name ||
                    "Unnamed"
                  )}
                </h3>

                <p>
                  📞
                  ${ea(
                    item.phone ||
                    ""
                  )}
                </p>

                <p>
                  🚌
                  ${ea(
                    item.trip ||
                    "General enquiry"
                  )}
                </p>

                <p>
                  ${ea(
                    item.message ||
                    ""
                  )}
                </p>

                <span class="a-badge">
                  ${ea(
                    item.status ||
                    "new"
                  )}
                </span>

                <small>
                  ${ea(
                    formatDate(
                      item.created_at
                    )
                  )}
                </small>

              </div>

            </div>
          `;

        }).join("");

    } catch (error) {

      console.error(
        "Enquiries error:",
        error
      );

      list.innerHTML =
        empty(
          readableError(error)
        );
    }
  };


/* =========================================================
   SETTINGS
   ========================================================= */

PANEL_LOADERS.settings =
  async function () {

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
        settings.about_text
      );

      setFieldValue(
        "settings-footer",
        settings.footer_text
      );

    } catch (error) {

      console.error(
        "Settings error:",
        error
      );

      adminToast(
        readableError(error),
        "error"
      );
    }
  };

async function saveSettingsForm(
  event
) {

  event.preventDefault();

  try {

    const settings = {

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

    adminToast(
      "Settings saved successfully.",
      "success"
    );

  } catch (error) {

    console.error(
      "Save settings error:",
      error
    );

    adminToast(
      readableError(error),
      "error"
    );
  }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

async function showPanel(
  panel
) {

  if (!panel) {
    panel = "dashboard";
  }

  document
    .querySelectorAll(
      "[data-panel]"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.panel ===
        panel
      );
    });

  document
    .querySelectorAll(
      ".admin-panel"
    )
    .forEach(section => {

      section.style.display =
        section.id ===
        `panel-${panel}`
          ? ""
          : "none";
    });

  const loader =
    PANEL_LOADERS[panel];

  if (loader) {
    await loader();
  }
}


/* =========================================================
   IMAGE PREVIEWS
   ========================================================= */

function setupImagePreview(
  inputId,
  previewId
) {

  const input =
    $a(inputId);

  const preview =
    $a(previewId);

  if (!input || !preview) {
    return;
  }

  input.addEventListener(
    "change",
    () => {

      const file =
        input.files?.[0];

      if (!file) {

        preview.src = "";
        preview.style.display =
          "none";

        return;
      }

      const reader =
        new FileReader();

      reader.onload =
        event => {

          preview.src =
            event.target.result;

          preview.style.display =
            "block";
        };

      reader.readAsDataURL(
        file
      );
    }
  );
}


/* =========================================================
   INIT ADMIN PANEL
   ========================================================= */

async function initAdmin() {

  /*
   * Image previews
   */

  setupImagePreview(
    "trip-image-input",
    "trip-image-preview"
  );

  setupImagePreview(
    "vehicle-image-input",
    "vehicle-image-preview"
  );


  /*
   * Navigation
   */

  document.addEventListener(
    "click",
    async event => {

      const panelButton =
        event.target.closest(
          "[data-panel]"
        );

      if (
        panelButton &&
        !event.target.closest(
          "button[type='submit']"
        )
      ) {

        event.preventDefault();

        await showPanel(
          panelButton.dataset.panel
        );

        return;
      }


      /*
       * Quick actions
       */

      const quick =
        event.target.closest(
          "[data-quick]"
        );

      if (quick) {

        event.preventDefault();

        const type =
          quick.dataset.quick;

        if (type === "trip") {
          openTripModal();
          return;
        }

        if (type === "vehicle") {
          openVehicleModal();
          return;
        }

        if (type === "video") {
          openVideoModal();
          return;
        }

        if (type === "review") {
          openReviewModal();
          return;
        }

        if (type === "gallery") {

          await showPanel(
            "gallery"
          );

          return;
        }
      }


      /*
       * Recent dashboard buttons
       */

      const recent =
        event.target.closest(
          "[data-recent-panel]"
        );

      if (recent) {

        event.preventDefault();

        await showPanel(
          recent.dataset.recentPanel
        );

        return;
      }


      /*
       * Add buttons
       */

      if (
        event.target.closest(
          "#add-trip-btn"
        )
      ) {

        openTripModal();
        return;
      }

      if (
        event.target.closest(
          "#add-vehicle-btn"
        )
      ) {

        openVehicleModal();
        return;
      }

      if (
        event.target.closest(
          "#add-video-btn"
        )
      ) {

        openVideoModal();
        return;
      }

      if (
        event.target.closest(
          "#add-review-btn"
        )
      ) {

        openReviewModal();
        return;
      }


      /*
       * Close modal buttons
       */

      if (
        event.target.closest(
          "[data-close-modal]"
        )
      ) {

        const button =
          event.target.closest(
            "[data-close-modal]"
          );

        const modalId =
          button.dataset.closeModal;

        const modal =
          $a(modalId);

        if (modal) {
          modal.style.display =
            "none";
        }

        return;
      }


      /*
       * Trip edit
       */

      const editTrip =
        event.target.closest(
          "[data-edit-trip]"
        );

      if (editTrip) {

        await guard(
          async () => {

            const trips =
              await getTrips();

            const trip =
              trips.find(
                row =>
                  String(row.id) ===
                  String(
                    editTrip.dataset.editTrip
                  )
              );

            if (!trip) {
              throw new Error(
                "Trip not found."
              );
            }

            openTripModal(
              trip
            );
          }
        );

        return;
      }


      /*
       * Trip delete
       */

      const deleteTrip =
        event.target.closest(
          "[data-delete-trip]"
        );

      if (deleteTrip) {

        if (
          !confirm(
            "Delete this trip?"
          )
        ) {
          return;
        }

        await guard(
          async () => {

            await deleteTripById(
              deleteTrip.dataset.deleteTrip
            );

            adminToast(
              "Trip deleted successfully.",
              "success"
            );

            await PANEL_LOADERS.trips();
            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /*
       * Vehicle edit
       */

      const editVehicle =
        event.target.closest(
          "[data-edit-vehicle]"
        );

      if (editVehicle) {

        await guard(
          async () => {

            const vehicles =
              await getVehicles();

            const vehicle =
              vehicles.find(
                row =>
                  String(row.id) ===
                  String(
                    editVehicle.dataset.editVehicle
                  )
              );

            if (!vehicle) {
              throw new Error(
                "Vehicle not found."
              );
            }

            openVehicleModal(
              vehicle
            );
          }
        );

        return;
      }


      /*
       * Vehicle delete
       */

      const deleteVehicle =
        event.target.closest(
          "[data-delete-vehicle]"
        );

      if (deleteVehicle) {

        if (
          !confirm(
            "Delete this vehicle?"
          )
        ) {
          return;
        }

        await guard(
          async () => {

            await deleteVehicleById(
              deleteVehicle.dataset.deleteVehicle
            );

            adminToast(
              "Vehicle deleted successfully.",
              "success"
            );

            await PANEL_LOADERS.vehicles();
            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /*
       * Gallery approval
       */

      const toggleGallery =
        event.target.closest(
          "[data-toggle-gallery]"
        );

      if (toggleGallery) {

        await guard(
          async () => {

            const gallery =
              await getGallery();

            const item =
              gallery.find(
                row =>
                  Number(row.id) ===
                  Number(
                    toggleGallery.dataset.toggleGallery
                  )
              );

            if (!item) {
              throw new Error(
                "Gallery item not found."
              );
            }

            await updateGallery(
              item.id,
              {
                approved:
                  !item.approved
              }
            );

            adminToast(
              "Gallery visibility updated.",
              "success"
            );

            await PANEL_LOADERS.gallery();
            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /*
       * Gallery delete
       */

      const deleteGallery =
        event.target.closest(
          "[data-delete-gallery]"
        );

      if (deleteGallery) {

        if (
          !confirm(
            "Delete this gallery item?"
          )
        ) {
          return;
        }

        await guard(
          async () => {

            await deleteGalleryById(
              deleteGallery.dataset.deleteGallery
            );

            adminToast(
              "Gallery item deleted successfully.",
              "success"
            );

            await PANEL_LOADERS.gallery();
            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /*
       * Video edit
       */

      const editVideo =
        event.target.closest(
          "[data-edit-video]"
        );

      if (editVideo) {

        await guard(
          async () => {

            const videos =
              await getVideos();

            const video =
              videos.find(
                row =>
                  String(row.id) ===
                  String(
                    editVideo.dataset.editVideo
                  )
              );

            if (!video) {
              throw new Error(
                "Video not found."
              );
            }

            openVideoModal(
              video
            );
          }
        );

        return;
      }


      /*
       * Video delete
       */

      const deleteVideo =
        event.target.closest(
          "[data-delete-video]"
        );

      if (deleteVideo) {

        if (
          !confirm(
            "Delete this video?"
          )
        ) {
          return;
        }

        await guard(
          async () => {

            await deleteVideoById(
              deleteVideo.dataset.deleteVideo
            );

            adminToast(
              "Video deleted successfully.",
              "success"
            );

            await PANEL_LOADERS.videos();
            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /*
       * Review edit
       */

      const editReview =
        event.target.closest(
          "[data-edit-review]"
        );

      if (editReview) {

        await guard(
          async () => {

            const reviews =
              await getReviews();

            const review =
              reviews.find(
                row =>
                  Number(row.id) ===
                  Number(
                    editReview.dataset.editReview
                  )
              );

            if (!review) {
              throw new Error(
                "Review not found."
              );
            }

            openReviewModal(
              review
            );
          }
        );

        return;
      }


      /*
       * Review approve / hide
       */

      const toggleReview =
        event.target.closest(
          "[data-toggle-review]"
        );

      if (toggleReview) {

        await guard(
          async () => {

            const reviews =
              await getReviews();

            const review =
              reviews.find(
                row =>
                  Number(row.id) ===
                  Number(
                    toggleReview.dataset.toggleReview
                  )
              );

            if (!review) {
              throw new Error(
                "Review not found."
              );
            }

            await updateReview(
              review.id,
              {
                approved:
                  !review.approved
              }
            );

            adminToast(
              "Review visibility updated.",
              "success"
            );

            await PANEL_LOADERS.reviews();
            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /*
       * Review delete
       */

      const deleteReview =
        event.target.closest(
          "[data-delete-review]"
        );

      if (deleteReview) {

        if (
          !confirm(
            "Delete this review?"
          )
        ) {
          return;
        }

        await guard(
          async () => {

            await deleteReviewById(
              deleteReview.dataset.deleteReview
            );

            adminToast(
              "Review deleted successfully.",
              "success"
            );

            await PANEL_LOADERS.reviews();
            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /*
       * Logout
       */

      if (
        event.target.closest(
          "#logout-btn"
        ) ||
        event.target.closest(
          "[data-logout]"
        )
      ) {

        await guard(
          async () => {

            await adminLogout();
          }
        );

        return;
      }


      /*
       * Modal click outside
       */

      if (
        event.target.classList.contains(
          "admin-modal"
        )
      ) {

        event.target.style.display =
          "none";
      }
    }
  );


  /*
   * Forms
   */

  const tripForm =
    $a("trip-form");

  if (tripForm) {
    tripForm.addEventListener(
      "submit",
      saveTripForm
    );
  }

  const vehicleForm =
    $a("vehicle-form");

  if (vehicleForm) {
    vehicleForm.addEventListener(
      "submit",
      saveVehicleForm
    );
  }

  const galleryForm =
    $a("gallery-add-form");

  if (galleryForm) {
    galleryForm.addEventListener(
      "submit",
      saveGalleryForm
    );
  }

  const videoForm =
    $a("video-form");

  if (videoForm) {
    videoForm.addEventListener(
      "submit",
      saveVideoForm
    );
  }

  const reviewForm =
    $a("review-form-admin");

  if (reviewForm) {
    reviewForm.addEventListener(
      "submit",
      saveReviewForm
    );
  }

  const settingsForm =
    $a("settings-form");

  if (settingsForm) {
    settingsForm.addEventListener(
      "submit",
      saveSettingsForm
    );
  }


  /*
   * NEW:
   * Password change form
   */

  const changePasswordForm =
    $a("change-password-form");

  if (changePasswordForm) {

    changePasswordForm.addEventListener(
      "submit",
      saveChangePasswordForm
    );
  }


  /*
   * Add buttons
   */

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


  /*
   * Enquiry filter
   */

  const enquiryFilter =
    $a("enquiry-filter");

  if (enquiryFilter) {

    enquiryFilter.addEventListener(
      "change",
      () =>
        PANEL_LOADERS.enquiries()
    );
  }


  /*
   * Trip search
   */

  const tripSearch =
    $a("trip-search");

  if (tripSearch) {

    tripSearch.addEventListener(
      "input",
      () => {

        const query =
          tripSearch.value
            .trim()
            .toLowerCase();

        document
          .querySelectorAll(
            "#trips-list [data-trip-search]"
          )
          .forEach(card => {

            const text =
              card.dataset.tripSearch ||
              "";

            card.style.display =
              !query ||
              text.includes(query)
                ? ""
                : "none";
          });
      }
    );
  }


  /*
   * Escape key
   */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Escape"
      ) {
        return;
      }

      document
        .querySelectorAll(
          ".admin-modal"
        )
        .forEach(modal => {

          modal.style.display =
            "none";
        });
    }
  );


  /*
   * First panel
   */

  await showPanel(
    "dashboard"
  );
}


/* =========================================================
   EXPORT / GLOBAL ACCESS
   ========================================================= */

window.ADMIN_USER_ID =
  ADMIN_USER_ID;

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

window.showPanel =
  showPanel;

window.changeAdminPassword =
  changeAdminPassword;
