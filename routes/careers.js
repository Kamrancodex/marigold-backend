const express = require("express");
const { body, validationResult } = require("express-validator");
const CareerApplication = require("../models/CareerApplication");
const { verifyToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Validation middleware for career application
const careerApplicationValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("role").notEmpty().withMessage("Desired role is required"),
  body("resume.url").notEmpty().withMessage("Resume file is required"),
  body("resume.originalName").notEmpty().withMessage("Resume file name is required"),
  body("resume.fileType").notEmpty().withMessage("Resume file type is required"),
  body("resume.fileSize").isNumeric().withMessage("Resume file size is required"),
  body("resume.key").notEmpty().withMessage("Resume file key is required"),
];

// GET /api/careers - Get all career applications (admin only)
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      status,
      role,
      archived = "false",
      limit = 50,
      page = 1,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let query = {};
    
    // Archived filter
    query.isArchived = archived === "true";
    
    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }
    
    // Role filter
    if (role && role !== "all") {
      query.role = { $regex: role, $options: "i" };
    }

    const pageSize = parseInt(limit);
    const skip = (parseInt(page) - 1) * pageSize;
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const applications = await CareerApplication.find(query)
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    const total = await CareerApplication.countDocuments(query);

    res.json({
      applications,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / pageSize),
        count: total,
        hasNext: skip + pageSize < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching career applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch career applications",
    });
  }
});

// GET /api/careers/stats - Get application statistics (admin only)
router.get("/stats", verifyToken, requireAdmin, async (req, res) => {
  try {
    const stats = await CareerApplication.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await CareerApplication.countDocuments({ isArchived: false });
    const recentApplications = await CareerApplication.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      isArchived: false
    });

    const roleStats = await CareerApplication.aggregate([
      { $match: { isArchived: false } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      statusStats: stats,
      totalApplications,
      recentApplications,
      roleStats,
    });
  } catch (error) {
    console.error("Error fetching career statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch career statistics",
    });
  }
});

// GET /api/careers/:id - Get career application by ID (admin only)
router.get("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const application = await CareerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Career application not found",
      });
    }

    res.json(application);
  } catch (error) {
    console.error("Error fetching career application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch career application",
    });
  }
});

// POST /api/careers - Submit new career application (public)
router.post("/", careerApplicationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const applicationData = {
      ...req.body,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    };

    const application = new CareerApplication(applicationData);
    await application.save();

    // Don't send back sensitive info to public
    const publicResponse = {
      id: application._id,
      name: application.name,
      email: application.email,
      role: application.role,
      status: application.status,
      createdAt: application.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "Career application submitted successfully",
      application: publicResponse,
    });
  } catch (error) {
    console.error("Error creating career application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit career application",
    });
  }
});

// PUT /api/careers/:id - Update career application (admin only)
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const allowedUpdates = [
      'status', 'notes', 'reviewedBy', 'reviewedAt', 
      'interviewDate', 'rating', 'tags'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Auto-set reviewedAt if status is being changed to reviewing
    if (updates.status === 'reviewing' && !updates.reviewedAt) {
      updates.reviewedAt = new Date();
    }

    const application = await CareerApplication.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Career application not found",
      });
    }

    res.json({
      success: true,
      message: "Career application updated successfully",
      application,
    });
  } catch (error) {
    console.error("Error updating career application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update career application",
    });
  }
});

// DELETE /api/careers/:id - Delete career application (admin only)
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const application = await CareerApplication.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Career application not found",
      });
    }

    res.json({
      success: true,
      message: "Career application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting career application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete career application",
    });
  }
});

// POST /api/careers/:id/archive - Archive career application (admin only)
router.post("/:id/archive", verifyToken, requireAdmin, async (req, res) => {
  try {
    const application = await CareerApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Career application not found",
      });
    }

    await application.archive();

    res.json({
      success: true,
      message: "Career application archived successfully",
      application,
    });
  } catch (error) {
    console.error("Error archiving career application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to archive career application",
    });
  }
});

module.exports = router;
