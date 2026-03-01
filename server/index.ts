import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import employerProfileRoutes from './routes/employerProfileRoutes';
import jobseekerProfileRoutes from './routes/jobseekerProfileRoutes';
import chatRoutes from './routes/chatRoutes';
import resumeRoutes from './routes/resumeRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// User middleware
app.use((req, res, next) => {
  const userId = req.headers['user-id'] as string;
  if (userId) {
    (req as any).user = { id: userId };
  }
  next();
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : dbState === 3 ? 'disconnecting' : 'disconnected';

  res.json({ status: 'ok', db: dbStatus });
});

// Routes
app.use('/api', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/employer-profiles', employerProfileRoutes);
app.use('/api/jobseeker-profiles', jobseekerProfileRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Root route to display something in the browser
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <html>
      <head>
        <title>Job Portal API</title>
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f4f4f9; }
          .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; shadow: 0 4px 6px rgba(0,0,0,0.1); }
          h1 { color: #333; }
          p { color: #666; }
          .status { color: #2ecc71; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Job Portal Server</h1>
          <p>The backend is running successfully.</p>
          <p>Status: <span class="status">Online</span></p>
          <p><small>Port: ${PORT}</small></p>
        </div>
      </body>
    </html>
  `);
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
