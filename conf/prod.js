module.exports.prod = {
    slack: {
        token: process.env.SLACK_TOKEN,
        bot: {
            icon_url: 'https://octodex.github.com/images/privateinvestocat.jpg',
            username: '闇の裁定者'
        },
        postChannel: 'test-private-channel' // FIXME
    },
    redis: {
        url: process.env.REDIS_URL
    }
};
