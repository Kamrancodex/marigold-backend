const express = require("express");
const router = express.Router();
const TeamMember = require("../models/TeamMember");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/validation");

// Remove empty string fields so optional validators ignore them
const removeEmptyStrings = (req, _res, next) => {
  if (req.body && typeof req.body === "object") {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string" && req.body[key].trim() === "") {
        delete req.body[key];
      }
    });
  }
  next();
};

// Helpers
const imageValidator = (field) =>
  body(field)
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .custom((value) => {
      if (!value) return true;
      // Allow data URLs (base64) or http/https URLs
      const isDataUrl = /^data:image\/[a-zA-Z+]+;base64,/.test(value);
      const isHttpUrl = /^https?:\/\//.test(value);
      if (isDataUrl || isHttpUrl) return true;
      throw new Error("Image must be a data URL or an http(s) URL");
    });

// Validation rules for create (require name and role)
const validateTeamMemberCreate = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Role must be between 2 and 100 characters"),

  body("favoriteMenuItem")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Favorite menu item cannot exceed 100 characters"),

  imageValidator("image"),
  body("imageKey").optional({ checkFalsy: true, nullable: true }).trim(),
  body("hasPhoto")
    .optional({ checkFalsy: true, nullable: true })
    .isBoolean()
    .withMessage("hasPhoto must be boolean")
    .toBoolean(),
  body("displayOrder")
    .optional({ checkFalsy: true, nullable: true })
    .isInt({ min: 0 })
    .withMessage("Display order must be a positive integer")
    .toInt(),
  body("isActive")
    .optional({ checkFalsy: true, nullable: true })
    .isBoolean()
    .withMessage("isActive must be boolean")
    .toBoolean(),
  body("bio")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
  body("yearsExperience")
    .optional({ checkFalsy: true, nullable: true })
    .isInt({ min: 0 })
    .withMessage("Years of experience must be a positive integer")
    .toInt(),
  body("specialties")
    .optional({ checkFalsy: true, nullable: true })
    .isArray()
    .withMessage("Specialties must be an array"),
];

// Validation rules for update (all fields optional)
const validateTeamMemberUpdate = [
  body("name")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("role")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Role must be between 2 and 100 characters"),
  body("favoriteMenuItem")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Favorite menu item cannot exceed 100 characters"),
  imageValidator("image"),
  body("imageKey").optional({ checkFalsy: true, nullable: true }).trim(),
  body("hasPhoto")
    .optional({ checkFalsy: true, nullable: true })
    .isBoolean()
    .withMessage("hasPhoto must be boolean")
    .toBoolean(),
  body("displayOrder")
    .optional({ checkFalsy: true, nullable: true })
    .isInt({ min: 0 })
    .withMessage("Display order must be a positive integer")
    .toInt(),
  body("isActive")
    .optional({ checkFalsy: true, nullable: true })
    .isBoolean()
    .withMessage("isActive must be boolean")
    .toBoolean(),
  body("bio")
    .optional({ checkFalsy: true, nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
  body("yearsExperience")
    .optional({ checkFalsy: true, nullable: true })
    .isInt({ min: 0 })
    .withMessage("Years of experience must be a positive integer")
    .toInt(),
  body("specialties")
    .optional({ checkFalsy: true, nullable: true })
    .isArray()
    .withMessage("Specialties must be an array"),
];

// @route   GET /api/team
// @desc    Get all team members (Public)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { active = "true", hasPhoto } = req.query;

    // Build filter object
    const filter = {};
    if (active !== "all") filter.isActive = active === "true";
    if (hasPhoto !== undefined) filter.hasPhoto = hasPhoto === "true";

    const teamMembers = await TeamMember.find(filter).sort({
      displayOrder: 1,
      createdAt: 1,
    });

    res.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching team members",
    });
  }
});

// @route   GET /api/team/with-photos
// @desc    Get team members with photos (Public)
// @access  Public
router.get("/with-photos", async (req, res) => {
  try {
    const teamMembers = await TeamMember.find({
      isActive: true,
      hasPhoto: true,
    }).sort({ displayOrder: 1, createdAt: 1 });

    res.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error("Get team members with photos error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching team members with photos",
    });
  }
});

// @route   GET /api/team/without-photos
// @desc    Get team members without photos (Public)
// @access  Public
router.get("/without-photos", async (req, res) => {
  try {
    const teamMembers = await TeamMember.find({
      isActive: true,
      hasPhoto: false,
    }).sort({ displayOrder: 1, createdAt: 1 });

    res.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error("Get team members without photos error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching team members without photos",
    });
  }
});

// @route   POST /api/team
// @desc    Create new team member (Admin only)
// @access  Private/Admin
router.post(
  "/",
  verifyToken,
  requireAdmin,
  validateTeamMemberCreate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const teamMember = new TeamMember(req.body);
      await teamMember.save();

      res.status(201).json({
        success: true,
        message: "Team member created successfully",
        data: teamMember,
      });
    } catch (error) {
      console.error("Create team member error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating team member",
      });
    }
  }
);

// @route   GET /api/team/:id
// @desc    Get single team member (Admin only)
// @access  Private/Admin
router.get("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    console.error("Get team member error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching team member",
    });
  }
});

// @route   PUT /api/team/:id
// @desc    Update team member (Admin only)
// @access  Private/Admin
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  validateTeamMemberUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const teamMember = await TeamMember.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!teamMember) {
        return res.status(404).json({
          success: false,
          message: "Team member not found",
        });
      }

      res.json({
        success: true,
        message: "Team member updated successfully",
        data: teamMember,
      });
    } catch (error) {
      console.error("Update team member error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating team member",
      });
    }
  }
);

// @route   DELETE /api/team/:id
// @desc    Delete team member (Admin only)
// @access  Private/Admin
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const teamMember = await TeamMember.findByIdAndDelete(req.params.id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    // TODO: Delete image from UploadThing if imageKey exists
    // if (teamMember.imageKey) {
    //   await deleteUploadThingFile(teamMember.imageKey);
    // }

    res.json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    console.error("Delete team member error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting team member",
    });
  }
});

// @route   PUT /api/team/:id/reorder
// @desc    Update team member display order (Admin only)
// @access  Private/Admin
router.put("/:id/reorder", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { displayOrder } = req.body;

    if (typeof displayOrder !== "number" || displayOrder < 0) {
      return res.status(400).json({
        success: false,
        message: "Display order must be a positive number",
      });
    }

    const teamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { displayOrder },
      { new: true, runValidators: true }
    );

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.json({
      success: true,
      message: "Team member order updated successfully",
      data: teamMember,
    });
  } catch (error) {
    console.error("Reorder team member error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating team member order",
    });
  }
});

module.exports = router;
