import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import winston from 'winston';

// Load environment variables
dotenv.config();

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'server.log' })
  ]
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // HTTP logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mock Graphite Trust Score API simulation
const mockTrustScores: { [key: string]: number } = {
  '0x1234567890123456789012345678901234567890': 85,
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd': 92,
  '0x9876543210987654321098765432109876543210': 45,
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TrustTok API is running' });
});

// Get user trust score
app.get('/api/trust-score/:address', (req, res) => {
  const { address } = req.params;
  const trustScore = mockTrustScores[address] || Math.floor(Math.random() * 100);
  
  logger.info(`Trust score requested for address: ${address}`);
  
  res.json({
    address,
    trustScore,
    level: trustScore >= 80 ? 'high' : trustScore >= 50 ? 'medium' : 'low',
    benefits: {
      contentBoost: trustScore >= 80 ? 3 : trustScore >= 50 ? 2 : 1,
      monetizationTier: trustScore >= 80 ? 'premium' : trustScore >= 50 ? 'standard' : 'basic',
      canModerate: trustScore >= 70
    }
  });
});

// Get content visibility multiplier
app.get('/api/content-boost/:address', (req, res) => {
  const { address } = req.params;
  const trustScore = mockTrustScores[address] || Math.floor(Math.random() * 100);
  
  let boostMultiplier = 1;
  if (trustScore >= 80) boostMultiplier = 3;
  else if (trustScore >= 60) boostMultiplier = 2;
  else if (trustScore >= 40) boostMultiplier = 1.5;
  
  res.json({
    address,
    trustScore,
    boostMultiplier,
    estimatedReach: Math.floor(1000 * boostMultiplier)
  });
});

// Submit content for review (trust-based moderation)
app.post('/api/content/submit', (req, res) => {
  const { userAddress, content, contentType } = req.body;
  const trustScore = mockTrustScores[userAddress] || Math.floor(Math.random() * 100);
  
  const needsReview = trustScore < 50;
  const autoApproved = trustScore >= 80;
  
  logger.info(`Content submitted by ${userAddress} with trust score ${trustScore}`);
  
  res.json({
    contentId: `content_${Date.now()}`,
    status: autoApproved ? 'approved' : needsReview ? 'pending_review' : 'approved',
    trustScore,
    message: autoApproved 
      ? 'Content auto-approved due to high trust score'
      : needsReview 
        ? 'Content requires manual review due to low trust score'
        : 'Content approved'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`TrustTok server running on port ${PORT}`);
  console.log(`🚀 TrustTok API server running on http://localhost:${PORT}`);
});
