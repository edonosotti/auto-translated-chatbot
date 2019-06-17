const AWSSDK = require('aws-sdk');
const crypto = require('crypto');

var AWS = function () {};

function getUserId(request) {
  // Hashing the actual ID because Amazon Lex docs state that:
  // "The userID field must not contain any personally identifiable
  // information of the user, for example, name, personal
  // identification numbers, or other end user personal information."
  var userId = request.type + '-' + request.sender;
  return crypto.createHash('md5').update(userId).digest("hex");
}

AWS.prototype.invokeLex = async function (request) {
  const lexruntime = new AWSSDK.LexRuntime();

  var params = {
    botName: process.env.LEX_BOT_NAME,
    botAlias: process.env.LEX_BOT_ALIAS,
    inputText: request.text,
    userId: getUserId(request)
  };

  try {
    let response = await lexruntime.postText(params).promise();
    return { success: true, body: response };
  }
  catch (error) {
    console.error(error);
  }

  return { success: false, body: null };
}

AWS.prototype.invokeTranslate = async function (text, sourceLanguageCode, targetLanguageCode) {
  const translate = new AWSSDK.Translate();
  sourceLanguageCode = (sourceLanguageCode) ? sourceLanguageCode : 'auto';
  targetLanguageCode = (targetLanguageCode) ? targetLanguageCode : 'en';

  var params = {
    SourceLanguageCode: sourceLanguageCode,
    TargetLanguageCode: targetLanguageCode,
    Text: text
  };

  try {
    let response = await translate.translateText(params).promise();
    return { success: true, body: response };
  }
  catch (error) {
    console.error(error);
  }

  return { success: false, body: null };
}

module.exports = new AWS;
