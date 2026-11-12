import "./style.css";
import { WEATHER_CODES } from "./codes.js";

const search = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("error-msg");
const weatherContainer = document.getElementById("weather-container");
const forecastContainer = document.getElementById("forecast-container");

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

// Get current weather and forecast
async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&forecast_days=5&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Weather request failed.");
  }

  const data = await response.json();

  return data;
}

// Create the current weather card
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
  temp.textContent = `${temperature ?? "—"}°C`;

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
  humidityInfo.textContent = `Humidity ${humidity ?? "—"}%`;

  const windInfo = document.createElement("div");
  windInfo.className = "bg-emerald-50 rounded-xl p-4";
  windInfo.textContent = `Wind ${wind ?? "—"} km/h`;

  details.append(humidityInfo, windInfo);

  card.append(cityName, weatherIcon, temp, weatherDescription, details);

  return card;
}

// Create a forecast card
function createForecastCard(
  date,
  maxTemp,
  minTemp,
  description,
  icon,
  rainProbability,
  windSpeed,
) {
  const card = document.createElement("div");

  card.className = `
    bg-[#eee] rounded-2xl shadow-lg
    border border-gray-100
    p-5
    transition duration-300
    hover:shadow-xl
  `;

  const forecastDate = document.createElement("h3");
  forecastDate.className = "text-lg font-bold text-gray-800";

  forecastDate.textContent = new Date(date + "T12:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
  );

  const weatherIcon = document.createElement("p");
  weatherIcon.className = "text-6xl my-5 text-center";
  weatherIcon.textContent = icon;

  const temp = document.createElement("p");
  temp.className = "text-3xl font-bold text-emerald-600 text-center";
  temp.textContent = `${maxTemp ?? "—"}°C`;

  const weatherDescription = document.createElement("p");
  weatherDescription.className = "text-lg text-gray-500 text-center mt-2";
  weatherDescription.textContent = description;

  const details = document.createElement("div");
  details.className = `
    grid grid-cols-2 gap-3 mt-6
    border-t border-gray-100 pt-5
  `;

  const minTemperature = document.createElement("div");
  minTemperature.className = "bg-blue-50 rounded-xl p-3";
  minTemperature.textContent = `Min ${minTemp ?? "—"}°C`;

  const rainInfo = document.createElement("div");
  rainInfo.className = "bg-emerald-50 rounded-xl p-3";
  rainInfo.textContent = `Rain ${rainProbability ?? "—"}%`;

  const windInfo = document.createElement("div");
  windInfo.className = "bg-emerald-50 rounded-xl p-3 col-span-2";
  windInfo.textContent = `Wind ${windSpeed ?? "—"} km/h`;

  details.append(minTemperature, rainInfo, windInfo);

  card.append(forecastDate, weatherIcon, temp, weatherDescription, details);

  return card;
}

// Search button
searchButton.addEventListener("click", async function () {
  const city = search.value.trim();

  // Check if the search is empty
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

    // Get weather data
    const weather = await getWeather(cityData.latitude, cityData.longitude);

    // Get today's weather
    const temperature = weather.current.temperature_2m;
    const humidity = weather.current.relative_humidity_2m;
    const wind = weather.current.wind_speed_10m;
    const weatherCode = weather.current.weather_code;

    // Get weather description and icon
    const condition = WEATHER_CODES[weatherCode] || {
      label: "Unknown conditions",
      icon: "❔",
    };

    // Create today's weather card
    const card = createWeatherCard(
      cityData.name,
      temperature,
      condition.label,
      condition.icon,
      humidity,
      wind,
    );

    // Display today's weather
    weatherContainer.replaceChildren(card);

    // Get daily forecast data
    const daily = weather.daily;

    // Transform all five days into objects
    const forecastDays = daily.time.map((date, index) => {
      return {
        date: date,
        weatherCode: daily.weather_code[index],
        maxTemp: daily.temperature_2m_max[index],
        minTemp: daily.temperature_2m_min[index],
        rainProbability: daily.precipitation_probability_max[index],
        windSpeed: daily.wind_speed_10m_max[index],
      };
    });

    // Create forecast cards
    const forecastCards = forecastDays.map((day) => {
      const condition = WEATHER_CODES[day.weatherCode] || {
        label: "Unknown conditions",
        icon: "❔",
      };

      return createForecastCard(
        day.date,
        day.maxTemp,
        day.minTemp,
        condition.label,
        condition.icon,
        day.rainProbability,
        day.windSpeed,
      );
    });

    // Display all five forecast cards
    forecastContainer.replaceChildren(...forecastCards);
  } catch (error) {
    // Show error message
    errorMsg.textContent =
      error.message === "City not found."
        ? "City not found."
        : "Something went wrong. Please try again.";

    errorMsg.classList.remove("hidden");

    console.error("API request failed:", error);
  } finally {
    // Stop loading
    loading.classList.add("hidden");
    searchButton.disabled = false;
  }
});
