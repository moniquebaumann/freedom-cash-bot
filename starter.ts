import { TelegramBot, UpdateType } from "https://deno.land/x/telegram_chatbot@v1.1.0/mod.ts"
import "https://deno.land/x/dot_env@0.2.0/load.ts"

const TOKEN = Deno.env.get("TOKEN");
const chatIDSatoshisFriends = Deno.env.get("ChatIDSatoshisFriends");
if (!TOKEN) throw new Error("Bot token is not provided");
const bot = new TelegramBot(TOKEN);

bot.on(UpdateType.Message, async (message: any) => {

    console.log(message)
    const text = message.message.text || "I can't hear you";

    await bot.sendMessage({ chat_id: message.message.chat.id, text: `Thank You. Satoshi's friends might consider co-funding your freedom. You sent: ${text}. Due to a surprisingly high number of messages (often more than 100 per hour), we do no longer read every message. We wish you freedom.` })
    await bot.sendMessage({ chat_id: chatIDSatoshisFriends, text: `someone found a Freedom Cash wallet and wrote: ${text}` })
});

bot.on("/start", async (message: any) => {    
    console.log(message)
    await bot.sendMessage({ chat_id: message.message.chat.id, text: `🙋🏼‍♂️` })
});

bot.run({
    polling: true,
});

console.log("bot started")