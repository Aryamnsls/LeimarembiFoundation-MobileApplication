# 🏛️ Leimarembi Foundation - Official Mobile Application

**Pure Production-Ready Cross-Platform Mobile Application for Android & iOS**  
Govt. Registered Public Charitable Trust | NITI Aayog NGO Darpan ID: `AS/2023/034291` | 80G & 12A Certified  
Official Production Portal: [https://leimarembifoundation.org](https://leimarembifoundation.org)  
GitHub Repository: [https://github.com/Aryamnsls/LeimarembiFoundation-MobileApplication.git](https://github.com/Aryamnsls/LeimarembiFoundation-MobileApplication.git)

---

## 🌟 Executive Summary & What's New

The Leimarembi Foundation Mobile Application has been engineered into a **pure production-ready native mobile app** delivering seamless community management, executive directory access, welfare schemes, and 1-tap charitable donations.

### 🚀 Key Production Upgrades

1. **100% Fluid Mobile Responsiveness & Edge-to-Edge Design**
   - **Device Selector Removed:** Eliminated the legacy "Select Device" developer barrier; the app now launches directly with a branded 1-second emerald & gold splash fade animation.
   - **Fluid Viewport:** Enforces `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">`. No fixed-width 412px constraints, no side clipping, and no horizontal scrollbars on any smartphone (360px–440px+).
   - **Edge-to-Edge Safe Area:** Fully accounts for status bar notches, punch-hole cameras, and Android navigation gesture pills.
   - **Native Branded Top Header:** Official green emblem, title, language switch (`🌐 EN / ꯃꯤ`), reload (`🔄`), and native share dialog (`📤`).
   - **Native 5-Tab Bottom Bar:** Instant thumb access to **Home** (`🏛️`), **Schemes** (`📜`), **Donate** (`💚`), **Directory** (`👥`), and **Portal** (`👤`).

2. **Fixed Registration Bugs & Show/Hide Password Toggle**
   - **State Isolation:** Isolated `showLoginPassword` and `showRegisterPassword` so toggling visibility in one form never affects the other.
   - **Accessible Eye Toggle:** Minimum 44×44px touch-friendly hit areas with `Eye` / `EyeOff` icons for effortless password verification on touchscreens.
   - **Seamless Flow:** Pre-fills credentials upon registration so members can verify and check their password with 1 tap before signing in.
   - **Dual-Layer Injection:** Form enhancements are built directly into the web codebase AND dynamically reinforced via the native WebView JavaScript injector, guaranteeing 100% reliability regardless of network caching.

3. **Real-Time Password Strength Meter (Weak, Medium, Strong)**
   - **Visual 3-Segment Progress Bar:** Changes dynamically in real time as the user types.
   - **Color-Coded Status Badges:**
     - 🔴 **WEAK** (`#EF4444`): Score 0–2 (< 8 characters or single character type).
     - 🟠 **MEDIUM** (`#F59E0B`): Score 3–4 (Good length and mixed character types).
     - 🟢 **STRONG** (`#10B981`): Score 5 (8+ characters, uppercase letter, number, and special symbol).
   - **Real-Time Checklist Chips:** Visual indicator pills that turn emerald green with checkmarks (`✓ 8+ Chars`, `✓ Uppercase`, `✓ Number`, `✓ Symbol`).

4. **Embedded SQLite Database (`expo-sqlite`) for Offline Resilience**
   - Integrated native SQLite database (`leimarembi_foundation.db`) providing zero-latency offline access.
   - Two-way communication bridge via `ReactNativeWebView.postMessage` to synchronize registrations, logins, and donation receipts directly to SQLite.
   - Pre-seeded with the **15 Official Executive Officers & Committee Members** so the foundation directory can be browsed without internet access.

5. **Official Branding & Android Adaptive Icons**
   - Replaced all default Expo icons across all 5 Android screen densities (`mipmap-mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`).
   - Android Adaptive Icon safe-zone compliant (66% circle diameter) for perfect display on Samsung OneUI, Google Pixel, OnePlus, Xiaomi, and stock launchers.
   - Multi-ABI Android compilation support (`armeabi-v7a`, `arm64-v8a`, `x86_64`) for both physical smartphones and Android Studio emulators.

---

## 🗄️ SQLite Database Architecture (`expo-sqlite`)

The mobile application persists data locally in `leimarembi_foundation.db` via `src/services/database.ts`:

```
┌─────────────────────────────────────────────────────────────┐
│                 LEIMAREMBI SQLITE DATABASE                  │
├─────────────────────────────────────────────────────────────┤
│  users             │ User profiles, credentials, blood type │
│  cached_members    │ 15 Pre-seeded Executive Officers       │
│  donations         │ Offline receipts & 80G tax exemptions  │
│  schemes           │ Welfare schemes & grant catalog        │
│  app_settings      │ Key-value configuration & preferences  │
│  activity_logs     │ Local audit trail & telemetry          │
└─────────────────────────────────────────────────────────────┘
```

### Table Schemas

#### 1. `users` Table
| Column | Type | Description |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | Unique User UUID (`usr_...`) |
| `name` | `TEXT NOT NULL` | Full Name of Member |
| `email` | `TEXT UNIQUE` | Official Member Email |
| `phone` | `TEXT` | Contact Phone Number |
| `address` | `TEXT` | Residential Address in Manipur |
| `blood_group` | `TEXT` | Blood Group (A+, B+, O+, AB+, etc.) |
| `is_senior_citizen` | `INTEGER` | 1 if 60+ Years (Free Health Card), 0 otherwise |
| `family_members_count` | `INTEGER` | Dependent Family Member Count |
| `membership_no` | `TEXT UNIQUE` | Official ID (`LF-2026-XXXX`) |
| `role` | `TEXT` | `MEMBER`, `ADMIN`, or `SUPER_ADMIN` |
| `designation` | `TEXT` | Foundation Designation |
| `password_hash` | `TEXT` | Offline Password Hash / Salt |
| `auth_provider` | `TEXT` | `LOCAL` or `GOOGLE` |
| `created_at` | `TEXT` | ISO 8601 Timestamp |
| `updated_at` | `TEXT` | ISO 8601 Timestamp |

#### 2. `cached_members` Table (Pre-Seeded 15 Executive Officers)
1. **M. Tombi Babu Singha** - President (`LF-EXEC-001`)
2. **K. Khogendra Singha** - Vice-Chairman (`LF-EXEC-002`)
3. **L. Bira Babu Singha** - Managing Director (`LF-EXEC-003`)
4. **M. Bina Babu Singha** - Super Administrator & Founder (`LF-EXEC-004`)
5. **M. Nilamani Singha** - General Secretary (`LF-EXEC-005`)
6. **M. Babu Singha** - Joint Secretary (`LF-EXEC-006`)
7. **K. Brojendro Singha** - Treasurer (`LF-EXEC-007`)
8. **M. Mangi Babu Singha** - Executive Member (`LF-EXEC-008`)
9. **K. Mani Singha** - Executive Member (`LF-EXEC-009`)
10. **K. Sarat Singha** - Executive Member (`LF-EXEC-010`)
11. **L. Mohan Singha** - Executive Member (`LF-EXEC-011`)
12. **L. Ibohal Singha** - Executive Member (`LF-EXEC-012`)
13. **S. Goura Singha** - Executive Member (`LF-EXEC-013`)
14. **M. Brajamani Singha** - Executive Member (`LF-EXEC-014`)
15. **Aryaman Singha** - IT Director & Super Admin (`LF-SA-001`)

#### 3. `donations` Table
Records charitable contributions with 80G tax-exemption metadata, reference IDs, and receipt numbers offline.

#### 4. `activity_logs` Table
Maintains a local audit trail (`APP_LAUNCH`, `USER_SAVED`, `DONATION_SAVED`, `DB_INIT`) for diagnostics and accountability.

---

## 🔒 Password Strength Evaluator Specifications

The password validation logic enforces bank-grade security standards during registration:

```typescript
function evaluatePassword(password: string) {
  // Evaluates Length (>=8), Uppercase ([A-Z]), Numbers ([0-9]), Symbols ([^A-Za-z0-9])
  // Score 0-2  => WEAK   (#EF4444) -> Requires uppercase, number & symbol
  // Score 3-4  => MEDIUM (#F59E0B) -> Good base; add special symbols
  // Score 5    => STRONG (#10B981) -> High-security production grade
}
```

---

## 📁 Repository Structure

```
LeimarembiFoundation-MobileApplication/
├── android/                         # Prebuilt Native Android Project
│   ├── app/                         # Native Kotlin module & manifests
│   │   └── src/main/res/
│   │       ├── mipmap-mdpi/         # Official Leimarembi Icons (48x48)
│   │       ├── mipmap-hdpi/         # Official Leimarembi Icons (72x72)
│   │       ├── mipmap-xhdpi/        # Official Leimarembi Icons (96x96)
│   │       ├── mipmap-xxhdpi/       # Official Leimarembi Icons (144x144)
│   │       └── mipmap-xxxhdpi/      # Official Leimarembi Icons (192x192)
│   ├── gradle.properties            # reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86_64
│   └── gradlew.bat                  # Gradle Wrapper
├── src/
│   ├── app/
│   │   ├── index.tsx                # Main Screen (Fluid Viewport, Header, 5 Tabs, SQLite Sync)
│   │   └── _layout.tsx              # Root Layout & Safe Area Setup
│   ├── services/
│   │   └── database.ts              # SQLite Service (expo-sqlite tables, seeding, sync)
│   ├── components/                  # UI components
│   └── constants/                   # Brand tokens & themes
├── assets/
│   └── images/                      # Official logo & adaptive icon PNGs
├── app.json                         # Expo configuration (Package: org.leimarembifoundation.mobile)
├── package.json                     # Node dependencies (expo-sqlite ~57.0.4, react-native 0.86)
├── LeimarembiFoundation-Release.apk  # Ready-to-install standalone Android Release APK
├── INSTALL_TO_EMULATOR.bat          # 1-Click install to running emulator / phone
├── RUN_APP.bat                      # 1-Click Metro development launcher
└── README.md                        # Documentation
```

---

## 📲 How to Install & Run

### 1. Ready-to-Install Standalone Release APK
You do NOT need a PC or development tools to install and test the release build:
- **Root Shortcut File:** `LeimarembiFoundation-Release.apk` (~87.1 MB)
- **Standard Gradle Output:** `android/app/build/outputs/apk/release/app-release.apk`
- **Native Multi-Architecture ABIs:** `armeabi-v7a`, `arm64-v8a`, `x86_64` (universal compatibility with all physical smartphones and PC emulators)
- **Embedded Engine:** Built-in offline SQLite database (`expo-sqlite`), zero-dependency standalone bundling.

1. Locate **`LeimarembiFoundation-Release.apk`** in the project root.
2. Send it to any Android device via WhatsApp, Google Drive, USB, or local share.
3. Tap on the APK file on your phone and tap **Install** (allow *"Install unknown apps"* if prompted).
4. The app icon will display the official dark green Leimarembi Foundation emblem with the title **Leimarembi Foundation**.

### 2. Install directly to Connected Device or Emulator via ADB
```powershell
cd D:\LeimarembiFoundation-MobileApplication
.\INSTALL_TO_EMULATOR.bat
```

### 3. Local Development Mode
```powershell
cd D:\LeimarembiFoundation-MobileApplication
npx expo start -c
```
- Press **`a`** to open on Android Emulator.
- Press **`w`** to open web preview.

---

## 💡 Production Architecture Recommendations

To continue expanding this application into an enterprise-grade public charity platform, here are key recommendations:

1. **Biometric Authentication (`expo-local-authentication`):**
   - Allow members and executive officers to sign in instantly via Fingerprint or Face Unlock after their initial login.
2. **Offline Digital Identity Cards:**
   - Generate offline laminated digital membership cards with QR codes and member photos stored in SQLite so members can present their ID even in zero-connectivity areas.
3. **Background Sync (`expo-background-fetch` / `expo-task-manager`):**
   - Automatically push pending offline donation records or health assistance requests to the backend as soon as internet connectivity is restored.
4. **Push Notifications for Urgent Welfare Alerts:**
   - Integrate Firebase Cloud Messaging (FCM) to broadcast relief notices, meeting announcements, and health camp alerts directly to members' notification bars.
5. **App Store & Play Store Deployment Pipeline:**
   - Configure Fastlane or GitHub Actions CI/CD to automatically sign and bundle Android App Bundles (`.aab`) for Google Play Store release.

---

## 📜 Legal & Trust Verification

- **Trust Name:** Leimarembi Foundation
- **Govt. Registration:** Public Charitable Trust Act
- **NITI Aayog NGO Darpan:** `AS/2023/034291`
- **Income Tax Exemption:** 80G & 12A Certified
- **Official Portal:** [https://leimarembifoundation.org](https://leimarembifoundation.org)
- **Primary Mission:** Socio-economic development, women empowerment, cultural preservation, youth scholarships, and healthcare initiatives for the Manipuri community.
