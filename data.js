/* =========================================================
   HAZI DADA TRAVELS
   data.js
   Complete Supabase Data Layer
   ========================================================= */

const PLACEHOLDER_FALLBACK = {
  name: "Hazi Dada Travels",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  description: "Travel with Hazi Dada Travels.",
  hours: "",
  map_url: "",
  facebook: "",
  instagram: "",
  youtube: "",
  about_text: "Travel with Hazi Dada Travels.",
  footer_text: ""
};


/* =========================================================
   TRANSLATIONS
   ========================================================= */

const translations = {

  en: {
    nav_home: "Home",
    nav_trips: "Trips",
    nav_vehicles: "Vehicles",
    nav_gallery: "Gallery",
    nav_videos: "Videos",
    nav_reviews: "Reviews",
    nav_contact: "Contact",

    hero_title: "Travel with Hazi Dada Travels",
    hero_subtitle: "Comfortable travel, trusted service.",

    btn_explore_trips: "Explore Trips",
    btn_book_now: "Book Now",
    btn_contact_us: "Contact Us",
    btn_see_all: "See all →",
    btn_back: "Back",
    btn_call: "Call",
    btn_whatsapp: "WhatsApp",
    btn_email: "Email",
    btn_open_map: "Open Map",
    btn_enquire: "Enquire Now",
    btn_submit: "Submit",
    btn_view_details: "View Details",
    btn_book_vehicle: "Book Vehicle",

    section_featured: "Featured Trips",
    section_trips: "Trips & Packages",
    section_vehicles: "Vehicles",
    section_gallery: "Gallery",
    section_videos: "Videos",
    section_video_preview: "Videos",
    section_reviews: "Reviews",
    section_contact: "Contact Us",

    loading_trips: "Loading trips...",
    loading_vehicles: "Loading vehicles...",
    loading_gallery: "Loading gallery...",
    loading_videos: "Loading videos...",
    loading_reviews: "Loading reviews...",

    empty_trips: "No trips available.",
    empty_vehicles: "No vehicles available.",
    empty_gallery: "No photos available.",
    empty_videos: "No videos available.",
    empty_reviews: "No reviews available.",

    cat_all: "All",

    why_title: "Why Choose Us",

    why_1_t: "Easy Booking",
    why_1_d: "Simple booking through call or WhatsApp.",

    why_2_t: "Comfortable Vehicles",
    why_2_d: "Comfortable vehicles for your travel needs.",

    why_3_t: "Flexible Trips",
    why_3_d: "Choose trips and travel options that suit you.",

    why_4_t: "Trusted Service",
    why_4_d: "Reliable service focused on your journey.",

    cta_title: "Plan Your Journey",
    cta_sub: "Contact us for trips and vehicle bookings.",

    label_destination: "Destination",
    label_duration: "Duration",
    label_price: "Price",
    label_highlights: "Highlights",
    label_trip_gallery: "Trip Gallery",
    label_available_vehicles: "Available Vehicles",

    write_review: "Write a Review",
    form_your_name: "Your Name",
    form_rating: "Rating",
    form_review_text: "Your Review",

    contact_phone: "Phone",
    contact_email: "Email",
    contact_address: "Address",
    contact_hours: "Business Hours",
    contact_social: "Social Media",

    footer_about: "About",
    footer_quick_links: "Quick Links",
    footer_contact: "Contact",
    footer_rights: "All rights reserved.",

    enquiry_title: "Booking Enquiry",
    enquiry_name: "Your Name",
    enquiry_phone: "Phone Number",
    enquiry_trip: "Trip",
    enquiry_date: "Travel Date",
    enquiry_people: "Number of People",
    enquiry_message: "Message",

    booking_title: "Book Now",
    booking_contact: "Choose how you would like to contact us.",

    no_description: "No description available.",

    available: "Available",
    unavailable: "Unavailable",

    something_wrong: "Something went wrong. Please try again.",
    saved_successfully: "Saved successfully.",
    review_submitted:
      "Thank you. Your review has been submitted for approval.",
    enquiry_submitted:
      "Your enquiry has been submitted.",

    admin: "Admin"
  },

  te: {
    nav_home: "హోమ్",
    nav_trips: "ట్రిప్స్",
    nav_vehicles: "వాహనాలు",
    nav_gallery: "గ్యాలరీ",
    nav_videos: "వీడియోలు",
    nav_reviews: "రివ్యూలు",
    nav_contact: "కాంటాక్ట్",

    hero_title: "హాజీ దాదా ట్రావెల్స్‌తో ప్రయాణించండి",
    hero_subtitle: "సౌకర్యవంతమైన ప్రయాణం, నమ్మకమైన సేవ.",

    btn_explore_trips: "ట్రిప్స్ చూడండి",
    btn_book_now: "ఇప్పుడే బుక్ చేయండి",
    btn_contact_us: "మమ్మల్ని సంప్రదించండి",
    btn_see_all: "అన్నీ చూడండి →",
    btn_back: "వెనక్కి",
    btn_call: "కాల్",
    btn_whatsapp: "వాట్సాప్",
    btn_email: "ఈమెయిల్",
    btn_open_map: "మ్యాప్ తెరవండి",
    btn_enquire: "విచారణ పంపండి",
    btn_submit: "సమర్పించండి",
    btn_view_details: "వివరాలు చూడండి",
    btn_book_vehicle: "వాహనం బుక్ చేయండి",

    section_featured: "ప్రత్యేక ట్రిప్స్",
    section_trips: "ట్రిప్స్ & ప్యాకేజీలు",
    section_vehicles: "వాహనాలు",
    section_gallery: "గ్యాలరీ",
    section_videos: "వీడియోలు",
    section_video_preview: "వీడియోలు",
    section_reviews: "రివ్యూలు",
    section_contact: "మమ్మల్ని సంప్రదించండి",

    loading_trips: "ట్రిప్స్ లోడ్ అవుతున్నాయి...",
    loading_vehicles: "వాహనాలు లోడ్ అవుతున్నాయి...",
    loading_gallery: "గ్యాలరీ లోడ్ అవుతోంది...",
    loading_videos: "వీడియోలు లోడ్ అవుతున్నాయి...",
    loading_reviews: "రివ్యూలు లోడ్ అవుతున్నాయి...",

    empty_trips: "ప్రస్తుతం ట్రిప్స్ అందుబాటులో లేవు.",
    empty_vehicles: "ప్రస్తుతం వాహనాలు అందుబాటులో లేవు.",
    empty_gallery: "ఫోటోలు అందుబాటులో లేవు.",
    empty_videos: "వీడియోలు అందుబాటులో లేవు.",
    empty_reviews: "రివ్యూలు అందుబాటులో లేవు.",

    cat_all: "అన్నీ",

    why_title: "మమ్మల్ని ఎందుకు ఎంచుకోవాలి",

    why_1_t: "సులభమైన బుకింగ్",
    why_1_d: "కాల్ లేదా వాట్సాప్ ద్వారా సులభమైన బుకింగ్.",

    why_2_t: "సౌకర్యవంతమైన వాహనాలు",
    why_2_d: "మీ ప్రయాణ అవసరాలకు అనుగుణమైన సౌకర్యవంతమైన వాహనాలు.",

    why_3_t: "ఫ్లెక్సిబుల్ ట్రిప్స్",
    why_3_d: "మీకు సరిపోయే ట్రిప్స్ మరియు ప్రయాణ ఎంపికలను ఎంచుకోండి.",

    why_4_t: "నమ్మకమైన సేవ",
    why_4_d: "మీ ప్రయాణంపై దృష్టి పెట్టే నమ్మకమైన సేవ.",

    cta_title: "మీ ప్రయాణాన్ని ప్లాన్ చేసుకోండి",
    cta_sub: "ట్రిప్స్ మరియు వాహన బుకింగ్ కోసం మమ్మల్ని సంప్రదించండి.",

    label_destination: "గమ్యం",
    label_duration: "వ్యవధి",
    label_price: "ధర",
    label_highlights: "ముఖ్యాంశాలు",
    label_trip_gallery: "ట్రిప్ గ్యాలరీ",
    label_available_vehicles: "అందుబాటులో ఉన్న వాహనాలు",

    write_review: "రివ్యూ రాయండి",
    form_your_name: "మీ పేరు",
    form_rating: "రేటింగ్",
    form_review_text: "మీ రివ్యూ",

    contact_phone: "ఫోన్",
    contact_email: "ఈమెయిల్",
    contact_address: "చిరునామా",
    contact_hours: "పని సమయాలు",
    contact_social: "సోషల్ మీడియా",

    footer_about: "మా గురించి",
    footer_quick_links: "త్వరిత లింకులు",
    footer_contact: "కాంటాక్ట్",
    footer_rights: "అన్ని హక్కులు ప్రత్యేకించబడినవి.",

    enquiry_title: "బుకింగ్ విచారణ",
    enquiry_name: "మీ పేరు",
    enquiry_phone: "ఫోన్ నంబర్",
    enquiry_trip: "ట్రిప్",
    enquiry_date: "ప్రయాణ తేదీ",
    enquiry_people: "వ్యక్తుల సంఖ్య",
    enquiry_message: "సందేశం",

    booking_title: "ఇప్పుడే బుక్ చేయండి",
    booking_contact: "మమ్మల్ని ఎలా సంప్రదించాలో ఎంచుకోండి.",

    no_description: "వివరణ అందుబాటులో లేదు.",

    available: "అందుబాటులో ఉంది",
    unavailable: "అందుబాటులో లేదు",

    something_wrong: "ఏదో తప్పు జరిగింది. మళ్లీ ప్రయత్నించండి.",
    saved_successfully: "విజయవంతంగా సేవ్ చేయబడింది.",
    review_submitted:
      "ధన్యవాదాలు. మీ రివ్యూ ఆమోదం కోసం పంపబడింది.",
    enquiry_submitted:
      "మీ విచారణ పంపబడింది.",

    admin: "అడ్మిన్"
  },

  hi: {
    nav_home: "होम",
    nav_trips: "ट्रिप्स",
    nav_vehicles: "वाहन",
    nav_gallery: "गैलरी",
    nav_videos: "वीडियो",
    nav_reviews: "रिव्यू",
    nav_contact: "संपर्क",

    hero_title: "हाजी दादा ट्रैवल्स के साथ यात्रा करें",
    hero_subtitle: "आरामदायक यात्रा, भरोसेमंद सेवा।",

    btn_explore_trips: "ट्रिप्स देखें",
    btn_book_now: "अभी बुक करें",
    btn_contact_us: "संपर्क करें",
    btn_see_all: "सभी देखें →",
    btn_back: "वापस",
    btn_call: "कॉल",
    btn_whatsapp: "व्हाट्सऐप",
    btn_email: "ईमेल",
    btn_open_map: "मैप खोलें",
    btn_enquire: "पूछताछ करें",
    btn_submit: "सबमिट करें",
    btn_view_details: "विवरण देखें",
    btn_book_vehicle: "वाहन बुक करें",

    section_featured: "विशेष ट्रिप्स",
    section_trips: "ट्रिप्स और पैकेज",
    section_vehicles: "वाहन",
    section_gallery: "गैलरी",
    section_videos: "वीडियो",
    section_video_preview: "वीडियो",
    section_reviews: "रिव्यू",
    section_contact: "संपर्क करें",

    loading_trips: "ट्रिप्स लोड हो रही हैं...",
    loading_vehicles: "वाहन लोड हो रहे हैं...",
    loading_gallery: "गैलरी लोड हो रही है...",
    loading_videos: "वीडियो लोड हो रहे हैं...",
    loading_reviews: "रिव्यू लोड हो रहे हैं...",

    empty_trips: "कोई ट्रिप उपलब्ध नहीं है।",
    empty_vehicles: "कोई वाहन उपलब्ध नहीं है।",
    empty_gallery: "कोई फोटो उपलब्ध नहीं है।",
    empty_videos: "कोई वीडियो उपलब्ध नहीं है।",
    empty_reviews: "कोई रिव्यू उपलब्ध नहीं है।",

    cat_all: "सभी",

    why_title: "हमें क्यों चुनें",

    why_1_t: "आसान बुकिंग",
    why_1_d: "कॉल या व्हाट्सऐप के माध्यम से आसान बुकिंग।",

    why_2_t: "आरामदायक वाहन",
    why_2_d: "आपकी यात्रा की जरूरतों के लिए आरामदायक वाहन।",

    why_3_t: "लचीली ट्रिप्स",
    why_3_d: "अपनी जरूरत के अनुसार ट्रिप और यात्रा विकल्प चुनें।",

    why_4_t: "भरोसेमंद सेवा",
    why_4_d: "आपकी यात्रा पर केंद्रित भरोसेमंद सेवा।",

    cta_title: "अपनी यात्रा की योजना बनाएं",
    cta_sub: "ट्रिप और वाहन बुकिंग के लिए हमसे संपर्क करें।",

    label_destination: "गंतव्य",
    label_duration: "अवधि",
    label_price: "कीमत",
    label_highlights: "मुख्य बातें",
    label_trip_gallery: "ट्रिप गैलरी",
    label_available_vehicles: "उपलब्ध वाहन",

    write_review: "रिव्यू लिखें",
    form_your_name: "आपका नाम",
    form_rating: "रेटिंग",
    form_review_text: "आपका रिव्यू",

    contact_phone: "फोन",
    contact_email: "ईमेल",
    contact_address: "पता",
    contact_hours: "व्यवसाय के घंटे",
    contact_social: "सोशल मीडिया",

    footer_about: "हमारे बारे में",
    footer_quick_links: "त्वरित लिंक",
    footer_contact: "संपर्क",
    footer_rights: "सर्वाधिकार सुरक्षित।",

    enquiry_title: "बुकिंग पूछताछ",
    enquiry_name: "आपका नाम",
    enquiry_phone: "फोन नंबर",
    enquiry_trip: "ट्रिप",
    enquiry_date: "यात्रा की तारीख",
    enquiry_people: "लोगों की संख्या",
    enquiry_message: "संदेश",

    booking_title: "अभी बुक करें",
    booking_contact: "हमसे संपर्क करने का तरीका चुनें।",

    no_description: "विवरण उपलब्ध नहीं है।",

    available: "उपलब्ध",
    unavailable: "उपलब्ध नहीं",

    something_wrong: "कुछ गलत हो गया। कृपया फिर से प्रयास करें।",
    saved_successfully: "सफलतापूर्वक सेव किया गया।",
    review_submitted:
      "धन्यवाद। आपका रिव्यू मंजूरी के लिए भेज दिया गया है।",
    enquiry_submitted:
      "आपकी पूछताछ भेज दी गई है.",

    admin: "एडमिन"
  }
};


/* =========================================================
   SUPABASE
   ========================================================= */

function ensureSupabase() {
  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient
  ) {
    throw new Error("Supabase client is not available.");
  }

  return supabaseClient;
}


/* =========================================================
   ERROR HELPER
   ========================================================= */

function dbError(error, fallbackMessage) {
  if (!error) {
    return new Error(fallbackMessage);
  }

  const message =
    error.message ||
    error.details ||
    error.hint ||
    fallbackMessage;

  const err = new Error(message);
  err.original = error;

  return err;
}


/* =========================================================
   ADMIN CHECK
   ========================================================= */

async function dataLayerIsAdmin() {
  try {
    const db = ensureSupabase();

    const {
      data,
      error
    } = await db.auth.getSession();

    if (
      error ||
      !data ||
      !data.session ||
      !data.session.user
    ) {
      return false;
    }

    const user = data.session.user;

    if (
      typeof ADMIN_USER_ID !== "undefined" &&
      ADMIN_USER_ID
    ) {
      return user.id === ADMIN_USER_ID;
    }

    return false;

  } catch (error) {
    console.warn(
      "[data.js] Admin check failed:",
      error
    );

    return false;
  }
}


/* =========================================================
   BUSINESS SETTINGS
   ========================================================= */

let businessCache = {
  ...PLACEHOLDER_FALLBACK
};


function normalizeBusiness(row = {}) {
  return {
    name:
      row.business_name ||
      row.name ||
      PLACEHOLDER_FALLBACK.name,

    phone: row.phone || "",

    whatsapp:
      row.whatsapp ||
      row.phone ||
      "",

    email: row.email || "",
    address: row.address || "",

    description:
      row.description ||
      PLACEHOLDER_FALLBACK.description,

    hours: row.hours || "",
    map_url: row.map_url || "",
    facebook: row.facebook || "",
    instagram: row.instagram || "",
    youtube: row.youtube || "",

    about_text:
      row.about_text ||
      row.description ||
      "",

    footer_text:
      row.footer_text || ""
  };
}


function getBusiness() {
  return businessCache;
}


async function refreshBusinessCache() {
  try {
    const db = ensureSupabase();

    const {
      data,
      error
    } = await db
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      businessCache = normalizeBusiness(data);
    }

    return businessCache;

  } catch (error) {
    console.warn(
      "[data.js] Business settings refresh failed:",
      error
    );

    return businessCache;
  }
}


/* =========================================================
   TRIPS
   ========================================================= */

function mapTrip(row = {}) {
  return {
    id: row.id,
    created_at: row.created_at || null,
    name: row.name || "",
    destination: row.destination || "",
    description: row.description || "",
    price: row.price || "",
    duration: row.duration || "",
    image_url: row.image_url || "",
    image: row.image_url || "",
    vehicle: row.vehicle || ""
  };
}


function tripRowFromUI(trip = {}) {
  return {
    name: trip.name || "",
    destination: trip.destination || "",
    description: trip.description || "",
    price: trip.price || "",
    duration: trip.duration || "",

    image_url:
      trip.image_url ||
      trip.image ||
      "",

    vehicle:
      trip.vehicle || ""
  };
}


async function getTrips() {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("trips")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(
      error,
      "Failed to load trips."
    );
  }

  return (data || []).map(mapTrip);
}


async function getTrip(id) {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("trips")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "Failed to load trip."
    );
  }

  return data ? mapTrip(data) : null;
}


async function saveTrip(trip) {
  const db = ensureSupabase();
  const row = tripRowFromUI(trip);

  if (
    trip.id !== undefined &&
    trip.id !== null &&
    trip.id !== ""
  ) {
    const {
      data,
      error
    } = await db
      .from("trips")
      .update(row)
      .eq("id", trip.id)
      .select()
      .single();

    if (error) {
      throw dbError(
        error,
        "Failed to update trip."
      );
    }

    return mapTrip(data);
  }

  const {
    data,
    error
  } = await db
    .from("trips")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "Failed to create trip."
    );
  }

  return mapTrip(data);
}


async function deleteTrip(id) {
  const db = ensureSupabase();

  const { error } = await db
    .from("trips")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(
      error,
      "Failed to delete trip."
    );
  }

  return true;
}


/* =========================================================
   VEHICLES
   ========================================================= */

function mapVehicle(row = {}) {
  return {
    id: row.id,
    created_at: row.created_at || null,
    name: row.name || "",
    type: row.type || "",
    capacity: row.capacity ?? "",
    registration: row.registration || "",
    image_url: row.image_url || "",
    image: row.image_url || "",
    available: row.available !== false
  };
}


function vehicleRowFromUI(vehicle = {}) {
  let capacity = null;

  if (
    vehicle.capacity !== "" &&
    vehicle.capacity !== null &&
    vehicle.capacity !== undefined
  ) {
    const parsed = Number(vehicle.capacity);

    if (Number.isFinite(parsed)) {
      capacity = parsed;
    }
  }

  return {
    name: vehicle.name || "",
    type: vehicle.type || "",
    capacity,
    registration: vehicle.registration || "",

    image_url:
      vehicle.image_url ||
      vehicle.image ||
      "",

    available:
      vehicle.available === true ||
      vehicle.available === "true"
  };
}


async function getVehicles() {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("vehicles")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(
      error,
      "Failed to load vehicles."
    );
  }

  return (data || []).map(mapVehicle);
}


async function getVehicle(id) {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "Failed to load vehicle."
    );
  }

  return data ? mapVehicle(data) : null;
}


async function saveVehicle(vehicle) {
  const db = ensureSupabase();
  const row = vehicleRowFromUI(vehicle);

  if (
    vehicle.id !== undefined &&
    vehicle.id !== null &&
    vehicle.id !== ""
  ) {
    const {
      data,
      error
    } = await db
      .from("vehicles")
      .update(row)
      .eq("id", vehicle.id)
      .select()
      .single();

    if (error) {
      throw dbError(
        error,
        "Failed to update vehicle."
      );
    }

    return mapVehicle(data);
  }

  const {
    data,
    error
  } = await db
    .from("vehicles")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "Failed to create vehicle."
    );
  }

  return mapVehicle(data);
}


async function deleteVehicle(id) {
  const db = ensureSupabase();

  const { error } = await db
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(
      error,
      "Failed to delete vehicle."
    );
  }

  return true;
}


/* =========================================================
   GALLERY
   ========================================================= */

function mapGallery(row = {}) {
  return {
    id: row.id,
    created_at: row.created_at || null,
    title: row.title || "",
    media_url: row.media_url || "",
    image_url: row.media_url || "",
    media_type: row.media_type || "image",
    description: row.description || "",
    approved: row.approved === true
  };
}


function galleryRowFromUI(item = {}) {
  return {
    title: item.title || "",

    media_url:
      item.media_url ||
      item.image_url ||
      "",

    media_type:
      item.media_type ||
      "image",

    description:
      item.description || "",

    approved:
      item.approved === true
  };
}


async function getGallery() {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("gallery")
    .select("*")
    .eq("approved", true)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(
      error,
      "Failed to load gallery."
    );
  }

  return (data || []).map(mapGallery);
}


async function getAllGallery() {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("gallery")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(
      error,
      "Failed to load gallery."
    );
  }

  return (data || []).map(mapGallery);
}


async function saveGallery(item) {
  const db = ensureSupabase();
  const row = galleryRowFromUI(item);

  if (
    item.id !== undefined &&
    item.id !== null &&
    item.id !== ""
  ) {
    const {
      data,
      error
    } = await db
      .from("gallery")
      .update(row)
      .eq("id", item.id)
      .select()
      .single();

    if (error) {
      throw dbError(
        error,
        "Failed to update gallery item."
      );
    }

    return mapGallery(data);
  }

  const {
    data,
    error
  } = await db
    .from("gallery")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "Failed to create gallery item."
    );
  }

  return mapGallery(data);
}


async function deleteGallery(id) {
  const db = ensureSupabase();

  const { error } = await db
    .from("gallery")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(
      error,
      "Failed to delete gallery item."
    );
  }

  return true;
}


/* =========================================================
   REVIEWS
   ========================================================= */

function mapReview(row = {}) {
  return {
    id: row.id,
    created_at: row.created_at || null,
    name: row.name || "",
    rating: Number(row.rating) || 0,
    comment: row.comment || "",
    review: row.comment || "",
    approved: row.approved === true
  };
}


function reviewRowFromUI(review = {}) {
  return {
    name: review.name || "",
    rating: Number(review.rating) || 0,

    comment:
      review.comment ||
      review.review ||
      "",

    approved:
      review.approved === true
  };
}


async function getReviews() {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(
      error,
      "Failed to load reviews."
    );
  }

  return (data || []).map(mapReview);
}


async function getAllReviews() {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("reviews")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(
      error,
      "Failed to load reviews."
    );
  }

  return (data || []).map(mapReview);
}


async function saveReview(review) {
  const db = ensureSupabase();

  /* UPDATE */
  if (
    review.id !== undefined &&
    review.id !== null &&
    review.id !== ""
  ) {
    const row = reviewRowFromUI(review);

    const {
      data,
      error
    } = await db
      .from("reviews")
      .update(row)
      .eq("id", review.id)
      .select()
      .single();

    if (error) {
      throw dbError(
        error,
        "Failed to update review."
      );
    }

    return mapReview(data);
  }

  /* CREATE */
  const row = reviewRowFromUI(review);

  /*
   * Public review submissions must always begin
   * as unapproved.
   */
  row.approved = false;

  /*
   * The existing reviews table does not have an
   * identity/default for id.
   */
  row.id = Date.now();

  /*
   * Do not use .select() here.
   * Unapproved public reviews are not publicly
   * selectable under the RLS policy.
   */
  const { error } = await db
    .from("reviews")
    .insert(row);

  if (error) {
    throw dbError(
      error,
      "Failed to create review."
    );
  }

  return mapReview({
    id: row.id,
    created_at: new Date().toISOString(),
    name: row.name,
    rating: row.rating,
    comment: row.comment,
    approved: false
  });
}


async function approveReview(id) {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("reviews")
    .update({
      approved: true
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "Failed to approve review."
    );
  }

  return mapReview(data);
}


async function rejectReview(id) {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("reviews")
    .update({
      approved: false
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "Failed to reject review."
    );
  }

  return mapReview(data);
}


async function deleteReview(id) {
  const db = ensureSupabase();

  const { error } = await db
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(
      error,
      "Failed to delete review."
    );
  }

  return true;
}


/* =========================================================
   ENQUIRIES
   ========================================================= */

function enquiryRowFromUI(enquiry = {}) {
  return {
    name: enquiry.name || "",
    phone: enquiry.phone || "",
    trip: enquiry.trip || "",
    message: enquiry.message || "",
    status: enquiry.status || "new"
  };
}


function mapEnquiry(row = {}) {
  return {
    id: row.id,
    created_at: row.created_at || null,
    name: row.name || "",
    phone: row.phone || "",
    trip: row.trip || "",
    message: row.message || "",
    status: row.status || "new"
  };
}


async function getEnquiries() {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("enquiries")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(
      error,
      "Failed to load enquiries."
    );
  }

  return (data || []).map(mapEnquiry);
}


async function saveEnquiry(enquiry) {
  const db = ensureSupabase();
  const row = enquiryRowFromUI(enquiry);

  const {
    data,
    error
  } = await db
    .from("enquiries")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "Failed to submit enquiry."
    );
  }

  return mapEnquiry(data);
}


async function updateEnquiryStatus(id, status) {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("enquiries")
    .update({
      status: status || "new"
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "Failed to update enquiry."
    );
  }

  return mapEnquiry(data);
}


async function deleteEnquiry(id) {
  const db = ensureSupabase();

  const { error } = await db
    .from("enquiries")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(
      error,
      "Failed to delete enquiry."
    );
  }

  return true;
}


/* =========================================================
   VIDEOS
   ========================================================= */

function mapVideo(row = {}) {
  return {
    id: row.id,
    created_at: row.created_at || null,
    title: row.title || "",
    description: row.description || "",
    youtube_id: row.youtube_id || "",
    youtubeId: row.youtube_id || ""
  };
}


function videoRowFromUI(video = {}) {
  return {
    title: video.title || "",
    description: video.description || "",

    youtube_id:
      video.youtube_id ||
      video.youtubeId ||
      ""
  };
}


async function getVideos() {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("videos")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {
    throw dbError(
      error,
      "Failed to load videos."
    );
  }

  return (data || []).map(mapVideo);
}


async function saveVideo(video) {
  const db = ensureSupabase();
  const row = videoRowFromUI(video);

  if (
    video.id !== undefined &&
    video.id !== null &&
    video.id !== ""
  ) {
    const {
      data,
      error
    } = await db
      .from("videos")
      .update(row)
      .eq("id", video.id)
      .select()
      .single();

    if (error) {
      throw dbError(
        error,
        "Failed to update video."
      );
    }

    return mapVideo(data);
  }

  const {
    data,
    error
  } = await db
    .from("videos")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw dbError(
      error,
      "Failed to create video."
    );
  }

  return mapVideo(data);
}


async function deleteVideo(id) {
  const db = ensureSupabase();

  const { error } = await db
    .from("videos")
    .delete()
    .eq("id", id);

  if (error) {
    throw dbError(
      error,
      "Failed to delete video."
    );
  }

  return true;
}


/* =========================================================
   SETTINGS
   ========================================================= */

function settingsRowFromUI(settings = {}) {
  return {
    business_name:
      settings.business_name ??
      settings.name ??
      "",

    phone:
      settings.phone ?? "",

    whatsapp:
      settings.whatsapp ?? "",

    email:
      settings.email ?? "",

    address:
      settings.address ?? "",

    description:
      settings.description ?? "",

    hours:
      settings.hours ?? "",

    map_url:
      settings.map_url ?? "",

    facebook:
      settings.facebook ?? "",

    instagram:
      settings.instagram ?? "",

    youtube:
      settings.youtube ?? "",

    about_text:
      settings.about_text ?? "",

    footer_text:
      settings.footer_text ?? ""
  };
}


async function getSettings() {
  const db = ensureSupabase();

  const {
    data,
    error
  } = await db
    .from("settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "Failed to load settings."
    );
  }

  return data || null;
}


async function saveSettings(settings = {}) {
  const db = ensureSupabase();

  /*
   * Always fetch the existing row first when the caller
   * did not provide all fields. This prevents dashboard
   * fields that are not present in the form from being
   * erased.
   */
  let existing = null;

  if (
    settings.id === undefined ||
    settings.id === null ||
    settings.id === ""
  ) {
    const {
      data,
      error
    } = await db
      .from("settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      throw dbError(
        error,
        "Failed to check existing settings."
      );
    }

    existing = data || null;
  } else {
    const {
      data,
      error
    } = await db
      .from("settings")
      .select("*")
      .eq("id", settings.id)
      .maybeSingle();

    if (error) {
      throw dbError(
        error,
        "Failed to load existing settings."
      );
    }

    existing = data || null;
  }

  /*
   * Merge existing DB values with incoming values.
   * This is especially important for business_name
   * and description because they are not displayed
   * in dashboard.html.
   */
  const merged = {
    ...(existing || {}),
    ...settings
  };

  const row = settingsRowFromUI(merged);

  let result;

  if (existing && existing.id !== undefined) {
    const {
      data,
      error
    } = await db
      .from("settings")
      .update(row)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      throw dbError(
        error,
        "Failed to update settings."
      );
    }

    result = data;

  } else {
    const {
      data,
      error
    } = await db
      .from("settings")
      .insert(row)
      .select()
      .single();

    if (error) {
      throw dbError(
        error,
        "Failed to create settings."
      );
    }

    result = data;
  }

  businessCache =
    normalizeBusiness(result);

  return result;
}


/* =========================================================
   DATA LAYER INITIALIZATION
   ========================================================= */

async function initDataLayer() {
  try {
    ensureSupabase();

    await refreshBusinessCache();

    return true;

  } catch (error) {
    console.warn(
      "[data.js] Data layer initialization warning:",
      error
    );

    return false;
  }
}


/* =========================================================
   START DATA LAYER
   ========================================================= */

if (typeof window !== "undefined") {
  window.addEventListener(
    "DOMContentLoaded",
    function () {
      initDataLayer()
        .catch(function (error) {
          console.warn(
            "[data.js] Initialization failed:",
            error
          );
        });
    }
  );
}
