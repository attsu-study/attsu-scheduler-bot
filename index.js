const BotKit = require('botkit');
const moment = require('moment-timezone');
const cron = require('cron');
const config = require('./conf/config');

const env = process.env.ENV || 'dev';
if (env === 'dev') require('./conf/local_tunnel');

moment.tz.setDefault('Asia/Tokyo');

const appConfig = config.get();

// connect to REDIS
const redisStorage = require('botkit-storage-redis')(appConfig.redis);
const controller = BotKit.slackbot({
    debug: false,
    storage: redisStorage
}).configureSlackApp({
    clientId: process.env.BOTKIT_SLACK_CLIENT_ID,
    clientSecret: process.env.BOTKIT_SLACK_CLIENT_SECRET,
    scopes: ['commands', 'incoming-webhook', 'bot']
});

// set up a botkit app to expose oauth and webhook endpoints
controller.setupWebserver(process.env.PORT || 3000, (err, webserver) => {

    // set up web endpoints for oauth, receiving webhooks, etc.
    controller
        .createHomepageEndpoint(controller.webserver)
        .createOauthEndpoints(controller.webserver, function (err, req, res) {
            if (err) {
                res.status(500).send('Error: ' + JSON.stringify(err));
            } else {
                res.send('Success');
            }
        })
        .createWebhookEndpoints(controller.webserver);

});

controller.spawn({
    token: appConfig.slack.token
}).startRTM((err, bot, payload) => {
    if (err) {
        throw new Error(err);
    }

    new cron.CronJob({
        cronTime: process.env.CRON,
        onTick: () => {
            console.log('started job');
            console.log(`Now: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
            postChannel(appConfig.slack.postChannel, '今週は勉強会です', bot.say);
        },
        start: true,
        timeZone: 'Asia/Tokyo'
    });
});

const postChannel = (channel, text, callback) => {
    controller.storage.channels.get('next', (err, channelData) => {

        if (err) {
            console.log(`Cannot get storage: ${err}`);
            return
        }

        if (env === 'dev') {
            text = '<!channel> 今週は勉強会です（テスト）';
            callback({
                channel,
                text,
                ...appConfig.slack.bot
            });
            return
        }

        // @see https://api.slack.com/docs/message-formatting
        if (moment().format('YYYY-MM-DD') === moment(channelData.eventDate).subtract(5, 'days').format('YYYY-MM-DD')) {
            // 開催日5日前になったら通知する(@channel)
            text = '<!channel> 今週は勉強会です';
            callback({
                channel,
                text,
                ...appConfig.slack.bot
            });
        }

        if (moment().format('YYYY-MM-DD') === moment(channelData.eventDate).subtract(1, 'days').format('YYYY-MM-DD') ) {
            // 開催日の前日になったら通知する(@channel)
            text = '<!channel> 明日は勉強会です';
            callback({
                channel,
                text,
                ...appConfig.slack.bot
            });
        }
    });
};

controller.hears(['when'], ['direct_mention', 'mention'], (bot, msg) => {

    controller.storage.teams.get('next', (err, channelData) => {

        if (err) {
            bot.reply(msg, {
                ...appConfig.slack.bot,
                ...{text: `次回の日程がまだ設定されていません`}
            });
            return
        }

        bot.reply(msg, {
            ...appConfig.slack.bot,
            ...{text: `次回は${moment(channelData.eventDate).format('YYYY年MM月DD日')}に設定されています`}
        });
    });

});

controller.hears(['next'], ['direct_mention', 'mention'], (bot, msg) => {

    // チームIDを保持するために登録する
    // チームIDを保存しておかないと「error: Could not load team while processing webhook:  Error: could not find team {チーム名}」というエラーになる
    controller.storage.teams.save({
        id: msg.team,
        // [TypeError: Cannot read property 'user_id' of undefined]というエラーになるためbot情報も登録する
        bot: {
            user_id: bot.identity.id,
            name: bot.identity.name
        }
    }, (err, id) => {
        if (err) {
            throw new Error('ERROR: ' + err);
        }
    });

    bot.reply(msg, {
        ...appConfig.slack.bot,
        ...{
            text: 'こんにちは！',
            callback_id: 'next_schedule',
            blocks: [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Hi there!*\n次回勉強会の設定をします。\n次の開催日を選択してください。"
                    },
                    "accessory": {
                        "type": "datepicker",
                        "initial_date": moment().format('YYYY-MM-DD'),
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a date",
                            "emoji": true
                        }
                    }
                }
            ]
        }
    });
});

controller.on('block_actions', (bot, msg) => {
    console.log(JSON.stringify(msg));

    const datePicker = msg.actions[0];
    console.log(datePicker);
    const selectedDate = datePicker.selected_date;
    const formattedDate = moment(selectedDate).format('YYYY年MM月DD日');

    controller.storage.teams.get('next', (err, channelData) => {
        console.log(channelData);
        if (err) {
            // まだ設定されていない場合
            controller.storage.teams.save({id: 'next', eventDate: selectedDate}, err => {

                if (err) {
                    bot.replyInteractive(msg, {
                        text: '設定中にエラーが発生しました'
                    });
                    return
                }
                bot.replyInteractive(msg, {
                    text: `設定しました！次回は${formattedDate}です`
                }, err => {
                    if (err) {
                        console.error('ERROR: ' + err);
                    }
                });
            });
        } else {
            // すでに設定済み
            if (selectedDate === channelData.eventDate) {
                bot.replyInteractive(msg, {
                    text: '既にその日は設定済みです！'
                });
            } else {

                // 上書きされるっぽい
                controller.storage.teams.save({id: 'next', eventDate: selectedDate}, err => {

                    if (err) {
                        bot.replyInteractive(msg, {
                            text: '設定中にエラーが発生しました'
                        });
                        return
                    }
                    bot.replyInteractive(msg, {
                        text: `設定しました！次回は${formattedDate}です`
                    }, err => {
                        if (err) {
                            console.error('ERROR: ' + err);
                        }
                    });
                });

            }
        }

    });

});
