const express = require('express');
const multer = require('multer');
const path = require('path');
const Ticket = require('../models/Ticket');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Create ticket with file uploads
router.post('/', auth, (req, res, next) => {
  upload.array('attachments', 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ msg: err.message || 'File upload error' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const attachments = req.files ? req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date()
    })) : [];

    const ticket = new Ticket({ 
      ...req.body, 
      submittedBy: req.user.id,
      attachments 
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's tickets
router.get('/my-tickets', auth, async (req, res) => {
  const tickets = await Ticket.find({ submittedBy: req.user.id })
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
  res.json(tickets);
});

// Download attachment (must be before /:id route)
router.get('/download/:filename', auth, (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../uploads/', filename);
    res.download(filepath);
  } catch (err) {
    res.status(500).json({ msg: 'Error downloading file' });
  }
});

// Get all tickets (admin)
router.get('/', auth, adminAuth, async (req, res) => {
  const tickets = await Ticket.find()
    .populate('submittedBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 });
  res.json(tickets);
});

// Get single ticket
router.get('/:id', auth, async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('submittedBy', 'name email')
    .populate('assignedTo', 'name email');
  res.json(ticket);
});

// Update ticket (admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('submittedBy', 'name email');
  res.json(ticket);
});

// Delete ticket (admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  await Ticket.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Ticket deleted' });
});

// Get statistics
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: 'open' });
    const pending = await Ticket.countDocuments({ status: 'pending' });
    const closed = await Ticket.countDocuments({ status: 'closed' });
    const inProgress = await Ticket.countDocuments({ status: 'in-progress' });
    
    res.json({ total, open, pending, closed, inProgress });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;