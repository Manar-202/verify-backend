const express = require('express');
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

/*app.use(session({
  secret: 'manar-super-secret-session-key',
  resave: false,
  saveUninitialized: false
}));*/

app.use(passport.initialize());
//app.use(passport.session());
// Routes
app.use('/api/requests', requestRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
}).catch(err => console.log(err));

module.exports = app;