const express = require("express");
const { body, validationResult } = require("express-validator");
const CorporateService = require("../models/CorporateService");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const corporateServiceValidation = [
  body("title").notEmpty().withMessage("Service title is required"),
  body("description").notEmpty().withMessage("Service description is required"),
];

// GET /api/corporate-services - Get all corporate services (public)
router.get("/", async (req, res) => {
  try {
    const { active = "true", serviceType = "corporate" } = req.query;

    let query = {};
    if (active !== "all") {
      query.isActive = active === "true";
    }
    if (serviceType && serviceType !== "all") {
      query.serviceType = { $in: [serviceType, "all"] };
    }

    const corporateServices = await CorporateService.find(query).sort({
      displayOrder: 1,
      createdAt: -1,
    });

    res.json(corporateServices);
  } catch (error) {
    console.error("Error fetching corporate services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch corporate services",
    });
  }
});

// GET /api/corporate-services/:id - Get corporate service by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const corporateService = await CorporateService.findById(req.params.id);

    if (!corporateService) {
      return res.status(404).json({
        success: false,
        message: "Corporate service not found",
      });
    }

    res.json(corporateService);
  } catch (error) {
    console.error("Error fetching corporate service:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch corporate service",
    });
  }
});

// POST /api/corporate-services - Create corporate service (admin only)
router.post(
  "/",
  verifyToken,
  requireAdmin,
  corporateServiceValidation,
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

      const corporateService = new CorporateService(req.body);
      await corporateService.save();

      res.status(201).json({
        success: true,
        message: "Corporate service created successfully",
        corporateService,
      });
    } catch (error) {
      console.error("Error creating corporate service:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create corporate service",
      });
    }
  }
);

// PUT /api/corporate-services/:id - Update corporate service (admin only)
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  corporateServiceValidation,
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

      const corporateService = await CorporateService.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!corporateService) {
        return res.status(404).json({
          success: false,
          message: "Corporate service not found",
        });
      }

      res.json({
        success: true,
        message: "Corporate service updated successfully",
        corporateService,
      });
    } catch (error) {
      console.error("Error updating corporate service:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update corporate service",
      });
    }
  }
);

// DELETE /api/corporate-services/:id - Delete corporate service (admin only)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const corporateService = await CorporateService.findByIdAndDelete(
      req.params.id
    );

    if (!corporateService) {
      return res.status(404).json({
        success: false,
        message: "Corporate service not found",
      });
    }

    res.json({
      success: true,
      message: "Corporate service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting corporate service:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete corporate service",
    });
  }
});

module.exports = router;
