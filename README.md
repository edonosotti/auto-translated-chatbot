# A multi-language chatbot with automated translation


## Description

This is a sample chatbot application using [`Amazon Lex`](https://aws.amazon.com/lex/)
and [`Amazon Translate`](https://aws.amazon.com/translate/) to automatically translate
incoming requests, process them and translate the responses back to their original language.

It is based on [`claudia-bot-builder`](https://github.com/claudiajs/claudia-bot-builder)
and it is compatible with many
[messaging platforms](https://github.com/claudiajs/claudia-bot-builder#supported-platforms),
such as `Facebook Messenger`, `Telegram`, `Skype`, `Slack` and also `Amazon Echo (Alexa)`.
`claudia-bot-builder` runs on [`Amazon Lambda`](https://aws.amazon.com/lambda/) and
[`Amazon API Gateway`](https://aws.amazon.com/api-gateway/).

### Caveats

This chatbot is meant to prototype a new service or product and run the first iterations
over it. Although it can scale virtually infinitely using the Amazon platform, for the long
run it is most probably better to switch to human-curated translations and save on the
requests issued to Lex and Translate, that are billed per-use.

At the time of writing all the Amazon services listed above offer limited (by time and/or
requests) free tiers that *SHOULD* allow users to test this chatbot for free. Please
check the latest terms & conditions of the Amazon Web Services platforms before deploying
and running this application to **avoid surprise charges**.

The training data (city names) provided to the chatbot for the `Location` slot is very
minimal and not enough for the machine learning to properly determine its nature, so
stick to the provided list of cities when testing the bot. Other cities might not work.


## Requirements

 * `Node.JS v10.x.x`


## Deployment

### `Claudia.JS` notes

This bot is built on `claudia-bot-builder` and uses `Claudia.JS`
for deployments on `AWS`. Since version 2 of the bot framework
was released, `Claudia.JS` was decoupled from the framework
and *MUST* be installed separately. `Claudia.JS` can be either
installed as a *global* package or a *local* dependency.
In order to make the distribution of this package easier for
users and for it to coexist with other versions of `Claudia.JS`,
it has been included as a *local* dependency.

### First deployment

#### 1. Creating the Lex bot

Zip the [`aws/lex/WeatherBot_Export.json`] file and import it
using the `Lex` console:

 1. Sign in to the AWS Management Console and open the [Amazon Lex console, Bots page](https://console.aws.amazon.com/lex/home?#bots:).
 2. From `Actions`, choose `Import`.
 3. From `Import Bot`, choose the `.zip` archive that contains the `JSON` file that contains the bot to import.
 4. Press `Import`.
 5. Press `Build` to build the bot.
 6. Press `Publish` and name the deployment: `Development`.

#### 2. Deploying the backend

Install the required dependencies first:

```
$ npm install
```

Run the following command, replacing `{AWS_REGION}` with your
AWS region of choice:

```
$ ./node_modules/.bin/claudia create \
    --region {AWS_REGION} \
    --api-module bot \
    --version development \
    --policies aws/iam/policies.json \
    --set-env-from-json aws/lambda/env.json
```

If you have multiple AWS profiles configured on your machine,
specify the profile

```
$ AWS_PROFILE={PROFILE_NAME} \
  ./node_modules/.bin/claudia create \
    --region {AWS_REGION} \
    --api-module bot \
    --version development \
    --policies aws/iam/policies.json \
    --set-env-from-json aws/lambda/env.json
```

#### 3. Connecting the bot to a messaging platform

For detailed information on connecting a bot to a messaing
platform, please see the
[`claudia-bot-builder` Hello World Chat Bot doc](https://claudiajs.com/tutorials/hello-world-chatbot.html).

##### Telegram

To get started quickly and test a bot, [`Telegram`](https://telegram.org)
is a very good place to start from. Creating and configuring a bot takes
only [a few steps](https://core.telegram.org/bots#3-how-do-i-create-a-bot).

 1. [Create a bot on Telegram](doc/telegram.md)
 2. Deploy the chatbot as described in **First deployment** above
 3. Run
    ```
    $ ./node_modules/.bin/claudia --configure-telegram-bot
    ```
    and follow the instructions shown on the screen.


## Tests

Run:

```
$ npm install
$ npm test
```

## License

This code is released under the [`MIT license`](LICENSE).
Please read it carefully before using it.

![Screenshot on Telegram](doc/img/telegram.png)
