const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Send message (admin to user - follow-up)
router.post('/', auth, async (req, res) => {
  try {
    const message = new Message({
      ...req.body,
      from: req.user.id
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get my messages (received)
router.get('/inbox', auth, async (req, res) => {
  try {
    const messages = await Message.find({ to: req.user.id })
      .populate('from', 'name email role')
      .populate('ticketId', 'title ticketId')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get sent messages
router.get('/sent', auth, async (req, res) => {
  try {
    const messages = await Message.find({ from: req.user.id })
      .populate('to', 'name email')
      .populate('ticketId', 'title ticketId')
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ msg: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;