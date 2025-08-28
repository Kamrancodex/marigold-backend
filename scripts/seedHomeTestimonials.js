const mongoose = require("mongoose");
const Testimonial = require("../models/Testimonial");
require("dotenv").config();

// Home page testimonials extracted from src/components/home/Testimonials.tsx
const homeTestimonials = [
  {
    clientNames: "Sarah & Michael Johnson",
    content:
      "Marigold Catering exceeded our expectations in every way. Their attention to detail and exceptional food made our wedding day absolutely perfect.",
    rating: 5,
    serviceType: "home",
    location: "",
    isActive: true,
    isFeatured: true,
    displayOrder: 1,
  },
  {
    clientNames: "Emily Chen",
    content:
      "The team at Marigold took care of everything, allowing us to focus on our guests. The presentation was stunning and the flavors were extraordinary.",
    rating: 5,
    serviceType: "home",
    location: "Corporate Gala",
    isActive: true,
    isFeatured: true,
    displayOrder: 2,
  },
  {
    clientNames: "Robert & Lisa Williams",
    content:
      "We've received countless compliments on the food and service. Marigold truly made our anniversary celebration a memorable experience.",
    rating: 5,
    serviceType: "home",
    location: "Anniversary Party",
    isActive: true,
    isFeatured: false,
    displayOrder: 3,
  },
];

const seedHomeTestimonials = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Remove existing home testimonials only
    await Testimonial.deleteMany({ serviceType: "home" });
    console.log("Cleared existing home testimonials");

    const inserted = await Testimonial.insertMany(homeTestimonials);
    console.log(`✅ Inserted ${inserted.length} home testimonials`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed home testimonials:", err);
    process.exit(1);
  }
};

seedHomeTestimonials();


