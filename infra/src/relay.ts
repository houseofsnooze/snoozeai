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
import startAgentTasks from './startAgentTasks';

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
    app.use(express.json());
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
    app.post('/snooze-admin', async (req: Request, res: Response) => {
        try {
            if (req.body.command === "startTask") {
                const tasks = await startAgentTasks(req.body.count);
                res.send(tasks);
                return;
            } else {
                res.status(400).send('unknown command');
                return;
            }
        } catch (error) {
            console.error('Error', error);
            res.status(500).send({ error: 'Failed' });
            return;
        }
    });
    app.post('/start', async (req: Request, res: Response) => {
        try {
            const userId = req.body.userId;
            console.log(`Starting agent session for user: ${userId}`);
            const session = await startAgentSession(userId);
            if (!session) {
                res.status(500).send({ error: 'Failed to start agent session' });
                return;
            }
            const { wsUrl, taskId } = session;
            connectToAgent(wsUrl);
            const ip = wsUrl.split('ws://')[1].split(':')[0];
            setTimeout(
                () => postToAgent(ip, 'taskid', JSON.stringify({ "taskid": taskId })),
                30000
            );
            res.send({ taskId, wsUrl });
            return;
        } catch (error) {
            console.error('Error starting agent session', error);
            res.status(500).send({ error: 'Failed to start agent session' });
            return;
        }
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

// takes a websocket url, make a HTTP POST to the IP, path and with payload
async function postToAgent(ip: string, path: string, payload: string, port: number = 8080) {
    const url = `http://${ip}:${port}/${path}`;
    console.log(`postToAgent - POST to agent: ${url} with payload ${payload}`);
    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: payload,
        });
        if (!resp.ok) {
            console.error('not ok from POST to agent');
        } else {
            const data = await resp.json();
            console.log('response from POST to agent: ', data);
        }
    } catch (error) {
        console.error('error from POST to agent', error);
    }
}

// Handles connections from clients
async function handleClientConnection(websocket: Socket) {
    const clientWsUrl = websocket.conn.remoteAddress;
    console.log(`Client connected: ${clientWsUrl}`);
    // TODO: require API key be provided already
    connectedClients.set(clientWsUrl, websocket);
    websocket.on('message', async (message: string) => {
        if (message.startsWith('snooz3-pair')) {
            const agentWsUrl = message.split(' ')[1];

            // set the API key
            // assumed format to be snooz3-api-key:apikey
            const apikey = message.split(' ')[2];

            console.log(`ws-message snooze3-pair. message: ${message}, agentWSUrl: ${agentWsUrl}, apikey: ${apikey}`);

            if (!agentWsUrl) {
                console.error('ws-message: agent websocket not found - ', agentWsUrl);
                return;
            }
            // TODO: this is a hack, need to get the ip from the agent ws url
            // agentWsUrl: ws://172.17.0.2:1337
            const ip = agentWsUrl.split('ws://')[1].split(':')[0];
            const payload = JSON.stringify({ apikey });

            // let this run in bg instead of awaiting
            postToAgent(ip, 'apikey', payload);

            // pairing agent
            console.log("Pairing to agent...")
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
            if (!agentWs) {
                console.error('Agent websocket not found', agentWsUrl);
            } else {
                agentWs?.close();
                if (!connectToAgent(agentWsUrl)) {
                    websocket.send('snooz3-pair-error agent-not-found');
                    return;
                }
                // pair
                clientToAgent.set(clientWsUrl, agentWsUrl);
                agentToClient.set(agentWsUrl, clientWsUrl);
            }
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

// Handles connections to agents
function handleOpen(wsUrl: string, agentWebSocket: WebSocket) {
    console.log('Connected to agent websocket server', wsUrl);
    agentWebSocket.send("start");
}
function handleMessage(wsUrl: string, message: MessageEvent) {
    console.log('Received message from agent', wsUrl, message.data);
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
    // passing whatever message received
    clientWs.send(message.data);
}
function handleError(error: ErrorEvent) {
    console.error('Error', error);
}
function handleClose(wsUrl: string) {
    console.log('Closed: Connection to agent websocket server was closed', wsUrl);
    // restart just reconnects to the same websocket server on the agent
    // do not delete the map entry
    // TODO: sent message to client saying the agent disconnected
}

// Creates a client connection to the agent
function connectToAgent(wsUrl: string) {
    console.log('Connecting to agent websocket server', wsUrl);
    const agentWebSocket = new WebSocket(wsUrl);

    agentWebSocket.onopen = (event: Event) => handleOpen(wsUrl, agentWebSocket);
    agentWebSocket.onmessage = (message: MessageEvent) => handleMessage(wsUrl, message);
    agentWebSocket.onerror = (error: ErrorEvent) => handleError(error);
    agentWebSocket.onclose = () => handleClose(wsUrl);

    connectedAgents.set(wsUrl, agentWebSocket);
    return true;
};
