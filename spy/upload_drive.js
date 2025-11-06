const express = require("express");
const router = express.Router();
const fs = require("fs");
const { google } = require("googleapis");
const db = require('../dbconfig');

const CREDENTIALS_PATH = "D:\\TMS\\college-cms-backend\\oAuth_google.json";
const TOKEN_PATH = "token.json";

async function getDriveClient() {
  try {
    
 
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Load token.json
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  oAuth2Client.setCredentials(token);

  return google.drive({ version: "v3", auth: oAuth2Client });
   } catch (error) {
    console.log(error)
  }
}



router.post("/upload-backup", async (req, res) => {
  try {
    const drive = await getDriveClient();

    // generate backup file path with timestamp
    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, "-");
    const backupPath = `D:\\backups\\cms_backup_${timestamp}.bak`;

    // take SQL Server backup
    await db.query(`BACKUP DATABASE [cms] TO DISK='${backupPath}' WITH INIT`);

    // Google Drive folder ID
    const folderId = "1TcLyBtS8_lH1oT7-YvyVAaPVFAdFy7y-";

    // upload backup file
    const response = await drive.files.create({
      requestBody: {
        name: `cms_backup_${timestamp}.bak`, // keep same timestamp in file name
        mimeType: "application/octet-stream",
        parents: [folderId],
      },
      media: {
        mimeType: "application/octet-stream",
        body: fs.createReadStream(backupPath), // ✅ upload the actual backupPath
      },
      fields: "id, parents",
    });

    // delete local backup file
    fs.unlinkSync(backupPath);

    res.json({
      success: true,
      message: "Backup uploaded to DBBackups folder in Google Drive",
      fileId: response.data.id,
      parent: response.data.parents[0],
    });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;
