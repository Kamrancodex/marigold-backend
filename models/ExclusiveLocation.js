const mongoose = require("mongoose");

const exclusiveLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    capacity: {
      type: String,
      required: [true, "Capacity is required"],
      trim: true,
    },
    image: {
      url: {
        type: String,
        required: [true, "Image is required"],
      },
      alt: {
        type: String,
        default: "",
      },
      key: {
        type: String,
        default: "",
      },
      width: {
        type: Number,
        default: 800,
      },
      height: {
        type: Number,
        default: 533,
      },
    },
    features: [String], // e.g., ["Modern Design", "Flexible Spaces", "Full Kitchen"]
    amenities: [String], // e.g., ["Parking", "Bridal Suite", "Dance Floor"]
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      default: "$$$",
    },
    contactInfo: {
      phone: String,
      email: String,
      website: String,
    },
    address: {
      street: String,
      city: String,
      state: {
        type: String,
        default: "OH",
      },
      zipCode: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    availabilityStatus: {
      type: String,
      enum: ["Available", "Booked", "Limited", "Coming Soon"],
      default: "Available",
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    socialMedia: {
      instagram: String,
      facebook: String,
      twitter: String,
    },
    tags: [String],
    notes: String, // Internal notes for admin
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
exclusiveLocationSchema.index({ isActive: 1, displayOrder: 1 });
exclusiveLocationSchema.index({ slug: 1 });
exclusiveLocationSchema.index({ isFeatured: 1, isActive: 1 });

// Virtual for formatted capacity
exclusiveLocationSchema.virtual("formattedCapacity").get(function () {
  return this.capacity.includes("guest")
    ? this.capacity
    : `${this.capacity} guests`;
});

// Static method to get active locations
exclusiveLocationSchema.statics.getActive = function (limit) {
  const query = this.find({ isActive: true }).sort({
    displayOrder: 1,
    createdAt: 1,
  });
  return limit ? query.limit(limit) : query;
};

// Static method to get featured locations for home page
exclusiveLocationSchema.statics.getFeatured = function () {
  return this.find({ isActive: true, isFeatured: true }).sort({
    displayOrder: 1,
    createdAt: 1,
  });
};

// Instance method to generate slug
exclusiveLocationSchema.methods.generateSlug = function () {
  return this.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");
};

// Pre-save middleware to auto-generate slug
exclusiveLocationSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.generateSlug();
  }
  next();
});

module.exports = mongoose.model("ExclusiveLocation", exclusiveLocationSchema);
