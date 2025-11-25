// ========================================
// VERCEL SERVERLESS FUNCTION
// ========================================
// This file wraps our Express app to work with Vercel's serverless platform

import app from '../server.js';

// Export the Express app as a serverless function
// Vercel will call this for each request
export default app;
