module.exports.prod = {
    slack: {
        token: process.env.SLACK_TOKEN,
        bot: {
            icon_url: 'https://octodex.github.com/images/privateinvestocat.jpg',
            username: '闇の裁定者'
        },
        alertChannel: 'alert-bot',
        postChannel: 'random'
    },
    redis: {
        url: process.env.REDIS_URL
    }
};
