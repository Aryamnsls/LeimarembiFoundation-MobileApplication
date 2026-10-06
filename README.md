# Leimarembi Foundation - Official Mobile Application
**Official Cross-Platform Mobile Application for Android & iOS**

This repository contains the official mobile application codebase for **Leimarembi Foundation** (Govt. Registered Public Charitable Trust | NITI Aayog NGO Darpan: `AS/2023/034291` | 80G & 12A Certified).

It provides the complete, authentic live production platform (`https://leimarembifoundation.org/`) rendered in **100% native mobile view mode**, perfectly fitted to smartphone screen aspect ratios with zero desktop zooming or horizontal overflow.

---

## 📱 Features

- **Exact Production Platform**: Loads the live, official website `https://leimarembifoundation.org/` with all 24 foundation modules, real-time database, live news, and meeting portals.
- **Perfect Native Mobile View Mode**:
  - `scalesPageToFit={false}`: Guarantees zero desktop zoom-out.
  - Native mobile viewport injection (`width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`).
  - Mobile User Agent integration for both Android and iOS.
  - Full Safe Area Inset support (status bar, dynamic island, navigation bar).
- **Native Android Hardware Back Support**: Pressing the Android back button seamlessly navigates backward through the website history.
- **Fast Pull-To-Refresh**: Native swipe-down refresh to reload the latest production updates.
- **Cross-Platform**: Ready to run on both **Android** (phones & tablets) and **iOS** (iPhone & iPad).

---

## 📂 Repository Structure

```
LeimarembiFoundation-MobileApplication/
├── android/                   # React Native & Expo Prebuilt Native Android Project
│   ├── app/                   # App module with native Kotlin code, manifest, icons
│   ├── build.gradle           # Root Gradle build configuration
│   └── gradlew.bat            # Gradle wrapper executable
├── android-native-app/        # Capacitor Native Android Studio workspace
├── ios-native-app/            # Native iOS Xcode workspace (App.xcworkspace)
├── src/
│   ├── app/
│   │   ├── index.tsx          # Mobile App WebView Screen (Perfect Mobile View Mode)
│   │   └── _layout.tsx        # Expo Router layout & Safe Area configuration
│   ├── components/            # Reusable UI components
│   └── constants/             # Design tokens & color system
├── assets/                    # Foundation logos, splash screens, and adaptive app icons
├── app.json                   # Application configuration (Package: org.leimarembifoundation.mobile)
├── package.json               # Node.js dependencies
├── PUSH_TO_GITHUB.bat         # 1-Click interactive script to upload code to GitHub
└── RUN_APP.bat                # 1-Click launcher for local testing
```

---

## 🚀 How to Run the App

### Option 1: 1-Click Launcher (Desktop)
Double-click **`RUN_APP.bat`** on your Desktop, then:
- Press **`w`** to open in your browser.
- Press **`a`** to open on your connected Android emulator.

### Option 2: Run via Terminal
```powershell
cd D:\LeimarembiFoundation-MobileApplication
npx expo start
```
Then press **`w`** for web preview or **`a`** for Android.

---

## 🚀 How to Push to GitHub

Double-click **`PUSH_TO_GITHUB.bat`** on your Desktop or run:
```powershell
cd D:\LeimarembiFoundation-MobileApplication
git push -u origin main
```
