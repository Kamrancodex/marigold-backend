require("dotenv").config();
const mongoose = require("mongoose");
const Service = require("../models/Service");
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

// Social Events Service Data
const socialServiceData = {
  title: "Social Event Catering",
  slug: "social-events",
  subtitle: "Creating memorable gatherings through exceptional food",
  description: `Exceptional catering services for birthdays, anniversaries, holiday parties, and all social gatherings in Cleveland, Ohio.

Excellent food and a beautiful setting are important, but quality service truly sets the guest experience apart. Besides special in-depth training, providing exceptional service comes down to the staff-to-guest ratio. These numbers determine important event factors, such as how quickly food is served, the length of bar lines and the efficiency of passing hors d'oeuvres.

Marigold is committed to providing excellent service along with our food and event planning. Our goal is to let you relax and enjoy your own event, hardly knowing a well-oiled service machine is operating in the background!

Together, our team provides multiple layers of quality control and cohesion in order to elevate and conduct your event effortlessly.`,
  heroImage: {
    url: "/Services, social HEADER.jpg",
    alt: "Elegant social event with champagne glasses and catering setup",
    key: "social-hero",
  },
  images: [
    {
      url: "/events-1.avif",
      alt: "Birthday party catering setup",
      key: "social-1",
      displayOrder: 1,
      size: "large",
      caption: "Beautiful birthday celebration with elegant catering",
    },
    {
      url: "/events-2.avif",
      alt: "Anniversary dinner catering",
      key: "social-2",
      displayOrder: 2,
      size: "large",
      caption: "Intimate anniversary dinner with personalized service",
    },
    {
      url: "/service.avif",
      alt: "Social event catering service",
      key: "social-3",
      displayOrder: 3,
      size: "medium",
      caption: "Professional service team ensuring seamless events",
    },
  ],
  features: [
    "Personalized menu planning for your occasion",
    "Professional service staff with excellent training",
    "Optimal staff-to-guest ratios for superior service",
    "Full event coordination and planning support",
    "Beautiful presentation and setup",
    "Flexible service options to fit your needs",
  ],
  staffRoles: [
    "Chefs & Cooks – to prepare, cook and plate up/serve the excellent food",
    "Event Manager(s) – typically the Event Planner you worked with, to oversee the entire event/vision, as well as staff, guests and vendors",
    "Server Captains – service leaders, keeping a close eye on and directing staff in regards to food & beverage",
    "Servers – to carry plates, clear, refill waters and generally service guests",
    "Bartenders – to, of course, serve drinks!",
    "And more!",
  ],
  categories: [
    "social",
    "birthday",
    "anniversary",
    "holiday",
    "graduation",
    "family",
  ],
  serviceType: "social",
  isActive: true,
  isFeatured: true,
  displayOrder: 3,
  pricing: {
    startingPrice: 25,
    priceUnit: "person",
    minimumOrder: 15,
    notes:
      "Pricing varies based on menu selection, guest count, and service level. Contact us for personalized quotes tailored to your special event.",
  },
  cta: {
    primary: {
      text: "Get Started",
      link: "/contact",
    },
    secondary: {
      text: "View Our Gallery",
      link: "#gallery",
    },
  },
  seo: {
    metaTitle:
      "Social Event Catering | Birthday, Anniversary & Holiday Catering Cleveland",
    metaDescription:
      "Exceptional catering services for birthdays, anniversaries, holiday parties, and all social gatherings in Cleveland, Ohio. Professional service and delicious food.",
    keywords: [
      "social event catering Cleveland",
      "birthday party catering",
      "anniversary catering",
      "holiday party catering",
      "graduation party catering",
      "family reunion catering",
      "social gathering catering",
      "party catering services",
    ],
  },
  testimonials: [],
  relatedServices: ["wedding-services", "corporate-events"],
};

// Social Event Types (as separate CorporateService entries with serviceType: "social")
const socialEventTypesData = [
  {
    title: "Birthdays & Anniversaries",
    description:
      "Celebrate life's milestones with delicious food and impeccable service.",
    displayOrder: 1,
    isActive: true,
    serviceType: "social",
  },
  {
    title: "Holiday Parties",
    description:
      "Make your seasonal celebrations memorable with festive menus tailored to the occasion.",
    displayOrder: 2,
    isActive: true,
    serviceType: "social",
  },
  {
    title: "Graduation Celebrations",
    description:
      "Honor academic achievements with a meal worthy of the accomplishment.",
    displayOrder: 3,
    isActive: true,
    serviceType: "social",
  },
  {
    title: "Family Reunions",
    description:
      "Bring everyone together around the table with food that pleases all generations.",
    displayOrder: 4,
    isActive: true,
    serviceType: "social",
  },
];

const seedSocialService = async () => {
  try {
    await connectDB();

    // Check if social service already exists
    const existingService = await Service.findOne({ slug: "social-events" });

    if (existingService) {
      console.log("Social Events service already exists, updating...");
      await Service.findOneAndUpdate(
        { slug: "social-events" },
        socialServiceData,
        { new: true, runValidators: true }
      );
      console.log("✅ Social Events service updated successfully");
    } else {
      console.log("Creating new Social Events service...");
      const socialService = new Service(socialServiceData);
      await socialService.save();
      console.log("✅ Social Events service created successfully");
    }

    // Clear existing social event types
    console.log("Clearing existing social event types...");
    await CorporateService.deleteMany({ serviceType: "social" });

    // Seed social event types
    console.log("Seeding social event types...");
    for (const eventType of socialEventTypesData) {
      const newEventType = new CorporateService(eventType);
      await newEventType.save();
    }
    console.log(`✅ ${socialEventTypesData.length} social event types created`);

    console.log("\n🎉 Social Events data seeded successfully!");
    console.log("\nCreated:");
    console.log(`- Social Events service page`);
    console.log(`- ${socialEventTypesData.length} Social Event Types`);
    console.log(`- ${socialServiceData.images.length} Gallery Images`);
    console.log(`- ${socialServiceData.features.length} Service Features`);
    console.log(`- ${socialServiceData.staffRoles.length} Staff Roles`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedSocialService();
