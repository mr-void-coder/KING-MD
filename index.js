const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const fs = require('fs');

// 1. Dummy web server for Render port check
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('KingBot MD is running'));
app.listen(PORT, () => console.log(`Port ${PORT} open`));

// 2. Telegram Bot setup
const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  console.error("BOT_TOKEN is missing. Add it in Render > Environment variables");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
console.log('KingBot MD is online!');

// 3. Commands

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

  const loadingMsg = await bot.sendMessage(chatId, `Searching for "${query}"... 🎵`);

  try {
    const res = await yts(query);
    const video = res.videos[0];
    if (!video) return bot.editMessageText('No results found', { chat_id: chatId, message_id: loadingMsg.message_id });

    await bot.editMessageText(`Downloading: *${video.title}*`, { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: 'Markdown' });

    const stream = ytdl(video.url, { filter: 'audioonly', quality: 'lowestaudio' });

    await bot.sendAudio(chatId, stream, {
      title: video.title,
      performer: video.author.name,
      caption: `*${video.title}*\nDuration: ${video.timestamp}`
    }, { parse_mode: 'Markdown' });

    bot.deleteMessage(chatId, loadingMsg.message_id);
  } catch (e) {
    bot.editMessageText('Error downloading audio. Try another song.', { chat_id: chatId, message_id: loadingMsg.message_id });
  }
});

//.id
bot.onText(/^\.id$/, (msg) => {
  bot.sendMessage(msg.chat.id, `Your Telegram ID: ${msg.from.id}`);
});

//.ping
bot.onText(/^\.ping$/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Pong! Bot is alive ✅');
});
