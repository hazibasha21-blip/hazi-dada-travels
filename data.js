/* ============================================================
   HAZI DADA TRAVELS V1
   Supabase Data Layer
   ============================================================ */

/* =========================
   SUPABASE CONFIG
   ========================= */

const SUPABASE_URL = "https://wsrnlftrmjqutrrejajj.supabase.co";

/*
   Your publishable key goes here.
   Keep this as the PUBLIC / PUBLISHABLE key only.
*/
const SUPABASE_KEY = "sb_publishable_LHHxBaLuQqrBh5Tv094PFQ_OSrlGDve";

const SUPABASE_HEADERS = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json"
};


/* =========================
   BUSINESS DEFAULTS
   ========================= */

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
    "Hazi Dada Travels helps travellers plan comfortable, well-organised trips.",
  footerText: "Your trusted travel partner."
};


/* =========================
   TRANSLATIONS
   ========================= */

const translations = {

  en: {
    nav_home: "Home",
    nav_trips: "Trips",
    nav_vehicles: "Vehicles",
    nav_gallery: "Gallery",
    nav_videos: "Videos",
    nav_reviews: "Reviews",
    nav_contact: "Contact",

    hero_title: "Explore. Travel. Create Memories.",
    hero_subtitle:
      "Discover memorable journeys with Hazi Dada Travels.",

    btn_explore_trips: "Explore Trips",
    btn_contact_us: "Contact Us",
    btn_view_details: "View Details",
    btn_book_now: "Book Now",
    btn_call: "Call",
    btn_whatsapp: "WhatsApp",
    btn_copy_number: "Copy Number",
    btn_close: "Close",
    btn_all: "All",

    section_featured: "Featured Trips",
    section_trips: "Our Trips",
    section_vehicles: "Our Vehicles",
    section_gallery: "Gallery",
    section_videos: "Videos",
    section_reviews: "Reviews",
    section_contact: "Contact Us",

    label_destination: "Destination",
    label_duration: "Duration",
    label_price: "Price",
    label_vehicle: "Vehicle",
    label_highlights: "Highlights",
    label_available_vehicles: "Available Vehicles",
    label_trip_gallery: "Trip Gallery",

    book_title: "Book / Enquire",

    toast_copied: "Number copied!",
    toast_review_submitted: "Review submitted successfully.",

    empty_trips: "No trips available.",
    empty_vehicles: "No vehicles available.",
    empty_gallery: "No gallery items available.",
    empty_videos: "No videos available.",
    empty_reviews: "No reviews available.",

    loading_trips: "Loading trips...",
    loading_vehicles: "Loading vehicles...",
    loading_gallery: "Loading gallery...",
    loading_videos: "Loading videos...",
    loading_reviews: "Loading reviews...",

    error_generic: "Something went wrong. Please try again.",
    error_trip_not_found: "Trip not found.",

    form_name: "Your Name",
    form_phone: "Phone Number",
    form_trip: "Trip",
    form_message: "Message",
    form_rating: "Rating",
    form_submit: "Submit",

    footer_quick_links: "Quick Links",
    footer_contact: "Contact",
    footer_rights: "All rights reserved.",

    contact_call: "Call Us",
    contact_whatsapp: "WhatsApp",
    contact_location: "Location",

    category_all: "All",
    category_tour: "Tours",
    category_temple: "Temple",
    category_hill: "Hill Stations",
    category_beach: "Beach",
    category_other: "Other"
  },

  te: {
    nav_home: "హోమ్",
    nav_trips: "ట్రిప్స్",
    nav_vehicles: "వాహనాలు",
    nav_gallery: "గ్యాలరీ",
    nav_videos: "వీడియోలు",
    nav_reviews: "రివ్యూలు",
    nav_contact: "సంప్రదించండి",

    hero_title: "ప్రయాణించండి. అనుభవించండి. జ్ఞాపకాలు సృష్టించండి.",
    hero_subtitle:
      "హాజీ దాదా ట్రావెల్స్‌తో మీ ప్రయాణాన్ని ఆనందంగా మార్చుకోండి.",

    btn_explore_trips: "ట్రిప్స్ చూడండి",
    btn_contact_us: "సంప్రదించండి",
    btn_view_details: "వివరాలు",
    btn_book_now: "బుక్ చేయండి",
    btn_call: "కాల్",
    btn_whatsapp: "వాట్సాప్",
    btn_copy_number: "నంబర్ కాపీ",
    btn_close: "మూసివేయండి",
    btn_all: "అన్నీ",

    section_featured: "ప్రత్యేక ట్రిప్స్",
    section_trips: "మా ట్రిప్స్",
    section_vehicles: "మా వాహనాలు",
    section_gallery: "గ్యాలరీ",
    section_videos: "వీడియోలు",
    section_reviews: "రివ్యూలు",
    section_contact: "మమ్మల్ని సంప్రదించండి",

    label_destination: "ప్రదేశం",
    label_duration: "వ్యవధి",
    label_price: "ధర",
    label_vehicle: "వాహనం",
    label_highlights: "ముఖ్యాంశాలు",
    label_available_vehicles: "అందుబాటులో ఉన్న వాహనాలు",
    label_trip_gallery: "ట్రిప్ గ్యాలరీ",

    book_title: "బుక్ / విచారణ",

    toast_copied: "నంబర్ కాపీ చేయబడింది!",
    toast_review_submitted: "రివ్యూ విజయవంతంగా పంపబడింది.",

    empty_trips: "ప్రస్తుతం ట్రిప్స్ లేవు.",
    empty_vehicles: "ప్రస్తుతం వాహనాలు లేవు.",
    empty_gallery: "గ్యాలరీలో ప్రస్తుతం ఏమీ లేదు.",
    empty_videos: "ప్రస్తుతం వీడియోలు లేవు.",
    empty_reviews: "ప్రస్తుతం రివ్యూలు లేవు.",

    loading_trips: "ట్రిప్స్ లోడ్ అవుతున్నాయి...",
    loading_vehicles: "వాహనాలు లోడ్ అవుతున్నాయి...",
    loading_gallery: "గ్యాలరీ లోడ్ అవుతోంది...",
    loading_videos: "వీడియోలు లోడ్ అవుతున్నాయి...",
    loading_reviews: "రివ్యూలు లోడ్ అవుతున్నాయి...",

    error_generic: "ఏదో సమస్య వచ్చింది. మళ్లీ ప్రయత్నించండి.",
    error_trip_not_found: "ట్రిప్ కనుగొనబడలేదు.",

    form_name: "మీ పేరు",
    form_phone: "ఫోన్ నంబర్",
    form_trip: "ట్రిప్",
    form_message: "సందేశం",
    form_rating: "రేటింగ్",
    form_submit: "సమర్పించండి",

    footer_quick_links: "త్వరిత లింకులు",
    footer_contact: "సంప్రదించండి",
    footer_rights: "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.",

    contact_call: "కాల్ చేయండి",
    contact_whatsapp: "వాట్సాప్",
    contact_location: "ప్రదేశం",

    category_all: "అన్నీ",
    category_tour: "టూర్స్",
    category_temple: "దేవాలయం",
    category_hill: "హిల్ స్టేషన్స్",
    category_beach: "బీచ్",
    category_other: "ఇతరాలు"
  },

  hi: {
    nav_home: "होम",
    nav_trips: "ट्रिप्स",
    nav_vehicles: "वाहन",
    nav_gallery: "गैलरी",
    nav_videos: "वीडियो",
    nav_reviews: "रिव्यू",
    nav_contact: "संपर्क",

    hero_title: "घूमें। यात्रा करें। यादें बनाएं।",
    hero_subtitle:
      "Hazi Dada Travels के साथ यादगार यात्राओं का आनंद लें।",

    btn_explore_trips: "ट्रिप्स देखें",
    btn_contact_us: "संपर्क करें",
    btn_view_details: "विवरण देखें",
    btn_book_now: "बुक करें",
    btn_call: "कॉल",
    btn_whatsapp: "WhatsApp",
    btn_copy_number: "नंबर कॉपी करें",
    btn_close: "बंद करें",
    btn_all: "सभी",

    section_featured: "विशेष ट्रिप्स",
    section_trips: "हमारी ट्रिप्स",
    section_vehicles: "हमारे वाहन",
    section_gallery: "गैलरी",
    section_videos: "वीडियो",
    section_reviews: "रिव्यू",
    section_contact: "संपर्क करें",

    label_destination: "स्थान",
    label_duration: "अवधि",
    label_price: "कीमत",
    label_vehicle: "वाहन",
    label_highlights: "मुख्य बातें",
    label_available_vehicles: "उपलब्ध वाहन",
    label_trip_gallery: "ट्रिप गैलरी",

    book_title: "बुक / पूछताछ",

    toast_copied: "नंबर कॉपी हो गया!",
    toast_review_submitted: "रिव्यू सफलतापूर्वक भेज दिया गया।",

    empty_trips: "कोई ट्रिप उपलब्ध नहीं है।",
    empty_vehicles: "कोई वाहन उपलब्ध नहीं है।",
    empty_gallery: "गैलरी में कुछ नहीं है।",
    empty_videos: "कोई वीडियो उपलब्ध नहीं है।",
    empty_reviews: "कोई रिव्यू उपलब्ध नहीं है।",

    loading_trips: "ट्रिप्स लोड हो रही हैं...",
    loading_vehicles: "वाहन लोड हो रहे हैं...",
    loading_gallery: "गैलरी लोड हो रही है...",
    loading_videos: "वीडियो लोड हो रहे हैं...",
    loading_reviews: "रिव्यू लोड हो रहे हैं...",

    error_generic: "कुछ गलत हो गया। कृपया फिर से प्रयास करें।",
    error_trip_not_found: "ट्रिप नहीं मिली।",

    form_name: "आपका नाम",
    form_phone: "फोन नंबर",
    form_trip: "ट्रिप",
    form_message: "संदेश",
    form_rating: "रेटिंग",
    form_submit: "सबमिट करें",

    footer_quick_links: "त्वरित लिंक",
    footer_contact: "संपर्क",
    footer_rights: "सर्वाधिकार सुरक्षित।",

    contact_call: "कॉल करें",
    contact_whatsapp: "WhatsApp",
    contact_location: "स्थान",

    category_all: "सभी",
    category_tour: "टूर",
    category_temple: "मंदिर",
    category_hill: "हिल स्टेशन",
    category_beach: "बीच",
    category_other: "अन्य"
  }

};


/* =========================
   PLACEHOLDER IMAGE
   ========================= */

function placeholderImage(emoji = "🚌", label = "Hazi Dada Travels") {

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="900"
         height="600"
         viewBox="0 0 900 600">
      <rect width="900" height="600" fill="#eaf2f8"/>
      <text x="450"
            y="270"
            text-anchor="middle"
            font-size="90">${emoji}</text>
      <text x="450"
            y="370"
            text-anchor="middle"
            font-family="Arial"
            font-size="34"
            fill="#263746">${label}</text>
    </svg>
  `;

  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg);
}

const PLACEHOLDER_FALLBACK =
  placeholderImage("🚌", "Hazi Dada Travels");


/* =========================
   SUPABASE REQUEST HELPER
   ========================= */

async function supabaseRequest(
  table,
  options = {}
) {

  const {
    method = "GET",
    query = "",
    body = null,
    prefer = ""
  } = options;

  const url =
    `${SUPABASE_URL}/rest/v1/${table}${query}`;

  const headers = {
    ...SUPABASE_HEADERS
  };

  if (prefer) {
    headers["Prefer"] = prefer;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== null
      ? JSON.stringify(body)
      : undefined
  });

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {

    console.error(
      `Supabase ${method} ${table} error:`,
      data
    );

    const message =
      data?.message ||
      data?.error_description ||
      data?.hint ||
      `Supabase request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}


/* =========================
   GENERIC HELPERS
   ========================= */

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}


function sortNewestFirst(items) {

  return safeArray(items).sort((a, b) => {

    const da =
      a?.created_at
        ? new Date(a.created_at).getTime()
        : 0;

    const db =
      b?.created_at
        ? new Date(b.created_at).getTime()
        : 0;

    return db - da;
  });
}


function normaliseId(id) {
  return String(id);
}


/* =========================
   INITIALIZATION
   ========================= */

async function initDataLayer() {

  console.log(
    "Hazi Dada Travels V1: Supabase data layer initialized."
  );

  try {

    await supabaseRequest(
      "trips",
      {
        query: "?select=id&limit=1"
      }
    );

    console.log(
      "Hazi Dada Travels V1: Supabase connection OK."
    );

    return true;

  } catch (error) {

    console.error(
      "Hazi Dada Travels V1: Supabase connection failed.",
      error
    );

    return false;
  }
}


/* =========================
   SETTINGS
   ========================= */

/*
   There is currently no settings table in the
   confirmed Supabase schema.

   Therefore business settings remain local defaults
   until we add a proper settings table later.
*/

let localBusinessSettings = {
  ...BUSINESS_DEFAULTS
};


async function getSettings() {
  return {
    ...localBusinessSettings
  };
}


async function getBusiness() {
  return {
    ...BUSINESS_DEFAULTS,
    ...localBusinessSettings
  };
}


async function saveSettings(settings = {}) {

  localBusinessSettings = {
    ...localBusinessSettings,
    ...settings
  };

  return {
    ...localBusinessSettings
  };
}


/* =========================
   TRIPS
   ========================= */

async function getTrips() {

  const data = await supabaseRequest(
    "trips",
    {
      query:
        "?select=id,created_at,name,destination,description,price,duration,image_url,vehicle&order=created_at.desc"
    }
  );

  return sortNewestFirst(data);
}


async function getTripById(id) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  const data = await supabaseRequest(
    "trips",
    {
      query:
        `?select=id,created_at,name,destination,description,price,duration,image_url,vehicle&id=eq.${safeId}&limit=1`
    }
  );

  return data?.[0] || null;
}


async function saveTrip(trip = {}) {

  const payload = {

    name: trip.name || "",
    destination: trip.destination || "",
    description: trip.description || "",
    price: trip.price || "",
    duration: trip.duration || "",
    image_url: trip.image_url || "",
    vehicle: trip.vehicle || ""
  };

  const data = await supabaseRequest(
    "trips",
    {
      method: "POST",
      query: "?select=*",
      body: payload,
      prefer: "return=representation"
    }
  );

  return data?.[0] || null;
}


async function updateTrip(id, trip = {}) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  const payload = {

    name: trip.name || "",
    destination: trip.destination || "",
    description: trip.description || "",
    price: trip.price || "",
    duration: trip.duration || "",
    image_url: trip.image_url || "",
    vehicle: trip.vehicle || ""
  };

  const data = await supabaseRequest(
    "trips",
    {
      method: "PATCH",
      query:
        `?id=eq.${safeId}&select=*`,
      body: payload,
      prefer: "return=representation"
    }
  );

  return data?.[0] || null;
}


async function deleteTrip(id) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  await supabaseRequest(
    "trips",
    {
      method: "DELETE",
      query:
        `?id=eq.${safeId}`
    }
  );

  return true;
}


/* =========================
   VEHICLES
   ========================= */

async function getVehicles() {

  const data = await supabaseRequest(
    "vehicles",
    {
      query:
        "?select=id,created_at,name,type,capacity,registration,image_url,available&order=created_at.desc"
    }
  );

  return sortNewestFirst(data);
}


async function getVehiclesByIds(ids = []) {

  const cleanIds =
    safeArray(ids)
      .map(normaliseId)
      .filter(Boolean);

  if (!cleanIds.length) {
    return [];
  }

  const idList =
    cleanIds
      .map(id => `"${id.replace(/"/g, '\\"')}"`)
      .join(",");

  const data = await supabaseRequest(
    "vehicles",
    {
      query:
        `?select=id,created_at,name,type,capacity,registration,image_url,available&id=in.(${idList})`
    }
  );

  return data || [];
}


async function saveVehicle(vehicle = {}) {

  const payload = {

    name: vehicle.name || "",
    type: vehicle.type || "",
    capacity:
      vehicle.capacity === "" ||
      vehicle.capacity === undefined ||
      vehicle.capacity === null
        ? null
        : Number(vehicle.capacity),

    registration: vehicle.registration || "",
    image_url: vehicle.image_url || "",

    available:
      vehicle.available === undefined
        ? true
        : Boolean(vehicle.available)
  };

  const data = await supabaseRequest(
    "vehicles",
    {
      method: "POST",
      query: "?select=*",
      body: payload,
      prefer: "return=representation"
    }
  );

  return data?.[0] || null;
}


async function updateVehicle(id, vehicle = {}) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  const payload = {

    name: vehicle.name || "",
    type: vehicle.type || "",
    capacity:
      vehicle.capacity === "" ||
      vehicle.capacity === undefined ||
      vehicle.capacity === null
        ? null
        : Number(vehicle.capacity),

    registration: vehicle.registration || "",
    image_url: vehicle.image_url || "",

    available:
      vehicle.available === undefined
        ? true
        : Boolean(vehicle.available)
  };

  const data = await supabaseRequest(
    "vehicles",
    {
      method: "PATCH",
      query:
        `?id=eq.${safeId}&select=*`,
      body: payload,
      prefer: "return=representation"
    }
  );

  return data?.[0] || null;
}


async function deleteVehicle(id) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  await supabaseRequest(
    "vehicles",
    {
      method: "DELETE",
      query:
        `?id=eq.${safeId}`
    }
  );

  return true;
}


/* =========================
   GALLERY
   ========================= */

async function getGallery() {

  const data = await supabaseRequest(
    "gallery",
    {
      query:
        "?select=id,created_at,title,media_url,media_type,description,approved&approved=eq.true&order=created_at.desc"
    }
  );

  return sortNewestFirst(data);
}


async function saveGalleryItem(item = {}) {

  const payload = {

    title: item.title || "",
    media_url: item.media_url || "",
    media_type: item.media_type || "image",
    description: item.description || "",
    approved:
      item.approved === undefined
        ? true
        : Boolean(item.approved)
  };

  const data = await supabaseRequest(
    "gallery",
    {
      method: "POST",
      query: "?select=*",
      body: payload,
      prefer: "return=representation"
    }
  );

  return data?.[0] || null;
}


async function deleteGalleryItem(id) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  await supabaseRequest(
    "gallery",
    {
      method: "DELETE",
      query:
        `?id=eq.${safeId}`
    }
  );

  return true;
}


/* =========================
   VIDEOS
   ========================= */

/*
   No separate "videos" table exists in the confirmed
   Supabase database.

   Therefore videos are stored inside the existing
   "gallery" table using:

   media_type = "video"

   This means we do NOT need to create another table.
*/

async function getVideos() {

  const data = await supabaseRequest(
    "gallery",
    {
      query:
        "?select=id,created_at,title,media_url,media_type,description,approved&media_type=eq.video&approved=eq.true&order=created_at.desc"
    }
  );

  return safeArray(data).map(item => ({

    id: item.id,

    created_at: item.created_at,

    title: item.title || "",

    /*
      app.js may expect url in some places.
    */
    url: item.media_url || "",

    media_url: item.media_url || "",

    media_type: "video",

    description: item.description || "",

    approved: item.approved !== false
  }));
}


async function saveVideo(video = {}) {

  const payload = {

    title: video.title || "",

    media_url:
      video.media_url ||
      video.url ||
      "",

    media_type: "video",

    description: video.description || "",

    approved:
      video.approved === undefined
        ? true
        : Boolean(video.approved)
  };

  const data = await supabaseRequest(
    "gallery",
    {
      method: "POST",
      query: "?select=*",
      body: payload,
      prefer: "return=representation"
    }
  );

  return data?.[0] || null;
}


async function updateVideo(id, video = {}) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  const payload = {

    title: video.title || "",

    media_url:
      video.media_url ||
      video.url ||
      "",

    media_type: "video",

    description: video.description || "",

    approved:
      video.approved === undefined
        ? true
        : Boolean(video.approved)
  };

  const data = await supabaseRequest(
    "gallery",
    {
      method: "PATCH",
      query:
        `?id=eq.${safeId}&media_type=eq.video&select=*`,
      body: payload,
      prefer: "return=representation"
    }
  );

  return data?.[0] || null;
}


async function deleteVideo(id) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  await supabaseRequest(
    "gallery",
    {
      method: "DELETE",
      query:
        `?id=eq.${safeId}&media_type=eq.video`
    }
  );

  return true;
}


/* =========================
   REVIEWS
   ========================= */

async function getReviews() {

  const data = await supabaseRequest(
    "reviews",
    {
      query:
        "?select=id,created_at,name,rating,comment,approved&approved=eq.true&order=created_at.desc"
    }
  );

  return sortNewestFirst(data);
}


async function saveReview(review = {}) {

  const rating =
    Math.max(
      1,
      Math.min(
        5,
        Number(review.rating) || 5
      )
    );

  const payload = {

    name:
      String(review.name || "").trim(),

    rating,

    comment:
      String(review.comment || "").trim(),

    /*
      New reviews are approved by default because
      the existing public app expects submitted reviews
      to appear immediately.

      This can be changed to false later if moderation
      is required.
    */
    approved:
      review.approved === undefined
        ? true
        : Boolean(review.approved)
  };

  if (!payload.name) {
    throw new Error("Name is required.");
  }

  if (!payload.comment) {
    throw new Error("Review comment is required.");
  }

  const data = await supabaseRequest(
    "reviews",
    {
      method: "POST",
      query: "?select=*",
      body: payload,
      prefer: "return=representation"
    }
  );

  return data?.[0] || null;
}


async function updateReview(id, review = {}) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  const payload = {

    name:
      String(review.name || "").trim(),

    rating:
      Math.max(
        1,
        Math.min(
          5,
          Number(review.rating) || 5
        )
      ),

    comment:
      String(review.comment || "").trim(),

    approved:
      review.approved === undefined
        ? true
        : Boolean(review.approved)
  };

  const data = await supabaseRequest(
    "reviews",
    {
      method: "PATCH",
      query:
        `?id=eq.${safeId}&select=*`,
      body: payload,
      prefer: "return=representation"
    }
  );

  return data?.[0] || null;
}


async function deleteReview(id) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  await supabaseRequest(
    "reviews",
    {
      method: "DELETE",
      query:
        `?id=eq.${safeId}`
    }
  );

  return true;
}


/* =========================
   ENQUIRIES
   ========================= */

async function saveEnquiry(enquiry = {}) {

  const payload = {

    name:
      String(enquiry.name || "").trim(),

    phone:
      String(enquiry.phone || "").trim(),

    trip:
      String(
        enquiry.trip ||
        enquiry.tripName ||
        ""
      ).trim(),

    message:
      String(enquiry.message || "").trim(),

    status:
      enquiry.status || "new"
  };

  if (!payload.name) {
    throw new Error("Name is required.");
  }

  if (!payload.phone) {
    throw new Error("Phone number is required.");
  }

  const data = await supabaseRequest(
    "enquiries",
    {
      method: "POST",
      query: "?select=*",
      body: payload,
      prefer: "return=representation"
    }
  );

  return data?.[0] || null;
}


async function getEnquiries() {

  const data = await supabaseRequest(
    "enquiries",
    {
      query:
        "?select=id,created_at,name,phone,trip,message,status&order=created_at.desc"
    }
  );

  return sortNewestFirst(data);
}


async function updateEnquiry(id, enquiry = {}) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  const payload = {

    name:
      String(enquiry.name || "").trim(),

    phone:
      String(enquiry.phone || "").trim(),

    trip:
      String(
        enquiry.trip ||
        enquiry.tripName ||
        ""
      ).trim(),

    message:
      String(enquiry.message || "").trim(),

    status:
      enquiry.status || "new"
  };

  const data = await supabaseRequest(
    "enquiries",
    {
      method: "PATCH",
      query:
        `?id=eq.${safeId}&select=*`,
      body: payload,
      prefer: "return=representation"
    }
  );

  return data?.[0] || null;
}


async function deleteEnquiry(id) {

  const safeId =
    encodeURIComponent(normaliseId(id));

  await supabaseRequest(
    "enquiries",
    {
      method: "DELETE",
      query:
        `?id=eq.${safeId}`
    }
  );

  return true;
}


/* =========================
   BACKWARD COMPATIBILITY
   ========================= */

/*
   Some existing parts of the V1 may call resolved().
   Keep it so app.js does not break.
*/

function resolved(value) {
  return Promise.resolve(value);
}


/* =========================
   START DATA LAYER
   ========================= */

initDataLayer()
  .catch(error => {
    console.error(
      "Hazi Dada Travels data layer startup error:",
      error
    );
  });
