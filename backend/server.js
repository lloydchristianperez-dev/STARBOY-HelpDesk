const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ Error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/messages', require('./routes/messages'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));