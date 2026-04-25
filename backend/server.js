const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// CORS - allow frontend domains
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://starboy-helpdesk.vercel.app',
    /\.vercel\.app$/  // allows any vercel preview URL
  ],
  credentials: true
}));

app.use(express.json());

// Root route (for testing)
app.get('/', (req, res) => {
  res.json({ message: 'STARBOY HelpDesk API is running! 🚀' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ Error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/messages', require('./routes/messages'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));