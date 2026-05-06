const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  content: { type: String, required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  isRead: { type: Boolean, default: false },
  type: { type: String, enum: ['follow-up', 'notification', 'general'], default: 'general' }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);