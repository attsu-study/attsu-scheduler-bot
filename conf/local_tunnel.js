const LocalTunnel = require('localtunnel');

/**
 * ローカル環境（10443ポート）を公開する
 * https://{YOUR SUBDOMAIN}.localtunnel.me
 */
const tunnel = LocalTunnel(process.env.PORT || 3000, {
    subdomain: 'hogehoge'
}, (err, tunnel) => {
    if (err) {
        throw new Error('ERROR: ' + err);
    }

    console.info('URL is ' + tunnel.url);
});

exports.tunnel = tunnel;
