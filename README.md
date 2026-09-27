# Hazi Dada Travels

A colourful, mobile-first, horizontal-swipe travel app built with plain
**HTML5, CSS3 and vanilla JavaScript** — no frameworks, no build tools,
no npm install required. Runs entirely in the browser and is easy to
open and edit in mobile code editors like **Acode** or **Spck Editor**.

This is a brand-new, standalone build — it does not use or depend on
any previous version of this project.

---

## 1. Project Structure

```
hazi-dada-travels/
├── index.html            The whole customer-facing app (SPA)
├── css/
│   ├── style.css          Customer app styling (colourful, horizontal-first)
│   └── admin.css           Admin panel styling (clean dashboard)
├── js/
│   ├── data.js              Central data layer + business config + translations
│   ├── app.js                 SPA router, view rendering, booking sheet, lightbox
│   └── admin.js                 Admin auth + full CRUD dashboard logic
├── admin/
│   ├── login.html         Admin login screen
│   └── dashboard.html      Admin dashboard (Trips/Vehicles/Gallery/Videos/Reviews/Settings)
├── images/
│   ├── logo/logo.png      Your logo (already added)
│   ├── trips/, vehicles/, gallery/, reviews/   (optional: real photo files)
└── README.md
```

Trip/vehicle/gallery/review **images currently use generated placeholder
graphics** (colourful icon tiles) since no real photos were supplied — the
app never breaks on a missing image; everything has a built-in fallback.
Drop real photos into the folders above and reference them from the
Admin Panel whenever you're ready.

---

## 2. How to Run It

No install, no server, no build step:

1. Open `index.html` directly in any browser, **or**
2. In **Acode**/**Spck Editor** on Android: open the project folder, tap
   `index.html`, then use the built-in Preview button.

The Admin Panel is at `admin/login.html`.

**Default admin login:**
- Email: `hazidadatravels5786@gmail.com`
- Password: `hazidada123@`

⚠️ This is a **client-only prototype login** (see Security note, §8).

---

## 3. How the App Works

- It's a **single HTML page** (`index.html`). All navigation (Home, Trips,
  Trip Details, Vehicles, Gallery, Videos, Reviews, Contact) happens
  instantly in JavaScript via `js/app.js` — no page reloads.
- Proper **browser back-button history** is implemented with
  `history.pushState`/`popstate`, so Back always steps you through
  Booking → Trip Details → Trips → Home correctly, and only exits the
  app once you're back at Home (see §7 for Android WebView notes).
- All trip/vehicle/gallery/video/review data lives in **localStorage**,
  seeded once from sample data in `js/data.js`.

---

## 4. Editing Content

### Business info (phone, WhatsApp, email, address, social links)
Easiest: **Admin Panel → Settings**. This is the single source of truth —
nothing else in the app hard-codes these values.
You can also edit the defaults directly in `js/data.js` → `BUSINESS_DEFAULTS`.

### Trips
**Admin Panel → Trips → + Add Trip** (or Edit/Delete an existing one).
Fields: name, destination, category, duration, price, description,
highlights, trip gallery photos, and which vehicles are available for it.
Code alternative: edit the `SAMPLE_TRIPS` array in `js/data.js`.

### Vehicles
**Admin Panel → Vehicles → ＋ Add New Vehicle**. There is **no limit** —
add as many as you like (Traveller, Mini Bus, Coach, anything). Each
vehicle has Available/Unavailable and is automatically removed from the
public Trip Details page the moment it's marked Unavailable, with zero
code changes.

### Trip ↔ Vehicle assignment
Inside the **Add/Edit Trip** form, tick the vehicles that trip should
offer. Only vehicles marked *Available* actually show up on the public
trip details page — mark one Unavailable and it disappears automatically.

### Gallery photos
**Admin Panel → Gallery** — upload an image + caption. Delete any time.

### Videos
**Admin Panel → Videos** — paste a YouTube video ID (the part after
`v=` in a YouTube URL, e.g. `dQw4w9WgXcQ`).

### Reviews
**Admin Panel → Reviews** — add/edit/delete. Customers can also submit a
review from the public Reviews page (`js/app.js` → `renderReviews()`).

### Translations (English / Telugu / Hindi)
Edit the `translations` object in `js/data.js`. Every UI string used by
`app.js` is looked up via `t('key')`, so adding a 4th language is just
adding one more top-level block (e.g. `ta: {...}`) with the same keys.

### Logo
Already set to `images/logo/logo.png`, used in the header, footer link,
and Admin Panel. To replace it, just overwrite that file with the same
name — no code changes needed.

---

## 5. How the Admin Panel Works

- **Login** (`admin/login.html`) checks the email/password against a
  SHA-256-hashed record in `localStorage` (Web Crypto, no plaintext
  password stored) and starts a `sessionStorage` session.
- **Dashboard** (`admin/dashboard.html`) has a sidebar (desktop) / scrollable
  tab bar (mobile) with: Dashboard (stats), Trips, Vehicles, Gallery,
  Videos, Reviews, Settings, and Logout.
- Every Admin action calls the same data-layer functions from `js/data.js`
  that the public site uses to read data — so changes reflect immediately.
- **Change Password** is available under Settings.

---

## 6. Backend-Ready Data Layer (for Supabase later)

`js/data.js` is the **only** file that knows where data lives. Every
function already returns a `Promise` (`getTrips()`, `getTripById(id)`,
`getVehicles()`, `getReviews()`, `getGallery()`, `saveTrip()`,
`updateTrip()`, `deleteTrip()`, `saveVehicle()`, `updateVehicle()`,
`deleteVehicle()`, and the gallery/video/review equivalents) — exactly
like a real network call would. Nothing in `app.js` or `admin.js` needs
to change when you swap the internals.

### What to do when you connect Supabase
1. Create tables matching the shapes already used:
   - `trips (id, name, destination, category, duration, price, description, image, created_at, updated_at)`
   - `trip_images (id, trip_id, image_url)` — maps to `trip.gallery[]`
   - `vehicles (id, name, type, capacity, image_url, description, available)`
   - `reviews (id, name, rating, review, image_url, created_at)`
   - `gallery (id, image_url, caption, created_at)`
   - a `trip_vehicles` join table for `trip.vehicleIds[]`
2. Add the Supabase JS client `<script>` tag to `index.html`/`admin/dashboard.html`.
3. Rewrite the body of each function in `js/data.js` (e.g. `getTrips()`)
   to call `supabase.from('trips').select()` instead of reading
   localStorage — keep the same function name and return shape.
4. Replace `adminLogin`/`isAdminLoggedIn`/`adminLogout` in `js/admin.js`
   with `supabase.auth.signInWithPassword()` etc., and turn on Row Level
   Security so only authenticated admins can write to these tables.
5. For image uploads, swap the `fileToDataUrl()` (base64-in-place) calls
   for `supabase.storage.from('...').upload()`, storing the returned
   public URL instead of a data URI.

Nothing in the UI layer needs to be rewritten for any of this.

---

## 7. Android WebView Back Button

Because navigation uses `history.pushState`/`popstate` instead of full
page loads, a WebView wrapping this app should implement the standard
pattern:

```java
@Override
public void onBackPressed() {
    if (webView.canGoBack()) {
        webView.goBack();       // steps back through Booking → Trip Details → Trips → Home
    } else {
        super.onBackPressed();  // only exits when truly at the root/home state
    }
}
```

Because the app calls `history.replaceState()` (not `pushState()`) for
the initial Home load, `canGoBack()` correctly becomes `false` once the
user is back at Home, so the app only exits at the right moment.

---

## 8. Security Notes (read before going live)

This is a **frontend-only prototype**:
- Admin login is a client-side check — anyone with DevTools can inspect
  the JavaScript. It is **not** a substitute for real server-side auth.
- All content (trips, vehicles, gallery, reviews, settings) lives in the
  visitor's own browser `localStorage` — it is **not shared** between
  devices yet. Connecting Supabase (§6) is what makes it a real,
  shared, multi-device backend with proper authentication and Row Level
  Security.
- No online payments, no customer accounts — bookings are handled only
  through Call and WhatsApp, exactly as required.

## 9. What Remains To Be Connected (Supabase checklist)

- [ ] Supabase project + the 6 tables listed in §6
- [ ] Supabase Auth for the Admin Panel (replacing the localStorage login)
- [ ] Supabase Storage for trip/vehicle/gallery images (replacing base64)
- [ ] Row Level Security policies (public read, admin-only write)
- [ ] Point `js/data.js` functions at Supabase instead of localStorage
- [ ] Environment-specific Supabase URL/anon key (safe to expose — it's
      the anon key, protected by RLS — **never** expose the service-role key)
