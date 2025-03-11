const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./db');
const User = require('./models/User');
const City = require('./models/City');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const axios = require('axios'); // Add this line
const cors = require('cors'); // Add this line
const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Add this line
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// Serve static files
app.use(express.static('public'));

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
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
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
