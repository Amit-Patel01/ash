const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Load credentials
const credentialsPath = path.join(__dirname, '..', 'credentials.json');
let credentials;
try {
  credentials = JSON.parse(fs.readFileSync(credentialsPath));
} catch (err) {
  console.error("Error loading Google Drive credentials:", err.message);
}

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const auth = new google.auth.JWT(
  credentials?.client_email,
  null,
  credentials?.private_key,
  SCOPES
);

const drive = google.drive({ version: 'v3', auth });

/**
 * Uploads a file to Google Drive
 * @param {string} filePath - Local path of the file to upload
 * @param {string} fileName - Name of the file on Drive
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} - The webViewLink of the uploaded file
 */
async function uploadToDrive(filePath, fileName, mimeType) {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : []
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
    throw error;
  } finally {
    // Optionally delete local file after upload
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
}

module.exports = { uploadToDrive };
