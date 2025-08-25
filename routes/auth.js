const express = require("express");
const router = express.Router();
const { authenticateUser, generateToken } = require("../middleware/auth");
const {
  validateLogin,
  handleValidationErrors,
} = require("../middleware/validation");

// @route   POST /api/auth/login
// @desc    Login admin user
// @access  Public
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { username, password } = req.body;

      // Authenticate user
      const user = await authenticateUser(username, password);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate token
      const token = generateToken(user);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
  }
);

// @route   POST /api/auth/verify
// @desc    Verify JWT token
// @access  Private
router.post(
  "/verify",
  require("../middleware/auth").verifyToken,
  (req, res) => {
    res.json({
      success: true,
      message: "Token is valid",
      data: {
        user: req.user,
      },
    });
  }
);

module.exports = router;
