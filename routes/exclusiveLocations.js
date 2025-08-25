const express = require("express");
const { body, validationResult } = require("express-validator");
const ExclusiveLocation = require("../models/ExclusiveLocation");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation middleware for exclusive locations
const exclusiveLocationValidation = [
  body("name").notEmpty().withMessage("Location name is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("capacity").notEmpty().withMessage("Capacity is required"),
  body("image.url").notEmpty().withMessage("Image URL is required"),
];

// GET /api/exclusive-locations - Get all exclusive locations
router.get("/", async (req, res) => {
  try {
    const {
      active = "true",
      featured,
      limit,
      page = 1,
      sortBy = "displayOrder",
      sortOrder = "asc",
    } = req.query;

    let query = {};

    // Active filter
    if (active !== "all") {
      query.isActive = active === "true";
    }

    // Featured filter
    if (featured !== undefined) {
      query.isFeatured = featured === "true";
    }

    const pageSize = limit ? parseInt(limit) : undefined;
    const skip = pageSize ? (parseInt(page) - 1) * pageSize : 0;
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    let queryBuilder = ExclusiveLocation.find(query).sort(sort);

    if (pageSize) {
      queryBuilder = queryBuilder.skip(skip).limit(pageSize);
    }

    const locations = await queryBuilder;

    let result = { locations };

    if (pageSize) {
      const total = await ExclusiveLocation.countDocuments(query);
      result.pagination = {
        current: parseInt(page),
        total: Math.ceil(total / pageSize),
        count: total,
        hasNext: skip + pageSize < total,
        hasPrev: page > 1,
      };
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching exclusive locations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exclusive locations",
    });
  }
});

// GET /api/exclusive-locations/featured - Get featured locations for home page
router.get("/featured", async (req, res) => {
  try {
    const locations = await ExclusiveLocation.getFeatured();
    res.json(locations);
  } catch (error) {
    console.error("Error fetching featured exclusive locations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured exclusive locations",
    });
  }
});

// GET /api/exclusive-locations/:id - Get exclusive location by ID
router.get("/:id", async (req, res) => {
  try {
    const location = await ExclusiveLocation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Exclusive location not found",
      });
    }

    res.json(location);
  } catch (error) {
    console.error("Error fetching exclusive location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exclusive location",
    });
  }
});

// GET /api/exclusive-locations/slug/:slug - Get exclusive location by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const location = await ExclusiveLocation.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Exclusive location not found",
      });
    }

    res.json(location);
  } catch (error) {
    console.error("Error fetching exclusive location by slug:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exclusive location",
    });
  }
});

// POST /api/exclusive-locations - Create new exclusive location (admin only)
router.post(
  "/",
  verifyToken,
  requireAdmin,
  exclusiveLocationValidation,
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

      // Filter out empty image objects
      const locationData = { ...req.body };
      if (locationData.image && !locationData.image.url) {
        delete locationData.image;
      }

      const location = new ExclusiveLocation(locationData);
      await location.save();

      res.status(201).json({
        success: true,
        message: "Exclusive location created successfully",
        location,
      });
    } catch (error) {
      console.error("Error creating exclusive location:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Location with this slug already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create exclusive location",
      });
    }
  }
);

// PUT /api/exclusive-locations/:id - Update exclusive location (admin only)
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  exclusiveLocationValidation,
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

      // Filter out empty image objects
      const updateData = { ...req.body };
      if (updateData.image && !updateData.image.url) {
        delete updateData.image;
      }

      const location = await ExclusiveLocation.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!location) {
        return res.status(404).json({
          success: false,
          message: "Exclusive location not found",
        });
      }

      res.json({
        success: true,
        message: "Exclusive location updated successfully",
        location,
      });
    } catch (error) {
      console.error("Error updating exclusive location:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Location with this slug already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update exclusive location",
      });
    }
  }
);

// DELETE /api/exclusive-locations/:id - Delete exclusive location (admin only)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const location = await ExclusiveLocation.findByIdAndDelete(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Exclusive location not found",
      });
    }

    res.json({
      success: true,
      message: "Exclusive location deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exclusive location:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete exclusive location",
    });
  }
});

// PUT /api/exclusive-locations/:id/reorder - Update display order (admin only)
router.put("/:id/reorder", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { displayOrder } = req.body;

    if (typeof displayOrder !== "number") {
      return res.status(400).json({
        success: false,
        message: "Display order must be a number",
      });
    }

    const location = await ExclusiveLocation.findByIdAndUpdate(
      req.params.id,
      { displayOrder },
      { new: true }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Exclusive location not found",
      });
    }

    res.json({
      success: true,
      message: "Display order updated successfully",
      location,
    });
  } catch (error) {
    console.error("Error updating display order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update display order",
    });
  }
});

module.exports = router;
