
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

//Api key for OpenWeatherMap API
const weatherAPIKey = WeatherAPIKey;
let weatherBaseEndpoint = 'https://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + weatherAPIKey;

//Creating the API Call function
let getWeatherByCityName = async (city) => {
    let endpoint = weatherBaseEndpoint + '&q=' + city;

    let response = await fetch(endpoint); //CAUSE FETCH FX IS ASYNCHRONOUS and returns a promise, we add await

    let weather = await response.json(); //converts the response into JSON (also async function)

    return weather;
}

//getWeatherByCityName('Tallinn');

searchInput.addEventListener("keydown", async (event) => {

   //console.log(event);
   
   /* As you can see, the getweatherbycityname function is an asynchronous function, so to assign the,
    result to the weather variable, we need to add the word await. 
    Since we  used the word await, we need to add the word async before the function (event), just to */
    
   if (event.keyCode === 13 ) {
        let weather = await getWeatherByCityName(searchInput.value);
        updateWeather(weather);
        console.log(weather);
    }
});

// Function to update the weather on front-end
let updateWeather = (data) => {
    city.textContent = data.name + ', ' + data.sys.country;
    date.textContent = dayOfTheWeek();
    humidity.textContent = data.main.humidity;
    temperature.textContent = data.main.temp;
    pressure.textContent = data.main.pressure;
    temperatureFeelsLike.textContent = data.main.feels_like;
}

//Function to get the day
let dayOfTheWeek = () => {

    const datestring = { weekday: 'long', day: 'numeric', month: 'short' }
    
    return new Date().toLocaleDateString('en-EN', datestring); //1st argument = the language of the day, 2nd = full length
}