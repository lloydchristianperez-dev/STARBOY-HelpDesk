const express = require('express');
const Ticket = require('../models/Ticket');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create ticket
router.post('/', auth, async (req, res) => {
  try {
    const ticket = new Ticket({ ...req.body, submittedBy: req.user.id });
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