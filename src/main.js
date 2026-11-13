import "./style.css";
import { WEATHER_CODES } from "./codes.js";

// Get HTML elements
const search = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("error-msg");

const weatherContainer = document.getElementById("weather-container");
const forecastContainer = document.getElementById("forecast-container");

const cityButtons = document.querySelectorAll(".city-suggestion");

console.log("Main.js is working");

// Search for a city
async function getCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

  const response = await fetch(url);

  if (response.status === 429) {
    throw new Error("QUOTA_ERROR");
  }

  if (!response.ok) {
    throw new Error("CITY_SEARCH_ERROR");
  }

  const data = await response.json();

  return data.results || [];
}

// Get weather information
async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&forecast_days=5&timezone=auto`;

  const response = await fetch(url);

  if (response.status === 429) {
    throw new Error("QUOTA_ERROR");
  }

  if (!response.ok) {
    throw new Error("WEATHER_API_ERROR");
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

  card.className =
    "max-w-xl mx-auto mt-8 bg-[#eee] rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 transition duration-300 hover:shadow-xl";

  const cityName = document.createElement("h2");
  cityName.className = "text-2xl font-bold text-gray-800";
  cityName.textContent = city;

  const weatherIcon = document.createElement("p");
  weatherIcon.className = "text-6xl mt-4";
  weatherIcon.textContent = icon;

  const temp = document.createElement("p");
  temp.className = "text-5xl font-bold text-gray-800 mt-2";
  temp.textContent = `${Math.round(temperature)}°C`;

  const weatherDescription = document.createElement("p");
  weatherDescription.className = "text-gray-500 mt-2";
  weatherDescription.textContent = description;

  const details = document.createElement("div");
  details.className = "grid grid-cols-2 gap-4 mt-6";

  const humidityInfo = document.createElement("p");
  humidityInfo.className = "text-blue-600 font-medium";
  humidityInfo.textContent = `💧 Humidity: ${humidity}%`;

  const windInfo = document.createElement("p");
  windInfo.className = "text-emerald-600 font-medium";
  windInfo.textContent = `💨 Wind: ${wind} km/h`;

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

  card.className =
    "bg-[#eee] rounded-2xl shadow-lg border border-gray-100 p-5 transition duration-300 hover:shadow-xl";

  const forecastDate = document.createElement("h3");
  forecastDate.className = "font-bold text-gray-800";

  forecastDate.textContent = new Date(date + "T12:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
  );

  const weatherIcon = document.createElement("p");
  weatherIcon.className = "text-4xl my-4";
  weatherIcon.textContent = icon;

  const weatherDescription = document.createElement("p");
  weatherDescription.className = "text-gray-500 text-sm";
  weatherDescription.textContent = description;

  const temperatures = document.createElement("p");
  temperatures.className = "font-bold text-gray-800 mt-4";
  temperatures.textContent = `${Math.round(maxTemp)}° / ${Math.round(minTemp)}°`;

  const rain = document.createElement("p");
  rain.className = "text-blue-600 text-sm mt-3";
  rain.textContent = `🌧️ Rain: ${rainProbability ?? "—"}%`;

  const wind = document.createElement("p");
  wind.className = "text-emerald-600 text-sm mt-2";
  wind.textContent = `💨 Wind: ${windSpeed} km/h`;

  card.append(
    forecastDate,
    weatherIcon,
    weatherDescription,
    temperatures,
    rain,
    wind,
  );

  return card;
}

// Search weather
async function searchWeather() {
  const city = search.value.trim();

  // Check if the search is empty
  if (city === "") {
    errorMsg.textContent = "Please enter a city name.";
    errorMsg.classList.remove("hidden");
    return;
  }

  // Show loading message
  errorMsg.classList.add("hidden");
  loading.classList.remove("hidden");
  searchButton.disabled = true;

  try {
    // Get city information
    const cities = await getCity(city);

    if (cities.length === 0) {
      throw new Error("CITY_NOT_FOUND");
    }

    const cityData = cities[0];

    // Get weather information
    const weather = await getWeather(cityData.latitude, cityData.longitude);

    if (!weather.current || !weather.daily) {
      throw new Error("WEATHER_API_ERROR");
    }

    const current = weather.current;
    const daily = weather.daily;

    // Get weather description and icon
    const currentWeather = WEATHER_CODES[current.weather_code] || {
      label: "Unknown conditions",
      icon: "❔",
    };

    // Create current weather card
    const currentCard = createWeatherCard(
      `${cityData.name}, ${cityData.country}`,
      current.temperature_2m,
      currentWeather.label,
      currentWeather.icon,
      current.relative_humidity_2m,
      current.wind_speed_10m,
    );

    // Transform the five forecast days into objects
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

    // Create the five forecast cards
    const forecastCards = forecastDays.map((day) => {
      const forecastWeather = WEATHER_CODES[day.weatherCode] || {
        label: "Unknown conditions",
        icon: "❔",
      };

      return createForecastCard(
        day.date,
        day.maxTemp,
        day.minTemp,
        forecastWeather.label,
        forecastWeather.icon,
        day.rainProbability,
        day.windSpeed,
      );
    });

    // Display the cards
    weatherContainer.replaceChildren(currentCard);
    forecastContainer.replaceChildren(...forecastCards);
  } catch (error) {
    console.log(error);

    if (error.message === "CITY_NOT_FOUND") {
      errorMsg.textContent = "City not found. Please check the spelling.";
    } else if (error.message === "CITY_SEARCH_ERROR") {
      errorMsg.textContent =
        "The city search service is unavailable. Please try again later.";
    } else if (error.message === "QUOTA_ERROR") {
      errorMsg.textContent = "Too many requests. Please try again later.";
    } else if (error.message === "WEATHER_API_ERROR") {
      errorMsg.textContent =
        "The weather service is unavailable. Please try again later.";
    } else if (error instanceof TypeError) {
      errorMsg.textContent =
        "Unable to connect. Please check your internet connection.";
    } else {
      errorMsg.textContent = "Something went wrong. Please try again.";
    }

    errorMsg.classList.remove("hidden");
  } finally {
    // Hide loading and enable the search button
    loading.classList.add("hidden");
    searchButton.disabled = false;
  }
}

// Search when clicking the button
searchButton.addEventListener("click", searchWeather);

// Search when pressing Enter
search.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchWeather();
  }
});

// Search when clicking a suggested city
cityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    search.value = button.dataset.city;
    searchWeather();
  });
});
