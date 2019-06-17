const fetch = require("node-fetch");

const BASE_URL = 'https://www.metaweather.com/api';

var Forecast = function () {};

function makeReadable(forecast) {
  forecast.min_temp = parseInt(forecast.min_temp);
  forecast.max_temp = parseInt(forecast.max_temp);
  forecast.wind_speed = parseInt(forecast.wind_speed);
  forecast.visibility = parseInt(forecast.visibility);
  return forecast;
}

async function invokeAPI(url) {
  try {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  } catch (error) {
    console.log(error);
  }

  return null;
}

async function getCity(city) {
  var url = BASE_URL + '/location/search/?query=' + city;
  let response = await invokeAPI(url);
  return (response && response.length > 0) ? response[0] : null;
}

async function getForecast(cityId, date) {
  var url = BASE_URL + '/location/' + cityId + '/';
  url += date.replace(/-/g, '/') + '/';
  let response = await invokeAPI(url);
  return (response && response.length > 0) ? makeReadable(response[0]) : null;
}

Forecast.prototype.getForecastForLocationAndDate = async function(city, date) {
  let cityInfo = await getCity(city);

  if (!date) {
    date = new Date().toISOString().substring(0, 10);
  }

  if (cityInfo) {
    return await getForecast(cityInfo.woeid, date);
  }

  return null;
};

module.exports = new Forecast();
