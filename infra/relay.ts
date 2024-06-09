/**
 * The relay has 2 responsibilities:
 * 1. Spin up and down ECS tasks
 * 2. Relay messages between clients and agents on ECS
 */

import cors from 'cors';
import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import startAgentSession from './startAgentSession';
import { logger } from 'express-winston';
import winston from 'winston';
import WebSocket, { MessageEvent, ErrorEvent, Event } from 'ws';

const WS_PORT = 8000;

const KEEPALIVE_INTERVAL = 30000; // Interval in milliseconds
const PING_TIMEOUT = 90000; // Timeout in milliseconds

const connectedClients = new Map<string, Socket>();
const connectedAgents = new Map<string, WebSocket>();

const clientToAgent = new Map<string, string>();
const agentToClient = new Map<string, string>();

function main() {
    const app = express();
    app.use(cors());
    app.use(logger({ 
        transports: [
            new winston.transports.Console()
          ],
     }));
    const server = http.createServer(app);
    const ws = new Server(server, {
        pingTimeout: PING_TIMEOUT,
        pingInterval: KEEPALIVE_INTERVAL,
        cors: {
            origin: "*",
        },
    });

    app.get('/healthcheck', (req: Request, res: Response) => res.send('Alive!'));
    app.post('/start', async (req: Request, res: Response) => {
        console.log('Starting agent session...');
        const session = await startAgentSession();
        if (!session) {
            res.status(500).send('Failed to start agent session');
            return;
        }
        const { wsUrl, taskId } = session;
        // let wsUrl = "ws://host.docker.internal:1337";
        // let taskId = 0;
        connectToAgent(wsUrl);
        res.send({ taskId, wsUrl });
        return;
    });
    // TODO: come back to this to clean up ecs tasks
    // app.post('/end', async (req: Request, res: Response) => {
    //     console.log('Ending agent session...');
    //     const taskId = req.body.taskId;
    //     await stopAgentSession(taskId);
    //     res.send('ok');
    // });
    // wsApp.get('/', (req: Request, res: Response) => res.send('Alive!'));

    ws.on('connection', (socket: Socket) => {
        handleClientConnection(socket);
    });

    server.listen(WS_PORT, '0.0.0.0', () => {
        console.log(`Websocket server running on port ${WS_PORT}`);
    });
}

main();

// Handles conenctions from the client
async function handleClientConnection (websocket: Socket) {
    const clientWsUrl = websocket.conn.remoteAddress;
    console.log(`Client connected: ${clientWsUrl}`);
    connectedClients.set(clientWsUrl, websocket);

    websocket.on('message', async (message: string) => {
        if (message.startsWith('snooz3-pair')) {
            console.log("Pairing to agent...")
            const agentWsUrl = message.split(' ')[1];
            const agentWs = connectedAgents.get(agentWsUrl);
            if (!agentWs) {
                console.error('Agent websocket not found', agentWsUrl);
                // TODO: update this to send an error if the connection fails
                if (!connectToAgent(agentWsUrl)) {
                    websocket.send('snooz3-pair-error agent-not-found');
                    return;
                }
            }
            // pair
            clientToAgent.set(clientWsUrl, agentWsUrl);
            agentToClient.set(agentWsUrl, clientWsUrl);
            websocket.send('snooz3-pair-success');
            console.log("Pairing to agent successful");
        } else if (message === 'snooz3-restart') {
            console.log('Restarting agent connection...');
            const agentWsUrl = clientToAgent.get(clientWsUrl);
            if (!agentWsUrl) {
                console.error('Agent websocket not found', agentWsUrl);
                return;
            }
            const agentWs = connectedAgents.get(agentWsUrl as string);
            agentWs?.close();
            connectToAgent(agentWsUrl);
        } else {
            const agentWsUrl = clientToAgent.get(clientWsUrl);
            const agentWs = connectedAgents.get(agentWsUrl as string);
            if (!agentWs) {
                console.error('Agent websocket not found', agentWsUrl);
                return;
            }
            agentWs.send(message);
            console.log("Sent message to agent", agentWsUrl);
        }
    });
    websocket.on('close', () => {
        console.log(`Client disconnected: ${clientWsUrl}`);
        connectedClients.delete(clientWsUrl);
        clientToAgent.delete(clientWsUrl);
    });
};

function handleOpen(wsUrl: string, agentWebSocket: WebSocket) {
        console.log('Connected to agent websocket server', wsUrl);
        agentWebSocket.send("start");
    }
function handleMessage(wsUrl: string, message: MessageEvent) {
    const clientWsUrl = agentToClient.get(wsUrl);
        if (!clientWsUrl) {
            console.error('No client websocket url', clientWsUrl);
            return;
        }
        const clientWs = connectedClients.get(clientWsUrl);
        if (!clientWs) {
            console.error('Client websocket not found', clientWsUrl);
            return;
        }
        clientWs.send(message.data);
}
function handleError(error: ErrorEvent) {
    console.error('Error', error);
}
function handleClose(wsUrl: string) {
    console.log('Closed: Connection to agent websocket server was closed', wsUrl);
    // TODO: clean up the maps here
}

// Creates client connection to the agent
function connectToAgent (wsUrl: string) {
    console.log('Connecting to agent websocket server', wsUrl);
    const agentWebSocket = new WebSocket(wsUrl);

    agentWebSocket.onopen = (event: Event) => handleOpen(wsUrl, agentWebSocket);
    agentWebSocket.onmessage = (message: MessageEvent) => handleMessage(wsUrl, message);
    agentWebSocket.onerror = (error: ErrorEvent) => handleError(error);
    agentWebSocket.onclose = () => handleClose(wsUrl);

    connectedAgents.set(wsUrl, agentWebSocket);
    return true;
};
