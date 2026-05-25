/**
   YUVA SHAKTI CUP FULBARIA - FORM CONTROLLER
   Handles validation, file upload dropzones, base64 conversion,
   and Ajax API submission to Google Apps Script.
 */

// ==========================================
// 🔗 CONFIGURATION: PASTE YOUR DEPLOYED URL HERE
// ==========================================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbycW5Lx7wUxPIMoGPHtOg_WkyYq2XxjifucJ8lf8P_q8XOGyqTvaLzJBPOsWmRTbq3U/exec";

// Global files storage (stores base64 data and metadata)
const uploads = {
  photo: null,
  screenshot: null
};

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM ELEMENTS ---
  const form = document.getElementById("registrationForm");

  // Input fields
  const nameInput = document.getElementById("playerName");
  const mobileInput = document.getElementById("playerMobile");
  const addressInput = document.getElementById("playerAddress");

  // Error elements
  const nameError = document.getElementById("nameError");
  const mobileError = document.getElementById("mobileError");
  const addressError = document.getElementById("addressError");
  const skillError = document.getElementById("skillError");
  const photoError = document.getElementById("photoError");
  const screenshotError = document.getElementById("screenshotError");

  // Dropzones & File inputs
  const photoDropzone = document.getElementById("photoDropzone");
  const photoInput = document.getElementById("playerPhoto");
  const photoEmpty = document.getElementById("photoDropzoneEmpty");
  const photoPreview = document.getElementById("photoDropzonePreview");
  const photoPreviewImg = document.getElementById("photoPreviewImg");
  const photoFilename = document.getElementById("photoFilename");
  const photoFilesize = document.getElementById("photoFilesize");
  const btnRemovePhoto = document.getElementById("btnRemovePhoto");

  const screenshotDropzone = document.getElementById("screenshotDropzone");
  const screenshotInput = document.getElementById("paymentScreenshot");
  const screenshotEmpty = document.getElementById("screenshotDropzoneEmpty");
  const screenshotPreview = document.getElementById("screenshotDropzonePreview");
  const screenshotPreviewImg = document.getElementById("screenshotPreviewImg");
  const screenshotFilename = document.getElementById("screenshotFilename");
  const screenshotFilesize = document.getElementById("screenshotFilesize");
  const btnRemoveScreenshot = document.getElementById("btnRemoveScreenshot");

  // Overlay / Modals
  const loadingOverlay = document.getElementById("loadingOverlay");
  const loadingStatusText = document.getElementById("loadingStatusText");
  const successModal = document.getElementById("successModal");
  const errorModal = document.getElementById("errorModal");
  const errorDetailsText = document.getElementById("errorDetailsText");

  // Close buttons
  const btnSuccessClose = document.getElementById("btnSuccessClose");
  const btnErrorClose = document.getElementById("btnErrorClose");

  // Receipt elements
  const receiptName = document.getElementById("receiptName");
  const receiptMobile = document.getElementById("receiptMobile");
  const receiptSkill = document.getElementById("receiptSkill");

  // Error Alert Banner elements
  const errorAlert = document.getElementById("formSubmitErrorAlert");
  const errorAlertMsg = document.getElementById("formSubmitErrorMsg");
  const btnCloseAlert = document.getElementById("btnCloseAlert");

  // Digital Ticket elements
  const ticketContainer = document.getElementById("digitalTicketContainer");
  const ticketNumberVal = document.getElementById("ticketNumberVal");
  const ticketPlayerName = document.getElementById("ticketPlayerName");
  const ticketPlayerSkill = document.getElementById("ticketPlayerSkill");
  const ticketTimestamp = document.getElementById("ticketTimestamp");

  // --- REGULAR EXPRESSIONS ---
  const mobileRegex = /^[0-9]{10}$/; // Exactly 10 digits

  // ==========================================
  // 📁 FILE UPLOAD & DRAG/DROP CONTROLLERS
  // ==========================================

  /**
   * Utility: Convert file size in bytes to human readable string
   */
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Utility: Convert File object to Base64 Promise
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Setup Drag & Drop Handlers for a specific dropzone
   */
  const setupDropzone = (dropzone, input, typeKey, emptyState, previewState, previewImg, nameState, sizeState) => {
    // Prevent browser default behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    // Toggle dragover visual style
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, () => {
        dropzone.classList.remove('dragover');
      }, false);
    });

    // Handle dropped files
    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        input.files = files;
        processFile(files[0], typeKey, emptyState, previewState, previewImg, nameState, sizeState);
      }
    });

    // Handle clicked/browsed files
    input.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        processFile(e.target.files[0], typeKey, emptyState, previewState, previewImg, nameState, sizeState);
      }
    });
  };

  /**
   * Validate and process selected file
   */
  const processFile = async (file, typeKey, emptyState, previewState, previewImg, nameState, sizeState) => {
    // Hide previous error for this file input
    const errorEl = typeKey === 'photo' ? photoError : screenshotError;
    const formGroup = errorEl.closest('.form-group');
    formGroup.classList.remove('has-error');
    errorEl.style.display = 'none';

    // Validate type (must be image)
    if (!file.type.startsWith('image/')) {
      alert("Invalid file format. Please upload an image (PNG, JPG, or JPEG).");
      clearFileField(typeKey);
      return;
    }

    // Validate size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File is too large. Maximum allowed size is 5MB.");
      clearFileField(typeKey);
      return;
    }

    // Display image preview
    const objectURL = URL.createObjectURL(file);
    previewImg.src = objectURL;
    nameState.textContent = file.name;
    sizeState.textContent = formatBytes(file.size);

    // Switch container UI states
    emptyState.classList.add('hidden');
    previewState.classList.remove('hidden');

    // Convert to base64 for API transmission
    try {
      const base64String = await fileToBase64(file);
      uploads[typeKey] = {
        base64: base64String,
        mimeType: file.type,
        filename: file.name
      };
    } catch (err) {
      console.error("Base64 reading error: ", err);
      alert("Failed to read file contents. Please try another image.");
      clearFileField(typeKey);
    }
  };

  /**
   * Reset file upload fields back to empty state
   */
  const clearFileField = (typeKey) => {
    uploads[typeKey] = null;
    if (typeKey === 'photo') {
      photoInput.value = "";
      photoPreviewImg.src = "";
      photoPreview.classList.add('hidden');
      photoEmpty.classList.remove('hidden');
    } else {
      screenshotInput.value = "";
      screenshotPreviewImg.src = "";
      screenshotPreview.classList.add('hidden');
      screenshotEmpty.classList.remove('hidden');
    }
  };

  // Initialize photo dropzone
  setupDropzone(
    photoDropzone,
    photoInput,
    'photo',
    photoEmpty,
    photoPreview,
    photoPreviewImg,
    photoFilename,
    photoFilesize
  );

  // Initialize screenshot dropzone
  setupDropzone(
    screenshotDropzone,
    screenshotInput,
    'screenshot',
    screenshotEmpty,
    screenshotPreview,
    screenshotPreviewImg,
    screenshotFilename,
    screenshotFilesize
  );

  // Remove buttons click listeners
  btnRemovePhoto.addEventListener('click', () => clearFileField('photo'));
  btnRemoveScreenshot.addEventListener('click', () => clearFileField('screenshot'));


  // ==========================================
  // 📝 VALIDATION & SUBMISSION
  // ==========================================

  // Prevent alphabetic characters in mobile input
  mobileInput.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
  });

  /**
   * Validate individual form inputs
   */
  const validateForm = () => {
    let isValid = true;

    // 1. Validate Full Name
    if (nameInput.value.trim() === "") {
      showError(nameInput, nameError);
      isValid = false;
    } else {
      hideError(nameInput, nameError);
    }

    // 2. Validate Mobile Number (10 digits)
    if (!mobileRegex.test(mobileInput.value)) {
      showError(mobileInput, mobileError);
      isValid = false;
    } else {
      hideError(mobileInput, mobileError);
    }

    // 3. Validate Address
    if (addressInput.value.trim() === "") {
      showError(addressInput, addressError);
      isValid = false;
    } else {
      hideError(addressInput, addressError);
    }

    // 4. Validate Skill Radio Selection
    const skillRadio = form.querySelector('input[name="skill"]:checked');
    if (!skillRadio) {
      const skillContainer = document.querySelector('.skill-cards-grid');
      skillContainer.closest('.form-group').classList.add('has-error');
      skillError.style.display = 'block';
      isValid = false;
    } else {
      const skillContainer = document.querySelector('.skill-cards-grid');
      skillContainer.closest('.form-group').classList.remove('has-error');
      skillError.style.display = 'none';
    }

    // 5. Validate Photograph Upload
    if (!uploads.photo) {
      photoDropzone.closest('.form-group').classList.add('has-error');
      photoError.style.display = 'block';
      isValid = false;
    } else {
      photoDropzone.closest('.form-group').classList.remove('has-error');
      photoError.style.display = 'none';
    }

    // 6. Validate Payment Screenshot Upload
    if (!uploads.screenshot) {
      screenshotDropzone.closest('.form-group').classList.add('has-error');
      screenshotError.style.display = 'block';
      isValid = false;
    } else {
      screenshotDropzone.closest('.form-group').classList.remove('has-error');
      screenshotError.style.display = 'none';
    }

    return isValid;
  };

  const showError = (inputEl, errorEl) => {
    const formGroup = inputEl.closest('.form-group');
    formGroup.classList.add('has-error');
    errorEl.style.display = 'block';
  };

  const hideError = (inputEl, errorEl) => {
    const formGroup = inputEl.closest('.form-group');
    formGroup.classList.remove('has-error');
    errorEl.style.display = 'none';
  };

  // Live validation on blur
  nameInput.addEventListener('blur', () => {
    if (nameInput.value.trim() !== "") hideError(nameInput, nameError);
  });
  mobileInput.addEventListener('blur', () => {
    if (mobileRegex.test(mobileInput.value)) hideError(mobileInput, mobileError);
  });
  addressInput.addEventListener('blur', () => {
    if (addressInput.value.trim() !== "") hideError(addressInput, addressError);
  });


  // Close alert button listener
  if (btnCloseAlert) {
    btnCloseAlert.addEventListener('click', () => {
      errorAlert.classList.add('hidden');
    });
  }

  // Helper to display error banner inline
  const displayInlineError = (msg) => {
    if (errorAlert && errorAlertMsg) {
      errorAlertMsg.textContent = msg || "Network connection failed. Verify your internet status and check the Apps Script web app configurations.";
      errorAlert.classList.remove('hidden');
      errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // --- FORM SUBMIT INTERCEPTOR ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset error banner
    if (errorAlert) {
      errorAlert.classList.add('hidden');
    }

    // Trigger validations
    if (!validateForm()) {
      // Find first error and scroll to it smoothly
      const firstError = document.querySelector('.form-group.has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Check if script URL is configured
    if (WEB_APP_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
      displayInlineError("Google Apps Script URL is not configured. Please read README.md to configure your backend.");
      return;
    }

    // Show processing overlay
    loadingOverlay.classList.remove('hidden');
    loadingStatusText.textContent = "Connecting to Google Cloud server...";

    // Prepare registration payload
    const selectedSkill = form.querySelector('input[name="skill"]:checked').value;
    const payload = {
      name: nameInput.value.trim(),
      mobile: mobileInput.value.trim(),
      address: addressInput.value.trim(),
      skill: selectedSkill,
      photo: uploads.photo,
      screenshot: uploads.screenshot
    };

    // Submitting requests
    try {
      loadingStatusText.textContent = "Uploading images to Google Drive & appending spreadsheet...";

      // Crucial: Use text/plain type to bypass CORS OPTIONS preflight blockages on Google Script Web Apps
      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server responded with HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        loadingStatusText.textContent = "Finalizing transaction details...";

        // Populate receipt values for the ticket
        if (ticketNumberVal) ticketNumberVal.textContent = `Ticket Number: ${payload.mobile}`;
        if (ticketPlayerName) ticketPlayerName.textContent = payload.name;
        if (ticketPlayerSkill) ticketPlayerSkill.textContent = payload.skill;
        if (ticketTimestamp) {
          const now = new Date();
          const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit'
          };
          ticketTimestamp.textContent = now.toLocaleDateString('en-US', options);
        }

        // Hide form and show ticket
        form.classList.add('hidden');

        // Reset the form values
        form.reset();
        clearFileField('photo');
        clearFileField('screenshot');

        // Hide loader & Show ticket screen
        setTimeout(() => {
          loadingOverlay.classList.add('hidden');
          if (ticketContainer) {
            ticketContainer.classList.remove('hidden');
            ticketContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 800);

      } else {
        // Display visible error message on the screen alerting the user
        loadingOverlay.classList.add('hidden');
        displayInlineError(result.message || "An error occurred during submission.");
      }

    } catch (err) {
      console.error("Submission Error:", err);
      loadingOverlay.classList.add('hidden');
      displayInlineError(err.message);
    }
  });

  // Modal UI close listeners (kept as fallbacks/cleanup)
  btnSuccessClose.addEventListener('click', () => {
    successModal.classList.add('hidden');
  });

  btnErrorClose.addEventListener('click', () => {
    errorModal.classList.add('hidden');
  });

  const displayErrorModal = (msg) => {
    errorDetailsText.textContent = msg || "Network connection failed. Verify your internet status and check the Apps Script web app configurations.";
    errorModal.classList.remove('hidden');
  };
});
