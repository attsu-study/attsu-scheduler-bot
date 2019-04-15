module.exports.dev = {
    slack: {
        token: process.env.SLACK_TOKEN,
        bot: {
            icon_url: 'https://octodex.github.com/images/daftpunktocat-thomas.gif',
            username: '闇の裁定者（dev）'
        },
        alertChannel: 'alert-bot',
        postChannel: 'test-private-channel'
    },
    redis: {}
};
