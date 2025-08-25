const mongoose = require("mongoose");

const careerApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Desired role is required"],
      trim: true,
    },
    resume: {
      url: {
        type: String,
        required: [true, "Resume file is required"],
      },
      originalName: {
        type: String,
        required: true,
      },
      fileType: {
        type: String,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },
      key: {
        type: String,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["new", "reviewing", "interview", "hired", "rejected", "archived"],
      default: "new",
    },
    notes: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: String,
      default: "",
    },
    reviewedAt: {
      type: Date,
    },
    interviewDate: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    tags: [String],
    source: {
      type: String,
      default: "website",
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient queries
careerApplicationSchema.index({ status: 1, createdAt: -1 });
careerApplicationSchema.index({ email: 1 });
careerApplicationSchema.index({ role: 1, status: 1 });
careerApplicationSchema.index({ createdAt: -1 });
careerApplicationSchema.index({ isArchived: 1, status: 1 });

// Virtual for application age in days
careerApplicationSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for formatted file size
careerApplicationSchema.virtual('formattedFileSize').get(function() {
  const bytes = this.resume.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Static method to get applications by status
careerApplicationSchema.statics.getByStatus = function(status) {
  return this.find({ status, isArchived: false }).sort({ createdAt: -1 });
};

// Static method to get recent applications
careerApplicationSchema.statics.getRecent = function(limit = 10) {
  return this.find({ isArchived: false })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Instance method to mark as reviewed
careerApplicationSchema.methods.markAsReviewed = function(reviewerName, notes = '') {
  this.status = 'reviewing';
  this.reviewedBy = reviewerName;
  this.reviewedAt = new Date();
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

// Instance method to archive
careerApplicationSchema.methods.archive = function() {
  this.isArchived = true;
  this.status = 'archived';
  return this.save();
};

module.exports = mongoose.model("CareerApplication", careerApplicationSchema);
