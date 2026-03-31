const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const MedicalRecord = require('./models/MedicalRecord');
const AccessGrant = require('./models/AccessGrant');
const DiagnosticRequest = require('./models/DiagnosticRequest');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await MedicalRecord.deleteMany({});
    await AccessGrant.deleteMany({});
    await DiagnosticRequest.deleteMany({});
    console.log('Cleared existing data');

    // Create admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@medivault.com',
      password: 'admin123',
      role: 'admin',
      phone: '0000000000'
    });

    // Create patients
    const patient1 = await User.create({
      name: 'Rahul Sharma',
      email: 'patient@demo.com',
      password: 'password123',
      role: 'patient',
      phone: '9876543210',
      dateOfBirth: new Date('1995-05-15'),
      gender: 'male',
      bloodGroup: 'O+',
      address: '123 MG Road, Bangalore'
    });

    const patient2 = await User.create({
      name: 'Priya Patel',
      email: 'patient2@demo.com',
      password: 'password123',
      role: 'patient',
      phone: '9876543211',
      dateOfBirth: new Date('1990-08-20'),
      gender: 'female',
      bloodGroup: 'A+',
      address: '456 Park Street, Mumbai'
    });

    // Create doctors
    const doctor1 = await User.create({
      name: 'Dr. Arun Kumar',
      email: 'doctor@demo.com',
      password: 'password123',
      role: 'doctor',
      phone: '9876543220',
      specialization: 'Orthopedics',
      licenseNumber: 'MCI-2015-001',
      experience: 10
    });

    const doctor2 = await User.create({
      name: 'Dr. Meena Reddy',
      email: 'doctor2@demo.com',
      password: 'password123',
      role: 'doctor',
      phone: '9876543221',
      specialization: 'General Medicine',
      licenseNumber: 'MCI-2018-042',
      experience: 7
    });

    // Create diagnostic personnel
    const diagnostic1 = await User.create({
      name: 'Suresh Lab Tech',
      email: 'diagnostic@demo.com',
      password: 'password123',
      role: 'diagnostic',
      phone: '9876543230',
      department: 'Radiology',
      qualification: 'B.Sc Radiology'
    });

    // Create access grants
    await AccessGrant.create({
      patientId: patient1._id,
      doctorId: doctor1._id,
      status: 'active'
    });

    await AccessGrant.create({
      patientId: patient2._id,
      doctorId: doctor1._id,
      status: 'active'
    });

    await AccessGrant.create({
      patientId: patient1._id,
      doctorId: doctor2._id,
      status: 'active'
    });

    // Create medical records
    const record1 = await MedicalRecord.create({
      patientId: patient1._id,
      doctorId: doctor1._id,
      title: 'Initial Consultation - Knee Pain',
      description: 'Patient complains of persistent knee pain for 2 weeks after a sports injury.',
      diagnosis: 'Suspected ACL sprain, requires imaging',
      prescription: 'Ibuprofen 400mg twice daily, Ice pack application',
      type: 'consultation'
    });

    const record2 = await MedicalRecord.create({
      patientId: patient1._id,
      doctorId: doctor2._id,
      title: 'General Health Checkup',
      description: 'Annual health checkup. All vitals normal.',
      diagnosis: 'Good overall health. Vitamin D deficiency noted.',
      prescription: 'Vitamin D3 60000 IU weekly for 8 weeks',
      type: 'consultation'
    });

    await MedicalRecord.create({
      patientId: patient2._id,
      doctorId: doctor1._id,
      title: 'Follow-up - Wrist Fracture',
      description: 'Follow-up after cast removal. Wrist healing well.',
      diagnosis: 'Healed distal radius fracture. Begin physiotherapy.',
      prescription: 'Physiotherapy 3 times/week for 4 weeks',
      type: 'consultation'
    });

    // Create diagnostic request
    await DiagnosticRequest.create({
      patientId: patient1._id,
      doctorId: doctor1._id,
      diagnosticPersonId: diagnostic1._id,
      medicalRecordId: record1._id,
      title: 'Knee X-Ray',
      description: 'X-Ray of left knee - AP and Lateral views needed to assess ACL injury',
      testType: 'xray',
      priority: 'high',
      status: 'pending'
    });

    console.log('\n✅ Seed data created successfully!\n');
    console.log('Demo Accounts:');
    console.log('─────────────────────────────────');
    console.log('Admin:      admin@medivault.com / admin123');
    console.log('Patient:    patient@demo.com    / password123');
    console.log('Patient 2:  patient2@demo.com   / password123');
    console.log('Doctor:     doctor@demo.com     / password123');
    console.log('Doctor 2:   doctor2@demo.com    / password123');
    console.log('Diagnostic: diagnostic@demo.com / password123');
    console.log('─────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
