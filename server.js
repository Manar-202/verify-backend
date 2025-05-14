/*const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
//const session = require('express-session');
const passport = require('passport');
require('./config/passport');
const requestRoutes = require('./routes/requestRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));



app.use(passport.initialize());
//app.use(passport.session());
// Routes
app.use('/api/requests', requestRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
}).catch(err => console.log(err));

module.exports = app;*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const passport = require('passport');
require('./config/passport');
const requestRoutes = require('./routes/requestRoutes');

const app = express();

// Improved Middleware Setup
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit request body size
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Enhanced Passport initialization
app.use(passport.initialize());

// Timeout middleware - مهم جداً لمنع التجميد
app.use((req, res, next) => {
  req.setTimeout(25000, () => { // 25 second timeout
    res.status(504).json({ 
      error: 'Request timeout',
      message: 'The server did not receive a timely response'
    });
  });
  next();
});

// Routes
app.use('/api/requests', requestRoutes);

// Health check endpoint - للتحقق من حالة الخادم
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    dbState: mongoose.connection.readyState,
    timestamp: Date.now()
  });
});

// Optimized MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds for initial connection
      socketTimeoutMS: 30000, // 30 seconds for operations
      maxPoolSize: 5, // Limit connection pool size
      retryWrites: true,
      w: 'majority'
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if DB connection fails
  }
};

// Start the server only after DB connection
const startServer = async () => {
  await connectDB();
  
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

module.exports = app;

// Start the application
if (process.env.NODE_ENV !== 'test') {
  startServer();
}