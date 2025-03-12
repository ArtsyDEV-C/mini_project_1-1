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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Serve static files
app.use(express.static('public'));

// Serve CSS file with correct MIME type
app.get('/style.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, 'public', 'style.css'));
});

// Serve MP4 videos with correct MIME type
app.get('/public/videos/:filename', (req, res) => {
  res.setHeader('Content-Type', 'video/mp4');
  res.sendFile(path.join(__dirname, 'public', 'videos', req.params.filename));
});

app.get('/favicon.ico', (req, res) => res.status(204));

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send SMS alert
const sendSMSAlert = (to, message) => {
  twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to
  });
};

// Function to send email alert
const sendEmailAlert = (to, subject, message) => {
  const msg = {
    to: to,
    from: process.env.SENDGRID_EMAIL,
    subject: subject,
    text: message,
  };
  sgMail.send(msg);
};

// Routes
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).send('User registered');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
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

app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'system', content: 'You are a helpful weather assistant.' },
                 { role: 'user', content: userMessage }]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ response: 'Sorry, something went wrong.' });
  }
});

// Example route to send alerts
app.post('/send-alert', (req, res) => {
  const { type, to, message } = req.body;
  if (type === 'sms') {
    sendSMSAlert(to, message);
  } else if (type === 'email') {
    sendEmailAlert(to, 'Weather Alert', message);
  }
  res.send('Alert sent');
});

// Example route to send emergency alerts
app.post('/send-emergency-alert', (req, res) => {
  const { to, message } = req.body;
  sendSMSAlert(to, message);
  res.send('Emergency alert sent');
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
