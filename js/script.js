// Selecting all the DOM elements

let searchInput = document.querySelector('.weather__search');
let searchButton = document.querySelector('.search__button');
let city = document.querySelector('.weather__city');
let flag = document.querySelector('.weather__city_flag');
let date = document.querySelector('.weather__date');
let notifications = document.querySelector('.notifications');
let clock = document.querySelector('.weather__indicator--clock>.value'); //>.value to target the inner span!!!
let humidity = document.querySelector('.weather__indicator--humidity>.value'); //>.value to target the inner span!!!
let wind = document.querySelector('.weather__indicator--wind>.value');
let pressure = document.querySelector('.weather__indicator--pressure>.value');
let image = document.querySelector('.weather__image');
let temperature = document.querySelector('.weather__temperature>.value');
let temperatureFeelsLike = document.querySelector('.weather__temperature__feels-like>.value');

let sunrise = document.querySelector('.sunrise>.value');
let sunset = document.querySelector('.sunset>.value');

let forecastBlock = document.querySelector('.weather__forecast');
let weatherDescription = document.querySelector('.weather__description>.value');
let datalist = document.getElementById('suggestions');
// Import the API key from the config.js file
import { apiKey } from './config.js';

//Api key for OpenWeatherMap API & Basic URL endpoints
const weatherAPIKey = apiKey;
const weatherBaseEndpoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;
const forecastBaseEndpoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey;
const geocodingBaseEndpoint = 'https://api.openweathermap.org/geo/1.0/direct?limit=5&appid=' + weatherAPIKey + '&q=';
const countryFlagEndpoint = 'https://countryflagsapi.com/png/';

//Array for weather images (to make the main image dynamic) (IDs from openweathermap api home page)
let weatherImages = [
  {
    // LOCALLY => url: "../images/clear-sky.png",
    url: "https://ristotoldsep.github.io/WeatherApp/images/clear-sky.png",
    ids: [800],
  },
  {
    url: "https://ristotoldsep.github.io/WeatherApp/images/broken-clouds.png",
    ids: [803, 804],
  },
  {
    url: "https://ristotoldsep.github.io/WeatherApp/images/few-clouds.png",
    ids: [801],
  },
  {
    url: "https://ristotoldsep.github.io/WeatherApp/images/mist.png",
    ids: [701, 711, 721, 731, 741, 751, 761, 762, 771, 781],
  },
  {
    url: "https://ristotoldsep.github.io/WeatherApp/images/rain.png",
    ids: [500, 501, 502, 503, 504],
  },
  {
    url: "https://ristotoldsep.github.io/WeatherApp/images/scattered-clouds.png",
    ids: [802],
  },
  {
    url: "https://ristotoldsep.github.io/WeatherApp/images/shower-rain.png",
    ids: [520, 521, 522, 531, 300, 301, 302, 310, 311, 312, 313, 314, 321],
  },
  {
    url: "https://ristotoldsep.github.io/WeatherApp/images/snow.png",
    ids: [511, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
  },
  {
    url: "https://ristotoldsep.github.io/WeatherApp/images/thunderstorm.png",
    ids: [200, 201, 202, 210, 211, 212, 221, 230, 231, 232],
  },
];

//Function which gets the city
const weatherForCity = async (city) => {
    let weather = await getWeatherByCityName(city);
    console.log(weather);
    if (weather.cod == 404) {
        alert(weather.message);
        return;
    }
    updateWeather(weather);
    //console.log(weather);

    let cityID = weather.id;
    let forecast = await getForecastByCityID(cityID);
    updateForecast(forecast);
}

//When pressing enter, call functions
searchInput.addEventListener("keydown", async (event) => {

    /* As you can see, the getweatherbycityname function is an asynchronous function, so to assign the,
     result to the weather variable, we need to add the word await. 
     Since we  used the word await, we need to add the word async before the function (event), just to */

    if (event.keyCode === 13) {
        
        weatherForCity(searchInput.value);

    } 
});

searchButton.addEventListener("click", async () => {

    weatherForCity(searchInput.value);

});

//Geocoding API call for search suggestions
searchInput.addEventListener("input", async () => {
    if (searchInput.value.length <= 2) { //FX starts working once user has entered more than 2 characters
        return;
    }
    let endpoint = geocodingBaseEndpoint + searchInput.value;
    let result = await (await fetch(endpoint)).json(); //turning the response to JSON

    datalist.innerHTML = ''; //To empty out the possible previous search suggestions
    result.forEach((city) => {

        let option = document.createElement('option');

        option.value = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;

        datalist.appendChild(option); //Add the option html tag
    })
});

//Creating the API Call function
let getWeatherByCityName = async (city) => {
    let endpoint = weatherBaseEndpoint + '&q=' + city;

    let response = await fetch(endpoint); //CAUSE FETCH FX IS ASYNCHRONOUS and returns a promise, we add await

    let weather = await response.json(); //converts the response into JSON (also async function)

    //console.log(weather);

    return weather;
}
//getWeatherByCityName('Tallinn');

let getCountryFlag = async (countryCode) => {
   const response = await fetch(`${countryFlagEndpoint}${countryCode}`);
    const blob = await response.blob();

    return blob;    
}
// getCountryFlag();

let getForecastByCityID = async (id) => {
    let endpoint = forecastBaseEndpoint + '&id=' + id;

    let response = await fetch(endpoint);

    let forecast = await response.json();
    //console.log(forecast);

    let forecastList = forecast.list; //Gets the 5 day/3 hour json

    /* Looping over the object to find 12AM for each day, and then pushing that value into daily array */
    let daily = []; 
    let count = 0;
    forecastList.forEach((day) => {
        let date = new Date(day.dt_txt.replace(' ', 'T')); //TURNING THE DATE OBJECT into string (replacing empty space in dt_txt: "2021-01-23 18:00:00" with T)
        let hours = date.getHours();

        if (hours === 12) {
           daily.push(day);
        }
    });
    //console.log(daily);

    return daily;
}

let getCountryTimeByCoordinates = async (lat, long) => {
    const response = await fetch(`https://api.ipgeolocation.io/timezone?apiKey=6f445dc3165b4b84abfb5be8ae9a6ffe&lat=${lat}&long=${long}`)
    
    const data = await response.json()

    return data
}

// Function to update the weather on front-end
let updateWeather = async (data) => {
    city.textContent = data.name + ', ' + data.sys.country;
    
    const flagImage = await getCountryFlag(data.sys.country.toLowerCase());
    const flagURL = URL.createObjectURL(flagImage);

    flag.src = flagURL;
    
    date.textContent = dayOfTheWeek() + ', ' + dateString();

    /** GET TIME */
    const countryTime = await getCountryTimeByCoordinates(data.coord.lat, data.coord.lon);

    // console.log(dateString() == 'Feb 24' ? 'YEAHHH' : 'Nah');

    notifications.textContent = (dateString() == 'Feb 24' && data.sys.country == 'EE') ? 'Palju õnne Eesti! 🥳' : '';
    clock.textContent = countryTime.time_24;
    humidity.textContent = data.main.humidity;
    temperature.textContent = data.main.temp > 0 ? '+' + Math.round(data.main.temp) : Math.round(data.main.temp);
    pressure.textContent = data.main.pressure;
    temperatureFeelsLike.textContent = data.main.feels_like > 0 ? '+' + data.main.feels_like : data.main.feels_like;
    weatherDescription.textContent = data.weather[0].main;

    sunrise.textContent = unixTimeToTimeString(data.sys.sunrise);
    sunset.textContent = unixTimeToTimeString(data.sys.sunset);

    let windDirection;
    let deg = data.wind.deg;
    if (deg > 315 && deg <= 45) {
        windDirection = 'North';
    } else if (deg > 45 && deg <= 135) {
        windDirection = 'East';
    } else if (deg > 135 && deg <= 225) {
        windDirection = 'South';
    } else {
        windDirection = 'West';
    }
    wind.textContent = windDirection + ', ' + data.wind.speed;

    let imgID = data.weather[0].id;
    
    //Looping through the array of image objects
    weatherImages.forEach((obj) => {
        if (obj.ids.includes(imgID)) { //If we find the matching id, change the image url source!
            image.src = obj.url;
        }
    })
}

//Updates the 5 boxes
let updateForecast = (forecast) => {

    forecastBlock.innerHTML = ''; //First we delete the previous data!!!!

    forecast.forEach((day) => {
        let iconURL = 'https://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';

        let dayName = dayOfTheWeek(day.dt * 1000) //To get milliseconds...
        //console.log(dayName);

        let temperature = day.main.temp > 0 ? '+' + Math.round(day.main.temp) : Math.round(day.main.temp);

        let date = dateString(day.dt * 1000);

        let forecastItem = `
            <article class="weather_forecast__item">
                <img src="${iconURL}" alt="${day.weather[0].description}" class="weather__forecast__icon">
                <h3 class="weather__forecast__day">${dayName}</h3>
                <p class="weather__date__small">${date}</p>  
                <p class="weather__forecast__temperature"><span class="value">${temperature}</span>&deg;C</p>
            </article>
        `;
       forecastBlock.insertAdjacentHTML('beforeend', forecastItem);
    });
}

let unixTimeToTimeString = (unixTime) => {
  const date = new Date(unixTime * 1000); // Convert Unix timestamp to milliseconds
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}


//Function to get the day of the week
let dayOfTheWeek = (dt = new Date().getTime()) => {

    const datestring = { weekday: 'long' }

    return new Date(dt).toLocaleDateString('en-EN', datestring); //1st argument = the language of the day, 2nd = full length
}

//Function to get the day of the date
let dateString = (dt = new Date().getTime()) => {

    const datestring = { day: 'numeric', month: 'short' }

    return new Date(dt).toLocaleDateString('en-EN', datestring);
}

const init = async (city) => {
   
    await weatherForCity('Tallinn');
    document.body.style.filter = 'blur(0)'; //WAITS UNTIL THE PAGE IS LOADED, THEN REMOVES FILTER!
}

init();