const mongoose = require("mongoose");
require("dotenv").config();

// Import Models
const User = require("./models/UserModel");
const Doctor = require("./models/doctorModel");
const Staff = require("./models/staffModel");
const Department = require("./models/deparmentModel");
const Appointment = require("./models/appointmentModel");

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
    console.log("🗑️ Database cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing database:", error.message);
  }
};

// Seed Data
const seedData = async () => {
  try {
    console.log("🌱 Starting seed data insertion...\n");

    // 1. Create Departments
    console.log("📂 Creating Departments...");
    const departments = await Department.insertMany([
      {
        name: "Cardiology",
        description: "Heart and cardiovascular system care",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Neurology",
        description: "Brain and nervous system treatment",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Orthopedics",
        description: "Bone, joint, and muscle care",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Pediatrics",
        description: "Children healthcare and treatment",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Dermatology",
        description: "Skin, hair, and nail treatment",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Emergency",
        description: "Emergency and critical care",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "General Medicine",
        description: "General healthcare and consultation",
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        name: "Oncology",
        description: "Cancer treatment and care",
        createdBy: new mongoose.Types.ObjectId(),
      },
    ]);
    console.log(`✅ Created ${departments.length} departments`);

    // 2. Create Admin Users
    console.log("\n👑 Creating Admin Users...");
    const adminUsers = await User.insertMany([
      {
        name: "Dr. Sarah Wilson",
        email: "admin@hospital.com",
        password: "admin123", // Will be hashed by pre-save middleware
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
    ]);
    console.log(`✅ Created ${adminUsers.length} admin users`);

    // 3. Create Doctors
    console.log("\n👨‍⚕️ Creating Doctors...");
    const doctors = await Doctor.insertMany([
      {
        name: "Dr. James Rodriguez",
        email: "dr.james@hospital.com",
        password: "doctor123",
        specialization: "Cardiology",
        departmentId: departments[0]._id,
        availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: [
          { startTime: "09:00", endTime: "09:30" },
          { startTime: "09:30", endTime: "10:00" },
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
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Dr. Robert Kim",
        email: "dr.robert@hospital.com",
        password: "doctor123",
        specialization: "Orthopedics",
        departmentId: departments[2]._id,
        availableDays: ["Tuesday", "Thursday", "Saturday"],
        timeSlots: [
          { startTime: "10:00", endTime: "10:30" },
          { startTime: "10:30", endTime: "11:00" },
          { startTime: "11:00", endTime: "11:30" },
          { startTime: "11:30", endTime: "12:00" },
          { startTime: "15:00", endTime: "15:30" },
          { startTime: "15:30", endTime: "16:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
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
          { startTime: "14:00", endTime: "14:30" },
          { startTime: "14:30", endTime: "15:00" },
          { startTime: "15:00", endTime: "15:30" },
          { startTime: "15:30", endTime: "16:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
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
          { startTime: "13:00", endTime: "13:30" },
          { startTime: "13:30", endTime: "14:00" },
        ],
        status: "Active",
        createdBy: adminUsers[0]._id,
      },
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
    ]);
    console.log(`✅ Created ${doctors.length} doctors`);

    // 4. Create Staff Members
    console.log("\n👥 Creating Staff Members...");
    const staff = await Staff.insertMany([
      {
        name: "Alice Johnson",
        email: "alice.staff@hospital.com",
        password: "staff123",
        departmentId: departments[0]._id, // Cardiology
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Bob Martinez",
        email: "bob.staff@hospital.com",
        password: "staff123",
        departmentId: departments[1]._id, // Neurology
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Carol Davis",
        email: "carol.staff@hospital.com",
        password: "staff123",
        departmentId: departments[2]._id, // Orthopedics
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Daniel Wilson",
        email: "daniel.staff@hospital.com",
        password: "staff123",
        departmentId: departments[3]._id, // Pediatrics
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Eva Anderson",
        email: "eva.staff@hospital.com",
        password: "staff123",
        departmentId: departments[4]._id, // Dermatology
        role: "subadmin",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Frank Taylor",
        email: "frank.staff@hospital.com",
        password: "staff123",
        departmentId: departments[5]._id, // Emergency
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Grace Miller",
        email: "grace.staff@hospital.com",
        password: "staff123",
        departmentId: departments[6]._id, // General Medicine
        role: "staff",
        createdBy: adminUsers[0]._id,
      },
      {
        name: "Henry Clark",
        email: "henry.staff@hospital.com",
        password: "staff123",
        departmentId: departments[7]._id, // Oncology
        role: "subadmin",
        createdBy: adminUsers[0]._id,
      },
    ]);
    console.log(`✅ Created ${staff.length} staff members`);

    // 5. Create Patient Users
    console.log("\n🤒 Creating Patient Users...");
    const patients = await User.insertMany([
      {
        name: "John Smith",
        email: "john.smith@email.com",
        password: "patient123",
        role: "patient",
        age: 45,
        gender: "Male",
        contact: "+1-555-1001",
        address: "789 Oak St, Hometown, HT 67890",
      },
      {
        name: "Emma Davis",
        email: "emma.davis@email.com",
        password: "patient123",
        role: "patient",
        age: 32,
        gender: "Female",
        contact: "+1-555-1002",
        address: "123 Pine Ave, Hometown, HT 67891",
      },
      {
        name: "Michael Johnson",
        email: "michael.johnson@email.com",
        password: "patient123",
        role: "patient",
        age: 28,
        gender: "Male",
        contact: "+1-555-1003",
        address: "456 Elm Dr, Hometown, HT 67892",
      },
      {
        name: "Sarah Williams",
        email: "sarah.williams@email.com",
        password: "patient123",
        role: "patient",
        age: 39,
        gender: "Female",
        contact: "+1-555-1004",
        address: "789 Maple Ln, Hometown, HT 67893",
      },
      {
        name: "David Brown",
        email: "david.brown@email.com",
        password: "patient123",
        role: "patient",
        age: 52,
        gender: "Male",
        contact: "+1-555-1005",
        address: "321 Cedar St, Hometown, HT 67894",
      },
      {
        name: "Lisa Wilson",
        email: "lisa.wilson@email.com",
        password: "patient123",
        role: "patient",
        age: 26,
        gender: "Female",
        contact: "+1-555-1006",
        address: "654 Birch Ave, Hometown, HT 67895",
      },
      {
        name: "Robert Taylor",
        email: "robert.taylor@email.com",
        password: "patient123",
        role: "patient",
        age: 41,
        gender: "Male",
        contact: "+1-555-1007",
        address: "987 Willow Dr, Hometown, HT 67896",
      },
      {
        name: "Jennifer Martinez",
        email: "jennifer.martinez@email.com",
        password: "patient123",
        role: "patient",
        age: 35,
        gender: "Female",
        contact: "+1-555-1008",
        address: "147 Spruce Ln, Hometown, HT 67897",
      },
      {
        name: "Christopher Anderson",
        email: "chris.anderson@email.com",
        password: "patient123",
        role: "patient",
        age: 33,
        gender: "Male",
        contact: "+1-555-1009",
        address: "258 Aspen St, Hometown, HT 67898",
      },
      {
        name: "Amanda Garcia",
        email: "amanda.garcia@email.com",
        password: "patient123",
        role: "patient",
        age: 29,
        gender: "Female",
        contact: "+1-555-1010",
        address: "369 Poplar Ave, Hometown, HT 67899",
      },
      {
        name: "Kevin Rodriguez",
        email: "kevin.rodriguez@email.com",
        password: "patient123",
        role: "patient",
        age: 47,
        gender: "Male",
        contact: "+1-555-1011",
        address: "741 Hickory Dr, Hometown, HT 67800",
      },
      {
        name: "Michelle Lee",
        email: "michelle.lee@email.com",
        password: "patient123",
        role: "patient",
        age: 31,
        gender: "Female",
        contact: "+1-555-1012",
        address: "852 Walnut Ln, Hometown, HT 67801",
      },
    ]);
    console.log(`✅ Created ${patients.length} patient users`);

    // 6. Create Appointments (Mixed past, current, and future)
    console.log("\n📅 Creating Appointments...");

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const appointments = await Appointment.insertMany([
      // Past appointments (completed/missed)
      {
        doctorId: doctors[0]._id,
        userId: patients[0]._id,
        departmentId: departments[0]._id,
        date: lastWeek.toISOString().slice(0, 10),
        time: "09:00",
        status: "Attended",
        createdBy: staff[0]._id,
      },
      {
        doctorId: doctors[1]._id,
        userId: patients[1]._id,
        departmentId: departments[1]._id,
        date: lastWeek.toISOString().slice(0, 10),
        time: "08:00",
        status: "Missed",
        createdBy: staff[1]._id,
      },
      {
        doctorId: doctors[2]._id,
        userId: patients[2]._id,
        departmentId: departments[2]._id,
        date: yesterday.toISOString().slice(0, 10),
        time: "10:00",
        status: "Attended",
        createdBy: staff[2]._id,
      },
      {
        doctorId: doctors[3]._id,
        userId: patients[3]._id,
        departmentId: departments[3]._id,
        date: yesterday.toISOString().slice(0, 10),
        time: "08:00",
        status: "Missed",
        createdBy: staff[3]._id,
      },

      // Today's appointments
      {
        doctorId: doctors[0]._id,
        userId: patients[4]._id,
        departmentId: departments[0]._id,
        date: today.toISOString().slice(0, 10),
        time: "09:30",
        status: "Booked",
        createdBy: staff[0]._id,
      },
      {
        doctorId: doctors[1]._id,
        userId: patients[5]._id,
        departmentId: departments[1]._id,
        date: today.toISOString().slice(0, 10),
        time: "08:30",
        status: "Booked",
        createdBy: staff[1]._id,
      },
      {
        doctorId: doctors[4]._id,
        userId: patients[6]._id,
        departmentId: departments[4]._id,
        date: today.toISOString().slice(0, 10),
        time: "09:00",
        status: "Booked",
        createdBy: staff[4]._id,
      },
      {
        doctorId: doctors[6]._id,
        userId: patients[7]._id,
        departmentId: departments[6]._id,
        date: today.toISOString().slice(0, 10),
        time: "08:00",
        status: "Booked",
        createdBy: staff[6]._id,
      },

      // Future appointments
      {
        doctorId: doctors[0]._id,
        userId: patients[8]._id,
        departmentId: departments[0]._id,
        date: tomorrow.toISOString().slice(0, 10),
        time: "10:00",
        status: "Booked",
        createdBy: staff[0]._id,
      },
      {
        doctorId: doctors[2]._id,
        userId: patients[9]._id,
        departmentId: departments[2]._id,
        date: tomorrow.toISOString().slice(0, 10),
        time: "10:30",
        status: "Booked",
        createdBy: staff[2]._id,
      },
      {
        doctorId: doctors[3]._id,
        userId: patients[10]._id,
        departmentId: departments[3]._id,
        date: nextWeek.toISOString().slice(0, 10),
        time: "08:30",
        status: "Booked",
        createdBy: staff[3]._id,
      },
      {
        doctorId: doctors[5]._id,
        userId: patients[11]._id,
        departmentId: departments[5]._id,
        date: nextWeek.toISOString().slice(0, 10),
        time: "06:00",
        status: "Booked",
        createdBy: staff[5]._id,
      },
      {
        doctorId: doctors[7]._id,
        userId: patients[0]._id,
        departmentId: departments[7]._id,
        date: nextWeek.toISOString().slice(0, 10),
        time: "09:00",
        status: "Booked",
        createdBy: staff[7]._id,
      },

      // Additional appointments for better testing
      {
        doctorId: doctors[4]._id,
        userId: patients[1]._id,
        departmentId: departments[4]._id,
        date: tomorrow.toISOString().slice(0, 10),
        time: "09:30",
        status: "Booked",
        createdBy: staff[4]._id,
      },
      {
        doctorId: doctors[6]._id,
        userId: patients[2]._id,
        departmentId: departments[6]._id,
        date: tomorrow.toISOString().slice(0, 10),
        time: "08:30",
        status: "Booked",
        createdBy: staff[6]._id,
      },
    ]);
    console.log(`✅ Created ${appointments.length} appointments`);

    // Summary
    console.log("\n🎉 SEED DATA CREATION COMPLETED! 🎉");
    console.log("==========================================");
    console.log(`📂 Departments: ${departments.length}`);
    console.log(`👑 Admin Users: ${adminUsers.length}`);
    console.log(`👨‍⚕️ Doctors: ${doctors.length}`);
    console.log(`👥 Staff Members: ${staff.length}`);
    console.log(`🤒 Patients: ${patients.length}`);
    console.log(`📅 Appointments: ${appointments.length}`);
    console.log("==========================================");

    // Login credentials summary
    console.log("\n🔑 LOGIN CREDENTIALS SUMMARY:");
    console.log("==============================");
    console.log("\n👑 ADMIN ACCOUNTS:");
    console.log("• Email: admin@hospital.com | Password: admin123");
    console.log("• Email: subadmin@hospital.com | Password: subadmin123");

    console.log("\n👨‍⚕️ DOCTOR ACCOUNTS:");
    doctors.forEach((doctor, index) => {
      console.log(
        `• ${doctor.name} | Email: ${doctor.email} | Password: doctor123`
      );
    });

    console.log("\n👥 STAFF ACCOUNTS:");
    staff.forEach((staffMember, index) => {
      console.log(
        `• ${staffMember.name} | Email: ${staffMember.email} | Password: staff123`
      );
    });

    console.log("\n🤒 PATIENT ACCOUNTS (Sample):");
    patients.slice(0, 5).forEach((patient, index) => {
      console.log(
        `• ${patient.name} | Email: ${patient.email} | Password: patient123`
      );
    });
    console.log(
      "... and 7 more patient accounts (all with password: patient123)"
    );

    console.log("\n📊 APPOINTMENT DISTRIBUTION:");
    console.log("============================");
    console.log(
      `📅 Past appointments: ${
        appointments.filter((apt) =>
          ["Attended", "Missed"].includes(apt.status)
        ).length
      }`
    );
    console.log(
      `📅 Today's appointments: ${
        appointments.filter(
          (apt) => apt.date === today.toISOString().slice(0, 10)
        ).length
      }`
    );
    console.log(
      `📅 Future appointments: ${
        appointments.filter(
          (apt) =>
            apt.status === "Booked" &&
            apt.date > today.toISOString().slice(0, 10)
        ).length
      }`
    );

    console.log(
      "\n🚀 Your Hospital Management System is now ready with comprehensive seed data!"
    );
    console.log(
      "You can now test all features and API endpoints with realistic data."
    );
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
    throw error;
  }
};

const runSeed = async () => {
  await connectDB();
  await clearDatabase();
  await seedData();

  console.log("\n✅ Seed process completed successfully!");
  console.log("🔚 Closing database connection...");
  await mongoose.connection.close();
  process.exit(0);
};

// Handle errors
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  process.exit(1);
});

// Run the seed script
if (require.main === module) {
  runSeed().catch((error) => {
    console.error("❌ Seed script failed:", error.message);
    process.exit(1);
  });
}

module.exports = { seedData, clearDatabase };
