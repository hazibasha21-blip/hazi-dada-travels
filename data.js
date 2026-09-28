/* =========================================================
   HAZI DADA TRAVELS — DATA LAYER (data.js)
   =========================================================
   This file is the ONLY place that knows where data comes
   from. Right now it reads/writes localStorage. Later, when
   a real backend (e.g. Supabase) is connected, every function
   below can be rewritten to call Supabase instead — nothing
   in app.js or admin.js needs to change, because they only
   ever call these functions (getTrips(), saveTrip(), etc.)
   and already treat them as asynchronous (they return
   Promises), exactly like a real network call would.
   ========================================================= */

/* ---------------------------------------------------------
   1. CENTRAL BUSINESS CONFIGURATION
   Nothing else in the app hard-codes contact details — every
   screen reads from this object (or its localStorage-backed
   copy, see getSettings() below).
   --------------------------------------------------------- */
const BUSINESS_DEFAULTS = {
  name: "Hazi Dada Travels",
  phone: "+91XXXXXXXXXX",       // EDIT ME: real phone number
  whatsapp: "91XXXXXXXXXX",     // EDIT ME: digits only, country code, no '+'
  email: "hazidadatravels5786@gmail.com",
  address: "[Business Address Placeholder — please provide]",
  hours: "[Business Hours Placeholder]",
  mapUrl: "#",                  // EDIT ME: Google Maps share link
  facebook: "#",
  instagram: "#",
  youtube: "#",
  aboutText: "[Editable placeholder] Hazi Dada Travels helps travellers plan comfortable, well-organised trips.",
  footerText: "[Editable placeholder] Your trusted travel partner."
};

/* ---------------------------------------------------------
   2. TRANSLATIONS (English / Telugu / Hindi)
   Used via t('key') in app.js. Add a language by adding a
   new top-level key here (e.g. ta for Tamil).
   --------------------------------------------------------- */
const translations = {
  en: {
    nav_home: "Home", nav_trips: "Trips", nav_vehicles: "Vehicles", nav_gallery: "Gallery",
    nav_videos: "Videos", nav_reviews: "Reviews", nav_contact: "Contact",
    hero_title: "Explore Your Journey", hero_subtitle: "Discover memorable journeys with Hazi Dada Travels.",
    btn_explore_trips: "Explore Trips", btn_contact_us: "Contact Us", btn_view_details: "View Details",
    btn_book_now: "Book Now", btn_call: "Call", btn_whatsapp: "WhatsApp", btn_copy_number: "Copy Number",
    btn_close: "Close", btn_all: "All",
    section_featured: "Featured Trips", section_trips: "Explore Trips", section_vehicles: "Our Vehicles",
    section_gallery: "Gallery", section_videos: "Videos", section_reviews: "Customer Reviews",
    section_contact: "Contact Us",
    label_destination: "Destination", label_duration: "Duration", label_price: "Price", label_vehicle: "Vehicle",
    label_highlights: "Highlights", label_available_vehicles: "Available Vehicles", label_trip_gallery: "Trip Gallery",
    book_title: "Book / Enquire",
    toast_copied: "Phone number copied",
    toast_review_submitted: "Thank you! Your review has been submitted.",
    empty_trips: "No trips available at the moment. Please contact us for upcoming trips.",
    empty_vehicles: "No vehicles available right now.",
    empty_gallery: "No photos available yet.",
    empty_videos: "No videos available yet.",
    empty_reviews: "No reviews yet. Be the first to share your experience!",
    loading_trips: "Loading trips...", loading_vehicles: "Loading vehicles...",
    loading_gallery: "Loading gallery...", loading_videos: "Loading videos...", loading_reviews: "Loading reviews...",
    error_generic: "Something went wrong. Please try again.", error_trip_not_found: "This trip could not be found.",
    form_your_name: "Your Name", form_rating: "Rating", form_review_text: "Your Review", btn_submit: "Submit",
    footer_quick_links: "Quick Links", footer_contact: "Contact", footer_rights: "All rights reserved.",
    cat_all: "All", cat_oneday: "One Day", cat_weekend: "Weekend", cat_family: "Family", cat_pilgrimage: "Pilgrimage", cat_other: "Other",
    contact_call: "Call", contact_whatsapp: "WhatsApp", contact_location: "Location"
  },
  te: {
    nav_home: "హోమ్", nav_trips: "ట్రిప్స్", nav_vehicles: "వాహనాలు", nav_gallery: "గ్యాలరీ",
    nav_videos: "వీడియోలు", nav_reviews: "రివ్యూలు", nav_contact: "సంప్రదించండి",
    hero_title: "మీ ప్రయాణాన్ని అన్వేషించండి", hero_subtitle: "హాజీ దాదా ట్రావెల్స్‌తో మధురమైన యాత్రలను కనుగొనండి.",
    btn_explore_trips: "ట్రిప్స్ చూడండి", btn_contact_us: "సంప్రదించండి", btn_view_details: "వివరాలు చూడండి",
    btn_book_now: "బుక్ చేయండి", btn_call: "కాల్", btn_whatsapp: "వాట్సాప్", btn_copy_number: "నంబర్ కాపీ చేయండి",
    btn_close: "మూసివేయండి", btn_all: "అన్నీ",
    section_featured: "ఫీచర్డ్ ట్రిప్స్", section_trips: "ట్రిప్స్ చూడండి", section_vehicles: "మా వాహనాలు",
    section_gallery: "గ్యాలరీ", section_videos: "వీడియోలు", section_reviews: "కస్టమర్ రివ్యూలు",
    section_contact: "సంప్రదించండి",
    label_destination: "గమ్యస్థానం", label_duration: "వ్యవధి", label_price: "ధర", label_vehicle: "వాహనం",
    label_highlights: "ముఖ్యాంశాలు", label_available_vehicles: "అందుబాటులో ఉన్న వాహనాలు", label_trip_gallery: "ట్రిప్ గ్యాలరీ",
    book_title: "బుక్ / విచారణ",
    toast_copied: "ఫోన్ నంబర్ కాపీ చేయబడింది",
    toast_review_submitted: "ధన్యవాదాలు! మీ రివ్యూ సమర్పించబడింది.",
    empty_trips: "ప్రస్తుతం ట్రిప్స్ అందుబాటులో లేవు. దయచేసి మమ్మల్ని సంప్రదించండి.",
    empty_vehicles: "ప్రస్తుతం వాహనాలు అందుబాటులో లేవు.",
    empty_gallery: "ఇంకా ఫోటోలు లేవు.",
    empty_videos: "ఇంకా వీడియోలు లేవు.",
    empty_reviews: "ఇంకా రివ్యూలు లేవు. మొదటిగా మీ అనుభవం పంచుకోండి!",
    loading_trips: "ట్రిప్స్ లోడ్ అవుతున్నాయి...", loading_vehicles: "వాహనాలు లోడ్ అవుతున్నాయి...",
    loading_gallery: "గ్యాలరీ లోడ్ అవుతోంది...", loading_videos: "వీడియోలు లోడ్ అవుతున్నాయి...", loading_reviews: "రివ్యూలు లోడ్ అవుతున్నాయి...",
    error_generic: "ఏదో తప్పు జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి.", error_trip_not_found: "ఈ ట్రిప్ కనుగొనబడలేదు.",
    form_your_name: "మీ పేరు", form_rating: "రేటింగ్", form_review_text: "మీ రివ్యూ", btn_submit: "సమర్పించండి",
    footer_quick_links: "త్వరిత లింకులు", footer_contact: "సంప్రదింపు", footer_rights: "అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.",
    cat_all: "అన్నీ", cat_oneday: "వన్ డే", cat_weekend: "వీకెండ్", cat_family: "ఫ్యామిలీ", cat_pilgrimage: "యాత్ర", cat_other: "ఇతర",
    contact_call: "కాల్", contact_whatsapp: "వాట్సాప్", contact_location: "స్థానం"
  },
  hi: {
    nav_home: "होम", nav_trips: "ट्रिप्स", nav_vehicles: "वाहन", nav_gallery: "गैलरी",
    nav_videos: "वीडियो", nav_reviews: "समीक्षाएं", nav_contact: "संपर्क करें",
    hero_title: "अपनी यात्रा की खोज करें", hero_subtitle: "हाज़ी दादा ट्रैवल्स के साथ यादगार यात्राओं की खोज करें।",
    btn_explore_trips: "ट्रिप्स देखें", btn_contact_us: "संपर्क करें", btn_view_details: "विवरण देखें",
    btn_book_now: "अभी बुक करें", btn_call: "कॉल", btn_whatsapp: "व्हाट्सएप", btn_copy_number: "नंबर कॉपी करें",
    btn_close: "बंद करें", btn_all: "सभी",
    section_featured: "फीचर्ड ट्रिप्स", section_trips: "ट्रिप्स देखें", section_vehicles: "हमारे वाहन",
    section_gallery: "गैलरी", section_videos: "वीडियो", section_reviews: "ग्राहक समीक्षाएं",
    section_contact: "संपर्क करें",
    label_destination: "गंतव्य", label_duration: "अवधि", label_price: "कीमत", label_vehicle: "वाहन",
    label_highlights: "मुख्य विशेषताएं", label_available_vehicles: "उपलब्ध वाहन", label_trip_gallery: "ट्रिप गैलरी",
    book_title: "बुक / पूछताछ",
    toast_copied: "फ़ोन नंबर कॉपी हो गया",
    toast_review_submitted: "धन्यवाद! आपकी समीक्षा सबमिट कर दी गई है।",
    empty_trips: "फ़िलहाल कोई ट्रिप उपलब्ध नहीं है। कृपया हमसे संपर्क करें।",
    empty_vehicles: "फ़िलहाल कोई वाहन उपलब्ध नहीं है।",
    empty_gallery: "अभी तक कोई फोटो उपलब्ध नहीं है।",
    empty_videos: "अभी तक कोई वीडियो उपलब्ध नहीं है।",
    empty_reviews: "अभी तक कोई समीक्षा नहीं है। सबसे पहले अपना अनुभव साझा करें!",
    loading_trips: "ट्रिप्स लोड हो रही हैं...", loading_vehicles: "वाहन लोड हो रहे हैं...",
    loading_gallery: "गैलरी लोड हो रही है...", loading_videos: "वीडियो लोड हो रहे हैं...", loading_reviews: "समीक्षाएं लोड हो रही हैं...",
    error_generic: "कुछ गड़बड़ हो गई। कृपया पुनः प्रयास करें।", error_trip_not_found: "यह ट्रिप नहीं मिली।",
    form_your_name: "आपका नाम", form_rating: "रेटिंग", form_review_text: "आपकी समीक्षा", btn_submit: "सबमिट करें",
    footer_quick_links: "त्वरित लिंक", footer_contact: "संपर्क", footer_rights: "सर्वाधिकार सुरक्षित।",
    cat_all: "सभी", cat_oneday: "वन डे", cat_weekend: "वीकेंड", cat_family: "फैमिली", cat_pilgrimage: "तीर्थ यात्रा", cat_other: "अन्य",
    contact_call: "कॉल", contact_whatsapp: "व्हाट्सएप", contact_location: "स्थान"
  }
};

/* ---------------------------------------------------------
   3. FALLBACK / PLACEHOLDER IMAGE
   Generated as an inline SVG data-URI, so it works with zero
   network requests and zero real image files. Real photos can
   simply be dropped into images/trips, images/vehicles, etc.
   and referenced by path — the app doesn't care where the URL
   points, as long as it's a valid image src.
   --------------------------------------------------------- */
function placeholderImage(emoji, label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2a8fe0"/>
          <stop offset="100%" stop-color="#0b3d66"/>
        </linearGradient>
      </defs>
      <rect width="600" height="420" fill="url(#g)"/>
      <text x="300" y="210" font-size="120" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
      <text x="300" y="360" font-size="26" fill="#ffffff" font-family="Arial, sans-serif" text-anchor="middle">${label}</text>
    </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
const PLACEHOLDER_FALLBACK = placeholderImage("🖼️", "Image coming soon");

/* ---------------------------------------------------------
   4. SAMPLE DATA (clearly separated from app logic — replace
   or extend freely from the Admin Panel or right here).
   Field names match the "Future Database Structure" so this
   can be swapped for Supabase tables with minimal changes.
   --------------------------------------------------------- */
const SAMPLE_TRIPS = [
  { id: 1, name: "[Sample] Hyderabad City Tour", destination: "Hyderabad", category: "Family", duration: "1 Day", price: "₹[EDIT PRICE]",
    image: placeholderImage("🏙️", "Hyderabad"), description: "[Editable placeholder] A one-day sightseeing tour covering Hyderabad's popular spots.",
    highlights: ["Sightseeing", "Local Food", "Photography"], gallery: [placeholderImage("🏙️", "Hyderabad 1"), placeholderImage("🏛️", "Hyderabad 2"), placeholderImage("🌆", "Hyderabad 3")],
    vehicleIds: [1, 2] },
  { id: 2, name: "[Sample] Goa Beach Getaway", destination: "Goa", category: "Beach", duration: "3 Days / 2 Nights", price: "₹[EDIT PRICE]",
    image: placeholderImage("🏖️", "Goa"), description: "[Editable placeholder] A relaxing weekend beach getaway to Goa.",
    highlights: ["Beaches", "Sightseeing", "Photography"], gallery: [placeholderImage("🏖️", "Goa 1"), placeholderImage("🌊", "Goa 2"), placeholderImage("🌅", "Goa 3")],
    vehicleIds: [1] },
  { id: 3, name: "[Sample] Tirupati Pilgrimage", destination: "Tirupati", category: "Pilgrimage", duration: "2 Days / 1 Night", price: "₹[EDIT PRICE]",
    image: placeholderImage("🛕", "Tirupati"), description: "[Editable placeholder] A guided pilgrimage trip to Tirupati.",
    highlights: ["Temple", "Group Travel"], gallery: [placeholderImage("🛕", "Tirupati 1"), placeholderImage("🙏", "Tirupati 2")],
    vehicleIds: [1, 2] },
  { id: 4, name: "[Sample] Araku Valley Family Trip", destination: "Araku Valley", category: "Adventure", duration: "2 Days / 1 Night", price: "₹[EDIT PRICE]",
    image: placeholderImage("🌄", "Araku Valley"), description: "[Editable placeholder] A scenic family-friendly trip through Araku Valley.",
    highlights: ["Scenery", "Family Fun", "Photography"], gallery: [placeholderImage("🌄", "Araku 1"), placeholderImage("🚂", "Araku 2")],
    vehicleIds: [2] },
  { id: 5, name: "[Sample] Vizag Weekend Trip", destination: "Visakhapatnam", category: "Weekend", duration: "2 Days / 1 Night", price: "₹[EDIT PRICE]",
    image: placeholderImage("🌊", "Vizag"), description: "[Editable placeholder] A weekend trip exploring Vizag's beaches and hills.",
    highlights: ["Beaches", "Sightseeing"], gallery: [placeholderImage("🌊", "Vizag 1"), placeholderImage("⛰️", "Vizag 2")],
    vehicleIds: [1] },
  { id: 6, name: "[Sample] Kerala Backwaters", destination: "Kerala", category: "Nature", duration: "4 Days / 3 Nights", price: "₹[EDIT PRICE]",
    image: placeholderImage("🚤", "Kerala"), description: "[Editable placeholder] Explore Kerala's backwaters and greenery.",
    highlights: ["Backwaters", "Nature", "Food"], gallery: [placeholderImage("🚤", "Kerala 1"), placeholderImage("🌴", "Kerala 2")],
    vehicleIds: [2] }
];

const SAMPLE_VEHICLES = [
  { id: 1, name: "SML Bus", type: "Bus", capacity: "32 Seater", image_url: placeholderImage("🚌", "SML Bus"),
    description: "[Editable placeholder] Comfortable vehicle suitable for group tours.", available: true },
  { id: 2, name: "Force Toofan", type: "Passenger Vehicle", capacity: "12 Seater", image_url: placeholderImage("🚐", "Force Toofan"),
    description: "[Editable placeholder] Suited for smaller groups and off-road routes.", available: true }
];

const SAMPLE_GALLERY = [
  { id: 1, image_url: placeholderImage("🏔️", "Hill Station"), caption: "[Sample] Hill Station View" },
  { id: 2, image_url: placeholderImage("🛕", "Temple Visit"), caption: "[Sample] Temple Visit" },
  { id: 3, image_url: placeholderImage("🚌", "Group Trip"), caption: "[Sample] Group Trip" },
  { id: 4, image_url: placeholderImage("🏙️", "City Tour"), caption: "[Sample] City Tour" },
  { id: 5, image_url: placeholderImage("🌅", "Sunset Point"), caption: "[Sample] Sunset Point" },
  { id: 6, image_url: placeholderImage("🏖️", "Beach Trip"), caption: "[Sample] Beach Trip" }
];

const SAMPLE_VIDEOS = [
  { id: 1, title: "[Sample] Trip Highlights Reel", description: "[Editable placeholder description]", youtubeId: "" },
  { id: 2, title: "[Sample] Customer Travel Story", description: "[Editable placeholder description]", youtubeId: "" }
];

const SAMPLE_REVIEWS = [
  { id: 1, name: "[Sample Customer]", rating: 5, review: "[Demo review placeholder] Great trip experience overall.", image_url: "" },
  { id: 2, name: "[Sample Customer]", rating: 4, review: "[Demo review placeholder] Comfortable travel and helpful staff.", image_url: "" }
];

/* ---------------------------------------------------------
   5. LOCALSTORAGE-BACKED "DATABASE"
   Seeds sample data once, then reads/writes localStorage.
   --------------------------------------------------------- */
function seedIfEmpty(key, sample) {
  if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(sample));
}
function readTable(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; } }
function writeTable(key, rows) {
  try { localStorage.setItem(key, JSON.stringify(rows)); }
  catch (e) { throw new Error("Storage is full. Try smaller images."); }
}
function nextId(rows) { return rows.reduce((max, r) => Math.max(max, r.id), 0) + 1; }

function initDataLayer() {
  seedIfEmpty("hdtui_trips", SAMPLE_TRIPS);
  seedIfEmpty("hdtui_vehicles", SAMPLE_VEHICLES);
  seedIfEmpty("hdtui_gallery", SAMPLE_GALLERY);
  seedIfEmpty("hdtui_videos", SAMPLE_VIDEOS);
  seedIfEmpty("hdtui_reviews", SAMPLE_REVIEWS);
  if (!localStorage.getItem("hdtui_settings")) localStorage.setItem("hdtui_settings", JSON.stringify(BUSINESS_DEFAULTS));
}
initDataLayer();

/* Small helper to make every data function feel like a real
   network call (Promise-based), so swapping to Supabase later
   requires no changes anywhere these functions are called. */
function resolved(value) { return Promise.resolve(value); }

/* ---------- SETTINGS / BUSINESS CONFIG ---------- */
function getSettings() { return resolved(getBusiness()); }
function getBusiness() { try { return JSON.parse(localStorage.getItem("hdtui_settings")) || BUSINESS_DEFAULTS; } catch (e) { return BUSINESS_DEFAULTS; } }
function saveSettings(newSettings) {
  localStorage.setItem("hdtui_settings", JSON.stringify({ ...getBusiness(), ...newSettings }));
  return resolved(true);
}

/* ---------- TRIPS ---------- */
function getTrips() { return resolved(readTable("hdtui_trips")); }
function getTripById(id) { return resolved(readTable("hdtui_trips").find(t => t.id === Number(id)) || null); }
function saveTrip(trip) {
  const rows = readTable("hdtui_trips");
  const record = { ...trip, id: nextId(rows), created_at: new Date().toISOString(), highlights: trip.highlights || [], gallery: trip.gallery || [], vehicleIds: trip.vehicleIds || [] };
  rows.push(record);
  writeTable("hdtui_trips", rows);
  return resolved(record);
}
function updateTrip(id, updates) {
  const rows = readTable("hdtui_trips");
  const idx = rows.findIndex(t => t.id === Number(id));
  if (idx === -1) return resolved(null);
  rows[idx] = { ...rows[idx], ...updates };
  writeTable("hdtui_trips", rows);
  return resolved(rows[idx]);
}
function deleteTrip(id) {
  writeTable("hdtui_trips", readTable("hdtui_trips").filter(t => t.id !== Number(id)));
  return resolved(true);
}

/* ---------- VEHICLES ---------- */
function getVehicles() { return resolved(readTable("hdtui_vehicles")); }
function getVehiclesByIds(ids) { return resolved(readTable("hdtui_vehicles").filter(v => (ids || []).includes(v.id))); }
function saveVehicle(vehicle) {
  const rows = readTable("hdtui_vehicles");
  const record = { ...vehicle, id: nextId(rows), created_at: new Date().toISOString() };
  rows.push(record);
  writeTable("hdtui_vehicles", rows);
  return resolved(record);
}
function updateVehicle(id, updates) {
  const rows = readTable("hdtui_vehicles");
  const idx = rows.findIndex(v => v.id === Number(id));
  if (idx === -1) return resolved(null);
  rows[idx] = { ...rows[idx], ...updates };
  writeTable("hdtui_vehicles", rows);
  return resolved(rows[idx]);
}
function deleteVehicle(id) {
  writeTable("hdtui_vehicles", readTable("hdtui_vehicles").filter(v => v.id !== Number(id)));
  return resolved(true);
}

/* ---------- GALLERY ---------- */
function getGallery() { return resolved(readTable("hdtui_gallery")); }
function saveGalleryItem(item) {
  const rows = readTable("hdtui_gallery");
  const record = { ...item, id: nextId(rows), created_at: new Date().toISOString() };
  rows.push(record);
  writeTable("hdtui_gallery", rows);
  return resolved(record);
}
function deleteGalleryItem(id) {
  writeTable("hdtui_gallery", readTable("hdtui_gallery").filter(g => g.id !== Number(id)));
  return resolved(true);
}

/* ---------- VIDEOS ---------- */
function getVideos() { return resolved(readTable("hdtui_videos")); }
function saveVideo(video) {
  const rows = readTable("hdtui_videos");
  const record = { ...video, id: nextId(rows), created_at: new Date().toISOString() };
  rows.push(record);
  writeTable("hdtui_videos", rows);
  return resolved(record);
}
function updateVideo(id, updates) {
  const rows = readTable("hdtui_videos");
  const idx = rows.findIndex(v => v.id === Number(id));
  if (idx === -1) return resolved(null);
  rows[idx] = { ...rows[idx], ...updates };
  writeTable("hdtui_videos", rows);
  return resolved(rows[idx]);
}
function deleteVideo(id) {
  writeTable("hdtui_videos", readTable("hdtui_videos").filter(v => v.id !== Number(id)));
  return resolved(true);
}

/* ---------- REVIEWS ---------- */
function getReviews() { return resolved(readTable("hdtui_reviews")); }
function saveReview(review) {
  const rows = readTable("hdtui_reviews");
  const record = { ...review, id: nextId(rows), created_at: new Date().toISOString() };
  rows.push(record);
  writeTable("hdtui_reviews", rows);
  return resolved(record);
}
function updateReview(id, updates) {
  const rows = readTable("hdtui_reviews");
  const idx = rows.findIndex(r => r.id === Number(id));
  if (idx === -1) return resolved(null);
  rows[idx] = { ...rows[idx], ...updates };
  writeTable("hdtui_reviews", rows);
  return resolved(rows[idx]);
}
function deleteReview(id) {
  writeTable("hdtui_reviews", readTable("hdtui_reviews").filter(r => r.id !== Number(id)));
  return resolved(true);
}

/* =========================================================
   PHASE 1/2 ADDITIONS
   ---------------------------------------------------------
   Everything below is TEMPORARY frontend data/behaviour used
   only for UI testing. In Phase 3 these functions are rewired
   to the EXISTING Supabase tables (enquiries, gallery, reviews,
   trips, vehicles) after the real column names are verified.
   No table or column is assumed or created here.
   ========================================================= */

Object.assign(translations.en, {
  hero_title: "Explore. Travel. Create Memories.",
  hero_subtitle: "Discover memorable journeys with Hazi Dada Travels.",
  why_title: "Why Choose Us",
  why_1_t: "Easy Booking", why_1_d: "Book quickly by Call, WhatsApp or the enquiry form.",
  why_2_t: "Suitable Vehicles", why_2_d: "Choose from the vehicles available for your group.",
  why_3_t: "Varied Trips", why_3_d: "Family, pilgrimage, beach, nature and weekend trips.",
  why_4_t: "Personal Support", why_4_d: "Talk to us directly to plan your journey.",
  btn_enquire: "Enquire", enquire_title: "Send Enquiry", btn_send_enquiry: "Send Enquiry",
  form_name: "Name", form_phone: "Phone Number", form_trip: "Selected Trip", form_date: "Travel Date",
  form_people: "Number of People", form_message: "Message",
  toast_enquiry_sent: "Thank you! Your enquiry has been received.",
  err_required: "Please enter your name and a valid phone number.",
  btn_see_all: "See All", btn_email: "Email", btn_open_map: "Open Map", btn_back: "Back",
  contact_email: "Email", contact_hours: "Business Hours", contact_address: "Address", contact_social: "Follow Us",
  cta_title: "Ready to plan your trip?", cta_sub: "Call, WhatsApp or send us an enquiry.",
  btn_watch: "Watch", write_review: "Write a Review",
  label_available: "Available", label_unavailable: "Unavailable", btn_book_vehicle: "Book / Enquire",
  no_video_link: "Video link not added yet.", open_youtube: "Open on YouTube",
  err_load: "Unable to load content. Please try again.", btn_retry: "Retry",
  footer_about: "Travel and vehicle booking. Enquire by phone, WhatsApp or form.",
  section_video_preview: "Videos", sample_badge: "Sample"
});
Object.assign(translations.te, {
  hero_title: "అన్వేషించండి. ప్రయాణించండి. జ్ఞాపకాలు సృష్టించండి.",
  hero_subtitle: "హాజీ దాదా ట్రావెల్స్‌తో మధురమైన యాత్రలను కనుగొనండి.",
  why_title: "మమ్మల్ని ఎందుకు ఎంచుకోవాలి",
  why_1_t: "సులభమైన బుకింగ్", why_1_d: "కాల్, వాట్సాప్ లేదా విచారణ ఫారం ద్వారా త్వరగా బుక్ చేయండి.",
  why_2_t: "అనువైన వాహనాలు", why_2_d: "మీ గ్రూప్‌కు అందుబాటులో ఉన్న వాహనాలను ఎంచుకోండి.",
  why_3_t: "వివిధ ట్రిప్స్", why_3_d: "ఫ్యామిలీ, యాత్ర, బీచ్, ప్రకృతి మరియు వీకెండ్ ట్రిప్స్.",
  why_4_t: "వ్యక్తిగత సహాయం", why_4_d: "మీ ప్రయాణాన్ని ప్లాన్ చేయడానికి నేరుగా మాతో మాట్లాడండి.",
  btn_enquire: "విచారణ", enquire_title: "విచారణ పంపండి", btn_send_enquiry: "విచారణ పంపండి",
  form_name: "పేరు", form_phone: "ఫోన్ నంబర్", form_trip: "ఎంచుకున్న ట్రిప్", form_date: "ప్రయాణ తేదీ",
  form_people: "వ్యక్తుల సంఖ్య", form_message: "సందేశం",
  toast_enquiry_sent: "ధన్యవాదాలు! మీ విచారణ అందింది.",
  err_required: "దయచేసి మీ పేరు మరియు సరైన ఫోన్ నంబర్ ఇవ్వండి.",
  btn_see_all: "అన్నీ చూడండి", btn_email: "ఇమెయిల్", btn_open_map: "మ్యాప్ తెరవండి", btn_back: "వెనుకకు",
  contact_email: "ఇమెయిల్", contact_hours: "పని వేళలు", contact_address: "చిరునామా", contact_social: "మమ్మల్ని అనుసరించండి",
  cta_title: "మీ ట్రిప్ ప్లాన్ చేయడానికి సిద్ధమా?", cta_sub: "కాల్, వాట్సాప్ చేయండి లేదా విచారణ పంపండి.",
  btn_watch: "చూడండి", write_review: "రివ్యూ రాయండి",
  label_available: "అందుబాటులో ఉంది", label_unavailable: "అందుబాటులో లేదు", btn_book_vehicle: "బుక్ / విచారణ",
  no_video_link: "వీడియో లింక్ ఇంకా జోడించబడలేదు.", open_youtube: "YouTube లో తెరవండి",
  err_load: "కంటెంట్ లోడ్ కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.", btn_retry: "మళ్లీ ప్రయత్నించండి",
  footer_about: "ట్రావెల్ మరియు వాహన బుకింగ్. ఫోన్, వాట్సాప్ లేదా ఫారం ద్వారా విచారించండి.",
  section_video_preview: "వీడియోలు", sample_badge: "నమూనా"
});
Object.assign(translations.hi, {
  hero_title: "खोजें। यात्रा करें। यादें बनाएं।",
  hero_subtitle: "हाज़ी दादा ट्रैवल्स के साथ यादगार यात्राओं की खोज करें।",
  why_title: "हमें क्यों चुनें",
  why_1_t: "आसान बुकिंग", why_1_d: "कॉल, व्हाट्सएप या पूछताछ फ़ॉर्म से जल्दी बुक करें।",
  why_2_t: "उपयुक्त वाहन", why_2_d: "अपने समूह के लिए उपलब्ध वाहनों में से चुनें।",
  why_3_t: "विविध ट्रिप्स", why_3_d: "फैमिली, तीर्थ, बीच, प्रकृति और वीकेंड ट्रिप्स।",
  why_4_t: "व्यक्तिगत सहायता", why_4_d: "अपनी यात्रा की योजना के लिए सीधे हमसे बात करें।",
  btn_enquire: "पूछताछ", enquire_title: "पूछताछ भेजें", btn_send_enquiry: "पूछताछ भेजें",
  form_name: "नाम", form_phone: "फ़ोन नंबर", form_trip: "चुनी हुई ट्रिप", form_date: "यात्रा तिथि",
  form_people: "लोगों की संख्या", form_message: "संदेश",
  toast_enquiry_sent: "धन्यवाद! आपकी पूछताछ मिल गई है।",
  err_required: "कृपया अपना नाम और सही फ़ोन नंबर दर्ज करें।",
  btn_see_all: "सभी देखें", btn_email: "ईमेल", btn_open_map: "मैप खोलें", btn_back: "वापस",
  contact_email: "ईमेल", contact_hours: "व्यावसायिक घंटे", contact_address: "पता", contact_social: "हमें फ़ॉलो करें",
  cta_title: "अपनी ट्रिप की योजना बनाने के लिए तैयार?", cta_sub: "कॉल करें, व्हाट्सएप करें या पूछताछ भेजें।",
  btn_watch: "देखें", write_review: "समीक्षा लिखें",
  label_available: "उपलब्ध", label_unavailable: "अनुपलब्ध", btn_book_vehicle: "बुक / पूछताछ",
  no_video_link: "वीडियो लिंक अभी नहीं जोड़ा गया।", open_youtube: "YouTube पर खोलें",
  err_load: "सामग्री लोड नहीं हो सकी। कृपया पुनः प्रयास करें।", btn_retry: "पुनः प्रयास करें",
  footer_about: "यात्रा और वाहन बुकिंग। फ़ोन, व्हाट्सएप या फ़ॉर्म से पूछताछ करें।",
  section_video_preview: "वीडियो", sample_badge: "नमूना"
});
// Category labels (admin can add any category; unknown ones show as typed)
Object.assign(translations.en, { cat_beach: "Beach", cat_nature: "Nature", cat_adventure: "Adventure" });
Object.assign(translations.te, { cat_beach: "బీచ్", cat_nature: "ప్రకృతి", cat_adventure: "సాహసం" });
Object.assign(translations.hi, { cat_beach: "बीच", cat_nature: "प्रकृति", cat_adventure: "एडवेंचर" });

/* ---------- YouTube helper: accepts a full URL or a bare ID ---------- */
function extractYouTubeId(input) {
  const v = String(input || "").trim();
  if (!v) return "";
  const m = v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{11}$/.test(v) ? v : "";
}

/* ---------- ENQUIRIES (temporary local store; Phase 3 → `enquiries` table) ---------- */
const SAMPLE_ENQUIRIES = [
  { id: 1, name: "[Sample] Customer", phone: "9XXXXXXXXX", trip: "[Sample] Goa Beach Getaway", travel_date: "", people: "4",
    message: "[Sample enquiry for UI testing]", status: "New", created_at: new Date().toISOString() }
];
seedIfEmpty("hdtui_enquiries", SAMPLE_ENQUIRIES);
function getEnquiries() { return resolved(readTable("hdtui_enquiries")); }
function saveEnquiry(e) {
  const rows = readTable("hdtui_enquiries");
  const record = { status: "New", ...e, id: nextId(rows), created_at: new Date().toISOString() };
  rows.push(record); writeTable("hdtui_enquiries", rows);
  return resolved(record);
}
function updateEnquiry(id, updates) {
  const rows = readTable("hdtui_enquiries");
  const i = rows.findIndex(r => r.id === Number(id));
  if (i === -1) return resolved(null);
  rows[i] = { ...rows[i], ...updates }; writeTable("hdtui_enquiries", rows);
  return resolved(rows[i]);
}
function deleteEnquiry(id) {
  writeTable("hdtui_enquiries", readTable("hdtui_enquiries").filter(r => r.id !== Number(id)));
  return resolved(true);
}

/* ---------- GALLERY / REVIEW updates (admin edit captions / edit reviews) ---------- */
function updateGalleryItem(id, updates) {
  const rows = readTable("hdtui_gallery");
  const i = rows.findIndex(r => r.id === Number(id));
  if (i === -1) return resolved(null);
  rows[i] = { ...rows[i], ...updates }; writeTable("hdtui_gallery", rows);
  return resolved(rows[i]);
}
Object.assign(translations.en, { contact_phone: "Phone" });
Object.assign(translations.te, { contact_phone: "ఫోన్" });
Object.assign(translations.hi, { contact_phone: "फ़ोन" });
