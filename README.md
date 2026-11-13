# Weather Hub

Weather Hub is a small web app for searching a city and viewing its current
weather and five-day forecast. It uses the Open-Meteo API and runs in your
browser.

## Run locally

You need Node.js and npm.

```bash
npm install
npm run dev
```

Open the local address printed by Vite. Search for a city or choose one of the
suggested cities.

## API integration

The app calls Open-Meteo directly from `src/main.js`. No API key is required.

### City search

```text
GET https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1
```

The city name is URL-encoded. The app uses the first match's name, country,
latitude, and longitude. `count=1` limits the search response to one result.

### Weather forecast

```text
GET https://api.open-meteo.com/v1/forecast
  ?latitude={latitude}
  &longitude={longitude}
  &current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m
  &daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max
  &forecast_days=5
  &timezone=auto
```

The app requests current temperature, humidity, wind speed and weather code,
plus daily weather code, high and low temperatures, maximum precipitation
probability, and maximum wind speed. The forecast is limited to five days;
dates use the city's local timezone. Temperatures are shown in Celsius and wind
speed in km/h (Open-Meteo's defaults).

The app handles HTTP 429 responses by showing a `Too many requests` message.
Requests also require an internet connection and may fail if Open-Meteo is
unavailable.

## Example response summary

Open-Meteo returns current values and daily values as arrays. This shortened,
illustrative example shows the fields the app reads:

```json
{
  "current": {
    "temperature_2m": 22.4,
    "relative_humidity_2m": 61,
    "weather_code": 2,
    "wind_speed_10m": 14.8
  },
  "daily": {
    "time": ["2026-11-13", "2026-11-14"],
    "weather_code": [2, 3],
    "temperature_2m_max": [24.1, 21.7],
    "temperature_2m_min": [16.2, 15.8],
    "precipitation_probability_max": [10, 25],
    "wind_speed_10m_max": [18.0, 20.5]
  }
}
```

The real response contains five dates in `daily.time` and matching entries in
each daily array.

## How the data is displayed

1. The city search provides a name and coordinates.
2. The app requests weather for those coordinates.
3. The current temperature, condition, humidity, and wind appear in a weather
   card. Weather codes are converted to a short description and emoji.
4. Each date in the daily response becomes a forecast card showing the
   condition, high/low temperatures, rain chance, and wind speed.

If a city is not found or an API request fails, the app displays an error
message.
