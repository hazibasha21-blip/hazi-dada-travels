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
    destination: "Destination",

    btn_book_now: "Book Now",
    hero_title: "Explore More, Travel Better",
    hero_subtitle: "Comfortable and reliable travel services for your journey.",
    btn_explore_trips: "Explore Trips",

    section_featured: "Featured Trips",
    btn_see_all: "See All",
    loading_trips: "Loading trips...",
    empty_trips: "No trips available at the moment.",

    section_vehicles: "Our Vehicles",
    loading_vehicles: "Loading vehicles...",
    empty_vehicles: "No vehicles available at the moment.",

    why_title: "Why Choose Hazi Dada Travels?",
    why_1_t: "Reliable Service",
    why_1_d: "Dependable travel service for your journey.",
    why_2_t: "Comfortable Vehicles",
    why_2_d: "Travel comfortably with our well-maintained vehicles.",
    why_3_t: "Multiple Destinations",
    why_3_d: "Explore a variety of destinations with us.",
    why_4_t: "Customer Friendly",
    why_4_d: "We focus on making your journey simple and convenient.",

    section_gallery: "Gallery",
    loading_gallery: "Loading gallery...",
    empty_gallery: "No gallery images available.",

    section_video_preview: "Travel Videos",
    loading_videos: "Loading videos...",

    section_reviews: "Customer Reviews",
    empty_reviews: "No reviews available yet.",

    cta_title: "Ready to Start Your Journey?",
    cta_sub: "Book your trip with Hazi Dada Travels today.",
    btn_contact_us: "Contact Us",

    footer_about: "Your trusted travel partner for comfortable and reliable journeys.",
    footer_quick_links: "Quick Links",
    nav_home: "Home",
    nav_trips: "Trips",
    nav_vehicles: "Vehicles",
    nav_gallery: "Gallery",
    nav_videos: "Videos",
    nav_reviews: "Reviews",
    nav_contact: "Contact",
    footer_contact: "Contact Us",
    footer_rights: "All rights reserved.",

    err_load: "Unable to load information.",
    btn_retry: "Retry"
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
    destination: "గమ్యం",

    btn_book_now: "బుక్ చేయండి",
    hero_title: "మరింత అన్వేషించండి, మెరుగ్గా ప్రయాణించండి",
    hero_subtitle: "మీ ప్రయాణానికి సౌకర్యవంతమైన మరియు నమ్మకమైన ట్రావెల్ సేవలు.",
    btn_explore_trips: "ట్రిప్స్ చూడండి",

    section_featured: "ముఖ్యమైన ట్రిప్స్",
    btn_see_all: "అన్నీ చూడండి",
    loading_trips: "ట్రిప్స్ లోడ్ అవుతున్నాయి...",
    empty_trips: "ప్రస్తుతం ట్రిప్స్ అందుబాటులో లేవు.",

    section_vehicles: "మా వాహనాలు",
    loading_vehicles: "వాహనాలు లోడ్ అవుతున్నాయి...",
    empty_vehicles: "ప్రస్తుతం వాహనాలు అందుబాటులో లేవు.",

    why_title: "హాజీ దాదా ట్రావెల్స్‌ను ఎందుకు ఎంచుకోవాలి?",
    why_1_t: "నమ్మకమైన సేవ",
    why_1_d: "మీ ప్రయాణానికి నమ్మకమైన ట్రావెల్ సేవ.",
    why_2_t: "సౌకర్యవంతమైన వాహనాలు",
    why_2_d: "మంచిగా నిర్వహించబడిన వాహనాల్లో సౌకర్యవంతంగా ప్రయాణించండి.",
    why_3_t: "అనేక గమ్యస్థానాలు",
    why_3_d: "మాతో కలిసి వివిధ గమ్యస్థానాలను సందర్శించండి.",
    why_4_t: "కస్టమర్‌కు అనుకూలమైన సేవ",
    why_4_d: "మీ ప్రయాణాన్ని సులభంగా మరియు సౌకర్యవంతంగా చేయడమే మా లక్ష్యం.",

    section_gallery: "గ్యాలరీ",
    loading_gallery: "గ్యాలరీ లోడ్ అవుతోంది...",
    empty_gallery: "గ్యాలరీలో చిత్రాలు అందుబాటులో లేవు.",

    section_video_preview: "ప్రయాణ వీడియోలు",
    loading_videos: "వీడియోలు లోడ్ అవుతున్నాయి...",

    section_reviews: "కస్టమర్ సమీక్షలు",
    empty_reviews: "ఇంకా సమీక్షలు అందుబాటులో లేవు.",

    cta_title: "మీ ప్రయాణాన్ని ప్రారంభించడానికి సిద్ధంగా ఉన్నారా?",
    cta_sub: "ఈరోజే హాజీ దాదా ట్రావెల్స్‌తో మీ ట్రిప్‌ను బుక్ చేసుకోండి.",
    btn_contact_us: "సంప్రదించండి",

    footer_about: "సౌకర్యవంతమైన మరియు నమ్మకమైన ప్రయాణాలకు మీ విశ్వసనీయ ట్రావెల్ భాగస్వామి.",
    footer_quick_links: "త్వరిత లింకులు",
    nav_home: "హోమ్",
    nav_trips: "ట్రిప్స్",
    nav_vehicles: "వాహనాలు",
    nav_gallery: "గ్యాలరీ",
    nav_videos: "వీడియోలు",
    nav_reviews: "సమీక్షలు",
    nav_contact: "సంప్రదించండి",
    footer_contact: "సంప్రదించండి",
    footer_rights: "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.",

    err_load: "సమాచారాన్ని లోడ్ చేయలేకపోయాము.",
    btn_retry: "మళ్లీ ప్రయత్నించండి"
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
    destination: "गंतव्य",

    btn_book_now: "बुक करें",
    hero_title: "और अधिक खोजें, बेहतर यात्रा करें",
    hero_subtitle: "आपकी यात्रा के लिए आरामदायक और भरोसेमंद ट्रैवल सेवाएँ।",
    btn_explore_trips: "ट्रिप्स देखें",

    section_featured: "विशेष ट्रिप्स",
    btn_see_all: "सभी देखें",
    loading_trips: "ट्रिप्स लोड हो रही हैं...",
    empty_trips: "फिलहाल कोई ट्रिप उपलब्ध नहीं है।",

    section_vehicles: "हमारे वाहन",
    loading_vehicles: "वाहन लोड हो रहे हैं...",
    empty_vehicles: "फिलहाल कोई वाहन उपलब्ध नहीं है।",

    why_title: "हाजी दादा ट्रैवल्स क्यों चुनें?",
    why_1_t: "भरोसेमंद सेवा",
    why_1_d: "आपकी यात्रा के लिए भरोसेमंद ट्रैवल सेवा।",
    why_2_t: "आरामदायक वाहन",
    why_2_d: "अच्छी तरह से रखरखाव किए गए वाहनों में आराम से यात्रा करें।",
    why_3_t: "कई गंतव्य",
    why_3_d: "हमारे साथ विभिन्न गंतव्यों की यात्रा करें।",
    why_4_t: "ग्राहक अनुकूल सेवा",
    why_4_d: "हम आपकी यात्रा को आसान और सुविधाजनक बनाने पर ध्यान देते हैं।",

    section_gallery: "गैलरी",
    loading_gallery: "गैलरी लोड हो रही है...",
    empty_gallery: "गैलरी में कोई चित्र उपलब्ध नहीं है।",

    section_video_preview: "यात्रा वीडियो",
    loading_videos: "वीडियो लोड हो रहे हैं...",

    section_reviews: "ग्राहक समीक्षाएँ",
    empty_reviews: "अभी कोई समीक्षा उपलब्ध नहीं है।",

    cta_title: "अपनी यात्रा शुरू करने के लिए तैयार हैं?",
    cta_sub: "आज ही हाजी दादा ट्रैवल्स के साथ अपनी यात्रा बुक करें।",
    btn_contact_us: "संपर्क करें",

    footer_about: "आरामदायक और भरोसेमंद यात्राओं के लिए आपका विश्वसनीय ट्रैवल पार्टनर।",
    footer_quick_links: "त्वरित लिंक",
    nav_home: "होम",
    nav_trips: "ट्रिप्स",
    nav_vehicles: "वाहन",
    nav_gallery: "गैलरी",
    nav_videos: "वीडियो",
    nav_reviews: "समीक्षाएँ",
    nav_contact: "संपर्क करें",
    footer_contact: "संपर्क करें",
    footer_rights: "सर्वाधिकार सुरक्षित।",

    err_load: "जानकारी लोड नहीं हो सकी।",
    btn_retry: "फिर से प्रयास करें"
  }
};

const translations = TRANSLATIONS;
window.translations = TRANSLATIONS;

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
