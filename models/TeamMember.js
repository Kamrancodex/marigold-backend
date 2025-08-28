const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
      maxlength: [100, "Role cannot exceed 100 characters"],
    },
    favoriteMenuItem: {
      type: String,
      trim: true,
      maxlength: [100, "Favorite menu item cannot exceed 100 characters"],
    },
    image: {
      type: String,
      trim: true,
    },
    imageKey: {
      type: String, // UploadThing file key for deletion
      trim: true,
    },
    hasPhoto: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    specialties: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
teamMemberSchema.index({ displayOrder: 1 });
teamMemberSchema.index({ isActive: 1 });
teamMemberSchema.index({ hasPhoto: 1 });

module.exports = mongoose.model("TeamMember", teamMemberSchema);
