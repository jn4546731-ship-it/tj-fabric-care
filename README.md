# TJ FABRIC CARE — Next-Gen Smart Laundry & Garment Spa (Kenya 🇰🇪)

Official HTTPS URL: **https://tjfabriccare.co.ke**

A modernized, high-converting web application for a premier Kenyan laundry & garment care business. Built with an ultra-clean UI, glassmorphic accents, micro-interactions, responsive mobile-first architecture, classical laundry physics animations, and interactive features customized specifically for **Kenyan urban clients and business operations**.

---

## 🇰🇪 Kenya-Specific Innovations & Features

### 1. 💰 Kenyan Currency (KSh / KES)
- All catalog pricing, bag loads, custom upgrades, and subscriptions are denominated in realistic Kenyan market rates:
  - **Everyday Wash & Fold**: Standard Bag (~12kg) at **KSh 850**, Mega Family Bag (~25kg) at **KSh 1,500**.
  - **Artisan Dry Cleaning**: Executive Dress Shirts / Blouses from **KSh 150**, 2-Piece Suits at **KSh 650**, Evening Gowns at **KSh 600**.
  - **Footwear Spa**: Sneaker Deep Clean at **KSh 500**, Luxury Designer Restoration at **KSh 950**.
  - **Bedding & Duvets**: King Comforters / Duvets at **KSh 900**.
  - **Monthly Subscriptions**: From **KSh 2,800/mo** for singles up to **KSh 8,500/mo** for full households.
  - **Guarantees**: **KSh 50,000 Zero-Loss Replacement Warranty** and **KSh 500 On-Time Delivery Credit**.

### 2. 📍 Live GPS Location & Direct Google Maps Navigation
- **For the Client**: In the 60-Second Booking Modal, the client taps **"Detect My Live GPS Location"** (`navigator.geolocation.getCurrentPosition`). The app locks high-accuracy GPS coordinates (e.g. `-1.2675, 36.8042`), displays a pinned badge, and captures exact gate/apartment details across Nairobi estates (Westlands, Kilimani, Lavington, Karen, Kileleshwa, South C, Ruaka, Roysambu, etc.).
- **For You as Admin / Driver**: In the **Admin Dispatch Hub**, every order features a direct **"🗺️ Navigate in Google Maps"** button that immediately launches Google Maps with turn-by-turn directions directly to the customer's gate or building entrance!

### 3. 📱 Customer Payment Credentials & M-Pesa STK Push on Return
- **Client Side**: During checkout, the client provides their **Full Name** and **Safaricom M-Pesa Phone Number** (e.g. `0712 345 678`) and chooses:
  - *"M-Pesa STK Push On Return (Recommended)"* — Pay safely only after clean clothes are delivered back to their door.
  - *"Lipa Na M-Pesa Buy Goods Till 541234 / Paybill 247247"*.
- **Admin Side ("Prompt Them on My Side")**:
  - The business owner / admin opens the **"Admin Dispatch & M-Pesa Hub"** (accessible from the header or mobile drawer).
  - Tap **"⚡ Prompt M-Pesa STK Push"** on any client order.
  - The system triggers the Safaricom Daraja STK Push workflow: sends a prompt to the customer's handset (`"Do you want to pay KSh X,XXX to TJ FABRIC CARE? Enter M-Pesa PIN:"`), validates the PIN entry, logs the unique M-Pesa reference (`QGH79XK21M`), and marks the order as **Paid via M-Pesa**.

---

## 🔒 Full HTTPS & Security Architecture

- **Canonical URL**: `https://tjfabriccare.co.ke`
- **Content Security Policy**: `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">` automatically promotes any insecure requests to secure HTTPS.
- **Open Graph & Twitter Cards**: Full SSL metadata for WhatsApp, Facebook, X/Twitter previews.
- **Schema.org Structured Data**: Verified HTTPS `DryCleaningOrLaundry` semantic schema for Google Search & Maps local SEO indexing.
- **Direct HTTPS integrations**:
  - Web WhatsApp: `https://wa.me/...`
  - Google Maps: `https://www.google.com/maps?...`
  - CDNs: Tailwind, Lucide, Canvas Confetti all served via HTTPS.

---

## 🫧 Classical Laundry Business Animations

1. **Floating & Popping Soap Bubbles (`js/bubbles.js`)**:
   - Iridescent, translucent soap bubbles continuously drift through the hero and background with realistic buoyancy and wobble.
   - Click or tap any bubble to pop it with a crisp Web Audio bubble pop synthesizer chime and multi-droplet particle splash!
2. **Vintage Swaying Clothesline with Wooden Pegs**:
   - Classical laundry aesthetic featuring a swaying overhead clothesline with vintage wooden clothespegs and drying garments responding to a gentle breeze.
3. **Interactive 3D Washing Machine Drum Simulator (`#washer-simulator` / `js/washer.js`)**:
   - Heavy chrome porthole door with reflective glass refraction and inner LED tub illumination.
   - Perforated stainless-steel drum that rotates with customizable spin speeds from **400 RPM to 1400 RPM**.
   - Sloshing blue water level physics, tumbling garments, dynamic suds foam, and live LED cycle countdown display.
   - 4 cycle presets: *Kenyan Cotton Eco (40°C)*, *Safari Wool & Silk (Cold)*, *Sneaker Ozone Disinfection*, and *Heavy Duvet Wash*.
   - Interactive controls: Cycle switcher, RPM drag slider, "Add Extra Suds 🫧" foaming button, and Start/Pause toggle with motor hum sounds.
4. **Interactive Steam Wrinkle-Eraser Canvas (`#wrinkle-eraser-section` / `js/wrinkle-eraser.js`)**:
   - Drag a virtual high-pressure steam iron across wrinkled cotton fabric to actively erase creases, trigger rising steam cloud puffs, and reveal crisp, hotel-grade pressed fabric.
   - Live smoothness counter (0% to 100%) with an instant "Re-Crumple Fabric" reset button.
5. **"The Lost Sock Matcher" Gamified Mini-Game (`#sock-game-modal` / `js/sock-game.js`)**:
   - A playful 6-card memory puzzle where users flip cards to pair colourful socks against a 20-second timer.
   - Winning reveals a secret **KSh 500 OFF** voucher (`SOCKMASTER500`) that auto-applies to the booking checkout and dynamic price calculator!

---

## 🌤️ Nairobi Weather-Adaptive Laundry Advisory

- Live real-time advisory banner customized for Nairobi weather:
  - Identifies morning mist, high outdoor humidity, and red Nairobi dust risks that cause balcony-dried clothes to smell damp or attract airborne dust.
  - Showcases TJ Fabric Care's closed-loop 6-Hour Moisture Extraction & Ozone Sterilization advantage.

---

## ✨ Full Suite of Core Website Features

- **Built-in Web Audio API Synthesizer**: Bubbly pops, clicks, motor hums, and melodic chimes with a header mute/unmute toggle.
- **Dynamic Price & Load Calculator (`#pricing-calculator`)**: Interactive item counters, scent choices (French Lavender, Nordic Birch, Amber & Santal), and promo codes (`FRESHFIRST`, `SOCKMASTER500`, `ECO10`).
- **Live RFID Order Journey Radar (`#order-tracker`)**: Track orders through 6 stages with electric boda/van telemetry, temperature control, and garment inventory manifest (`TJ-8821`, `TJ-4492`, `TJ-2104`).
- **Interactive Before & After Garment Revival Slider (`#before-after`)**: Draggable split-view slider comparing dirty/stained vs showroom-clean sneakers, vintage trench coats, and silk gowns.
- **Smart Care Label Decoder & Fabric Doctor (`#care-decoder`)**: Decodes tag symbols and provides immediate first-aid protocols for chai, red wine, coffee, grease, and ink spills.
- **Eco-Impact & Time Saved Dashboard (`#eco-impact`)**: Dynamic household slider showing clean water saved and days of life reclaimed.
- **Admin Orders & Dispatch Hub**: Dedicated portal displaying all incoming bookings, Google Maps links, customer WhatsApp links, and M-Pesa STK push dispatcher.

---

## 📁 Project Structure

```text
lumina-laundry-web/
├── index.html              # Main application page (TJ Fabric Care • HTTPS)
├── README.md               # Documentation & setup guide
├── css/
│   └── styles.css          # Glassmorphic styling, M-Pesa theme, 3D drum porthole, clothesline, steam
└── js/
    ├── app.js              # Audio synthesizer, toast alerts, mobile drawer, accordions
    ├── bubbles.js          # Interactive soap bubble generator & pop physics
    ├── washer.js           # 3D washing machine simulator, cycle selector & RPM controls
    ├── wrinkle-eraser.js   # Steam iron canvas scratch & wrinkle-removing simulation
    ├── sock-game.js        # "Lost Sock Matcher" mini-game modal with coupon unlocker
    ├── calculator.js       # Dynamic price & load calculator in KSh with sticky cart
    ├── tracker.js          # RFID order tracking radar & Nairobi courier telemetry
    ├── decoder.js          # Care label decoder matrix & fabric doctor stain guide
    ├── before-after.js     # Draggable before/after image comparison slider
    ├── eco-calculator.js   # Sustainability & time-saved calculations
    ├── admin.js            # Admin Orders & M-Pesa STK push dispatch portal
    └── booking.js          # 60-Second booking modal with live GPS & M-Pesa credentials
```

---

## 💻 How To Run

1. Open File Explorer and navigate to:
   `c:\Users\user\OneDrive\Desktop\lumina-laundry-web\`
2. Double-click **`index.html`** to open it directly in any web browser (Google Chrome, Microsoft Edge, Firefox, Safari, Brave).
3. **No server, Node.js, or installation required!** Everything runs immediately in the browser.
