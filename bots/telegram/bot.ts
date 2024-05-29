import { Bot } from "https://deno.land/x/grammy@v1.23.0/mod.ts";

// this is our frontend

const TELEGRAM_BOT_KEY = Deno.env.get("MY_VARIABLE");

type User = {
  id: string;
  relayUrl: string;
}

type Users = {
  [id: string]: User;
};

const users: Users = {};
const relays: { [wsUrl: string]: WebSocket } = {};

const bot = new Bot(TELEGRAM_BOT_KEY || "");

// on start, create a container for the relay, connect to it and add handlers, store this and the user id
bot.command("start", async (ctx: any) => {
  if (isNewUser(ctx.from.id)) {
    ctx.reply("Howdy 👋! Let's get your Solidity contracts written so you can get back to sleep. We're spinning up your AI devs to work on it now...");
    await addNewUser(ctx.from.id);
  } else {
    ctx.reply("Let's start over!");
    await restartAgents();
  }
});

// on message from bot, forward it to the relay
bot.on("message", (ctx: any) => {
  sendToRelay(ctx, ctx.from.id, ctx.message);
});

bot.start();

async function addNewUser(userId: string) {
  // create container
  const containerUrl = await startNewContainer();
  // connect to it
  const ws = connectToContainer(containerUrl);
  // save the ws
  relays[ws.url] = ws;
  addHandlers(ws);
  users[userId] = {
    id: userId,
    relayUrl: ws.url,
  };
}

function connectToContainer(containerUrl: string): WebSocket {
  const ws = new WebSocket(containerUrl);
  return ws;
}

function sendToRelay(ctx: any, userId: string, message: string) {
  const user = users[userId];
  if (!user) {
    console.log(`User ${userId} not found`);
    ctx.reply("Hey stranger! Use the /start command to get started.");
    return;
  } else {
    const ws = relays[user.relayUrl];
    if (!ws) {
      console.log(`Relay for user ${userId} not found`);
      ctx.reply("Hey stranger! Use the /start command to get started.");
      return;
    }
    ws.send(message);
  }
}

// websocket handlers

function addHandlers(ws: WebSocket) {
  ws.onopen = handleConnect;
  ws.onmessage = (event) => handleMessage(event, ws.url);
}
function handleConnect() {
  console.log("Connected to a relay");
}
// on message from relay, send it to the bot
async function handleMessage(event: MessageEvent, relayUrl: string) {
  const data = event.data;
  console.log(`Received from ${relayUrl}: message: ${data}`);

  const user = getUserByRelayUrl(relayUrl);
  if (!user) {
    console.log(`Received message from unknown relay: ${relayUrl}`);
    return;
  } else {
    await bot.api.sendMessage(user.id, data);
  }
};

function isNewUser(userId: string) {
  return !users[userId];
}

function startNewContainer(): string {
  // TODO: start new container
  return "https://localhost:8000";
}

function restartAgents(): string {
  // TODO: start new container
  return "https://localhost:8000";
}

function getUserByRelayUrl(relayUrl: string): User | undefined {
  return Object.values(users).find((user) => user.relayUrl === relayUrl);
}

