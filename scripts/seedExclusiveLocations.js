require("dotenv").config();
const mongoose = require("mongoose");
const ExclusiveLocation = require("../models/ExclusiveLocation");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");
};

const exclusiveLocationsData = [
  {
    name: "RedSpace",
    slug: createSlug("RedSpace"),
    location: "Cleveland, OH",
    description:
      "A vibrant contemporary venue featuring modern design elements and flexible event spaces.",
    capacity: "200 guests",
    image: {
      url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      alt: "RedSpace venue interior",
      width: 800,
      height: 533,
    },
    features: [
      "Modern Design",
      "Flexible Event Spaces",
      "Contemporary Lighting",
    ],
    amenities: ["Full Bar", "Sound System", "Parking", "Climate Control"],
    priceRange: "$$$",
    contactInfo: {
      phone: "(216) 555-0101",
      email: "events@redspace.com",
      website: "https://redspace.com",
    },
    address: {
      street: "123 Modern Ave",
      city: "Cleveland",
      state: "OH",
      zipCode: "44113",
    },
    isActive: true,
    isFeatured: true,
    displayOrder: 1,
    availabilityStatus: "Available",
    seo: {
      metaTitle:
        "RedSpace - Modern Event Venue in Cleveland | Marigold Catering",
      metaDescription:
        "Experience RedSpace, a vibrant contemporary venue featuring modern design elements and flexible event spaces in Cleveland, OH.",
      keywords: [
        "modern venue",
        "event space",
        "Cleveland",
        "contemporary",
        "flexible spaces",
      ],
    },
    socialMedia: {
      instagram: "https://instagram.com/redspacecleveland",
      facebook: "https://facebook.com/redspacevenue",
    },
    tags: ["modern", "contemporary", "flexible", "downtown"],
  },
  {
    name: "Bellaive",
    slug: createSlug("Bellaive"),
    location: "Cleveland, OH",
    description:
      "An elegant venue combining classic charm with modern sophistication for unforgettable events.",
    capacity: "275 guests",
    image: {
      url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      alt: "Bellaive elegant ballroom",
      width: 800,
      height: 533,
    },
    features: [
      "Classic Charm",
      "Modern Sophistication",
      "Grand Ballroom",
      "Crystal Chandeliers",
    ],
    amenities: [
      "Bridal Suite",
      "Full Kitchen",
      "Valet Parking",
      "Dance Floor",
      "Stage",
    ],
    priceRange: "$$$$",
    contactInfo: {
      phone: "(216) 555-0102",
      email: "events@bellaive.com",
      website: "https://bellaive.com",
    },
    address: {
      street: "456 Elegant Blvd",
      city: "Cleveland",
      state: "OH",
      zipCode: "44114",
    },
    isActive: true,
    isFeatured: true,
    displayOrder: 2,
    availabilityStatus: "Available",
    seo: {
      metaTitle:
        "Bellaive - Elegant Wedding & Event Venue in Cleveland | Marigold Catering",
      metaDescription:
        "Discover Bellaive, an elegant venue combining classic charm with modern sophistication for unforgettable events in Cleveland, OH.",
      keywords: [
        "elegant venue",
        "wedding venue",
        "ballroom",
        "Cleveland",
        "classic charm",
        "sophisticated",
      ],
    },
    socialMedia: {
      instagram: "https://instagram.com/bellaivevenue",
      facebook: "https://facebook.com/bellaive",
    },
    tags: ["elegant", "classic", "sophisticated", "ballroom", "wedding"],
  },
  {
    name: "Tenk West Bank",
    slug: createSlug("Tenk West Bank"),
    location: "Cleveland, OH",
    description:
      "A versatile industrial venue with modern amenities, perfect for contemporary celebrations.",
    capacity: "300 guests",
    image: {
      url: "/TENK.jpg",
      alt: "Tenk West Bank industrial venue",
      width: 800,
      height: 533,
    },
    features: [
      "Industrial Design",
      "Modern Amenities",
      "High Ceilings",
      "Exposed Brick",
      "Large Windows",
    ],
    amenities: [
      "Full Bar",
      "Commercial Kitchen",
      "Loading Dock",
      "Parking Lot",
      "AV Equipment",
    ],
    priceRange: "$$$",
    contactInfo: {
      phone: "(216) 555-0103",
      email: "events@tenkwestbank.com",
      website: "https://tenkwestbank.com",
    },
    address: {
      street: "789 Industrial Way",
      city: "Cleveland",
      state: "OH",
      zipCode: "44113",
    },
    isActive: true,
    isFeatured: true,
    displayOrder: 3,
    availabilityStatus: "Available",
    seo: {
      metaTitle:
        "Tenk West Bank - Industrial Event Venue in Cleveland | Marigold Catering",
      metaDescription:
        "Experience Tenk West Bank, a versatile industrial venue with modern amenities, perfect for contemporary celebrations in Cleveland, OH.",
      keywords: [
        "industrial venue",
        "event space",
        "Cleveland",
        "contemporary",
        "modern amenities",
        "versatile",
      ],
    },
    socialMedia: {
      instagram: "https://instagram.com/tenkwestbank",
      facebook: "https://facebook.com/tenkwestbank",
    },
    tags: ["industrial", "contemporary", "versatile", "modern", "west bank"],
  },
];

const seedExclusiveLocations = async () => {
  try {
    await connectDB();

    console.log("Clearing existing exclusive locations...");
    await ExclusiveLocation.deleteMany({});

    console.log("Seeding exclusive locations...");

    let createdCount = 0;
    for (const locationData of exclusiveLocationsData) {
      try {
        const location = new ExclusiveLocation(locationData);
        await location.save();
        console.log(`✅ Created: ${location.name}`);
        createdCount++;
      } catch (error) {
        console.error(
          `❌ Failed to create ${locationData.name}:`,
          error.message
        );
      }
    }

    console.log(`\n🎉 Exclusive locations seeded successfully!`);
    console.log(`\nCreated: ${createdCount} locations`);
    console.log(
      `- ${
        exclusiveLocationsData.filter((l) => l.isFeatured).length
      } featured locations`
    );
    console.log(
      `- ${
        exclusiveLocationsData.filter((l) => l.isActive).length
      } active locations`
    );

    const priceRanges = [
      ...new Set(exclusiveLocationsData.map((l) => l.priceRange)),
    ];
    console.log(`- Price ranges: ${priceRanges.join(", ")}`);
  } catch (error) {
    console.error("Error seeding exclusive locations:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

// Run the seeding function
seedExclusiveLocations();
