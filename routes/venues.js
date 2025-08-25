const express = require("express");
const { body, validationResult } = require("express-validator");
const Venue = require("../models/Venue");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const venueValidation = [
  body("name").notEmpty().withMessage("Venue name is required"),
  body("description").notEmpty().withMessage("Venue description is required"),
  body("location").notEmpty().withMessage("Venue location is required"),
  body("capacity.seated")
    .isNumeric()
    .withMessage("Seated capacity must be a number"),
  body("capacity.standing")
    .isNumeric()
    .withMessage("Standing capacity must be a number"),
  body("style")
    .isArray({ min: 1 })
    .withMessage("At least one style is required"),
  body("priceRange")
    .isIn(["$", "$$", "$$$", "$$$$"])
    .withMessage("Valid price range is required"),
];

// GET /api/venues - Get all venues (public)
router.get("/", async (req, res) => {
  try {
    const {
      active = "true",
      category,
      featured,
      exclusive,
      location,
      venueType,
      minCapacity,
      maxCapacity,
      hasOutdoorSpace,
      hasIndoorSpace,
      priceRange,
      style,
      limit,
      page = 1,
    } = req.query;

    let query = {};

    // Active filter
    if (active !== "all") {
      query.isActive = active === "true";
    }

    // Category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Featured filter
    if (featured !== undefined) {
      query.isFeatured = featured === "true";
    }

    // Exclusive filter
    if (exclusive !== undefined) {
      query.isExclusive = exclusive === "true";
    }

    // Location filter
    if (location && location !== "all") {
      query.location = { $regex: location, $options: "i" };
    }

    // Venue type filter
    if (venueType && venueType !== "all") {
      query.venueType = { $in: [venueType] };
    }

    // Capacity filters
    if (minCapacity) {
      query["capacity.seated"] = { $gte: parseInt(minCapacity) };
    }
    if (maxCapacity) {
      query["capacity.seated"] = {
        ...query["capacity.seated"],
        $lte: parseInt(maxCapacity),
      };
    }

    // Space filters
    if (hasOutdoorSpace !== undefined) {
      query["spaces.hasOutdoorSpace"] = hasOutdoorSpace === "true";
    }
    if (hasIndoorSpace !== undefined) {
      query["spaces.hasIndoorSpace"] = hasIndoorSpace === "true";
    }

    // Price range filter
    if (priceRange && priceRange !== "all") {
      query.priceRange = priceRange;
    }

    // Style filter
    if (style && style !== "all") {
      query.style = { $in: [style] };
    }

    const pageSize = parseInt(limit) || 0;
    const skip = pageSize > 0 ? (parseInt(page) - 1) * pageSize : 0;

    const venues = await Venue.find(query)
      .sort({ category: 1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Venue.countDocuments(query);

    if (pageSize > 0) {
      res.json({
        venues,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / pageSize),
          count: total,
        },
      });
    } else {
      res.json(venues);
    }
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch venues",
    });
  }
});

// GET /api/venues/categories - Get venue categories and counts (public)
router.get("/categories", async (req, res) => {
  try {
    const categories = await Venue.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const venueTypes = await Venue.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$venueType" },
      { $group: { _id: "$venueType", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const locations = await Venue.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      categories,
      venueTypes,
      locations,
    });
  } catch (error) {
    console.error("Error fetching venue categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch venue categories",
    });
  }
});

// GET /api/venues/:id - Get venue by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found",
      });
    }

    res.json(venue);
  } catch (error) {
    console.error("Error fetching venue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch venue",
    });
  }
});

// GET /api/venues/slug/:slug - Get venue by slug (public)
router.get("/slug/:slug", async (req, res) => {
  try {
    const venue = await Venue.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found",
      });
    }

    res.json(venue);
  } catch (error) {
    console.error("Error fetching venue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch venue",
    });
  }
});

// POST /api/venues - Create venue (admin only)
router.post(
  "/",
  verifyToken,
  requireAdmin,
  venueValidation,
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

      // Filter out empty images (images without URLs)
      const venueData = { ...req.body };
      if (venueData.images) {
        venueData.images = venueData.images.filter(
          (img) => img.url && img.url.trim() !== ""
        );
      }

      const venue = new Venue(venueData);
      await venue.save();

      res.status(201).json({
        success: true,
        message: "Venue created successfully",
        venue,
      });
    } catch (error) {
      console.error("Error creating venue:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create venue",
      });
    }
  }
);

// PUT /api/venues/:id - Update venue (admin only)
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  venueValidation,
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

      // Filter out empty images (images without URLs)
      const updateData = { ...req.body };
      if (updateData.images) {
        updateData.images = updateData.images.filter(
          (img) => img.url && img.url.trim() !== ""
        );
      }

      const venue = await Venue.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!venue) {
        return res.status(404).json({
          success: false,
          message: "Venue not found",
        });
      }

      res.json({
        success: true,
        message: "Venue updated successfully",
        venue,
      });
    } catch (error) {
      console.error("Error updating venue:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update venue",
      });
    }
  }
);

// DELETE /api/venues/:id - Delete venue (admin only)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found",
      });
    }

    res.json({
      success: true,
      message: "Venue deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting venue:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete venue",
    });
  }
});

module.exports = router;
