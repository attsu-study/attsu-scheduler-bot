module.exports.dev = {
    slack: {
        token: process.env.SLACK_TOKEN,
        bot: {
            icon_url: 'https://octodex.github.com/images/original.png',
            username: 'スケジューリングするタコ猫'
        },
        postChannel: 'test-private-channel'
    },
    redis: {}
};
