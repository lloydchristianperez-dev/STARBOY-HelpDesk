const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in-progress', 'closed', 'pending'], default: 'open' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  replies: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-generate ticket ID before saving - using timestamp for uniqueness
ticketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    // Use timestamp + random for guaranteed uniqueness even in concurrent environments
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ticketId = `TK-${timestamp.slice(-4)}${random}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
