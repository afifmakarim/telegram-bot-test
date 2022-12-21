module.exports = {
  apps: [
    {
      name: "Telegram BOT",
      script: "index.js", // your script
      args: "start",
      env: {
        TELEGRAM_SECRET: "5929242420:AAGX6NWxqON8Qgh7IfvmSaFuaSpAeKpBieM",
        TWITTER_USERNAME: "brainlessprg",
        TELEGRAM_USER: "794527193d",
      },
    },
  ],
};
