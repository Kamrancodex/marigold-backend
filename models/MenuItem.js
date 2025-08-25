const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Menu item price is required"],
    },
    priceUnit: {
      type: String,
      enum: ["person", "platter", "dozen", "each", "hour"],
      default: "person",
    },
    category: {
      type: String,
      required: [true, "Menu category is required"],
      enum: [
        "breakfast",
        "lunch",
        "dinner",
        "packages",
        "beverages",
        "desserts",
      ],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    serviceType: {
      type: String,
      enum: ["corporate", "wedding", "social", "catering", "all"],
      default: "corporate",
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
    minimumOrder: {
      type: Number,
      default: 1,
    },
    notes: {
      type: String,
      trim: true,
    },
    image: {
      url: { type: String, default: "" },
      alt: { type: String, default: "" },
      key: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Index for efficient queries
MenuItemSchema.index({
  serviceType: 1,
  category: 1,
  isActive: 1,
  displayOrder: 1,
});
MenuItemSchema.index({ isFeatured: 1, isActive: 1 });

module.exports = mongoose.model("MenuItem", MenuItemSchema);
