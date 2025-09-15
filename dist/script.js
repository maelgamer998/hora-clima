const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');

const cityNameDisplay = document.getElementById('cityName');
const dateDisplay = document.getElementById('dateDisplay');
const temperatureDisplay = document.getElementById('temperatureDisplay');
const weatherDescription = document.getElementById('weatherDescription');
const weatherIcon = document.getElementById('weatherIcon');
const extraWeather = document.getElementById('extraWeather');

const hoursDisplay = document.getElementById('hours');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');

const hueSlider = document.getElementById('hueSlider');
const brightnessSlider = document.getElementById('brightnessSlider');

const openWeatherApiKey = '3ead94e6102f87674b72e0d65d4763e6';
const timezoneApiKey = '92PQVGBBE5EE';

let currentTimezone = 'America/Sao_Paulo';
let clockInterval;
let serverTimestamp = null;

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeatherByCity(city);
  } else {
    cityNameDisplay.textContent = 'Digite uma cidade válida!';
    temperatureDisplay.textContent = '-- °C';
    weatherDescription.textContent = '--';
    extraWeather.innerHTML = '';
  }
});

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    searchBtn.click();
  }
});

async function fetchWeatherByCity(city) {
  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${openWeatherApiKey}&units=metric&lang=pt_br`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error('Cidade não encontrada');
    const weatherData = await weatherRes.json();

    cityNameDisplay.textContent = weatherData.name;
    temperatureDisplay.textContent = `${Math.round(weatherData.main.temp)} °C`;

    const description = weatherData.weather[0].description;
    weatherDescription.textContent = description.charAt(0).toUpperCase() + description.slice(1);

    const iconCode = weatherData.weather[0].icon;
    weatherIcon.style.backgroundImage = `url(https://openweathermap.org/img/wn/${iconCode}@4x.png)`;
    weatherIcon.textContent = '';

    extraWeather.innerHTML = `
      <div title="Umidade">
        <svg viewBox="0 0 24 24"><path d="M12 3.1c-3.3 4-6 7.4-6 10.4 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3-2.7-6.4-6-10.4z"/></svg>
        ${weatherData.main.humidity}%
      </div>
      <div title="Vento">
        <svg viewBox="0 0 24 24"><path d="M4 12h12M12 16l4-4-4-4"/></svg>
        ${weatherData.wind.speed} m/s
      </div>
      <div title="Sensação térmica">
        <svg viewBox="0 0 24 24"><path d="M14 2v10.5a3.5 3.5 0 11-4 0V2z"/></svg>
        ${Math.round(weatherData.main.feels_like)} °C
      </div>
    `;

    const lat = weatherData.coord.lat;
    const lon = weatherData.coord.lon;
    const tzUrl = `https://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneApiKey}&format=json&by=position&lat=${lat}&lng=${lon}`;
    const tzRes = await fetch(tzUrl);
    if (!tzRes.ok) throw new Error('Erro ao obter timezone');
    const tzData = await tzRes.json();

    currentTimezone = tzData.zoneName;

    serverTimestamp = tzData.timestamp;

    if (clockInterval) clearInterval(clockInterval);
    updateClock();
    clockInterval = setInterval(updateClock, 1000);

  } catch (error) {
    cityNameDisplay.textContent = 'Erro';
    temperatureDisplay.textContent = '-- °C';
    weatherDescription.textContent = error.message;
    extraWeather.innerHTML = '';
    console.error(error);
  }
}

function updateClock() {
  if (!serverTimestamp) return;

  serverTimestamp++;

  const now = new Date(serverTimestamp * 1000);

  const h = now.getUTCHours();
  const m = now.getUTCMinutes();
  const s = now.getUTCSeconds();

  hoursDisplay.textContent = String(h).padStart(2, '0');
  minutesDisplay.textContent = String(m).padStart(2, '0');
  secondsDisplay.textContent = String(s).padStart(2, '0');

  const dateOptions = {
    timeZone: currentTimezone,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const dateString = now.toLocaleDateString('pt-BR', dateOptions);
  dateDisplay.textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
}

function updateHue() {
  document.documentElement.style.setProperty('--hue', hueSlider.value);
}
function updateBrightness() {
  document.documentElement.style.setProperty('--brightness', brightnessSlider.value);
}

hueSlider.addEventListener('input', updateHue);
brightnessSlider.addEventListener('input', updateBrightness);

window.onload = () => {
  cityInput.value = 'São Paulo';
  fetchWeatherByCity('São Paulo');
  updateHue();
  updateBrightness();
};
