const mongoose = require("mongoose");

const CorporateServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
    },
    icon: {
      type: String,
      trim: true,
    },
    image: {
      url: { type: String, default: "" },
      alt: { type: String, default: "" },
      key: { type: String, default: "" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    ctaText: {
      type: String,
      default: "Learn More",
    },
    ctaLink: {
      type: String,
      default: "/contact",
    },
    serviceType: {
      type: String,
      enum: ["corporate", "social", "wedding", "all"],
      default: "corporate",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
CorporateServiceSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model("CorporateService", CorporateServiceSchema);
