/* =========================================================
   HAZI DADA TRAVELS — DATA LAYER
   =========================================================
   Supabase is the single source of truth for:

   • Trips
   • Vehicles
   • Gallery
   • Reviews
   • Enquiries
   • Videos
   • Business Settings

   LocalStorage is NOT used for application data.

   UI ↔ Supabase field mappings are handled here so the
   existing Admin Panel and Public App remain compatible.
   ========================================================= */

const PLACEHOLDER_FALLBACK =
  "https://via.placeholder.com/800x500?text=Hazi+Dada+Travels";


/* =========================================================
   COMMON HELPERS
   ========================================================= */

function dbError(error, action) {
  const message =
    error && error.message
      ? error.message
      : String(error || "Unknown database error");

  return new Error(`Unable to ${action}. ${message}`);
}

function ensureSupabase() {
  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient
  ) {
    throw new Error(
      "Supabase client is not available. Check supabase.js and script order."
    );
  }

  return supabaseClient;
}


/* =========================================================
   ADMIN CHECK
   ========================================================= */

async function dataLayerIsAdmin() {
  try {
    if (typeof isAdminLoggedIn !== "function") {
      return false;
    }

    return await isAdminLoggedIn();
  } catch (error) {
    return false;
  }
}


/* =========================================================
   TRIPS
   ========================================================= */

function tripVehicleIdsFromText(vehicleText, allVehicles) {
  if (!vehicleText) {
    return [];
  }

  const names = String(vehicleText)
    .split(",")
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);

  return allVehicles
    .filter(vehicle =>
      names.includes(
        String(vehicle.name || "")
          .trim()
          .toLowerCase()
      )
    )
    .map(vehicle => vehicle.id);
}

function vehicleTextFromIds(vehicleIds, allVehicles) {
  if (
    !Array.isArray(vehicleIds) ||
    vehicleIds.length === 0
  ) {
    return null;
  }

  const names = vehicleIds
    .map(id => {
      const vehicle = allVehicles.find(
        item => Number(item.id) === Number(id)
      );

      return vehicle
        ? vehicle.name
        : null;
    })
    .filter(Boolean);

  return names.length
    ? names.join(", ")
    : null;
}

function attachVehicleIds(trip, allVehicles) {
  if (!trip) {
    return null;
  }

  return {
    ...trip,

    image: trip.image_url || "",

    vehicleIds:
      tripVehicleIdsFromText(
        trip.vehicle,
        allVehicles
      )
  };
}

async function getTrips() {
  const client = ensureSupabase();

  const [
    tripsResult,
    vehicles
  ] = await Promise.all([
    client
      .from("trips")
      .select("*")
      .order("created_at", {
        ascending: false
      }),

    getVehicles()
  ]);

  if (tripsResult.error) {
    throw dbError(
      tripsResult.error,
      "load trips"
    );
  }

  return (tripsResult.data || []).map(
    trip =>
      attachVehicleIds(
        trip,
        vehicles
      )
  );
}

async function getTripById(id) {
  const client = ensureSupabase();

  const [
    tripResult,
    vehicles
  ] = await Promise.all([
    client
      .from("trips")
      .select("*")
      .eq("id", Number(id))
      .maybeSingle(),

    getVehicles()
  ]);

  if (tripResult.error) {
    throw dbError(
      tripResult.error,
      "load this trip"
    );
  }

  return tripResult.data
    ? attachVehicleIds(
        tripResult.data,
        vehicles
      )
    : null;
}

async function saveTrip(trip) {
  const client = ensureSupabase();
  const vehicles = await getVehicles();

  const row = {
    name: trip.name || null,
    destination: trip.destination || null,
    description: trip.description || null,
    price: trip.price || null,
    duration: trip.duration || null,

    image_url:
      trip.image ||
      trip.image_url ||
      null,

    vehicle:
      vehicleTextFromIds(
        trip.vehicleIds,
        vehicles
      )
  };

  const {
    data,
    error
  } = await client
    .from("trips")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "add the trip"
    );
  }

  return attachVehicleIds(
    data,
    vehicles
  );
}

async function updateTrip(id, updates) {
  const client = ensureSupabase();
  const vehicles = await getVehicles();

  const row = {};

  if (updates.name !== undefined)
    row.name = updates.name || null;

  if (updates.destination !== undefined)
    row.destination = updates.destination || null;

  if (updates.description !== undefined)
    row.description = updates.description || null;

  if (updates.price !== undefined)
    row.price = updates.price || null;

  if (updates.duration !== undefined)
    row.duration = updates.duration || null;

  if (updates.image !== undefined)
    row.image_url = updates.image || null;

  if (updates.image_url !== undefined)
    row.image_url = updates.image_url || null;

  if (updates.vehicleIds !== undefined) {
    row.vehicle =
      vehicleTextFromIds(
        updates.vehicleIds,
        vehicles
      );
  }

  if (Object.keys(row).length === 0) {
    return getTripById(id);
  }

  const {
    data,
    error
  } = await client
    .from("trips")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "update the trip"
    );
  }

  return data
    ? attachVehicleIds(
        data,
        vehicles
      )
    : null;
}

async function deleteTrip(id) {
  const client = ensureSupabase();

  const { error } = await client
    .from("trips")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw dbError(
      error,
      "delete the trip"
    );
  }

  return true;
}


/* =========================================================
   VEHICLES
   ========================================================= */

function parseCapacity(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const match =
    String(value).match(/\d+/);

  return match
    ? parseInt(match[0], 10)
    : null;
}

async function getVehicles() {
  const client = ensureSupabase();

  const {
    data,
    error
  } = await client
    .from("vehicles")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(
      error,
      "load vehicles"
    );
  }

  return (data || []).map(vehicle => ({
    ...vehicle,

    image_url:
      vehicle.image_url ||
      PLACEHOLDER_FALLBACK
  }));
}

async function saveVehicle(vehicle) {
  const client = ensureSupabase();

  const row = {
    name: vehicle.name || null,
    type: vehicle.type || null,

    capacity:
      parseCapacity(
        vehicle.capacity
      ),

    registration:
      vehicle.registration || null,

    image_url:
      vehicle.image_url || null,

    available:
      vehicle.available !== false
  };

  const {
    data,
    error
  } = await client
    .from("vehicles")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "add the vehicle"
    );
  }

  return data;
}

async function updateVehicle(id, updates) {
  const client = ensureSupabase();

  const row = {};

  if (updates.name !== undefined)
    row.name = updates.name || null;

  if (updates.type !== undefined)
    row.type = updates.type || null;

  if (updates.capacity !== undefined)
    row.capacity = parseCapacity(updates.capacity);

  if (updates.registration !== undefined)
    row.registration = updates.registration || null;

  if (updates.image_url !== undefined)
    row.image_url = updates.image_url || null;

  if (updates.available !== undefined)
    row.available = !!updates.available;

  if (Object.keys(row).length === 0) {
    return null;
  }

  const {
    data,
    error
  } = await client
    .from("vehicles")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "update the vehicle"
    );
  }

  return data;
}

async function deleteVehicle(id) {
  const client = ensureSupabase();

  const { error } = await client
    .from("vehicles")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw dbError(
      error,
      "delete the vehicle"
    );
  }

  return true;
}


/* =========================================================
   GALLERY
   ========================================================= */

function normalizeGalleryItem(item) {
  if (!item) {
    return null;
  }

  return {
    ...item,

    image_url:
      item.media_url || "",

    caption:
      item.title || ""
  };
}

async function getGallery() {
  const client = ensureSupabase();

  let query = client
    .from("gallery")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  const admin = await dataLayerIsAdmin();

  if (!admin) {
    query = query.eq("approved", true);
  }

  const {
    data,
    error
  } = await query;

  if (error) {
    throw dbError(
      error,
      "load the gallery"
    );
  }

  return (data || []).map(
    normalizeGalleryItem
  );
}

async function saveGalleryItem(item) {
  const client = ensureSupabase();

  const row = {
    title:
      item.caption ||
      item.title ||
      null,

    media_url:
      item.image_url ||
      item.media_url ||
      null,

    media_type:
      item.media_type ||
      "image",

    description:
      item.description ||
      null,

    approved:
      item.approved !== false
  };

  const {
    data,
    error
  } = await client
    .from("gallery")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "add the photo"
    );
  }

  return normalizeGalleryItem(data);
}

async function updateGalleryItem(id, updates) {
  const client = ensureSupabase();

  const row = {};

  if (updates.caption !== undefined)
    row.title = updates.caption || null;

  if (updates.title !== undefined)
    row.title = updates.title || null;

  if (updates.image_url !== undefined)
    row.media_url = updates.image_url || null;

  if (updates.media_url !== undefined)
    row.media_url = updates.media_url || null;

  if (updates.media_type !== undefined)
    row.media_type = updates.media_type || "image";

  if (updates.description !== undefined)
    row.description = updates.description || null;

  if (updates.approved !== undefined)
    row.approved = !!updates.approved;

  if (Object.keys(row).length === 0) {
    return null;
  }

  const {
    data,
    error
  } = await client
    .from("gallery")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "update the photo"
    );
  }

  return normalizeGalleryItem(data);
}

async function deleteGalleryItem(id) {
  const client = ensureSupabase();

  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    throw new Error(
      "Invalid gallery image ID."
    );
  }

  const { error } = await client
    .from("gallery")
    .delete()
    .eq("id", numericId);

  if (error) {
    throw dbError(
      error,
      "delete the photo"
    );
  }

  return true;
}


/* =========================================================
   REVIEWS
   ========================================================= */

function normalizeReview(review) {
  if (!review) {
    return null;
  }

  return {
    ...review,

    review:
      review.comment || ""
  };
}

async function getReviews() {
  const client = ensureSupabase();

  let query = client
    .from("reviews")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  const admin = await dataLayerIsAdmin();

  if (!admin) {
    query = query.eq("approved", true);
  }

  const {
    data,
    error
  } = await query;

  if (error) {
    throw dbError(
      error,
      "load reviews"
    );
  }

  return (data || []).map(
    normalizeReview
  );
}

async function saveReview(review) {
  const client = ensureSupabase();

  const row = {
    name:
      review.name || null,

    rating:
      review.rating || null,

    comment:
      review.review ||
      review.comment ||
      null,

    approved:
      review.approved === true
  };

  const {
    data,
    error
  } = await client
    .from("reviews")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "submit the review"
    );
  }

  return normalizeReview(data);
}

async function updateReview(id, updates) {
  const client = ensureSupabase();

  const row = {};

  if (updates.name !== undefined)
    row.name = updates.name || null;

  if (updates.rating !== undefined)
    row.rating = updates.rating;

  if (updates.review !== undefined)
    row.comment = updates.review || null;

  if (updates.comment !== undefined)
    row.comment = updates.comment || null;

  if (updates.approved !== undefined)
    row.approved = !!updates.approved;

  if (Object.keys(row).length === 0) {
    return null;
  }

  const {
    data,
    error
  } = await client
    .from("reviews")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "update the review"
    );
  }

  return normalizeReview(data);
}

async function deleteReview(id) {
  const client = ensureSupabase();

  const { error } = await client
    .from("reviews")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw dbError(
      error,
      "delete the review"
    );
  }

  return true;
}


/* =========================================================
   ENQUIRIES
   ========================================================= */

function enquiryMessageWithExtras(enquiry) {
  const extra = [];

  if (enquiry.travel_date) {
    extra.push(
      `Travel Date: ${enquiry.travel_date}`
    );
  }

  if (enquiry.people) {
    extra.push(
      `Number of People: ${enquiry.people}`
    );
  }

  const base =
    enquiry.message || "";

  return extra.length
    ? `${base}${base ? "\n\n" : ""}${extra.join("\n")}`
    : base || null;
}

async function getEnquiries() {
  const client = ensureSupabase();

  const {
    data,
    error
  } = await client
    .from("enquiries")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(
      error,
      "load enquiries"
    );
  }

  return data || [];
}

async function saveEnquiry(enquiry) {
  const client = ensureSupabase();

  const row = {
    name:
      enquiry.name || null,

    phone:
      enquiry.phone || null,

    trip:
      enquiry.trip || null,

    message:
      enquiryMessageWithExtras(
        enquiry
      ),

    status:
      enquiry.status ||
      "New"
  };

  const {
    data,
    error
  } = await client
    .from("enquiries")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "send the enquiry"
    );
  }

  return data;
}

async function updateEnquiry(id, updates) {
  const client = ensureSupabase();

  const row = {};

  if (updates.status !== undefined)
    row.status = updates.status;

  if (updates.name !== undefined)
    row.name = updates.name;

  if (updates.phone !== undefined)
    row.phone = updates.phone;

  if (updates.trip !== undefined)
    row.trip = updates.trip;

  if (updates.message !== undefined)
    row.message = updates.message;

  if (Object.keys(row).length === 0) {
    return null;
  }

  const {
    data,
    error
  } = await client
    .from("enquiries")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "update the enquiry"
    );
  }

  return data;
}

async function deleteEnquiry(id) {
  const client = ensureSupabase();

  const { error } = await client
    .from("enquiries")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw dbError(
      error,
      "delete the enquiry"
    );
  }

  return true;
}


/* =========================================================
   VIDEOS
   ========================================================= */

function normalizeVideo(video) {
  if (!video) {
    return null;
  }

  return {
    ...video,

    youtubeId:
      video.youtube_id || ""
  };
}

async function getVideos() {
  const client = ensureSupabase();

  const {
    data,
    error
  } = await client
    .from("videos")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(
      error,
      "load videos"
    );
  }

  return (data || []).map(
    normalizeVideo
  );
}

async function saveVideo(video) {
  const client = ensureSupabase();

  const row = {
    title:
      video.title || null,

    description:
      video.description || null,

    youtube_id:
      video.youtubeId ||
      video.youtube_id ||
      null
  };

  const {
    data,
    error
  } = await client
    .from("videos")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "add the video"
    );
  }

  return normalizeVideo(data);
}

async function updateVideo(id, updates) {
  const client = ensureSupabase();

  const row = {};

  if (updates.title !== undefined)
    row.title = updates.title || null;

  if (updates.description !== undefined)
    row.description = updates.description || null;

  if (updates.youtubeId !== undefined)
    row.youtube_id = updates.youtubeId || null;

  if (updates.youtube_id !== undefined)
    row.youtube_id = updates.youtube_id || null;

  if (Object.keys(row).length === 0) {
    return null;
  }

  const {
    data,
    error
  } = await client
    .from("videos")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "update the video"
    );
  }

  return normalizeVideo(data);
}

async function deleteVideo(id) {
  const client = ensureSupabase();

  const { error } = await client
    .from("videos")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw dbError(
      error,
      "delete the video"
    );
  }

  return true;
}


/* =========================================================
   BUSINESS SETTINGS
   ========================================================= */

const BUSINESS_DEFAULTS = {
  name: "Hazi Dada Travels",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  description: "",
  hours: "",
  mapUrl: "",
  facebook: "",
  instagram: "",
  youtube: "",
  aboutText: "",
  footerText: ""
};


/*
   IMPORTANT COMPATIBILITY FIX

   The existing public app calls:

       const b = getBusiness();

   without await.

   Therefore getBusiness() must return a normal object,
   not a Promise.

   Supabase settings are loaded into this cache in the
   background.
*/

let BUSINESS_CACHE = {
  ...BUSINESS_DEFAULTS
};


function normalizeSettings(settings) {
  if (!settings) {
    return {
      ...BUSINESS_DEFAULTS
    };
  }

  return {
    ...BUSINESS_DEFAULTS,

    ...settings,

    name:
      settings.business_name ||
      settings.name ||
      BUSINESS_DEFAULTS.name,

    phone:
      settings.phone || "",

    whatsapp:
      settings.whatsapp || "",

    email:
      settings.email || "",

    address:
      settings.address || "",

    description:
      settings.description || "",

    hours:
      settings.hours || "",

    mapUrl:
      settings.map_url ||
      settings.mapUrl ||
      "",

    facebook:
      settings.facebook || "",

    instagram:
      settings.instagram || "",

    youtube:
      settings.youtube || "",

    aboutText:
      settings.about_text ||
      settings.aboutText ||
      "",

    footerText:
      settings.footer_text ||
      settings.footerText ||
      ""
  };
}


/*
   Synchronous public function.

   This preserves compatibility with app.js.
*/
function getBusiness() {
  return {
    ...BUSINESS_CACHE
  };
}


/*
   Background Supabase refresh.
*/
async function refreshBusinessCache() {
  try {
    const client = ensureSupabase();

    const {
      data,
      error
    } = await client
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error(
        "[data.js] Unable to refresh business settings:",
        error
      );
      return BUSINESS_CACHE;
    }

    BUSINESS_CACHE =
      normalizeSettings(data);

    /*
      Tell the public app that fresh business settings
      are now available.
    */
    try {
      window.dispatchEvent(
        new CustomEvent(
          "hdt:business-updated"
        )
      );
    } catch (eventError) {
      /* Older browser fallback: ignore */
    }

    return BUSINESS_CACHE;
  } catch (error) {
    console.error(
      "[data.js] Business settings refresh failed:",
      error
    );

    return BUSINESS_CACHE;
  }
}


/*
   Async settings function used by Admin Panel.
*/
async function getSettings() {
  return await refreshBusinessCache();
}


function settingsRowFromUI(settings) {
  return {
    id: 1,

    business_name:
      settings.name !== undefined
        ? settings.name ||
          "Hazi Dada Travels"
        : undefined,

    phone:
      settings.phone !== undefined
        ? settings.phone || null
        : undefined,

    whatsapp:
      settings.whatsapp !== undefined
        ? settings.whatsapp || null
        : undefined,

    email:
      settings.email !== undefined
        ? settings.email || null
        : undefined,

    address:
      settings.address !== undefined
        ? settings.address || null
        : undefined,

    description:
      settings.description !== undefined
        ? settings.description || null
        : undefined,

    hours:
      settings.hours !== undefined
        ? settings.hours || null
        : undefined,

    map_url:
      settings.mapUrl !== undefined
        ? settings.mapUrl || null
        : undefined,

    facebook:
      settings.facebook !== undefined
        ? settings.facebook || null
        : undefined,

    instagram:
      settings.instagram !== undefined
        ? settings.instagram || null
        : undefined,

    youtube:
      settings.youtube !== undefined
        ? settings.youtube || null
        : undefined,

    about_text:
      settings.aboutText !== undefined
        ? settings.aboutText || null
        : undefined,

    footer_text:
      settings.footerText !== undefined
        ? settings.footerText || null
        : undefined,

    updated_at:
      new Date().toISOString()
  };
}


function removeUndefinedFields(object) {
  return Object.fromEntries(
    Object.entries(object)
      .filter(
        ([, value]) =>
          value !== undefined
      )
  );
}


async function saveSettings(newSettings) {
  const client = ensureSupabase();

  /*
    Use the current cached settings rather than requiring
    getBusiness() to be asynchronous.
  */
  const existing = getBusiness();

  const merged = {
    ...existing,
    ...newSettings
  };

  const rawRow =
    settingsRowFromUI(merged);

  const row =
    removeUndefinedFields(rawRow);

  const {
    data,
    error
  } = await client
    .from("settings")
    .upsert(
      row,
      {
        onConflict: "id"
      }
    )
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "save business settings"
    );
  }

  BUSINESS_CACHE =
    normalizeSettings(data);

  return BUSINESS_CACHE;
}


/* =========================================================
   DATA LAYER INITIALIZATION
   ========================================================= */

function initDataLayer() {
  /*
    Start loading Supabase settings in the background.

    This does NOT block the public UI.
  */
  refreshBusinessCache();
}

initDataLayer();
