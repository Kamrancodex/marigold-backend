const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      minlength: [10, "Phone number must be at least 10 characters"],
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: ["wedding", "corporate", "social", "other"],
      default: "other",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["new", "contacted", "in_progress", "completed", "cancelled"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    contactedAt: {
      type: Date,
    },
    followUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ eventType: 1 });

module.exports = mongoose.model("Contact", contactSchema);
