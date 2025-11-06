const fs = require("fs");
const express = require("express");
const { google } = require("googleapis");

const CREDENTIALS_PATH = "E:\\Ateeq\\ateeq\\college-cms-backend\\oAuth_google.json";
const TOKEN_PATH = "token.json";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

async function main() {
  const content = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  const { client_secret, client_id, redirect_uris } = content.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    "http://localhost:5002/oauth2callback"
  );

  const app = express();

  // Step 1: ask for authorization
  app.get("/auth", (req, res) => {
    try {
      
   
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });
    res.redirect(authUrl);
 } catch (error) {
  console.log(error)
      
    }

  });

  // Step 2: Google redirects here
  app.get("/oauth2callback", async (req, res) => {
    try {
    const code = req.query.code;
    if (!code) return res.send("No code found in URL");

    const { tokens } = await oAuth2Client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    res.send("✅ Token saved to " + TOKEN_PATH);
    console.log("Token saved:", tokens);
  }
  catch (error) {
      console.log(error)
    }
  }

);

  app.listen(5002, () => {
    console.log("Server running at http://localhost:5002/auth");
  });
}

main().catch(console.error);
