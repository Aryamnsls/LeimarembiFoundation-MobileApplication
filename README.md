# Leimarembi Foundation - Official Mobile Application
**Bespoke Cross-Platform Native Mobile Suite for Android & iOS**

This repository contains the dedicated, mobile-optimized application codebase for **Leimarembi Foundation** (Govt. Registered Public Charitable Trust | NITI Aayog NGO Darpan: `AS/2023/034291` | 80G & 12A Certified).

Unlike a desktop website or simple WebView wrapper, this mobile application features a **bespoke, luxury dark-theme mobile UI (`#070A13`) tailored specifically to smartphone aspect ratios (19.5:9 / 20:9)**, with native bottom tab navigation, tactile card ergonomics, fast offline resilience, and direct device API integrations for both **Android** and **iOS**.

---

## 📱 Mobile-First Features & Unique Architecture

### 1. 🏠 Executive Home Feed
- **VIP Digital Keyring Pass**: Interactive membership and executive pass with live verification badge and QR code generator for event entry and identity check-in.
- **Live Impact Carousel**: Real-time welfare statistics (₹42.5L+ facilitated grants, 12,450+ beneficiaries supported, 15 governing leaders, 100% tax exemption).
- **8-Matrix Mobile Operations Hub**: Fast 1-tap shortcuts for UPI Donations, AI Grants Finder, 15 Executive Leaders Roster, Manipuri Heritage, Document Vault, Council Meetings, Northeast News Hub, and Health Camps.

### 2. 🤖 AI Scheme & Welfare Grants Finder
- Interactive grant category selector: **Senior Citizen Welfare**, **Cultural Preservation**, **Youth Sports (Kabaddi)**, **Rural Women Weaving**, and **Mobile Tele-Health**.
- Real-time search by ministry, scheme name, or keyword.
- Clear eligibility criteria, grant allocation amounts, and 1-tap application flow.

### 3. 🪕 Manipuri Indigenous Cultural Heritage
- **Traditional Music & Pena**: Authentic folk ballads (Lai Haraoba Ritual Chant, Khamba Thoibi Ballad, Ancient Kangleipak melodies) with instant video/audio links.
- **Sacred Dance & Rituals**: Sacred traditions of Umang Lai and classical Manipuri Ras Leela.
- **Indigenous Cuisine**: Authentic Meitei recipes (Singju, Chak-hao Kheer, Kanghou, and Eromba) with health benefits and culinary heritage.

### 4. 👥 15 Executive Office Bearers Roster & Vault
- **Complete 15 Leaders Directory**: Full profiles for President Dr. Phuritsabam Birmani, Vice-Chairman K. Ajit Singh, MD Y. Thambal Singha, Secretary M. Bina Babu Singha, Treasurer Ng. Baldev Singha, and all executive council members.
- **Interactive Profile Modals**: Tap any leader to inspect their background, area of responsibility, and direct email buttons.
- **High-Security Document Vault**: Instant access to Trust Deed, 80G Approval, 12A Certificate, NITI Aayog Darpan filing, and audited financial statements.

### 5. 💳 Instant High-Conversion UPI Giving Gateway
- **1-Tap Direct UPI Payment Intent**: Launches user's installed Google Pay, PhonePe, Paytm, BHIM, or Cred app directly with pre-filled foundation VPA (`leimarembifoundation@sbi`).
- **Quick Preset Chips**: Instant selection for ₹100, ₹500, ₹1,000, ₹2,500, and ₹5,000 or custom amount.
- **Section 80G Tax Exemption**: Formal receipt details form with donor PAN and name.
- **Wire Transfer Details**: Full State Bank of India (SBI) account details and IFSC code.

---

## 📂 Repository Structure

```
LeimarembiFoundation-MobileApplication/
├── android/                   # React Native & Expo Prebuilt Native Android Project
│   ├── app/                   # App module with native Kotlin code, manifest, icons
│   ├── build.gradle           # Root Gradle build configuration
│   └── gradlew.bat            # Gradle wrapper executable
├── android-native-app/        # Alternative Capacitor Native Android Studio workspace
├── ios-native-app/            # Native iOS Xcode workspace (App.xcworkspace)
├── src/
│   ├── app/
│   │   ├── index.tsx          # Main Bespoke Native Mobile App (5 Tabs, Modals, UPI Engine)
│   │   └── _layout.tsx        # Expo Router layout & Safe Area configuration
│   ├── components/            # Reusable UI cards, icons, and theme primitives
│   └── constants/             # Design tokens & color system
├── assets/                    # Foundation logos, splash screens, and adaptive app icons
├── app.json                   # Application configuration (Package: org.leimarembifoundation.mobile)
├── package.json               # Node.js dependencies
└── PUSH_TO_GITHUB.bat         # 1-Click interactive script to upload code to GitHub
```

---

## 🚀 How to Run in Android Studio

1. Open **Android Studio**.
2. Click **File → Open...** and select:
   ```
   D:\LeimarembiFoundation-MobileApplication\android
   ```
3. Let Gradle complete sync automatically.
4. Select your emulator (e.g. **Pixel 9 Pro API 37.1**) or connected USB device.
5. Click **Run (Play)** or press `Shift + F10`.

---

## 🚀 How to Push to GitHub

Double-click **`PUSH_TO_GITHUB.bat`** on your Desktop or run:
```powershell
cd D:\LeimarembiFoundation-MobileApplication
git push -u origin main
```
Authorize in your browser when prompted, and your GitHub repository at:
👉 **https://github.com/Aryamnsls/LeimarembiFoundation-MobileApplication**
will immediately update with all mobile files!
