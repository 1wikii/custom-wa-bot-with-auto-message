const { Client, LocalAuth } = require("whatsapp-web.js");
const axios = require("axios");
const qrcode = require("qrcode-terminal");
const cron = require("node-cron");

require("dotenv").config();

const client = new Client();

//   const gfNumber = process.env.targetNumber;

const gfNumber = process.env.testingTargetNumber;

const messages = [
  "Pagii sayang, semangat buat hari iniii",
  "Selamat pagi babyy, semangatt sayangg",
  "Semangatt sayang buat hari iniii",
];
const randMsg = messages[Math.floor(Math.random() * 3)];

client.on("qr", (qr) => {
  //   qrcode.generate(qr, { small: true });

  const qrimg = require("qrcode");

  qrimg.toFile("qr.png", qr, () => {});
});

client.on("ready", () => {
  console.log("✅ Asistant pcr siap!");

  cron.schedule(
    "10 6 * * *",
    async () => {
      await client.sendMessage(gfNumber, randMsg);
    },
    {
      timezone: "Asia/Jakarta",
    }
  );
});

client.on("message_create", async (msg) => {
  if (msg.fromMe) return;

  if (msg.from !== gfNumber) return;

  const gfPrompt = msg.body;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Kamu adalah seorang pacar yang romantis, pacarmu bernama devi dia wanita cantik paripurna. Selalu panggil dia dengan sayang atau baby.",
          },
          { role: "user", content: gfPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.api_key}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    await msg.reply(reply);
  } catch (error) {
    console.error("❌ Error saat menghubungi GPT-3.5:", error.message);
    await msg.reply("Maaf, saya sedang tidak bisa menjawab. Coba lagi nanti.");
  }
});

client.initialize();
