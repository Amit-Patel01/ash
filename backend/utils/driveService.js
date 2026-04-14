const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Load credentials
const credentialsPath = path.join(__dirname, '..', 'credentials.json');
let credentials;
let drive = null;

try {
  if (!fs.existsSync(credentialsPath)) {
    console.error("Google Drive credentials.json not found at:", credentialsPath);
  } else {
    credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log("Google Drive credentials loaded. Service account:", credentials.client_email);

    const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      SCOPES
    );

    drive = google.drive({ version: 'v3', auth });
    console.log("Google Drive client initialized successfully");
  }
} catch (err) {
  console.error("Error loading Google Drive credentials:", err.message);
}

/**
 * Uploads a file to Google Drive
 * @param {string} filePath - Local path of the file to upload
 * @param {string} fileName - Name of the file on Drive
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - The webViewLink of the uploaded file
 */
async function uploadToDrive(filePath, fileName, mimeType) {
  if (!drive) {
    throw new Error('Google Drive client not initialized. Check credentials.json');
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID not set in environment variables');
  }

  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType: mimeType,
      body: fs.createReadStream(filePath)
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    const fileId = response.data.id;
    console.log("File uploaded to Drive. File ID:", fileId);

    // Set permission to public view
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Return a direct link if possible, or the webViewLink
    // Direct link format: https://drive.google.com/uc?id=FILE_ID
    return `https://drive.google.com/uc?id=${fileId}`;
  } catch (error) {
    console.error('Google Drive Upload Error:', error.message);
    if (error.response) {
      console.error('Drive API Error Details:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  } finally {
    // Optionally delete local file after upload
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
}

module.exports = { uploadToDrive };
