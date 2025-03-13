require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const Twilio = require('twilio');
const User = require('./models/User');
const City = require('./models/City');
const Chat = require('./models/Chat');  // Import Chat model
const methodOverride = require('method-override');
const axios = require('axios');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const path = require('path');
const MongoStore = require('connect-mongo');

const app = express();
const port = process.env.PORT || 3000;

// Twilio configuration
const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Debugging: Print MONGO_URI to logs
console.log("🔍 Checking MONGO_URI:", process.env.MONGO_URI);

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.warn("⚠️ Warning: MONGO_URI is missing. Using local fallback.");
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log("✅ MongoDB connected successfully"))
        .catch(err => console.error("❌ MongoDB connection error:", err));
}

// Middleware
app.use(express.json({ limit: "10mb" })); // Increase limit if needed
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
app.use(methodOverride('_method'));
app.use(express.static('public'));

// Middleware for request debugging (Logs headers & body)
app.use((req, res, next) => {
    console.log(`🔹 [${req.method}] ${req.url}`);
    console.log("Headers:", req.headers);
    next();
});

// Handle request stream errors
app.use((req, res, next) => {
    req.on("error", (err) => {
        console.error("❌ Request Error:", err);
        res.status(400).json({ error: "Malformed Request" });
    });
    next();
});

// Express session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions'
    })
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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
    console.log("Request Body:", req.body); // Debugging
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing fields" });

    // Registration logic here...

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error" });
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
        console.log("Received Chat Message:", req.body); // Debugging
        const { message, sender } = req.body;

        // Validate message input
        if (!message || !sender) {
            return res.status(400).json({ error: "Message and sender are required" });
        }

        // Store message in database
        const newChat = new Chat({ message, sender });
        await newChat.save();

        res.status(201).json({ message: "Chat saved successfully" });
    } catch (error) {
        console.error("❌ Chat API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/test", async (req, res) => {
    console.log(req.body); // ✅ Access `req.body` normally
    res.send("Success");
});

// Route to fetch weather data
app.get("/api/weather", async (req, res) => {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: "City is required" });

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("❌ Weather API Error:", error);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("🚨 Uncaught Error:", err);
    res.status(500).json({ error: "Something went wrong" });
});

// Your other routes and middleware here

const sendMessage = async () => {
    const chatInput = document.getElementById("chat-input");
    const message = chatInput.value.trim();
    const sender = "User"; // Replace with actual sender info

    if (!message) {
        alert("Message cannot be empty");
        return;
    }

    const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sender })
    });

    if (!response.ok) {
        console.error("Chat API error:", response.statusText);
    } else {
        console.log("Message sent successfully");
        chatInput.value = ""; // Clear input after sending
    }
};

const apiKey = "2149cbc5da7384b8ef7bcccf62b0bf68"; // Ensure this is valid

const fetchWeatherAlerts = async (city) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("No weather alerts available");
        return await response.json();
    } catch (error) {
        console.warn("No alerts found for", city);
        return null;
    }
};

// Fetch weather data from API
async function fetchWeatherData(city) {
    try {
        if (!city) throw new Error("City name is required");

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);

        if (!response.ok) {
            const errorMessage = `API Error ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        if (!data || !data.main) {
            throw new Error("Invalid weather data received");
        }

        return data;
    } catch (error) {
        console.error("❌ Weather API error:", error.message);
        return null; // Prevents app from crashing
    }
}

// Fetch weather data from API
async function fetchWeather(city) {
    if (!city || city.trim() === "") {
        alert("Please enter a valid city name.");
        return;
    }

    try {
        const weatherData = await fetchWeatherData(city);

        if (!weatherData) {
            alert("❌ Error fetching weather data.");
            return;
        }

        updateWeatherUI(weatherData);
        fetchWeatherForecast(city); // Fetch and update the forecast
        fetchWeatherAlerts(city); // Fetch and display weather alerts
    } catch (error) {
        console.error("❌ Error fetching weather data:", error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Voice recognition for weather search
if (!window.recognition) {
    window.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    window.recognition.lang = "en-US";

    window.recognition.onresult = (event) => {
        const city = event.results[0][0].transcript;
        console.log("Recognized City:", city);
        fetchWeather(city);
    };

    // Start voice search when microphone button is clicked
    document.querySelector("#voice-search").addEventListener("click", () => {
        window.recognition.start();
    });
}

const saveCity = async (city) => {
    const response = await fetch("/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city })
    });

    if (response.status === 401) {
        alert("You must be logged in to save a city.");
        return;
    }

    if (!response.ok) {
        console.error("Failed to save city:", response.statusText);
    } else {
        console.log("City saved successfully");
    }
};

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
