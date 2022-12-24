const { Telegraf } = require("telegraf");
const Puppeteer = require("puppeteer");
const cron = require("cron");
require("dotenv").config();

const bot = new Telegraf(process.env.TELEGRAM_SECRET);

// bot.on("text", (ctx) => {
//   //   console.log("ON text : ", ctx);
//   //   console.log("specific word :", ctx.message.text);
//   if (
//     ctx.message.text.toLowerCase().includes("freelance") ||
//     ctx.message.text.toLowerCase().includes("junior")
//   ) {
//     bot.telegram.sendMessage("794527193d", "Ada opportunity baru nih: ", {});
//     bot.telegram.forwardMessage(
//       "794527193d",
//       ctx.message.chat.id,
//       ctx.message.message_id
//     );
//   } else {
//     return null;
//   }
// });
const fetchTwitterAva = async (twitterUsername) => {
  const browser = await Puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(300000);
  await page.goto(`https://twitter.com/${twitterUsername}`);
  await page.waitForSelector('a[href$="/photo"] img[src]');
  const url = await page.evaluate(
    () => document.querySelector('a[href$="/photo"] img').src
  );
  await browser.close();
  return url;
};

const getUpdates = async () => {
  try {
    let currentImage;
    const displayPicture = await fetchTwitterAva(process.env.TWITTER_USERNAME);
    currentImage = displayPicture;
    console.log("current image ", currentImage);

    const checkingProfilePhoto = new cron.CronJob(
      "*/30 * * * * *",
      async function () {
        // This function will be executed every hour
        console.log("Running the job at " + new Date());

        const checkIfUpdates = await fetchTwitterAva(
          process.env.TWITTER_USERNAME
        );
        if (currentImage === checkIfUpdates) {
          console.log("Data not changed");
          bot.telegram.sendMessage(
            process.env.TELEGRAM_USER,
            "belum ada update",
            {}
          );
        } else {
          currentImage = checkIfUpdates;
          console.log("new data ", checkIfUpdates);
          bot.telegram.sendPhoto(
            process.env.TELEGRAM_USER,
            checkIfUpdates.replace("200x200", "400x400")
          );
        }
      }
    );
    checkingProfilePhoto.start();
  } catch (error) {
    console.log("ERROR ", error);
  }
};

getUpdates();
bot.launch();
