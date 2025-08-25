const express = require("express");
const fetch = require("node-fetch");
const multer = require("multer");
const FormData = require("form-data");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// Upload to UploadThing via server proxy
router.post(
  "/upload",
  verifyToken,
  requireAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      console.log("Upload request received:");
      console.log("- Headers:", req.headers);
      console.log("- Body keys:", Object.keys(req.body || {}));
      console.log("- File:", req.file);
      console.log("- Files:", req.files);

      const apiKey = process.env.UPLOADTHING_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          message: "UploadThing not configured (missing UPLOADTHING_API_KEY)",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
          debug: {
            hasBody: !!req.body,
            bodyKeys: Object.keys(req.body || {}),
            hasFiles: !!req.files,
            contentType: req.headers["content-type"],
          },
        });
      }

      const formData = new FormData();
      formData.append("files", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
        knownLength: req.file.size,
      });

      console.log("Uploading to UploadThing:");
      console.log(
        "- API Key:",
        apiKey ? `${apiKey.substring(0, 10)}...` : "missing"
      );
      console.log("- File size:", req.file.size);
      console.log("- File type:", req.file.mimetype);

      const utRes = await fetch("https://api.uploadthing.com/v6/uploadFiles", {
        method: "POST",
        headers: {
          ...formData.getHeaders(),
          "X-Uploadthing-Api-Key": apiKey,
        },
        body: formData,
      });

      const text = await utRes.text();
      console.log("UploadThing response:");
      console.log("- Status:", utRes.status);
      console.log("- Response:", text);

      if (!utRes.ok) {
        return res.status(utRes.status).json({ success: false, message: text });
      }

      const data = JSON.parse(text);
      return res.json({ success: true, data });
    } catch (err) {
      console.error("uploads/upload error:", err);
      return res.status(500).json({ success: false, message: "Upload failed" });
    }
  }
);

// Delete from UploadThing
router.post(
  "/delete",
  verifyToken,
  requireAdmin,
  express.json(),
  async (req, res) => {
    try {
      const apiKey = process.env.UPLOADTHING_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          message: "UploadThing not configured (missing UPLOADTHING_API_KEY)",
        });
      }

      const { fileKey } = req.body || {};
      if (!fileKey) {
        return res
          .status(400)
          .json({ success: false, message: "fileKey is required" });
      }

      const utRes = await fetch("https://api.uploadthing.com/v6/deleteFile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Uploadthing-Api-Key": apiKey,
        },
        body: JSON.stringify({ fileKey }),
      });

      const text = await utRes.text();
      if (!utRes.ok) {
        return res.status(utRes.status).json({ success: false, message: text });
      }

      const data = JSON.parse(text);
      return res.json({ success: true, data });
    } catch (err) {
      console.error("uploads/delete error:", err);
      return res.status(500).json({ success: false, message: "Delete failed" });
    }
  }
);

module.exports = router;

