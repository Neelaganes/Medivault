const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// All admin routes must be protected and restricted to the admin role
router.use(protect);
router.use(authorize('admin'));

// GET /api/admin/dashboard - Stats for the admin dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalDiagnostics = await User.countDocuments({ role: 'diagnostic' });
    const totalPatients = await User.countDocuments({ role: 'patient' });

    res.json({
      stats: { totalDoctors, totalDiagnostics, totalPatients }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/doctors - List all doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password').sort({ createdAt: -1 });
    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/diagnostics - List all diagnostic personnel
router.get('/diagnostics', async (req, res) => {
  try {
    const diagnostics = await User.find({ role: 'diagnostic' }).select('-password').sort({ createdAt: -1 });
    res.json({ diagnostics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/users - Create a doctor or diagnostic account
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, phone, specialization, licenseNumber, experience, department, qualification } = req.body;

    if (!['doctor', 'diagnostic'].includes(role)) {
      return res.status(400).json({ message: 'Can only create doctor or diagnostic accounts' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const userData = { name, email, password, role, phone };

    if (role === 'doctor') {
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
      userData.experience = experience;
    } else if (role === 'diagnostic') {
      userData.department = department;
      userData.qualification = qualification;
    }

    const user = await User.create(userData);
    
    res.status(201).json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id - Update a doctor/diagnostic account
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, specialization, licenseNumber, experience, department, qualification } = req.body;
    
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['doctor', 'diagnostic'].includes(user.role)) {
      return res.status(400).json({ message: 'Can only edit doctor or diagnostic accounts' });
    }
    
    // Check if new email is already taken by someone else
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    if (user.role === 'doctor') {
      user.specialization = specialization || user.specialization;
      user.licenseNumber = licenseNumber || user.licenseNumber;
      user.experience = experience !== undefined ? experience : user.experience;
    } else if (user.role === 'diagnostic') {
      user.department = department || user.department;
      user.qualification = qualification || user.qualification;
    }

    await user.save();
    
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete a doctor/diagnostic account
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!['doctor', 'diagnostic'].includes(user.role)) {
      return res.status(400).json({ message: 'Can only delete doctor or diagnostic accounts' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
