const { Telegraf } = require("telegraf");
const Puppeteer = require("puppeteer");
const cron = require("cron");
const getUserPosts = require("./services");
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
// const fetchTwitterAva = async (twitterUsername) => {
//   const browser = await Puppeteer.launch({
//     executablePath: "/usr/bin/chromium-browser",
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     // headless: false,
//   });
//   const page = await browser.newPage();
//   await page.setDefaultNavigationTimeout(60000);
//   await page.goto(`https://twitter.com/${twitterUsername}`);
//   await page.waitForSelector('a[href$="/photo"] img[src]', { timeout: 0 });
//   const url = await page.evaluate(
//     () => document.querySelector('a[href$="/photo"] img').src
//   );
//   await browser.close();
//   return url;
// };

// const fetchTwitterAva = async (twitterUsername) => {
//   const response = await fetch(
//     `https://api.twitter.com/2/users/by?user.fields=profile_image_url&usernames=${twitterUsername}`
//   );
//   const json = await response.json();
//   return url;
// };

const getUpdates = async () => {
  try {
    let currentDataCount;
    const data = await getUserPosts(process.env.IG_USER);
    console.log("initial data ", data);

    // total data
    currentDataCount = data.data.data.user.edge_owner_to_timeline_media.count;
    console.log("current count ", currentDataCount);

    const checkingNewData = new cron.CronJob("0 * * * *", async function () {
      // This function will be executed every hour
      console.log(
        "Running the job at " +
          new Date().toLocaleString("en-US", {
            timeZone: "Asia/Bangkok",
          })
      );

      const checkIfUpdates = await getUserPosts(process.env.IG_USER);
      console.log("comparation data ", checkIfUpdates);
      if (
        currentDataCount ===
        checkIfUpdates.data.data.user.edge_owner_to_timeline_media.count
      ) {
        console.log(
          "still same",
          checkIfUpdates.data.data.user.edge_owner_to_timeline_media.count
        );
        console.log("Data not changed");
        bot.telegram.sendMessage(
          process.env.TELEGRAM_USER,
          "belum ada update",
          {}
        );
      } else {
        currentDataCount =
          checkIfUpdates.data.data.user.edge_owner_to_timeline_media.count;
        console.log(
          "new data ",
          checkIfUpdates.data.data.user.edge_owner_to_timeline_media.count
        );
        const filteredArray =
          checkIfUpdates.data.data.user.edge_owner_to_timeline_media.edges.filter(
            (object) =>
              object.node.edge_media_to_caption.edges[0].node.text.includes(
                "laptop"
              )
          );

        filteredArray.forEach(async (item) => {
          bot.telegram.sendMessage(
            process.env.TELEGRAM_USER,
            `https://www.instagram.com/p/${item.shortcode}`,
            {}
          );
        });
      }
    });
    checkingNewData.start();
  } catch (error) {
    console.log("ERROR ", error);
    if (error.response) {
      bot.telegram.sendMessage(
        process.env.TELEGRAM_USER,
        `Gagal hit API ${error.response.status}`,
        {}
      );
    }

    bot.telegram.sendMessage(process.env.TELEGRAM_USER, "Botnya ada error", {});
    process.exit();
  }
};

getUpdates();
bot.launch();
