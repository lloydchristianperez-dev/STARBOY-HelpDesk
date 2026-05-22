const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

dotenv.config();
const app = express();

// Configure CORS to allow frontend production, previews, and local development.
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://starboy-helpdesk.vercel.app',
  'https://starboy-helpdesk.onrender.com',
  /\.vercel\.app$/, // allow Vercel preview URLs
  'https://petstore.swagger.io', // Swagger UI helper origin
];

// If you deploy a custom frontend URL, set FRONTEND_URL in Render env vars.
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without Origin (curl/Postman/server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some((entry) =>
      typeof entry === 'string' ? entry === origin : entry.test(origin)
    );

    if (isAllowed) return callback(null, true);

    console.warn(`⛔ Blocked by CORS: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Serve Swagger UI at /api-docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route to verify backend server is running
app.get('/', (req, res) => {
  res.json({ message: 'STARBOY HelpDesk API is running! 🚀' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ Error:', err));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/messages', require('./routes/messages'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));