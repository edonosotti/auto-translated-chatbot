const assert = require('assert');
const rewire = require('rewire');
const nock = require('nock');

const forecast = rewire('../../bot/forecast');

const BASE_URL = forecast.__get__("BASE_URL");

console.error = function() {};

var city = 'Milan';
var specifiedDate = '2019-05-30';
var today = new Date().toISOString().substring(0, 10);

var todayParts = today.split('-');

var citySearchResult = [
    {
      title: "Milan",
      location_type: "City",
      woeid: 1,
      latt_long: "45.468941,9.181030"
    }
  ];

var specifiedDateForecastResult = [
    {
      id: 5,
      weather_state_name: "Clear",
      weather_state_abbr: "c",
      wind_direction_compass: "WNW",
      created: specifiedDate + "T00:00:00.000000Z",
      applicable_date: specifiedDate,
      min_temp: 11,
      max_temp: 19,
      the_temp: null,
      wind_speed: 16,
      wind_direction: 301,
      air_pressure: null,
      humidity: null,
      visibility: null,
      predictability: 68
    }
  ];

var todayForecastResult = [
    {
      id: 5,
      weather_state_name: "Clear",
      weather_state_abbr: "c",
      wind_direction_compass: "WNW",
      created: today + "T00:00:00.000000Z",
      applicable_date: today,
      min_temp: 11,
      max_temp: 19,
      the_temp: null,
      wind_speed: 16,
      wind_direction: 301,
      air_pressure: null,
      humidity: null,
      visibility: null,
      predictability: 68
    }
  ];

describe('bot', function() {
  describe('forecast', function() {
    describe('#getForecastForLocationAndDate()', function() {
      it('should return a valid forecast for a specified date if correct input is given', function(done) {
        nock(BASE_URL).get('/location/search/?query=' + citySearchResult[0].title).reply(200, citySearchResult);
        nock(BASE_URL).get('/location/' + citySearchResult[0].woeid + '/' + specifiedDate.replace(/-/g, '/') + '/').reply(200, specifiedDateForecastResult);
        var response = forecast.getForecastForLocationAndDate(city, specifiedDate);
        response
          .then(result => {
            assert.equal(result.created, specifiedDateForecastResult[0].created);
            assert.equal(result.applicable_date, specifiedDateForecastResult[0].applicable_date);
            done();
          })
          .catch(error => console.log(error));
      });
      it('should return a valid forecast for today if city is given in input', function(done) {
        nock(BASE_URL).get('/location/search/?query=' + citySearchResult[0].title).reply(200, citySearchResult);
        nock(BASE_URL).get('/location/' + citySearchResult[0].woeid + '/' + todayParts[0] + '/' + todayParts[1] + '/' + todayParts[2] + '/').reply(200, todayForecastResult);
        var response = forecast.getForecastForLocationAndDate(city);
        response
          .then(result => {
            assert.equal(result.created, todayForecastResult[0].created);
            assert.equal(result.applicable_date, todayForecastResult[0].applicable_date);
            done();
          })
          .catch(error => console.log(error));
      });
      it('should return a null result if wrong input is given', function(done) {
        nock(BASE_URL).get('/location/search/?query=1').reply(200, []);
        var response = forecast.getForecastForLocationAndDate("1");
        response
          .then(result => {
            assert.equal(result, null);
            done();
          })
          .catch(error => console.log(error));
      });
    });
  });
});
