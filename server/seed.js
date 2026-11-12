import 'dotenv/config';
import mongoose from 'mongoose';
import User, { DAYS } from './models/User.js';
import Appointment from './models/Appointment.js';
const timings = DAYS.map(d => ({ day: d, isOpen: d !== 'Sunday', start: '10:00', end: d === 'Saturday' ? '14:00' : '18:00' }));
const docs = [
  ['Dr. Anjali Mehta', 'Cardiologist', 'MBBS, MD (Cardiology)', 14, 'Heart Care Clinic', '12 Sector 62', 'Noida', 'Sector 62', 'Uttar Pradesh', '201309', 900],
  ['Dr. Rohit Sharma', 'Dermatologist', 'MBBS, MD (Dermatology)', 9, 'SkinFirst Clinic', '45 Raj Nagar', 'Ghaziabad', 'Raj Nagar', 'Uttar Pradesh', '201002', 600],
  ['Dr. Sana Khan', 'Pediatrician', 'MBBS, DCH', 11, 'Little Steps Clinic', '8 Indirapuram', 'Ghaziabad', 'Indirapuram', 'Uttar Pradesh', '201014', 500],
  ['Dr. Vikram Singh', 'Orthopedic', 'MBBS, MS (Ortho)', 18, 'BoneWell Centre', '21 Connaught Place', 'New Delhi', 'Connaught Place', 'Delhi', '110001', 1000],
  ['Dr. Priya Nair', 'General Physician', 'MBBS', 6, 'CityCare Clinic', '3 Lajpat Nagar', 'New Delhi', 'Lajpat Nagar', 'Delhi', '110024', 400],
  ['Dr. Arjun Verma', 'Dentist', 'BDS, MDS', 8, 'Smile Dental', '17 Sector 18', 'Noida', 'Sector 18', 'Uttar Pradesh', '201301', 450],
];
await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany({}), Appointment.deleteMany({})]);
for (const [i, d] of docs.entries()) await User.create({ name: d[0], email: `doctor${i + 1}@mediconnect.com`, password: 'doctor123', role: 'doctor', phone: `98100000${i}0`, specialization: d[1], qualification: d[2], experience: d[3], certification: 'State Medical Council Registered', clinicName: d[4], clinicAddress: d[5], city: d[6], locality: d[7], state: d[8], pincode: d[9], consultationFee: d[10], clinicTimings: timings });
await User.create({ name: 'Rahul Patient', email: 'patient@mediconnect.com', password: 'patient123', role: 'patient', phone: '9999999999' });
console.log('Seeded. Doctor: doctor1@mediconnect.com / doctor123 | Patient: patient@mediconnect.com / patient123');
process.exit(0);
