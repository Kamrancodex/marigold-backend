require("dotenv").config();
const mongoose = require("mongoose");
const MenuItem = require("../models/MenuItem");
const CorporateService = require("../models/CorporateService");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Menu Items Data
const menuItemsData = [
  // Breakfast & Brunch
  {
    name: "Continental Breakfast Platter",
    price: 12,
    priceUnit: "person",
    category: "breakfast",
    subcategory: "Breakfast & Brunch",
    serviceType: "corporate",
    displayOrder: 1,
    isActive: true,
  },
  {
    name: "Executive Breakfast Boxes",
    price: 15,
    priceUnit: "person",
    category: "breakfast",
    subcategory: "Breakfast & Brunch",
    serviceType: "corporate",
    displayOrder: 2,
    isActive: true,
  },
  {
    name: "Fresh Fruit & Pastry Display",
    price: 10,
    priceUnit: "person",
    category: "breakfast",
    subcategory: "Breakfast & Brunch",
    serviceType: "corporate",
    displayOrder: 3,
    isActive: true,
  },
  {
    name: "Coffee & Tea Service",
    price: 5,
    priceUnit: "person",
    category: "beverages",
    subcategory: "Breakfast & Brunch",
    serviceType: "corporate",
    displayOrder: 4,
    isActive: true,
  },
  // Lunch Options
  {
    name: "Gourmet Sandwich Platters",
    price: 18,
    priceUnit: "person",
    category: "lunch",
    subcategory: "Lunch Options",
    serviceType: "corporate",
    displayOrder: 5,
    isActive: true,
  },
  {
    name: "Executive Lunch Boxes",
    price: 22,
    priceUnit: "person",
    category: "lunch",
    subcategory: "Lunch Options",
    serviceType: "corporate",
    displayOrder: 6,
    isActive: true,
  },
  {
    name: "Salad Bar Setup",
    price: 16,
    priceUnit: "person",
    category: "lunch",
    subcategory: "Lunch Options",
    serviceType: "corporate",
    displayOrder: 7,
    isActive: true,
  },
  {
    name: "Hot Entrée Buffet",
    price: 25,
    priceUnit: "person",
    category: "lunch",
    subcategory: "Lunch Options",
    serviceType: "corporate",
    displayOrder: 8,
    isActive: true,
  },
  // Meeting Packages
  {
    name: "Half-Day Package",
    price: 28,
    priceUnit: "person",
    category: "packages",
    subcategory: "Meeting Packages",
    serviceType: "corporate",
    displayOrder: 9,
    isActive: true,
    minimumOrder: 10,
    notes: "Includes setup, service, and cleanup",
  },
  {
    name: "Full-Day Package",
    price: 45,
    priceUnit: "person",
    category: "packages",
    subcategory: "Meeting Packages",
    serviceType: "corporate",
    displayOrder: 10,
    isActive: true,
    minimumOrder: 10,
    notes: "Includes setup, service, and cleanup",
  },
  {
    name: "Conference Package",
    price: 55,
    priceUnit: "person",
    category: "packages",
    subcategory: "Meeting Packages",
    serviceType: "corporate",
    displayOrder: 11,
    isActive: true,
    minimumOrder: 10,
    notes: "Includes setup, service, and cleanup",
  },
];

// Corporate Services Data
const corporateServicesData = [
  {
    title: "Business Lunches & Dinners",
    description:
      "Impress clients and colleagues with exceptional food and service.",
    displayOrder: 1,
    isActive: true,
  },
  {
    title: "Corporate Galas",
    description:
      "Elevate your annual events with sophisticated catering solutions.",
    displayOrder: 2,
    isActive: true,
  },
  {
    title: "Trade Shows & Conferences",
    description:
      "Keep attendees energized with quality refreshments throughout your event.",
    displayOrder: 3,
    isActive: true,
  },
  {
    title: "Team Building Events",
    description: "Foster collaboration through shared culinary experiences.",
    displayOrder: 4,
    isActive: true,
  },
];

const seedCorporateData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log("Clearing existing menu items and corporate services...");
    await MenuItem.deleteMany({ serviceType: "corporate" });
    await CorporateService.deleteMany({});

    // Seed menu items
    console.log("Seeding menu items...");
    for (const menuItem of menuItemsData) {
      const newMenuItem = new MenuItem(menuItem);
      await newMenuItem.save();
    }
    console.log(`✅ ${menuItemsData.length} menu items created`);

    // Seed corporate services
    console.log("Seeding corporate services...");
    for (const corporateService of corporateServicesData) {
      const newCorporateService = new CorporateService(corporateService);
      await newCorporateService.save();
    }
    console.log(
      `✅ ${corporateServicesData.length} corporate services created`
    );

    console.log("\n🎉 Corporate data seeded successfully!");
    console.log("\nCreated:");
    console.log(`- ${menuItemsData.length} Menu Items`);
    console.log(`- ${corporateServicesData.length} Corporate Services`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedCorporateData();
