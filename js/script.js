
// Selecting all the DOM elements
let searchInput = document.querySelector('.weather__search');
let city = document.querySelector('.weather__city');
let date = document.querySelector('.weather__date');
let humidity = document.querySelector('.weather__indicator--humidity>.value'); //>.value to target the inner span!!!
let wind = document.querySelector('.weather__indicator--wind>.value');
let pressure = document.querySelector('.weather__indicator--pressure>.value');
let image = document.querySelector('.weather__image');
let temperature = document.querySelector('.weather__temperature>.value');
let temperatureFeelsLike = document.querySelector('.weather__temperature__feels-like>.value');
let forecastBlock = document.querySelector('.weather__forecast');

//Api key for OpenWeatherMap API
const weatherAPIKey = config.WeatherAPIKey || process.env.WeatherAPIKey;
const weatherBaseEndpoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;
const forecastBaseEndpoint = 'https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=' + weatherAPIKey;

//Creating the API Call function
let getWeatherByCityName = async (city) => {
    let endpoint = weatherBaseEndpoint + '&q=' + city;

    let response = await fetch(endpoint); //CAUSE FETCH FX IS ASYNCHRONOUS and returns a promise, we add await

    let weather = await response.json(); //converts the response into JSON (also async function)

    console.log(weather);

    return weather;
}

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
//getWeatherByCityName('Tallinn');

searchInput.addEventListener("keydown", async (event) => {

   //console.log(event);
   
   /* As you can see, the getweatherbycityname function is an asynchronous function, so to assign the,
    result to the weather variable, we need to add the word await. 
    Since we  used the word await, we need to add the word async before the function (event), just to */
   
    //When pressing enter, call functions
   if (event.keyCode === 13 ) {
        let weather = await getWeatherByCityName(searchInput.value);
        updateWeather(weather);
        //console.log(weather);

        let cityID = weather.id;
        let forecast = await getForecastByCityID(cityID);
        updateForecast(forecast);
        
    }
});

// Function to update the weather on front-end
let updateWeather = (data) => {
    city.textContent = data.name + ', ' + data.sys.country;
    date.textContent = dayOfTheWeek() + ', ' + dateString();
    humidity.textContent = data.main.humidity;
    temperature.textContent = data.main.temp > 0 ? '+' + Math.round(data.main.temp) : Math.round(data.main.temp);
    pressure.textContent = data.main.pressure;
    temperatureFeelsLike.textContent = data.main.feels_like > 0 ? '+' + data.main.feels_like : data.main.feels_like;

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
}


let updateForecast = (forecast) => {

    forecastBlock.innerHTML = ''; //First we delete the previous data!!!!

    forecast.forEach((day) => {
        let iconURL = 'http://openweathermap.org/img/wn/' + day.weather[0].icon + '@2x.png';

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

//Function to get the day
let dayOfTheWeek = (dt = new Date().getTime()) => {

    const datestring = { weekday: 'long' }

    return new Date(dt).toLocaleDateString('en-EN', datestring); //1st argument = the language of the day, 2nd = full length
}

let dateString = (dt = new Date().getTime()) => {

    const datestring = { day: 'numeric', month: 'short' }

    return new Date(dt).toLocaleDateString('en-EN', datestring);
}