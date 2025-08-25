const express = require("express");
const { body, validationResult } = require("express-validator");
const MenuItem = require("../models/MenuItem");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation middleware
const menuItemValidation = [
  body("name").notEmpty().withMessage("Menu item name is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("category").notEmpty().withMessage("Category is required"),
];

// GET /api/menu-items - Get all menu items (public)
router.get("/", async (req, res) => {
  try {
    const {
      active = "true",
      category,
      serviceType = "corporate",
      featured,
      limit,
      page = 1,
    } = req.query;

    let query = {};
    if (active !== "all") {
      query.isActive = active === "true";
    }
    if (category && category !== "all") {
      query.category = category;
    }
    if (serviceType && serviceType !== "all") {
      query.serviceType = { $in: [serviceType, "all"] };
    }
    if (featured !== undefined) {
      query.isFeatured = featured === "true";
    }

    const pageSize = parseInt(limit) || 0;
    const skip = pageSize > 0 ? (parseInt(page) - 1) * pageSize : 0;

    const menuItems = await MenuItem.find(query)
      .sort({ category: 1, displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await MenuItem.countDocuments(query);

    if (pageSize > 0) {
      res.json({
        menuItems,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / pageSize),
          count: total,
        },
      });
    } else {
      res.json(menuItems);
    }
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
    });
  }
});

// GET /api/menu-items/:id - Get menu item by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu item",
    });
  }
});

// POST /api/menu-items - Create menu item (admin only)
router.post(
  "/",
  verifyToken,
  requireAdmin,
  menuItemValidation,
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

      const menuItem = new MenuItem(req.body);
      await menuItem.save();

      res.status(201).json({
        success: true,
        message: "Menu item created successfully",
        menuItem,
      });
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create menu item",
      });
    }
  }
);

// PUT /api/menu-items/:id - Update menu item (admin only)
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  menuItemValidation,
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

      const menuItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: "Menu item not found",
        });
      }

      res.json({
        success: true,
        message: "Menu item updated successfully",
        menuItem,
      });
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update menu item",
      });
    }
  }
);

// DELETE /api/menu-items/:id - Delete menu item (admin only)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
    });
  }
});

module.exports = router;
