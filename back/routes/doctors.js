const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const AccessGrant = require('../models/AccessGrant');
const DiagnosticRequest = require('../models/DiagnosticRequest');
const User = require('../models/User');

const router = express.Router();

// GET /api/doctors/patients - Get all patients who granted access
router.get('/patients', protect, authorize('doctor'), async (req, res) => {
  try {
    const grants = await AccessGrant.find({ 
      doctorId: req.user._id, 
      status: 'active' 
    }).populate('patientId', 'name email phone dateOfBirth gender bloodGroup address');

    const patients = grants.map(g => g.patientId);
    res.json({ patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/doctors/patients/:patientId/records - Get a patient's records (if access granted)
router.get('/patients/:patientId/records', protect, authorize('doctor'), async (req, res) => {
  try {
    // Check access
    const grant = await AccessGrant.findOne({
      patientId: req.params.patientId,
      doctorId: req.user._id,
      status: 'active'
    });

    if (!grant) {
      return res.status(403).json({ message: 'You do not have access to this patient\'s records' });
    }

    const records = await MedicalRecord.find({ patientId: req.params.patientId })
      .populate('doctorId', 'name specialization')
      .populate('attachments.uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/doctors/records - Create a medical record for a patient
router.post('/records', protect, authorize('doctor'), async (req, res) => {
  try {
    const { patientId, title, description, diagnosis, prescription, notes, type } = req.body;

    // Check access
    const grant = await AccessGrant.findOne({
      patientId,
      doctorId: req.user._id,
      status: 'active'
    });

    if (!grant) {
      return res.status(403).json({ message: 'You do not have access to this patient' });
    }

    const record = await MedicalRecord.create({
      patientId,
      doctorId: req.user._id,
      title,
      description,
      diagnosis,
      prescription,
      notes,
      type: type || 'consultation'
    });

    const populated = await MedicalRecord.findById(record._id)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name email');

    res.status(201).json({ record: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/doctors/diagnostic-requests - Create a diagnostic request
router.post('/diagnostic-requests', protect, authorize('doctor'), async (req, res) => {
  try {
    const { patientId, diagnosticPersonId, title, description, testType, priority, medicalRecordId } = req.body;

    // Check access to patient
    const grant = await AccessGrant.findOne({
      patientId,
      doctorId: req.user._id,
      status: 'active'
    });

    if (!grant) {
      return res.status(403).json({ message: 'You do not have access to this patient' });
    }

    const request = await DiagnosticRequest.create({
      patientId,
      doctorId: req.user._id,
      diagnosticPersonId,
      medicalRecordId,
      title,
      description,
      testType,
      priority: priority || 'medium'
    });

    const populated = await DiagnosticRequest.findById(request._id)
      .populate('patientId', 'name email')
      .populate('diagnosticPersonId', 'name department');

    res.status(201).json({ request: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/doctors/diagnostic-requests - Get all diagnostic requests made by this doctor
router.get('/diagnostic-requests', protect, authorize('doctor'), async (req, res) => {
  try {
    const requests = await DiagnosticRequest.find({ doctorId: req.user._id })
      .populate('patientId', 'name email')
      .populate('diagnosticPersonId', 'name department')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/doctors/diagnostic-personnel - List all diagnostic personnel
router.get('/diagnostic-personnel', protect, authorize('doctor'), async (req, res) => {
  try {
    const personnel = await User.find({ role: 'diagnostic' })
      .select('name email department qualification phone');
    res.json({ personnel });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/doctors/dashboard - Dashboard stats
router.get('/dashboard', protect, authorize('doctor'), async (req, res) => {
  try {
    const totalPatients = await AccessGrant.countDocuments({ 
      doctorId: req.user._id, 
      status: 'active' 
    });
    const totalRecords = await MedicalRecord.countDocuments({ doctorId: req.user._id });
    const pendingDiagnostics = await DiagnosticRequest.countDocuments({ 
      doctorId: req.user._id, 
      status: 'pending' 
    });
    const recentRecords = await MedicalRecord.find({ doctorId: req.user._id })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: { totalPatients, totalRecords, pendingDiagnostics },
      recentRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
