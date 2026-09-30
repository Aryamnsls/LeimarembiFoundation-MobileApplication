# Leimarembi Foundation - Official Mobile Application
**Cross-Platform Android & iOS Mobile Suite for Leimarembi Foundation**

This repository contains the official mobile application codebase for **Leimarembi Foundation**, providing an exact, seamless clone of the production website and digital governance suite.

---

## 📱 Features

- **Full Digital Governance Platform**: Complete access to all 24 foundation modules (Services Portal, Executive Meetings & Video Suite, High-Security Documents Vault, 15 Executive Office Bearers Roster, Northeast News Hub, Government Welfare Grants & AI Scheme Finder, Manipuri Cultural Heritage, Media Gallery, and Official UPI Donations).
- **Executive QR Gateway Integration**: Seamless Keyring Access Card, 300 DPI high-resolution printable cards, and instant verification.
- **Cross-Platform**: Tested and optimized for both **Android** (phones & tablets) and **iOS** (iPhone & iPad).
- **Native Android Studio Ready**: Fully configured Gradle project that syncs and runs in Android Studio with 1 click.
- **Offline Resilience & Fast Navigation**: Dedicated top navigation bar (Back, Forward, Refresh, Share, Home), dark theme status bar, and automated retry on network interruptions.

---

## 📂 Repository Structure

```
LeimarembiFoundation-MobileApplication/
├── android-native-app/        # Ready-to-run Android Studio project (Capacitor Native Engine)
│   ├── app/                   # Android app module with manifest, icons, resources
│   ├── build.gradle           # Root Gradle build configuration
│   └── gradlew.bat            # Gradle wrapper executable
├── ios-native-app/            # Ready-to-run iOS Xcode workspace (App.xcworkspace)
│   └── App/                   # iOS native code, Info.plist, assets
├── src/                       # React Native application source code
│   ├── app/                   # Expo Router screens (index.tsx website clone, _layout.tsx)
│   ├── components/            # Reusable UI components & native cards
│   ├── constants/             # Design tokens & color scheme
│   └── hooks/                 # Native device hooks
├── assets/                    # Official logos, splash screens, and adaptive icons
├── app.json                   # Expo application configuration (Package: org.leimarembifoundation.mobile)
└── package.json               # Node.js dependencies & execution scripts
```

---

## 🚀 How to Run in Android Studio

### Step 1: Open the Project in Android Studio
1. Launch **Android Studio**.
2. Click **File → Open...** (or select **Open** from the welcome screen).
3. Browse to and select this folder:
   ```
   D:\LeimarembiFoundation-MobileApplication\android-native-app
   ```
   *(Ensure you select the `android-native-app` folder directly, not the root)*
4. Click **OK** (choose **This Window**).

### Step 2: Automatic Gradle Sync
- Android Studio will automatically index the project and sync dependencies via Gradle.
- Once sync finishes, the top run configuration automatically selects **`app`** (instead of `Add Config...`).

### Step 3: Run on Emulator or Physical Device
1. Select your target device (e.g. **Pixel 9 Pro API 37.1** or your USB-connected physical phone).
2. Click the green **Run (Play)** button (or press `Shift + F10`).
3. The app compiles and installs directly onto the device.

---

## ⚡ How to Run via React Native / Expo

If you prefer using Expo CLI for rapid development:

```powershell
# 1. Navigate to the repository
cd D:\LeimarembiFoundation-MobileApplication

# 2. Start the Metro bundler
npm start

# 3. Choose your platform:
#    Press 'a' -> Open on connected Android device / emulator
#    Press 'i' -> Open on iOS simulator (macOS required)
#    Press 'w' -> Open web preview
```

### Pre-export Bundles (Verified)
The mobile bundles have been verified with 0 errors:
- **Android**: `_expo/static/js/android/entry-*.js` (2.6 MB)
- **iOS**: `_expo/static/js/ios/entry-*.js` (2.5 MB)

---

## 🛠️ Building Standalone APK / AAB for Android

### Build Debug APK (CLI):
```powershell
cd D:\LeimarembiFoundation-MobileApplication\android-native-app
.\gradlew.bat assembleDebug
```
The output APK is generated at:
`android-native-app/app/build/outputs/apk/debug/app-debug.apk`

### Install onto Connected Device:
```powershell
adb install -r android-native-app/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🍎 Building for iOS (Xcode)

1. Open `ios-native-app/App.xcworkspace` in **Xcode** on macOS.
2. Select your development team under **Signing & Capabilities**.
3. Select any iPhone simulator or connected iOS device.
4. Press `Cmd + R` to build and run.

---

## 🔗 Connecting to a New GitHub Repository

To push this dedicated mobile codebase to a new remote repository:

```powershell
cd D:\LeimarembiFoundation-MobileApplication

# Initialize git (if not already initialized)
git init
git add .
git commit -m "feat: initial commit for Leimarembi Foundation Mobile Application"

# Link to your new remote repository
git remote add origin https://github.com/YOUR_USERNAME/LeimarembiFoundation-MobileApplication.git
git branch -M main
git push -u origin main
```

---

## 🛡️ Isolation Note
This repository is completely independent from the production website repository. Any updates, styling adjustments, or mobile features should be committed directly to this repository. The production website codebase remains untouched.
