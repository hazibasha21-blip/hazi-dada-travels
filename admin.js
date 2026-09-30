/* =========================================================
   HAZI DADA TRAVELS — ADMIN
   =========================================================

   Authentication:
   - Supabase Email + Password
   - Supabase session is the source of truth
   - Only the configured admin UUID is allowed into dashboard

   Data:
   - Trips / Vehicles / Gallery / Reviews / Enquiries
     -> Supabase through data.js
   - Videos / Settings
     -> localStorage through data.js

   IMPORTANT:
   - Existing Supabase tables are NOT recreated.
   - Existing RLS policies are NOT modified.
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const ADMIN_USER_ID =
  "589555e8-5853-4e58-aaac-8038ec833c80";


/* =========================================================
   AUTH
   ========================================================= */

function authClient() {

  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient ||
    !supabaseClient.auth
  ) {
    throw new Error("Supabase client unavailable");
  }

  return supabaseClient;
}


function authErrorMessage(err) {

  const msg =
    String((err && err.message) || "").toLowerCase();

  const status = err && err.status;

  if (
    status === 429 ||
    msg.includes("rate limit") ||
    msg.includes("too many")
  ) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (msg.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Please confirm it from your inbox.";
  }

  if (
    msg.includes("invalid login credentials") ||
    status === 400 ||
    status === 401
  ) {
    return "Invalid email or password.";
  }

  if (
    !status ||
    msg.includes("fetch") ||
    msg.includes("network")
  ) {
    return "Unable to connect right now. Please try again.";
  }

  return "Sign-in failed. Please try again.";
}


async function adminLogin(email, password) {

  try {

    const {
      data,
      error
    } = await authClient().auth.signInWithPassword({
      email,
      password
    });


    if (error) {
      return {
        ok: false,
        message: authErrorMessage(error)
      };
    }


    if (!data || !data.session) {

      return {
        ok: false,
        message: "Sign-in failed. Please try again."
      };

    }


    /*
     * Verify that the authenticated account is the
     * configured administrator.
     */

    if (
      data.user &&
      String(data.user.id) !== ADMIN_USER_ID
    ) {

      await authClient().auth.signOut();

      return {
        ok: false,
        message: "This account is not authorized for the Admin Panel."
      };

    }


    return {
      ok: true
    };

  } catch (e) {

    console.error(e);

    return {
      ok: false,
      message: "Unable to connect right now. Please try again."
    };

  }

}


async function isAdminLoggedIn() {

  try {

    const {
      data,
      error
    } = await authClient().auth.getSession();


    if (
      error ||
      !data ||
      !data.session
    ) {
      return false;
    }


    const user = data.session.user;


    return !!(
      user &&
      String(user.id) === ADMIN_USER_ID
    );

  } catch (e) {

    return false;

  }

}


/* Prevent duplicate logout redirects. */

let _loggingOut = false;


async function adminLogout() {

  _loggingOut = true;

  try {

    await authClient().auth.signOut();

  } catch (e) {

    console.error(e);

  }

}


async function requireAdminAuth() {

  const goLogin = () => {

    document.documentElement.style.visibility = "";

    location.replace("login.html");

    return false;

  };


  try {

    const client = authClient();


    const {
      data,
      error
    } = await client.auth.getSession();


    if (
      error ||
      !data ||
      !data.session
    ) {

      return goLogin();

    }


    const sessionUser = data.session.user;


    if (
      !sessionUser ||
      String(sessionUser.id) !== ADMIN_USER_ID
    ) {

      try {
        await client.auth.signOut();
      } catch (e) {}

      return goLogin();

    }


    /*
     * Server-side user validation.
     */

    const {
      data: userData,
      error: userError
    } = await client.auth.getUser();


    if (
      userError ||
      !userData ||
      !userData.user ||
      String(userData.user.id) !== ADMIN_USER_ID
    ) {

      try {
        await client.auth.signOut();
      } catch (e) {}

      return goLogin();

    }


    /*
     * Listen for session sign-out.
     */

    client.auth.onAuthStateChange(event => {

      if (
        event === "SIGNED_OUT" &&
        !_loggingOut
      ) {

        location.replace("login.html");

      }

    });


    document.documentElement.style.visibility = "";

    return true;

  } catch (e) {

    console.error(e);

    return goLogin();

  }

}


/* =========================================================
   HELPERS
   ========================================================= */

const $a = id => document.getElementById(id);


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


function starsA(number) {

  const n = Number(number) || 0;

  let result = "";

  for (let i = 1; i <= 5; i++) {

    result += i <= n
      ? "★"
      : "☆";

  }

  return result;

}


function fmtDate(iso) {

  try {

    return new Date(iso).toLocaleString(
      undefined,
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );

  } catch (e) {

    return "";

  }

}


function imgFallback(src) {

  return src || PLACEHOLDER_FALLBACK;

}


function adminToast(
  message,
  type = "info"
) {

  let container =
    document.querySelector(".a-toast-container");


  if (!container) {

    container =
      document.createElement("div");

    container.className =
      "a-toast-container";

    document.body.appendChild(container);

  }


  const element =
    document.createElement("div");

  element.className =
    "a-toast " + type;

  element.textContent =
    message;

  container.appendChild(element);


  requestAnimationFrame(() => {

    element.classList.add("show");

  });


  setTimeout(() => {

    element.classList.remove("show");

    setTimeout(() => {

      element.remove();

    }, 300);

  }, 3000);

}


async function guard(
  fn,
  fallbackMsg =
    "Something went wrong. Please try again."
) {

  try {

    return await fn();

  } catch (error) {

    console.error(error);

    const message =
      error &&
      error.message &&
      error.message.length < 120
        ? error.message
        : fallbackMsg;

    adminToast(
      message,
      "error"
    );

    return null;

  }

}


function showError(id, message) {

  const element = $a(id);

  if (!element) {

    console.warn(
      "Missing admin error element:",
      id
    );

    return;

  }


  element.textContent =
    message || "";

  element.style.display =
    message ? "block" : "none";

}


function readImage(
  file,
  maxSize = 1000
) {

  return new Promise(
    (resolve, reject) => {

      if (!file) {

        resolve(null);
        return;

      }


      if (
        !/^image\/(png|jpe?g|webp|gif)$/i
          .test(file.type)
      ) {

        reject(
          new Error(
            "Please choose a PNG, JPG, WEBP or GIF image."
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
            "Image is too large (max 8MB)."
          )
        );

        return;

      }


      const reader =
        new FileReader();


      reader.onerror = () => {

        reject(
          new Error(
            "Could not read the image."
          )
        );

      };


      reader.onload = () => {

        const image =
          new Image();


        image.onerror = () => {

          reject(
            new Error(
              "Could not read the image."
            )
          );

        };


        image.onload = () => {

          const scale =
            Math.min(
              1,
              maxSize /
                Math.max(
                  image.width,
                  image.height
                )
            );


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
              0.8
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


/* =========================================================
   PANELS
   ========================================================= */

const PANEL_LOADERS = {};


function showPanel(name) {

  document
    .querySelectorAll(".admin-panel")
    .forEach(panel => {

      panel.classList.toggle(
        "active",
        panel.id ===
          "panel-" + name
      );

    });


  document
    .querySelectorAll("[data-panel]")
    .forEach(link => {

      link.classList.toggle(
        "active",
        link.dataset.panel === name
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


function empty(message) {

  return `
    <div class="a-empty">
      ${ea(message)}
    </div>
  `;

}


function itemCard(
  image,
  title,
  lines,
  actionsHtml,
  extraHtml = ""
) {

  const imageHtml =
    image === null
      ? ""
      : `
        <img
          src="${ea(imgFallback(image))}"
          alt=""
          onerror="this.onerror=null;this.src=PLACEHOLDER_FALLBACK">
      `;


  return `
    <div class="a-item-card">

      ${imageHtml}

      <div class="a-item-info">

        <h3>${title}</h3>

        ${lines}

        ${extraHtml}

        <div class="a-item-actions">
          ${actionsHtml}
        </div>

      </div>

    </div>
  `;

}


function btn(
  label,
  attribute,
  className = "a-btn-outline"
) {

  return `
    <button
      type="button"
      class="a-btn ${className} a-btn-small"
      ${attribute}>
      ${label}
    </button>
  `;

}


/* =========================================================
   DASHBOARD
   ========================================================= */

PANEL_LOADERS.dashboard =
  async function () {

    const [
      trips,
      vehicles,
      gallery,
      videos,
      reviews,
      enquiries
    ] =
      await Promise.all([
        getTrips(),
        getVehicles(),
        getGallery(),
        getVideos(),
        getReviews(),
        getEnquiries()
      ]);


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


    const latest =
      array => {

        return [...array]
          .sort(
            (a, b) =>
              String(
                b.created_at || ""
              ).localeCompare(
                String(
                  a.created_at || ""
                )
              )
          )
          .slice(0, 5);

      };


    const rows =
      (
        array,
        renderer,
        emptyMessage
      ) => {

        if (!array.length) {

          return `
            <div class="a-recent-row">
              ${emptyMessage}
            </div>
          `;

        }


        return array
          .map(
            item =>
              `
              <div class="a-recent-row">
                ${renderer(item)}
              </div>
              `
          )
          .join("");

      };


    const recentEnquiries =
      $a("recent-enquiries");

    if (recentEnquiries) {

      recentEnquiries.innerHTML =
        rows(
          latest(enquiries),
          enquiry => {

            const status =
              enquiry.status || "New";

            return `
              <strong>
                ${ea(enquiry.name)}
              </strong>

              —
              ${ea(
                enquiry.trip ||
                "General"
              )}

              <span
                class="a-badge ${ea(
                  String(
                    status
                  ).toLowerCase()
                )}">
                ${ea(status)}
              </span>
            `;

          },
          "No enquiries found."
        );

    }


    const recentReviews =
      $a("recent-reviews");

    if (recentReviews) {

      recentReviews.innerHTML =
        rows(
          latest(reviews),
          review => `
            <strong>
              ${ea(review.name)}
            </strong>

            ${starsA(review.rating)}

            <br>

            ${ea(
              review.review ||
              review.comment ||
              ""
            )}
          `,
          "No reviews available."
        );

    }


    const recentTrips =
      $a("recent-trips");

    if (recentTrips) {

      recentTrips.innerHTML =
        rows(
          latest(trips),
          trip => `
            <strong>
              ${ea(trip.name)}
            </strong>

            <br>

            ${ea(
              trip.destination
            )}
          `,
          "No trips available yet."
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


    const trips =
      await getTrips();


    const searchInput =
      $a("trip-search");


    const query =
      searchInput
        ? searchInput.value
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
            trip.description
          ]
            .some(
              value =>
                String(
                  value || ""
                )
                .toLowerCase()
                .includes(query)
            );

        }
      );


    list.innerHTML =
      filtered.length

        ? filtered
            .map(
              trip =>
                itemCard(
                  trip.image,
                  ea(trip.name),
                  `
                    <p>
                      ${ea(
                        trip.destination
                      )}
                      ${trip.duration
                        ? " · " +
                          ea(
                            trip.duration
                          )
                        : ""}
                      ${trip.price
                        ? " · " +
                          ea(
                            trip.price
                          )
                        : ""}
                    </p>

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
                  `,
                  btn(
                    "Edit",
                    `data-edit-trip="${trip.id}"`
                  ) +
                  btn(
                    "Delete",
                    `data-delete-trip="${trip.id}"`,
                    "a-btn-danger"
                  )
                )
            )
            .join("")

        : empty(
            trips.length
              ? "No trips match your search."
              : "No trips available yet."
          );

  };


let tripImageDraft = "";


async function openTripModal(id) {

  const trip =
    id
      ? await getTripById(id)
      : null;


  const vehicles =
    await getVehicles();


  const form =
    $a("trip-form");

  if (!form) return;


  form.reset();


  showError(
    "trip-error",
    ""
  );


  form.dataset.id =
    trip
      ? trip.id
      : "";


  const title =
    $a("trip-modal-title");

  if (title) {

    title.textContent =
      trip
        ? "Edit Trip"
        : "Add Trip";

  }


  form.name.value =
    trip?.name || "";

  form.destination.value =
    trip?.destination || "";

  form.duration.value =
    trip?.duration || "";

  form.price.value =
    trip?.price || "";

  form.description.value =
    trip?.description || "";


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


  const checkboxContainer =
    $a(
      "trip-vehicle-checkboxes"
    );


  if (checkboxContainer) {

    if (!vehicles.length) {

      checkboxContainer.innerHTML =
        `
          <span class="a-item-meta">
            No vehicles yet.
            Add one in Vehicles first.
          </span>
        `;

    } else {

      const selected =
        trip?.vehicleIds || [];


      checkboxContainer.innerHTML =
        vehicles
          .map(
            vehicle => {

              const checked =
                selected.includes(
                  vehicle.id
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

                  —
                  ${ea(
                    vehicle.capacity ??
                    "—"
                  )}
                  seats

                  ${unavailable}

                </label>
              `;

            }
          )
          .join("");

    }

  }


  openModal(
    "trip-modal"
  );

}


async function saveTripForm(event) {

  event.preventDefault();


  const form =
    event.target;


  const name =
    form.name.value.trim();


  const destination =
    form.destination.value.trim();


  if (!name || !destination) {

    showError(
      "trip-error",
      "Trip name and destination are required."
    );

    return;

  }


  const vehicleIds =
    [
      ...document.querySelectorAll(
        "#trip-vehicle-checkboxes input:checked"
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


  const payload = {

    name,

    destination,

    duration:
      form.duration.value.trim(),

    price:
      form.price.value.trim(),

    description:
      form.description.value.trim(),

    image:
      tripImageDraft ||
      PLACEHOLDER_FALLBACK,

    vehicleIds

  };


  await guard(
    async () => {

      if (form.dataset.id) {

        await updateTrip(
          form.dataset.id,
          payload
        );

      } else {

        await saveTrip(
          payload
        );

      }


      adminToast(
        form.dataset.id
          ? "Trip updated successfully."
          : "Trip added successfully.",
        "success"
      );


      closeModal(
        "trip-modal"
      );


      await PANEL_LOADERS.trips();

    }
  );

}


/* =========================================================
   VEHICLES
   ========================================================= */

PANEL_LOADERS.vehicles =
  async function () {

    const list =
      $a("vehicles-list");

    if (!list) return;


    const vehicles =
      await getVehicles();


    list.innerHTML =
      vehicles.length

        ? vehicles
            .map(
              vehicle => {

                const available =
                  vehicle.available !== false;


                return itemCard(

                  vehicle.image_url,

                  ea(
                    vehicle.name
                  ),

                  `
                    <p>

                      ${ea(
                        vehicle.type ||
                        ""
                      )}

                      ${
                        vehicle.capacity !== null &&
                        vehicle.capacity !== undefined
                          ? " · " +
                            ea(
                              vehicle.capacity
                            ) +
                            " seats"
                          : ""
                      }

                      ${
                        vehicle.registration
                          ? " · " +
                            ea(
                              vehicle.registration
                            )
                          : ""
                      }

                    </p>
                  `,

                  btn(
                    "Edit",
                    `data-edit-vehicle="${vehicle.id}"`
                  ) +

                  btn(
                    available
                      ? "Mark Unavailable"
                      : "Mark Available",
                    `data-toggle-vehicle="${vehicle.id}"`
                  ) +

                  btn(
                    "Delete",
                    `data-delete-vehicle="${vehicle.id}"`,
                    "a-btn-danger"
                  ),

                  `
                    <span
                      class="a-badge ${
                        available
                          ? "ok"
                          : "off"
                      }">

                      ${
                        available
                          ? "Available"
                          : "Unavailable"
                      }

                    </span>
                  `

                );

              }
            )
            .join("")

        : empty(
            "No vehicles available yet."
          );

  };


let vehicleImageDraft = "";


async function openVehicleModal(id) {

  const vehicles =
    await getVehicles();


  const vehicle =
    id
      ? vehicles.find(
          item =>
            item.id ===
            Number(id)
        )
      : null;


  const form =
    $a("vehicle-form");

  if (!form) return;


  form.reset();


  showError(
    "vehicle-error",
    ""
  );


  form.dataset.id =
    vehicle
      ? vehicle.id
      : "";


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


  form.name.value =
    vehicle?.name || "";

  form.type.value =
    vehicle?.type || "";

  form.capacity.value =
    vehicle?.capacity ??
    "";

  form.registration.value =
    vehicle?.registration ||
    "";

  form.available.value =
    vehicle &&
    vehicle.available === false
      ? "false"
      : "true";


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

}


async function saveVehicleForm(event) {

  event.preventDefault();


  const form =
    event.target;


  const name =
    form.name.value.trim();


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
      form.type.value.trim(),

    capacity:
      form.capacity.value.trim(),

    registration:
      form.registration.value.trim(),

    available:
      form.available.value ===
      "true",

    image_url:
      vehicleImageDraft ||
      PLACEHOLDER_FALLBACK

  };


  await guard(
    async () => {

      if (form.dataset.id) {

        await updateVehicle(
          form.dataset.id,
          payload
        );

      } else {

        await saveVehicle(
          payload
        );

      }


      adminToast(
        form.dataset.id
          ? "Vehicle updated successfully."
          : "Vehicle added successfully.",
        "success"
      );


      closeModal(
        "vehicle-modal"
      );


      await PANEL_LOADERS.vehicles();

    }
  );

}


/* =========================================================
   GALLERY
   ========================================================= */

PANEL_LOADERS.gallery =
  async function () {

    const list =
      $a("gallery-list");

    if (!list) return;


    const items =
      await getGallery();


    list.innerHTML =
      items.length

        ? items
            .map(
              gallery => {

                const visible =
                  gallery.approved !== false;


                return itemCard(

                  gallery.image_url,

                  ea(
                    gallery.caption ||
                    "No caption"
                  ),

                  `
                    <div
                      class="a-inline-edit">

                      <input
                        type="text"
                        value="${ea(
                          gallery.caption ||
                          ""
                        )}"
                        data-caption-input="${gallery.id}"
                        aria-label="Caption">

                      ${btn(
                        "Save caption",
                        `data-save-caption="${gallery.id}"`
                      )}

                    </div>
                  `,

                  btn(
                    visible
                      ? "Hide from site"
                      : "Show on site",
                    `data-toggle-gallery="${gallery.id}"`
                  ) +

                  btn(
                    "Delete",
                    `data-delete-photo="${gallery.id}"`,
                    "a-btn-danger"
                  ),

                  `
                    <span
                      class="a-badge ${
                        visible
                          ? "ok"
                          : "off"
                      }">

                      ${
                        visible
                          ? "Visible on site"
                          : "Hidden"
                      }

                    </span>
                  `

                );

              }
            )
            .join("")

        : empty(
            "No gallery images available."
          );

  };


/* =========================================================
   VIDEOS
   ========================================================= */

PANEL_LOADERS.videos =
  async function () {

    const list =
      $a("videos-list");

    if (!list) return;


    const videos =
      await getVideos();


    list.innerHTML =
      videos.length

        ? videos
            .map(
              video => {

                const thumbnail =
                  video.youtubeId
                    ? `https://img.youtube.com/vi/${encodeURIComponent(
                        video.youtubeId
                      )}/default.jpg`
                    : "";


                return itemCard(

                  thumbnail,

                  ea(
                    video.title
                  ),

                  `
                    <p>
                      ${ea(
                        video.description ||
                        ""
                      )}
                    </p>

                    <p class="a-item-meta">

                      YouTube ID:
                      ${ea(
                        video.youtubeId ||
                        "not set"
                      )}

                    </p>
                  `,

                  btn(
                    "Edit",
                    `data-edit-video="${video.id}"`
                  ) +

                  btn(
                    "Delete",
                    `data-delete-video="${video.id}"`,
                    "a-btn-danger"
                  )

                );

              }
            )
            .join("")

        : empty(
            "No videos available yet."
          );

  };


async function openVideoModal(id) {

  const videos =
    await getVideos();


  const video =
    id
      ? videos.find(
          item =>
            item.id ===
            Number(id)
        )
      : null;


  const form =
    $a("video-form");

  if (!form) return;


  form.reset();


  showError(
    "video-error",
    ""
  );


  form.dataset.id =
    video
      ? video.id
      : "";


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


  form.title.value =
    video?.title || "";

  form.description.value =
    video?.description || "";

  form.youtube.value =
    video?.youtubeId || "";


  openModal(
    "video-modal"
  );

}


async function saveVideoForm(event) {

  event.preventDefault();


  const form =
    event.target;


  const title =
    form.title.value.trim();


  if (!title) {

    showError(
      "video-error",
      "Video title is required."
    );

    return;

  }


  const raw =
    form.youtube.value.trim();


  const youtubeId =
    extractYouTubeId(raw);


  if (
    raw &&
    !youtubeId
  ) {

    showError(
      "video-error",
      "Please enter a valid YouTube link or 11-character ID."
    );

    return;

  }


  const payload = {

    title,

    description:
      form.description.value.trim(),

    youtubeId

  };


  await guard(
    async () => {

      if (form.dataset.id) {

        await updateVideo(
          form.dataset.id,
          payload
        );

      } else {

        await saveVideo(
          payload
        );

      }


      adminToast(
        form.dataset.id
          ? "Video updated successfully."
          : "Video added successfully.",
        "success"
      );


      closeModal(
        "video-modal"
      );


      await PANEL_LOADERS.videos();

    }
  );

}


/* =========================================================
   REVIEWS
   ========================================================= */

PANEL_LOADERS.reviews =
  async function () {

    const list =
      $a("reviews-list");

    if (!list) return;


    const reviews =
      await getReviews();


    list.innerHTML =
      reviews.length

        ? reviews
            .map(
              review => {

                const approved =
                  review.approved === true;


                return itemCard(

                  null,

                  `
                    ${ea(
                      review.name
                    )}

                    <span
                      style="color:#ffb020;font-size:.85rem;">
                      ${starsA(
                        review.rating
                      )}
                    </span>
                  `,

                  `
                    <p>
                      ${ea(
                        review.review ||
                        review.comment ||
                        ""
                      )}
                    </p>
                  `,

                  btn(
                    "Edit",
                    `data-edit-review="${review.id}"`
                  ) +

                  btn(
                    approved
                      ? "Hide from site"
                      : "Approve",
                    `data-toggle-review="${review.id}"`
                  ) +

                  btn(
                    "Delete",
                    `data-delete-review="${review.id}"`,
                    "a-btn-danger"
                  ),

                  `
                    <span
                      class="a-badge ${
                        approved
                          ? "ok"
                          : "off"
                      }">

                      ${
                        approved
                          ? "Visible on site"
                          : "Pending approval"
                      }

                    </span>
                  `

                );

              }
            )
            .join("")

        : empty(
            "No reviews available."
          );

  };


async function openReviewModal(id) {

  const reviews =
    await getReviews();


  const review =
    id
      ? reviews.find(
          item =>
            item.id ===
            Number(id)
        )
      : null;


  const form =
    $a(
      "review-form-admin"
    );

  if (!form) return;


  form.reset();


  showError(
    "review-error",
    ""
  );


  form.dataset.id =
    review
      ? review.id
      : "";


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


  form.name.value =
    review?.name || "";


  form.rating.value =
    review?.rating ||
    "5";


  form.review.value =
    review?.review ||
    review?.comment ||
    "";


  form.approved.value =
    review
      ? String(
          !!review.approved
        )
      : "true";


  openModal(
    "review-modal"
  );

}


async function saveReviewForm(event) {

  event.preventDefault();


  const form =
    event.target;


  const name =
    form.name.value.trim();


  const reviewText =
    form.review.value.trim();


  if (
    !name ||
    !reviewText
  ) {

    showError(
      "review-error",
      "Name and review text are required."
    );

    return;

  }


  const rating =
    parseInt(
      form.rating.value,
      10
    );


  const payload = {

    name,

    rating:
      Number.isFinite(
        rating
      )
        ? rating
        : 5,

    review:
      reviewText,

    approved:
      form.approved.value ===
      "true"

  };


  await guard(
    async () => {

      if (form.dataset.id) {

        await updateReview(
          form.dataset.id,
          payload
        );

      } else {

        await saveReview(
          payload
        );

      }


      adminToast(
        form.dataset.id
          ? "Review updated successfully."
          : "Review added successfully.",
        "success"
      );


      closeModal(
        "review-modal"
      );


      await PANEL_LOADERS.reviews();

    }
  );

}


/* =========================================================
   ENQUIRIES
   ========================================================= */

const ENQUIRY_STATUSES = [
  "New",
  "Contacted",
  "Confirmed",
  "Closed"
];


PANEL_LOADERS.enquiries =
  async function () {

    const list =
      $a("enquiries-list");

    if (!list) return;


    const filterElement =
      $a("enquiry-filter");


    const filter =
      filterElement
        ? filterElement.value
        : "";


    const all =
      await getEnquiries();


    const rows =
      all
        .filter(
          enquiry =>
            !filter ||
            enquiry.status ===
            filter
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


    list.innerHTML =
      rows.length

        ? rows
            .map(
              enquiry => {

                const status =
                  enquiry.status ||
                  "New";


                const statusOptions =
                  ENQUIRY_STATUSES
                    .map(
                      value => `
                        <option
                          value="${ea(
                            value
                          )}"
                          ${
                            value ===
                            status
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


                return itemCard(

                  null,

                  ea(
                    enquiry.name ||
                    "Unnamed"
                  ),

                  `
                    <p>

                      📞

                      <a
                        href="tel:${ea(
                          enquiry.phone ||
                          ""
                        )}">
                        ${ea(
                          enquiry.phone ||
                          ""
                        )}
                      </a>

                      · 🧳

                      ${ea(
                        enquiry.trip ||
                        "General enquiry"
                      )}

                    </p>


                    <p>
                      ${ea(
                        enquiry.message ||
                        "—"
                      )}
                    </p>


                    <p class="a-item-meta">

                      ${ea(
                        fmtDate(
                          enquiry.created_at
                        )
                      )}

                    </p>
                  `,

                  `
                    <select
                      data-enquiry-status="${enquiry.id}"
                      aria-label="Status">

                      ${statusOptions}

                    </select>

                    ${btn(
                      "Delete",
                      `data-delete-enquiry="${enquiry.id}"`,
                      "a-btn-danger"
                    )}
                  `,

                  `
                    <span
                      class="a-badge ${ea(
                        String(
                          status
                        ).toLowerCase()
                      )}">

                      ${ea(
                        status
                      )}

                    </span>
                  `

                );

              }
            )
            .join("")

        : empty(
            "No enquiries found."
          );

  };


/* =========================================================
   SETTINGS
   ========================================================= */

PANEL_LOADERS.settings =
  async function () {

    const form =
      $a("settings-form");

    if (!form) return;


    const business =
      getBusiness();


    const fields = [
      "phone",
      "whatsapp",
      "email",
      "address",
      "hours",
      "mapUrl",
      "facebook",
      "instagram",
      "youtube",
      "aboutText",
      "footerText"
    ];


    fields.forEach(
      field => {

        if (
          form[field]
        ) {

          form[field].value =
            business[field] ||
            "";

        }

      }
    );

  };


async function saveSettingsForm(event) {

  event.preventDefault();


  const form =
    event.target;


  const fields = [
    "phone",
    "whatsapp",
    "email",
    "address",
    "hours",
    "mapUrl",
    "facebook",
    "instagram",
    "youtube",
    "aboutText",
    "footerText"
  ];


  const data = {};


  fields.forEach(
    field => {

      data[field] =
        form[field]
          ? form[field].value.trim()
          : "";

    }
  );


  if (
    data.email &&
    !/^\S+@\S+\.\S+$/.test(
      data.email
    )
  ) {

    adminToast(
      "Please enter a valid email address.",
      "error"
    );

    return;

  }


  await guard(
    async () => {

      await saveSettings(
        data
      );


      adminToast(
        "Settings updated successfully.",
        "success"
      );

    }
  );

}


/* =========================================================
   INIT / EVENTS
   ========================================================= */

let adminInitialized = false;


function initAdmin() {

  if (adminInitialized) {
    return;
  }


  adminInitialized = true;


  /* -------------------------------------------------------
     CLICK EVENTS
     ------------------------------------------------------- */

  document.addEventListener(
    "click",
    async event => {

      const element =
        event.target.closest(
          "button, a"
        );


      if (!element) {
        return;
      }


      const data =
        element.dataset;


      /* Panel navigation */

      if (data.panel) {

        event.preventDefault();

        showPanel(
          data.panel
        );

        return;

      }


      /* Modal close */

      if (data.close) {

        closeModal(
          data.close
        );

        return;

      }


      /* Quick dashboard buttons */

      if (data.quick) {

        const quickActions = {

          trip: {
            panel: "trips",
            action:
              () =>
                openTripModal(null)
          },

          vehicle: {
            panel: "vehicles",
            action:
              () =>
                openVehicleModal(null)
          },

          gallery: {
            panel: "gallery",
            action: null
          },

          video: {
            panel: "videos",
            action:
              () =>
                openVideoModal(null)
          },

          review: {
            panel: "reviews",
            action:
              () =>
                openReviewModal(null)
          }

        };


        const action =
          quickActions[
            data.quick
          ];


        if (!action) {
          return;
        }


        showPanel(
          action.panel
        );


        if (action.action) {

          await guard(
            action.action
          );

        }


        return;

      }


      /* Logout */

      if (
        element.classList.contains(
          "a-logout-btn"
        )
      ) {

        await adminLogout();

        location.replace(
          "login.html"
        );

        return;

      }


      /* ---------------------------------------------------
         TRIPS
         --------------------------------------------------- */

      if (data.editTrip) {

        await guard(
          () =>
            openTripModal(
              data.editTrip
            )
        );

        return;

      }


      if (data.deleteTrip) {

        if (
          !confirm(
            "Delete this trip? This cannot be undone."
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

          }
        );


        return;

      }


      /* ---------------------------------------------------
         VEHICLES
         --------------------------------------------------- */

      if (data.editVehicle) {

        await guard(
          () =>
            openVehicleModal(
              data.editVehicle
            )
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
                  item.id ===
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
                  vehicle.available ===
                  false
              }
            );


            adminToast(
              "Vehicle availability updated.",
              "success"
            );


            await PANEL_LOADERS.vehicles();

          }
        );


        return;

      }


      if (data.deleteVehicle) {

        if (
          !confirm(
            "Delete this vehicle? It will also be removed from trips using it."
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


            /*
             * Remove vehicle from Trips first.
             * The trips table stores vehicle names,
             * and data.js handles conversion.
             */

            const trips =
              await getTrips();


            for (
              const trip of trips
            ) {

              const currentIds =
                trip.vehicleIds ||
                [];


              if (
                currentIds.includes(
                  vehicleId
                )
              ) {

                const updatedIds =
                  currentIds.filter(
                    id =>
                      Number(id) !==
                      vehicleId
                  );


                await updateTrip(
                  trip.id,
                  {
                    vehicleIds:
                      updatedIds
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

          }
        );


        return;

      }


      /* ---------------------------------------------------
         GALLERY
         --------------------------------------------------- */

      if (data.saveCaption) {

        await guard(
          async () => {

            const input =
              document.querySelector(
                `[data-caption-input="${CSS.escape(
                  String(
                    data.saveCaption
                  )
                )}"]`
              );


            if (!input) {

              throw new Error(
                "Caption field not found."
              );

            }


            await updateGalleryItem(
              data.saveCaption,
              {
                caption:
                  input.value.trim()
              }
            );


            adminToast(
              "Caption updated successfully.",
              "success"
            );


            await PANEL_LOADERS.gallery();

          }
        );


        return;

      }


      if (data.toggleGallery) {

        await guard(
          async () => {

            const items =
              await getGallery();


            const item =
              items.find(
                gallery =>
                  gallery.id ===
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
              data.toggleGallery,
              {
                approved:
                  item.approved ===
                  false
              }
            );


            adminToast(
              "Photo visibility updated.",
              "success"
            );


            await PANEL_LOADERS.gallery();

          }
        );


        return;

      }


      if (data.deletePhoto) {

        if (
          !confirm(
            "Delete this image?"
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
              "Image deleted successfully.",
              "success"
            );


            await PANEL_LOADERS.gallery();

          }
        );


        return;

      }


      /* ---------------------------------------------------
         VIDEOS
         --------------------------------------------------- */

      if (data.editVideo) {

        await guard(
          () =>
            openVideoModal(
              data.editVideo
            )
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

          }
        );


        return;

      }


      /* ---------------------------------------------------
         REVIEWS
         --------------------------------------------------- */

      if (data.editReview) {

        await guard(
          () =>
            openReviewModal(
              data.editReview
            )
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

          }
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
                item =>
                  item.id ===
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
              data.toggleReview,
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

          }
        );


        return;

      }


      /* ---------------------------------------------------
         ENQUIRIES
         --------------------------------------------------- */

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

          }
        );


        return;

      }

    }
  );


  /* -------------------------------------------------------
     CHANGE EVENTS
     ------------------------------------------------------- */

  document.addEventListener(
    "change",
    event => {

      const target =
        event.target;


      if (
        target &&
        target.dataset &&
        target.dataset.enquiryStatus
      ) {

        guard(
          async () => {

            await updateEnquiry(
              target.dataset.enquiryStatus,
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

          }
        );

      }


      if (
        target &&
        target.id ===
        "enquiry-filter"
      ) {

        guard(
          PANEL_LOADERS.enquiries
        );

      }

    }
  );


  /* -------------------------------------------------------
     SEARCH
     ------------------------------------------------------- */

  const tripSearch =
    $a("trip-search");


  if (tripSearch) {

    tripSearch.addEventListener(
      "input",
      () =>
        guard(
          PANEL_LOADERS.trips
        )
    );

  }


  /* -------------------------------------------------------
     ADD BUTTONS
     ------------------------------------------------------- */

  const addTrip =
    $a("add-trip-btn");


  if (addTrip) {

    addTrip.addEventListener(
      "click",
      () =>
        guard(
          () =>
            openTripModal(null)
        )
    );

  }


  const addVehicle =
    $a("add-vehicle-btn");


  if (addVehicle) {

    addVehicle.addEventListener(
      "click",
      () =>
        guard(
          () =>
            openVehicleModal(null)
        )
    );

  }


  const addVideo =
    $a("add-video-btn");


  if (addVideo) {

    addVideo.addEventListener(
      "click",
      () =>
        guard(
          () =>
            openVideoModal(null)
        )
    );

  }


  const addReview =
    $a("add-review-btn");


  if (addReview) {

    addReview.addEventListener(
      "click",
      () =>
        guard(
          () =>
            openReviewModal(null)
        )
    );

  }


  /* -------------------------------------------------------
     TRIP IMAGE
     ------------------------------------------------------- */

  const tripImageInput =
    $a(
      "trip-image-input"
    );


  if (tripImageInput) {

    tripImageInput.addEventListener(
      "change",
      event => {

        guard(
          async () => {

            const image =
              await readImage(
                event.target.files[0]
              );


            if (image) {

              tripImageDraft =
                image;


              const preview =
                $a(
                  "trip-image-preview"
                );


              if (preview) {

                preview.src =
                  image;

              }

            }

          }
        );

      }
    );

  }


  /* -------------------------------------------------------
     VEHICLE IMAGE
     ------------------------------------------------------- */

  const vehicleImageInput =
    $a(
      "vehicle-image-input"
    );


  if (vehicleImageInput) {

    vehicleImageInput.addEventListener(
      "change",
      event => {

        guard(
          async () => {

            const image =
              await readImage(
                event.target.files[0]
              );


            if (image) {

              vehicleImageDraft =
                image;


              const preview =
                $a(
                  "vehicle-image-preview"
                );


              if (preview) {

                preview.src =
                  image;

              }

            }

          }
        );

      }
    );

  }


  /* -------------------------------------------------------
     FORMS
     ------------------------------------------------------- */

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
    $a(
      "review-form-admin"
    );


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


  /* -------------------------------------------------------
     GALLERY ADD
     ------------------------------------------------------- */

  const galleryForm =
    $a(
      "gallery-add-form"
    );


  if (galleryForm) {

    galleryForm.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        guard(
          async () => {

            const form =
              event.target;


            const file =
              form.image.files[0];


            if (!file) {

              adminToast(
                "Please choose an image.",
                "error"
              );

              return;

            }


            const image =
              await readImage(
                file,
                1200
              );


            await saveGalleryItem({

              image_url:
                image,

              caption:
                form.caption.value.trim(),

              description:
                form.description.value.trim()

            });


            adminToast(
              "Image added successfully.",
              "success"
            );


            form.reset();


            await PANEL_LOADERS.gallery();

          }
        );

      }
    );

  }


  /* -------------------------------------------------------
     ESC KEY CLOSES MODALS
     ------------------------------------------------------- */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !==
        "Escape"
      ) {

        return;

      }


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
  );


  /* -------------------------------------------------------
     INITIAL PANEL
     ------------------------------------------------------- */

  showPanel(
    "dashboard"
  );

}
