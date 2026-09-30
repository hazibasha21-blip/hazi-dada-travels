/* =========================================================
   HAZI DADA TRAVELS — DATA LAYER
   =========================================================
   SUPABASE:
     Trips
     Vehicles
     Gallery
     Reviews
     Enquiries

   LOCAL STORAGE:
     Videos
     Business / Settings

   IMPORTANT:
   This file uses the EXISTING Supabase tables.
   No tables are created or modified here.
   ========================================================= */


/* =========================================================
   BUSINESS / SETTINGS
   ========================================================= */

const BUSINESS_DEFAULTS = {
  name: "Hazi Dada Travels",
  phone: "+91XXXXXXXXXX",
  whatsapp: "91XXXXXXXXXX",
  email: "hazidadatravels5786@gmail.com",
  address: "[Business Address Placeholder — please provide]",
  hours: "[Business Hours Placeholder]",
  mapUrl: "#",
  facebook: "#",
  instagram: "#",
  youtube: "#",
  aboutText:
    "[Editable placeholder] Hazi Dada Travels helps travellers plan comfortable, well-organised trips.",
  footerText:
    "[Editable placeholder] Your trusted travel partner."
};

const BUSINESS_KEY = "hdt_business";

const TRANSLATIONS = {
  en: {
    home: "Home",
    trips: "Trips",
    vehicles: "Vehicles",
    gallery: "Gallery",
    videos: "Videos",
    reviews: "Reviews",
    contact: "Contact",
    bookNow: "Book Now",
    call: "Call",
    whatsapp: "WhatsApp",
    viewDetails: "View Details",
    duration: "Duration",
    price: "Price",
    destination: "Destination"
  },

  te: {
    home: "హోమ్",
    trips: "ట్రిప్స్",
    vehicles: "వాహనాలు",
    gallery: "గ్యాలరీ",
    videos: "వీడియోలు",
    reviews: "సమీక్షలు",
    contact: "సంప్రదించండి",
    bookNow: "బుక్ చేయండి",
    call: "కాల్",
    whatsapp: "వాట్సాప్",
    viewDetails: "వివరాలు చూడండి",
    duration: "వ్యవధి",
    price: "ధర",
    destination: "గమ్యం"
  },

  hi: {
    home: "होम",
    trips: "ट्रिप्स",
    vehicles: "वाहन",
    gallery: "गैलरी",
    videos: "वीडियो",
    reviews: "समीक्षाएँ",
    contact: "संपर्क करें",
    bookNow: "बुक करें",
    call: "कॉल",
    whatsapp: "व्हाट्सऐप",
    viewDetails: "विवरण देखें",
    duration: "अवधि",
    price: "कीमत",
    destination: "गंतव्य"
  }
};
const translations = TRANSLATIONS;

/* =========================================================
   PLACEHOLDER IMAGE
   ========================================================= */

function placeholderImage() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="900"
         height="600"
         viewBox="0 0 900 600">
      <rect width="900" height="600" fill="#e9eef5"/>
      <rect x="40" y="40" width="820" height="520"
            rx="28" fill="#d6dee9"/>
      <text x="450"
            y="300"
            text-anchor="middle"
            dominant-baseline="middle"
            font-family="Arial, sans-serif"
            font-size="42"
            fill="#667085">
        Hazi Dada Travels
      </text>
    </svg>
  `;

  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg);
}

const PLACEHOLDER_FALLBACK = placeholderImage();


/* =========================================================
   COMMON HELPERS
   ========================================================= */

function dbError(error, action) {
  console.error(`[Supabase] ${action} failed:`, error);

  if (error && error.code === "42501") {
    return new Error(
      `Permission denied by Row Level Security while trying to ${action}.`
    );
  }

  const message = String(error?.message || "").toLowerCase();

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch")
  ) {
    return new Error("Unable to connect right now. Please try again.");
  }

  if (
    message.includes("duplicate") ||
    error?.code === "23505"
  ) {
    return new Error(`Unable to ${action} because the record already exists.`);
  }

  return new Error(`Unable to ${action}. Please try again.`);
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseCapacity(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const match = String(value).match(/\d+/);

  return match ? parseInt(match[0], 10) : null;
}

function localGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("localStorage read failed:", key, e);
    return fallback;
  }
}

function localSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn("localStorage write failed:", key, e);
    return false;
  }
}


/* =========================================================
   BUSINESS / SETTINGS
   ========================================================= */

function getBusiness() {
  const saved = localGet(BUSINESS_KEY, {});

  return {
    ...BUSINESS_DEFAULTS,
    ...(saved || {})
  };
}

function saveSettings(settings) {
  const current = getBusiness();

  const updated = {
    ...current,
    ...(settings || {})
  };

  localSet(BUSINESS_KEY, updated);

  return updated;
}


/* =========================================================
   TRIP ↔ VEHICLE HELPERS
   ========================================================= */

/*
  Existing database structure:

  trips.vehicle = text

  Example:
  "SML Bus, Force Toofan"

  The admin UI works with vehicle IDs, so we convert
  between the database text and admin vehicle IDs.
*/

function tripVehicleIdsFromText(vehicleText, allVehicles) {
  if (!vehicleText) return [];

  const names = String(vehicleText)
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  return (allVehicles || [])
    .filter(v =>
      names.includes(
        String(v.name || "").trim().toLowerCase()
      )
    )
    .map(v => v.id);
}

function vehicleTextFromIds(vehicleIds, allVehicles) {
  if (!Array.isArray(vehicleIds) || !vehicleIds.length) {
    return null;
  }

  const names = vehicleIds
    .map(id => {
      const vehicle = (allVehicles || []).find(
        v => Number(v.id) === Number(id)
      );

      return vehicle ? vehicle.name : null;
    })
    .filter(Boolean);

  return names.length ? names.join(", ") : null;
}

function attachVehicleIds(trip, allVehicles) {
  if (!trip) return null;

  return {
    ...trip,

    /*
      Admin/app use "image".
      Database uses "image_url".
    */
    image:
      trip.image_url ||
      PLACEHOLDER_FALLBACK,

    /*
      Admin uses vehicleIds.
      Database stores vehicle names as text.
    */
    vehicleIds: tripVehicleIdsFromText(
      trip.vehicle,
      allVehicles
    ),

    /*
      These are intentionally empty because the
      existing trips table does not contain these columns.
    */
    category: trip.category || "",
    highlights: Array.isArray(trip.highlights)
      ? trip.highlights
      : [],
    gallery: Array.isArray(trip.gallery)
      ? trip.gallery
      : []
  };
}


/* =========================================================
   TRIPS
   ========================================================= */

async function getTrips() {
  const [
    { data, error },
    allVehicles
  ] = await Promise.all([
    supabaseClient
      .from("trips")
      .select("*")
      .order("created_at", {
        ascending: false
      }),

    getVehicles()
  ]);

  if (error) {
    throw dbError(error, "load trips");
  }

  return (data || []).map(trip =>
    attachVehicleIds(trip, allVehicles)
  );
}


async function getTripById(id) {
  const [
    { data, error },
    allVehicles
  ] = await Promise.all([
    supabaseClient
      .from("trips")
      .select("*")
      .eq("id", Number(id))
      .maybeSingle(),

    getVehicles()
  ]);

  if (error) {
    throw dbError(error, "load this trip");
  }

  return data
    ? attachVehicleIds(data, allVehicles)
    : null;
}


async function saveTrip(trip) {
  const allVehicles = await getVehicles();

  /*
    ONLY use columns that actually exist
    in the current trips table.
  */
  const row = {
    name:
      trip.name ||
      null,

    destination:
      trip.destination ||
      null,

    description:
      trip.description ||
      null,

    price:
      trip.price ||
      null,

    duration:
      trip.duration ||
      null,

    image_url:
      trip.image ||
      null,

    vehicle:
      vehicleTextFromIds(
        trip.vehicleIds,
        allVehicles
      )
  };

  const {
    data,
    error
  } = await supabaseClient
    .from("trips")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(error, "add the trip");
  }

  return attachVehicleIds(
    data,
    allVehicles
  );
}


async function updateTrip(id, updates) {
  const allVehicles = await getVehicles();

  const row = {};

  if (updates.name !== undefined) {
    row.name = updates.name || null;
  }

  if (updates.destination !== undefined) {
    row.destination =
      updates.destination || null;
  }

  if (updates.description !== undefined) {
    row.description =
      updates.description || null;
  }

  if (updates.price !== undefined) {
    row.price =
      updates.price || null;
  }

  if (updates.duration !== undefined) {
    row.duration =
      updates.duration || null;
  }

  if (updates.image !== undefined) {
    row.image_url =
      updates.image || null;
  }

  if (updates.vehicleIds !== undefined) {
    row.vehicle =
      vehicleTextFromIds(
        updates.vehicleIds,
        allVehicles
      );
  }

  /*
    Prevent an accidental empty UPDATE request.
  */
  if (!Object.keys(row).length) {
    return getTripById(id);
  }

  const {
    data,
    error
  } = await supabaseClient
    .from("trips")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(error, "update the trip");
  }

  return data
    ? attachVehicleIds(data, allVehicles)
    : null;
}


async function deleteTrip(id) {
  const {
    error
  } = await supabaseClient
    .from("trips")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw dbError(error, "delete the trip");
  }

  return true;
}


/* =========================================================
   VEHICLES
   ========================================================= */

async function getVehicles() {
  const {
    data,
    error
  } = await supabaseClient
    .from("vehicles")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(error, "load vehicles");
  }

  return (data || []).map(v => ({
    ...v,

    image_url:
      v.image_url ||
      PLACEHOLDER_FALLBACK,

    /*
      Existing database does not have description.
      Keep it available to the UI as an empty value.
    */
    description:
      v.description || ""
  }));
}


async function getVehiclesByIds(ids) {
  const all = await getVehicles();

  const wanted = (ids || []).map(Number);

  return all.filter(v =>
    wanted.includes(Number(v.id))
  );
}


async function saveVehicle(vehicle) {
  /*
    Existing vehicles table columns:
      name
      type
      capacity
      registration
      image_url
      available

    "description" is deliberately NOT inserted.
  */
  const row = {
    name:
      vehicle.name ||
      null,

    type:
      vehicle.type ||
      null,

    capacity:
      parseCapacity(vehicle.capacity),

    registration:
      vehicle.registration ||
      null,

    image_url:
      vehicle.image_url ||
      null,

    available:
      vehicle.available !== false
  };

  const {
    data,
    error
  } = await supabaseClient
    .from("vehicles")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(error, "add the vehicle");
  }

  return {
    ...data,
    description: ""
  };
}


async function updateVehicle(id, updates) {
  const row = {};

  if (updates.name !== undefined) {
    row.name =
      updates.name || null;
  }

  if (updates.type !== undefined) {
    row.type =
      updates.type || null;
  }

  if (updates.capacity !== undefined) {
    row.capacity =
      parseCapacity(updates.capacity);
  }

  if (updates.registration !== undefined) {
    row.registration =
      updates.registration || null;
  }

  if (updates.image_url !== undefined) {
    row.image_url =
      updates.image_url || null;
  }

  if (updates.available !== undefined) {
    row.available =
      !!updates.available;
  }

  if (!Object.keys(row).length) {
    const all = await getVehicles();

    return all.find(
      v => Number(v.id) === Number(id)
    ) || null;
  }

  const {
    data,
    error
  } = await supabaseClient
    .from("vehicles")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(error, "update the vehicle");
  }

  return data
    ? {
        ...data,
        description: ""
      }
    : null;
}


async function deleteVehicle(id) {
  const {
    error
  } = await supabaseClient
    .from("vehicles")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw dbError(error, "delete the vehicle");
  }

  return true;
}


/* =========================================================
   GALLERY
   ========================================================= */

async function getGallery() {
  let query = supabaseClient
    .from("gallery")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  /*
    Public users should only see approved images.

    Admin users can see all images.
  */
  let admin = false;

  try {
    if (
      typeof isAdminLoggedIn === "function"
    ) {
      admin = await isAdminLoggedIn();
    }
  } catch (e) {
    admin = false;
  }

  if (!admin) {
    query = query.eq("approved", true);
  }

  const {
    data,
    error
  } = await query;

  if (error) {
    throw dbError(error, "load the gallery");
  }

  return (data || []).map(g => ({
    ...g,

    /*
      Database:
        media_url
        title

      Admin/app:
        image_url
        caption
    */
    image_url:
      g.media_url ||
      PLACEHOLDER_FALLBACK,

    caption:
      g.title || ""
  }));
}


async function saveGalleryItem(item) {
  const row = {
    title:
      item.caption ||
      item.title ||
      null,

    media_url:
      item.image_url ||
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
  } = await supabaseClient
    .from("gallery")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(error, "add the photo");
  }

  return {
    ...data,
    image_url: data.media_url,
    caption: data.title
  };
}


async function updateGalleryItem(id, updates) {
  const row = {};

  if (updates.caption !== undefined) {
    row.title =
      updates.caption || null;
  }

  if (updates.title !== undefined) {
    row.title =
      updates.title || null;
  }

  if (updates.description !== undefined) {
    row.description =
      updates.description || null;
  }

  if (updates.approved !== undefined) {
    row.approved =
      !!updates.approved;
  }

  if (updates.image_url !== undefined) {
    row.media_url =
      updates.image_url || null;
  }

  if (!Object.keys(row).length) {
    return null;
  }

  const {
    data,
    error
  } = await supabaseClient
    .from("gallery")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(error, "update the photo");
  }

  return data
    ? {
        ...data,
        image_url: data.media_url,
        caption: data.title
      }
    : null;
}


async function deleteGalleryItem(id) {
  const {
    error
  } = await supabaseClient
    .from("gallery")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw dbError(error, "delete the photo");
  }

  return true;
}


/* =========================================================
   REVIEWS
   ========================================================= */

async function getReviews() {
  let query = supabaseClient
    .from("reviews")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  let admin = false;

  try {
    if (
      typeof isAdminLoggedIn === "function"
    ) {
      admin = await isAdminLoggedIn();
    }
  } catch (e) {
    admin = false;
  }

  if (!admin) {
    query = query.eq("approved", true);
  }

  const {
    data,
    error
  } = await query;

  if (error) {
    throw dbError(error, "load reviews");
  }

  return (data || []).map(r => ({
    ...r,

    /*
      Database column:
        comment

      Admin/app field:
        review
    */
    review:
      r.comment || "",

    /*
      Existing reviews table does not have image_url.
    */
    image_url:
      r.image_url || ""
  }));
}


async function saveReview(review) {
  /*
    Existing reviews table:
      name
      rating
      comment
      approved

    image_url is intentionally not inserted.
  */
  const row = {
    name:
      review.name ||
      null,

    rating:
      safeNumber(review.rating),

    comment:
      review.review ||
      review.comment ||
      null,

    approved:
      review.approved !== false
  };

  const {
    data,
    error
  } = await supabaseClient
    .from("reviews")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(error, "add the review");
  }

  return {
    ...data,
    review: data.comment,
    image_url: ""
  };
}


async function updateReview(id, updates) {
  const row = {};

  if (updates.name !== undefined) {
    row.name =
      updates.name || null;
  }

  if (updates.rating !== undefined) {
    row.rating =
      safeNumber(updates.rating);
  }

  if (updates.review !== undefined) {
    row.comment =
      updates.review || null;
  }

  if (updates.comment !== undefined) {
    row.comment =
      updates.comment || null;
  }

  if (updates.approved !== undefined) {
    row.approved =
      !!updates.approved;
  }

  if (!Object.keys(row).length) {
    return null;
  }

  const {
    data,
    error
  } = await supabaseClient
    .from("reviews")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(error, "update the review");
  }

  return data
    ? {
        ...data,
        review: data.comment,
        image_url: ""
      }
    : null;
}


async function deleteReview(id) {
  const {
    error
  } = await supabaseClient
    .from("reviews")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw dbError(error, "delete the review");
  }

  return true;
}


/* =========================================================
   ENQUIRIES
   ========================================================= */

async function getEnquiries() {
  const {
    data,
    error
  } = await supabaseClient
    .from("enquiries")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(error, "load enquiries");
  }

  return data || [];
}


async function saveEnquiry(enquiry) {
  /*
    Existing enquiries table:
      name
      phone
      trip
      message
      status

    travel_date and people are not separate DB columns,
    so they are included in the message.
  */

  let message =
    enquiry.message ||
    "";

  const details = [];

  if (enquiry.travel_date) {
    details.push(
      `Travel date: ${enquiry.travel_date}`
    );
  }

  if (
    enquiry.people !== undefined &&
    enquiry.people !== null &&
    String(enquiry.people).trim() !== ""
  ) {
    details.push(
      `People: ${enquiry.people}`
    );
  }

  if (details.length) {
    message =
      details.join(" | ") +
      (message ? ` | ${message}` : "");
  }

  const row = {
    name:
      enquiry.name ||
      null,

    phone:
      enquiry.phone ||
      null,

    trip:
      enquiry.trip ||
      null,

    message:
      message ||
      null,

    status:
      enquiry.status ||
      "New"
  };

  const {
    data,
    error
  } = await supabaseClient
    .from("enquiries")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(error, "submit the enquiry");
  }

  return data;
}


async function updateEnquiry(id, updates) {
  const row = {};

  if (updates.name !== undefined) {
    row.name =
      updates.name || null;
  }

  if (updates.phone !== undefined) {
    row.phone =
      updates.phone || null;
  }

  if (updates.trip !== undefined) {
    row.trip =
      updates.trip || null;
  }

  if (updates.message !== undefined) {
    row.message =
      updates.message || null;
  }

  if (updates.status !== undefined) {
    row.status =
      updates.status || "New";
  }

  if (!Object.keys(row).length) {
    return null;
  }

  const {
    data,
    error
  } = await supabaseClient
    .from("enquiries")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(error, "update the enquiry");
  }

  return data;
}


async function deleteEnquiry(id) {
  const {
    error
  } = await supabaseClient
    .from("enquiries")
    .delete()
    .eq("id", Number(id));

  if (error) {
    throw dbError(error, "delete the enquiry");
  }

  return true;
}


/* =========================================================
   VIDEOS
   =========================================================
   Videos remain localStorage because there is currently
   no confirmed videos table in the existing Supabase schema.
   ========================================================= */

const VIDEOS_KEY = "hdt_videos";

function getVideos() {
  const videos = localGet(VIDEOS_KEY, []);

  return Array.isArray(videos)
    ? videos
    : [];
}


function saveVideo(video) {
  const videos = getVideos();

  const newVideo = {
    id: Date.now(),
    created_at: new Date().toISOString(),
    title: video.title || "",
    description: video.description || "",
    youtubeId: video.youtubeId || ""
  };

  videos.unshift(newVideo);

  localSet(VIDEOS_KEY, videos);

  return newVideo;
}


function updateVideo(id, updates) {
  const videos = getVideos();

  const index = videos.findIndex(
    v => Number(v.id) === Number(id)
  );

  if (index === -1) {
    return null;
  }

  videos[index] = {
    ...videos[index],
    ...updates
  };

  localSet(VIDEOS_KEY, videos);

  return videos[index];
}


function deleteVideo(id) {
  const videos = getVideos();

  const filtered = videos.filter(
    v => Number(v.id) !== Number(id)
  );

  localSet(VIDEOS_KEY, filtered);

  return true;
}


/* =========================================================
   YOUTUBE HELPERS
   ========================================================= */

function extractYouTubeId(value) {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  /*
    Direct 11-character YouTube ID
  */
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
    return raw;
  }

  try {
    const url = new URL(raw);

    /*
      youtube.com/watch?v=XXXXXXXXXXX
    */
    if (
      url.hostname.includes("youtube.com") &&
      url.searchParams.get("v")
    ) {
      const id = url.searchParams.get("v");

      if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
        return id;
      }
    }

    /*
      youtu.be/XXXXXXXXXXX
    */
    if (
      url.hostname === "youtu.be" ||
      url.hostname.endsWith(".youtu.be")
    ) {
      const id = url.pathname
        .replace(/^\/+/, "")
        .split("/")[0];

      if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
        return id;
      }
    }

    /*
      youtube.com/shorts/XXXXXXXXXXX
    */
    const parts = url.pathname
      .split("/")
      .filter(Boolean);

    const shortsIndex =
      parts.indexOf("shorts");

    if (
      shortsIndex >= 0 &&
      parts[shortsIndex + 1] &&
      /^[A-Za-z0-9_-]{11}$/.test(
        parts[shortsIndex + 1]
      )
    ) {
      return parts[shortsIndex + 1];
    }

    /*
      youtube.com/embed/XXXXXXXXXXX
    */
    const embedIndex =
      parts.indexOf("embed");

    if (
      embedIndex >= 0 &&
      parts[embedIndex + 1] &&
      /^[A-Za-z0-9_-]{11}$/.test(
        parts[embedIndex + 1]
      )
    ) {
      return parts[embedIndex + 1];
    }

  } catch (e) {
    return "";
  }

  return "";
}


/* =========================================================
   DATA LAYER INITIALIZATION
   ========================================================= */

async function initDataLayer() {
  /*
    Supabase client is created in supabase.js.

    This function intentionally does not create tables,
    insert demo records, or overwrite existing data.
  */

  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient
  ) {
    console.error(
      "Hazi Dada Travels: Supabase client unavailable."
    );

    return false;
  }

  return true;
}


/* =========================================================
   OPTIONAL GLOBAL INITIALIZATION
   ========================================================= */

if (
  typeof window !== "undefined"
) {
  window.HaziDadaData = {
    getTrips,
    getTripById,
    saveTrip,
    updateTrip,
    deleteTrip,

    getVehicles,
    getVehiclesByIds,
    saveVehicle,
    updateVehicle,
    deleteVehicle,

    getGallery,
    saveGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,

    getReviews,
    saveReview,
    updateReview,
    deleteReview,

    getEnquiries,
    saveEnquiry,
    updateEnquiry,
    deleteEnquiry,

    getVideos,
    saveVideo,
    updateVideo,
    deleteVideo,

    extractYouTubeId,

    getBusiness,
    saveSettings,

    initDataLayer
  };
}
