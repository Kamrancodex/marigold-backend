const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/database");

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

// Apply rate limiting to all requests
app.use("/api/", limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
});

app.use("/api/auth/login", authLimiter);

// CORS configuration
const corsOptions = {
  origin: true, // Allow all origins for now
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: "*",
  credentials: true, // Disable credentials to allow wildcard
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Marigold Catering API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/contacts", require("./routes/contacts"));
app.use("/api/team", require("./routes/team"));
app.use("/api/services", require("./routes/services"));
app.use("/api/testimonials", require("./routes/testimonials"));
app.use("/api/menu-items", require("./routes/menuItems"));
app.use("/api/corporate-services", require("./routes/corporateServices"));
app.use("/api/venues", require("./routes/venues"));
app.use("/api/careers", require("./routes/careers"));
app.use("/api/exclusive-locations", require("./routes/exclusiveLocations"));
app.use("/api/uploads", require("./routes/uploads"));
app.use("/api/uploadthing", require("./routes/uploadthing"));

// Handle 404 routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  res.status(error.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Marigold Catering Backend Server Started
📍 Environment: ${process.env.NODE_ENV}
🌐 Port: ${PORT}
📊 Database: MongoDB Connected
🔐 Auth: JWT Enabled
⏰ Started at: ${new Date().toLocaleString()}
  `);
});

module.exports = app;
