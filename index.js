const TelegramBot = require('node-telegram-bot-api');

// Get token from Render environment variables, not hardcoded
const TOKEN = process.env.BOT_TOKEN;

if (!TOKEN) {
  console.error("BOT_TOKEN is missing. Add it in Render > Environment variables");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

console.log('KingBot MD is online!');

// /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `Hey ${msg.from.first_name} 👑\nI'm KingBot MD. Type /menu to see commands.`);
});

// /menu command  
bot.onText(/\/menu/, (msg) => {
  const menu = `
*KingBot MD Commands* 👑
/start - Start the bot
/menu - Show this menu
/id - Get your Telegram ID
/ping - Check if bot is alive
.sticker - Reply to a photo with .sticker
.play <song name> - Download music
  `;
  bot.sendMessage(msg.chat.id, menu, { parse_mode: 'Markdown' });
});

// /ping command
bot.onText(/\/ping/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Pong! Bot is alive ✅');
});

// /id command
bot.onText(/\/id/, (msg) => {
  bot.sendMessage(msg.chat.id, `Your Telegram ID: ${msg.from.id}`);
});
