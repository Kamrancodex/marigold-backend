const { createUploadthing } = require("uploadthing/server");

// Create main UploadThing instance
const f = createUploadthing();

// Define routes
const ourFileRouter = {
  // Generic image uploader (used by CRM team images, venues, etc.)
  imageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Optionally enforce auth: req.user is available if set upstream
      return {
        userId: req.user?.id || req.user?._id || "anonymous",
        source: "team",
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Runs on server after upload
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size,
      };
    }),

  // Resume uploader for career applications
  resumeUploader: f({
    "application/pdf": { maxFileSize: "10MB", maxFileCount: 1 },
    "application/msword": { maxFileSize: "10MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "10MB",
      maxFileCount: 1,
    },
    "text/csv": { maxFileSize: "5MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "5MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      // No auth required for career applications - public endpoint
      return {
        userId: "career-applicant",
        source: "career",
        timestamp: new Date().toISOString(),
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Resume uploaded:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        url: file.url,
        key: file.key,
      });

      return {
        uploadedBy: metadata.userId,
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        source: metadata.source,
      };
    }),
};

module.exports = { ourFileRouter };
