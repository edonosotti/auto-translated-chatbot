const assert = require('assert');
const crypto = require('crypto');

const AWSSDK = require('aws-sdk-mock');
const AWS = require('../../bot/aws');

process.env.LEX_BOT_NAME = 'test';
process.env.LEX_BOT_ALIAS = 'test';

console.error = function() {};

var request = {
  text: 'How is the weather in Milan?',
  type: 'test',
  sender: 1
}

var validIntentAllSlotsFilled = {
  intentName: 'GetWeatherForecast',
  slots: {
    Location: 'Milan',
    Date: '2019-05-30'
  }
}

var validIntentLocationFilled = {
  intentName: 'GetWeatherForecast',
  slots: {
    Location: 'Milan',
    Date: null
  }
}

var validIntentDateFilled = {
  intentName: 'GetWeatherForecast',
  slots: {
    Location: null,
    Date: 'Milan'
  }
}

var nullIntent = {
  intentName: null,
  slots: {
    Location: null,
    Date: null
  }
}

var translatedTextITEN = {
   SourceLanguageCode: "it",
   TargetLanguageCode: "en",
   TranslatedText: "This is a translated text"
};

var translatedTextENIT = {
   SourceLanguageCode: "it",
   TargetLanguageCode: "en",
   TranslatedText: "Questo è un testo tradotto"
};

describe('bot', function() {
  describe('aws', function() {
    describe('#invokeLex()', function() {
      it('should return a decoded intent with Location and Date slots filled when correct input is given', function(done) {
        AWSSDK.mock('LexRuntime', 'postText', validIntentAllSlotsFilled);
        var lex = AWS.invokeLex(request);
        lex
          .then(result => {
            assert.equal(result.success, true);
            assert.equal(result.body.intentName, validIntentAllSlotsFilled.intentName);
            assert.equal(result.body.slots.Location, validIntentAllSlotsFilled.slots.Location);
            assert.equal(result.body.slots.Date, validIntentAllSlotsFilled.slots.Date);
            done();
          })
          .catch(error => done(error));
      });
      it('should return a decoded intent with only Location slot filled when only the location parameter is given in the input', function(done) {
        AWSSDK.restore('LexRuntime');
        AWSSDK.mock('LexRuntime', 'postText', validIntentLocationFilled);
        var lex = AWS.invokeLex(request);
        lex
          .then(result => {
            assert.equal(result.success, true);
            assert.equal(result.body.intentName, validIntentLocationFilled.intentName);
            assert.equal(result.body.slots.Location, validIntentLocationFilled.slots.Location);
            assert.equal(result.body.slots.Date, validIntentLocationFilled.slots.Date);
            done();
          })
          .catch(error => done(error));
      });
      it('should return a decoded intent with only Date slot filled when only the date parameter is given in the input', function(done) {
        AWSSDK.restore('LexRuntime');
        AWSSDK.mock('LexRuntime', 'postText', validIntentDateFilled);
        var lex = AWS.invokeLex(request);
        lex
          .then(result => {
            assert.equal(result.success, true);
            assert.equal(result.body.intentName, validIntentDateFilled.intentName);
            assert.equal(result.body.slots.Location, validIntentDateFilled.slots.Location);
            assert.equal(result.body.slots.Date, validIntentDateFilled.slots.Date);
            done();
          })
          .catch(error => done(error));
      });
      it('should return a null intent when incorrect input is given', function(done) {
        AWSSDK.restore('LexRuntime');
        AWSSDK.mock('LexRuntime', 'postText', nullIntent);
        var lex = AWS.invokeLex(request);
        lex
          .then(result => {
            assert.equal(result.success, true);
            assert.equal(result.body.intentName, nullIntent.intentName);
            done();
          })
          .catch(error => done(error));
      });
      it('should return en error if wrong parameters are supplied', function(done) {
        AWSSDK.restore('LexRuntime');
        AWSSDK.mock('LexRuntime', 'postText', nullIntent);
        var lex = AWS.invokeLex({});
        lex
          .then(result => {
            assert.equal(result.success, false);
            done();
          })
          .catch(error => done(error));
      });
    });

    describe('#invokeTranslate()', function() {
      it('should return a text translated to English if no source language is supplied', function(done) {
        AWSSDK.mock('Translate', 'translateText', translatedTextITEN);
        var translator = AWS.invokeTranslate(translatedTextENIT.TranslatedText);
        translator
          .then(result => {
            assert.equal(result.success, true);
            assert.equal(result.body.TranslatedText, translatedTextITEN.TranslatedText);
            done();
          })
          .catch(error => done(error));
      });
      it('should return a text translated to Italian if source and destination languages are supplied', function(done) {
        AWSSDK.restore('Translate');
        AWSSDK.mock('Translate', 'translateText', translatedTextENIT);
        var translator = AWS.invokeTranslate(translatedTextITEN.TranslatedText, 'en', 'it');
        translator
          .then(result => {
            assert.equal(result.success, true);
            assert.equal(result.body.TranslatedText, translatedTextENIT.TranslatedText);
            done();
          })
          .catch(error => done(error));
      });
      it('should return an error if wrong parameters are supplied', function(done) {
        AWSSDK.restore('Translate');
        AWSSDK.mock('Translate', 'translateText', translatedTextENIT);
        var translator = AWS.invokeTranslate(null);
        translator
          .then(result => {
            assert.equal(result.success, false);
            done();
          })
          .catch(error => done(error));
      });
    });
  })
});
