import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

connectDB();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts' },
});

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use('/api', limiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SecureVault API is running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/security', securityRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SecureVault server running on port ${PORT}`);
});

export default app;
