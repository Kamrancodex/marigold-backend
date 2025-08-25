const mongoose = require("mongoose");

const venueImageSchema = new mongoose.Schema({
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
  isPrimary: {
    type: Boolean,
    default: false,
  },
});

const venueAmenitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: String,
  description: String,
  isHighlight: {
    type: Boolean,
    default: false,
  },
});

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Venue name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Venue description is required"],
    },
    location: {
      type: String,
      required: [true, "Venue location is required"],
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "USA" },
    },
    capacity: {
      seated: {
        type: Number,
        required: [true, "Seated capacity is required"],
      },
      standing: {
        type: Number,
        required: [true, "Standing capacity is required"],
      },
      displayText: String, // e.g., "300 seated, 500 standing"
    },
    style: {
      type: [String],
      required: [true, "At least one style is required"],
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      required: [true, "Price range is required"],
    },
    category: {
      type: String,
      enum: ["Exclusive", "Featured", "Partner"],
      default: "Partner",
    },
    venueType: {
      type: [String],
      enum: [
        "Ballroom",
        "Barn",
        "Historic",
        "Modern",
        "Outdoor",
        "Waterfront",
        "Industrial",
        "Museum",
        "Hotel",
        "Farm",
        "Winery",
        "Lodge",
        "Garden",
        "Rooftop",
        "Church",
        "Gallery",
        "Theater",
        "Country Club",
        "Restaurant",
        "Other",
      ],
      default: ["Other"],
    },
    spaces: {
      hasOutdoorSpace: {
        type: Boolean,
        default: false,
      },
      hasIndoorSpace: {
        type: Boolean,
        default: true,
      },
      hasBridal: {
        type: Boolean,
        default: false,
      },
      hasDanceFloor: {
        type: Boolean,
        default: false,
      },
      hasStage: {
        type: Boolean,
        default: false,
      },
      hasKitchen: {
        type: Boolean,
        default: false,
      },
      hasParking: {
        type: Boolean,
        default: true,
      },
    },
    images: [venueImageSchema],
    amenities: [venueAmenitySchema],
    website: {
      type: String,
      trim: true,
    },
    contact: {
      phone: String,
      email: String,
      contactPerson: String,
    },
    pricing: {
      basePrice: Number,
      priceUnit: {
        type: String,
        enum: ["per person", "per hour", "per day", "flat rate"],
        default: "per person",
      },
      minimumSpend: Number,
      notes: String,
    },
    availability: {
      daysOfWeek: {
        type: [String],
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        default: ["Friday", "Saturday", "Sunday"],
      },
      seasonality: {
        type: String,
        enum: ["Year-round", "Seasonal", "Spring-Fall", "Indoor only winter"],
        default: "Year-round",
      },
    },
    features: [String], // e.g., ["Historic charm", "Waterfront views", "Full kitchen"]
    restrictions: [String], // e.g., ["No outside alcohol", "Music must end by 10pm"]
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isExclusive: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
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
    tags: [String], // For additional categorization and filtering
  },
  { timestamps: true }
);

// Indexes for efficient queries
venueSchema.index({ isActive: 1, category: 1, displayOrder: 1 });
venueSchema.index({ isFeatured: 1, isActive: 1 });
venueSchema.index({ isExclusive: 1, isActive: 1 });
venueSchema.index({ location: 1, isActive: 1 });
venueSchema.index({ "capacity.seated": 1, "capacity.standing": 1 });
venueSchema.index({ venueType: 1, isActive: 1 });
venueSchema.index({ style: 1, isActive: 1 });

// Virtual for primary image
venueSchema.virtual("primaryImage").get(function () {
  const primary = this.images.find((img) => img.isPrimary);
  return primary || this.images[0];
});

// Virtual for capacity display text
venueSchema.virtual("capacityDisplay").get(function () {
  if (this.capacity.displayText) {
    return this.capacity.displayText;
  }
  return `${this.capacity.seated} seated, ${this.capacity.standing} standing`;
});

// Ensure virtuals are included in JSON output
venueSchema.set("toJSON", { virtuals: true });
venueSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Venue", venueSchema);
