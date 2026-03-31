const express = require('express');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/upload/:filename - Serve uploaded files
router.get('/:filename', protect, async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
