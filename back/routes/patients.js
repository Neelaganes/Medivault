const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const AccessGrant = require('../models/AccessGrant');
const User = require('../models/User');

const router = express.Router();

// GET /api/patients/records - Get patient's own medical records
router.get('/records', protect, authorize('patient'), async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/patients/records/:id - Get specific record
router.get('/records/:id', protect, authorize('patient'), async (req, res) => {
  try {
    const record = await MedicalRecord.findOne({ 
      _id: req.params.id, 
      patientId: req.user._id 
    })
      .populate('doctorId', 'name specialization')
      .populate('attachments.uploadedBy', 'name role');
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.json({ record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/patients/access-grants - Get all access grants for patient
router.get('/access-grants', protect, authorize('patient'), async (req, res) => {
  try {
    const grants = await AccessGrant.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization phone email');
    res.json({ grants });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/patients/doctors/search?q=name - Search doctors
router.get('/doctors/search', protect, authorize('patient'), async (req, res) => {
  try {
    const query = req.query.q || '';
    const doctors = await User.find({
      role: 'doctor',
      name: { $regex: query, $options: 'i' }
    }).select('name email specialization phone licenseNumber');
    res.json({ doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/patients/access-grants - Grant access to a doctor
router.post('/access-grants', protect, authorize('patient'), async (req, res) => {
  try {
    const { doctorId } = req.body;

    // Verify doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if grant already exists
    const existing = await AccessGrant.findOne({ 
      patientId: req.user._id, 
      doctorId 
    });

    if (existing) {
      if (existing.status === 'active') {
        return res.status(400).json({ message: 'Access already granted to this doctor' });
      }
      // Re-activate revoked grant
      existing.status = 'active';
      existing.grantedAt = new Date();
      existing.revokedAt = null;
      await existing.save();
      
      const populated = await AccessGrant.findById(existing._id)
        .populate('doctorId', 'name specialization phone email');
      return res.json({ grant: populated });
    }

    const grant = await AccessGrant.create({
      patientId: req.user._id,
      doctorId
    });

    const populated = await AccessGrant.findById(grant._id)
      .populate('doctorId', 'name specialization phone email');

    res.status(201).json({ grant: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/patients/access-grants/:id/revoke - Revoke doctor access
router.put('/access-grants/:id/revoke', protect, authorize('patient'), async (req, res) => {
  try {
    const grant = await AccessGrant.findOne({ 
      _id: req.params.id, 
      patientId: req.user._id 
    });

    if (!grant) {
      return res.status(404).json({ message: 'Access grant not found' });
    }

    grant.status = 'revoked';
    grant.revokedAt = new Date();
    await grant.save();

    const populated = await AccessGrant.findById(grant._id)
      .populate('doctorId', 'name specialization phone email');

    res.json({ grant: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/patients/dashboard - Dashboard stats
router.get('/dashboard', protect, authorize('patient'), async (req, res) => {
  try {
    const totalRecords = await MedicalRecord.countDocuments({ patientId: req.user._id });
    const activeGrants = await AccessGrant.countDocuments({ 
      patientId: req.user._id, 
      status: 'active' 
    });
    const recentRecords = await MedicalRecord.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: { totalRecords, activeGrants },
      recentRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
