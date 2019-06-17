const botBuilder = require('claudia-bot-builder');
const Mustache = require('mustache');

const aws = require( './bot/aws');
const forecast = require('./bot/forecast');
const lang = require('./locale/en.json');

function debugOut() {
  if (process.env.DEBUG && parseInt(process.env.DEBUG) == 1) {
    for (let argument of arguments) {
      console.log(argument);
    }
  }
}

function isValidTranslation(translation) {
  return (
    translation.success &&
    translation.body.TranslatedText &&
    translation.body.TranslatedText != '' &&
    translation.body.TargetLanguageCode &&
    translation.body.TargetLanguageCode == 'en'
  );
}

async function processGetWeatherForecastIntent(intent) {
  if (!intent.body.slots.Location) {
    return lang.MISSING_LOCATION;
  }

  let forecastInfo = await forecast.getForecastForLocationAndDate(
    intent.body.slots.Location,
    intent.body.slots.Date
  );
  debugOut(forecastInfo);
  return Mustache.render(lang.FORECAST, forecastInfo);
}

function processIntent(intent) {
  if (intent.body.intentName == 'GetWeatherForecast') {
    return processGetWeatherForecastIntent(intent);
  }

  return lang.DID_NOT_UNDERSTAND;
}

async function translateInput(request) {
  // Trying to decode the input message
  var intent = await aws.invokeLex(request);
  var targetLanguageCode = null;
  debugOut(intent);

  if (intent.success && !intent.body.intentName) {
    // If no intent is decoded, try to identify language and translate
    var translation = await aws.invokeTranslate(request.text);
    debugOut(translation);

    if (isValidTranslation(translation)) {
      request.text = translation.body.TranslatedText;
      targetLanguageCode = translation.body.SourceLanguageCode;
      intent = await aws.invokeLex(request);
      debugOut(intent);
    }
  }

  return {
    intent: intent,
    targetLanguageCode: targetLanguageCode
  }
}

async function translateOutput(input, response) {
  // In case the input message was translated,
  // translate back to the original language
  if (input.targetLanguageCode) {
      translatedResponse = await aws.invokeTranslate(response, 'en', input.targetLanguageCode);
      debugOut(translatedResponse);
      if (translatedResponse.success) {
        response = translatedResponse.body.TranslatedText;
      }
    }
    return response;
}

async function processRequest(request) {
  let input = await translateInput(request);

  if (input.intent.success) {
    let response = await processIntent(input.intent);
    return await translateOutput(input, response);
  }

  return lang.GENERIC_ERROR;
}

module.exports = botBuilder(function (request) {
  debugOut(request);
  return processRequest(request);
});
