import { Bot, Context } from "https://deno.land/x/grammy@v1.23.0/mod.ts";
import * as db from "../db.ts";

export async function issueAccessCode(bot: Bot, ctx: Context) {
    const name = ctx.from?.first_name || "stranger";
    const username = ctx.from?.username || "stranger";
    const id = ctx.from?.id;
    if (!id) {
        console.log("No user id found");
        return;
    }
    await ctx.reply(`heyy ${name}! gonna dm you an invite code`);
    await bot.api.sendChatAction(id, "typing");

    const inviteCode = `${username.trim().toLowerCase().replace(" ", "-")}-${Math.floor(Math.random() * 1000000)}`;
    const success = await db.issueAccessCode(inviteCode);
    if (success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await bot.api.sendMessage(id, `hey! here's your invite code for snooze: ${inviteCode}`);
    } else {
        await new Promise(resolve => setTimeout(resolve, 3000));
        await bot.api.sendMessage(id, `hey! turns out we are at capacity right now. mind pinging me for an invite code later?`);
    }
}
