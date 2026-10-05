# SuperCalcee Mobile Setup & Usage Guide

SuperCalcee includes responsive mobile support, dynamic backend discovery, and Progressive Web App (PWA) capabilities. This guide explains how to run and use SuperCalcee on your smartphone or tablet.

---

## 1. How SuperCalcee Works on Mobile

SuperCalcee operates on a decoupled client-server architecture:
* **Mobile Client:** The React 19 interface features responsive breakpoints (`<= 840px`), touch-optimized keypad layouts, slide-out navigation drawers, and PWA standalone display.
* **Scientific Core:** The Python FastAPI server runs either **on your local workstation (via Wi-Fi LAN)** or **hosted on a cloud server**.

---

## 2. Quick Start: Use on Your Mobile via Wi-Fi (Local Network)

You can immediately use SuperCalcee on your phone without installing any mobile app stores by connecting both your PC and phone to the same Wi-Fi network.

### Step 1: Find Your Computer's Local IP Address
On your workstation (Windows PowerShell):
```powershell
ipconfig
```
Look for **IPv4 Address** under your active Wi-Fi or Ethernet adapter (for example: `192.168.1.50`).

### Step 2: Start the Python Backend for LAN Access
Open Terminal 1:
```powershell
# From repository root (venv activated)
npm run backend:lan
```
*This starts the FastAPI server bound to `0.0.0.0:8000`, making it accessible to devices on your local network.*

### Step 3: Start the Frontend Dev Server for LAN Access
Open Terminal 2:
```powershell
# From repository root
npm run dev:lan
```
Vite will output:
```text
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.50:5173/
```

### Step 4: Open on Your Mobile Phone
1. Ensure your smartphone is connected to the **same Wi-Fi network**.
2. Open Safari (iOS) or Chrome (Android).
3. Navigate to:
   ```text
   http://192.168.1.50:5173
   ```
   *(replace `192.168.1.50` with your actual IPv4 address from Step 1)*.
4. The client will automatically detect your host IP and connect to `http://192.168.1.50:8000`. You can perform scientific calculations, symbolic CAS, and domain computations directly on your phone!

---

## 3. Switching / Configuring Backend Server in the Mobile UI

SuperCalcee includes an in-app server configuration utility:

1. In the top bar, tap the **Server** button (or **Change Server** if the core is offline).
2. Enter your backend host:
   * **For Local Wi-Fi:** `http://192.168.1.50:8000`
   * **For Cloud Deployed:** `https://api.yourdomain.com`
3. Tap **Save & Connect**.
4. The address is saved to your phone's browser storage (`localStorage`) and will persist across sessions.

---

## 4. Install as a Progressive Web App (PWA) Full-Screen App

You can install SuperCalcee directly to your mobile home screen so it opens like a native app without browser bars:

### On iOS (iPhone / iPad - Safari):
1. Open SuperCalcee in **Safari**.
2. Tap the **Share** button (box with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add** in the top-right corner.
5. Tap the new **SuperCalcee** icon on your home screen to launch in standalone full-screen mode.

### On Android (Chrome):
1. Open SuperCalcee in **Google Chrome**.
2. Tap the **Three Dots (Menu)** in the top-right.
3. Tap **Install app** or **Add to Home screen**.
4. Follow the on-screen prompt to complete installation.

---

## 5. Converting to Native Mobile Package (Capacitor / Android Studio / Xcode)

If you require an `.apk` (Android) or `.ipa` (iOS) package for distribution:

1. Inside `src_electron`:
   ```bash
   cd src_electron
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
   npx cap init SuperCalcee com.supercalcee.app --web-dir=dist
   ```

2. Build static frontend assets pointing to your cloud backend:
   ```bash
   # Set cloud backend API URL in .env.production
   npm run build
   ```

3. Add mobile platforms:
   ```bash
   npx cap add android
   npx cap add ios
   ```

4. Sync assets and launch in IDE:
   ```bash
   npx cap sync
   npx cap open android   # Opens Android Studio to generate APK / AAB
   npx cap open ios       # Opens Xcode on macOS to build IPA
   ```

> [!IMPORTANT]
> Because SymPy and numerical libraries require Python runtime environments, native mobile wrappers must consume a hosted FastAPI backend API URL over HTTPS.
