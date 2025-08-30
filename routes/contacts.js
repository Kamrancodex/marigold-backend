const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const {
  validateContact,
  handleValidationErrors,
} = require("../middleware/validation");
const { sendContactFormEmails } = require("../lib/emailService");

// @route   POST /api/contacts
// @desc    Submit contact form (Public)
// @access  Public
router.post("/", validateContact, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, phone, eventType, message } = req.body;

    const contact = new Contact({
      name,
      email,
      phone,
      eventType,
      message,
    });

    await contact.save();

    // Send emails (don't wait for them to complete - fire and forget)
    sendContactFormEmails(contact.toObject())
      .then((emailResults) => {
        console.log("Email sending results:", emailResults);

        // Log any email failures for monitoring
        if (!emailResults.adminNotification?.success) {
          console.error(
            "Admin notification failed:",
            emailResults.adminNotification?.error
          );
        }
        if (!emailResults.thankYou?.success) {
          console.error(
            "Thank you email failed:",
            emailResults.thankYou?.error
          );
        }
      })
      .catch((error) => {
        console.error("Email sending error:", error);
      });

    res.status(201).json({
      success: true,
      message: "Contact form submitted successfully",
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        eventType: contact.eventType,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting contact form",
    });
  }
});

// @route   GET /api/contacts
// @desc    Get all contacts (Admin only)
// @access  Private/Admin
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const eventType = req.query.eventType;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (eventType) filter.eventType = eventType;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get contacts with pagination and filtering
    const contacts = await Contact.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Contact.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: page,
          totalPages,
          totalContacts: total,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contacts",
    });
  }
});

// @route   GET /api/contacts/stats
// @desc    Get contact statistics (Admin only)
// @access  Private/Admin
router.get("/stats", verifyToken, requireAdmin, async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: "new" });
    const inProgressContacts = await Contact.countDocuments({
      status: "in_progress",
    });
    const completedContacts = await Contact.countDocuments({
      status: "completed",
    });

    // Get contacts by event type
    const eventTypeStats = await Contact.aggregate([
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent contacts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentContacts = await Contact.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({
      success: true,
      data: {
        totalContacts,
        newContacts,
        inProgressContacts,
        completedContacts,
        recentContacts,
        eventTypeStats,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
    });
  }
});

// @route   GET /api/contacts/:id
// @desc    Get single contact (Admin only)
// @access  Private/Admin
router.get("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Get contact error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contact",
    });
  }
});

// @route   PUT /api/contacts/:id
// @desc    Update contact (Admin only)
// @access  Private/Admin
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status, priority, notes, followUpDate } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;
    if (followUpDate) updateData.followUpDate = followUpDate;

    // Set contactedAt if status is being changed from 'new'
    if (status && status !== "new") {
      const contact = await Contact.findById(req.params.id);
      if (contact && contact.status === "new") {
        updateData.contactedAt = new Date();
      }
    }

    const contact = await Contact.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      message: "Contact updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating contact",
    });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete contact (Admin only)
// @access  Private/Admin
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting contact",
    });
  }
});

module.exports = router;
