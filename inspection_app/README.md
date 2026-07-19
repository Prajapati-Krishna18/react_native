# Smart Field Survey & Inspection App 👷‍♂️📐

A comprehensive, universal React Native mobile and web application built with **Expo SDK 54**, **Expo Router (file-based navigation)**, **Bottom Tabs**, and **Sidebar Drawer navigation**. 

This application serves as a high-fidelity digital tool for civil and geo-informatics surveyors to gather, validate, preview, and review field inspection logs.

---

## 📺 Project Video Demonstration
Watch the walkthrough and feature demonstration of this application on YouTube:
👉 **[Smart Field Survey App - YouTube Video Demo](https://www.youtube.com/watch?v=-auV2V02QtM)**

---

## 🌟 Key Features (Module-by-Module)

### Module 1 - Dashboard
*   **Custom App Header**: Royal blue premium layout with a drawer toggle, screen title, and profile quick links.
*   **Welcome Cards**: Displays surveyor details (Krish Surveyor, Roll No: 20BCE1023).
*   **Dynamic Stats**: Displays "Today's Surveys" and "Total Surveys" counts computed in real-time.
*   **Quick Actions Grid**: Fast navigation to New Survey, History, Camera, Location, Contacts, and Clipboard modules.
*   **Recent Logs**: Dynamic list rendering the 3 most recent survey submissions.

### Module 2 - Create Survey Form
*   **Inspection Inputs**: Form fields for Site Name, Client Name, Scheduled Date, and Description.
*   **Priority Selector**: Custom segmented pills (Low, Medium, High) with corresponding indicator styling.
*   **Form Validation**: Highlights missing required fields and alerts the user prior to previewing.
*   **Attachment indicators**: Displays real-time green badges when photos, GPS coordinates, contacts, or clipboard notes are attached to the draft.

### Module 3 - Camera API (`expo-camera`)
*   **Live Viewfinder**: Device camera viewport equipped with flash toggles, alignment grid overlays, and camera facing switches.
*   **Photo Preview**: Shows the captured snapshot overlayed with its precise capture date & time.
*   **Discard confirmations**: Triggers alert prompts before photo deletion.
*   **Simulator Fallback**: Implements HTML5 webcam streaming on Web browsers and auto-generates simulated construction site photographs when camera hardware is missing.

### Module 4 - Location API (`expo-location`)
*   **GPS Telemetry**: Dynamically queries GPS satellites to retrieve Latitude, Longitude, and accuracy coordinates in meters.
*   **Satellite refresh**: Fetches updated coordinates with activity loading spinners.
*   **Clipboard Copy**: Copies GPS coordinates with custom success indicators.
*   **Simulator Fallback**: Simulates coordinates within Delhi/NCR regions when running on emulators or web browsers.

### Module 5 - Contacts API (`expo-contacts`)
*   **Searchable Directory**: Fetches and lists device address book contacts.
*   **Dynamic filters**: Searches contacts by name or phone number in real-time.
*   **Colored Avatars**: Renders circular colored initials avatars.
*   **Refresh gesture**: Pull-to-refresh (`RefreshControl`) re-queries the address book.
*   **Copy number**: Quick copy shortcuts for phone numbers. Highlights missing numbers with "No Number Available" and disables linkage.

### Module 6 - Clipboard API (`expo-clipboard`)
*   **Data Copy Hub**: Copies generated Survey IDs, GPS coordinates, and contact numbers.
*   **Paste Comments**: Reads text from the device clipboard and pastes it directly into survey notes.
*   **Reset**: Resets clipboard contents to empty.

### Module 7 - Survey Preview & Submission
*   **Overview Panel**: Renders a compiled draft inspection card containing site data, attached photo, GPS coords, linked contact, and clipboard notes.
*   **Operational loops**: Toggle "Edit Survey" to return and adjust form fields, or click "Submit Survey" to save.

### Module 8 - Survey History
*   **Log Book**: FlatList rendering of all saved inspections showing priority colors, calendar dates, and attachment icons.
*   **Search & Filters**: Real-time query search and priority level filtering segments (All, Low, Medium, High).
*   **Detailed Modal**: Opens a full-page modal report displaying complete reports with image logs and copy actions.
*   **Delete records**: Trash icons with safety confirmation prompts to wipe logs from memory.

---

## 🛠️ Technology Stack & Core Concepts
*   **Core framework**: React Native, Expo SDK 54, TypeScript.
*   **Navigation**: Expo Router (Sidebar Drawer + Bottom Tabs).
*   **Database/Persistence**: React Context API (`SurveyContext`) synced with `@react-native-async-storage/async-storage` for local offline storage.
*   **Core Concepts Used**: `View`, `Text`, `Image`, `Button`, `Pressable`, `FlatList`, `ScrollView`, `TextInput`, `Alert`, `ActivityIndicator`, `RefreshControl`, `useState`, `useEffect`, `StyleSheet`.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Installation
Clone the repository and install the dependencies:
```bash
cd inspection_app
npm install
```

### 3. Run the Development Server
Start the Expo Metro Bundler:
```bash
npm start
```
*   **Run on Web**: Press **`w`** to open the app on your web browser.
*   **Run on Android**: Press **`a`** (requires Android Emulator or physical device with Expo Go).
*   **Run on iOS**: Press **`i`** (requires iOS Simulator or physical device with Expo Go).

### 4. Code Quality & Type Checks
To run the TypeScript compiler check:
```bash
npx tsc --noEmit
```
To run the linter:
```bash
npm run lint
```
