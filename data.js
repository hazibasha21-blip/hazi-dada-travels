/* =========================================================
   HAZI DADA TRAVELS — DATA LAYER
   Supabase = Trips, Vehicles, Gallery, Reviews, Enquiries
   LocalStorage = Videos, Business Settings
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

function resolved(value) {
  return Promise.resolve(value);
}

/* =========================================================
   BUSINESS DEFAULTS
   ========================================================= */

const BUSINESS_DEFAULTS = {
  name: "Hazi Dada Travels",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  description: ""
};

/* =========================================================
   LOCAL STORAGE HELPERS
   ========================================================= */

function seedIfEmpty(key, sample) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(sample));
  }
}

function readTable(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function writeTable(key, rows) {
  try {
    localStorage.setItem(key, JSON.stringify(rows));
  } catch (e) {
    throw new Error("Storage is full. Try smaller images.");
  }
}

function nextId(rows) {
  return rows.reduce(
    (max, r) => Math.max(max, Number(r.id) || 0),
    0
  ) + 1;
}

/* =========================================================
   TRIPS
   Supabase table: trips
   ========================================================= */

function tripVehicleIdsFromText(vehicleText, allVehicles) {
  if (!vehicleText) return [];

  const names = String(vehicleText)
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  return allVehicles
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
      const vehicle = allVehicles.find(
        v => Number(v.id) === Number(id)
      );

      return vehicle ? vehicle.name : null;
    })
    .filter(Boolean);

  return names.length ? names.join(", ") : null;
}

function attachVehicleIds(trip, allVehicles) {
  return {
    ...trip,
    image: trip.image_url,
    vehicleIds: tripVehicleIdsFromText(
      trip.vehicle,
      allVehicles
    )
  };
}

async function getTrips() {
  const [{ data, error }, allVehicles] = await Promise.all([
    supabaseClient
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false }),

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
  const [{ data, error }, allVehicles] = await Promise.all([
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

  const row = {
    name: trip.name || null,
    destination: trip.destination || null,
    description: trip.description || null,
    price: trip.price || null,
    duration: trip.duration || null,
    image_url: trip.image || null,
    vehicle: vehicleTextFromIds(
      trip.vehicleIds,
      allVehicles
    )
  };

  const { data, error } = await supabaseClient
    .from("trips")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(error, "add the trip");
  }

  return attachVehicleIds(data, allVehicles);
}

async function updateTrip(id, updates) {
  const allVehicles = await getVehicles();

  const row = {};

  if (updates.name !== undefined) {
    row.name = updates.name || null;
  }

  if (updates.destination !== undefined) {
    row.destination = updates.destination || null;
  }

  if (updates.description !== undefined) {
    row.description = updates.description || null;
  }

  if (updates.price !== undefined) {
    row.price = updates.price || null;
  }

  if (updates.duration !== undefined) {
    row.duration = updates.duration || null;
  }

  if (updates.image !== undefined) {
    row.image_url = updates.image || null;
  }

  if (updates.vehicleIds !== undefined) {
    row.vehicle = vehicleTextFromIds(
      updates.vehicleIds,
      allVehicles
    );
  }

  const { data, error } = await supabaseClient
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
  const { error } = await supabaseClient
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
   Supabase table: vehicles
   ========================================================= */

function parseCapacity(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const match = String(value).match(/\d+/);

  return match
    ? parseInt(match[0], 10)
    : null;
}

async function getVehicles() {
  const { data, error } = await supabaseClient
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw dbError(error, "load vehicles");
  }

  return (data || []).map(vehicle => ({
    ...vehicle,
    image_url:
      vehicle.image_url ||
      PLACEHOLDER_FALLBACK
  }));
}

async function saveVehicle(vehicle) {
  const row = {
    name: vehicle.name || null,
    type: vehicle.type || null,
    capacity: parseCapacity(vehicle.capacity),
    registration: vehicle.registration || null,
    image_url: vehicle.image_url || null,
    available: vehicle.available !== false
  };

  const { data, error } = await supabaseClient
    .from("vehicles")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(error, "add the vehicle");
  }

  return data;
}

async function updateVehicle(id, updates) {
  const row = {};

  if (updates.name !== undefined) {
    row.name = updates.name || null;
  }

  if (updates.type !== undefined) {
    row.type = updates.type || null;
  }

  if (updates.capacity !== undefined) {
    row.capacity = parseCapacity(
      updates.capacity
    );
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
    row.available = !!updates.available;
  }

  const { data, error } = await supabaseClient
    .from("vehicles")
    .update(row)
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw dbError(error, "update the vehicle");
  }

  return data;
}

async function deleteVehicle(id) {
  const { error } = await supabaseClient
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
   Supabase table: gallery

   Database fields:
   id
   created_at
   title
   media_url
   media_type
   description
   approved
   ========================================================= */

async function getGallery() {
  let query = supabaseClient
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  const admin =
    typeof isAdminLoggedIn === "function" &&
    await isAdminLoggedIn();

  if (!admin) {
    query = query.eq("approved", true);
  }

  const { data, error } = await query;

  if (error) {
    throw dbError(error, "load the gallery");
  }

  return (data || []).map(item => ({
    ...item,

    /* UI-compatible names */
    image_url: item.media_url,
    caption: item.title
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

    approved: true
  };

  const { data, error } = await supabaseClient
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

  if (updates.image_url !== undefined) {
    row.media_url =
      updates.image_url || null;
  }

  if (updates.media_url !== undefined) {
    row.media_url =
      updates.media_url || null;
  }

  if (updates.media_type !== undefined) {
    row.media_type =
      updates.media_type || "image";
  }

  if (updates.description !== undefined) {
    row.description =
      updates.description || null;
  }

  if (updates.approved !== undefined) {
    row.approved = !!updates.approved;
  }

  const { data, error } = await supabaseClient
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
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    throw new Error("Invalid gallery image ID.");
  }

  const { data, error } = await supabaseClient
    .from("gallery")
    .delete()
    .eq("id", numericId)
    .select("id");

  if (error) {
    throw dbError(error, "delete the photo");
  }

  if (!data || data.length === 0) {
    throw new Error(
      "The gallery image was not found or could not be deleted."
    );
  }

  return true;
}

/* =========================================================
   REVIEWS
   Supabase table: reviews
   ========================================================= */

async function getReviews() {
  let query = supabaseClient
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  const admin =
    typeof isAdminLoggedIn === "function" &&
    await isAdminLoggedIn();

  if (!admin) {
    query = query.eq("approved", true);
  }

  const { data, error } = await query;

  if (error) {
    throw dbError(error, "load reviews");
  }

  return (data || []).map(review => ({
    ...review,
    review: review.comment
  }));
}

async function saveReview(review) {
  const row = {
    name: review.name || null,
    rating: review.rating || null,
    comment: review.review || null,
    approved: review.approved === true
  };

  const { data, error } = await supabaseClient
    .from("reviews")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(error, "submit the review");
  }

  return {
    ...data,
    review: data.comment
  };
}

async function updateReview(id, updates) {
  const row = {};

  if (updates.name !== undefined) {
    row.name = updates.name || null;
  }

  if (updates.rating !== undefined) {
    row.rating = updates.rating;
  }

  if (updates.review !== undefined) {
    row.comment =
      updates.review || null;
  }

  if (updates.approved !== undefined) {
    row.approved = !!updates.approved;
  }

  const { data, error } = await supabaseClient
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
        review: data.comment
      }
    : null;
}

async function deleteReview(id) {
  const { error } = await supabaseClient
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
   Supabase table: enquiries
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

  const base = enquiry.message || "";

  return extra.length
    ? `${base}${base ? "\n\n" : ""}${extra.join("\n")}`
    : base || null;
}

async function getEnquiries() {
  const { data, error } = await supabaseClient
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw dbError(error, "load enquiries");
  }

  return data || [];
}

async function saveEnquiry(enquiry) {
  const row = {
    name: enquiry.name || null,
    phone: enquiry.phone || null,
    trip: enquiry.trip || null,
    message:
      enquiryMessageWithExtras(enquiry),
    status:
      enquiry.status || "New"
  };

  const { data, error } = await supabaseClient
    .from("enquiries")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(error, "send the enquiry");
  }

  return data;
}

async function updateEnquiry(id, updates) {
  const row = {};

  if (updates.status !== undefined) {
    row.status = updates.status;
  }

  if (updates.name !== undefined) {
    row.name = updates.name;
  }

  if (updates.phone !== undefined) {
    row.phone = updates.phone;
  }

  if (updates.trip !== undefined) {
    row.trip = updates.trip;
  }

  if (updates.message !== undefined) {
    row.message = updates.message;
  }

  const { data, error } = await supabaseClient
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
  const { error } = await supabaseClient
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
   LocalStorage only
   ========================================================= */

const SAMPLE_VIDEOS = [
  {
    id: 1,
    title: "[Sample] Trip Highlights Reel",
    description: "[Editable placeholder description]",
    youtubeId: ""
  },
  {
    id: 2,
    title: "[Sample] Customer Travel Story",
    description: "[Editable placeholder description]",
    youtubeId: ""
  }
];

function getVideos() {
  return resolved(
    readTable("hdtui_videos")
  );
}

function saveVideo(video) {
  const rows =
    readTable("hdtui_videos");

  const record = {
    ...video,
    id: nextId(rows),
    created_at:
      new Date().toISOString()
  };

  rows.push(record);

  writeTable(
    "hdtui_videos",
    rows
  );

  return resolved(record);
}

function updateVideo(id, updates) {
  const rows =
    readTable("hdtui_videos");

  const index = rows.findIndex(
    video =>
      Number(video.id) === Number(id)
  );

  if (index === -1) {
    return resolved(null);
  }

  rows[index] = {
    ...rows[index],
    ...updates
  };

  writeTable(
    "hdtui_videos",
    rows
  );

  return resolved(
    rows[index]
  );
}

function deleteVideo(id) {
  const rows =
    readTable("hdtui_videos");

  writeTable(
    "hdtui_videos",
    rows.filter(
      video =>
        Number(video.id) !== Number(id)
    )
  );

  return resolved(true);
}

/* =========================================================
   BUSINESS SETTINGS
   LocalStorage only
   ========================================================= */

function getBusiness() {
  try {
    return (
      JSON.parse(
        localStorage.getItem(
          "hdtui_settings"
        )
      ) || BUSINESS_DEFAULTS
    );
  } catch (e) {
    return BUSINESS_DEFAULTS;
  }
}

function getSettings() {
  return resolved(
    getBusiness()
  );
}

function saveSettings(newSettings) {
  localStorage.setItem(
    "hdtui_settings",
    JSON.stringify({
      ...getBusiness(),
      ...newSettings
    })
  );

  return resolved(true);
}

/* =========================================================
   INITIALIZE LOCAL DATA
   ========================================================= */

function initDataLayer() {
  seedIfEmpty(
    "hdtui_videos",
    SAMPLE_VIDEOS
  );

  if (
    !localStorage.getItem(
      "hdtui_settings"
    )
  ) {
    localStorage.setItem(
      "hdtui_settings",
      JSON.stringify(
        BUSINESS_DEFAULTS
      )
    );
  }
}

initDataLayer();
