import express from "express";
import "dotenv/config";
import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

// Load keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Validate keys
if (!OPENAI_API_KEY || !TELEGRAM_BOT_TOKEN) {
  console.error("❌ ERROR: API keys missing in .env file!");
  process.exit(1);
}

// Init OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Init Express App
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("ChatGPT Telegram Bot + Express is running!");
});

// Init Telegram Bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

async function askChatGPT(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // Fast & cheap
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("ChatGPT Error:", error);
    return "⚠ ChatGPT API error — please try again!";
  }
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim() || "";

  if (!text) {
    return bot.sendMessage(chatId, "Please send a valid message.");
  }

  bot.sendChatAction(chatId, "typing");

  const reply = await askChatGPT(text);

  bot.sendMessage(chatId, reply);
});

// Start express server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
  console.log("🤖 Telegram Bot is running...");
});