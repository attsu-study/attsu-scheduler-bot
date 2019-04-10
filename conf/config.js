module.exports.get = () => {
    const env = process.env.ENV || 'dev';
    const config = require(`./${env}`);

    switch (env) {
        case 'dev':
            return config.dev;
        case 'prod':
            return config.prod;
        default:
            return {};
    }
};
