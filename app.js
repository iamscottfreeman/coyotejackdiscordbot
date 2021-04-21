require('dotenv').config();

const Discord = require('discord.js');
const fetch = require('node-fetch');
const cron = require('cron');
const client = new Discord.Client();
const CHANNEL_ID = process.env.CHANNEL_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

let hasTodayDailies = false;
const message = (message) => client.channels.cache.get(CHANNEL_ID).send(message);
const padStart = (string) => string.toString().padStart(2, '0');
const resetDailies = () => (hasTodayDailies = false);

const getDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${padStart(date.getMonth() + 1)}-${padStart(date.getDate())}`;
};

const getTodaysChallenges = (options = {}) => {
  if (hasTodayDailies && !options.force) return;
  const date = getDate();
  const url = `https://www.coyotejack.net/daily-challenges/${date}/`;
  fetch(url).then((response) => {
    if (response.ok) {
      message(url);
      hasTodayDailies = true;
    } else {
      if (options.force) message('No dailies guide for today yet.');
    }
  });
};

const checkForDailiesJob = new cron.CronJob('0 0 * * * *', getTodaysChallenges);
const resetDailiesJob = new cron.CronJob('0 0 0 * * *', resetDailies);

client.login(BOT_TOKEN);

client.on('ready', () => {
  checkForDailiesJob.start();
  resetDailiesJob.start();
});

client.on('message', (msg) => {
  if (msg.content === '!dailies') {
    getTodaysChallenges({ force: true });
  }
});
