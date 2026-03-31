const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const DiagnosticRequest = require('../models/DiagnosticRequest');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');

const router = express.Router();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Return specific resource type for PDFs and raw files so they work properly
    let format = undefined;
    if (file.mimetype === 'application/pdf') format = 'pdf';
    else if (file.originalname.match(/\.(dcm|dicom)$/i)) format = 'dcm';

    return {
      folder: 'medivault',
      format: format,
      resource_type: 'auto',
      public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 
                         'image/dicom', 'application/pdf',
                         'application/dicom'];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|gif|webp|pdf|dcm)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Please upload images or PDFs.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit 
});

// GET /api/diagnostic/requests - Get all assigned diagnostic requests
router.get('/requests', protect, authorize('diagnostic'), async (req, res) => {
  try {
    const requests = await DiagnosticRequest.find({ 
      diagnosticPersonId: req.user._id 
    })
      .populate('patientId', 'name email phone dateOfBirth gender')
      .populate('doctorId', 'name specialization')
      .populate('medicalRecordId', 'title')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/diagnostic/requests/unassigned - Get unassigned requests
router.get('/requests/unassigned', protect, authorize('diagnostic'), async (req, res) => {
  try {
    const requests = await DiagnosticRequest.find({ 
      $or: [
        { diagnosticPersonId: null },
        { diagnosticPersonId: { $exists: false } }
      ],
      status: 'pending'
    })
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .sort({ priority: -1, createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/diagnostic/requests/:id/accept - Accept a diagnostic request
router.put('/requests/:id/accept', protect, authorize('diagnostic'), async (req, res) => {
  try {
    const request = await DiagnosticRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.diagnosticPersonId = req.user._id;
    request.status = 'in_progress';
    await request.save();

    const populated = await DiagnosticRequest.findById(request._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization');

    res.json({ request: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/diagnostic/requests/:id/upload - Upload images/reports for a request
router.post('/requests/:id/upload', protect, authorize('diagnostic'), upload.array('files', 10), async (req, res) => {
  try {
    const request = await DiagnosticRequest.findOne({
      _id: req.params.id,
      diagnosticPersonId: req.user._id
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found or not assigned to you' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Find or create medical record for this request
    let record;
    if (request.medicalRecordId) {
      record = await MedicalRecord.findById(request.medicalRecordId);
    }
    
    if (!record) {
      record = await MedicalRecord.create({
        patientId: request.patientId,
        doctorId: request.doctorId,
        title: `Diagnostic Report: ${request.title}`,
        description: request.description,
        type: 'imaging'
      });
      request.medicalRecordId = record._id;
    }

    // Add attachments to the record
    const attachments = req.files.map(file => ({
      filename: file.path, // Cloudinary provides the full URL here
      originalName: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      uploadedBy: req.user._id
    }));

    record.attachments.push(...attachments);
    await record.save();

    // Update request status
    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    const populatedRecord = await MedicalRecord.findById(record._id)
      .populate('doctorId', 'name specialization')
      .populate('attachments.uploadedBy', 'name role');

    res.json({ 
      message: 'Files uploaded successfully',
      record: populatedRecord 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/diagnostic/dashboard - Dashboard stats
router.get('/dashboard', protect, authorize('diagnostic'), async (req, res) => {
  try {
    const assignedRequests = await DiagnosticRequest.countDocuments({ 
      diagnosticPersonId: req.user._id 
    });
    const pendingRequests = await DiagnosticRequest.countDocuments({ 
      diagnosticPersonId: req.user._id,
      status: { $in: ['pending', 'in_progress'] }
    });
    const completedRequests = await DiagnosticRequest.countDocuments({ 
      diagnosticPersonId: req.user._id,
      status: 'completed'
    });
    const unassignedRequests = await DiagnosticRequest.countDocuments({
      $or: [
        { diagnosticPersonId: null },
        { diagnosticPersonId: { $exists: false } }
      ],
      status: 'pending'
    });

    const recentRequests = await DiagnosticRequest.find({ 
      diagnosticPersonId: req.user._id 
    })
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: { assignedRequests, pendingRequests, completedRequests, unassignedRequests },
      recentRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
