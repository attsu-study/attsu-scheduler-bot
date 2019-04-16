# scheduler-bot on Heroku

dyno + Heroku redisで動かしている

dynoが30分で寝てしまうため[10分ごとに起こしている](https://uptimerobot.com/dashboard.php#782134061)

ローカルで動かす場合
```sh
$ redis-server
$ BOTKIT_SLACK_CLIENT_ID={client_id} BOTKIT_SLACK_CLIENT_SECRET={client_secret} SLACK_TOKEN={slack_token} node index.js
```

```sh
# heroku上の環境変数の確認
$ heroku config -a attsu-study-bot

# 環境変数の設定
$ heroku config:add ENV=prod -a attsu-scheduler-bot

# deploy
$ git push heroku master

# logのtail
$ heroku logs --tail -a attsu-scheduler-bot
```
