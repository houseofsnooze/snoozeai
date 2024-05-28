import { Bot, Context, session } from "https://deno.land/x/grammy@v1.23.0/mod.ts";
import { run, sequentialize } from "https://deno.land/x/grammy_runner@v2.0.3/mod.ts";

import { sendToAgent } from "./helpers";

const bot = new Bot(process.env.TELEGRAM_BOT_KEY);

// Build a unique identifier for the `Context` object.
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}

// Sequentialize before accessing session data!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

bot.command("start", (ctx: any) => ctx.reply("Howdy 👋! Let's get your Solidity contracts written so you can get back to sleep. How should the contracts work?"));

// Reply to any message with "Hi there!".
bot.on("message", (ctx: any) => {
    console.log(ctx);
    sendToAgent(ctx.message);
    ctx.reply("Sending to the llm...");
});

bot.start();
