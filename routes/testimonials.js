const express = require("express");
const { body, validationResult } = require("express-validator");
const Testimonial = require("../models/Testimonial");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const testimonialValidation = [
  body("clientNames").notEmpty().withMessage("Client names are required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("serviceType")
    .isIn(["wedding", "corporate", "social", "catering", "home", "all"])
    .withMessage("Invalid service type"),
];

// GET /api/testimonials - Get all testimonials (public)
router.get("/", async (req, res) => {
  try {
    const {
      active = "true",
      serviceType,
      featured,
      limit,
      page = 1,
    } = req.query;

    let query = {};
    if (active !== "all") {
      query.isActive = active === "true";
    }
    if (serviceType && serviceType !== "all") {
      query.serviceType = { $in: [serviceType, "all"] };
    }
    if (featured !== undefined) {
      query.isFeatured = featured === "true";
    }

    const pageSize = parseInt(limit) || 0;
    const skip = pageSize > 0 ? (parseInt(page) - 1) * pageSize : 0;

    const testimonials = await Testimonial.find(query)
      .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Testimonial.countDocuments(query);

    res.json({
      testimonials,
      pagination:
        pageSize > 0
          ? {
              current: parseInt(page),
              pages: Math.ceil(total / pageSize),
              total,
              limit: pageSize,
            }
          : null,
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials",
    });
  }
});

// GET /api/testimonials/:id - Get testimonial by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.json(testimonial);
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonial",
    });
  }
});

// POST /api/testimonials - Create new testimonial (admin only)
router.post(
  "/",
  verifyToken,
  requireAdmin,
  testimonialValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const testimonial = new Testimonial(req.body);
      await testimonial.save();

      res.status(201).json({
        success: true,
        message: "Testimonial created successfully",
        testimonial,
      });
    } catch (error) {
      console.error("Error creating testimonial:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create testimonial",
      });
    }
  }
);

// PUT /api/testimonials/:id - Update testimonial (admin only)
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  testimonialValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const testimonial = await Testimonial.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!testimonial) {
        return res.status(404).json({
          success: false,
          message: "Testimonial not found",
        });
      }

      res.json({
        success: true,
        message: "Testimonial updated successfully",
        testimonial,
      });
    } catch (error) {
      console.error("Error updating testimonial:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update testimonial",
      });
    }
  }
);

// DELETE /api/testimonials/:id - Delete testimonial (admin only)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete testimonial",
    });
  }
});

module.exports = router;
