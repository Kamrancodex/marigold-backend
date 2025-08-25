const express = require("express");
const { body, validationResult } = require("express-validator");
const Service = require("../models/Service");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const serviceValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("slug").notEmpty().withMessage("Slug is required"),
  body("description").notEmpty().withMessage("Description is required"),
];

// GET /api/services - Get all services (public)
router.get("/", async (req, res) => {
  try {
    const { active = "true", serviceType } = req.query;

    let query = {};
    if (active !== "all") {
      query.isActive = active === "true";
    }
    if (serviceType) {
      query.slug = serviceType;
    }

    const services = await Service.find(query).sort({
      displayOrder: 1,
      createdAt: -1,
    });

    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
});

// GET /api/services/:slug - Get service by slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const service = await Service.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service",
    });
  }
});

// POST /api/services - Create new service (admin only)
router.post(
  "/",
  verifyToken,
  requireAdmin,
  serviceValidation,
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
      const serviceData = { ...req.body };
      if (serviceData.images) {
        serviceData.images = serviceData.images.filter(
          (img) => img.url && img.url.trim() !== ""
        );
      }

      const service = new Service(serviceData);
      await service.save();

      res.status(201).json({
        success: true,
        message: "Service created successfully",
        service,
      });
    } catch (error) {
      console.error("Error creating service:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Service with this slug already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create service",
      });
    }
  }
);

// PUT /api/services/:id - Update service (admin only)
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  serviceValidation,
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

      const service = await Service.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!service) {
        return res.status(404).json({
          success: false,
          message: "Service not found",
        });
      }

      res.json({
        success: true,
        message: "Service updated successfully",
        service,
      });
    } catch (error) {
      console.error("Error updating service:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Service with this slug already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update service",
      });
    }
  }
);

// DELETE /api/services/:id - Delete service (admin only)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
});

module.exports = router;
