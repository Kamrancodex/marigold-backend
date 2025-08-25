const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    clientNames: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    serviceType: {
      type: String,
      enum: ["wedding", "corporate", "social", "catering", "all"],
      default: "all",
    },
    eventDate: Date,
    location: String,
    image: {
      url: String,
      alt: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
testimonialSchema.index({ serviceType: 1, isActive: 1, displayOrder: 1 });
testimonialSchema.index({ isFeatured: 1, isActive: 1 });

module.exports = mongoose.model("Testimonial", testimonialSchema);
