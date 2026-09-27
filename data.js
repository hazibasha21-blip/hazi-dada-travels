/* =========================================================
   HAZI DADA TRAVELS — DATA LAYER
   Supabase REST API
   Tables:
   trips
   vehicles
   gallery
   reviews
   enquiries
   ========================================================= */

const SUPABASE_URL = "https://wsrnlftrmjqutrrejajj.supabase.co";
const SUPABASE_KEY = "sb_publishable_LHHxBaLuQqrBh5Tv094PFQ_OSrlGDve";

const SUPABASE_HEADERS = {
  apikey: SUPABASE_KEY,
  "Content-Type": "application/json"
};

/* ---------------------------------------------------------
   BUSINESS DEFAULTS
   --------------------------------------------------------- */

const BUSINESS_DEFAULTS = {
  name: "Hazi Dada Travels",
  phone: "+91XXXXXXXXXX",
  whatsapp: "+91XXXXXXXXXX",
  email: "hazidadatravels5786@gmail.com",
  address: "",
  mapUrl: "https://www.google.com/maps",
  description: "Your trusted travel partner."
};

/* ---------------------------------------------------------
   TRANSLATIONS
   --------------------------------------------------------- */

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
    hero_text: "Discover memorable journeys with Hazi Dada Travels.",
    explore_trips: "Explore Trips",
    contact_us: "Contact Us",

    featured_trips: "Featured Trips",
    all_trips: "All Trips",
    book_now: "Book Now",
    view_details: "View Details",
    destination: "Destination",
    duration: "Duration",
    price: "Price",

    vehicles_title: "Our Vehicles",
    gallery_title: "Travel Gallery",
    videos_title: "Travel Videos",
    reviews_title: "Customer Reviews",
    contact_title: "Contact Us",

    no_trips: "No trips available yet.",
    no_vehicles: "No vehicles available yet.",
    no_gallery: "No gallery images available yet.",
    no_videos: "No videos available yet.",
    no_reviews: "No reviews available yet.",

    call: "Call",
    whatsapp: "WhatsApp",
    copy_number: "Copy Number",
    close: "Close",
    book_enquire: "Book / Enquire",

    write_review: "Write a Review",
    your_name: "Your Name",
    your_rating: "Your Rating",
    your_review: "Your Review",
    submit_review: "Submit Review",

    enquiry_sent: "Your enquiry has been submitted.",
    review_sent: "Your review has been submitted for approval.",
    copied: "Number copied.",
    error_generic: "Something went wrong. Please try again.",

    footer_quick_links: "Quick Links",
    footer_contact: "Contact",
    footer_rights: "All rights reserved."
  },

  te: {
    nav_home: "హోమ్",
    nav_trips: "ట్రిప్స్",
    nav_vehicles: "వాహనాలు",
    nav_gallery: "గ్యాలరీ",
    nav_videos: "వీడియోలు",
    nav_reviews: "సమీక్షలు",
    nav_contact: "సంప్రదించండి",

    hero_title: "ప్రయాణించండి. అనుభవాలను సృష్టించండి.",
    hero_text: "హాజీ దాదా ట్రావెల్స్‌తో మరపురాని ప్రయాణాలను ఆస్వాదించండి.",
    explore_trips: "ట్రిప్స్ చూడండి",
    contact_us: "సంప్రదించండి",

    featured_trips: "ముఖ్యమైన ట్రిప్స్",
    all_trips: "అన్ని ట్రిప్స్",
    book_now: "ఇప్పుడే బుక్ చేయండి",
    view_details: "వివరాలు చూడండి",
    destination: "గమ్యం",
    duration: "వ్యవధి",
    price: "ధర",

    vehicles_title: "మా వాహనాలు",
    gallery_title: "ట్రావెల్ గ్యాలరీ",
    videos_title: "ట్రావెల్ వీడియోలు",
    reviews_title: "కస్టమర్ సమీక్షలు",
    contact_title: "మమ్మల్ని సంప్రదించండి",

    no_trips: "ప్రస్తుతం ట్రిప్స్ అందుబాటులో లేవు.",
    no_vehicles: "ప్రస్తుతం వాహనాలు అందుబాటులో లేవు.",
    no_gallery: "ప్రస్తుతం గ్యాలరీ చిత్రాలు లేవు.",
    no_videos: "ప్రస్తుతం వీడియోలు లేవు.",
    no_reviews: "ప్రస్తుతం సమీక్షలు లేవు.",

    call: "కాల్",
    whatsapp: "వాట్సాప్",
    copy_number: "నంబర్ కాపీ",
    close: "మూసివేయండి",
    book_enquire: "బుక్ / విచారణ",

    write_review: "సమీక్ష రాయండి",
    your_name: "మీ పేరు",
    your_rating: "మీ రేటింగ్",
    your_review: "మీ సమీక్ష",
    submit_review: "సమీక్ష పంపండి",

    enquiry_sent: "మీ విచారణ పంపబడింది.",
    review_sent: "మీ సమీక్ష ఆమోదం కోసం పంపబడింది.",
    copied: "నంబర్ కాపీ చేయబడింది.",
    error_generic: "ఏదో సమస్య జరిగింది. మళ్లీ ప్రయత్నించండి.",

    footer_quick_links: "త్వరిత లింకులు",
    footer_contact: "సంప్రదించండి",
    footer_rights: "అన్ని హక్కులు ప్రత్యేకించబడ్డాయి."
  },

  hi: {
    nav_home: "होम",
    nav_trips: "ट्रिप्स",
    nav_vehicles: "वाहन",
    nav_gallery: "गैलरी",
    nav_videos: "वीडियो",
    nav_reviews: "समीक्षाएँ",
    nav_contact: "संपर्क",

    hero_title: "घूमें। यात्रा करें। यादें बनाएँ।",
    hero_text: "हाजी दादा ट्रैवल्स के साथ यादगार यात्राएँ करें।",
    explore_trips: "ट्रिप्स देखें",
    contact_us: "संपर्क करें",

    featured_trips: "फीचर्ड ट्रिप्स",
    all_trips: "सभी ट्रिप्स",
    book_now: "अभी बुक करें",
    view_details: "विवरण देखें",
    destination: "गंतव्य",
    duration: "अवधि",
    price: "कीमत",

    vehicles_title: "हमारे वाहन",
    gallery_title: "ट्रैवल गैलरी",
    videos_title: "ट्रैवल वीडियो",
    reviews_title: "ग्राहक समीक्षाएँ",
    contact_title: "हमसे संपर्क करें",

    no_trips: "अभी कोई ट्रिप उपलब्ध नहीं है।",
    no_vehicles: "अभी कोई वाहन उपलब्ध नहीं है।",
    no_gallery: "अभी कोई गैलरी चित्र उपलब्ध नहीं है।",
    no_videos: "अभी कोई वीडियो उपलब्ध नहीं है।",
    no_reviews: "अभी कोई समीक्षा उपलब्ध नहीं है।",

    call: "कॉल",
    whatsapp: "WhatsApp",
    copy_number: "नंबर कॉपी करें",
    close: "बंद करें",
    book_enquire: "बुक / पूछताछ",

    write_review: "समीक्षा लिखें",
    your_name: "आपका नाम",
    your_rating: "आपकी रेटिंग",
    your_review: "आपकी समीक्षा",
    submit_review: "समीक्षा भेजें",

    enquiry_sent: "आपकी पूछताछ भेज दी गई है।",
    review_sent: "आपकी समीक्षा अनुमोदन के लिए भेज दी गई है।",
    copied: "नंबर कॉपी हो गया।",
    error_generic: "कुछ गलत हुआ। कृपया फिर प्रयास करें।",

    footer_quick_links: "त्वरित लिंक",
    footer_contact: "संपर्क",
    footer_rights: "सर्वाधिकार सुरक्षित।"
  }
};

/* ---------------------------------------------------------
   API HELPER
   --------------------------------------------------------- */

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      ...SUPABASE_HEADERS,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let message = `Supabase error ${response.status}`;

    try {
      const body = await response.json();
      if (body && body.message) {
        message += `: ${body.message}`;
      } else if (body && body.hint) {
        message += `: ${body.hint}`;
      }
    } catch (_) {}

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (_) {
    return text;
  }
}

/* ---------------------------------------------------------
   TRIPS
   --------------------------------------------------------- */

function normalizeTrip(row) {
  return {
    ...row,
    id: row.id,
    name: row.name || "Untitled Trip",
    destination: row.destination || "",
    description: row.description || "",
    price: row.price || "",
    duration: row.duration || "",
    image_url: row.image_url || "",
    image: row.image_url || "",
    category: row.category || "All",
    vehicleIds: row.vehicleIds || [],
    highlights: row.highlights || [],
    gallery: row.gallery || []
  };
}

async function getTrips() {
  const rows = await supabaseRequest(
    "trips?select=*&order=created_at.desc"
  );

  return Array.isArray(rows) ? rows.map(normalizeTrip) : [];
}

async function getTripById(id) {
  const rows = await supabaseRequest(
    `trips?id=eq.${encodeURIComponent(id)}&select=*`
  );

  if (!Array.isArray(rows) || !rows.length) {
    return null;
  }

  return normalizeTrip(rows[0]);
}

async function saveTrip(trip) {
  const payload = {
    name: trip.name || "",
    destination: trip.destination || "",
    description: trip.description || "",
    price: trip.price || "",
    duration: trip.duration || "",
    image_url: trip.image_url || trip.image || ""
  };

  const rows = await supabaseRequest("trips", {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });

  return Array.isArray(rows) && rows.length
    ? normalizeTrip(rows[0])
    : null;
}

async function updateTrip(id, trip) {
  const payload = {
    name: trip.name || "",
    destination: trip.destination || "",
    description: trip.description || "",
    price: trip.price || "",
    duration: trip.duration || "",
    image_url: trip.image_url || trip.image || ""
  };

  const rows = await supabaseRequest(
    `trips?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    }
  );

  return Array.isArray(rows) && rows.length
    ? normalizeTrip(rows[0])
    : null;
}

async function deleteTrip(id) {
  await supabaseRequest(
    `trips?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE"
    }
  );

  return true;
}

/* ---------------------------------------------------------
   VEHICLES
   --------------------------------------------------------- */

function normalizeVehicle(row) {
  return {
    ...row,
    id: row.id,
    name: row.name || "Vehicle",
    type: row.type || "",
    capacity: row.capacity || "",
    registration: row.registration || "",
    image_url: row.image_url || "",
    available: row.available !== false
  };
}

async function getVehicles() {
  const rows = await supabaseRequest(
    "vehicles?select=*&order=created_at.desc"
  );

  return Array.isArray(rows) ? rows.map(normalizeVehicle) : [];
}

async function getVehiclesByIds(ids) {
  if (!Array.isArray(ids) || !ids.length) {
    return [];
  }

  const cleanIds = ids
    .map(Number)
    .filter(Number.isFinite);

  if (!cleanIds.length) {
    return [];
  }

  const idList = cleanIds.join(",");

  const rows = await supabaseRequest(
    `vehicles?id=in.(${idList})&select=*`
  );

  return Array.isArray(rows) ? rows.map(normalizeVehicle) : [];
}

async function saveVehicle(vehicle) {
  const payload = {
    name: vehicle.name || "",
    type: vehicle.type || "",
    capacity: vehicle.capacity
      ? Number(vehicle.capacity)
      : null,
    registration: vehicle.registration || "",
    image_url: vehicle.image_url || "",
    available: vehicle.available !== false
  };

  const rows = await supabaseRequest("vehicles", {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });

  return Array.isArray(rows) && rows.length
    ? normalizeVehicle(rows[0])
    : null;
}

async function updateVehicle(id, vehicle) {
  const payload = {
    name: vehicle.name || "",
    type: vehicle.type || "",
    capacity: vehicle.capacity
      ? Number(vehicle.capacity)
      : null,
    registration: vehicle.registration || "",
    image_url: vehicle.image_url || "",
    available: vehicle.available !== false
  };

  const rows = await supabaseRequest(
    `vehicles?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    }
  );

  return Array.isArray(rows) && rows.length
    ? normalizeVehicle(rows[0])
    : null;
}

async function deleteVehicle(id) {
  await supabaseRequest(
    `vehicles?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE"
    }
  );

  return true;
}

/* ---------------------------------------------------------
   GALLERY
   --------------------------------------------------------- */

function normalizeGallery(row) {
  return {
    ...row,
    id: row.id,
    title: row.title || "",
    media_url: row.media_url || "",
    media_type: row.media_type || "image",
    description: row.description || "",
    approved: row.approved !== false,

    /* Compatibility with old app.js */
    image_url: row.media_url || "",
    caption: row.title || row.description || ""
  };
}

async function getGallery() {
  const rows = await supabaseRequest(
    "gallery?approved=eq.true&select=*&order=created_at.desc"
  );

  return Array.isArray(rows)
    ? rows.map(normalizeGallery)
    : [];
}

async function saveGalleryItem(item) {
  const payload = {
    title: item.title || item.caption || "",
    media_url: item.media_url || item.image_url || "",
    media_type: item.media_type || "image",
    description: item.description || "",
    approved: item.approved === true
  };

  const rows = await supabaseRequest("gallery", {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });

  return Array.isArray(rows) && rows.length
    ? normalizeGallery(rows[0])
    : null;
}

async function deleteGalleryItem(id) {
  await supabaseRequest(
    `gallery?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE"
    }
  );

  return true;
}

/* ---------------------------------------------------------
   REVIEWS
   --------------------------------------------------------- */

function normalizeReview(row) {
  return {
    ...row,
    id: row.id,
    name: row.name || "Anonymous",
    rating: Number(row.rating) || 5,
    comment: row.comment || "",
    review: row.comment || "",
    approved: row.approved === true
  };
}

async function getReviews() {
  const rows = await supabaseRequest(
    "reviews?approved=eq.true&select=*&order=created_at.desc"
  );

  return Array.isArray(rows)
    ? rows.map(normalizeReview)
    : [];
}

async function saveReview(review) {
  const payload = {
    name: review.name || "",
    rating: Number(review.rating) || 5,
    comment: review.comment || review.review || "",
    approved: false
  };

  const rows = await supabaseRequest("reviews", {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });

  return Array.isArray(rows) && rows.length
    ? normalizeReview(rows[0])
    : null;
}

async function updateReview(id, review) {
  const payload = {
    name: review.name || "",
    rating: Number(review.rating) || 5,
    comment: review.comment || review.review || "",
    approved: review.approved === true
  };

  const rows = await supabaseRequest(
    `reviews?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    }
  );

  return Array.isArray(rows) && rows.length
    ? normalizeReview(rows[0])
    : null;
}

async function deleteReview(id) {
  await supabaseRequest(
    `reviews?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE"
    }
  );

  return true;
}

/* ---------------------------------------------------------
   ENQUIRIES
   --------------------------------------------------------- */

async function saveEnquiry(enquiry) {
  const payload = {
    name: enquiry.name || "",
    phone: enquiry.phone || "",
    trip: enquiry.trip || "",
    message: enquiry.message || "",
    status: enquiry.status || "new"
  };

  const rows = await supabaseRequest("enquiries", {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });

  return Array.isArray(rows) && rows.length
    ? rows[0]
    : null;
}

async function getEnquiries() {
  const rows = await supabaseRequest(
    "enquiries?select=*&order=created_at.desc"
  );

  return Array.isArray(rows) ? rows : [];
}

/* ---------------------------------------------------------
   VIDEOS
   ---------------------------------------------------------
   No videos table has been confirmed in the current database.
   We therefore do not query a non-existent table.
   --------------------------------------------------------- */

async function getVideos() {
  return [];
}

async function saveVideo() {
  throw new Error("Videos backend table has not been configured.");
}

async function updateVideo() {
  throw new Error("Videos backend table has not been configured.");
}

async function deleteVideo() {
  throw new Error("Videos backend table has not been configured.");
}

/* ---------------------------------------------------------
   BUSINESS
   --------------------------------------------------------- */

function getBusiness() {
  return BUSINESS_DEFAULTS;
}

/* ---------------------------------------------------------
   INITIALIZATION
   --------------------------------------------------------- */

async function initDataLayer() {
  return true;
}
