 // API Key
 const apiKey = 'a770f912aef30d83e8706201ad292944';
        
 // DOM Elements
 const cityInput = document.getElementById('city-input');
 const searchBtn = document.getElementById('search-btn');
 const locationBtn = document.getElementById('location-btn');
 const unitToggle = document.getElementById('unit-toggle');
 const temperatureElement = document.getElementById('temperature');
 const feelsLikeElement = document.getElementById('feels-like');
 const conditionElement = document.getElementById('condition');
 const humidityElement = document.getElementById('humidity');
 const windSpeedElement = document.getElementById('wind-speed');
 const pressureElement = document.getElementById('pressure');
 const locationElement = document.getElementById('location');
 const dateTimeElement = document.getElementById('date-time');
 const weatherIconElement = document.getElementById('weather-icon');
 const currentWeatherCard = document.getElementById('current-weather-card');
 const sunriseTimeElement = document.getElementById('sunrise-time');
 const sunsetTimeElement = document.getElementById('sunset-time');
 const sunProgressFill = document.getElementById('sun-progress-fill');
 const sunProgressMarker = document.getElementById('sun-progress-marker');
 const aqiValueElement = document.getElementById('aqi-value');
 const aqiStatusElement = document.getElementById('aqi-status');
 const aqiDescriptionElement = document.getElementById('aqi-description');
 const pollutantsContainer = document.getElementById('pollutants-container');
 const forecastContainer = document.getElementById('forecast-container');
 const hourlyContainer = document.getElementById('hourly-container');
 const loadingContainer = document.getElementById('loading-container');
 const errorContainer = document.getElementById('error-container');
 const errorMessage = document.getElementById('error-message');
 const errorClose = document.getElementById('error-close');

 // State variables
 let units = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
 let currentCity = '';
 let currentWeatherData = null;

 // Initialize the app
 function init() {
     setupEventListeners();
     
     // Try to get user's location on page load
     if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(
             position => {
                 getWeatherByCoords(position.coords.latitude, position.coords.longitude);
             },
             error => {
                 // Default to a popular city if geolocation fails
                 getWeatherByCity('New York');
             }
         );
     } else {
         // Geolocation not supported
         getWeatherByCity('New York');
     }
 }

 // Set up event listeners
 function setupEventListeners() {
     searchBtn.addEventListener('click', () => {
         const city = cityInput.value.trim();
         if (city) {
             getWeatherByCity(city);
         } else {
             showError('Please enter a city name');
         }
     });

     cityInput.addEventListener('keypress', (e) => {
         if (e.key === 'Enter') {
             const city = cityInput.value.trim();
             if (city) {
                 getWeatherByCity(city);
             } else {
                 showError('Please enter a city name');
             }
         }
     });

     locationBtn.addEventListener('click', () => {
         if (navigator.geolocation) {
             showLoading();
             navigator.geolocation.getCurrentPosition(
                 position => {
                     getWeatherByCoords(position.coords.latitude, position.coords.longitude);
                 },
                 error => {
                     hideLoading();
                     showError('Unable to retrieve your location');
                 }
             );
         } else {
             showError('Geolocation is not supported by your browser');
         }
     });

     unitToggle.addEventListener('click', () => {
         units = units === 'metric' ? 'imperial' : 'metric';
         unitToggle.textContent = `Switch to ${units === 'metric' ? '°F' : '°C'}`;
         
         // Update the temperature unit display
         document.querySelector('.temperature-unit').textContent = units === 'metric' ? '°C' : '°F';
         
         // If we have weather data, update the display with the new units
         if (currentWeatherData) {
             updateWeatherDisplay(currentWeatherData);
         }
     });

     errorClose.addEventListener('click', () => {
         errorContainer.classList.remove('active');
     });
 }

 // Get weather data by city name
 async function getWeatherByCity(city) {
     showLoading();
     try {
         // Get current weather
         const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;
         const weatherResponse = await fetch(weatherUrl);
         const weatherData = await weatherResponse.json();

         if (weatherData.cod !== 200) {
             throw new Error(weatherData.message);
         }

         // Get forecast data
         const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`;
         const forecastResponse = await fetch(forecastUrl);
         const forecastData = await forecastResponse.json();

         // Get air quality data
         const lat = weatherData.coord.lat;
         const lon = weatherData.coord.lon;
         const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
         const airQualityResponse = await fetch(airQualityUrl);
         const airQualityData = await airQualityResponse.json();

         // Save current city and weather data
         currentCity = city;
         currentWeatherData = {
             weather: weatherData,
             forecast: forecastData,
             airQuality: airQualityData
         };

         // Update the UI
         updateWeatherDisplay(currentWeatherData);
         hideLoading();
     } catch (error) {
         hideLoading();
         showError(`Error: ${error.message}`);
     }
 }

 // Get weather data by coordinates
 async function getWeatherByCoords(lat, lon) {
     showLoading();
     try {
         // Get current weather
         const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
         const weatherResponse = await fetch(weatherUrl);
         const weatherData = await weatherResponse.json();

         // Get forecast data
         const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
         const forecastResponse = await fetch(forecastUrl);
         const forecastData = await forecastResponse.json();

         // Get air quality data
         const airQualityUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
         const airQualityResponse = await fetch(airQualityUrl);
         const airQualityData = await airQualityResponse.json();

         // Save current city and weather data
         currentCity = weatherData.name;
         currentWeatherData = {
             weather: weatherData,
             forecast: forecastData,
             airQuality: airQualityData
         };

         // Update the UI
         updateWeatherDisplay(currentWeatherData);
         hideLoading();
     } catch (error) {
         hideLoading();
         showError(`Error: ${error.message}`);
     }
 }

 // Update the weather display with the fetched data
 function updateWeatherDisplay(data) {
     const weather = data.weather;
     const forecast = data.forecast;
     const airQuality = data.airQuality;

     // Update current weather
     temperatureElement.textContent = Math.round(weather.main.temp);
     feelsLikeElement.textContent = `${Math.round(weather.main.feels_like)}${units === 'metric' ? '°C' : '°F'}`;
     conditionElement.textContent = weather.weather[0].description;
     humidityElement.textContent = `${weather.main.humidity}%`;
     windSpeedElement.textContent = `${weather.wind.speed} ${units === 'metric' ? 'm/s' : 'mph'}`;
     pressureElement.textContent = `${weather.main.pressure} hPa`;
     locationElement.textContent = `${weather.name}, ${weather.sys.country}`;

     // Update date and time
     const now = new Date();
     dateTimeElement.textContent = now.toLocaleString('en-US', {
         weekday: 'long',
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
     });

     // Update weather icon and background
     updateWeatherIcon(weather.weather[0].id, weather.dt, weather.sys.sunrise, weather.sys.sunset);

     // Update sunrise and sunset times
     const sunriseTime = new Date(weather.sys.sunrise * 1000);
     const sunsetTime = new Date(weather.sys.sunset * 1000);
     sunriseTimeElement.textContent = sunriseTime.toLocaleTimeString('en-US', {
         hour: '2-digit',
         minute: '2-digit'
     });
     sunsetTimeElement.textContent = sunsetTime.toLocaleTimeString('en-US', {
         hour: '2-digit',
         minute: '2-digit'
     });

     // Update sun progress
     updateSunProgress(now, sunriseTime, sunsetTime);

     // Update air quality
     updateAirQuality(airQuality);

     // Update forecast
     updateForecast(forecast);

     // Update hourly forecast
     updateHourlyForecast(forecast);
 }

 // Update weather icon and background based on weather condition
 function updateWeatherIcon(weatherId, currentTime, sunrise, sunset) {
     // Check if it's day or night
     const isDay = currentTime > sunrise && currentTime < sunset;
     
     // Set icon based on weather condition
     let iconClass = 'fa-sun';
     let bgClass = 'weather-bg-clear-day';
     
     if (weatherId >= 200 && weatherId < 300) {
         // Thunderstorm
         iconClass = 'fa-bolt';
         bgClass = 'weather-bg-thunderstorm';
     } else if (weatherId >= 300 && weatherId < 600) {
         // Rain and drizzle
         iconClass = 'fa-cloud-rain';
         bgClass = 'weather-bg-rain';
     } else if (weatherId >= 600 && weatherId < 700) {
         // Snow
         iconClass = 'fa-snowflake';
         bgClass = 'weather-bg-snow';
     } else if (weatherId >= 700 && weatherId < 800) {
         // Atmosphere (fog, mist, etc.)
         iconClass = 'fa-smog';
         bgClass = 'weather-bg-clouds';
     } else if (weatherId === 800) {
         // Clear
         iconClass = isDay ? 'fa-sun' : 'fa-moon';
         bgClass = isDay ? 'weather-bg-clear-day' : 'weather-bg-clear-night';
     } else if (weatherId > 800) {
         // Clouds
         iconClass = isDay ? 'fa-cloud-sun' : 'fa-cloud-moon';
         bgClass = 'weather-bg-clouds';
     }
     
     // Update icon
     weatherIconElement.className = `fas ${iconClass}`;
     
     // Update background
     currentWeatherCard.className = `current-weather weather-card ${bgClass}`;
 }

 // Update sun progress bar
 function updateSunProgress(currentTime, sunriseTime, sunsetTime) {
     const dayDuration = sunsetTime - sunriseTime;
     const timeElapsed = currentTime - sunriseTime;
     
     let progressPercentage = 0;
     if (currentTime < sunriseTime) {
         progressPercentage = 0;
     } else if (currentTime > sunsetTime) {
         progressPercentage = 100;
     } else {
         progressPercentage = (timeElapsed / dayDuration) * 100;
     }
     
     sunProgressFill.style.width = `${progressPercentage}%`;
     sunProgressMarker.style.left = `${progressPercentage}%`;
 }

 // Update air quality display
 function updateAirQuality(airQualityData) {
     const aqi = airQualityData.list[0].main.aqi;
     aqiValueElement.textContent = aqi;
     
     // Remove all status classes
     aqiStatusElement.classList.remove('aqi-good', 'aqi-moderate', 'aqi-unhealthy', 'aqi-very-unhealthy', 'aqi-hazardous');
     
     // Set appropriate status class and text
     let statusClass = '';
     let statusText = '';
     let description = '';
     
     switch(aqi) {
         case 1:
             statusClass = 'aqi-good';
             statusText = 'Good';
             description = 'Air quality is satisfactory, and air pollution poses little or no risk.';
             break;
         case 2:
             statusClass = 'aqi-moderate';
             statusText = 'Moderate';
             description = 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.';
             break;
         case 3:
             statusClass = 'aqi-unhealthy';
             statusText = 'Unhealthy for Sensitive Groups';
             description = 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
             break;
         case 4:
             statusClass = 'aqi-very-unhealthy';
             statusText = 'Unhealthy';
             description = 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.';
             break;
         case 5:
             statusClass = 'aqi-hazardous';
             statusText = 'Very Unhealthy';
             description = 'Health alert: The risk of health effects is increased for everyone.';
             break;
         default:
             statusClass = 'aqi-moderate';
             statusText = 'Unknown';
             description = 'Air quality information is currently unavailable.';
     }
     
     aqiStatusElement.classList.add(statusClass);
     aqiStatusElement.textContent = statusText;
     aqiDescriptionElement.textContent = description;
 }

 // Update 5-day forecast
 function updateForecast(forecastData) {
     forecastContainer.innerHTML = '';
     
     // Group forecast by day
     const dailyForecasts = {};
     
     forecastData.list.forEach(item => {
         const date = new Date(item.dt * 1000);
         const day = date.toLocaleDateString('en-US', { weekday: 'short' });
         
         if (!dailyForecasts[day]) {
             dailyForecasts[day] = {
                 date: date,
                 icon: item.weather[0].id,
                 minTemp: item.main.temp_min,
                 maxTemp: item.main.temp_min,
                 description: item.weather[0].description
             };
         } else {
             dailyForecasts[day].minTemp = Math.min(dailyForecasts[day].minTemp, item.main.temp_min);
             dailyForecasts[day].maxTemp = Math.max(dailyForecasts[day].maxTemp, item.main.temp_max);
         }
     });
     
     // Create forecast cards
     Object.keys(dailyForecasts).slice(0, 5).forEach(day => {
         const forecast = dailyForecasts[day];
         const card = document.createElement('div');
         card.className = 'forecast-card';
         
         // Determine icon class
         let iconClass = getWeatherIconClass(forecast.icon);
         
         card.innerHTML = `
             <div class="forecast-day">${day}</div>
             <div class="forecast-icon">
                 <i class="fas ${iconClass}"></i>
             </div>
             <div class="forecast-temp">${Math.round(forecast.minTemp)}° / ${Math.round(forecast.maxTemp)}°</div>
             <div class="forecast-condition">${forecast.description}</div>
         `;
         
         forecastContainer.appendChild(card);
     });
 }

 // Update hourly forecast
 function updateHourlyForecast(forecastData) {
     hourlyContainer.innerHTML = '';
     
     // Get next 24 hours (8 items with 3-hour intervals)
     const hourlyItems = forecastData.list.slice(0, 8);
     
     hourlyItems.forEach(item => {
         const date = new Date(item.dt * 1000);
         const hour = date.toLocaleTimeString('en-US', { hour: '2-digit' });
         
         // Determine icon class
         let iconClass = getWeatherIconClass(item.weather[0].id);
         
         const hourlyItem = document.createElement('div');
         hourlyItem.className = 'hourly-item';
         hourlyItem.innerHTML = `
             <div class="hourly-time">${hour}</div>
             <div class="hourly-icon">
                 <i class="fas ${iconClass}"></i>
             </div>
             <div class="hourly-temp">${Math.round(item.main.temp)}°</div>
         `;
         
         hourlyContainer.appendChild(hourlyItem);
     });
 }

 // Helper function to get weather icon class
 function getWeatherIconClass(weatherId) {
     if (weatherId >= 200 && weatherId < 300) {
         return 'fa-bolt';
     } else if (weatherId >= 300 && weatherId < 600) {
         return 'fa-cloud-rain';
     } else if (weatherId >= 600 && weatherId < 700) {
         return 'fa-snowflake';
     } else if (weatherId >= 700 && weatherId < 800) {
         return 'fa-smog';
     } else if (weatherId === 800) {
         return 'fa-sun';
     } else if (weatherId > 800) {
         return 'fa-cloud';
     }
     return 'fa-sun';
 }

 // Show loading spinner
 function showLoading() {
     loadingContainer.classList.add('active');
 }

 // Hide loading spinner
 function hideLoading() {
     loadingContainer.classList.remove('active');
 }

 // Show error message
 function showError(message) {
     errorMessage.textContent = message;
     errorContainer.classList.add('active');
     
     // Auto-hide after 5 seconds
     setTimeout(() => {
         errorContainer.classList.remove('active');
     }, 5000);
 }

 // Initialize the app when the page loads
 document.addEventListener('DOMContentLoaded', init);