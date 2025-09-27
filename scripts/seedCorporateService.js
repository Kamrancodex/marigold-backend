require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("../models/Service");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Corporate Events Service Data
const corporateServiceData = {
  title: "Corporate Event Catering",
  slug: "corporate-events",
  subtitle: "Elevating business functions with exceptional dining",
  description: `Professional catering services for corporate meetings, conferences, galas, and business events in Northeast Ohio. From intimate business lunches to large corporate galas, we provide exceptional catering services that will impress your clients and colleagues.

Our corporate catering menu features fresh, high-quality ingredients prepared by our experienced culinary team. We offer flexible service options including full-service catering, drop-off catering, and corporate to-go menus.

Whether you're hosting a board meeting, company retreat, trade show, or annual celebration, our team will work with you to create a memorable dining experience that reflects your company's professionalism and attention to detail.`,
  heroImage: {
    url: "/co-events-4.avif",
    alt: "Corporate event setting with professional catering setup",
    key: "corporate-hero",
  },
  images: [
    {
      url: "/co-events-1.avif",
      alt: "Corporate catering breakfast setup",
      key: "corporate-1",
      displayOrder: 1,
      size: "large",
      caption: "Professional breakfast catering for corporate meetings",
    },
    {
      url: "/co-events-2.avif",
      alt: "Business lunch catering service",
      key: "corporate-2",
      displayOrder: 2,
      size: "large",
      caption: "Executive lunch service for important business meetings",
    },
    {
      url: "/co-events-3.avif",
      alt: "Corporate gala dinner setup",
      key: "corporate-3",
      displayOrder: 3,
      size: "large",
      caption: "Elegant corporate gala with sophisticated dining",
    },
    {
      url: "/corporate.avif",
      alt: "Corporate event catering overview",
      key: "corporate-4",
      displayOrder: 4,
      size: "medium",
      caption: "Full-service corporate event catering",
    },
  ],
  features: [
    "Professional presentation and service",
    "Flexible menu options for all dietary needs",
    "Full-service or drop-off catering available",
    "Corporate to-go menu for meetings",
    "Experienced event coordination team",
    "Setup, service, and cleanup included",
  ],
  categories: ["corporate", "business", "meetings", "conferences"],
  serviceType: "corporate",
  isActive: true,
  isFeatured: true,
  displayOrder: 2,
  pricing: {
    startingPrice: 12,
    priceUnit: "person",
    minimumOrder: 10,
    notes:
      "Pricing varies based on menu selection and service level. Contact us for detailed quotes.",
  },
  cta: {
    primary: {
      text: "Get Corporate Quote",
      link: "/contact",
    },
    secondary: {
      text: "View Corporate Menu",
      link: "#menu",
    },
  },
  seo: {
    metaTitle:
      "Corporate Event Catering | Professional Business Catering Northeast Ohio",
    metaDescription:
      "Professional corporate catering services in Northeast Ohio. Business lunches, meetings, conferences, galas. Exceptional food and service for your corporate events.",
    keywords: [
      "corporate catering Northeast Ohio",
      "business event catering",
      "conference catering",
      "office catering",
      "corporate lunch catering",
      "business meeting catering",
      "corporate gala catering",
      "professional catering services",
    ],
  },
  testimonials: [],
  relatedServices: ["wedding-services", "social-events"],
};

const seedCorporateService = async () => {
  try {
    await connectDB();

    // Check if corporate service already exists
    const existingService = await Service.findOne({ slug: "corporate-events" });

    if (existingService) {
      console.log("Corporate Events service already exists, updating...");
      await Service.findOneAndUpdate(
        { slug: "corporate-events" },
        corporateServiceData,
        { new: true, runValidators: true }
      );
      console.log("✅ Corporate Events service updated successfully");
    } else {
      console.log("Creating new Corporate Events service...");
      const corporateService = new Service(corporateServiceData);
      await corporateService.save();
      console.log("✅ Corporate Events service created successfully");
    }

    console.log("\n🎉 Corporate Events service seeded successfully!");
    console.log("\nService Details:");
    console.log(`- Title: ${corporateServiceData.title}`);
    console.log(`- Slug: ${corporateServiceData.slug}`);
    console.log(`- Images: ${corporateServiceData.images.length} images`);
    console.log(`- Features: ${corporateServiceData.features.length} features`);
    console.log(
      `- SEO Keywords: ${corporateServiceData.seo.keywords.length} keywords`
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedCorporateService();
