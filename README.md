# Hazi Dada Travels — Phase 1 (Public UI) + Phase 2 (Admin UI)

HTML5 · CSS3 · vanilla JavaScript. No framework, no build step, no npm.
**Supabase is NOT connected yet** (by design — Phases 1–2 only). Nothing in this
project touches your existing Supabase project, tables or keys.

## Files
```
index.html      Public SPA shell (Home, Trips, Trip Details, Vehicles, Gallery, Videos, Reviews, Contact)
login.html      Admin login
dashboard.html  Admin (Dashboard, Trips, Vehicles, Gallery, Videos, Reviews, Enquiries, Settings)
app.js          Public app: router, views, booking sheet, enquiry form, lightbox, video modal
admin.js        Admin logic
data.js         The ONLY data layer + translations (EN / తెలుగు / हिन्दी) + temporary sample data
style.css       Public theme      admin.css  Admin theme
logo.png        Your logo         assets/    Future images
```
`style.css` is an addition to your suggested structure: the public site and admin
have different themes, so they need separate stylesheets.

## Run
Open `index.html` in a browser (or Preview in Acode/Spck). For full behaviour
(History API/back button) serve the folder, e.g. `python3 -m http.server`.
Admin: `login.html`.

## UI-preview login (temporary)
Any valid email + password of 6+ characters opens the dashboard. It verifies nothing and
stores no password. It exists only so the admin UI can be tested. **Phase 3 replaces it with Supabase Auth.**

## Temporary data
Trips, vehicles, gallery, videos, reviews, enquiries and settings live in browser
`localStorage` (keys `hdtui_*`), seeded with clearly marked `[Sample]` records. Images
uploaded in admin are resized/compressed to keep this small — Base64 is for UI testing only.
Public phone/WhatsApp/email/address come from Admin → Settings (not hard-coded).

## Behaviour notes
- Back button: every page change is a history entry; opening the booking sheet, enquiry form,
  lightbox or video adds one entry, so Android Back closes it first, then walks
  Trip Details → Trips → Home. The app only exits at Home.
- Trip cards swipe horizontally on phones; on ≥1024px trips/vehicles/videos/reviews wrap into a grid.
- Trip categories in the filter bar are built from the trips themselves.
- Only vehicles marked Available appear on public trip pages.
- Call = `tel:`, WhatsApp = `https://wa.me/<number>?text=…` (same tab, WebView-safe).

## Phase 3 checklist (Supabase — not started)
1. Inspect the REAL schema of `enquiries, gallery, reviews, trips, vehicles` (columns, types, RLS). Nothing here assumes columns.
2. Map the UI shapes in `data.js` to those columns (e.g. `trip.gallery`, `trip.vehicleIds`, `trip.highlights`, video ID, settings, enquiry status may have no column — decide with you before adding anything).
3. Rewrite the functions in `data.js` (getTrips, saveTrip, … getEnquiries, saveEnquiry) to call Supabase. Signatures stay the same, so `app.js`/`admin.js` don't change.
4. Replace the four auth functions at the top of `admin.js` with Supabase Auth; delete the preview login.
5. Move images to Supabase Storage; save URLs instead of Base64.
6. RLS: public read of content, admin-only writes, insert-only public access to `enquiries`/reviews. Only the anon key in the browser — never the service-role key.
