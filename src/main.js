import "./style.css";

const search = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const loading = document.getElementById("loading");
const errorMsg = document.getElementById("error-msg");

searchButton.addEventListener("click", function () {
  const city = search.value.trim();

  if (city === "") {
    errorMsg.textContent = "You can't search for nothing";
    errorMsg.classList.remove("hidden");
    return;
  }

  errorMsg.classList.add("hidden");

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&countryCode=MA&count=1`;

  loading.classList.remove("hidden");

  fetch(url)
    .catch((error) => {
      console.error("API request failed:", error);
    })
    .finally(() => {
      loading.classList.add("hidden");
    });
});
