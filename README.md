# Yuva Shakti Cup Fulbaria - Player Registration Setup Guide

This guide explains how to connect your registration form to a Google Sheet database and Google Drive folder using a simple, secure, and free Google Apps Script web app.

---

## 🛠️ Step-by-Step Setup Instructions

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.google.com/) and click **Blank spreadsheet** to create a new sheet.
2. Rename the spreadsheet to something recognizable, like `Yuva Shakti Cup Fulbaria Registrations`.
3. Keep the default sheet name (`Sheet1`) or name it as you prefer.

### Step 2: Open the Apps Script Editor
1. In your newly created Google Sheet, click **Extensions** in the top menu bar.
2. Select **Apps Script** from the dropdown menu. This opens a code editor in a new browser tab.

### Step 3: Paste the Backend Script
1. Delete any boilerplate code (like `function myFunction() { ... }`) that is already inside the Apps Script editor.
2. Open the file [google_apps_script.js](file:///c:/Users/HP/Desktop/form/google_apps_script.js) in your local folder.
3. Copy all of the code and paste it directly into the Google Apps Script editor.
4. Click the **Save** icon (floppy disk) at the top or press `Ctrl + S`.

### Step 4: Deploy the Script as a Web App
1. Click the blue **Deploy** button in the top right corner of the Apps Script interface.
2. Select **New deployment** from the menu.
3. Click the gear icon next to "Select type" and select **Web app**.
4. Configure the settings exactly as follows:
   * **Description:** `Yuva Shakti Cup Registration API`
   * **Execute as:** `Me (your-email@gmail.com)`
   * **Who has access:** `Anyone` *(Note: This allows the form to securely upload registrations without requiring players to log in to Google).*
5. Click the blue **Deploy** button.
6. A dialog box will appear asking for permissions. Click **Authorize access**.
7. Select your Google account and grant the requested permissions to the script. *(Note: If you see an "Advanced" warning screen, click "Advanced" and then click "Go to Untitled project (unsafe)" or similar to proceed).*
8. Once the deployment finishes, copy the **Web app URL** provided under the Web App heading. It should look like this:
   `https://script.google.com/macros/s/AKfycb.../exec`

### Step 5: Update the Frontend JavaScript
1. Open the [app.js](file:///c:/Users/HP/Desktop/form/app.js) file in your editor.
2. Look for the configuration line at the top:
   ```javascript
   const WEB_APP_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
   ```
3. Replace the placeholder text with your copied Google Web App URL. Save the file.

---

## 📁 What Happens Behind the Scenes?
When a player fills out the form and clicks **Submit Registration**:
1. The frontend validation checks that the full name, 10-digit mobile number, address, player skill, photograph, and payment screenshot are provided correctly.
2. The browser converts both uploaded images into a base64-encoded text format.
3. A `POST` request containing all player details and files is sent to your deployed Web App URL.
4. The Apps Script automatically creates a folder named `Yuva Shakti Cup Fulbaria` in your Google Drive.
5. It creates two subfolders inside: `Player Photographs` and `Payment Screenshots`.
6. It uploads the images, makes them publicly viewable (anyone with the link can view), and retrieves their direct links.
7. Finally, it appends a new row containing all information and image links to the Google Sheet.
