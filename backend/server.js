const express = require('express');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const cors = require('cors');
const helmet = require('helmet');
const prisma = require('./config/db');
const logger = require('./config/logger');
const { errorHandler } = require('./middlewares/error.middleware');
const rateLimit = require('express-rate-limit');

// (Optional) Connect explicitly to catch initial errors
prisma.$connect()
  .then(() => logger.info('Postgres DB connected via Prisma'))
  .catch((err) => logger.error('DB connection error: ' + err.message));

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://livestock-navy.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow if origin is in the whitelist, or if no origin (mobile/curl), or if it's production frontend
    const isAllowed = !origin || allowedOrigins.includes(origin) || (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse JSON payload
// Paystack webhook requires raw body for signature validation, so we'll handle standard json otherwise
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Rate limiting for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login requests per window
  message: { success: false, message: 'Too many login attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Setup Routes
app.use('/api/auth', authLimiter, require('./routes/auth.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/plans', require('./routes/plan.routes'));
app.use('/api/applications', require('./routes/application.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/withdrawals', require('./routes/withdrawal.routes'));
app.use('/api/updates', require('./routes/update.routes'));

// Basic generic error handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
