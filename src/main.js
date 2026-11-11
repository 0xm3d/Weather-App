import "./style.css";
import { WEATHER_CODES } from "./codes.js";
console.log("Main.js is working");

const search = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("error-msg");
const weatherContainer = document.getElementById("weather-container");

// Search for a city
async function getCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("City search failed.");
  }

  const data = await response.json();

  return data.results || [];
}

// Get current weather
async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather request failed.");
  }

  const data = await response.json();

  return data;
}

function createWeatherCard(
  city,
  temperature,
  description,
  icon,
  humidity,
  wind,
) {
  const card = document.createElement("div");

  card.className = `
    max-w-xl mx-auto mt-8
    bg-[#eee] rounded-2xl shadow-lg
    border border-gray-100
    p-6 sm:p-8
    transition duration-300
    hover:shadow-xl
  `;

  const cityName = document.createElement("h2");
  cityName.className = "text-2xl font-bold text-gray-800";
  cityName.textContent = city;

  const weatherIcon = document.createElement("p");
  weatherIcon.className = "text-7xl my-5";
  weatherIcon.textContent = icon;

  const temp = document.createElement("p");
  temp.className = "text-5xl font-bold text-emerald-600";
  temp.textContent = `${temperature}°C`;

  const weatherDescription = document.createElement("p");
  weatherDescription.className = "text-lg text-gray-500 mt-2";
  weatherDescription.textContent = description;

  const details = document.createElement("div");
  details.className = `
    grid grid-cols-2 gap-4 mt-8
    border-t border-gray-100 pt-6
  `;

  const humidityInfo = document.createElement("div");
  humidityInfo.className = "bg-blue-50 rounded-xl p-4";
  humidityInfo.textContent = `Humidity ${humidity}%`;

  const windInfo = document.createElement("div");
  windInfo.className = "bg-emerald-50 rounded-xl p-4";
  windInfo.textContent = `Wind ${wind} km/h`;

  details.append(humidityInfo, windInfo);

  card.append(cityName, weatherIcon, temp, weatherDescription, details);

  return card;
}

// Search button
searchButton.addEventListener("click", async function () {
  const city = search.value.trim();

  if (city === "") {
    errorMsg.textContent = "You can't search for nothing";
    errorMsg.classList.remove("hidden");
    return;
  }

  errorMsg.classList.add("hidden");
  loading.classList.remove("hidden");
  searchButton.disabled = true;

  try {
    // Find the city
    const cities = await getCity(city);

    if (cities.length === 0) {
      throw new Error("City not found.");
    }

    const cityData = cities[0];

    // Get weather
    const weather = await getWeather(cityData.latitude, cityData.longitude);

    // Extract current weather values
    const temperature = weather.current.temperature_2m;
    const humidity = weather.current.relative_humidity_2m;
    const wind = weather.current.wind_speed_10m;
    const weatherCode = weather.current.weather_code;

    // Get weather description and icon
    const condition = WEATHER_CODES[weatherCode] || {
      label: "Unknown conditions",
      icon: "❔",
    };

    // Create and display card
    const card = createWeatherCard(
      cityData.name,
      temperature,
      condition.label,
      condition.icon,
      humidity,
      wind,
    );

    weatherContainer.replaceChildren(card);
  } catch (error) {
    errorMsg.textContent =
      error.message === "City not found."
        ? "City not found."
        : "Something went wrong. Please try again.";

    errorMsg.classList.remove("hidden");

    console.error("API request failed:", error);
  } finally {
    loading.classList.add("hidden");
    searchButton.disabled = false;
  }
});
