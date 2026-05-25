/**
 * Google Apps Script (doPost) for Cricket Tournament Registration Form
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Open the Google Sheet where you want to store the registration data.
 * 2. In the top menu, click on "Extensions" > "Apps Script".
 * 3. Delete any code in the editor and paste this code.
 * 4. Update the `TARGET_FOLDER_ID` configuration variable below with your specific Google Drive Folder ID.
 *    (If left empty, the script will automatically create/use a folder named "Cricket Tournament Registrations" in your Drive root).
 * 5. Click the "Save" (disk) icon or press Ctrl + S.
 * 6. Click on "Deploy" > "New deployment" (top-right).
 * 7. Click the gear icon (Configuration type) next to "Select type" and choose "Web app".
 * 8. Set the following settings:
 *    - Description: "Cricket Tournament Registration Backend"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone" (this is CRITICAL so the web form can send data without authentication)
 * 9. Click "Deploy".
 * 10. Authorize the permissions (click "Review permissions", select your account, click "Advanced", and "Go to... (unsafe)" to grant access to Drive and Sheets).
 * 11. Copy the "Web app URL" provided in the deployment confirmation modal.
 * 12. Paste that URL into the `WEB_APP_URL` variable in your frontend `app.js` file.
 */

// ==========================================
// 🔗 CONFIGURATION: SPECIFIC GOOGLE DRIVE FOLDER ID
// ==========================================
// Copy the ID of your target folder from its Google Drive URL.
// Example: https://drive.google.com/drive/folders/1A2B3C4D5E... -> ID is "1A2B3C4D5E..."
// Leave empty ("") if you want the script to auto-generate a folder named "Cricket Tournament Registrations" in your Drive root.
const TARGET_FOLDER_ID = "YOUR_SPECIFIC_GOOGLE_DRIVE_FOLDER_ID_HERE";

/**
 * Handle incoming POST requests from the HTML form
 */
function doPost(e) {
  try {
    // Parse the incoming JSON payload sent from the form
    var data = JSON.parse(e.postData.contents);
    
    var name = data.name;
    var mobile = data.mobile;
    var address = data.address;
    var skill = data.skill;
    
    var photoData = data.photo;         // Contains { base64, mimeType, filename }
    var screenshotData = data.screenshot; // Contains { base64, mimeType, filename }
    
    // 1. Resolve/Retrieve the target upload folder on Google Drive
    var folder = getFolder();
    
    // 2. Upload Player Photograph (if provided)
    var photoUrl = "";
    if (photoData && photoData.base64) {
      photoUrl = uploadFileToDrive(photoData, folder);
    }
    
    // 3. Upload Payment Screenshot (if provided)
    var screenshotUrl = "";
    if (screenshotData && screenshotData.base64) {
      screenshotUrl = uploadFileToDrive(screenshotData, folder);
    }
    
    // 4. Save metadata and links to the active Google Sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Initialize headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Player Full Name",
        "Mobile Number",
        "Full Address",
        "Player Skill",
        "Photograph Link",
        "Payment Screenshot Link"
      ]);
      
      // Apply premium formatting to header row
      var headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#1e293b"); // Elegant dark slate
      headerRange.setFontColor("#ffffff");    // White text
      headerRange.setHorizontalAlignment("center");
    }
    
    // Append the player registration row
    var timestamp = new Date();
    sheet.appendRow([
      timestamp,
      name,
      "'" + mobile, // Prefix with apostrophe to prevent Excel/Sheets from converting phone number to scientific/integer
      address,
      skill,
      photoUrl,
      screenshotUrl
    ]);
    
    // Return success response to the client application
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Registration successfully saved to database."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Return error message in case of failure
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Retrieves the configured Google Drive folder.
 * Resolves by Target Folder ID if set, otherwise falls back to creating or finding "Cricket Tournament Registrations".
 */
function getFolder() {
  if (TARGET_FOLDER_ID && TARGET_FOLDER_ID !== "YOUR_SPECIFIC_GOOGLE_DRIVE_FOLDER_ID_HERE" && TARGET_FOLDER_ID.trim() !== "") {
    try {
      return DriveApp.getFolderById(TARGET_FOLDER_ID);
    } catch (e) {
      Logger.log("Failed to access folder by ID. Fallback by name search. Error: " + e.toString());
    }
  }
  
  // Fallback: Find or create a folder named "Cricket Tournament Registrations"
  var folderName = "Cricket Tournament Registrations";
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(folderName);
  }
}

/**
 * Decodes a base64 file object, saves it as a file in the folder, 
 * makes the file shareable, and returns the URL.
 */
function uploadFileToDrive(fileObj, folder) {
  // Strip out data URI scheme details (e.g. "data:image/png;base64,") if present
  var base64Data = fileObj.base64.split(",")[1] || fileObj.base64;
  
  // Decode Base64 string to bytes
  var decodedBytes = Utilities.base64Decode(base64Data);
  
  // Create new Blob from binary byte contents
  var blob = Utilities.newBlob(decodedBytes, fileObj.mimeType, fileObj.filename);
  
  // Save file to the target Google Drive folder
  var file = folder.createFile(blob);
  
  // Grant public read permission so anyone with the URL can view it
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // Return the web-viewable URL
  return file.getUrl();
}
