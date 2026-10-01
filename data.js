/* =========================================================
   HAZI DADA TRAVELS
   data.js
   Supabase data layer + translations + business settings
   ========================================================= */

/* =========================================================
   FALLBACKS
   ========================================================= */

const PLACEHOLDER_FALLBACK =
  "https://placehold.co/800x500?text=Hazi+Dada+Travels";

const ADMIN_USER_ID =
  "589555e8-5853-4e58-aaac-8038ec833c80";

let BUSINESS_CACHE = null;


/* =========================================================
   TRANSLATIONS
   ========================================================= */

const translations = {

  /* =========================
     ENGLISH
     ========================= */

  en: {
    home: "Home",
    trips: "Trips",
    vehicles: "Vehicles",
    gallery: "Gallery",
    videos: "Videos",
    reviews: "Reviews",
    contact: "Contact",
    about: "About",

    language: "Language",
    selectLanguage: "Select Language",
    english: "English",
    telugu: "Telugu",
    hindi: "Hindi",

    hero_title: "Travel with Hazi Dada Travels",
    hero_subtitle: "Comfortable travel, trusted service.",
    btn_explore_trips: "Explore Trips",
    btn_book_now: "Book Now",

    section_featured: "Featured Trips",
    section_vehicles: "Our Vehicles",
    section_gallery: "Gallery",
    section_video_preview: "Latest Videos",
    section_reviews: "Customer Reviews",

    section_trips: "Our Trips",
    section_all_trips: "All Trips",

    why_title: "Why Choose Us",

    why_1_t: "Easy Booking",
    why_1_d: "Simple and convenient booking through phone or WhatsApp.",

    why_2_t: "Comfortable Vehicles",
    why_2_d: "Travel comfortably in well-maintained vehicles.",

    why_3_t: "Flexible Trips",
    why_3_d: "Choose trips and travel options according to your needs.",

    why_4_t: "Trusted Service",
    why_4_d: "Reliable service focused on a smooth travel experience.",

    plan_title: "Plan Your Journey",
    plan_description: "Contact us for trips and vehicle bookings.",

    contactUs: "Contact Us",
    callNow: "Call Now",
    whatsapp: "WhatsApp",
    sendEnquiry: "Send Enquiry",

    bookNow: "Book Now",
    viewDetails: "View Details",
    bookTrip: "Book Trip",

    name: "Name",
    phone: "Phone",
    email: "Email",
    message: "Message",

    yourName: "Your Name",
    yourPhone: "Your Phone",
    yourEmail: "Your Email",
    yourMessage: "Your Message",

    destination: "Destination",
    duration: "Duration",
    price: "Price",
    vehicle: "Vehicle",

    capacity: "Capacity",
    registration: "Registration",
    available: "Available",
    unavailable: "Unavailable",

    rating: "Rating",
    comment: "Comment",

    trip: "Trip",
    selectTrip: "Select Trip",

    address: "Address",
    hours: "Hours",

    followUs: "Follow Us",

    submit: "Submit",
    send: "Send",
    cancel: "Cancel",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",

    readMore: "Read More",
    watchVideo: "Watch Video",

    loading: "Loading...",
    loading_trips: "Loading trips...",
    loading_vehicles: "Loading vehicles...",
    loading_gallery: "Loading gallery...",
    loading_videos: "Loading videos...",
    loading_reviews: "Loading reviews...",

    noTrips: "Nothing available right now.",
    noVehicles: "Nothing available right now.",
    noGallery: "Nothing available right now.",
    noVideos: "Nothing available right now.",
    noReviews: "Nothing available right now.",

    nothing_available: "Nothing available right now.",

    enquirySent: "Your enquiry has been sent successfully.",
    reviewSent: "Your review has been submitted successfully.",
    somethingWentWrong: "Something went wrong. Please try again.",

    admin: "Admin",

    footer_about:
      "Travel with Hazi Dada Travels.",

    footer_rights:
      "All rights reserved."
  },


  /* =========================
     TELUGU
     ========================= */

  te: {
    home: "హోమ్",
    trips: "ప్రయాణాలు",
    vehicles: "వాహనాలు",
    gallery: "గ్యాలరీ",
    videos: "వీడియోలు",
    reviews: "సమీక్షలు",
    contact: "సంప్రదించండి",
    about: "మా గురించి",

    language: "భాష",
    selectLanguage: "భాషను ఎంచుకోండి",
    english: "ఇంగ్లీష్",
    telugu: "తెలుగు",
    hindi: "హిందీ",

    hero_title: "హాజీ దాదా ట్రావెల్స్‌తో ప్రయాణించండి",
    hero_subtitle: "సౌకర్యవంతమైన ప్రయాణం, విశ్వసనీయ సేవ.",
    btn_explore_trips: "ప్రయాణాలను చూడండి",
    btn_book_now: "ఇప్పుడే బుక్ చేయండి",

    section_featured: "ప్రత్యేక ప్రయాణాలు",
    section_vehicles: "మా వాహనాలు",
    section_gallery: "గ్యాలరీ",
    section_video_preview: "తాజా వీడియోలు",
    section_reviews: "కస్టమర్ సమీక్షలు",

    section_trips: "మా ప్రయాణాలు",
    section_all_trips: "అన్ని ప్రయాణాలు",

    why_title: "మమ్మల్ని ఎందుకు ఎంచుకోవాలి",

    why_1_t: "సులభమైన బుకింగ్",
    why_1_d: "ఫోన్ లేదా వాట్సాప్ ద్వారా సులభంగా బుకింగ్ చేసుకోవచ్చు.",

    why_2_t: "సౌకర్యవంతమైన వాహనాలు",
    why_2_d: "చక్కగా నిర్వహించబడిన వాహనాల్లో సౌకర్యవంతంగా ప్రయాణించండి.",

    why_3_t: "సౌకర్యవంతమైన ప్రయాణాలు",
    why_3_d: "మీ అవసరాలకు అనుగుణంగా ప్రయాణాలను ఎంచుకోండి.",

    why_4_t: "విశ్వసనీయ సేవ",
    why_4_d: "సురక్షితమైన మరియు సౌకర్యవంతమైన ప్రయాణ అనుభవానికి నమ్మకమైన సేవ.",

    plan_title: "మీ ప్రయాణాన్ని ప్లాన్ చేసుకోండి",
    plan_description:
      "ప్రయాణాలు మరియు వాహన బుకింగ్ కోసం మమ్మల్ని సంప్రదించండి.",

    contactUs: "మమ్మల్ని సంప్రదించండి",
    callNow: "ఇప్పుడే కాల్ చేయండి",
    whatsapp: "వాట్సాప్",
    sendEnquiry: "విచారణ పంపండి",

    bookNow: "ఇప్పుడే బుక్ చేయండి",
    viewDetails: "వివరాలు చూడండి",
    bookTrip: "ప్రయాణాన్ని బుక్ చేయండి",

    name: "పేరు",
    phone: "ఫోన్",
    email: "ఈమెయిల్",
    message: "సందేశం",

    yourName: "మీ పేరు",
    yourPhone: "మీ ఫోన్",
    yourEmail: "మీ ఈమెయిల్",
    yourMessage: "మీ సందేశం",

    destination: "గమ్యం",
    duration: "వ్యవధి",
    price: "ధర",
    vehicle: "వాహనం",

    capacity: "సామర్థ్యం",
    registration: "రిజిస్ట్రేషన్",
    available: "అందుబాటులో ఉంది",
    unavailable: "అందుబాటులో లేదు",

    rating: "రేటింగ్",
    comment: "వ్యాఖ్య",

    trip: "ప్రయాణం",
    selectTrip: "ప్రయాణాన్ని ఎంచుకోండి",

    address: "చిరునామా",
    hours: "సమయాలు",

    followUs: "మమ్మల్ని అనుసరించండి",

    submit: "సమర్పించండి",
    send: "పంపండి",
    cancel: "రద్దు చేయండి",
    close: "మూసివేయండి",
    back: "వెనుకకు",
    next: "తదుపరి",
    previous: "మునుపటి",

    readMore: "మరింత చదవండి",
    watchVideo: "వీడియో చూడండి",

    loading: "లోడ్ అవుతోంది...",
    loading_trips: "ప్రయాణాలు లోడ్ అవుతున్నాయి...",
    loading_vehicles: "వాహనాలు లోడ్ అవుతున్నాయి...",
    loading_gallery: "గ్యాలరీ లోడ్ అవుతోంది...",
    loading_videos: "వీడియోలు లోడ్ అవుతున్నాయి...",
    loading_reviews: "సమీక్షలు లోడ్ అవుతున్నాయి...",

    noTrips: "ప్రస్తుతం ఏమీ అందుబాటులో లేదు.",
    noVehicles: "ప్రస్తుతం ఏమీ అందుబాటులో లేదు.",
    noGallery: "ప్రస్తుతం ఏమీ అందుబాటులో లేదు.",
    noVideos: "ప్రస్తుతం ఏమీ అందుబాటులో లేదు.",
    noReviews: "ప్రస్తుతం ఏమీ అందుబాటులో లేదు.",

    nothing_available: "ప్రస్తుతం ఏమీ అందుబాటులో లేదు.",

    enquirySent: "మీ విచారణ విజయవంతంగా పంపబడింది.",
    reviewSent: "మీ సమీక్ష విజయవంతంగా సమర్పించబడింది.",
    somethingWentWrong:
      "ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.",

    admin: "అడ్మిన్",

    footer_about:
      "హాజీ దాదా ట్రావెల్స్‌తో ప్రయాణించండి.",

    footer_rights:
      "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి."
  },


  /* =========================
     HINDI
     ========================= */

  hi: {
    home: "होम",
    trips: "यात्राएं",
    vehicles: "वाहन",
    gallery: "गैलरी",
    videos: "वीडियो",
    reviews: "समीक्षाएं",
    contact: "संपर्क",
    about: "हमारे बारे में",

    language: "भाषा",
    selectLanguage: "भाषा चुनें",
    english: "अंग्रेज़ी",
    telugu: "तेलुगु",
    hindi: "हिंदी",

    hero_title: "हाजी दादा ट्रैवल्स के साथ यात्रा करें",
    hero_subtitle: "आरामदायक यात्रा, भरोसेमंद सेवा।",
    btn_explore_trips: "यात्राएं देखें",
    btn_book_now: "अभी बुक करें",

    section_featured: "विशेष यात्राएं",
    section_vehicles: "हमारे वाहन",
    section_gallery: "गैलरी",
    section_video_preview: "नवीनतम वीडियो",
    section_reviews: "ग्राहक समीक्षाएं",

    section_trips: "हमारी यात्राएं",
    section_all_trips: "सभी यात्राएं",

    why_title: "हमें क्यों चुनें",

    why_1_t: "आसान बुकिंग",
    why_1_d: "फोन या व्हाट्सऐप के माध्यम से आसानी से बुकिंग करें।",

    why_2_t: "आरामदायक वाहन",
    why_2_d: "अच्छी तरह से रखरखाव किए गए वाहनों में आरामदायक यात्रा करें।",

    why_3_t: "लचीली यात्राएं",
    why_3_d: "अपनी जरूरत के अनुसार यात्रा और विकल्प चुनें।",

    why_4_t: "भरोसेमंद सेवा",
    why_4_d: "सुविधाजनक यात्रा अनुभव के लिए भरोसेमंद सेवा।",

    plan_title: "अपनी यात्रा की योजना बनाएं",
    plan_description:
      "यात्राओं और वाहन बुकिंग के लिए हमसे संपर्क करें।",

    contactUs: "हमसे संपर्क करें",
    callNow: "अभी कॉल करें",
    whatsapp: "व्हाट्सऐप",
    sendEnquiry: "पूछताछ भेजें",

    bookNow: "अभी बुक करें",
    viewDetails: "विवरण देखें",
    bookTrip: "यात्रा बुक करें",

    name: "नाम",
    phone: "फोन",
    email: "ईमेल",
    message: "संदेश",

    yourName: "आपका नाम",
    yourPhone: "आपका फोन",
    yourEmail: "आपका ईमेल",
    yourMessage: "आपका संदेश",

    destination: "गंतव्य",
    duration: "अवधि",
    price: "कीमत",
    vehicle: "वाहन",

    capacity: "क्षमता",
    registration: "रजिस्ट्रेशन",
    available: "उपलब्ध",
    unavailable: "उपलब्ध नहीं",

    rating: "रेटिंग",
    comment: "टिप्पणी",

    trip: "यात्रा",
    selectTrip: "यात्रा चुनें",

    address: "पता",
    hours: "समय",

    followUs: "हमें फॉलो करें",

    submit: "सबमिट करें",
    send: "भेजें",
    cancel: "रद्द करें",
    close: "बंद करें",
    back: "वापस",
    next: "अगला",
    previous: "पिछला",

    readMore: "और पढ़ें",
    watchVideo: "वीडियो देखें",

    loading: "लोड हो रहा है...",
    loading_trips: "यात्राएं लोड हो रही हैं...",
    loading_vehicles: "वाहन लोड हो रहे हैं...",
    loading_gallery: "गैलरी लोड हो रही है...",
    loading_videos: "वीडियो लोड हो रहे हैं...",
    loading_reviews: "समीक्षाएं लोड हो रही हैं...",

    noTrips: "अभी कुछ भी उपलब्ध नहीं है।",
    noVehicles: "अभी कुछ भी उपलब्ध नहीं है।",
    noGallery: "अभी कुछ भी उपलब्ध नहीं है।",
    noVideos: "अभी कुछ भी उपलब्ध नहीं है।",
    noReviews: "अभी कुछ भी उपलब्ध नहीं है।",

    nothing_available: "अभी कुछ भी उपलब्ध नहीं है।",

    enquirySent: "आपकी पूछताछ सफलतापूर्वक भेज दी गई है।",
    reviewSent: "आपकी समीक्षा सफलतापूर्वक जमा कर दी गई है।",
    somethingWentWrong:
      "कुछ गलत हो गया। कृपया फिर से प्रयास करें।",

    admin: "एडमिन",

    footer_about:
      "हाजी दादा ट्रैवल्स के साथ यात्रा करें।",

    footer_rights:
      "सर्वाधिकार सुरक्षित।"
  }

};


/* =========================================================
   SUPABASE HELPERS
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


function dbError(error, fallbackMessage) {
  console.error("[data.js]", error);

  if (error && error.message) {
    throw new Error(error.message);
  }

  throw new Error(
    fallbackMessage || "Database operation failed."
  );
}


async function dataLayerIsAdmin() {
  try {
    const client = ensureSupabase();

    const {
      data,
      error
    } = await client.auth.getSession();

    if (error || !data || !data.session) {
      return false;
    }

    return (
      data.session.user &&
      data.session.user.id === ADMIN_USER_ID
    );

  } catch (error) {
    return false;
  }
}


/* =========================================================
   TRIPS
   Existing table:
   id
   created_at
   name
   destination
   description
   price
   duration
   image_url
   vehicle
   ========================================================= */

function mapTrip(row) {
  if (!row) return null;

  return {
    id: row.id,

    created_at: row.created_at,

    name: row.name || "",

    destination:
      row.destination || "",

    description:
      row.description || "",

    price:
      row.price || "",

    duration:
      row.duration || "",

    image_url:
      row.image_url || "",

    image:
      row.image_url || "",

    vehicle:
      row.vehicle || "",

    /* UI compatibility */
    category: row.category || "",
    highlights: row.highlights || [],
    gallery: row.gallery || []
  };
}


function tripRowFromUI(trip) {
  return {
    name: trip.name || "",
    destination: trip.destination || "",
    description: trip.description || "",
    price: trip.price || "",
    duration: trip.duration || "",
    image_url:
      trip.image_url ||
      trip.image ||
      ""
    ,
    vehicle: trip.vehicle || ""
  };
}


async function getTrips() {
  try {
    const client = ensureSupabase();

    const {
      data,
      error
    } = await client
      .from("trips")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {
      dbError(error, "Unable to load trips.");
    }

    return (data || []).map(mapTrip);

  } catch (error) {
    console.error("[data.js] getTrips failed:", error);
    return [];
  }
}


async function getTrip(id) {
  try {
    if (id === undefined || id === null) {
      return null;
    }

    const client = ensureSupabase();

    const {
      data,
      error
    } = await client
      .from("trips")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      dbError(error, "Unable to load trip.");
    }

    return mapTrip(data);

  } catch (error) {
    console.error("[data.js] getTrip failed:", error);
    return null;
  }
}


/* Compatibility function */

async function getTripById(id) {
  return await getTrip(id);
}


async function saveTrip(trip) {
  try {
    const client = ensureSupabase();

    const row = tripRowFromUI(trip);

    if (trip && trip.id) {

      const {
        data,
        error
      } = await client
        .from("trips")
        .update(row)
        .eq("id", trip.id)
        .select()
        .single();

      if (error) {
        dbError(error, "Unable to update trip.");
      }

      return mapTrip(data);
    }

    const {
      data,
      error
    } = await client
      .from("trips")
      .insert(row)
      .select()
      .single();

    if (error) {
      dbError(error, "Unable to create trip.");
    }

    return mapTrip(data);

  } catch (error) {
    console.error("[data.js] saveTrip failed:", error);
    throw error;
  }
}


async function deleteTrip(id) {
  try {
    const client = ensureSupabase();

    const {
      error
    } = await client
      .from("trips")
      .delete()
      .eq("id", id);

    if (error) {
      dbError(error, "Unable to delete trip.");
    }

    return true;

  } catch (error) {
    console.error("[data.js] deleteTrip failed:", error);
    throw error;
  }
}


/* =========================================================
   VEHICLES
   Existing table:
   id
   created_at
   name
   type
   capacity
   registration
   image_url
   available

   IMPORTANT:
   No description column.
   ========================================================= */

function mapVehicle(row) {
  if (!row) return null;

  return {
    id: row.id,

    created_at: row.created_at,

    name:
      row.name || "",

    type:
      row.type || "",

    capacity:
      row.capacity ?? "",

    registration:
      row.registration || "",

    image_url:
      row.image_url || "",

    image:
      row.image_url || "",

    available:
      row.available !== false
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

    registration:
      vehicle.registration || "",

    image_url:
      vehicle.image_url ||
      vehicle.image ||
      "",

    available:
      vehicle.available !== false
  };
}


async function getVehicles() {
  try {
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
      dbError(error, "Unable to load vehicles.");
    }

    return (data || []).map(mapVehicle);

  } catch (error) {
    console.error("[data.js] getVehicles failed:", error);
    return [];
  }
}


async function getVehicle(id) {
  try {
    if (id === undefined || id === null) {
      return null;
    }

    const client = ensureSupabase();

    const {
      data,
      error
    } = await client
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      dbError(error, "Unable to load vehicle.");
    }

    return mapVehicle(data);

  } catch (error) {
    console.error("[data.js] getVehicle failed:", error);
    return null;
  }
}


/* Compatibility helper */

async function getVehiclesByIds(ids) {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    const client = ensureSupabase();

    const {
      data,
      error
    } = await client
      .from("vehicles")
      .select("*")
      .in("id", ids);

    if (error) {
      dbError(error, "Unable to load selected vehicles.");
    }

    return (data || []).map(mapVehicle);

  } catch (error) {
    console.error(
      "[data.js] getVehiclesByIds failed:",
      error
    );

    return [];
  }
}


async function saveVehicle(vehicle) {
  try {
    const client = ensureSupabase();

    const row = vehicleRowFromUI(vehicle);

    if (vehicle && vehicle.id) {

      const {
        data,
        error
      } = await client
        .from("vehicles")
        .update(row)
        .eq("id", vehicle.id)
        .select()
        .single();

      if (error) {
        dbError(error, "Unable to update vehicle.");
      }

      return mapVehicle(data);
    }

    const {
      data,
      error
    } = await client
      .from("vehicles")
      .insert(row)
      .select()
      .single();

    if (error) {
      dbError(error, "Unable to create vehicle.");
    }

    return mapVehicle(data);

  } catch (error) {
    console.error("[data.js] saveVehicle failed:", error);
    throw error;
  }
}


async function deleteVehicle(id) {
  try {
    const client = ensureSupabase();

    const {
      error
    } = await client
      .from("vehicles")
      .delete()
      .eq("id", id);

    if (error) {
      dbError(error, "Unable to delete vehicle.");
    }

    return true;

  } catch (error) {
    console.error("[data.js] deleteVehicle failed:", error);
    throw error;
  }
}


/* =========================================================
   GALLERY
   Existing table:
   id
   created_at
   title
   media_url
   media_type
   description
   approved
   ========================================================= */

function mapGallery(row) {
  if (!row) return null;

  return {
    id: row.id,

    created_at: row.created_at,

    title:
      row.title || "",

    media_url:
      row.media_url || "",

    image_url:
      row.media_url || "",

    media_type:
      row.media_type || "image",

    description:
      row.description || "",

    approved:
      row.approved !== false
  };
}


function galleryRowFromUI(item) {
  return {
    title: item.title || "",

    media_url:
      item.media_url ||
      item.image_url ||
      item.url ||
      "",

    media_type:
      item.media_type ||
      "image",

    description:
      item.description || "",

    approved:
      item.approved !== false
  };
}


async function getGallery() {
  try {
    const client = ensureSupabase();

    const isAdmin =
      await dataLayerIsAdmin();

    let query = client
      .from("gallery")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (!isAdmin) {
      query = query.eq("approved", true);
    }

    const {
      data,
      error
    } = await query;

    if (error) {
      dbError(error, "Unable to load gallery.");
    }

    return (data || []).map(mapGallery);

  } catch (error) {
    console.error("[data.js] getGallery failed:", error);
    return [];
  }
}


async function getGalleryItem(id) {
  try {
    const client = ensureSupabase();

    const {
      data,
      error
    } = await client
      .from("gallery")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      dbError(error, "Unable to load gallery item.");
    }

    return mapGallery(data);

  } catch (error) {
    console.error(
      "[data.js] getGalleryItem failed:",
      error
    );

    return null;
  }
}


async function saveGalleryItem(item) {
  try {
    const client = ensureSupabase();

    const row =
      galleryRowFromUI(item);

    if (item && item.id) {

      const {
        data,
        error
      } = await client
        .from("gallery")
        .update(row)
        .eq("id", item.id)
        .select()
        .single();

      if (error) {
        dbError(
          error,
          "Unable to update gallery item."
        );
      }

      return mapGallery(data);
    }

    const {
      data,
      error
    } = await client
      .from("gallery")
      .insert(row)
      .select()
      .single();

    if (error) {
      dbError(
        error,
        "Unable to create gallery item."
      );
    }

    return mapGallery(data);

  } catch (error) {
    console.error(
      "[data.js] saveGalleryItem failed:",
      error
    );

    throw error;
  }
}


async function deleteGalleryItem(id) {
  try {
    const client = ensureSupabase();

    const {
      error
    } = await client
      .from("gallery")
      .delete()
      .eq("id", id);

    if (error) {
      dbError(
        error,
        "Unable to delete gallery item."
      );
    }

    return true;

  } catch (error) {
    console.error(
      "[data.js] deleteGalleryItem failed:",
      error
    );

    throw error;
  }
}


/* =========================================================
   REVIEWS
   Existing table:
   id
   approved
   created_at
   name
   rating
   comment
   ========================================================= */

function mapReview(row) {
  if (!row) return null;

  return {
    id: row.id,

    created_at:
      row.created_at,

    name:
      row.name || "",

    rating:
      Number(row.rating || 0),

    comment:
      row.comment || "",

    review:
      row.comment || "",

    approved:
      row.approved !== false
  };
}


function reviewRowFromUI(review) {
  return {
    name:
      review.name || "",

    rating:
      Number(review.rating || 0),

    comment:
      review.comment ||
      review.review ||
      "",

    approved:
      review.approved !== false
  };
}


async function getReviews() {
  try {
    const client = ensureSupabase();

    const isAdmin =
      await dataLayerIsAdmin();

    let query = client
      .from("reviews")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (!isAdmin) {
      query = query.eq("approved", true);
    }

    const {
      data,
      error
    } = await query;

    if (error) {
      dbError(error, "Unable to load reviews.");
    }

    return (data || []).map(mapReview);

  } catch (error) {
    console.error("[data.js] getReviews failed:", error);
    return [];
  }
}


async function getReview(id) {
  try {
    const client = ensureSupabase();

    const {
      data,
      error
    } = await client
      .from("reviews")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      dbError(error, "Unable to load review.");
    }

    return mapReview(data);

  } catch (error) {
    console.error("[data.js] getReview failed:", error);
    return null;
  }
}


async function saveReview(review) {
  try {
    const client = ensureSupabase();

    const row =
      reviewRowFromUI(review);

    if (review && review.id) {

      const {
        data,
        error
      } = await client
        .from("reviews")
        .update(row)
        .eq("id", review.id)
        .select()
        .single();

      if (error) {
        dbError(
          error,
          "Unable to update review."
        );
      }

      return mapReview(data);
    }

    const {
      data,
      error
    } = await client
      .from("reviews")
      .insert(row)
      .select()
      .single();

    if (error) {
      dbError(
        error,
        "Unable to create review."
      );
    }

    return mapReview(data);

  } catch (error) {
    console.error(
      "[data.js] saveReview failed:",
      error
    );

    throw error;
  }
}


async function deleteReview(id) {
  try {
    const client = ensureSupabase();

    const {
      error
    } = await client
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) {
      dbError(
        error,
        "Unable to delete review."
      );
    }

    return true;

  } catch (error) {
    console.error(
      "[data.js] deleteReview failed:",
      error
    );

    throw error;
  }
}


/* =========================================================
   ENQUIRIES
   Existing table:
   id
   created_at
   name
   phone
   trip
   message
   status
   ========================================================= */

function mapEnquiry(row) {
  if (!row) return null;

  return {
    id: row.id,

    created_at:
      row.created_at,

    name:
      row.name || "",

    phone:
      row.phone || "",

    trip:
      row.trip || "",

    message:
      row.message || "",

    status:
      row.status || "new"
  };
}


async function getEnquiries() {
  try {
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
      dbError(
        error,
        "Unable to load enquiries."
      );
    }

    return (data || []).map(mapEnquiry);

  } catch (error) {
    console.error(
      "[data.js] getEnquiries failed:",
      error
    );

    return [];
  }
}


async function getEnquiry(id) {
  try {
    const client = ensureSupabase();

    const {
      data,
      error
    } = await client
      .from("enquiries")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      dbError(
        error,
        "Unable to load enquiry."
      );
    }

    return mapEnquiry(data);

  } catch (error) {
    console.error(
      "[data.js] getEnquiry failed:",
      error
    );

    return null;
  }
}


async function saveEnquiry(enquiry) {
  try {
    const client = ensureSupabase();

    const row = {
      name:
        enquiry.name || "",

      phone:
        enquiry.phone || "",

      trip:
        enquiry.trip || "",

      message:
        enquiry.message || "",

      status:
        enquiry.status || "new"
    };

    if (enquiry && enquiry.id) {

      const {
        data,
        error
      } = await client
        .from("enquiries")
        .update(row)
        .eq("id", enquiry.id)
        .select()
        .single();

      if (error) {
        dbError(
          error,
          "Unable to update enquiry."
        );
      }

      return mapEnquiry(data);
    }

    const {
      data,
      error
    } = await client
      .from("enquiries")
      .insert(row)
      .select()
      .single();

    if (error) {
      dbError(
        error,
        "Unable to create enquiry."
      );
    }

    return mapEnquiry(data);

  } catch (error) {
    console.error(
      "[data.js] saveEnquiry failed:",
      error
    );

    throw error;
  }
}


async function deleteEnquiry(id) {
  try {
    const client = ensureSupabase();

    const {
      error
    } = await client
      .from("enquiries")
      .delete()
      .eq("id", id);

    if (error) {
      dbError(
        error,
        "Unable to delete enquiry."
      );
    }

    return true;

  } catch (error) {
    console.error(
      "[data.js] deleteEnquiry failed:",
      error
    );

    throw error;
  }
}


/* =========================================================
   VIDEOS
   Existing table:
   id
   created_at
   title
   description
   youtube_id
   ========================================================= */

function mapVideo(row) {
  if (!row) return null;

  return {
    id: row.id,

    created_at:
      row.created_at,

    title:
      row.title || "",

    description:
      row.description || "",

    youtube_id:
      row.youtube_id || "",

    youtubeId:
      row.youtube_id || ""
  };
}


function videoRowFromUI(video) {
  return {
    title:
      video.title || "",

    description:
      video.description || "",

    youtube_id:
      video.youtube_id ||
      video.youtubeId ||
      ""
  };
}


async function getVideos() {
  try {
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
      dbError(
        error,
        "Unable to load videos."
      );
    }

    return (data || []).map(mapVideo);

  } catch (error) {
    console.error("[data.js] getVideos failed:", error);
    return [];
  }
}


async function getVideo(id) {
  try {
    const client = ensureSupabase();

    const {
      data,
      error
    } = await client
      .from("videos")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      dbError(
        error,
        "Unable to load video."
      );
    }

    return mapVideo(data);

  } catch (error) {
    console.error("[data.js] getVideo failed:", error);
    return null;
  }
}


async function saveVideo(video) {
  try {
    const client = ensureSupabase();

    const row =
      videoRowFromUI(video);

    if (video && video.id) {

      const {
        data,
        error
      } = await client
        .from("videos")
        .update(row)
        .eq("id", video.id)
        .select()
        .single();

      if (error) {
        dbError(
          error,
          "Unable to update video."
        );
      }

      return mapVideo(data);
    }

    const {
      data,
      error
    } = await client
      .from("videos")
      .insert(row)
      .select()
      .single();

    if (error) {
      dbError(
        error,
        "Unable to create video."
      );
    }

    return mapVideo(data);

  } catch (error) {
    console.error(
      "[data.js] saveVideo failed:",
      error
    );

    throw error;
  }
}


async function deleteVideo(id) {
  try {
    const client = ensureSupabase();

    const {
      error
    } = await client
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) {
      dbError(
        error,
        "Unable to delete video."
      );
    }

    return true;

  } catch (error) {
    console.error(
      "[data.js] deleteVideo failed:",
      error
    );

    throw error;
  }
}


/* =========================================================
   BUSINESS SETTINGS
   Existing table:
   id
   business_name
   phone
   whatsapp
   email
   address
   description
   hours
   map_url
   facebook
   instagram
   youtube
   about_text
   footer_text
   updated_at
   ========================================================= */

const BUSINESS_DEFAULTS = {

  id: 1,

  business_name:
    "Hazi Dada Travels",

  phone:
    "",

  whatsapp:
    "",

  email:
    "",

  address:
    "",

  description:
    "Travel with Hazi Dada Travels.",

  hours:
    "",

  map_url:
    "",

  facebook:
    "",

  instagram:
    "",

  youtube:
    "",

  about_text:
    "Travel with Hazi Dada Travels.",

  footer_text:
    "All rights reserved."
};


function normalizeSettings(row) {

  const source =
    row || {};

  return {

    id:
      source.id ?? 1,

    business_name:
      source.business_name ||
      BUSINESS_DEFAULTS.business_name,

    phone:
      source.phone ||
      BUSINESS_DEFAULTS.phone,

    whatsapp:
      source.whatsapp ||
      BUSINESS_DEFAULTS.whatsapp,

    email:
      source.email ||
      BUSINESS_DEFAULTS.email,

    address:
      source.address ||
      BUSINESS_DEFAULTS.address,

    description:
      source.description ||
      BUSINESS_DEFAULTS.description,

    hours:
      source.hours ||
      BUSINESS_DEFAULTS.hours,

    map_url:
      source.map_url ||
      BUSINESS_DEFAULTS.map_url,

    facebook:
      source.facebook ||
      BUSINESS_DEFAULTS.facebook,

    instagram:
      source.instagram ||
      BUSINESS_DEFAULTS.instagram,

    youtube:
      source.youtube ||
      BUSINESS_DEFAULTS.youtube,

    about_text:
      source.about_text ||
      BUSINESS_DEFAULTS.about_text,

    footer_text:
      source.footer_text ||
      BUSINESS_DEFAULTS.footer_text,

    updated_at:
      source.updated_at || null
  };
}


function settingsRowFromUI(settings) {

  const s =
    normalizeSettings(settings);

  return {

    id: 1,

    business_name:
      s.business_name,

    phone:
      s.phone,

    whatsapp:
      s.whatsapp,

    email:
      s.email,

    address:
      s.address,

    description:
      s.description,

    hours:
      s.hours,

    map_url:
      s.map_url,

    facebook:
      s.facebook,

    instagram:
      s.instagram,

    youtube:
      s.youtube,

    about_text:
      s.about_text,

    footer_text:
      s.footer_text
  };
}


/*
   Synchronous getter.

   This is intentional because app.js uses getBusiness()
   while rendering the homepage/footer.
*/

function getBusiness() {

  if (BUSINESS_CACHE) {
    return BUSINESS_CACHE;
  }

  BUSINESS_CACHE =
    normalizeSettings(
      BUSINESS_DEFAULTS
    );

  return BUSINESS_CACHE;
}


async function refreshBusinessCache() {

  try {

    const client =
      ensureSupabase();

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
        "[data.js] Business settings refresh failed:",
        error
      );

      return BUSINESS_CACHE;
    }

    if (data) {

      BUSINESS_CACHE =
        normalizeSettings(data);

    } else if (!BUSINESS_CACHE) {

      BUSINESS_CACHE =
        normalizeSettings(
          BUSINESS_DEFAULTS
        );
    }

    return BUSINESS_CACHE;

  } catch (error) {

    console.error(
      "[data.js] Business settings refresh failed:",
      error
    );

    if (!BUSINESS_CACHE) {

      BUSINESS_CACHE =
        normalizeSettings(
          BUSINESS_DEFAULTS
        );
    }

    return BUSINESS_CACHE;
  }
}


function getSettings() {
  return getBusiness();
}


async function saveSettings(settings) {

  try {

    const client =
      ensureSupabase();

    const row =
      settingsRowFromUI(settings);

    const {
      data,
      error
    } = await client
      .from("settings")
      .upsert(row, {
        onConflict: "id"
      })
      .select()
      .single();

    if (error) {

      dbError(
        error,
        "Unable to save settings."
      );
    }

    BUSINESS_CACHE =
      normalizeSettings(data);

    return BUSINESS_CACHE;

  } catch (error) {

    console.error(
      "[data.js] saveSettings failed:",
      error
    );

    throw error;
  }
}


/* =========================================================
   DATA LAYER INITIALIZATION
   ========================================================= */

async function initDataLayer() {

  try {

    /*
      Refresh business settings in the background.
      Homepage can render immediately using defaults.
    */

    await refreshBusinessCache();

  } catch (error) {

    console.error(
      "[data.js] Data layer initialization failed:",
      error
    );
  }
}


/* =========================================================
   START DATA LAYER
   ========================================================= */

initDataLayer();
