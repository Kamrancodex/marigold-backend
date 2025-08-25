const mongoose = require("mongoose");
const TeamMember = require("../models/TeamMember");
require("dotenv").config();

// Team data extracted from TeamSection.tsx
const teamMembersWithPhotos = [
  {
    name: "Melissa Marik",
    role: "COO",
    favoriteMenuItem: "Chicken Piccata",
    image: "/team2.avif",
    hasPhoto: true,
    displayOrder: 1,
  },
  {
    name: "Jamie DeJarnette",
    role: "Sales and Event Manager",
    favoriteMenuItem: "Filet Mignon",
    image: "/team3.avif",
    hasPhoto: true,
    displayOrder: 2,
  },
  {
    name: "Michelle Bryan",
    role: "Director of Catering and Events",
    favoriteMenuItem: "Lobster Ravioli",
    image: "/team4.avif",
    hasPhoto: true,
    displayOrder: 3,
  },
  {
    name: "Brandy Schran",
    role: "Director of Culinary",
    favoriteMenuItem: "Beef Tenderloin",
    image: "/team5.avif",
    hasPhoto: true,
    displayOrder: 4,
  },
  {
    name: "Leia Kaba",
    role: "Event Producer",
    favoriteMenuItem: "Pork Tenderloin",
    image: "/team9.avif",
    hasPhoto: true,
    displayOrder: 5,
  },
];

const teamMembersWithoutPhotos = [
  {
    name: "Jill Russell",
    role: "General Manager",
    hasPhoto: false,
    displayOrder: 101,
  },
  {
    name: "Mechelle Mack",
    role: "Sales Manager",
    hasPhoto: false,
    displayOrder: 102,
  },
  {
    name: "Erin Russ",
    role: "Venue Manager",
    hasPhoto: false,
    displayOrder: 103,
  },
  {
    name: "Kate Southall",
    role: "Venue Manager",
    hasPhoto: false,
    displayOrder: 104,
  },
  {
    name: "Kristina Crow",
    role: "Sales Manager",
    hasPhoto: false,
    displayOrder: 105,
  },
  {
    name: "Kathy Becks",
    role: "Sales Manager",
    hasPhoto: false,
    displayOrder: 106,
  },
  {
    name: "Alysa Nido",
    role: "Assistant Event Manager",
    hasPhoto: false,
    displayOrder: 107,
  },
  {
    name: "Kate Kuemerle",
    role: "Assistant Event Manager",
    hasPhoto: false,
    displayOrder: 108,
  },
  {
    name: "Stephanie Zickefoose",
    role: "Assistant Event Manager",
    hasPhoto: false,
    displayOrder: 109,
  },
  {
    name: "Faith Wilson",
    role: "Facilities Manager",
    hasPhoto: false,
    displayOrder: 110,
  },
  {
    name: "Bobby Coburn",
    role: "Facilities Manager",
    hasPhoto: false,
    displayOrder: 111,
  },
  {
    name: "Destiny Wilson",
    role: "Chef de Cuisine",
    hasPhoto: false,
    displayOrder: 112,
  },
  {
    name: "Dakota Pullins",
    role: "Chef de Cuisine",
    hasPhoto: false,
    displayOrder: 113,
  },
  {
    name: "Mack Hartman",
    role: "Pastry Chef",
    hasPhoto: false,
    displayOrder: 114,
  },
  {
    name: "Clay Hulme",
    role: "Catering Chef",
    hasPhoto: false,
    displayOrder: 115,
  },
  {
    name: "Logan Scott",
    role: "Catering Chef",
    hasPhoto: false,
    displayOrder: 116,
  },
  {
    name: "Tim Cordray",
    role: "Catering Chef",
    hasPhoto: false,
    displayOrder: 117,
  },
  {
    name: "Chrissy Hildum",
    role: "Catering Chef",
    hasPhoto: false,
    displayOrder: 118,
  },
];

const seedTeamMembers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing team members
    await TeamMember.deleteMany({});
    console.log("Cleared existing team members");

    // Combine all team members
    const allTeamMembers = [
      ...teamMembersWithPhotos,
      ...teamMembersWithoutPhotos,
    ];

    // Insert team members
    const insertedMembers = await TeamMember.insertMany(allTeamMembers);
    console.log(
      `✅ Successfully seeded ${insertedMembers.length} team members`
    );

    // Show summary
    const withPhotos = insertedMembers.filter(
      (member) => member.hasPhoto
    ).length;
    const withoutPhotos = insertedMembers.filter(
      (member) => !member.hasPhoto
    ).length;

    console.log(`📸 Team members with photos: ${withPhotos}`);
    console.log(`👤 Team members without photos: ${withoutPhotos}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding team members:", error);
    process.exit(1);
  }
};

// Run the seed function
seedTeamMembers();


