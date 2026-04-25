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

// Auto-generate ticket ID before saving
ticketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TK-${String(count + 8900).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);