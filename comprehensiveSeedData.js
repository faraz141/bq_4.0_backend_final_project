const mongoose = require("mongoose");
require("dotenv").config();

// Import Models
const User = require("./src/models/UserModel");
const Doctor = require("./src/models/doctorModel");
const Staff = require("./src/models/staffModel");
const Department = require("./src/models/deparmentModel");
const Appointment = require("./src/models/appointmentModel");
const Patient = require("./src/models/patientModel");

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MongoURI || "mongodb://localhost:27017/hospital_management"
    );
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Staff.deleteMany({});
    await Department.deleteMany({});
    await Appointment.deleteMany({});
    await Patient.deleteMany({});
    console.log("🗑️  Database cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing database:", error.message);
  }
};

// Helper function to generate dates (past and future)
const generateDate = (daysOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

// Helper function to get day name from date
const getDayName = (dateString) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date(dateString);
  return days[date.getDay()];
};

// Comprehensive Seed Data
const seedData = async () => {
  try {
    console.log("🌱 Starting COMPREHENSIVE seed data insertion...\n");
    console.log("=".repeat(70));

    // 1. Create Departments (10 departments for diverse analytics)
    console.log("\n📂 Creating Departments...");
    const departments = await Department.insertMany([
      {
        name: "Cardiology",
        code: "CARD",
        description: "Heart and cardiovascular system care",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Neurology",
        code: "NEUR",
        description: "Brain and nervous system treatment",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Orthopedics",
        code: "ORTH",
        description: "Bone, joint, and muscle care",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Pediatrics",
        code: "PEDI",
        description: "Children healthcare and treatment",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Dermatology",
        code: "DERM",
        description: "Skin, hair, and nail treatment",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Emergency",
        code: "EMRG",
        description: "Emergency and critical care",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "General Medicine",
        code: "GENM",
        description: "General healthcare and consultation",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Oncology",
        code: "ONCO",
        description: "Cancer treatment and care",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Psychiatry",
        code: "PSYC",
        description: "Mental health and behavioral treatment",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Radiology",
        code: "RADI",
        description: "Medical imaging and diagnostics",
        createdBy: new mongoose.Types.ObjectId(),
      },
    ]);
    console.log(`✅ Created ${departments.length} departments`);

    // 2. Create Admin Users (3 admins for testing)
    console.log("\n👑 Creating Admin Users...");
    const adminUsers = await User.insertMany([
      {
        name: "Dr. Sarah Wilson",
        email: "admin@hospital.com",
        password: "admin123",
        role: "admin",
        age: 45,
        gender: "Female",
        contact: "+1-555-0001",
        address: "123 Hospital Admin St, Medical City, MC 12345",
      },
      {
        name: "Michael Chen",
        email: "subadmin@hospital.com",
        password: "subadmin123",
        role: "subadmin",
        age: 38,
        gender: "Male",
        contact: "+1-555-0002",
        address: "456 Admin Ave, Medical City, MC 12346",
      },
      {
        name: "Jennifer Martinez",
        email: "admin2@hospital.com",
        password: "admin123",
        role: "admin",
        age: 42,
        gender: "Female",
        contact: "+1-555-0003",
        address: "789 Management Blvd, Medical City, MC 12347",
      },
    ]);
    console.log(`✅ Created ${adminUsers.length} admin users`);

    // 3. Create Doctors (20 doctors across all departments)
    console.log("\n👨‍⚕️ Creating Doctors...");
    const doctors = await Doctor.insertMany([
      // Cardiology - 3 doctors
      {
        name: "Dr. James Rodriguez",
        email: "dr.james@hospital.com",
        password: "doctor123",
        specialization: "Cardiology",
        departmentId: departments[0]._id,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: [
          { startTime: "08:00", endTime: "08:30" },
          { startTime: "08:30", endTime: "09:00" },
          { startTime: "09:00", endTime: "09:30" },
          { startTime: "09:30", endTime: "10:00" },
          { startTime: "10:00", endTime: "10:30" },
          { startTime: "10:30", endTime: "11:00" },
          { startTime: "14:00", endTime: "14:30" },
          { startTime: "14:30", endTime: "15:00" },
          { startTime: "15:00", endTime: "15:30" },
          { startTime: "15:30", endTime: "16:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. Catherine White",
        email: "dr.catherine@hospital.com",
        password: "doctor123",
        specialization: "Cardiology",
        departmentId: departments[0]._id,
        availableDays: ["Monday", "Wednesday", "Friday"],
        timeSlots: [
          { startTime: "09:00", endTime: "09:30" },
          { startTime: "09:30", endTime: "10:00" },
          { startTime: "10:00", endTime: "10:30" },
          { startTime: "10:30", endTime: "11:00" },
          { startTime: "13:00", endTime: "13:30" },
          { startTime: "13:30", endTime: "14:00" },
          { startTime: "14:00", endTime: "14:30" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. Thomas Anderson",
        email: "dr.thomas@hospital.com",
        password: "doctor123",
        specialization: "Cardiology",
        departmentId: departments[0]._id,
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        timeSlots: [
          { startTime: "08:00", endTime: "08:30" },
          { startTime: "08:30", endTime: "09:00" },
          { startTime: "11:00", endTime: "11:30" },
          { startTime: "11:30", endTime: "12:00" },
          { startTime: "15:00", endTime: "15:30" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },

      // Neurology - 2 doctors
      {
        name: "Dr. Emily Thompson",
        email: "dr.emily@hospital.com",
        password: "doctor123",
        specialization: "Neurology",
        departmentId: departments[1]._id,
        availableDays: ["Monday", "Wednesday", "Friday"],
        timeSlots: [
          { startTime: "08:00", endTime: "08:30" },
          { startTime: "08:30", endTime: "09:00" },
          { startTime: "09:00", endTime: "09:30" },
          { startTime: "09:30", endTime: "10:00" },
          { startTime: "13:00", endTime: "13:30" },
          { startTime: "13:30", endTime: "14:00" },
          { startTime: "14:00", endTime: "14:30" },
          { startTime: "14:30", endTime: "15:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. Benjamin Foster",
        email: "dr.benjamin@hospital.com",
        password: "doctor123",
        specialization: "Neurology",
        departmentId: departments[1]._id,
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        timeSlots: [
          { startTime: "10:00", endTime: "10:30" },
          { startTime: "10:30", endTime: "11:00" },
          { startTime: "11:00", endTime: "11:30" },
          { startTime: "14:00", endTime: "14:30" },
          { startTime: "14:30", endTime: "15:00" },
          { startTime: "15:00", endTime: "15:30" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },

      // Orthopedics - 2 doctors
      {
        name: "Dr. Robert Kim",
        email: "dr.robert@hospital.com",
        password: "doctor123",
        specialization: "Orthopedics",
        departmentId: departments[2]._id,
        availableDays: ["Monday", "Tuesday", "Thursday", "Friday"],
        timeSlots: [
          { startTime: "09:00", endTime: "09:30" },
          { startTime: "09:30", endTime: "10:00" },
          { startTime: "10:00", endTime: "10:30" },
          { startTime: "10:30", endTime: "11:00" },
          { startTime: "11:00", endTime: "11:30" },
          { startTime: "15:00", endTime: "15:30" },
          { startTime: "15:30", endTime: "16:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. Rachel Green",
        email: "dr.rachel@hospital.com",
        password: "doctor123",
        specialization: "Orthopedics",
        departmentId: departments[2]._id,
        availableDays: ["Wednesday", "Friday", "Saturday"],
        timeSlots: [
          { startTime: "08:00", endTime: "08:30" },
          { startTime: "08:30", endTime: "09:00" },
          { startTime: "13:00", endTime: "13:30" },
          { startTime: "13:30", endTime: "14:00" },
          { startTime: "14:00", endTime: "14:30" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },

      // Pediatrics - 2 doctors
      {
        name: "Dr. Lisa Patel",
        email: "dr.lisa@hospital.com",
        password: "doctor123",
        specialization: "Pediatrics",
        departmentId: departments[3]._id,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: [
          { startTime: "08:00", endTime: "08:30" },
          { startTime: "08:30", endTime: "09:00" },
          { startTime: "09:00", endTime: "09:30" },
          { startTime: "09:30", endTime: "10:00" },
          { startTime: "14:00", endTime: "14:30" },
          { startTime: "14:30", endTime: "15:00" },
          { startTime: "15:00", endTime: "15:30" },
          { startTime: "15:30", endTime: "16:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. William Turner",
        email: "dr.william@hospital.com",
        password: "doctor123",
        specialization: "Pediatrics",
        departmentId: departments[3]._id,
        availableDays: ["Monday", "Wednesday", "Friday"],
        timeSlots: [
          { startTime: "10:00", endTime: "10:30" },
          { startTime: "10:30", endTime: "11:00" },
          { startTime: "11:00", endTime: "11:30" },
          { startTime: "13:00", endTime: "13:30" },
          { startTime: "13:30", endTime: "14:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },

      // Dermatology - 2 doctors
      {
        name: "Dr. Ahmed Hassan",
        email: "dr.ahmed@hospital.com",
        password: "doctor123",
        specialization: "Dermatology",
        departmentId: departments[4]._id,
        availableDays: ["Monday", "Wednesday", "Friday"],
        timeSlots: [
          { startTime: "09:00", endTime: "09:30" },
          { startTime: "09:30", endTime: "10:00" },
          { startTime: "10:00", endTime: "10:30" },
          { startTime: "10:30", endTime: "11:00" },
          { startTime: "13:00", endTime: "13:30" },
          { startTime: "13:30", endTime: "14:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. Sophia Chang",
        email: "dr.sophia@hospital.com",
        password: "doctor123",
        specialization: "Dermatology",
        departmentId: departments[4]._id,
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        timeSlots: [
          { startTime: "08:00", endTime: "08:30" },
          { startTime: "08:30", endTime: "09:00" },
          { startTime: "14:00", endTime: "14:30" },
          { startTime: "14:30", endTime: "15:00" },
          { startTime: "15:00", endTime: "15:30" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },

      // Emergency - 2 doctors
      {
        name: "Dr. Maria Gonzalez",
        email: "dr.maria@hospital.com",
        password: "doctor123",
        specialization: "Emergency Medicine",
        departmentId: departments[5]._id,
        availableDays: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        timeSlots: [
          { startTime: "06:00", endTime: "06:30" },
          { startTime: "06:30", endTime: "07:00" },
          { startTime: "07:00", endTime: "07:30" },
          { startTime: "07:30", endTime: "08:00" },
          { startTime: "22:00", endTime: "22:30" },
          { startTime: "22:30", endTime: "23:00" },
          { startTime: "23:00", endTime: "23:30" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. Marcus Johnson",
        email: "dr.marcus@hospital.com",
        password: "doctor123",
        specialization: "Emergency Medicine",
        departmentId: departments[5]._id,
        availableDays: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        timeSlots: [
          { startTime: "08:00", endTime: "08:30" },
          { startTime: "08:30", endTime: "09:00" },
          { startTime: "16:00", endTime: "16:30" },
          { startTime: "16:30", endTime: "17:00" },
          { startTime: "20:00", endTime: "20:30" },
          { startTime: "20:30", endTime: "21:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },

      // General Medicine - 2 doctors
      {
        name: "Dr. David Brown",
        email: "dr.david@hospital.com",
        password: "doctor123",
        specialization: "General Medicine",
        departmentId: departments[6]._id,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: [
          { startTime: "08:00", endTime: "08:30" },
          { startTime: "08:30", endTime: "09:00" },
          { startTime: "09:00", endTime: "09:30" },
          { startTime: "09:30", endTime: "10:00" },
          { startTime: "10:00", endTime: "10:30" },
          { startTime: "14:00", endTime: "14:30" },
          { startTime: "14:30", endTime: "15:00" },
          { startTime: "15:00", endTime: "15:30" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. Olivia Martinez",
        email: "dr.olivia@hospital.com",
        password: "doctor123",
        specialization: "General Medicine",
        departmentId: departments[6]._id,
        availableDays: ["Monday", "Wednesday", "Friday", "Saturday"],
        timeSlots: [
          { startTime: "09:00", endTime: "09:30" },
          { startTime: "09:30", endTime: "10:00" },
          { startTime: "10:00", endTime: "10:30" },
          { startTime: "13:00", endTime: "13:30" },
          { startTime: "13:30", endTime: "14:00" },
          { startTime: "14:00", endTime: "14:30" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },

      // Oncology - 2 doctors
      {
        name: "Dr. Jennifer Lee",
        email: "dr.jennifer@hospital.com",
        password: "doctor123",
        specialization: "Oncology",
        departmentId: departments[7]._id,
        availableDays: ["Tuesday", "Thursday"],
        timeSlots: [
          { startTime: "09:00", endTime: "09:30" },
          { startTime: "09:30", endTime: "10:00" },
          { startTime: "10:00", endTime: "10:30" },
          { startTime: "10:30", endTime: "11:00" },
          { startTime: "13:00", endTime: "13:30" },
          { startTime: "13:30", endTime: "14:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. Christopher Davis",
        email: "dr.christopher@hospital.com",
        password: "doctor123",
        specialization: "Oncology",
        departmentId: departments[7]._id,
        availableDays: ["Monday", "Wednesday", "Friday"],
        timeSlots: [
          { startTime: "08:00", endTime: "08:30" },
          { startTime: "08:30", endTime: "09:00" },
          { startTime: "13:00", endTime: "13:30" },
          { startTime: "13:30", endTime: "14:00" },
          { startTime: "14:00", endTime: "14:30" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },

      // Psychiatry - 2 doctors
      {
        name: "Dr. Amanda Roberts",
        email: "dr.amanda@hospital.com",
        password: "doctor123",
        specialization: "Psychiatry",
        departmentId: departments[8]._id,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: [
          { startTime: "10:00", endTime: "10:30" },
          { startTime: "10:30", endTime: "11:00" },
          { startTime: "11:00", endTime: "11:30" },
          { startTime: "11:30", endTime: "12:00" },
          { startTime: "14:00", endTime: "14:30" },
          { startTime: "14:30", endTime: "15:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. Kevin Wright",
        email: "dr.kevin@hospital.com",
        password: "doctor123",
        specialization: "Psychiatry",
        departmentId: departments[8]._id,
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        timeSlots: [
          { startTime: "09:00", endTime: "09:30" },
          { startTime: "09:30", endTime: "10:00" },
          { startTime: "13:00", endTime: "13:30" },
          { startTime: "13:30", endTime: "14:00" },
          { startTime: "15:00", endTime: "15:30" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },

      // Radiology - 2 doctors
      {
        name: "Dr. Patricia Lewis",
        email: "dr.patricia@hospital.com",
        password: "doctor123",
        specialization: "Radiology",
        departmentId: departments[9]._id,
        availableDays: ["Monday", "Wednesday", "Friday"],
        timeSlots: [
          { startTime: "07:00", endTime: "07:30" },
          { startTime: "07:30", endTime: "08:00" },
          { startTime: "08:00", endTime: "08:30" },
          { startTime: "08:30", endTime: "09:00" },
          { startTime: "13:00", endTime: "13:30" },
          { startTime: "13:30", endTime: "14:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. Steven Hall",
        email: "dr.steven@hospital.com",
        password: "doctor123",
        specialization: "Radiology",
        departmentId: departments[9]._id,
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        timeSlots: [
          { startTime: "08:00", endTime: "08:30" },
          { startTime: "08:30", endTime: "09:00" },
          { startTime: "14:00", endTime: "14:30" },
          { startTime: "14:30", endTime: "15:00" },
          { startTime: "15:00", endTime: "15:30" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
    ]);
    console.log(`✅ Created ${doctors.length} doctors`);

    // 4. Create Staff Members (15 staff across departments)
    console.log("\n👥 Creating Staff Members...");
    const staff = await Staff.insertMany([
      // Cardiology Staff
      {
        name: "Alice Johnson",
        email: "alice.staff@hospital.com",
        password: "staff123",
        departmentId: departments[0]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Bob Martinez",
        email: "bob.staff@hospital.com",
        password: "staff123",
        departmentId: departments[0]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      // Neurology Staff
      {
        name: "Carol Davis",
        email: "carol.staff@hospital.com",
        password: "staff123",
        departmentId: departments[1]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      // Orthopedics Staff
      {
        name: "Daniel Wilson",
        email: "daniel.staff@hospital.com",
        password: "staff123",
        departmentId: departments[2]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      // Pediatrics Staff
      {
        name: "Emma Brown",
        email: "emma.staff@hospital.com",
        password: "staff123",
        departmentId: departments[3]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Frank Miller",
        email: "frank.staff@hospital.com",
        password: "staff123",
        departmentId: departments[3]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      // Dermatology Staff
      {
        name: "Grace Taylor",
        email: "grace.staff@hospital.com",
        password: "staff123",
        departmentId: departments[4]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      // Emergency Staff
      {
        name: "Henry Anderson",
        email: "henry.staff@hospital.com",
        password: "staff123",
        departmentId: departments[5]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Isabel Moore",
        email: "isabel.staff@hospital.com",
        password: "staff123",
        departmentId: departments[5]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      // General Medicine Staff
      {
        name: "Jack Thomas",
        email: "jack.staff@hospital.com",
        password: "staff123",
        departmentId: departments[6]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Karen White",
        email: "karen.staff@hospital.com",
        password: "staff123",
        departmentId: departments[6]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      // Oncology Staff
      {
        name: "Leo Harris",
        email: "leo.staff@hospital.com",
        password: "staff123",
        departmentId: departments[7]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      // Psychiatry Staff
      {
        name: "Maria Clark",
        email: "maria.staff@hospital.com",
        password: "staff123",
        departmentId: departments[8]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      // Radiology Staff
      {
        name: "Nathan Lewis",
        email: "nathan.staff@hospital.com",
        password: "staff123",
        departmentId: departments[9]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Olivia Walker",
        email: "olivia.staff@hospital.com",
        password: "staff123",
        departmentId: departments[9]._id,
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
    ]);
    console.log(`✅ Created ${staff.length} staff members`);

    // 5. Create Patients (50 patients for comprehensive testing)
    console.log("\n🤒 Creating Patients...");
    const patientData = [
      // Batch 1: 10 patients
      {
        name: "John Smith",
        email: "john.smith@email.com",
        contact: "+1-555-1001",
        age: 45,
        gender: "Male",
        address: "100 Main St, City, State 12345",
        emergencyContact: "+1-555-1002",
      },
      {
        name: "Mary Johnson",
        email: "mary.johnson@email.com",
        contact: "+1-555-1003",
        age: 38,
        gender: "Female",
        address: "200 Oak Ave, City, State 12346",
        emergencyContact: "+1-555-1004",
      },
      {
        name: "Robert Williams",
        email: "robert.williams@email.com",
        contact: "+1-555-1005",
        age: 52,
        gender: "Male",
        address: "300 Elm St, City, State 12347",
        emergencyContact: "+1-555-1006",
      },
      {
        name: "Patricia Brown",
        email: "patricia.brown@email.com",
        contact: "+1-555-1007",
        age: 41,
        gender: "Female",
        address: "400 Pine Rd, City, State 12348",
        emergencyContact: "+1-555-1008",
      },
      {
        name: "Michael Davis",
        email: "michael.davis@email.com",
        contact: "+1-555-1009",
        age: 35,
        gender: "Male",
        address: "500 Maple Dr, City, State 12349",
        emergencyContact: "+1-555-1010",
      },
      {
        name: "Linda Miller",
        email: "linda.miller@email.com",
        contact: "+1-555-1011",
        age: 47,
        gender: "Female",
        address: "600 Cedar Ln, City, State 12350",
        emergencyContact: "+1-555-1012",
      },
      {
        name: "James Wilson",
        email: "james.wilson@email.com",
        contact: "+1-555-1013",
        age: 29,
        gender: "Male",
        address: "700 Birch Ct, City, State 12351",
        emergencyContact: "+1-555-1014",
      },
      {
        name: "Barbara Moore",
        email: "barbara.moore@email.com",
        contact: "+1-555-1015",
        age: 55,
        gender: "Female",
        address: "800 Spruce Way, City, State 12352",
        emergencyContact: "+1-555-1016",
      },
      {
        name: "William Taylor",
        email: "william.taylor@email.com",
        contact: "+1-555-1017",
        age: 43,
        gender: "Male",
        address: "900 Willow Blvd, City, State 12353",
        emergencyContact: "+1-555-1018",
      },
      {
        name: "Elizabeth Anderson",
        email: "elizabeth.anderson@email.com",
        contact: "+1-555-1019",
        age: 36,
        gender: "Female",
        address: "1000 Ash Ave, City, State 12354",
        emergencyContact: "+1-555-1020",
      },

      // Batch 2: 10 more patients
      {
        name: "David Thomas",
        email: "david.thomas@email.com",
        contact: "+1-555-1021",
        age: 50,
        gender: "Male",
        address: "1100 Cherry St, City, State 12355",
        emergencyContact: "+1-555-1022",
      },
      {
        name: "Jennifer Jackson",
        email: "jennifer.jackson@email.com",
        contact: "+1-555-1023",
        age: 32,
        gender: "Female",
        address: "1200 Peach Dr, City, State 12356",
        emergencyContact: "+1-555-1024",
      },
      {
        name: "Richard White",
        email: "richard.white@email.com",
        contact: "+1-555-1025",
        age: 48,
        gender: "Male",
        address: "1300 Plum Ln, City, State 12357",
        emergencyContact: "+1-555-1026",
      },
      {
        name: "Susan Harris",
        email: "susan.harris@email.com",
        contact: "+1-555-1027",
        age: 44,
        gender: "Female",
        address: "1400 Apple Rd, City, State 12358",
        emergencyContact: "+1-555-1028",
      },
      {
        name: "Joseph Martin",
        email: "joseph.martin@email.com",
        contact: "+1-555-1029",
        age: 39,
        gender: "Male",
        address: "1500 Orange Way, City, State 12359",
        emergencyContact: "+1-555-1030",
      },
      {
        name: "Sarah Thompson",
        email: "sarah.thompson@email.com",
        contact: "+1-555-1031",
        age: 27,
        gender: "Female",
        address: "1600 Lemon Ct, City, State 12360",
        emergencyContact: "+1-555-1032",
      },
      {
        name: "Thomas Garcia",
        email: "thomas.garcia@email.com",
        contact: "+1-555-1033",
        age: 53,
        gender: "Male",
        address: "1700 Lime St, City, State 12361",
        emergencyContact: "+1-555-1034",
      },
      {
        name: "Karen Martinez",
        email: "karen.martinez@email.com",
        contact: "+1-555-1035",
        age: 31,
        gender: "Female",
        address: "1800 Grape Ave, City, State 12362",
        emergencyContact: "+1-555-1036",
      },
      {
        name: "Charles Robinson",
        email: "charles.robinson@email.com",
        contact: "+1-555-1037",
        age: 46,
        gender: "Male",
        address: "1900 Berry Blvd, City, State 12363",
        emergencyContact: "+1-555-1038",
      },
      {
        name: "Nancy Clark",
        email: "nancy.clark@email.com",
        contact: "+1-555-1039",
        age: 40,
        gender: "Female",
        address: "2000 Melon Dr, City, State 12364",
        emergencyContact: "+1-555-1040",
      },

      // Batch 3: 10 more patients
      {
        name: "Christopher Rodriguez",
        email: "christopher.rodriguez@email.com",
        contact: "+1-555-1041",
        age: 34,
        gender: "Male",
        address: "2100 Pear Ln, City, State 12365",
        emergencyContact: "+1-555-1042",
      },
      {
        name: "Margaret Lewis",
        email: "margaret.lewis@email.com",
        contact: "+1-555-1043",
        age: 58,
        gender: "Female",
        address: "2200 Banana Rd, City, State 12366",
        emergencyContact: "+1-555-1044",
      },
      {
        name: "Daniel Lee",
        email: "daniel.lee@email.com",
        contact: "+1-555-1045",
        age: 37,
        gender: "Male",
        address: "2300 Kiwi Way, City, State 12367",
        emergencyContact: "+1-555-1046",
      },
      {
        name: "Lisa Walker",
        email: "lisa.walker@email.com",
        contact: "+1-555-1047",
        age: 42,
        gender: "Female",
        address: "2400 Mango Ct, City, State 12368",
        emergencyContact: "+1-555-1048",
      },
      {
        name: "Paul Hall",
        email: "paul.hall@email.com",
        contact: "+1-555-1049",
        age: 51,
        gender: "Male",
        address: "2500 Papaya St, City, State 12369",
        emergencyContact: "+1-555-1050",
      },
      {
        name: "Betty Allen",
        email: "betty.allen@email.com",
        contact: "+1-555-1051",
        age: 49,
        gender: "Female",
        address: "2600 Coconut Ave, City, State 12370",
        emergencyContact: "+1-555-1052",
      },
      {
        name: "Mark Young",
        email: "mark.young@email.com",
        contact: "+1-555-1053",
        age: 33,
        gender: "Male",
        address: "2700 Avocado Blvd, City, State 12371",
        emergencyContact: "+1-555-1054",
      },
      {
        name: "Dorothy Hernandez",
        email: "dorothy.hernandez@email.com",
        contact: "+1-555-1055",
        age: 56,
        gender: "Female",
        address: "2800 Fig Dr, City, State 12372",
        emergencyContact: "+1-555-1056",
      },
      {
        name: "Donald King",
        email: "donald.king@email.com",
        contact: "+1-555-1057",
        age: 45,
        gender: "Male",
        address: "2900 Date Ln, City, State 12373",
        emergencyContact: "+1-555-1058",
      },
      {
        name: "Sandra Wright",
        email: "sandra.wright@email.com",
        contact: "+1-555-1059",
        age: 38,
        gender: "Female",
        address: "3000 Guava Rd, City, State 12374",
        emergencyContact: "+1-555-1060",
      },

      // Batch 4: 10 more patients
      {
        name: "Kenneth Lopez",
        email: "kenneth.lopez@email.com",
        contact: "+1-555-1061",
        age: 41,
        gender: "Male",
        address: "3100 Passion St, City, State 12375",
        emergencyContact: "+1-555-1062",
      },
      {
        name: "Ashley Hill",
        email: "ashley.hill@email.com",
        contact: "+1-555-1063",
        age: 28,
        gender: "Female",
        address: "3200 Dragon Ave, City, State 12376",
        emergencyContact: "+1-555-1064",
      },
      {
        name: "Steven Scott",
        email: "steven.scott@email.com",
        contact: "+1-555-1065",
        age: 54,
        gender: "Male",
        address: "3300 Star Blvd, City, State 12377",
        emergencyContact: "+1-555-1066",
      },
      {
        name: "Kimberly Green",
        email: "kimberly.green@email.com",
        contact: "+1-555-1067",
        age: 36,
        gender: "Female",
        address: "3400 Fruit Dr, City, State 12378",
        emergencyContact: "+1-555-1068",
      },
      {
        name: "Edward Adams",
        email: "edward.adams@email.com",
        contact: "+1-555-1069",
        age: 47,
        gender: "Male",
        address: "3500 Berry Ln, City, State 12379",
        emergencyContact: "+1-555-1070",
      },
      {
        name: "Donna Baker",
        email: "donna.baker@email.com",
        contact: "+1-555-1071",
        age: 43,
        gender: "Female",
        address: "3600 Garden Rd, City, State 12380",
        emergencyContact: "+1-555-1072",
      },
      {
        name: "Brian Gonzalez",
        email: "brian.gonzalez@email.com",
        contact: "+1-555-1073",
        age: 39,
        gender: "Male",
        address: "3700 Orchard Way, City, State 12381",
        emergencyContact: "+1-555-1074",
      },
      {
        name: "Carol Nelson",
        email: "carol.nelson@email.com",
        contact: "+1-555-1075",
        age: 52,
        gender: "Female",
        address: "3800 Grove Ct, City, State 12382",
        emergencyContact: "+1-555-1076",
      },
      {
        name: "Ronald Carter",
        email: "ronald.carter@email.com",
        contact: "+1-555-1077",
        age: 48,
        gender: "Male",
        address: "3900 Vine St, City, State 12383",
        emergencyContact: "+1-555-1078",
      },
      {
        name: "Michelle Mitchell",
        email: "michelle.mitchell@email.com",
        contact: "+1-555-1079",
        age: 35,
        gender: "Female",
        address: "4000 Tree Ave, City, State 12384",
        emergencyContact: "+1-555-1080",
      },

      // Batch 5: 10 more patients
      {
        name: "Anthony Perez",
        email: "anthony.perez@email.com",
        contact: "+1-555-1081",
        age: 44,
        gender: "Male",
        address: "4100 Forest Blvd, City, State 12385",
        emergencyContact: "+1-555-1082",
      },
      {
        name: "Emily Roberts",
        email: "emily.roberts@email.com",
        contact: "+1-555-1083",
        age: 30,
        gender: "Female",
        address: "4200 Wood Dr, City, State 12386",
        emergencyContact: "+1-555-1084",
      },
      {
        name: "Kevin Turner",
        email: "kevin.turner@email.com",
        contact: "+1-555-1085",
        age: 40,
        gender: "Male",
        address: "4300 Branch Ln, City, State 12387",
        emergencyContact: "+1-555-1086",
      },
      {
        name: "Melissa Phillips",
        email: "melissa.phillips@email.com",
        contact: "+1-555-1087",
        age: 37,
        gender: "Female",
        address: "4400 Leaf Rd, City, State 12388",
        emergencyContact: "+1-555-1088",
      },
      {
        name: "George Campbell",
        email: "george.campbell@email.com",
        contact: "+1-555-1089",
        age: 55,
        gender: "Male",
        address: "4500 Root Way, City, State 12389",
        emergencyContact: "+1-555-1090",
      },
      {
        name: "Deborah Parker",
        email: "deborah.parker@email.com",
        contact: "+1-555-1091",
        age: 46,
        gender: "Female",
        address: "4600 Stem Ct, City, State 12390",
        emergencyContact: "+1-555-1092",
      },
      {
        name: "Jason Evans",
        email: "jason.evans@email.com",
        contact: "+1-555-1093",
        age: 33,
        gender: "Male",
        address: "4700 Bloom St, City, State 12391",
        emergencyContact: "+1-555-1094",
      },
      {
        name: "Stephanie Edwards",
        email: "stephanie.edwards@email.com",
        contact: "+1-555-1095",
        age: 41,
        gender: "Female",
        address: "4800 Petal Ave, City, State 12392",
        emergencyContact: "+1-555-1096",
      },
      {
        name: "Ryan Collins",
        email: "ryan.collins@email.com",
        contact: "+1-555-1097",
        age: 29,
        gender: "Male",
        address: "4900 Seed Blvd, City, State 12393",
        emergencyContact: "+1-555-1098",
      },
      {
        name: "Rebecca Stewart",
        email: "rebecca.stewart@email.com",
        contact: "+1-555-1099",
        age: 38,
        gender: "Female",
        address: "5000 Plant Dr, City, State 12394",
        emergencyContact: "+1-555-1100",
      },
    ];

    // Create patients one by one to trigger pre-save hooks
    const patients = [];
    for (const patientInfo of patientData) {
      const patient = new Patient(patientInfo);
      await patient.save();
      patients.push(patient);
    }
    console.log(`✅ Created ${patients.length} patients`);

    // 6. Create Comprehensive Appointments (300+ appointments across 90 days)
    console.log("\n📅 Creating Comprehensive Appointments...");
    console.log("   (This may take a moment - creating 300+ appointments)");

    const appointments = [];
    const statuses = ["Attended", "Missed", "Booked"];

    // Create appointments for past 60 days (for analytics testing)
    for (let dayOffset = -60; dayOffset < 0; dayOffset++) {
      const appointmentDate = generateDate(dayOffset);
      const dayName = getDayName(appointmentDate);

      // For each day, create 4-6 appointments across different doctors
      const appointmentsPerDay = Math.floor(Math.random() * 3) + 4; // 4-6 appointments

      for (let i = 0; i < appointmentsPerDay; i++) {
        // Select a random doctor
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];

        // Check if doctor is available on this day
        if (!doctor.availableDays.includes(dayName)) {
          continue;
        }

        // Select a random time slot from doctor's available slots
        const timeSlot =
          doctor.timeSlots[Math.floor(Math.random() * doctor.timeSlots.length)];

        // Select a random patient
        const patient = patients[Math.floor(Math.random() * patients.length)];

        // For past appointments, assign realistic status
        // 85% Attended, 12% Missed, 3% Booked (old booked that should be marked missed)
        let status;
        const rand = Math.random();
        if (rand < 0.85) {
          status = "Attended";
        } else if (rand < 0.97) {
          status = "Missed";
        } else {
          status = "Booked"; // These will be caught by cron job
        }

        appointments.push({
          doctorId: doctor._id,
          patientId: patient._id,
          departmentId: doctor.departmentId,
          date: appointmentDate,
          time: timeSlot.startTime,
          status: status,
          createdBy: staff[Math.floor(Math.random() * staff.length)]._id,
        });
      }
    }

    // Create appointments for next 30 days (for future analytics and testing)
    for (let dayOffset = 0; dayOffset <= 30; dayOffset++) {
      const appointmentDate = generateDate(dayOffset);
      const dayName = getDayName(appointmentDate);

      // For each day, create 3-5 appointments
      const appointmentsPerDay = Math.floor(Math.random() * 3) + 3; // 3-5 appointments

      for (let i = 0; i < appointmentsPerDay; i++) {
        const doctor = doctors[Math.floor(Math.random() * doctors.length)];

        if (!doctor.availableDays.includes(dayName)) {
          continue;
        }

        const timeSlot =
          doctor.timeSlots[Math.floor(Math.random() * doctor.timeSlots.length)];
        const patient = patients[Math.floor(Math.random() * patients.length)];

        // Future appointments are all "Booked"
        appointments.push({
          doctorId: doctor._id,
          patientId: patient._id,
          departmentId: doctor.departmentId,
          date: appointmentDate,
          time: timeSlot.startTime,
          status: "Booked",
          createdBy: staff[Math.floor(Math.random() * staff.length)]._id,
        });
      }
    }

    // Insert all appointments
    const createdAppointments = await Appointment.insertMany(appointments);
    console.log(`✅ Created ${createdAppointments.length} appointments`);

    // 7. Generate Summary Statistics
    console.log("\n" + "=".repeat(70));
    console.log("\n🎉 COMPREHENSIVE SEED DATA CREATION COMPLETED! 🎉\n");
    console.log("=".repeat(70));
    console.log("\n📊 SUMMARY STATISTICS:\n");
    console.log(`📂 Departments:        ${departments.length}`);
    console.log(`👑 Admin Users:        ${adminUsers.length}`);
    console.log(`👨‍⚕️  Doctors:            ${doctors.length}`);
    console.log(`👥 Staff Members:      ${staff.length}`);
    console.log(`🤒 Patients:           ${patients.length}`);
    console.log(`📅 Appointments:       ${createdAppointments.length}`);

    // Appointment statistics
    const attendedCount = createdAppointments.filter(
      (a) => a.status === "Attended"
    ).length;
    const missedCount = createdAppointments.filter(
      (a) => a.status === "Missed"
    ).length;
    const bookedCount = createdAppointments.filter(
      (a) => a.status === "Booked"
    ).length;

    console.log("\n📈 APPOINTMENT BREAKDOWN:");
    console.log(
      `   ✅ Attended:         ${attendedCount} (${(
        (attendedCount / createdAppointments.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `   ❌ Missed:           ${missedCount} (${(
        (missedCount / createdAppointments.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `   📝 Booked:           ${bookedCount} (${(
        (bookedCount / createdAppointments.length) *
        100
      ).toFixed(1)}%)`
    );

    console.log("\n📅 DATE RANGE:");
    console.log(
      `   Past Data:          ${generateDate(-60)} to ${generateDate(-1)}`
    );
    console.log(`   Today:              ${generateDate(0)}`);
    console.log(
      `   Future Data:        ${generateDate(1)} to ${generateDate(30)}`
    );

    console.log("\n🏥 DEPARTMENT COVERAGE:");
    for (let i = 0; i < departments.length; i++) {
      const deptAppointments = createdAppointments.filter(
        (a) => a.departmentId.toString() === departments[i]._id.toString()
      );
      const deptDoctors = doctors.filter(
        (d) => d.departmentId.toString() === departments[i]._id.toString()
      );
      console.log(
        `   ${departments[i].name.padEnd(20)} - ${
          deptDoctors.length
        } doctors, ${deptAppointments.length} appointments`
      );
    }

    console.log("\n" + "=".repeat(70));
    console.log("\n✅ TEST CREDENTIALS:\n");
    console.log("Admin:");
    console.log("   Email: admin@hospital.com");
    console.log("   Password: admin123\n");
    console.log("SubAdmin:");
    console.log("   Email: subadmin@hospital.com");
    console.log("   Password: subadmin123\n");
    console.log("Doctor (Cardiology):");
    console.log("   Email: dr.james@hospital.com");
    console.log("   Password: doctor123\n");
    console.log("Staff (Cardiology):");
    console.log("   Email: alice.staff@hospital.com");
    console.log("   Password: staff123\n");

    console.log("=".repeat(70));
    console.log("\n🔍 ANALYTICS TESTING TIPS:\n");
    console.log("1️⃣  Doctors Monthly Report:");
    console.log("   GET /api/analytics/doctors-monthly?year=2025");
    console.log("\n2️⃣  Admin Dashboard:");
    console.log("   GET /api/analytics/admin-dashboard");
    console.log("\n3️⃣  Staff Daily Schedule:");
    console.log(
      "   GET /api/analytics/staff-daily-schedule?date=" + generateDate(0)
    );
    console.log("\n4️⃣  Missed vs Attended Report:");
    console.log("   GET /api/analytics/missed-vs-attended");
    console.log("\n5️⃣  Cron Job Status:");
    console.log("   GET /api/cron/status");
    console.log("\n6️⃣  Daily Statistics:");
    console.log("   GET /api/cron/daily-stats");

    console.log("\n" + "=".repeat(70));
    console.log("\n⏰ CRON JOB TESTING:\n");
    console.log("The following cron jobs are active:");
    console.log("1️⃣  Appointment Cleanup:  Runs at midnight (00:00)");
    console.log("2️⃣  Daily Statistics:     Runs at 6:00 AM");
    console.log("3️⃣  Weekly Cleanup:       Runs Sunday at 2:00 AM");
    console.log("4️⃣  Reminder Processing:  Runs every hour\n");
    console.log("To test cron jobs manually:");
    console.log("   POST /api/cron/update-missed-appointments");
    console.log("   POST /api/cron/generate-stats");

    console.log("\n" + "=".repeat(70));
    console.log("\n🎯 READY FOR COMPREHENSIVE TESTING! 🎯\n");
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("❌ Error creating seed data:", error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await clearDatabase();
  await seedData();

  console.log(
    "\n✅ Seed process completed. You can now close this connection."
  );
  console.log("   Press Ctrl+C or wait for auto-disconnect.\n");

  // Auto-disconnect after 5 seconds
  setTimeout(() => {
    mongoose.disconnect();
    console.log("👋 Disconnected from database.");
    process.exit(0);
  }, 5000);
};

main();
