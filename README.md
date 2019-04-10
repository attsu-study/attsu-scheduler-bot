## scheduler-bot

ローカルで動かす場合
```sh
BOTKIT_SLACK_CLIENT_ID={client_id} BOTKIT_SLACK_CLIENT_SECRET={client_secret} SLACK_TOKEN={slack_token} PORT=3000 CRON='*/1 * * * *' node index.js
```

```sh
# heroku上の環境変数の確認
heroku config -a attsu-study-bot

# 環境変数の設定
heroku config:add ENV=prod -a attsu-study-bot

# deploy
git push heroku master

# logのtail
heroku logs --tail -a attsu-study-bot
```
