// Constants for weather media directories
const weatherBackgrounds = {
    "clear-day": "images/clear-sky-day.jpg",
    "clear-night": "images/clear-sky-night.jpg",
    "clear-evening": "images/clear-sky-evening.jpg",
    "cloudy-day": "images/cloudy-sky-day.jpg",
    "cloudy-night": "images/cloudy-sky-night.jpg",
    "cloudy-evening": "images/cloudy-sky-evening.jpg",
    "sunny-day": "images/sunny-sky-day.jpg",
    "sunny-night": "images/sunny-sky-night.jpg",
    "rainy-day": "images/rainy-sky-day.jpg",
    "rainy-night": "images/rainy-sky-night.jpg",
    "rainy-evening": "images/rainy-sky-evening.jpg",
    "snowy-day": "images/snowy-sky-day.jpg",
    "snowy-night": "images/snowy-sky-night.jpg",
    "snowy-evening": "images/snowy-sky-evening.jpg",
    "thunderstorm-day": "images/thunderstorm-sky-day.jpg",
    "thunderstorm-night": "images/thunderstorm-sky-night.jpg",
    "thunderstorm-evening": "images/thunderstorm-sky-evening.jpg",
    "hazy-day": "images/hazy-sky-day.jpg",
    "hazy-night": "images/hazy-sky-night.jpg",
    "foggy-day": "images/foggy-sky-day.jpg",
    "foggy-night": "images/foggy-sky-night.jpg",
    "windy-day": "images/windy-sky-day.jpg",
    "windy-night": "images/windy-sky-night.jpg"
};

const weatherVideos = {
    "clear-morning": "videos/clear-morning-cat.mp4",
    "clear-evening": "videos/clear-evening-cat.mp4",
    "clear-night": "videos/clear-night-cat.mp4",
    "cloudy-morning": "videos/cloudy-morning-cat.mp4",
    "cloudy-evening": "videos/cloudy-evening-cat.mp4",
    "cloudy-night": "videos/cloudy-night-cat.mp4",
    "foggy-morning": "videos/foggy-morning-cat.mp4",
    "foggy-evening": "videos/foggy-evening-cat.mp4",
    "foggy-night": "videos/foggy-night-cat.mp4",
    "rain-morning": "videos/rain-morning-cat.mp4",
    "rain-evening": "videos/rain-evening-cat.mp4",
    "rain-night": "videos/rain-night-cat.mp4",
    "snowy-morning": "videos/snowy-morning-cat.mp4",
    "snowy-evening": "videos/snowy-evening-cat.mp4",
    "snowy-night": "videos/snowy-night-cat.mp4",
    "sunny-morning": "videos/sunny-morning-cat.mp4",
    "sunny-evening": "videos/sunny-evening-cat.mp4",
    "sunny-night": "videos/sunny-night-cat.mp4",
    "thunderstorm-morning": "videos/thunderstorm-morning-cat.mp4",
    "thunderstorm-evening": "videos/thunderstorm-evening-cat.mp4",
    "thunderstorm-night": "videos/thunderstorm-night-cat.mp4",
    "windy-morning": "videos/windy-morning-cat.mp4",
    "windy-evening": "videos/windy-evening-cat.mp4",
    "windy-night": "videos/windy-night-cat.mp4",
    "default": "videos/default.mp4"
};

const weatherMusic = {
    "clear": "music/sunny.mp3",
    "cloudy": "music/cloudy.mp3",
    "rainy": "music/rain.mp3",
    "snowy": "music/snow.mp3",
    "thunderstorm": "music/thunderstorm.mp3",
    "hazy": "music/hazy.mp3",
    "foggy": "music/foggy.mp3",
    "windy": "music/windy.mp3"
};

// Elements
const searchBar = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');
const weatherContainer = document.querySelector('.weather-container');
const weatherVideo = document.querySelector('#weather-video');
const weatherMusicElement = document.querySelector('#weather-music');
const weatherIcon = document.querySelector('#weather-icon');
const temperatureElement = document.querySelector('#weather-temperature');
const weatherDescription = document.querySelector('#weather-description');
const cityElement = document.querySelector('#city-name');
const windSpeedElement = document.querySelector('#wind-speed');
const humidityElement = document.querySelector('#humidity');
const uvIndexElement = document.querySelector('#uv-index');
const pressureElement = document.querySelector('#pressure');
const sunriseElement = document.querySelector('#sunrise');
const sunsetElement = document.querySelector('#sunset');
const forecastContainer = document.querySelector('#forecast');
const loadingSpinner = document.querySelector('#loading');
const dateTimeElement = document.querySelector('#date-time');
const localTimeElement = document.querySelector('#local-time');
const istTimeElement = document.querySelector('#ist-time');

// Auth Elements
const registerForm = document.querySelector('#register-form');
const loginForm = document.querySelector('#login-form');
const saveCityForm = document.querySelector('#save-city-form');

// API key for weather data (get your own from https://openweathermap.org/api)
const API_KEY = '2149cbc5da7384b8ef7bcccf62b0bf68';

// Function to get the current date and time
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    dateTimeElement.innerText = now.toLocaleString('en-US', options);
}

// Function to format time in 12-hour format
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
}

// Function to update weather data on the page
function updateWeatherUI(data) {
    const weather = data.weather[0];
    const main = data.main;
    const wind = data.wind;
    const sys = data.sys;

    // City name
    cityElement.innerText = `${data.name}, ${data.sys.country}`;

    // Determine if it's day, night, or evening
    const now = new Date();
    const sunrise = new Date(sys.sunrise * 1000);
    const sunset = new Date(sys.sunset * 1000);
    const eveningStart = new Date(sunset.getTime() - 3600 * 1000); // 1 hour before sunset
    const morningEnd = new Date(sunrise.getTime() + 3600 * 1000); // 1 hour after sunrise
    const isDayTime = now >= morningEnd && now < sunset;
    const isEveningTime = now >= eveningStart && now < sunset;
    const isMorningTime = now >= sunrise && now < morningEnd;

    // Set weather background
    const weatherCondition = weather.main.toLowerCase();
    let backgroundImage = isDayTime ? weatherBackgrounds["clear-day"] : weatherBackgrounds["clear-night"]; // Default
    if (isEveningTime) {
        backgroundImage = weatherBackgrounds["clear-evening"];
    } else if (isMorningTime) {
        backgroundImage = weatherBackgrounds["clear-day"];
    }
    if (weatherCondition.includes('cloud')) backgroundImage = isDayTime ? weatherBackgrounds["cloudy-day"] : (isEveningTime ? weatherBackgrounds["cloudy-evening"] : (isMorningTime ? weatherBackgrounds["cloudy-morning"] : weatherBackgrounds["cloudy-night"]));
    if (weatherCondition.includes('rain')) backgroundImage = isDayTime ? weatherBackgrounds["rainy-day"] : (isEveningTime ? weatherBackgrounds["rainy-evening"] : (isMorningTime ? weatherBackgrounds["rainy-morning"] : weatherBackgrounds["rainy-night"]));
    if (weatherCondition.includes('clear')) backgroundImage = isDayTime ? weatherBackgrounds["clear-day"] : (isEveningTime ? weatherBackgrounds["clear-evening"] : (isMorningTime ? weatherBackgrounds["clear-morning"] : weatherBackgrounds["clear-night"]));
    if (weatherCondition.includes('snow')) backgroundImage = isDayTime ? weatherBackgrounds["snowy-day"] : (isEveningTime ? weatherBackgrounds["snowy-evening"] : (isMorningTime ? weatherBackgrounds["snowy-morning"] : weatherBackgrounds["snowy-night"]));
    if (weatherCondition.includes('thunderstorm')) backgroundImage = isDayTime ? weatherBackgrounds["thunderstorm-day"] : (isEveningTime ? weatherBackgrounds["thunderstorm-evening"] : (isMorningTime ? weatherBackgrounds["thunderstorm-morning"] : weatherBackgrounds["thunderstorm-night"]));
    if (weatherCondition.includes('haze')) backgroundImage = isDayTime ? weatherBackgrounds["hazy-day"] : (isEveningTime ? weatherBackgrounds["hazy-night"] : (isMorningTime ? weatherBackgrounds["hazy-morning"] : weatherBackgrounds["hazy-night"]));
    if (weatherCondition.includes('fog')) backgroundImage = isDayTime ? weatherBackgrounds["foggy-day"] : (isEveningTime ? weatherBackgrounds["foggy-night"] : (isMorningTime ? weatherBackgrounds["foggy-morning"] : weatherBackgrounds["foggy-night"]));
    if (weatherCondition.includes('wind')) backgroundImage = isDayTime ? weatherBackgrounds["windy-day"] : (isEveningTime ? weatherBackgrounds["windy-night"] : (isMorningTime ? weatherBackgrounds["windy-morning"] : weatherBackgrounds["windy-night"]));

    document.body.style.backgroundImage = `url(${backgroundImage})`;

    // Set video and music based on weather
    let video = weatherVideos["default"];
    if (isDayTime) {
        video = weatherVideos["clear-morning"];
    } else if (isEveningTime) {
        video = weatherVideos["clear-evening"];
    } else if (isMorningTime) {
        video = weatherVideos["clear-morning"];
    } else {
        video = weatherVideos["clear-night"];
    }

    let music = weatherMusic["clear"];
    if (weatherCondition.includes('rain')) {
        video = isDayTime ? weatherVideos["rain-morning"] : (isEveningTime ? weatherVideos["rain-evening"] : (isMorningTime ? weatherVideos["rain-morning"] : weatherVideos["rain-night"]));
        music = weatherMusic["rainy"];
    } else if (weatherCondition.includes('cloud')) {
        video = isDayTime ? weatherVideos["cloudy-morning"] : (isEveningTime ? weatherVideos["cloudy-evening"] : (isMorningTime ? weatherVideos["cloudy-morning"] : weatherVideos["cloudy-night"]));
        music = weatherMusic["cloudy"];
    } else if (weatherCondition.includes('snow')) {
        video = isDayTime ? weatherVideos["snowy-morning"] : (isEveningTime ? weatherVideos["snowy-evening"] : (isMorningTime ? weatherVideos["snowy-morning"] : weatherVideos["snowy-night"]));
        music = weatherMusic["snowy"];
    } else if (weatherCondition.includes('thunderstorm')) {
        video = isDayTime ? weatherVideos["thunderstorm-morning"] : (isEveningTime ? weatherVideos["thunderstorm-evening"] : (isMorningTime ? weatherVideos["thunderstorm-morning"] : weatherVideos["thunderstorm-night"]));
        music = weatherMusic["thunderstorm"];
    } else if (weatherCondition.includes('haze')) {
        video = isDayTime ? weatherVideos["foggy-morning"] : (isEveningTime ? weatherVideos["foggy-evening"] : (isMorningTime ? weatherVideos["foggy-morning"] : weatherVideos["foggy-night"]));
        music = weatherMusic["hazy"];
    } else if (weatherCondition.includes('fog')) {
        video = isDayTime ? weatherVideos["foggy-morning"] : (isEveningTime ? weatherVideos["foggy-evening"] : (isMorningTime ? weatherVideos["foggy-morning"] : weatherVideos["foggy-night"]));
        music = weatherMusic["foggy"];
    } else if (weatherCondition.includes('wind')) {
        video = isDayTime ? weatherVideos["windy-morning"] : (isEveningTime ? weatherVideos["windy-evening"] : (isMorningTime ? weatherVideos["windy-morning"] : weatherVideos["windy-night"]));
        music = weatherMusic["windy"];
    }

    // Set video
    weatherVideo.src = video;

    // Set music (play automatically)
    weatherMusicElement.src = music;
    weatherMusicElement.play();

    // Set temperature in Celsius and Fahrenheit
    const tempCelsius = Math.round(main.temp);
    const tempFahrenheit = Math.round((tempCelsius * 9 / 5) + 32);
    temperatureElement.innerHTML = `${tempCelsius}°C / ${tempFahrenheit}°F`;

    // Set weather description and icon
    weatherDescription.innerHTML = weather.description;
    weatherIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${weather.icon}.png" alt="Weather Icon">`;

    // Set other weather data
    windSpeedElement.innerText = `${wind.speed} m/s`;
    humidityElement.innerText = `${main.humidity}%`;
    uvIndexElement.innerText = 'N/A'; // UV Index requires a separate API call
    pressureElement.innerText = `${main.pressure} hPa`;
    sunriseElement.innerText = formatTime(sunrise);
    sunsetElement.innerText = formatTime(sunset);

    // Set local time and IST time
    const localTime = new Date(now.getTime() + data.timezone * 1000);
    localTimeElement.innerText = formatTime(localTime);
    const istTime = new Date(now.getTime() + (5.5 * 3600 * 1000));
    istTimeElement.innerText = formatTime(istTime);

    // Display weather forecast (dummy data here, you should replace with actual forecast data)
    forecastContainer.innerHTML = `
        <div><strong>Day 1:</strong> Sunny - 25°C</div>
        <div><strong>Day 2:</strong> Cloudy - 23°C</div>
        <div><strong>Day 3:</strong> Rainy - 18°C</div>
        <div><strong>Day 4:</strong> Snowy - 10°C</div>
        <div><strong>Day 5:</strong> Thunderstorm - 12°C</div>
        <div><strong>Day 6:</strong> Sunny - 26°C</div>
        <div><strong>Day 7:</strong> Cloudy - 22°C</div>
        <div><strong>Day 8:</strong> Rainy - 19°C</div>
        <div><strong>Day 9:</strong> Clear - 24°C</div>
        <div><strong>Day 10:</strong> Snowy - 5°C</div>
    `;

    // Provide recommendations based on weather
    provideRecommendations(weather);
}

// Fetch weather data from API
async function fetchWeather(city) {
    if (!city || city.trim() === "") {
        alert("Please enter a valid city name.");
        return;
    }

    const apiKey = '2149cbc5da7384b8ef7bcccf62b0bf68'; // Replace with your actual API key
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherData.cod !== 200) {
            throw new Error(`City not found: ${city}`);
        }

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (forecastData.cod !== "200") {
            throw new Error(`Forecast data not available for ${city}`);
        }

        updateWeatherUI(weatherData);
        updateForecastUI(forecastData.list);
    } catch (error) {
        console.error("❌ Error fetching weather data:", error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Function to update forecast data on the page
function updateForecastUI(forecastList) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = ""; // Clear old data

    for (let i = 0; i < forecastList.length; i += 8) { // Every 24 hours
        const forecast = forecastList[i];
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const temp = Math.round(forecast.main.temp);
        const weather = forecast.weather[0].main;
        const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;

        const forecastHTML = `
            <div class="forecast-item">
                <strong>${day}</strong>
                <img src="${icon}" alt="${weather}">
                <p>${weather} - ${temp}°C</p>
            </div>
        `;
        forecastContainer.innerHTML += forecastHTML;
    }
}

// Get user's current location
navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data || !data.weather || data.weather.length === 0) {
            console.error("Weather data not found", data);
            alert('Weather data not found!');
            return;
        }

        updateWeatherUI(data);
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert('Error fetching weather data!');
    }
});

// Add console debugging message
console.log("Weather app initialized successfully.");

// Event listener for search button
searchButton.addEventListener('click', () => {
    const city = searchBar.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        alert('Please enter a city!');
    }
});

// Update date and time every second
setInterval(updateDateTime, 1000);

// Initial default weather
updateDateTime();

// User authentication and city save functions

// Register user
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('User registered successfully');
        } else {
            alert('Error registering user');
        }
    } catch (error) {
        alert('Error registering user');
    }
});

// Login user
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('User logged in successfully');
        } else {
            alert('Error logging in user');
        }
    } catch (error) {
        alert('Error logging in user');
    }
});

// Save city
saveCityForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(saveCityForm);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('City saved successfully');
        } else {
            alert('Error saving city');
        }
    } catch (error) {
        alert('Error saving city');
    }
});

// Example function to trigger alert
const triggerAlert = async (type, to, message) => {
  await fetch('/send-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, to, message })
  });
};

// Function to provide recommendations based on weather
function provideRecommendations(weather) {
    if (!weather || !weather.weather || weather.weather.length === 0) {
        console.error("❌ Weather data is missing or invalid.");
        return;
    }

    const recommendations = [];
    const condition = weather.weather[0].main.toLowerCase();
    const temp = weather.main.temp;

    if (temp < 15) recommendations.push("Wear warm clothes 🧥");
    if (temp > 30) recommendations.push("Stay hydrated 💧");
    if (condition.includes("rain")) recommendations.push("Carry an umbrella ☔");
    if (condition.includes("snow")) recommendations.push("Wear a jacket ❄️");
    if (condition.includes("thunderstorm")) recommendations.push("Stay indoors ⚡");

    document.getElementById("recommendations").innerHTML = recommendations.join(", ");
}

// Function to display disaster warnings
const displayDisasterWarnings = (warnings) => {
  const warningContainer = document.getElementById('disaster-warnings');
  warningContainer.innerHTML = warnings.map(warning => `<div>${warning}</div>`).join('');
};

// Initialize map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add weather data layer
const weatherLayer = L.layerGroup().addTo(map);

// Function to update weather layer
const updateWeatherLayer = (data) => {
  weatherLayer.clearLayers();
  data.forEach(point => {
    L.marker([point.lat, point.lon]).addTo(weatherLayer)
      .bindPopup(`<b>${point.weather}</b><br>${point.temp}°C`);
  });
};

// Example using Web Speech API
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onresult = (event) => {
  const command = event.results[0][0].transcript;
  if (command.includes('weather')) {
    fetchWeather('current location');
  }
};
recognition.start();

// Example using Three.js
// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// Add weather data to scene
// const addWeatherDataToScene = (data) => {
//   data.forEach(point => {
//     const geometry = new THREE.SphereGeometry(0.1, 32, 32);
//     const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//     const sphere = new THREE.Mesh(geometry, material);
//     sphere.position.set(point.lat, point.lon, 0);
//     scene.add(sphere);
//   });
// };

// Render scene
// const animate = () => {
//   requestAnimationFrame(animate);
//   renderer.render(scene, camera);
// };
// animate();

async function getCitySuggestions(city) {
    const apiKey = '2149cbc5da7384b8ef7bcccf62b0bf68'; // Replace with your actual API key
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;

    try {
        const response = await fetch(geoUrl);
        const data = await response.json();

        if (data.length === 0) {
            return [];
        }

        return data.map(location => `${location.name}, ${location.country}`);
    } catch (error) {
        console.error("❌ Error fetching city suggestions:", error);
        return [];
    }
}

searchBar.addEventListener('input', async () => {
    const city = searchBar.value.trim();
    if (city.length < 2) return;

    const suggestions = await getCitySuggestions(city);
    const suggestionsList = document.querySelector("#city-suggestions");

    suggestionsList.innerHTML = suggestions
        .map(suggestion => `<li onclick="selectCity('${suggestion}')">${suggestion}</li>`)
        .join('');
});

function selectCity(city) {
    searchBar.value = city;
    document.querySelector("#city-suggestions").innerHTML = "";
}

