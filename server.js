require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const Twilio = require('twilio');
const connectDB = require('./db');
const User = require('./models/User');
const City = require('./models/City');
const Chat = require('./models/Chat');  // Case-sensitive!
const methodOverride = require('method-override');
const axios = require('axios');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Twilio configuration
const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Express session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cors());
app.use(express.static('public'));

// Disable favicon request
app.get('/favicon.ico', (req, res) => res.status(204));

// Explicitly serve videos with correct MIME type
app.get('/public/videos/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'videos', req.params.filename);
  res.setHeader('Content-Type', 'video/mp4');
  res.sendFile(filePath);
});

// Routes
app.post('/register', async (req, res) => {
  try {
    // Registration logic here
  } catch (error) {
    // Error handling here
  }
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).send(info.message);
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.send('Logged in');
    });
  })(req, res, next);
});

app.post('/cities', async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.status(401).send('Not authenticated');

    const { city } = req.body;
    const newCity = new City({ name: city, userId: req.user.id });
    await newCity.save();
    res.status(201).send('City saved');
  } catch (error) {
    console.error('Error saving city:', error);
    res.status(500).send('Error saving city');
  }
});

app.get('/cities', async (req, res) => {
  try {
    const cities = await City.find();
    res.json(cities);
  } catch (err) {
    console.error("Error fetching cities:", err);
    res.status(500).json({ error: "Server error while fetching cities." });
  }
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const chat = new Chat({ message });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    console.error("Error saving chat message:", err);
    res.status(500).json({ error: "Server error while saving chat message." });
  }
});

// Your other routes and middleware here

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
