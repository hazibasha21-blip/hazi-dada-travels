/* =========================================================
   HAZI DADA TRAVELS
   ADMIN.JS
   SYNCED WITH CURRENT DASHBOARD + DATA.JS
   ========================================================= */

const ADMIN_USER_ID =
  "589555e8-5853-4e58-aaac-8038ec833c80";


/* =========================================================
   HELPERS
   ========================================================= */

const $a = id => document.getElementById(id);


function getFieldValue(id) {
  const element = $a(id);

  if (!element) {
    console.warn("Missing field:", id);
    return "";
  }

  return element.value || "";
}


function setFieldValue(id, value) {
  const element = $a(id);

  if (!element) {
    return;
  }

  element.value =
    value === undefined || value === null
      ? ""
      : value;
}


function setFieldChecked(id, value) {
  const element = $a(id);

  if (!element) {
    return;
  }

  element.checked = !!value;
}


function ea(value) {
  return String(
    value === undefined || value === null
      ? ""
      : value
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function fallbackImage() {
  if (
    typeof PLACEHOLDER_FALLBACK !== "undefined" &&
    PLACEHOLDER_FALLBACK
  ) {
    return PLACEHOLDER_FALLBACK;
  }

  return "";
}


function imgFallback(src) {
  return src || fallbackImage();
}


function showError(id, message) {
  const element = $a(id);

  if (!element) {
    console.warn("Missing error element:", id);
    return;
  }

  element.textContent = message || "";
  element.style.display =
    message ? "block" : "none";
}


function adminToast(message, type = "info") {
  let container =
    document.querySelector(
      ".a-toast-container"
    );

  if (!container) {
    container =
      document.createElement("div");

    container.className =
      "a-toast-container";

    document.body.appendChild(container);
  }

  const toast =
    document.createElement("div");

  toast.className =
    "a-toast " + type;

  toast.textContent =
    message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}


function readableError(error) {
  if (!error) {
    return "Unknown error.";
  }

  if (error.message) {
    return String(error.message);
  }

  if (error.details) {
    return String(error.details);
  }

  if (error.hint) {
    return String(error.hint);
  }

  return String(error);
}


async function guard(fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    console.error(
      "Admin operation failed:",
      error
    );

    const message =
      readableError(error) ||
      fallback ||
      "Something went wrong.";

    adminToast(
      message,
      "error"
    );

    return null;
  }
}


function openModal(id) {
  const modal = $a(id);

  if (modal) {
    modal.classList.add("open");
  }
}


function closeModal(id) {
  const modal = $a(id);

  if (modal) {
    modal.classList.remove("open");
  }
}


function fmtDate(value) {
  if (!value) return "";

  try {
    return new Date(value)
      .toLocaleString();
  } catch (error) {
    return "";
  }
}


function starsA(value) {
  const rating =
    Number(value) || 0;

  let result = "";

  for (let i = 1; i <= 5; i++) {
    result +=
      i <= rating
        ? "★"
        : "☆";
  }

  return result;
}


function empty(message) {
  return `
    <div class="a-empty">
      ${ea(message)}
    </div>
  `;
}


function actionButton(
  label,
  attribute,
  className = ""
) {
  return `
    <button
      type="button"
      class="a-btn a-btn-small ${className}"
      ${attribute}>
      ${ea(label)}
    </button>
  `;
}


/* =========================================================
   IMAGE READER
   ========================================================= */

function readImage(
  file,
  maxDimension = 1200
) {
  return new Promise(
    (resolve, reject) => {

      if (!file) {
        resolve(null);
        return;
      }

      if (
        !file.type ||
        !file.type.startsWith("image/")
      ) {
        reject(
          new Error(
            "Please select an image file."
          )
        );
        return;
      }

      if (
        file.size >
        8 * 1024 * 1024
      ) {
        reject(
          new Error(
            "Image must be smaller than 8MB."
          )
        );
        return;
      }

      const reader =
        new FileReader();

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read image."
          )
        );
      };

      reader.onload = () => {

        const image =
          new Image();

        image.onerror = () => {
          reject(
            new Error(
              "Unable to process image."
            )
          );
        };

        image.onload = () => {

          const largest =
            Math.max(
              image.width,
              image.height
            );

          const scale =
            largest > maxDimension
              ? maxDimension / largest
              : 1;

          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width =
            Math.max(
              1,
              Math.round(
                image.width * scale
              )
            );

          canvas.height =
            Math.max(
              1,
              Math.round(
                image.height * scale
              )
            );

          const context =
            canvas.getContext("2d");

          if (!context) {
            reject(
              new Error(
                "Unable to process image."
              )
            );
            return;
          }

          context.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
          );

          resolve(
            canvas.toDataURL(
              "image/jpeg",
              0.82
            )
          );
        };

        image.src =
          reader.result;
      };

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
    String(
      error?.message || ""
    ).toLowerCase();

  const status =
    error?.status;

  if (
    status === 429 ||
    message.includes("rate limit") ||
    message.includes("too many")
  ) {
    return "Too many attempts. Please wait and try again.";
  }

  if (
    message.includes(
      "email not confirmed"
    )
  ) {
    return "Please confirm your email first.";
  }

  if (
    message.includes(
      "invalid login credentials"
    ) ||
    status === 400 ||
    status === 401
  ) {
    return "Invalid email or password.";
  }

  return (
    error?.message ||
    "Sign-in failed."
  );
}


async function adminLogin(
  email,
  password
) {
  try {

    if (!email || !password) {
      return {
        ok: false,
        message:
          "Email and password are required."
      };
    }

    const loginPromise =
      authClient()
        .auth
        .signInWithPassword({
          email: String(email).trim(),
          password: String(password)
        });

    const timeoutPromise =
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            data: null,
            error: {
              message:
                "Login request timed out. Please check your internet connection."
            }
          });
        }, 15000);
      });

    const result =
      await Promise.race([
        loginPromise,
        timeoutPromise
      ]);

    const data =
      result?.data;

    const error =
      result?.error;

    if (error) {
      return {
        ok: false,
        message:
          authErrorMessage(error)
      };
    }

    if (
      !data ||
      !data.session ||
      !data.user
    ) {
      return {
        ok: false,
        message:
          "Sign-in failed. No active session was created."
      };
    }

    if (
      String(data.user.id) !==
      ADMIN_USER_ID
    ) {

      try {
        await authClient()
          .auth
          .signOut();
      } catch (e) {}

      return {
        ok: false,
        message:
          "This account is not authorized for the Admin Panel."
      };
    }

    return {
      ok: true
    };

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    return {
      ok: false,
      message:
        authErrorMessage(error)
    };
  }
}


async function isAdminLoggedIn() {
  try {

    const {
      data,
      error
    } =
      await authClient()
        .auth
        .getSession();

    if (
      error ||
      !data ||
      !data.session ||
      !data.session.user
    ) {
      return false;
    }

    return (
      String(
        data.session.user.id
      ) === ADMIN_USER_ID
    );

  } catch (error) {

    return false;
  }
}


let _loggingOut = false;


async function adminLogout() {

  _loggingOut = true;

  try {

    await authClient()
      .auth
      .signOut();

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );
  }
}


async function requireAdminAuth() {

  const goLogin =
    () => {

      document.documentElement
        .style
        .visibility = "";

      location.replace(
        "login.html"
      );

      return false;
    };

  try {

    const client =
      authClient();

    const {
      data,
      error
    } =
      await client
        .auth
        .getSession();

    if (
      error ||
      !data ||
      !data.session ||
      !data.session.user
    ) {
      return goLogin();
    }

    if (
      String(
        data.session.user.id
      ) !== ADMIN_USER_ID
    ) {

      await client.auth.signOut();

      return goLogin();
    }

    client.auth.onAuthStateChange(
      event => {

        if (
          event === "SIGNED_OUT" &&
          !_loggingOut
        ) {
          location.replace(
            "login.html"
          );
        }
      }
    );

    document.documentElement
      .style
      .visibility = "";

    return true;

  } catch (error) {

    console.error(
      "Auth check failed:",
      error
    );

    return goLogin();
  }
}


/* =========================================================
   PANEL LOADERS
   ========================================================= */

const PANEL_LOADERS = {};


/* =========================================================
   DASHBOARD
   ========================================================= */

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

      const getLength =
        result =>
          result.status === "fulfilled" &&
          Array.isArray(result.value)
            ? result.value.length
            : 0;

      const values = {
        trips:
          getLength(tripsResult),

        vehicles:
          getLength(vehiclesResult),

        gallery:
          getLength(galleryResult),

        videos:
          getLength(videosResult),

        reviews:
          getLength(reviewsResult),

        enquiries:
          getLength(enquiriesResult)
      };

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
        values.trips
      );

      setText(
        "stat-vehicles",
        values.vehicles
      );

      setText(
        "stat-gallery",
        values.gallery
      );

      setText(
        "stat-videos",
        values.videos
      );

      setText(
        "stat-reviews",
        values.reviews
      );

      setText(
        "stat-enquiries",
        values.enquiries
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

    if (!list) return;

    try {

      const trips =
        await getTrips();

      const search =
        $a("trip-search");

      const query =
        search
          ? String(
              search.value || ""
            )
              .trim()
              .toLowerCase()
          : "";

      const filtered =
        trips.filter(
          trip => {

            if (!query) {
              return true;
            }

            return [
              trip.name,
              trip.destination,
              trip.duration,
              trip.price,
              trip.description,
              trip.vehicle
            ].some(
              value =>
                String(
                  value || ""
                )
                  .toLowerCase()
                  .includes(query)
            );
          }
        );

      if (!filtered.length) {

        list.innerHTML =
          empty(
            trips.length
              ? "No trips match your search."
              : "No trips available yet."
          );

        return;
      }

      list.innerHTML =
        filtered
          .map(trip => {

            return `
              <div class="a-item-card">

                <img
                  src="${ea(
                    imgFallback(
                      trip.image
                    )
                  )}"
                  alt=""
                  onerror="this.onerror=null;this.src=''">

                <div class="a-item-info">

                  <h3>
                    ${ea(
                      trip.name
                    )}
                  </h3>

                  <p>
                    ${ea(
                      trip.destination
                    )}
                  </p>

                  ${
                    trip.duration
                      ? `
                        <p>
                          Duration:
                          ${ea(
                            trip.duration
                          )}
                        </p>
                      `
                      : ""
                  }

                  ${
                    trip.price
                      ? `
                        <p>
                          Price:
                          ${ea(
                            trip.price
                          )}
                        </p>
                      `
                      : ""
                  }

                  ${
                    trip.vehicle
                      ? `
                        <p>
                          Vehicle:
                          ${ea(
                            trip.vehicle
                          )}
                        </p>
                      `
                      : ""
                  }

                  ${
                    trip.description
                      ? `
                        <p>
                          ${ea(
                            trip.description
                          )}
                        </p>
                      `
                      : ""
                  }

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
          })
          .join("");

    } catch (error) {

      console.error(
        "Trips error:",
        error
      );

      list.innerHTML =
        empty(
          readableError(error) ||
          "Unable to load trips."
        );
    }
  };


let tripImageDraft = "";


async function openTripModal(id) {

  try {

    const trip =
      id
        ? await getTripById(id)
        : null;

    const vehicles =
      await getVehicles();

    const form =
      $a("trip-form");

    if (!form) {
      adminToast(
        "Trip form was not found.",
        "error"
      );
      return;
    }

    try {
      form.reset();
    } catch (e) {}

    form.dataset.id =
      trip
        ? String(trip.id)
        : "";

    showError(
      "trip-error",
      ""
    );

    const title =
      $a("trip-modal-title");

    if (title) {
      title.textContent =
        trip
          ? "Edit Trip"
          : "Add Trip";
    }

    setFieldValue(
      "trip-name",
      trip?.name || ""
    );

    setFieldValue(
      "trip-destination",
      trip?.destination || ""
    );

    setFieldValue(
      "trip-duration",
      trip?.duration || ""
    );

    setFieldValue(
      "trip-price",
      trip?.price || ""
    );

    setFieldValue(
      "trip-description",
      trip?.description || ""
    );

    tripImageDraft =
      trip?.image || "";

    const preview =
      $a("trip-image-preview");

    if (preview) {
      preview.src =
        imgFallback(
          tripImageDraft
        );
    }

    const container =
      $a(
        "trip-vehicle-checkboxes"
      );

    if (container) {

      if (!vehicles.length) {

        container.innerHTML = `
          <span class="a-item-meta">
            No vehicles yet.
            Add a vehicle first.
          </span>
        `;

      } else {

        const selected =
          Array.isArray(
            trip?.vehicleIds
          )
            ? trip.vehicleIds
                .map(Number)
            : [];

        container.innerHTML =
          vehicles
            .map(vehicle => {

              const checked =
                selected.includes(
                  Number(
                    vehicle.id
                  )
                )
                  ? "checked"
                  : "";

              const unavailable =
                vehicle.available === false
                  ? " (unavailable)"
                  : "";

              return `
                <label>

                  <input
                    type="checkbox"
                    value="${ea(
                      vehicle.id
                    )}"
                    ${checked}>

                  ${ea(
                    vehicle.name
                  )}

                  ${
                    vehicle.capacity !== null &&
                    vehicle.capacity !== undefined
                      ? ` — ${ea(
                          vehicle.capacity
                        )} seats`
                      : ""
                  }

                  ${ea(
                    unavailable
                  )}

                </label>
              `;
            })
            .join("");
      }
    }

    openModal(
      "trip-modal"
    );

  } catch (error) {

    console.error(
      "Open trip modal error:",
      error
    );

    adminToast(
      readableError(error) ||
      "Unable to open trip form.",
      "error"
    );
  }
}


/* =========================================================
   SAVE TRIP
   ========================================================= */

async function saveTripForm(event) {

  event.preventDefault();

  const form =
    event.target;

  const name =
    getFieldValue(
      "trip-name"
    ).trim();

  const destination =
    getFieldValue(
      "trip-destination"
    ).trim();

  if (!name || !destination) {

    showError(
      "trip-error",
      "Trip name and destination are required."
    );

    return;
  }

  showError(
    "trip-error",
    ""
  );

  const vehicleIds =
    [
      ...document.querySelectorAll(
        "#trip-vehicle-checkboxes input[type='checkbox']:checked"
      )
    ]
      .map(
        checkbox =>
          Number(
            checkbox.value
          )
      )
      .filter(
        Number.isFinite
      );

  /*
   IMPORTANT:
   This payload exactly matches data.js saveTrip().
  */

  const payload = {
    name,
    destination,

    duration:
      getFieldValue(
        "trip-duration"
      ).trim(),

    price:
      getFieldValue(
        "trip-price"
      ).trim(),

    description:
      getFieldValue(
        "trip-description"
      ).trim(),

    image:
      tripImageDraft || null,

    vehicleIds
  };

  try {

    const id =
      form.dataset.id;

    let result;

    if (id) {

      result =
        await updateTrip(
          id,
          payload
        );

      if (!result) {
        throw new Error(
          "Trip update returned no record."
        );
      }

      adminToast(
        "Trip updated successfully.",
        "success"
      );

    } else {

      result =
        await saveTrip(
          payload
        );

      if (!result) {
        throw new Error(
          "Trip was not created."
        );
      }

      adminToast(
        "Trip added successfully.",
        "success"
      );
    }

    closeModal(
      "trip-modal"
    );

    await PANEL_LOADERS.trips();

    await PANEL_LOADERS.dashboard();

  } catch (error) {

    console.error(
      "SAVE TRIP ERROR:",
      error
    );

    const message =
      readableError(error);

    showError(
      "trip-error",
      message
    );

    adminToast(
      message,
      "error"
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

    if (!list) return;

    try {

      const vehicles =
        await getVehicles();

      if (!vehicles.length) {

        list.innerHTML =
          empty(
            "No vehicles available yet."
          );

        return;
      }

      list.innerHTML =
        vehicles
          .map(vehicle => {

            const available =
              vehicle.available !== false;

            return `
              <div class="a-item-card">

                <img
                  src="${ea(
                    imgFallback(
                      vehicle.image_url
                    )
                  )}"
                  alt=""
                  onerror="this.style.display='none'">

                <div class="a-item-info">

                  <h3>
                    ${ea(
                      vehicle.name
                    )}
                  </h3>

                  ${
                    vehicle.type
                      ? `
                        <p>
                          ${ea(
                            vehicle.type
                          )}
                        </p>
                      `
                      : ""
                  }

                  ${
                    vehicle.capacity !== null &&
                    vehicle.capacity !== undefined
                      ? `
                        <p>
                          Capacity:
                          ${ea(
                            vehicle.capacity
                          )}
                          seats
                        </p>
                      `
                      : ""
                  }

                  ${
                    vehicle.registration
                      ? `
                        <p>
                          Registration:
                          ${ea(
                            vehicle.registration
                          )}
                        </p>
                      `
                      : ""
                  }

                  <span class="a-badge">
                    ${
                      available
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
                      available
                        ? "Mark Unavailable"
                        : "Mark Available",
                      `data-toggle-vehicle="${ea(
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
          })
          .join("");

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


let vehicleImageDraft = "";


async function openVehicleModal(id) {

  try {

    const vehicles =
      await getVehicles();

    const vehicle =
      id
        ? vehicles.find(
            item =>
              Number(item.id) ===
              Number(id)
          )
        : null;

    const form =
      $a("vehicle-form");

    if (!form) {
      adminToast(
        "Vehicle form was not found.",
        "error"
      );
      return;
    }

    try {
      form.reset();
    } catch (e) {}

    form.dataset.id =
      vehicle
        ? String(vehicle.id)
        : "";

    showError(
      "vehicle-error",
      ""
    );

    const title =
      $a(
        "vehicle-modal-title"
      );

    if (title) {
      title.textContent =
        vehicle
          ? "Edit Vehicle"
          : "Add Vehicle";
    }

    setFieldValue(
      "vehicle-name",
      vehicle?.name || ""
    );

    setFieldValue(
      "vehicle-type",
      vehicle?.type || ""
    );

    setFieldValue(
      "vehicle-capacity",
      vehicle?.capacity ?? ""
    );

    setFieldValue(
      "vehicle-registration",
      vehicle?.registration || ""
    );

    setFieldValue(
      "vehicle-available",
      vehicle?.available === false
        ? "false"
        : "true"
    );

    vehicleImageDraft =
      vehicle?.image_url || "";

    const preview =
      $a(
        "vehicle-image-preview"
      );

    if (preview) {
      preview.src =
        imgFallback(
          vehicleImageDraft
        );
    }

    openModal(
      "vehicle-modal"
    );

  } catch (error) {

    adminToast(
      readableError(error),
      "error"
    );
  }
}


async function saveVehicleForm(event) {

  event.preventDefault();

  const form =
    event.target;

  const name =
    getFieldValue(
      "vehicle-name"
    ).trim();

  if (!name) {

    showError(
      "vehicle-error",
      "Vehicle name is required."
    );

    return;
  }

  const payload = {
    name,

    type:
      getFieldValue(
        "vehicle-type"
      ).trim(),

    capacity:
      getFieldValue(
        "vehicle-capacity"
      ).trim(),

    registration:
      getFieldValue(
        "vehicle-registration"
      ).trim(),

    available:
      getFieldValue(
        "vehicle-available"
      ) !== "false",

    image_url:
      vehicleImageDraft || null
  };

  try {

    if (form.dataset.id) {

      await updateVehicle(
        form.dataset.id,
        payload
      );

      adminToast(
        "Vehicle updated successfully.",
        "success"
      );

    } else {

      await saveVehicle(
        payload
      );

      adminToast(
        "Vehicle added successfully.",
        "success"
      );
    }

    closeModal(
      "vehicle-modal"
    );

    await PANEL_LOADERS.vehicles();

    await PANEL_LOADERS.dashboard();

  } catch (error) {

    console.error(
      "SAVE VEHICLE ERROR:",
      error
    );

    showError(
      "vehicle-error",
      readableError(error)
    );

    adminToast(
      readableError(error),
      "error"
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

    if (!list) return;

    try {

      const items =
        await getGallery();

      if (!items.length) {

        list.innerHTML =
          empty(
            "No gallery images available."
          );

        return;
      }

      list.innerHTML =
        items
          .map(item => {

            return `
              <div class="a-item-card">

                <img
                  src="${ea(
                    imgFallback(
                      item.image_url
                    )
                  )}"
                  alt=""
                  onerror="this.style.display='none'">

                <div class="a-item-info">

                  <h3>
                    ${ea(
                      item.caption ||
                      "No caption"
                    )}
                  </h3>

                  ${
                    item.description
                      ? `
                        <p>
                          ${ea(
                            item.description
                          )}
                        </p>
                      `
                      : ""
                  }

                  <span class="a-badge">
                    ${
                      item.approved === false
                        ? "Hidden"
                        : "Visible"
                    }
                  </span>

                  <div class="a-item-actions">

                    ${actionButton(
                      item.approved === false
                        ? "Show"
                        : "Hide",
                      `data-toggle-gallery="${ea(
                        item.id
                      )}"`
                    )}

                    ${actionButton(
                      "Delete",
                      `data-delete-photo="${ea(
                        item.id
                      )}"`,
                      "a-btn-danger"
                    )}

                  </div>

                </div>

              </div>
            `;
          })
          .join("");

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


async function saveGalleryForm(event) {

  event.preventDefault();

  const fileInput =
    $a("g-image");

  const file =
    fileInput?.files?.[0];

  if (!file) {

    adminToast(
      "Please select an image.",
      "error"
    );

    return;
  }

  const caption =
    getFieldValue(
      "g-caption"
    ).trim();

  const description =
    getFieldValue(
      "g-description"
    ).trim();

  try {

    const image =
      await readImage(
        file,
        1200
      );

    await saveGalleryItem({
      image_url: image,
      caption,
      description
    });

    adminToast(
      "Image added successfully.",
      "success"
    );

    const form =
      $a(
        "gallery-add-form"
      );

    if (form) {
      form.reset();
    }

    await PANEL_LOADERS.gallery();

    await PANEL_LOADERS.dashboard();

  } catch (error) {

    console.error(
      "SAVE GALLERY ERROR:",
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

    if (!list) return;

    try {

      const videos =
        await getVideos();

      if (!videos.length) {

        list.innerHTML =
          empty(
            "No videos available yet."
          );

        return;
      }

      list.innerHTML =
        videos
          .map(video => {

            let thumbnail = "";

            if (video.youtubeId) {

              thumbnail =
                "https://img.youtube.com/vi/" +
                encodeURIComponent(
                  video.youtubeId
                ) +
                "/hqdefault.jpg";
            }

            return `
              <div class="a-item-card">

                ${
                  thumbnail
                    ? `
                      <img
                        src="${ea(
                          thumbnail
                        )}"
                        alt=""
                        onerror="this.style.display='none'">
                    `
                    : ""
                }

                <div class="a-item-info">

                  <h3>
                    ${ea(
                      video.title
                    )}
                  </h3>

                  ${
                    video.description
                      ? `
                        <p>
                          ${ea(
                            video.description
                          )}
                        </p>
                      `
                      : ""
                  }

                  <p>
                    YouTube:
                    ${ea(
                      video.youtubeId ||
                      "Not set"
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
          })
          .join("");

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


async function openVideoModal(id) {

  try {

    const videos =
      await getVideos();

    const video =
      id
        ? videos.find(
            item =>
              Number(item.id) ===
              Number(id)
          )
        : null;

    const form =
      $a("video-form");

    if (!form) {
      adminToast(
        "Video form was not found.",
        "error"
      );
      return;
    }

    try {
      form.reset();
    } catch (e) {}

    form.dataset.id =
      video
        ? String(video.id)
        : "";

    showError(
      "video-error",
      ""
    );

    const title =
      $a(
        "video-modal-title"
      );

    if (title) {
      title.textContent =
        video
          ? "Edit Video"
          : "Add Video";
    }

    setFieldValue(
      "video-title",
      video?.title || ""
    );

    setFieldValue(
      "video-description",
      video?.description || ""
    );

    setFieldValue(
      "video-youtube",
      video?.youtubeId || ""
    );

    openModal(
      "video-modal"
    );

  } catch (error) {

    adminToast(
      readableError(error),
      "error"
    );
  }
}


async function saveVideoForm(event) {

  event.preventDefault();

  const form =
    event.target;

  const title =
    getFieldValue(
      "video-title"
    ).trim();

  if (!title) {

    showError(
      "video-error",
      "Video title is required."
    );

    return;
  }

  const raw =
    getFieldValue(
      "video-youtube"
    ).trim();

  let youtubeId = "";

  if (raw) {

    youtubeId =
      extractYouTubeId(
        raw
      );

    if (!youtubeId) {

      showError(
        "video-error",
        "Please enter a valid YouTube link or video ID."
      );

      return;
    }
  }

  const payload = {
    title,

    description:
      getFieldValue(
        "video-description"
      ).trim(),

    youtubeId
  };

  try {

    if (form.dataset.id) {

      await updateVideo(
        form.dataset.id,
        payload
      );

      adminToast(
        "Video updated successfully.",
        "success"
      );

    } else {

      await saveVideo(
        payload
      );

      adminToast(
        "Video added successfully.",
        "success"
      );
    }

    closeModal(
      "video-modal"
    );

    await PANEL_LOADERS.videos();

    await PANEL_LOADERS.dashboard();

  } catch (error) {

    showError(
      "video-error",
      readableError(error)
    );

    adminToast(
      readableError(error),
      "error"
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

    if (!list) return;

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
        reviews
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
          })
          .join("");

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


async function openReviewModal(id) {

  try {

    const reviews =
      await getReviews();

    const review =
      id
        ? reviews.find(
            item =>
              Number(item.id) ===
              Number(id)
          )
        : null;

    /*
      Supports both IDs so the admin code
      works with the current dashboard.
    */

    const form =
      $a("review-form-admin") ||
      $a("review-form");

    if (!form) {

      adminToast(
        "Review form was not found.",
        "error"
      );

      return;
    }

    try {
      form.reset();
    } catch (e) {}

    form.dataset.id =
      review
        ? String(review.id)
        : "";

    showError(
      "review-error",
      ""
    );

    const title =
      $a(
        "review-modal-title"
      );

    if (title) {
      title.textContent =
        review
          ? "Edit Review"
          : "Add Review";
    }

    setFieldValue(
      "review-name",
      review?.name || ""
    );

    setFieldValue(
      "review-rating",
      review?.rating || 5
    );

    setFieldValue(
      "review-text",
      review?.review ||
      review?.comment ||
      ""
    );

    setFieldValue(
      "review-approved",
      review
        ? String(
            !!review.approved
          )
        : "true"
    );

    openModal(
      "review-modal"
    );

  } catch (error) {

    adminToast(
      readableError(error),
      "error"
    );
  }
}


async function saveReviewForm(event) {

  event.preventDefault();

  const form =
    event.target;

  const name =
    getFieldValue(
      "review-name"
    ).trim();

  const reviewText =
    getFieldValue(
      "review-text"
    ).trim();

  if (!name || !reviewText) {

    showError(
      "review-error",
      "Name and review are required."
    );

    return;
  }

  let rating =
    parseInt(
      getFieldValue(
        "review-rating"
      ),
      10
    );

  if (!Number.isFinite(rating)) {
    rating = 5;
  }

  rating =
    Math.max(
      1,
      Math.min(
        5,
        rating
      )
    );

  const payload = {
    name,
    rating,
    review: reviewText,

    approved:
      getFieldValue(
        "review-approved"
      ) === "true"
  };

  try {

    if (form.dataset.id) {

      await updateReview(
        form.dataset.id,
        payload
      );

      adminToast(
        "Review updated successfully.",
        "success"
      );

    } else {

      await saveReview(
        payload
      );

      adminToast(
        "Review added successfully.",
        "success"
      );
    }

    closeModal(
      "review-modal"
    );

    await PANEL_LOADERS.reviews();

    await PANEL_LOADERS.dashboard();

  } catch (error) {

    showError(
      "review-error",
      readableError(error)
    );

    adminToast(
      readableError(error),
      "error"
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

    if (!list) return;

    try {

      const enquiries =
        await getEnquiries();

      const filter =
        $a("enquiry-filter");

      const selected =
        filter
          ? filter.value
          : "";

      const filtered =
        enquiries
          .filter(
            enquiry =>
              !selected ||
              enquiry.status === selected
          )
          .sort(
            (a, b) =>
              String(
                b.created_at || ""
              ).localeCompare(
                String(
                  a.created_at || ""
                )
              )
          );

      if (!filtered.length) {

        list.innerHTML =
          empty(
            "No enquiries found."
          );

        return;
      }

      list.innerHTML =
        filtered
          .map(enquiry => {

            const status =
              enquiry.status ||
              "New";

            const statuses = [
              "New",
              "Contacted",
              "Confirmed",
              "Closed"
            ];

            const options =
              statuses
                .map(
                  value => `
                    <option
                      value="${ea(
                        value
                      )}"
                      ${
                        value === status
                          ? "selected"
                          : ""
                      }>
                      ${ea(
                        value
                      )}
                    </option>
                  `
                )
                .join("");

            return `
              <div class="a-item-card">

                <div class="a-item-info">

                  <h3>
                    ${ea(
                      enquiry.name ||
                      "Unnamed"
                    )}
                  </h3>

                  <p>
                    Phone:
                    ${ea(
                      enquiry.phone || ""
                    )}
                  </p>

                  <p>
                    Trip:
                    ${ea(
                      enquiry.trip ||
                      "General enquiry"
                    )}
                  </p>

                  <p>
                    ${ea(
                      enquiry.message || ""
                    )}
                  </p>

                  <p>
                    ${ea(
                      fmtDate(
                        enquiry.created_at
                      )
                    )}
                  </p>

                  <select
                    data-enquiry-status="${ea(
                      enquiry.id
                    )}">
                    ${options}
                  </select>

                  <div class="a-item-actions">

                    ${actionButton(
                      "Delete",
                      `data-delete-enquiry="${ea(
                        enquiry.id
                      )}"`,
                      "a-btn-danger"
                    )}

                  </div>

                </div>

              </div>
            `;
          })
          .join("");

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

      const business =
        await getBusiness();

      const data =
        business || {};

      setFieldValue(
        "settings-phone",
        data.phone || ""
      );

      setFieldValue(
        "settings-whatsapp",
        data.whatsapp || ""
      );

      setFieldValue(
        "settings-email",
        data.email || ""
      );

      setFieldValue(
        "settings-address",
        data.address || ""
      );

      setFieldValue(
        "settings-hours",
        data.hours || ""
      );

      setFieldValue(
        "settings-map",
        data.mapUrl || ""
      );

      setFieldValue(
        "settings-facebook",
        data.facebook || ""
      );

      setFieldValue(
        "settings-instagram",
        data.instagram || ""
      );

      setFieldValue(
        "settings-youtube",
        data.youtube || ""
      );

      setFieldValue(
        "settings-about",
        data.aboutText || ""
      );

      setFieldValue(
        "settings-footer",
        data.footerText || ""
      );

    } catch (error) {

      console.error(
        "Settings error:",
        error
      );
    }
  };


async function saveSettingsForm(event) {

  event.preventDefault();

  const data = {

    phone:
      getFieldValue(
        "settings-phone"
      ).trim(),

    whatsapp:
      getFieldValue(
        "settings-whatsapp"
      ).trim(),

    email:
      getFieldValue(
        "settings-email"
      ).trim(),

    address:
      getFieldValue(
        "settings-address"
      ).trim(),

    hours:
      getFieldValue(
        "settings-hours"
      ).trim(),

    mapUrl:
      getFieldValue(
        "settings-map"
      ).trim(),

    facebook:
      getFieldValue(
        "settings-facebook"
      ).trim(),

    instagram:
      getFieldValue(
        "settings-instagram"
      ).trim(),

    youtube:
      getFieldValue(
        "settings-youtube"
      ).trim(),

    aboutText:
      getFieldValue(
        "settings-about"
      ).trim(),

    footerText:
      getFieldValue(
        "settings-footer"
      ).trim()
  };

  try {

    await saveSettings(
      data
    );

    adminToast(
      "Settings saved successfully.",
      "success"
    );

  } catch (error) {

    adminToast(
      readableError(error),
      "error"
    );
  }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPanel(name) {

  document
    .querySelectorAll(
      ".admin-panel"
    )
    .forEach(panel => {

      panel.classList.toggle(
        "active",
        panel.id ===
          "panel-" + name
      );
    });

  document
    .querySelectorAll(
      "[data-panel]"
    )
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.panel === name
      );
    });

  if (
    PANEL_LOADERS[name]
  ) {

    guard(
      PANEL_LOADERS[name]
    );
  }

  window.scrollTo(
    0,
    0
  );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

let adminInitialized =
  false;


function initAdmin() {

  if (adminInitialized) {
    return;
  }

  adminInitialized =
    true;


  /* =======================================================
     CLICK HANDLER
     ======================================================= */

  document.addEventListener(
    "click",
    async event => {

      const target =
        event.target.closest(
          "button, a"
        );

      if (!target) {
        return;
      }

      const data =
        target.dataset;


      /* PANEL */

      if (data.panel) {

        event.preventDefault();

        showPanel(
          data.panel
        );

        return;
      }


      /* CLOSE */

      if (data.close) {

        closeModal(
          data.close
        );

        return;
      }


      /* LOGOUT */

      if (
        target.classList.contains(
          "a-logout-btn"
        )
      ) {

        event.preventDefault();

        await adminLogout();

        location.replace(
          "login.html"
        );

        return;
      }


      /* QUICK ACTIONS */

      if (
        data.quick === "trip"
      ) {

        showPanel("trips");

        await openTripModal(null);

        return;
      }

      if (
        data.quick === "vehicle"
      ) {

        showPanel("vehicles");

        await openVehicleModal(null);

        return;
      }

      if (
        data.quick === "video"
      ) {

        showPanel("videos");

        await openVideoModal(null);

        return;
      }

      if (
        data.quick === "review"
      ) {

        showPanel("reviews");

        await openReviewModal(null);

        return;
      }

      if (
        data.quick === "gallery"
      ) {

        showPanel("gallery");

        const input =
          $a("g-image");

        if (input) {
          input.focus();
        }

        return;
      }


      /* TRIPS */

      if (data.editTrip) {

        await openTripModal(
          data.editTrip
        );

        return;
      }

      if (data.deleteTrip) {

        if (
          !confirm(
            "Delete this trip?"
          )
        ) {
          return;
        }

        await guard(
          async () => {

            await deleteTrip(
              data.deleteTrip
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


      /* VEHICLES */

      if (data.editVehicle) {

        await openVehicleModal(
          data.editVehicle
        );

        return;
      }

      if (data.toggleVehicle) {

        await guard(
          async () => {

            const vehicles =
              await getVehicles();

            const vehicle =
              vehicles.find(
                item =>
                  Number(item.id) ===
                  Number(
                    data.toggleVehicle
                  )
              );

            if (!vehicle) {
              throw new Error(
                "Vehicle not found."
              );
            }

            await updateVehicle(
              vehicle.id,
              {
                available:
                  vehicle.available === false
              }
            );

            adminToast(
              "Vehicle availability updated.",
              "success"
            );

            await PANEL_LOADERS.vehicles();

            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }

      if (data.deleteVehicle) {

        if (
          !confirm(
            "Delete this vehicle?"
          )
        ) {
          return;
        }

        await guard(
          async () => {

            const vehicleId =
              Number(
                data.deleteVehicle
              );

            const trips =
              await getTrips();

            for (
              const trip of trips
            ) {

              const ids =
                Array.isArray(
                  trip.vehicleIds
                )
                  ? trip.vehicleIds
                  : [];

              if (
                ids
                  .map(Number)
                  .includes(vehicleId)
              ) {

                await updateTrip(
                  trip.id,
                  {
                    vehicleIds:
                      ids.filter(
                        id =>
                          Number(id) !==
                          vehicleId
                      )
                  }
                );
              }
            }

            await deleteVehicle(
              vehicleId
            );

            adminToast(
              "Vehicle deleted successfully.",
              "success"
            );

            await PANEL_LOADERS.vehicles();

            await PANEL_LOADERS.trips();

            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /* GALLERY */

      if (data.toggleGallery) {

        await guard(
          async () => {

            const gallery =
              await getGallery();

            const item =
              gallery.find(
                row =>
                  Number(row.id) ===
                  Number(
                    data.toggleGallery
                  )
              );

            if (!item) {
              throw new Error(
                "Gallery item not found."
              );
            }

            await updateGalleryItem(
              item.id,
              {
                approved:
                  item.approved === false
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

      if (data.deletePhoto) {

        if (
          !confirm(
            "Delete this gallery image?"
          )
        ) {
          return;
        }

        await guard(
          async () => {

            await deleteGalleryItem(
              data.deletePhoto
            );

            adminToast(
              "Gallery image deleted.",
              "success"
            );

            await PANEL_LOADERS.gallery();

            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /* VIDEOS */

      if (data.editVideo) {

        await openVideoModal(
          data.editVideo
        );

        return;
      }

      if (data.deleteVideo) {

        if (
          !confirm(
            "Delete this video?"
          )
        ) {
          return;
        }

        await guard(
          async () => {

            await deleteVideo(
              data.deleteVideo
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


      /* REVIEWS */

      if (data.editReview) {

        await openReviewModal(
          data.editReview
        );

        return;
      }

      if (data.toggleReview) {

        await guard(
          async () => {

            const reviews =
              await getReviews();

            const review =
              reviews.find(
                row =>
                  Number(row.id) ===
                  Number(
                    data.toggleReview
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

      if (data.deleteReview) {

        if (
          !confirm(
            "Delete this review?"
          )
        ) {
          return;
        }

        await guard(
          async () => {

            await deleteReview(
              data.deleteReview
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


      /* ENQUIRIES */

      if (data.deleteEnquiry) {

        if (
          !confirm(
            "Delete this enquiry?"
          )
        ) {
          return;
        }

        await guard(
          async () => {

            await deleteEnquiry(
              data.deleteEnquiry
            );

            adminToast(
              "Enquiry deleted successfully.",
              "success"
            );

            await PANEL_LOADERS.enquiries();

            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }

    }
  );


  /* =======================================================
     CHANGE EVENTS
     ======================================================= */

  document.addEventListener(
    "change",
    event => {

      const target =
        event.target;


      /* ENQUIRY STATUS */

      if (
        target?.dataset?.enquiryStatus
      ) {

        guard(
          async () => {

            await updateEnquiry(
              target.dataset
                .enquiryStatus,
              {
                status:
                  target.value
              }
            );

            adminToast(
              "Enquiry status updated.",
              "success"
            );

            await PANEL_LOADERS.enquiries();

            await PANEL_LOADERS.dashboard();
          }
        );
      }


      /* TRIP IMAGE */

      if (
        target?.id ===
        "trip-image-input"
      ) {

        guard(
          async () => {

            const file =
              target.files?.[0];

            if (!file) {
              return;
            }

            tripImageDraft =
              await readImage(
                file
              );

            const preview =
              $a(
                "trip-image-preview"
              );

            if (preview) {
              preview.src =
                tripImageDraft;
            }
          }
        );
      }


      /* VEHICLE IMAGE */

      if (
        target?.id ===
        "vehicle-image-input"
      ) {

        guard(
          async () => {

            const file =
              target.files?.[0];

            if (!file) {
              return;
            }

            vehicleImageDraft =
              await readImage(
                file
              );

            const preview =
              $a(
                "vehicle-image-preview"
              );

            if (preview) {
              preview.src =
                vehicleImageDraft;
            }
          }
        );
      }


      /* ENQUIRY FILTER */

      if (
        target?.id ===
        "enquiry-filter"
      ) {

        guard(
          PANEL_LOADERS
            .enquiries
        );
      }

    }
  );


  /* =======================================================
     SEARCH
     ======================================================= */

  const tripSearch =
    $a("trip-search");

  if (tripSearch) {

    tripSearch.addEventListener(
      "input",
      () => {

        guard(
          PANEL_LOADERS
            .trips
        );
      }
    );
  }


  /* =======================================================
     ADD BUTTONS
     ======================================================= */

  const addTrip =
    $a("add-trip-btn");

  if (addTrip) {

    addTrip.addEventListener(
      "click",
      () =>
        openTripModal(null)
    );
  }


  const addVehicle =
    $a("add-vehicle-btn");

  if (addVehicle) {

    addVehicle.addEventListener(
      "click",
      () =>
        openVehicleModal(null)
    );
  }


  const addVideo =
    $a("add-video-btn");

  if (addVideo) {

    addVideo.addEventListener(
      "click",
      () =>
        openVideoModal(null)
    );
  }


  const addReview =
    $a("add-review-btn");

  if (addReview) {

    addReview.addEventListener(
      "click",
      () =>
        openReviewModal(null)
    );
  }


  /* =======================================================
     FORMS
     ======================================================= */

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


  const videoForm =
    $a("video-form");

  if (videoForm) {

    videoForm.addEventListener(
      "submit",
      saveVideoForm
    );
  }


  const reviewForm =
    $a("review-form-admin") ||
    $a("review-form");

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


  const galleryForm =
    $a("gallery-add-form");

  if (galleryForm) {

    galleryForm.addEventListener(
      "submit",
      saveGalleryForm
    );
  }


  /* =======================================================
     ESCAPE
     ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        document
          .querySelectorAll(
            ".a-modal-overlay.open"
          )
          .forEach(
            modal =>
              modal.classList.remove(
                "open"
              )
          );
      }
    }
  );


  /* =======================================================
     CLICK OUTSIDE MODAL
     ======================================================= */

  document.addEventListener(
    "click",
    event => {

      const overlay =
        event.target.closest(
          ".a-modal-overlay"
        );

      if (
        overlay &&
        event.target === overlay
      ) {

        overlay.classList.remove(
          "open"
        );
      }
    }
  );


  /* =======================================================
     FIRST LOAD
     ======================================================= */

  showPanel(
    "dashboard"
  );
}
