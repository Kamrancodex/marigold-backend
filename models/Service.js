const mongoose = require("mongoose");

const serviceImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "",
  },
  key: {
    type: String,
    default: "",
  },
  caption: String,
  displayOrder: {
    type: Number,
    default: 0,
  },
  size: {
    type: String,
    enum: ["small", "medium", "large", "hero"],
    default: "medium",
  },
});

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    heroImage: {
      url: String,
      alt: String,
    },
    images: [serviceImageSchema],
    ctaText: {
      type: String,
      default: "Get Started",
    },
    ctaLink: {
      type: String,
      default: "/contact",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    seoTitle: String,
    seoDescription: String,
    seoKeywords: String,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
serviceSchema.index({ slug: 1 });
serviceSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model("Service", serviceSchema);
