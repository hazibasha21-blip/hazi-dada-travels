/* =========================================================
   HAZI DADA TRAVELS — DATA LAYER
   Supabase + translations + CRUD
   Compatible with current app.js
   ========================================================= */


/* ---------------------------------------------------------
   FALLBACK IMAGE
   --------------------------------------------------------- */

const PLACEHOLDER_FALLBACK =
  "https://placehold.co/800x500?text=Hazi+Dada+Travels";


/* ---------------------------------------------------------
   TRANSLATIONS
   --------------------------------------------------------- */

const translations = {

  /* =======================================================
     ENGLISH
     ======================================================= */

  en: {

    /* Navigation */
    home: "Home",
    trips: "Trips",
    vehicles: "Vehicles",
    gallery: "Gallery",
    videos: "Videos",
    reviews: "Reviews",
    contact: "Contact",

    nav_home: "Home",
    nav_trips: "Trips",
    nav_vehicles: "Vehicles",
    nav_gallery: "Gallery",
    nav_videos: "Videos",
    nav_reviews: "Reviews",
    nav_contact: "Contact",

    /* Language */
    language: "Language",
    selectLanguage: "Select Language",
    english: "English",
    telugu: "Telugu",
    hindi: "Hindi",

    /* Hero */
    hero_title: "Travel with Hazi Dada Travels",
    hero_subtitle: "Comfortable travel, trusted service.",
    btn_explore_trips: "Explore Trips",
    btn_book_now: "Book Now",

    /* Sections */
    section_featured: "Featured Trips",
    section_trips: "Trips",
    section_vehicles: "Vehicles",
    section_gallery: "Gallery",
    section_video_preview: "Videos",
    section_videos: "Videos",
    section_reviews: "Reviews",
    section_contact: "Contact",

    btn_see_all: "See all",

    /* Loading */
    loading: "Loading...",
    loading_trips: "Loading trips...",
    loading_vehicles: "Loading vehicles...",
    loading_gallery: "Loading gallery...",
    loading_videos: "Loading videos...",
    loading_reviews: "Loading reviews...",

    /* Empty */
    empty_trips: "No trips available.",
    empty_vehicles: "No vehicles available.",
    empty_gallery: "No photos available.",
    empty_videos: "No videos available.",
    empty_reviews: "No reviews available.",

    /* Errors */
    err_load: "Unable to load this section.",
    btn_retry: "Retry",
    err_required: "Please fill in the required fields.",
    error_generic: "Something went wrong.",
    error_trip_not_found: "Trip not found.",

    /* Why choose us */
    why_title: "Why Choose Us",

    why_1_t: "Easy Booking",
    why_1_d: "Simple booking through call or WhatsApp.",

    why_2_t: "Comfortable Vehicles",
    why_2_d: "Comfortable vehicles for your travel needs.",

    why_3_t: "Flexible Trips",
    why_3_d: "Choose trips and travel options that suit you.",

    why_4_t: "Trusted Service",
    why_4_d: "Reliable service focused on your journey.",

    /* CTA */
    cta_title: "Plan Your Journey",
    cta_sub: "Contact us for trips and vehicle bookings.",

    /* Buttons */
    btn_view_details: "View Details",
    btn_book_vehicle: "Book Vehicle",
    btn_call: "Call",
    btn_whatsapp: "WhatsApp",
    btn_email: "Email",
    btn_open_map: "Open Map",
    btn_contact_us: "Contact Us",
    btn_enquire: "Enquire Now",
    btn_submit: "Submit",
    btn_send: "Send",
    btn_close: "Close",
    btn_cancel: "Cancel",
    btn_back: "Back",

    /* Labels */
    label_destination: "Destination",
    label_duration: "Duration",
    label_price: "Price",
    label_highlights: "Highlights",
    label_trip_gallery: "Trip Gallery",
    label_available_vehicles: "Available Vehicles",
    label_available: "Available",
    label_unavailable: "Unavailable",

    /* Compatibility aliases */
    destination: "Destination",
    duration: "Duration",
    price: "Price",
    vehicle: "Vehicle",
    capacity: "Capacity",
    registration: "Registration",
    available: "Available",
    unavailable: "Unavailable",

    /* Categories */
    cat_all: "All",

    /* Reviews */
    write_review: "Write a Review",
    form_your_name: "Your Name",
    form_rating: "Rating",
    form_review_text: "Your Review",
    sample_badge: "Sample",

    /* Contact */
    contactUs: "Contact Us",
    contact_phone: "Phone",
    contact_email: "Email",
    contact_address: "Address",
    contact_hours: "Hours",
    contact_social: "Social",

    /* Footer */
    footer_about: "Travel with Hazi Dada Travels.",
    footer_quick_links: "Quick Links",
    footer_contact: "Contact",
    footer_rights: "All rights reserved.",

    /* Forms */
    name: "Name",
    phone: "Phone",
    email: "Email",
    message: "Message",
    trip: "Trip",
    selectTrip: "Select Trip",
    rating: "Rating",
    comment: "Comment",
    yourName: "Your Name",
    yourPhone: "Your Phone",
    yourEmail: "Your Email",
    yourMessage: "Your Message",
    send: "Send",
    submit: "Submit",
    cancel: "Cancel",
    close: "Close",

    /* Media */
    readMore: "Read More",
    next: "Next",
    previous: "Previous",
    watchVideo: "Watch Video",

    /* Booking */
    bookTrip: "Book Trip",

    /* Messages */
    enquirySent: "Enquiry sent successfully.",
    reviewSent: "Review submitted successfully.",
    toast_enquiry_sent: "Enquiry sent successfully.",
    toast_review_submitted: "Review submitted successfully.",
    somethingWentWrong: "Something went wrong.",
    no_video_link: "Video link is not available."
  },


  /* =======================================================
     TELUGU
     ======================================================= */

  te: {

    /* Navigation */
    home: "హోమ్",
    trips: "ట్రిప్స్",
    vehicles: "వాహనాలు",
    gallery: "గ్యాలరీ",
    videos: "వీడియోలు",
    reviews: "రివ్యూలు",
    contact: "సంప్రదించండి",

    nav_home: "హోమ్",
    nav_trips: "ట్రిప్స్",
    nav_vehicles: "వాహనాలు",
    nav_gallery: "గ్యాలరీ",
    nav_videos: "వీడియోలు",
    nav_reviews: "రివ్యూలు",
    nav_contact: "సంప్రదించండి",

    /* Language */
    language: "భాష",
    selectLanguage: "భాషను ఎంచుకోండి",
    english: "ఇంగ్లీష్",
    telugu: "తెలుగు",
    hindi: "హిందీ",

    /* Hero */
    hero_title: "హాజీ దాదా ట్రావెల్స్‌తో ప్రయాణించండి",
    hero_subtitle: "సౌకర్యవంతమైన ప్రయాణం, నమ్మకమైన సేవ.",
    btn_explore_trips: "ట్రిప్స్ చూడండి",
    btn_book_now: "ఇప్పుడే బుక్ చేయండి",

    /* Sections */
    section_featured: "ప్రత్యేక ట్రిప్స్",
    section_trips: "ట్రిప్స్",
    section_vehicles: "వాహనాలు",
    section_gallery: "గ్యాలరీ",
    section_video_preview: "వీడియోలు",
    section_videos: "వీడియోలు",
    section_reviews: "రివ్యూలు",
    section_contact: "సంప్రదించండి",

    btn_see_all: "అన్నీ చూడండి",

    /* Loading */
    loading: "లోడ్ అవుతోంది...",
    loading_trips: "ట్రిప్స్ లోడ్ అవుతున్నాయి...",
    loading_vehicles: "వాహనాలు లోడ్ అవుతున్నాయి...",
    loading_gallery: "గ్యాలరీ లోడ్ అవుతోంది...",
    loading_videos: "వీడియోలు లోడ్ అవుతున్నాయి...",
    loading_reviews: "రివ్యూలు లోడ్ అవుతున్నాయి...",

    /* Empty */
    empty_trips: "ప్రస్తుతం ట్రిప్స్ అందుబాటులో లేవు.",
    empty_vehicles: "ప్రస్తుతం వాహనాలు అందుబాటులో లేవు.",
    empty_gallery: "ప్రస్తుతం ఫోటోలు అందుబాటులో లేవు.",
    empty_videos: "ప్రస్తుతం వీడియోలు అందుబాటులో లేవు.",
    empty_reviews: "ప్రస్తుతం రివ్యూలు అందుబాటులో లేవు.",

    /* Errors */
    err_load: "ఈ విభాగాన్ని లోడ్ చేయలేకపోయాము.",
    btn_retry: "మళ్లీ ప్రయత్నించండి",
    err_required: "అవసరమైన వివరాలను నమోదు చేయండి.",
    error_generic: "ఏదో సమస్య ఏర్పడింది.",
    error_trip_not_found: "ట్రిప్ కనుగొనబడలేదు.",

    /* Why */
    why_title: "మమ్మల్ని ఎందుకు ఎంచుకోవాలి?",

    why_1_t: "సులభమైన బుకింగ్",
    why_1_d: "కాల్ లేదా వాట్సాప్ ద్వారా సులభంగా బుక్ చేసుకోండి.",

    why_2_t: "సౌకర్యవంతమైన వాహనాలు",
    why_2_d: "మీ ప్రయాణ అవసరాలకు అనువైన సౌకర్యవంతమైన వాహనాలు.",

    why_3_t: "అనువైన ట్రిప్స్",
    why_3_d: "మీకు అనుకూలమైన ట్రిప్ మరియు ప్రయాణ ఎంపికలను ఎంచుకోండి.",

    why_4_t: "నమ్మకమైన సేవ",
    why_4_d: "మీ ప్రయాణంపై దృష్టి పెట్టే నమ్మకమైన సేవ.",

    /* CTA */
    cta_title: "మీ ప్రయాణాన్ని ప్లాన్ చేసుకోండి",
    cta_sub: "ట్రిప్స్ మరియు వాహనాల బుకింగ్ కోసం మమ్మల్ని సంప్రదించండి.",

    /* Buttons */
    btn_view_details: "వివరాలు చూడండి",
    btn_book_vehicle: "వాహనం బుక్ చేయండి",
    btn_call: "కాల్ చేయండి",
    btn_whatsapp: "వాట్సాప్",
    btn_email: "ఈమెయిల్",
    btn_open_map: "మ్యాప్ తెరవండి",
    btn_contact_us: "మమ్మల్ని సంప్రదించండి",
    btn_enquire: "విచారించండి",
    btn_submit: "సమర్పించండి",
    btn_send: "పంపండి",
    btn_close: "మూసివేయండి",
    btn_cancel: "రద్దు చేయండి",
    btn_back: "వెనుకకు",

    /* Labels */
    label_destination: "గమ్యం",
    label_duration: "వ్యవధి",
    label_price: "ధర",
    label_highlights: "ప్రత్యేకతలు",
    label_trip_gallery: "ట్రిప్ గ్యాలరీ",
    label_available_vehicles: "అందుబాటులో ఉన్న వాహనాలు",
    label_available: "అందుబాటులో ఉంది",
    label_unavailable: "అందుబాటులో లేదు",

    destination: "గమ్యం",
    duration: "వ్యవధి",
    price: "ధర",
    vehicle: "వాహనం",
    capacity: "సామర్థ్యం",
    registration: "రిజిస్ట్రేషన్",
    available: "అందుబాటులో ఉంది",
    unavailable: "అందుబాటులో లేదు",

    /* Categories */
    cat_all: "అన్నీ",

    /* Reviews */
    write_review: "రివ్యూ రాయండి",
    form_your_name: "మీ పేరు",
    form_rating: "రేటింగ్",
    form_review_text: "మీ రివ్యూ",
    sample_badge: "నమూనా",

    /* Contact */
    contactUs: "సంప్రదించండి",
    contact_phone: "ఫోన్",
    contact_email: "ఈమెయిల్",
    contact_address: "చిరునామా",
    contact_hours: "సమయాలు",
    contact_social: "సోషల్",

    /* Footer */
    footer_about: "హాజీ దాదా ట్రావెల్స్‌తో ప్రయాణించండి.",
    footer_quick_links: "త్వరిత లింకులు",
    footer_contact: "సంప్రదింపు",
    footer_rights: "అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.",

    /* Forms */
    name: "పేరు",
    phone: "ఫోన్",
    email: "ఈమెయిల్",
    message: "సందేశం",
    trip: "ట్రిప్",
    selectTrip: "ట్రిప్ ఎంచుకోండి",
    rating: "రేటింగ్",
    comment: "వ్యాఖ్య",
    yourName: "మీ పేరు",
    yourPhone: "మీ ఫోన్",
    yourEmail: "మీ ఈమెయిల్",
    yourMessage: "మీ సందేశం",
    send: "పంపండి",
    submit: "సమర్పించండి",
    cancel: "రద్దు చేయండి",
    close: "మూసివేయండి",

    /* Media */
    readMore: "మరింత చదవండి",
    next: "తదుపరి",
    previous: "మునుపటి",
    watchVideo: "వీడియో చూడండి",

    /* Booking */
    bookTrip: "ట్రిప్ బుక్ చేయండి",

    /* Messages */
    enquirySent: "విచారణ విజయవంతంగా పంపబడింది.",
    reviewSent: "రివ్యూ విజయవంతంగా పంపబడింది.",
    toast_enquiry_sent: "విచారణ విజయవంతంగా పంపబడింది.",
    toast_review_submitted: "రివ్యూ విజయవంతంగా పంపబడింది.",
    somethingWentWrong: "ఏదో సమస్య ఏర్పడింది.",
    no_video_link: "వీడియో లింక్ అందుబాటులో లేదు."
  },


  /* =======================================================
     HINDI
     ======================================================= */

  hi: {

    /* Navigation */
    home: "होम",
    trips: "ट्रिप्स",
    vehicles: "वाहन",
    gallery: "गैलरी",
    videos: "वीडियो",
    reviews: "रिव्यू",
    contact: "संपर्क",

    nav_home: "होम",
    nav_trips: "ट्रिप्स",
    nav_vehicles: "वाहन",
    nav_gallery: "गैलरी",
    nav_videos: "वीडियो",
    nav_reviews: "रिव्यू",
    nav_contact: "संपर्क",

    /* Language */
    language: "भाषा",
    selectLanguage: "भाषा चुनें",
    english: "अंग्रेज़ी",
    telugu: "तेलुगु",
    hindi: "हिंदी",

    /* Hero */
    hero_title: "हाजी दादा ट्रैवल्स के साथ यात्रा करें",
    hero_subtitle: "आरामदायक यात्रा, भरोसेमंद सेवा।",
    btn_explore_trips: "ट्रिप्स देखें",
    btn_book_now: "अभी बुक करें",

    /* Sections */
    section_featured: "विशेष ट्रिप्स",
    section_trips: "ट्रिप्स",
    section_vehicles: "वाहन",
    section_gallery: "गैलरी",
    section_video_preview: "वीडियो",
    section_videos: "वीडियो",
    section_reviews: "रिव्यू",
    section_contact: "संपर्क",

    btn_see_all: "सभी देखें",

    /* Loading */
    loading: "लोड हो रहा है...",
    loading_trips: "ट्रिप्स लोड हो रही हैं...",
    loading_vehicles: "वाहन लोड हो रहे हैं...",
    loading_gallery: "गैलरी लोड हो रही है...",
    loading_videos: "वीडियो लोड हो रहे हैं...",
    loading_reviews: "रिव्यू लोड हो रहे हैं...",

    /* Empty */
    empty_trips: "अभी कोई ट्रिप उपलब्ध नहीं है.",
    empty_vehicles: "अभी कोई वाहन उपलब्ध नहीं है.",
    empty_gallery: "अभी कोई फोटो उपलब्ध नहीं है.",
    empty_videos: "अभी कोई वीडियो उपलब्ध नहीं है.",
    empty_reviews: "अभी कोई रिव्यू उपलब्ध नहीं है.",

    /* Errors */
    err_load: "इस सेक्शन को लोड नहीं किया जा सका.",
    btn_retry: "फिर से प्रयास करें",
    err_required: "कृपया आवश्यक जानकारी भरें.",
    error_generic: "कुछ गलत हो गया.",
    error_trip_not_found: "ट्रिप नहीं मिली.",

    /* Why */
    why_title: "हमें क्यों चुनें?",

    why_1_t: "आसान बुकिंग",
    why_1_d: "कॉल या व्हाट्सऐप के माध्यम से आसानी से बुक करें.",

    why_2_t: "आरामदायक वाहन",
    why_2_d: "आपकी यात्रा के लिए आरामदायक वाहन.",

    why_3_t: "लचीली ट्रिप्स",
    why_3_d: "अपनी सुविधा के अनुसार ट्रिप और यात्रा विकल्प चुनें.",

    why_4_t: "भरोसेमंद सेवा",
    why_4_d: "आपकी यात्रा पर केंद्रित भरोसेमंद सेवा.",

    /* CTA */
    cta_title: "अपनी यात्रा की योजना बनाएं",
    cta_sub: "ट्रिप और वाहन बुकिंग के लिए हमसे संपर्क करें.",

    /* Buttons */
    btn_view_details: "विवरण देखें",
    btn_book_vehicle: "वाहन बुक करें",
    btn_call: "कॉल करें",
    btn_whatsapp: "व्हाट्सऐप",
    btn_email: "ईमेल",
    btn_open_map: "मैप खोलें",
    btn_contact_us: "संपर्क करें",
    btn_enquire: "पूछताछ करें",
    btn_submit: "सबमिट करें",
    btn_send: "भेजें",
    btn_close: "बंद करें",
    btn_cancel: "रद्द करें",
    btn_back: "वापस",

    /* Labels */
    label_destination: "गंतव्य",
    label_duration: "अवधि",
    label_price: "कीमत",
    label_highlights: "मुख्य बातें",
    label_trip_gallery: "ट्रिप गैलरी",
    label_available_vehicles: "उपलब्ध वाहन",
    label_available: "उपलब्ध",
    label_unavailable: "उपलब्ध नहीं",

    destination: "गंतव्य",
    duration: "अवधि",
    price: "कीमत",
    vehicle: "वाहन",
    capacity: "क्षमता",
    registration: "रजिस्ट्रेशन",
    available: "उपलब्ध",
    unavailable: "उपलब्ध नहीं",

    /* Categories */
    cat_all: "सभी",

    /* Reviews */
    write_review: "रिव्यू लिखें",
    form_your_name: "आपका नाम",
    form_rating: "रेटिंग",
    form_review_text: "आपका रिव्यू",
    sample_badge: "नमूना",

    /* Contact */
    contactUs: "संपर्क करें",
    contact_phone: "फोन",
    contact_email: "ईमेल",
    contact_address: "पता",
    contact_hours: "समय",
    contact_social: "सोशल",

    /* Footer */
    footer_about: "हाजी दादा ट्रैवल्स के साथ यात्रा करें.",
    footer_quick_links: "त्वरित लिंक",
    footer_contact: "संपर्क",
    footer_rights: "सर्वाधिकार सुरक्षित.",

    /* Forms */
    name: "नाम",
    phone: "फोन",
    email: "ईमेल",
    message: "संदेश",
    trip: "ट्रिप",
    selectTrip: "ट्रिप चुनें",
    rating: "रेटिंग",
    comment: "टिप्पणी",
    yourName: "आपका नाम",
    yourPhone: "आपका फोन",
    yourEmail: "आपका ईमेल",
    yourMessage: "आपका संदेश",
    send: "भेजें",
    submit: "सबमिट करें",
    cancel: "रद्द करें",
    close: "बंद करें",

    /* Media */
    readMore: "और पढ़ें",
    next: "अगला",
    previous: "पिछला",
    watchVideo: "वीडियो देखें",

    /* Booking */
    bookTrip: "ट्रिप बुक करें",

    /* Messages */
    enquirySent: "पूछताछ सफलतापूर्वक भेजी गई.",
    reviewSent: "रिव्यू सफलतापूर्वक भेजा गया.",
    toast_enquiry_sent: "पूछताछ सफलतापूर्वक भेजी गई.",
    toast_review_submitted: "रिव्यू सफलतापूर्वक भेजा गया.",
    somethingWentWrong: "कुछ गलत हो गया.",
    no_video_link: "वीडियो लिंक उपलब्ध नहीं है."
  }
};


/* ---------------------------------------------------------
   BUSINESS CACHE
   --------------------------------------------------------- */

let BUSINESS_CACHE = null;


/* ---------------------------------------------------------
   DEFAULT BUSINESS DETAILS
   --------------------------------------------------------- */

const BUSINESS_DEFAULTS = {
  id: 1,
  name: "Hazi Dada Travels",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  description: "Comfortable travel, trusted service.",
  hours: "",
  mapUrl: "",
  facebook: "",
  instagram: "",
  youtube: "",
  aboutText: "",
  footerText: "Travel with Hazi Dada Travels."
};


/* ---------------------------------------------------------
   SUPABASE HELPERS
   --------------------------------------------------------- */

function ensureSupabase() {
  if (
    typeof supabaseClient === "undefined" ||
    !supabaseClient
  ) {
    throw new Error(
      "Supabase client is not available."
    );
  }

  return supabaseClient;
}


function dbError(error, context = "Database error") {
  console.error(
    "[data.js]",
    context,
    error
  );

  const message =
    error &&
    (
      error.message ||
      error.details ||
      error.hint
    );

  return new Error(
    message ||
    context
  );
}


/* ---------------------------------------------------------
   ADMIN CHECK
   --------------------------------------------------------- */

function dataLayerIsAdmin() {
  try {

    if (
      typeof ADMIN_USER_ID !== "undefined"
    ) {
      return true;
    }

    return false;

  } catch (e) {
    return false;
  }
}


/* =========================================================
   TRIPS
   ========================================================= */

function mapTrip(row) {
  if (!row) return null;

  return {
    id: row.id,
    created_at: row.created_at,

    name: row.name || "",
    destination: row.destination || "",
    description: row.description || "",
    price: row.price || "",
    duration: row.duration || "",
    image_url: row.image_url || "",
    image: row.image_url || "",
    vehicle: row.vehicle || "",

    /*
      These fields are supported by the public app
      if they exist in future schema versions.
      Current database does not require them.
    */
    category: row.category || "",
    highlights: Array.isArray(row.highlights)
      ? row.highlights
      : [],
    gallery: Array.isArray(row.gallery)
      ? row.gallery
      : []
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
    vehicle: trip.vehicle || ""
  };
}


async function getTrips() {
  const db = ensureSupabase();

  const { data, error } =
    await db
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

  return Array.isArray(data)
    ? data.map(mapTrip)
    : [];
}


async function getTrip(id) {
  const db = ensureSupabase();

  const { data, error } =
    await db
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

  return mapTrip(data);
}


async function saveTrip(trip) {
  const db = ensureSupabase();

  const row =
    tripRowFromUI(trip);

  if (trip.id) {

    const { data, error } =
      await db
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

  const { data, error } =
    await db
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

  const { error } =
    await db
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

function mapVehicle(row) {
  if (!row) return null;

  return {
    id: row.id,
    created_at: row.created_at,

    name: row.name || "",
    type: row.type || "",
    capacity: row.capacity || "",
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


function vehicleRowFromUI(vehicle = {}) {
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
  const db = ensureSupabase();

  const { data, error } =
    await db
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

  return Array.isArray(data)
    ? data.map(mapVehicle)
    : [];
}


async function getVehicle(id) {
  const db = ensureSupabase();

  const { data, error } =
    await db
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

  return mapVehicle(data);
}


async function saveVehicle(vehicle) {
  const db = ensureSupabase();

  const row =
    vehicleRowFromUI(vehicle);

  if (vehicle.id) {

    const { data, error } =
      await db
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

  const { data, error } =
    await db
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

  const { error } =
    await db
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

function mapGallery(row) {
  if (!row) return null;

  return {
    id: row.id,
    created_at: row.created_at,

    title: row.title || "",

    media_url:
      row.media_url || "",

    image_url:
      row.media_url || "",

    media_type:
      row.media_type || "image",

    description:
      row.description || "",

    caption:
      row.title || "",

    approved:
      row.approved === true
  };
}


function galleryRowFromUI(item = {}) {
  return {
    title:
      item.title ||
      item.caption ||
      "",

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

  let query =
    db
      .from("gallery")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  /*
    Public users should only see approved gallery items.
    Admin panel can see all items.
  */

  if (!dataLayerIsAdmin()) {
    query = query.eq(
      "approved",
      true
    );
  }

  const { data, error } =
    await query;

  if (error) {
    throw dbError(
      error,
      "Failed to load gallery."
    );
  }

  return Array.isArray(data)
    ? data.map(mapGallery)
    : [];
}


async function getGalleryItem(id) {
  const db = ensureSupabase();

  const { data, error } =
    await db
      .from("gallery")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "Failed to load gallery item."
    );
  }

  return mapGallery(data);
}


async function saveGalleryItem(item) {
  const db = ensureSupabase();

  const row =
    galleryRowFromUI(item);

  if (item.id) {

    const { data, error } =
      await db
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

  const { data, error } =
    await db
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


async function deleteGalleryItem(id) {
  const db = ensureSupabase();

  const { error } =
    await db
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

function mapReview(row) {
  if (!row) return null;

  return {
    id: row.id,
    created_at: row.created_at,

    name: row.name || "",

    rating:
      Number(row.rating) || 0,

    review:
      row.comment ||
      row.review ||
      "",

    comment:
      row.comment ||
      row.review ||
      "",

    image_url:
      row.image_url || "",

    approved:
      row.approved === true
  };
}


function reviewRowFromUI(review = {}) {
  return {
    name:
      review.name || "",

    rating:
      Number(review.rating) || 0,

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

  let query =
    db
      .from("reviews")
      .select("*")
      .order("created_at", {
        ascending: false
      });

  if (!dataLayerIsAdmin()) {
    query = query.eq(
      "approved",
      true
    );
  }

  const { data, error } =
    await query;

  if (error) {
    throw dbError(
      error,
      "Failed to load reviews."
    );
  }

  return Array.isArray(data)
    ? data.map(mapReview)
    : [];
}


async function getReview(id) {
  const db = ensureSupabase();

  const { data, error } =
    await db
      .from("reviews")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "Failed to load review."
    );
  }

  return mapReview(data);
}


async function saveReview(review) {
  const db = ensureSupabase();

  const row =
    reviewRowFromUI(review);

  if (review.id) {

    const { data, error } =
      await db
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

  const { data, error } =
    await db
      .from("reviews")
      .insert(row)
      .select()
      .single();

  if (error) {
    throw dbError(
      error,
      "Failed to create review."
    );
  }

  return mapReview(data);
}


async function deleteReview(id) {
  const db = ensureSupabase();

  const { error } =
    await db
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

function mapEnquiry(row) {
  if (!row) return null;

  return {
    id: row.id,
    created_at: row.created_at,

    name: row.name || "",
    phone: row.phone || "",
    trip: row.trip || "",
    message: row.message || "",
    status: row.status || "new"
  };
}


function enquiryRowFromUI(enquiry = {}) {
  /*
    IMPORTANT:
    The verified enquiries table contains:
    id, created_at, name, phone, trip,
    message, status

    Do NOT send travel_date or people
    because those columns are not present
    in the current database.
  */

  return {
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
}


async function getEnquiries() {
  const db = ensureSupabase();

  const { data, error } =
    await db
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

  return Array.isArray(data)
    ? data.map(mapEnquiry)
    : [];
}


async function getEnquiry(id) {
  const db = ensureSupabase();

  const { data, error } =
    await db
      .from("enquiries")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "Failed to load enquiry."
    );
  }

  return mapEnquiry(data);
}


async function saveEnquiry(enquiry) {
  const db = ensureSupabase();

  const row =
    enquiryRowFromUI(
      enquiry
    );

  if (enquiry.id) {

    const { data, error } =
      await db
        .from("enquiries")
        .update(row)
        .eq("id", enquiry.id)
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

  const { data, error } =
    await db
      .from("enquiries")
      .insert(row)
      .select()
      .single();

  if (error) {
    throw dbError(
      error,
      "Failed to create enquiry."
    );
  }

  return mapEnquiry(data);
}


async function deleteEnquiry(id) {
  const db = ensureSupabase();

  const { error } =
    await db
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

function mapVideo(row) {
  if (!row) return null;

  return {
    id: row.id,
    created_at: row.created_at,

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


function videoRowFromUI(video = {}) {
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
  const db = ensureSupabase();

  const { data, error } =
    await db
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

  return Array.isArray(data)
    ? data.map(mapVideo)
    : [];
}


async function getVideo(id) {
  const db = ensureSupabase();

  const { data, error } =
    await db
      .from("videos")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    throw dbError(
      error,
      "Failed to load video."
    );
  }

  return mapVideo(data);
}


async function saveVideo(video) {
  const db = ensureSupabase();

  const row =
    videoRowFromUI(video);

  if (video.id) {

    const { data, error } =
      await db
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

  const { data, error } =
    await db
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

  const { error } =
    await db
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
   SETTINGS / BUSINESS
   ========================================================= */

function normalizeSettings(row) {

  if (!row) {
    return {
      ...BUSINESS_DEFAULTS
    };
  }

  return {

    id:
      row.id || 1,

    name:
      row.business_name ||
      BUSINESS_DEFAULTS.name,

    phone:
      row.phone || "",

    whatsapp:
      row.whatsapp || "",

    email:
      row.email || "",

    address:
      row.address || "",

    description:
      row.description ||
      BUSINESS_DEFAULTS.description,

    hours:
      row.hours || "",

    mapUrl:
      row.map_url || "",

    facebook:
      row.facebook || "",

    instagram:
      row.instagram || "",

    youtube:
      row.youtube || "",

    aboutText:
      row.about_text || "",

    footerText:
      row.footer_text ||
      BUSINESS_DEFAULTS.footerText,

    updatedAt:
      row.updated_at || ""
  };
}


function settingsRowFromUI(settings = {}) {

  return {

    id:
      settings.id || 1,

    business_name:
      settings.name ||
      settings.business_name ||
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

    map_url:
      settings.mapUrl ||
      settings.map_url ||
      "",

    facebook:
      settings.facebook || "",

    instagram:
      settings.instagram || "",

    youtube:
      settings.youtube || "",

    about_text:
      settings.aboutText ||
      settings.about_text ||
      "",

    footer_text:
      settings.footerText ||
      settings.footer_text ||
      ""
  };
}


/*
  Synchronous function used by app.js.
  This MUST stay synchronous because the current
  app.js calls getBusiness() without await.
*/

function getBusiness() {

  if (BUSINESS_CACHE) {
    return BUSINESS_CACHE;
  }

  BUSINESS_CACHE = {
    ...BUSINESS_DEFAULTS
  };

  return BUSINESS_CACHE;
}


function getSettings() {
  return getBusiness();
}


async function refreshBusinessCache() {

  try {

    const db =
      ensureSupabase();

    const { data, error } =
      await db
        .from("settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      BUSINESS_CACHE =
        normalizeSettings(data);
    }

    return BUSINESS_CACHE;

  } catch (error) {

    /*
      Settings are supplementary.
      A settings failure must NOT stop
      the public homepage from rendering.
    */

    console.error(
      "[data.js] Business settings refresh failed:",
      error
    );

    if (!BUSINESS_CACHE) {
      BUSINESS_CACHE = {
        ...BUSINESS_DEFAULTS
      };
    }

    return BUSINESS_CACHE;
  }
}


async function saveSettings(settings) {

  const db =
    ensureSupabase();

  const row =
    settingsRowFromUI(
      settings
    );

  const { data, error } =
    await db
      .from("settings")
      .upsert(row, {
        onConflict: "id"
      })
      .select()
      .single();

  if (error) {
    throw dbError(
      error,
      "Failed to save settings."
    );
  }

  BUSINESS_CACHE =
    normalizeSettings(data);

  return BUSINESS_CACHE;
}


/* =========================================================
   INITIALIZE DATA LAYER
   ========================================================= */

function initDataLayer() {

  /*
    Load settings in the background.
    Homepage does not wait for this.
  */

  refreshBusinessCache()
    .catch(error => {
      console.error(
        "[data.js] Settings initialization failed:",
        error
      );
    });
}


/* ---------------------------------------------------------
   START
   --------------------------------------------------------- */

initDataLayer();
