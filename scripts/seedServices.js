require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("../models/Service");
const Testimonial = require("../models/Testimonial");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const weddingServiceData = {
  title: "Wedding Catering",
  slug: "wedding-services",
  subtitle: "Making your special day even more memorable",
  description:
    "At Marigold Catering + Events, weddings are the largest part of our business. We absolutely love any kind of love, and we want to celebrate with you!",
  heroImage: {
    url: "/wedding.avif",
    alt: "Elegant wedding table setting",
  },
  images: [
    {
      url: "/wedding-1.avif",
      alt: "Elegant Wedding Reception",
      key: "wedding-1",
      displayOrder: 1,
    },
    {
      url: "/wedding.avif",
      alt: "Wedding Table Setting",
      key: "wedding-2",
      displayOrder: 2,
    },
    {
      url: "/events-1.avif",
      alt: "Wedding Ceremony Setup",
      key: "events-1",
      displayOrder: 3,
    },
    {
      url: "/events-2.avif",
      alt: "Wedding Reception Details",
      key: "events-2",
      displayOrder: 4,
    },
    {
      url: "/events-3.avif",
      alt: "Wedding Catering Service",
      key: "events-3",
      displayOrder: 5,
    },
  ],
  ctaText: "Plan Your Perfect Day",
  ctaLink: "/contact",
  isActive: true,
  displayOrder: 1,
  seoTitle: "Wedding Catering | Marigold Catering + Events",
  seoDescription:
    "Tailored wedding catering solutions for your special day. From intimate gatherings to large celebrations in Cleveland, Ohio.",
  seoKeywords:
    "wedding catering, wedding food, wedding reception catering, wedding menu, Cleveland wedding",
};

const testimonialData = [
  {
    clientNames: "Sarah & Michael",
    content:
      "Marigold Catering made our wedding day absolutely perfect. The food was incredible, the service was impeccable, and they took care of everything so we could enjoy our special day.",
    rating: 5,
    serviceType: "wedding",
    isActive: true,
    isFeatured: true,
    displayOrder: 1,
  },
  {
    clientNames: "Jessica & David",
    content:
      "Our guests are still raving about the food at our wedding! Marigold's attention to detail and ability to accommodate our unique requests made them the perfect choice for our celebration.",
    rating: 5,
    serviceType: "wedding",
    isActive: true,
    isFeatured: true,
    displayOrder: 2,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log("Clearing existing services and testimonials...");
    await Service.deleteMany({});
    await Testimonial.deleteMany({});

    // Seed wedding service
    console.log("Seeding wedding service...");
    const service = new Service(weddingServiceData);
    await service.save();
    console.log("✅ Wedding service created");

    // Seed testimonials
    console.log("Seeding testimonials...");
    for (const testimonial of testimonialData) {
      const newTestimonial = new Testimonial(testimonial);
      await newTestimonial.save();
    }
    console.log(`✅ ${testimonialData.length} testimonials created`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\nCreated:");
    console.log(`- 1 Wedding Service`);
    console.log(`- ${testimonialData.length} Testimonials`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDatabase();
