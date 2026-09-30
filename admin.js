/* =========================================================
   HAZI DADA TRAVELS — ADMIN PANEL
   Final corrected version
   ========================================================= */

const ADMIN_USER_ID =
  "589555e8-5853-4e58-aaac-8038ec833c80";


/* =========================================================
   BASIC HELPERS
   ========================================================= */

const $a = id => document.getElementById(id);


function ea(value) {
  return String(
    value === undefined || value === null ? "" : value
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
    result += i <= n ? "★" : "☆";
  }

  return result;
}


function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch (e) {
    return "";
  }
}


function imgFallback(src) {
  return src || PLACEHOLDER_FALLBACK;
}


function showError(id, message) {
  const element = $a(id);

  if (!element) {
    console.warn("Missing error element:", id);
    return;
  }

  element.textContent = message || "";
  element.style.display = message ? "block" : "none";
}


function adminToast(message, type = "info") {
  let container =
    document.querySelector(".a-toast-container");

  if (!container) {
    container = document.createElement("div");
    container.className = "a-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");

  toast.className = "a-toast " + type;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}


async function guard(
  fn,
  fallbackMsg = "Something went wrong. Please try again."
) {
  try {
    return await fn();
  } catch (error) {
    console.error(error);

    const message =
      error &&
      error.message &&
      error.message.length < 180
        ? error.message
        : fallbackMsg;

    adminToast(message, "error");

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


function empty(message) {
  return `
    <div class="a-empty">
      ${ea(message)}
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


function itemCard(
  image,
  title,
  lines,
  actionsHtml,
  extraHtml = ""
) {
  const imageHtml =
    image === null || image === undefined
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


/* =========================================================
   IMAGE READER
   ========================================================= */

function readImage(file, maxSize = 1000) {
  return new Promise((resolve, reject) => {

    if (!file) {
      resolve(null);
      return;
    }

    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) {
      reject(
        new Error(
          "Please choose a PNG, JPG, WEBP or GIF image."
        )
      );
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      reject(
        new Error(
          "Image is too large. Maximum size is 8MB."
        )
      );
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(
        new Error("Could not read the image.")
      );
    };

    reader.onload = () => {

      const image = new Image();

      image.onerror = () => {
        reject(
          new Error("Could not process the image.")
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
          document.createElement("canvas");

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

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
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
      "Supabase client unavailable"
    );
  }

  return supabaseClient;
}


function authErrorMessage(error) {

  const message =
    String(
      (error && error.message) || ""
    ).toLowerCase();

  const status =
    error && error.status;

  if (
    status === 429 ||
    message.includes("rate limit") ||
    message.includes("too many")
  ) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (
    message.includes(
      "email not confirmed"
    )
  ) {
    return "Your email is not confirmed yet. Please confirm it from your inbox.";
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

  if (
    !status ||
    message.includes("fetch") ||
    message.includes("network")
  ) {
    return "Unable to connect right now. Please try again.";
  }

  return "Sign-in failed. Please try again.";
}


async function adminLogin(
  email,
  password
) {

  try {

    const {
      data,
      error
    } =
      await authClient()
        .auth
        .signInWithPassword({
          email,
          password
        });

    if (error) {
      return {
        ok: false,
        message:
          authErrorMessage(error)
      };
    }

    if (
      !data ||
      !data.session
    ) {
      return {
        ok: false,
        message:
          "Sign-in failed. Please try again."
      };
    }

    if (
      !data.user ||
      String(data.user.id) !==
        ADMIN_USER_ID
    ) {

      await authClient()
        .auth
        .signOut();

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

    console.error(error);

    return {
      ok: false,
      message:
        "Unable to connect right now. Please try again."
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
      !data.session
    ) {
      return false;
    }

    const user =
      data.session.user;

    return !!(
      user &&
      String(user.id) ===
        ADMIN_USER_ID
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

    console.error(error);

  }
}


async function requireAdminAuth() {

  const goLogin = () => {

    document.documentElement.style.visibility = "";

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
      !data.session
    ) {
      return goLogin();
    }

    const sessionUser =
      data.session.user;

    if (
      !sessionUser ||
      String(sessionUser.id) !==
        ADMIN_USER_ID
    ) {

      try {
        await client.auth.signOut();
      } catch (e) {}

      return goLogin();
    }

    const {
      data: userData,
      error: userError
    } =
      await client
        .auth
        .getUser();

    if (
      userError ||
      !userData ||
      !userData.user ||
      String(userData.user.id) !==
        ADMIN_USER_ID
    ) {

      try {
        await client.auth.signOut();
      } catch (e) {}

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

    document.documentElement.style.visibility = "";

    return true;

  } catch (error) {

    console.error(error);

    return goLogin();
  }
}


/* =========================================================
   PANEL SYSTEM
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
      array =>
        [...array]
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


    const recentEnquiries =
      $a(
        "recent-enquiries"
      );

    if (recentEnquiries) {

      const rows =
        latest(enquiries);

      recentEnquiries.innerHTML =
        rows.length

          ? rows.map(
              enquiry => `
                <div class="a-recent-row">

                  <strong>
                    ${ea(
                      enquiry.name ||
                      "Unnamed"
                    )}
                  </strong>

                  —
                  ${ea(
                    enquiry.trip ||
                    "General enquiry"
                  )}

                  <span class="a-badge">
                    ${ea(
                      enquiry.status ||
                      "New"
                    )}
                  </span>

                </div>
              `
            ).join("")

          : `
              <div class="a-recent-row">
                No enquiries found.
              </div>
            `;
    }


    const recentReviews =
      $a(
        "recent-reviews"
      );

    if (recentReviews) {

      const rows =
        latest(reviews);

      recentReviews.innerHTML =
        rows.length

          ? rows.map(
              review => `
                <div class="a-recent-row">

                  <strong>
                    ${ea(
                      review.name ||
                      "Anonymous"
                    )}
                  </strong>

                  ${starsA(
                    review.rating
                  )}

                  <br>

                  ${ea(
                    review.review ||
                    review.comment ||
                    ""
                  )}

                </div>
              `
            ).join("")

          : `
              <div class="a-recent-row">
                No reviews available.
              </div>
            `;
    }


    const recentTrips =
      $a(
        "recent-trips"
      );

    if (recentTrips) {

      const rows =
        latest(trips);

      recentTrips.innerHTML =
        rows.length

          ? rows.map(
              trip => `
                <div class="a-recent-row">

                  <strong>
                    ${ea(
                      trip.name
                    )}
                  </strong>

                  <br>

                  ${ea(
                    trip.destination
                  )}

                </div>
              `
            ).join("")

          : `
              <div class="a-recent-row">
                No trips available.
              </div>
            `;
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


    const search =
      $a("trip-search");


    const query =
      search
        ? search.value
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
      filtered.map(
        trip =>
          itemCard(
            trip.image,
            ea(trip.name),

            `
              <p>
                ${ea(
                  trip.destination
                )}

                ${
                  trip.duration
                    ? " · " +
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
      ).join("");
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
      ? String(trip.id)
      : "";


  const title =
    $a("trip-modal-title");

  if (title) {

    title.textContent =
      trip
        ? "Edit Trip"
        : "Add Trip";
  }


  /* IMPORTANT:
     Use IDs instead of form.name,
     form.destination, etc.
  */

  $a("trip-name").value =
    trip?.name || "";

  $a("trip-destination").value =
    trip?.destination || "";

  $a("trip-duration").value =
    trip?.duration || "";

  $a("trip-price").value =
    trip?.price || "";

  $a("trip-description").value =
    trip?.description || "";


  tripImageDraft =
    trip?.image || "";


  const preview =
    $a(
      "trip-image-preview"
    );

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


  if (!container) {
    openModal("trip-modal");
    return;
  }


  if (!vehicles.length) {

    container.innerHTML = `
      <span class="a-item-meta">
        No vehicles yet.
        Add one in Vehicles first.
      </span>
    `;

  } else {

    const selected =
      trip?.vehicleIds || [];


    container.innerHTML =
      vehicles.map(
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
      ).join("");
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
    $a("trip-name").value.trim();


  const destination =
    $a(
      "trip-destination"
    ).value.trim();


  if (
    !name ||
    !destination
  ) {

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
      $a(
        "trip-duration"
      ).value.trim(),

    price:
      $a(
        "trip-price"
      ).value.trim(),

    description:
      $a(
        "trip-description"
      ).value.trim(),

    image:
      tripImageDraft ||
      PLACEHOLDER_FALLBACK,

    vehicleIds

  };


  await guard(
    async () => {

      if (
        form.dataset.id
      ) {

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


      await PANEL_LOADERS.dashboard();

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


    if (!vehicles.length) {

      list.innerHTML =
        empty(
          "No vehicles available yet."
        );

      return;
    }


    list.innerHTML =
      vehicles.map(
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
              <span class="a-badge ${
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
      ).join("");
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
    $a(
      "vehicle-form"
    );

  if (!form) return;


  form.reset();


  showError(
    "vehicle-error",
    ""
  );


  form.dataset.id =
    vehicle
      ? String(vehicle.id)
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


  /* Use IDs everywhere. */

  $a("vehicle-name").value =
    vehicle?.name || "";

  $a("vehicle-type").value =
    vehicle?.type || "";

  $a("vehicle-capacity").value =
    vehicle?.capacity ??
    "";

  $a(
    "vehicle-registration"
  ).value =
    vehicle?.registration ||
    "";

  $a(
    "vehicle-available"
  ).value =
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
    $a(
      "vehicle-name"
    ).value.trim();


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
      $a(
        "vehicle-type"
      ).value.trim(),

    capacity:
      $a(
        "vehicle-capacity"
      ).value.trim(),

    registration:
      $a(
        "vehicle-registration"
      ).value.trim(),

    available:
      $a(
        "vehicle-available"
      ).value === "true",

    image_url:
      vehicleImageDraft ||
      PLACEHOLDER_FALLBACK
  };


  await guard(
    async () => {

      if (
        form.dataset.id
      ) {

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


      await PANEL_LOADERS.dashboard();

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


    if (!items.length) {

      list.innerHTML =
        empty(
          "No gallery images available."
        );

      return;
    }


    list.innerHTML =
      items.map(
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
              <span class="a-badge ${
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
      ).join("");
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


    if (!videos.length) {

      list.innerHTML =
        empty(
          "No videos available yet."
        );

      return;
    }


    list.innerHTML =
      videos.map(
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
      ).join("");
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
    $a(
      "video-form"
    );

  if (!form) return;


  form.reset();


  showError(
    "video-error",
    ""
  );


  form.dataset.id =
    video
      ? String(video.id)
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


  /* IDs — never form.title etc. */

  $a("video-title").value =
    video?.title || "";

  $a(
    "video-description"
  ).value =
    video?.description || "";

  $a(
    "video-youtube"
  ).value =
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
    $a(
      "video-title"
    ).value.trim();


  if (!title) {

    showError(
      "video-error",
      "Video title is required."
    );

    return;
  }


  const raw =
    $a(
      "video-youtube"
    ).value.trim();


  const youtubeId =
    extractYouTubeId(
      raw
    );


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
      $a(
        "video-description"
      ).value.trim(),

    youtubeId

  };


  await guard(
    async () => {

      if (
        form.dataset.id
      ) {

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


      await PANEL_LOADERS.dashboard();

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


    if (!reviews.length) {

      list.innerHTML =
        empty(
          "No reviews available."
        );

      return;
    }


    list.innerHTML =
      reviews.map(
        review => {

          const approved =
            review.approved === true;


          return itemCard(

            null,

            `
              ${ea(
                review.name ||
                "Anonymous"
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
              <span class="a-badge ${
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
      ).join("");
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
      ? String(review.id)
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


  /* IDs — never form.name etc. */

  $a(
    "review-name"
  ).value =
    review?.name || "";


  $a(
    "review-rating"
  ).value =
    String(
      review?.rating || 5
    );


  $a(
    "review-text"
  ).value =
    review?.review ||
    review?.comment ||
    "";


  $a(
    "review-approved"
  ).value =
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
    $a(
      "review-name"
    ).value.trim();


  const reviewText =
    $a(
      "review-text"
    ).value.trim();


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
      $a(
        "review-rating"
      ).value,
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
      $a(
        "review-approved"
      ).value === "true"

  };


  await guard(
    async () => {

      if (
        form.dataset.id
      ) {

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


      await PANEL_LOADERS.dashboard();

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


    const filter =
      $a(
        "enquiry-filter"
      );


    const selected =
      filter
        ? filter.value
        : "";


    const enquiries =
      await getEnquiries();


    const filtered =
      enquiries
        .filter(
          enquiry =>
            !selected ||
            enquiry.status ===
              selected
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
      filtered.map(
        enquiry => {

          const status =
            enquiry.status ||
            "New";


          const options =
            ENQUIRY_STATUSES
              .map(
                value => `
                  <option
                    value="${ea(value)}"
                    ${
                      value === status
                        ? "selected"
                        : ""
                    }>
                    ${ea(value)}
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
                aria-label="Enquiry status">

                ${options}

              </select>

              ${btn(
                "Delete",
                `data-delete-enquiry="${enquiry.id}"`,
                "a-btn-danger"
              )}
            `,

            `
              <span class="a-badge">

                ${ea(status)}

              </span>
            `
          );
        }
      ).join("");
  };


/* =========================================================
   SETTINGS
   ========================================================= */

PANEL_LOADERS.settings =
  async function () {

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

        const element =
          $a(
            "settings-" +
            (
              field === "mapUrl"
                ? "map"
                : field === "aboutText"
                  ? "about"
                  : field === "footerText"
                    ? "footer"
                    : field
            )
          );


        if (element) {

          element.value =
            business[field] ||
            "";

        }
      }
    );
  };


async function saveSettingsForm(event) {

  event.preventDefault();


  const fields = {

    phone:
      $a(
        "settings-phone"
      ).value.trim(),

    whatsapp:
      $a(
        "settings-whatsapp"
      ).value.trim(),

    email:
      $a(
        "settings-email"
      ).value.trim(),

    address:
      $a(
        "settings-address"
      ).value.trim(),

    hours:
      $a(
        "settings-hours"
      ).value.trim(),

    mapUrl:
      $a(
        "settings-map"
      ).value.trim(),

    facebook:
      $a(
        "settings-facebook"
      ).value.trim(),

    instagram:
      $a(
        "settings-instagram"
      ).value.trim(),

    youtube:
      $a(
        "settings-youtube"
      ).value.trim(),

    aboutText:
      $a(
        "settings-about"
      ).value.trim(),

    footerText:
      $a(
        "settings-footer"
      ).value.trim()

  };


  if (
    fields.email &&
    !/^\S+@\S+\.\S+$/.test(
      fields.email
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
        fields
      );


      adminToast(
        "Settings updated successfully.",
        "success"
      );
    }
  );
}


/* =========================================================
   INIT
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
     PANEL NAVIGATION
     ======================================================= */

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


      /* Panel */

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


      /* ===================================================
         QUICK ACTIONS
         =================================================== */

      if (data.quick) {

        if (
          data.quick ===
          "trip"
        ) {

          showPanel(
            "trips"
          );

          await guard(
            () =>
              openTripModal(null)
          );

          return;
        }


        if (
          data.quick ===
          "vehicle"
        ) {

          showPanel(
            "vehicles"
          );

          await guard(
            () =>
              openVehicleModal(null)
          );

          return;
        }


        if (
          data.quick ===
          "gallery"
        ) {

          showPanel(
            "gallery"
          );

          const imageInput =
            $a("g-image");

          if (imageInput) {
            imageInput.focus();
          }

          return;
        }


        if (
          data.quick ===
          "video"
        ) {

          showPanel(
            "videos"
          );

          await guard(
            () =>
              openVideoModal(null)
          );

          return;
        }


        if (
          data.quick ===
          "review"
        ) {

          showPanel(
            "reviews"
          );

          await guard(
            () =>
              openReviewModal(null)
          );

          return;
        }
      }


      /* ===================================================
         LOGOUT
         =================================================== */

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


      /* ===================================================
         TRIPS
         =================================================== */

      if (
        data.editTrip
      ) {

        await guard(
          () =>
            openTripModal(
              data.editTrip
            )
        );

        return;
      }


      if (
        data.deleteTrip
      ) {

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

            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /* ===================================================
         VEHICLES
         =================================================== */

      if (
        data.editVehicle
      ) {

        await guard(
          () =>
            openVehicleModal(
              data.editVehicle
            )
        );

        return;
      }


      if (
        data.toggleVehicle
      ) {

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

            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      if (
        data.deleteVehicle
      ) {

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


            const trips =
              await getTrips();


            for (
              const trip of trips
            ) {

              const ids =
                trip.vehicleIds ||
                [];


              if (
                ids.includes(
                  vehicleId
                )
              ) {

                const updatedIds =
                  ids.filter(
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

            await PANEL_LOADERS.trips();

            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /* ===================================================
         GALLERY
         =================================================== */

      if (
        data.saveCaption
      ) {

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


      if (
        data.toggleGallery
      ) {

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

            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      if (
        data.deletePhoto
      ) {

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

            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /* ===================================================
         VIDEOS
         =================================================== */

      if (
        data.editVideo
      ) {

        await guard(
          () =>
            openVideoModal(
              data.editVideo
            )
        );

        return;
      }


      if (
        data.deleteVideo
      ) {

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


      /* ===================================================
         REVIEWS
         =================================================== */

      if (
        data.editReview
      ) {

        await guard(
          () =>
            openReviewModal(
              data.editReview
            )
        );

        return;
      }


      if (
        data.deleteReview
      ) {

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


      if (
        data.toggleReview
      ) {

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

            await PANEL_LOADERS.dashboard();
          }
        );

        return;
      }


      /* ===================================================
         ENQUIRIES
         =================================================== */

      if (
        data.deleteEnquiry
      ) {

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

            await PANEL_LOADERS.dashboard();
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


  /* =======================================================
     SEARCH
     ======================================================= */

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


  /* =======================================================
     ADD BUTTONS
     ======================================================= */

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


  /* =======================================================
     TRIP IMAGE
     ======================================================= */

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


            if (!image) {
              return;
            }


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
        );
      }
    );
  }


  /* =======================================================
     VEHICLE IMAGE
     ======================================================= */

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


            if (!image) {
              return;
            }


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
        );
      }
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


  /* =======================================================
     GALLERY ADD
     ======================================================= */

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

            const imageInput =
              $a("g-image");


            const captionInput =
              $a("g-caption");


            const descriptionInput =
              $a(
                "g-description"
              );


            const file =
              imageInput &&
              imageInput.files
                ? imageInput.files[0]
                : null;


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
                captionInput
                  ? captionInput.value.trim()
                  : "",

              description:
                descriptionInput
                  ? descriptionInput.value.trim()
                  : ""

            });


            adminToast(
              "Image added successfully.",
              "success"
            );


            galleryForm.reset();


            await PANEL_LOADERS.gallery();

            await PANEL_LOADERS.dashboard();
          }
        );
      }
    );
  }


  /* =======================================================
     ESC KEY
     ======================================================= */

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
     INITIAL LOAD
     ======================================================= */

  showPanel(
    "dashboard"
  );
}
