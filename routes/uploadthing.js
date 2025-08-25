const express = require("express");
const { createRouteHandler } = require("uploadthing/express");
const { ourFileRouter } = require("../lib/uploadthing");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Build token: prefer UPLOADTHING_TOKEN, else generate from secret+appId
let utToken = process.env.UPLOADTHING_TOKEN || "";
if (!utToken) {
  const apiKey = process.env.UPLOADTHING_API_KEY || "";
  const appId = process.env.UPLOADTHING_APP_ID || "";
  const regions = process.env.UPLOADTHING_REGIONS
    ? process.env.UPLOADTHING_REGIONS.split(",").map((r) => r.trim())
    : ["sea1"]; // default region

  console.log("UploadThing config:");
  console.log(
    "- API Key:",
    apiKey ? `${apiKey.substring(0, 15)}...` : "missing"
  );
  console.log("- App ID:", appId || "missing");
  console.log("- Regions:", regions);

  if (apiKey && appId) {
    try {
      const payload = { apiKey, appId, regions };
      utToken = Buffer.from(JSON.stringify(payload)).toString("base64");
      console.log("UploadThing token generated successfully.");
    } catch (e) {
      console.warn("Failed to generate UploadThing token:", e);
    }
  } else {
    console.error(
      "Missing UploadThing configuration: apiKey or appId not found"
    );
  }
}

// Create handler
const handler = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: utToken,
    callbackUrl: process.env.UPLOADTHING_CALLBACK_URL,
  },
});

// Add specific CORS handling for UploadThing BEFORE the handler
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
});

// Handle both GET and POST requests for UploadThing
router.use("/", handler);

module.exports = router;
