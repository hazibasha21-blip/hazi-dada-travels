/* =========================================================
   HAZI DADA TRAVELS - DATA LAYER
   Supabase-backed data + UI compatibility mappings
   ========================================================= */

const PLACEHOLDER_FALLBACK =
  "https://placehold.co/800x500?text=Hazi+Dada+Travels";

let BUSINESS_CACHE = {
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

/* =========================================================
   TRANSLATIONS
   ========================================================= */

const translations = {
  en: {
    home: "Home",
    trips: "Trips",
    vehicles: "Vehicles",
    gallery: "Gallery",
    videos: "Videos",
    reviews: "Reviews",
    contact: "Contact",
    about: "About Us",
    bookNow: "Book Now",
    viewDetails: "View Details",
    callNow: "Call Now",
    whatsapp: "WhatsApp",
    sendEnquiry: "Send Enquiry",
    submitReview: "Submit Review",
    name: "Name",
    phone: "Phone",
    email: "Email",
    message: "Message",
    destination: "Destination",
    duration: "Duration",
    price: "Price",
    vehicle: "Vehicle",
    available: "Available",
    unavailable: "Unavailable",
    capacity: "Capacity",
    registration: "Registration",
    noTrips: "No trips available.",
    noVehicles: "No vehicles available.",
    noGallery: "No gallery items available.",
    noVideos: "No videos available.",
    noReviews: "No reviews available.",
    loading: "Loading...",
    close: "Close",
    submit: "Submit",
    cancel: "Cancel",
    language: "Language",
    selectLanguage: "Select Language",
    english: "English",
    telugu: "Telugu",
    hindi: "Hindi",
    contactUs: "Contact Us",
    address: "Address",
    hours: "Hours",
    followUs: "Follow Us",
    yourName: "Your name",
    yourPhone: "Your phone number",
    yourEmail: "Your email",
    yourMessage: "Your message",
    rating: "Rating",
    comment: "Comment",
    trip: "Trip",
    selectTrip: "Select Trip",
    send: "Send",
    readMore: "Read More",
    back: "Back",
    next: "Next",
    previous: "Previous",
    watchVideo: "Watch Video",
    bookTrip: "Book This Trip",
    enquirySent: "Your enquiry has been sent successfully.",
    reviewSent: "Your review has been submitted successfully.",
    somethingWentWrong: "Something went wrong. Please try again."
  },

  te: {
    home: "హోమ్",
    trips: "ప్రయాణాలు",
    vehicles: "వాహనాలు",
    gallery: "గ్యాలరీ",
    videos: "వీడియోలు",
    reviews: "సమీక్షలు",
    contact: "సంప్రదించండి",
    about: "మా గురించి",
    bookNow: "ఇప్పుడే బుక్ చేయండి",
    viewDetails: "వివరాలు చూడండి",
    callNow: "ఇప్పుడే కాల్ చేయండి",
    whatsapp: "వాట్సాప్",
    sendEnquiry: "విచారణ పంపండి",
    submitReview: "సమీక్ష పంపండి",
    name: "పేరు",
    phone: "ఫోన్",
    email: "ఈమెయిల్",
    message: "సందేశం",
    destination: "గమ్యం",
    duration: "వ్యవధి",
    price: "ధర",
    vehicle: "వాహనం",
    available: "అందుబాటులో ఉంది",
    unavailable: "అందుబాటులో లేదు",
    capacity: "సామర్థ్యం",
    registration: "రిజిస్ట్రేషన్",
    noTrips: "ప్రస్తుతం ప్రయాణాలు అందుబాటులో లేవు.",
    noVehicles: "ప్రస్తుతం వాహనాలు అందుబాటులో లేవు.",
    noGallery: "గ్యాలరీలో అంశాలు లేవు.",
    noVideos: "వీడియోలు అందుబాటులో లేవు.",
    noReviews: "సమీక్షలు అందుబాటులో లేవు.",
    loading: "లోడ్ అవుతోంది...",
    close: "మూసివేయి",
    submit: "సమర్పించండి",
    cancel: "రద్దు చేయండి",
    language: "భాష",
    selectLanguage: "భాషను ఎంచుకోండి",
    english: "ఇంగ్లీష్",
    telugu: "తెలుగు",
    hindi: "హిందీ",
    contactUs: "మమ్మల్ని సంప్రదించండి",
    address: "చిరునామా",
    hours: "సమయాలు",
    followUs: "మమ్మల్ని అనుసరించండి",
    yourName: "మీ పేరు",
    yourPhone: "మీ ఫోన్ నంబర్",
    yourEmail: "మీ ఈమెయిల్",
    yourMessage: "మీ సందేశం",
    rating: "రేటింగ్",
    comment: "వ్యాఖ్య",
    trip: "ప్రయాణం",
    selectTrip: "ప్రయాణాన్ని ఎంచుకోండి",
    send: "పంపండి",
    readMore: "మరింత చదవండి",
    back: "వెనుకకు",
    next: "తదుపరి",
    previous: "మునుపటి",
    watchVideo: "వీడియో చూడండి",
    bookTrip: "ఈ ప్రయాణాన్ని బుక్ చేయండి",
    enquirySent: "మీ విచారణ విజయవంతంగా పంపబడింది.",
    reviewSent: "మీ సమీక్ష విజయవంతంగా పంపబడింది.",
    somethingWentWrong: "ఏదో తప్పు జరిగింది. మళ్లీ ప్రయత్నించండి."
  },

  hi: {
    home: "होम",
    trips: "यात्राएँ",
    vehicles: "वाहन",
    gallery: "गैलरी",
    videos: "वीडियो",
    reviews: "समीक्षाएँ",
    contact: "संपर्क करें",
    about: "हमारे बारे में",
    bookNow: "अभी बुक करें",
    viewDetails: "विवरण देखें",
    callNow: "अभी कॉल करें",
    whatsapp: "व्हाट्सऐप",
    sendEnquiry: "पूछताछ भेजें",
    submitReview: "समीक्षा भेजें",
    name: "नाम",
    phone: "फोन",
    email: "ईमेल",
    message: "संदेश",
    destination: "गंतव्य",
    duration: "अवधि",
    price: "कीमत",
    vehicle: "वाहन",
    available: "उपलब्ध",
    unavailable: "उपलब्ध नहीं",
    capacity: "क्षमता",
    registration: "पंजीकरण",
    noTrips: "कोई यात्रा उपलब्ध नहीं है।",
    noVehicles: "कोई वाहन उपलब्ध नहीं है।",
    noGallery: "कोई गैलरी आइटम उपलब्ध नहीं है।",
    noVideos: "कोई वीडियो उपलब्ध नहीं है।",
    noReviews: "कोई समीक्षा उपलब्ध नहीं है।",
    loading: "लोड हो रहा है...",
    close: "बंद करें",
    submit: "जमा करें",
    cancel: "रद्द करें",
    language: "भाषा",
    selectLanguage: "भाषा चुनें",
    english: "अंग्रेज़ी",
    telugu: "तेलुगु",
    hindi: "हिंदी",
    contactUs: "संपर्क करें",
    address: "पता",
    hours: "समय",
    followUs: "हमें फॉलो करें",
    yourName: "आपका नाम",
    yourPhone: "आपका फोन नंबर",
    yourEmail: "आपका ईमेल",
    yourMessage: "आपका संदेश",
    rating: "रेटिंग",
    comment: "टिप्पणी",
    trip: "यात्रा",
    selectTrip: "यात्रा चुनें",
    send: "भेजें",
    readMore: "और पढ़ें",
    back: "वापस",
    next: "अगला",
    previous: "पिछला",
    watchVideo: "वीडियो देखें",
    bookTrip: "इस यात्रा को बुक करें",
    enquirySent: "आपकी पूछताछ सफलतापूर्वक भेज दी गई है।",
    reviewSent: "आपकी समीक्षा सफलतापूर्वक भेज दी गई है।",
    somethingWentWrong: "कुछ गलत हुआ। कृपया फिर कोशिश करें।"
  }
};

/* =========================================================
   HELPERS
   ========================================================= */

function ensureSupabase() {
  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient
  ) {
    throw new Error("Supabase client unavailable.");
  }

  return supabaseClient;
}

function dbError(error, action) {
  console.error(`[data.js] ${action}:`, error);

  return new Error(
    `${action} failed: ${error?.message || "Unknown database error"}`
  );
}

async function dataLayerIsAdmin() {
  try {
    if (
      typeof supabaseClient === "undefined" ||
      !supabaseClient ||
      !supabaseClient.auth
    ) {
      return false;
    }

    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data?.session?.user) {
      return false;
    }

    return (
      data.session.user.id ===
      "589555e8-5853-4e58-aaac-8038ec833c80"
    );
  } catch (error) {
    console.error("[data.js] Admin check failed:", error);
    return false;
  }
}

/* =========================================================
   TRIPS
   ========================================================= */

function mapTrip(row, vehicles = []) {
  if (!row) return null;

  const vehicleIds = [];

  if (row.vehicle) {
    const names = String(row.vehicle)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    names.forEach((name) => {
      const vehicle = vehicles.find(
        (v) =>
          String(v.name || "").toLowerCase() ===
          name.toLowerCase()
      );

      if (vehicle) {
        vehicleIds.push(vehicle.id);
      }
    });
  }

  return {
    ...row,
    image: row.image_url || PLACEHOLDER_FALLBACK,
    vehicleIds
  };
}

function tripRowFromUI(trip) {
  return {
    name: trip.name || "",
    destination: trip.destination || "",
    description: trip.description || "",
    price: trip.price || "",
    duration: trip.duration || "",
    image_url: trip.image || trip.image_url || null,
    vehicle: Array.isArray(trip.vehicleIds)
      ? trip.vehicleIds.join(",")
      : trip.vehicle || ""
  };
}

async function getTrips() {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw dbError(error, "load trips");
  }

  const vehicles = await getVehicles();

  return (data || []).map((row) =>
    mapTrip(row, vehicles)
  );
}

async function getTrip(id) {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("trips")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw dbError(error, "load trip");
  }

  if (!data) return null;

  const vehicles = await getVehicles();

  return mapTrip(data, vehicles);
}

async function saveTrip(trip) {
  const client = ensureSupabase();

  const row = tripRowFromUI(trip);

  let result;

  if (trip.id) {
    result = await client
      .from("trips")
      .update(row)
      .eq("id", trip.id)
      .select()
      .single();
  } else {
    result = await client
      .from("trips")
      .insert(row)
      .select()
      .single();
  }

  if (result.error) {
    throw dbError(result.error, "save trip");
  }

  return mapTrip(result.data, await getVehicles());
}

async function deleteTrip(id) {
  const client = ensureSupabase();

  const { error } = await client
    .from("trips")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(error, "delete trip");
  }

  return true;
}

/* =========================================================
   VEHICLES
   ========================================================= */

function mapVehicle(row) {
  if (!row) return null;

  return {
    ...row,
    image_url: row.image_url || PLACEHOLDER_FALLBACK
  };
}

function vehicleRowFromUI(vehicle) {
  return {
    name: vehicle.name || "",
    type: vehicle.type || "",
    capacity:
      vehicle.capacity === "" ||
      vehicle.capacity === null ||
      vehicle.capacity === undefined
        ? null
        : Number(vehicle.capacity),
    registration: vehicle.registration || "",
    image_url: vehicle.image_url || null,
    available:
      vehicle.available === undefined
        ? true
        : Boolean(vehicle.available)
  };
}

async function getVehicles() {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw dbError(error, "load vehicles");
  }

  return (data || []).map(mapVehicle);
}

async function getVehicle(id) {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw dbError(error, "load vehicle");
  }

  return mapVehicle(data);
}

async function saveVehicle(vehicle) {
  const client = ensureSupabase();

  const row = vehicleRowFromUI(vehicle);

  let result;

  if (vehicle.id) {
    result = await client
      .from("vehicles")
      .update(row)
      .eq("id", vehicle.id)
      .select()
      .single();
  } else {
    result = await client
      .from("vehicles")
      .insert(row)
      .select()
      .single();
  }

  if (result.error) {
    throw dbError(result.error, "save vehicle");
  }

  return mapVehicle(result.data);
}

async function deleteVehicle(id) {
  const client = ensureSupabase();

  const { error } = await client
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(error, "delete vehicle");
  }

  return true;
}

/* =========================================================
   GALLERY
   ========================================================= */

function mapGallery(row) {
  if (!row) return null;

  return {
    ...row,
    caption: row.title || "",
    image_url: row.media_url || PLACEHOLDER_FALLBACK
  };
}

function galleryRowFromUI(item) {
  return {
    title: item.caption || item.title || "",
    media_url: item.image_url || item.media_url || null,
    media_type: item.media_type || "image",
    description: item.description || "",
    approved:
      item.approved === undefined
        ? false
        : Boolean(item.approved)
  };
}

async function getGallery() {
  const client = ensureSupabase();
  const admin = await dataLayerIsAdmin();

  let query = client
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  if (!admin) {
    query = query.eq("approved", true);
  }

  const { data, error } = await query;

  if (error) {
    throw dbError(error, "load gallery");
  }

  return (data || []).map(mapGallery);
}

async function getGalleryItem(id) {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("gallery")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw dbError(error, "load gallery item");
  }

  return mapGallery(data);
}

async function saveGalleryItem(item) {
  const client = ensureSupabase();

  const row = galleryRowFromUI(item);

  let result;

  if (item.id) {
    result = await client
      .from("gallery")
      .update(row)
      .eq("id", item.id)
      .select()
      .single();
  } else {
    result = await client
      .from("gallery")
      .insert(row)
      .select()
      .single();
  }

  if (result.error) {
    throw dbError(result.error, "save gallery item");
  }

  return mapGallery(result.data);
}

async function deleteGalleryItem(id) {
  const client = ensureSupabase();

  const { error } = await client
    .from("gallery")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(error, "delete gallery item");
  }

  return true;
}

/* =========================================================
   REVIEWS
   ========================================================= */

function mapReview(row) {
  if (!row) return null;

  return {
    ...row,
    review: row.comment || row.review || ""
  };
}

function reviewRowFromUI(review) {
  return {
    name: review.name || "",
    rating: Number(review.rating || 5),
    comment: review.review || review.comment || "",
    approved:
      review.approved === undefined
        ? false
        : Boolean(review.approved)
  };
}

async function getReviews() {
  const client = ensureSupabase();
  const admin = await dataLayerIsAdmin();

  let query = client
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (!admin) {
    query = query.eq("approved", true);
  }

  const { data, error } = await query;

  if (error) {
    throw dbError(error, "load reviews");
  }

  return (data || []).map(mapReview);
}

async function getReview(id) {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw dbError(error, "load review");
  }

  return mapReview(data);
}

async function saveReview(review) {
  const client = ensureSupabase();

  const row = reviewRowFromUI(review);

  let result;

  if (review.id) {
    result = await client
      .from("reviews")
      .update(row)
      .eq("id", review.id)
      .select()
      .single();
  } else {
    result = await client
      .from("reviews")
      .insert(row)
      .select()
      .single();
  }

  if (result.error) {
    throw dbError(result.error, "save review");
  }

  return mapReview(result.data);
}

async function deleteReview(id) {
  const client = ensureSupabase();

  const { error } = await client
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(error, "delete review");
  }

  return true;
}

/* =========================================================
   ENQUIRIES
   ========================================================= */

function mapEnquiry(row) {
  return row ? { ...row } : null;
}

async function getEnquiries() {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw dbError(error, "load enquiries");
  }

  return (data || []).map(mapEnquiry);
}

async function getEnquiry(id) {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("enquiries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw dbError(error, "load enquiry");
  }

  return mapEnquiry(data);
}

async function saveEnquiry(enquiry) {
  const client = ensureSupabase();

  const row = {
    name: enquiry.name || "",
    phone: enquiry.phone || "",
    trip: enquiry.trip || "",
    message: enquiry.message || "",
    status: enquiry.status || "new"
  };

  let result;

  if (enquiry.id) {
    result = await client
      .from("enquiries")
      .update(row)
      .eq("id", enquiry.id)
      .select()
      .single();
  } else {
    result = await client
      .from("enquiries")
      .insert(row)
      .select()
      .single();
  }

  if (result.error) {
    throw dbError(result.error, "save enquiry");
  }

  return mapEnquiry(result.data);
}

async function deleteEnquiry(id) {
  const client = ensureSupabase();

  const { error } = await client
    .from("enquiries")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(error, "delete enquiry");
  }

  return true;
}

/* =========================================================
   VIDEOS
   ========================================================= */

function mapVideo(row) {
  if (!row) return null;

  return {
    ...row,
    youtubeId: row.youtube_id || ""
  };
}

function videoRowFromUI(video) {
  return {
    title: video.title || "",
    description: video.description || "",
    youtube_id: video.youtubeId || video.youtube_id || ""
  };
}

async function getVideos() {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw dbError(error, "load videos");
  }

  return (data || []).map(mapVideo);
}

async function getVideo(id) {
  const client = ensureSupabase();

  const { data, error } = await client
    .from("videos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw dbError(error, "load video");
  }

  return mapVideo(data);
}

async function saveVideo(video) {
  const client = ensureSupabase();

  const row = videoRowFromUI(video);

  let result;

  if (video.id) {
    result = await client
      .from("videos")
      .update(row)
      .eq("id", video.id)
      .select()
      .single();
  } else {
    result = await client
      .from("videos")
      .insert(row)
      .select()
      .single();
  }

  if (result.error) {
    throw dbError(result.error, "save video");
  }

  return mapVideo(result.data);
}

async function deleteVideo(id) {
  const client = ensureSupabase();

  const { error } = await client
    .from("videos")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(error, "delete video");
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

function normalizeSettings(row) {
  if (!row) {
    return {
      ...BUSINESS_DEFAULTS
    };
  }

  return {
    name:
      row.business_name ||
      BUSINESS_DEFAULTS.name,

    phone: row.phone || "",
    whatsapp: row.whatsapp || "",
    email: row.email || "",
    address: row.address || "",
    description: row.description || "",
    hours: row.hours || "",
    mapUrl: row.map_url || "",
    facebook: row.facebook || "",
    instagram: row.instagram || "",
    youtube: row.youtube || "",
    aboutText: row.about_text || "",
    footerText: row.footer_text || ""
  };
}

function settingsRowFromUI(settings) {
  return {
    id: 1,
    business_name:
      settings.name ||
      BUSINESS_DEFAULTS.name,
    phone: settings.phone || "",
    whatsapp: settings.whatsapp || "",
    email: settings.email || "",
    address: settings.address || "",
    description: settings.description || "",
    hours: settings.hours || "",
    map_url: settings.mapUrl || "",
    facebook: settings.facebook || "",
    instagram: settings.instagram || "",
    youtube: settings.youtube || "",
    about_text: settings.aboutText || "",
    footer_text: settings.footerText || ""
  };
}

/*
 * IMPORTANT:
 * app.js expects getBusiness() to be synchronous.
 * Therefore getBusiness() returns the cached settings.
 */

function getBusiness() {
  return {
    ...BUSINESS_CACHE
  };
}

async function refreshBusinessCache() {
  try {
    const client = ensureSupabase();

    const { data, error } = await client
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

    BUSINESS_CACHE = normalizeSettings(data);

    try {
      window.dispatchEvent(
        new CustomEvent("hdt:business-updated")
      );
    } catch (eventError) {
      // Ignore unsupported CustomEvent environments.
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

async function getSettings() {
  return await refreshBusinessCache();
}

async function saveSettings(newSettings) {
  const client = ensureSupabase();

  const existing = getBusiness();

  const merged = {
    ...existing,
    ...newSettings
  };

  const row = settingsRowFromUI(merged);

  const { data, error } = await client
    .from("settings")
    .upsert(row, {
      onConflict: "id"
    })
    .select()
    .single();

  if (error) {
    throw dbError(error, "save business settings");
  }

  BUSINESS_CACHE = normalizeSettings(data);

  try {
    window.dispatchEvent(
      new CustomEvent("hdt:business-updated")
    );
  } catch (eventError) {
    // Ignore unsupported CustomEvent environments.
  }

  return BUSINESS_CACHE;
}

/* =========================================================
   DATA LAYER INITIALIZATION
   ========================================================= */

function initDataLayer() {
  /*
   * Do not block app startup.
   * Load settings in the background.
   */
  refreshBusinessCache();
}

initDataLayer();
