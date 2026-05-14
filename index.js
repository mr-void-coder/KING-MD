const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const fs = require('fs');

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error("BOT_TOKEN is missing");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
console.log('KingBot MD is online!');

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Hey ${msg.from.first_name} 👑\nI'm KingBot MD. Type.menu to see commands.`);
});

//.menu
bot.onText(/^\.menu$/, (msg) => {
  const menu = `
*KingBot MD Commands* 👑
.menu - Show this menu
.sticker - Reply to a photo with.sticker
.play <song name> - Download music
.id - Get your Telegram ID
.ping - Check if bot is alive
  `;
  bot.sendMessage(msg.chat.id, menu, { parse_mode: 'Markdown' });
});

//.sticker - reply to a photo with.sticker
bot.on('message', async (msg) => {
  if (!msg.text ||!msg.text.startsWith('.sticker')) return;

  if (!msg.reply_to_message ||!msg.reply_to_message.photo) {
    return bot.sendMessage(msg.chat.id, 'Reply to a photo with.sticker');
  }

  const photo = msg.reply_to_message.photo[msg.reply_to_message.photo.length - 1];
  const fileId = photo.file_id;

  try {
    await bot.sendSticker(msg.chat.id, fileId);
  } catch (e) {
    bot.sendMessage(msg.chat.id, 'Failed to create sticker');
  }
});

//.play <song name>
bot.onText(/^\.play (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  bot.sendMessage(chatId, `Searching for "${query}"... 🎵`);

  try {
    const res = await yts(query);
    const video = res.videos[0];
    if (!video) return bot.sendMessage(chatId, 'No results found');

    const stream = ytdl(video.url, { filter: 'audioonly', quality: 'lowestaudio' });

    await bot.sendAudio(chatId, stream, {
      title: video.title,
      performer: video.author.name,
      caption: `*${video.title}*\nDuration: ${video.timestamp}`
    }, { parse_mode: 'Markdown' });

  } catch (e) {
    bot.sendMessage(chatId, 'Error downloading audio. Try another song.');
  }
});

// /id
bot.onText(/^\.id$/, (msg) => {
  bot.sendMessage(msg.chat.id, `Your Telegram ID: ${msg.from.id}`);
});

// /ping
bot.onText(/^\.ping$/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Pong! Bot is alive ✅');
});
