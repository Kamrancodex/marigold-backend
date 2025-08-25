require("dotenv").config();
const mongoose = require("mongoose");
const Venue = require("../models/Venue");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Function to create slug from venue name
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");
};

// Function to parse capacity string
const parseCapacity = (capacityStr) => {
  const seated = parseInt(capacityStr.match(/(\d+)\s+seated/)?.[1] || "0");
  const standing = parseInt(capacityStr.match(/(\d+)\s+standing/)?.[1] || "0");
  return { seated, standing, displayText: capacityStr };
};

// Function to determine venue types from style
const getVenueTypes = (style) => {
  const types = [];
  const styleStr = style.toLowerCase();

  if (styleStr.includes("ballroom") || styleStr.includes("classic"))
    types.push("Ballroom");
  if (styleStr.includes("barn") || styleStr.includes("rustic"))
    types.push("Barn");
  if (styleStr.includes("historic")) types.push("Historic");
  if (styleStr.includes("modern") || styleStr.includes("contemporary"))
    types.push("Modern");
  if (styleStr.includes("outdoor") || styleStr.includes("natural"))
    types.push("Outdoor");
  if (styleStr.includes("waterfront") || styleStr.includes("nautical"))
    types.push("Waterfront");
  if (styleStr.includes("industrial")) types.push("Industrial");
  if (styleStr.includes("museum") || styleStr.includes("cultural"))
    types.push("Museum");
  if (styleStr.includes("hotel") || styleStr.includes("boutique"))
    types.push("Hotel");
  if (styleStr.includes("farm")) types.push("Farm");
  if (styleStr.includes("winery")) types.push("Winery");
  if (styleStr.includes("lodge")) types.push("Lodge");
  if (styleStr.includes("garden")) types.push("Garden");

  return types.length > 0 ? types : ["Other"];
};

// Venues data from the existing hardcoded data
const venuesData = [
  // Marigold Exclusives
  {
    name: "Tenk West Bank",
    description:
      "A versatile industrial venue with modern amenities, perfect for contemporary celebrations and corporate events.",
    location: "Cleveland, OH",
    capacity: "300 seated, 500 standing",
    style: ["Industrial", "Modern"],
    priceRange: "$$$$",
    image: "/veneus/tenk_west_bank.avif",
    category: "Exclusive",
    isExclusive: true,
    website: "https://www.tenkwestbank.com/",
    hasOutdoorSpace: true,
  },
  {
    name: "Bellavie",
    description:
      "An elegant and sophisticated venue featuring timeless architecture and luxurious details for unforgettable events.",
    location: "Cleveland, OH",
    capacity: "200 seated, 350 standing",
    style: ["Elegant", "Traditional"],
    priceRange: "$$$",
    image: "/veneus/red_space.avif",
    category: "Exclusive",
    isExclusive: true,
    website: "https://www.bellavievenue.com/",
    hasOutdoorSpace: true,
  },
  {
    name: "RedSpace",
    description:
      "Red Space specializes in events that capture and exploit the imagination with creative and unique event experiences.",
    location: "Cleveland, OH",
    capacity: "150 seated, 250 standing",
    style: ["Creative", "Artistic"],
    priceRange: "$$",
    image:
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Exclusive",
    isExclusive: true,
    website: "https://www.redspaceevents.com/",
    hasOutdoorSpace: false,
  },

  // Featured Venues (only first 6 should be featured)
  {
    name: "Goodtime III",
    description:
      "Luxury yacht venue offering stunning views and elegant dining on the water.",
    location: "Cleveland, OH",
    capacity: "400 seated, 600 standing",
    style: ["Nautical", "Luxury"],
    priceRange: "$$$$",
    image: "/veneus/goldentime III.avif",
    category: "Featured",
    isFeatured: true,
    hasOutdoorSpace: true,
  },
  {
    name: "The Glidden House",
    description:
      "Historic boutique hotel with elegant event spaces and classic charm.",
    location: "University Circle, Cleveland",
    capacity: "150 seated, 200 standing",
    style: ["Historic", "Boutique"],
    priceRange: "$$$",
    image: "/veneus/Glidden_House.avif",
    category: "Featured",
    isFeatured: true,
    hasOutdoorSpace: true,
  },
  {
    name: "The Elliot",
    description:
      "Modern urban venue with industrial charm and sophisticated amenities.",
    location: "Cleveland, OH",
    capacity: "200 seated, 350 standing",
    style: ["Modern", "Industrial"],
    priceRange: "$$$",
    image: "/veneus/the_elliot.avif",
    category: "Featured",
    isFeatured: true,
    hasOutdoorSpace: false,
  },
  {
    name: "The Madison",
    description:
      "Elegant downtown venue with art deco styling and premium event services.",
    location: "Downtown Cleveland",
    capacity: "300 seated, 450 standing",
    style: ["Art Deco", "Elegant"],
    priceRange: "$$$$",
    image: "/veneus/the_madison.avif",
    category: "Featured",
    isFeatured: true,
    hasOutdoorSpace: false,
  },
  {
    name: "Cleveland History Center",
    description:
      "Historic cultural venue showcasing Cleveland's heritage with sophisticated event spaces.",
    location: "Cleveland, OH",
    capacity: "250 seated, 400 standing",
    style: ["Historic", "Cultural"],
    priceRange: "$$$",
    image: "/veneus/cleveland_history_center.avif",
    category: "Featured",
    isFeatured: true,
    hasOutdoorSpace: true,
  },
  {
    name: "The Akron Art Museum",
    description:
      "Contemporary art museum offering unique spaces surrounded by inspiring collections.",
    location: "Akron, OH",
    capacity: "200 seated, 300 standing",
    style: ["Contemporary", "Artistic"],
    priceRange: "$$$",
    image: "/veneus/akron_art_meusium.avif",
    category: "Featured",
    isFeatured: true,
    hasOutdoorSpace: false,
  },
  // Partner Venues (all remaining venues)
  {
    name: "Hines Hill Conference Center",
    description:
      "Rustic conference center nestled in rolling hills with scenic views.",
    location: "Cuyahoga Valley, OH",
    capacity: "180 seated, 250 standing",
    style: ["Rustic", "Natural"],
    priceRange: "$$",
    image: "/veneus/hines_hill_centre.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "Happy Days Lodge",
    description:
      "Charming lodge venue perfect for intimate gatherings and rustic celebrations.",
    location: "Peninsula, OH",
    capacity: "120 seated, 180 standing",
    style: ["Lodge", "Rustic"],
    priceRange: "$$",
    image: "/veneus/Happy_Days.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "Himelright Lodge",
    description:
      "Mountain-style lodge offering breathtaking views and cozy indoor spaces.",
    location: "Northeast Ohio",
    capacity: "100 seated, 150 standing",
    style: ["Mountain", "Lodge"],
    priceRange: "$$",
    image: "/veneus/Himelright-Lodge.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "Ariel International",
    description:
      "Sophisticated international venue with modern amenities and global flair.",
    location: "Cleveland, OH",
    capacity: "300 seated, 500 standing",
    style: ["International", "Modern"],
    priceRange: "$$$$",
    image: "/veneus/aRIEL-PEARL.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: false,
  },
  {
    name: "Ariel Pearl",
    description:
      "Elegant waterfront venue with pearl-inspired design and luxurious details.",
    location: "Cleveland, OH",
    capacity: "200 seated, 300 standing",
    style: ["Waterfront", "Luxury"],
    priceRange: "$$$",
    image: "/veneus/ARIEL-PEARL_1.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "The Ballroom at Park Lane",
    description:
      "Grand ballroom with classic elegance and modern amenities for spectacular events.",
    location: "Cleveland, OH",
    capacity: "400 seated, 600 standing",
    style: ["Ballroom", "Classic"],
    priceRange: "$$$$",
    image: "/veneus/ball_room_at_part_lane.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: false,
  },
  {
    name: "Nature Valley Lodge",
    description:
      "Natural lodge setting surrounded by pristine wilderness and scenic beauty.",
    location: "Cuyahoga Valley, OH",
    capacity: "150 seated, 220 standing",
    style: ["Natural", "Lodge"],
    priceRange: "$$",
    image: "/veneus/Nature_Valley_Lodge.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "159 Events on Main",
    description:
      "Historic venue on Main Street offering charming spaces for memorable celebrations.",
    location: "Medina, OH",
    capacity: "180 seated, 250 standing",
    style: ["Historic", "Main Street"],
    priceRange: "$$",
    image: "/veneus/159-Events-on-Main.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "White Birch Barn",
    description:
      "Picturesque barn venue surrounded by white birch trees and natural beauty.",
    location: "Northeast Ohio",
    capacity: "150 seated, 200 standing",
    style: ["Barn", "Natural"],
    priceRange: "$$",
    image: "/veneus/White-Birch-Barn.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "1885 Farms",
    description:
      "Historic farm estate dating back to 1885 with authentic charm and modern amenities.",
    location: "Northeast Ohio",
    capacity: "250 seated, 350 standing",
    style: ["Historic", "Farm"],
    priceRange: "$$$",
    image: "/veneus/1885-Farms.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "The Akron Zoo",
    description:
      "Unique zoo venue offering exotic backdrops and family-friendly event spaces.",
    location: "Akron, OH",
    capacity: "300 seated, 500 standing",
    style: ["Zoo", "Family"],
    priceRange: "$$$",
    image: "/veneus/Akron-Zoo.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "BAYarts",
    description:
      "Contemporary arts center offering creative spaces and inspiring artistic backdrops.",
    location: "Bay Village, OH",
    capacity: "150 seated, 250 standing",
    style: ["Arts", "Contemporary"],
    priceRange: "$$",
    image: "/veneus/bayarts.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "The Barn at Hart's Grove",
    description:
      "Restored barn venue in Hart's Grove offering rustic elegance and countryside charm.",
    location: "Hart's Grove, OH",
    capacity: "200 seated, 300 standing",
    style: ["Barn", "Rustic"],
    priceRange: "$$",
    image: "/veneus/the_barns_at_heart_grove.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "The Old Courthouse",
    description:
      "Historic courthouse venue with grand architecture and legal heritage charm.",
    location: "Cleveland, OH",
    capacity: "300 seated, 450 standing",
    style: ["Historic", "Legal"],
    priceRange: "$$$",
    image: "/veneus/the_old_courthouse.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: false,
  },
  {
    name: "Lake Erie Room at the Lake Erie Building",
    description:
      "Waterfront venue with panoramic Lake Erie views and modern event facilities.",
    location: "Cleveland, OH",
    capacity: "250 seated, 400 standing",
    style: ["Waterfront", "Modern"],
    priceRange: "$$$",
    image: "/veneus/lark_erie_room.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "Lake Affect Studios",
    description:
      "Creative studio space with lake-inspired design and flexible event layouts.",
    location: "Cleveland, OH",
    capacity: "100 seated, 150 standing",
    style: ["Studio", "Creative"],
    priceRange: "$$",
    image: "/veneus/lakeaffectstudios.jpg",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: false,
  },
  {
    name: "Linsalata Alumni Center",
    description:
      "University alumni center with academic charm and sophisticated event spaces.",
    location: "Cleveland, OH",
    capacity: "200 seated, 300 standing",
    style: ["Academic", "Alumni"],
    priceRange: "$$$",
    image: "/veneus/linsette_alumni_center.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "Market Square at Crocker Park",
    description:
      "Urban market square with shopping district charm and modern amenities.",
    location: "Westlake, OH",
    capacity: "300 seated, 500 standing",
    style: ["Market", "Urban"],
    priceRange: "$$$",
    image: "/veneus/market-square.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "Brookside Farm",
    description:
      "Working farm venue with brook views and authentic agricultural atmosphere.",
    location: "Northeast Ohio",
    capacity: "180 seated, 250 standing",
    style: ["Farm", "Brook"],
    priceRange: "$$",
    image: "/veneus/Brookside-Farm.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "Crown Point Ecology Center",
    description:
      "Eco-friendly venue surrounded by nature preserves and sustainable features.",
    location: "Bath, OH",
    capacity: "150 seated, 200 standing",
    style: ["Ecological", "Natural"],
    priceRange: "$$",
    image: "/veneus/Crown-Point-Ecology-Photo-2.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "The Treehouse",
    description:
      "Elevated treehouse venue offering unique perspectives and natural integration.",
    location: "Northeast Ohio",
    capacity: "80 seated, 120 standing",
    style: ["Treehouse", "Natural"],
    priceRange: "$$",
    image: "/veneus/The-Treehouse-Photo-2 (1).avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
  {
    name: "Pineview Acres",
    description:
      "Scenic acres venue with pine forest views and expansive outdoor spaces.",
    location: "Northeast Ohio",
    capacity: "220 seated, 350 standing",
    style: ["Acres", "Pine"],
    priceRange: "$$",
    image: "/veneus/Pine-View-Acres.avif",
    category: "Partner",
    isFeatured: false,
    hasOutdoorSpace: true,
  },
];

const seedVenues = async () => {
  try {
    await connectDB();

    // Clear existing venues
    console.log("Clearing existing venues...");
    await Venue.deleteMany({});

    console.log("Seeding venues...");
    let createdCount = 0;

    for (const venueData of venuesData) {
      try {
        // Parse capacity
        const capacity = parseCapacity(venueData.capacity);

        // Create venue object
        const venue = new Venue({
          name: venueData.name,
          slug: createSlug(venueData.name),
          description: venueData.description,
          location: venueData.location,
          capacity: capacity,
          style: venueData.style,
          priceRange: venueData.priceRange,
          category: venueData.category,
          venueType: getVenueTypes(venueData.style.join(" ")),
          spaces: {
            hasOutdoorSpace: venueData.hasOutdoorSpace || false,
            hasIndoorSpace: true,
            hasParking: true,
          },
          images: venueData.image
            ? [
                {
                  url: venueData.image,
                  alt: `${venueData.name} venue`,
                  isPrimary: true,
                  displayOrder: 0,
                },
              ]
            : [],
          website: venueData.website || "",
          isActive: true,
          isFeatured: venueData.isFeatured || false,
          isExclusive: venueData.isExclusive || false,
          displayOrder: createdCount,
          features: [
            ...venueData.style.map((s) => `${s} style`),
            venueData.hasOutdoorSpace
              ? "Outdoor space available"
              : "Indoor venue",
            `Capacity up to ${capacity.standing} guests`,
          ],
          seo: {
            metaTitle: `${venueData.name} - ${venueData.location} | Marigold Catering + Events`,
            metaDescription: venueData.description,
            keywords: [
              venueData.name.toLowerCase(),
              ...venueData.style.map((s) => s.toLowerCase()),
              venueData.location.toLowerCase(),
              "wedding venue",
              "event space",
              "catering venue",
            ],
          },
          tags: [
            ...venueData.style.map((s) => s.toLowerCase()),
            venueData.category.toLowerCase(),
            venueData.hasOutdoorSpace ? "outdoor" : "indoor",
          ],
        });

        await venue.save();
        createdCount++;
        console.log(`✅ Created: ${venueData.name}`);
      } catch (error) {
        console.error(`❌ Failed to create ${venueData.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Venues seeded successfully!`);
    console.log(`\nCreated: ${createdCount} venues`);
    console.log(
      `- ${venuesData.filter((v) => v.isExclusive).length} Exclusive venues`
    );
    console.log(
      `- ${venuesData.filter((v) => v.isFeatured).length} Featured venues`
    );
    console.log(
      `- ${
        venuesData.filter((v) => v.category === "Partner").length
      } Partner venues`
    );

    // Show venue types created
    const venueTypes = [
      ...new Set(venuesData.flatMap((v) => getVenueTypes(v.style.join(" ")))),
    ];
    console.log(`- Venue types: ${venueTypes.join(", ")}`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedVenues();
