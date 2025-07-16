const { Client, LocalAuth } = require("whatsapp-web.js");
const axios = require("axios");
const qrcode = require("qrcode-terminal");
require("dotenv").config();

const client = new Client();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Asistant pcr siap!");
});

client.on("message_create", async (msg) => {
  if (msg.fromMe) return;

  //   const gfNumber = process.env.targetNumber;

  const gfNumber = process.env.testingTargetNumber;
  //   console.log(msg.from, ": ");
  //   console.log(msg.body);

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
