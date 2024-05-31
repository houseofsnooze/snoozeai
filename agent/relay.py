import asyncio
import os
import signal
import websockets
from websockets import WebSocketServerProtocol

connected_clients = set()
upstream_connection_task = None
KEEPALIVE_INTERVAL = 30  # Interval in seconds to send keepalive pings
PING_TIMEOUT = 90 # Timeout in seconds for keepalive pings

async def register(websocket: WebSocketServerProtocol):
    connected_clients.add(websocket)
    print(f"Client connected: {websocket.remote_address}")

async def unregister(websocket: WebSocketServerProtocol):
    connected_clients.remove(websocket)
    print(f"Client disconnected: {websocket.remote_address}")

async def broadcast(message: str, sender: WebSocketServerProtocol):
    for client in connected_clients:
        if client != sender:
            await client.send(message)

async def handler(websocket: WebSocketServerProtocol, path: str, upstream_websocket: WebSocketServerProtocol):
    global upstream_connection_task
    await register(websocket)
    try:
        async for message in websocket:
            print(f"From {websocket.remote_address}: {message}")
            if message == "snooz3-restart":
                print("Restarting upstream connection...")
                # Cancel the existing upstream connection task
                if upstream_connection_task:
                    upstream_connection_task.cancel()
                    try:
                        await upstream_connection_task
                    except asyncio.CancelledError:
                        pass
                # Start a new upstream connection task
                upstream_connection_task = asyncio.create_task(connect_to_upstream())
            else:
                await upstream_websocket.send(message)
    finally:
        await unregister(websocket)

async def server(upstream_websocket: WebSocketServerProtocol):
    async with websockets.serve(lambda ws, path: handler(ws, path, upstream_websocket), "0.0.0.0", 8000):
        print("WebSocket server running on port 8000")
        await asyncio.Future()  # Run forever

async def upstream_handler(websocket: WebSocketServerProtocol):
    try:
        async for message in websocket:
            print(f"From {websocket.remote_address}: {message}")
            await broadcast(message, None)
    except websockets.ConnectionClosed:
        print("Upstream server connection closed")

async def connect_to_upstream():
    try:
        async with websockets.connect(os.environ.get("SNOOZE_URL", "ws://0.0.0.0:1337"), ping_interval=KEEPALIVE_INTERVAL, ping_timeout=PING_TIMEOUT) as websocket:
            print("Connected to snooze websocket server")
            await websocket.send("start")
            upstream_task = asyncio.create_task(upstream_handler(websocket))
            server_task = asyncio.create_task(server(websocket))
            await asyncio.gather(upstream_task, server_task)
    except websockets.InvalidURI:
        print("Invalid URI for upstream server.")
    except websockets.InvalidHandshake:
        print("Invalid handshake with upstream server.")
    except websockets.ConnectionClosedError as e:
        print(f"Connection to upstream server closed: {e}")
    except Exception as e:
        print(f"Failed to connect to upstream server: {e}")

async def main():
    global upstream_connection_task
    # Create a task for connecting to the upstream server
    upstream_connection_task = asyncio.create_task(connect_to_upstream())
    
    # Create an event for graceful shutdown
    stop_event = asyncio.Event()

    def signal_handler():
        stop_event.set()

    # Register signal handlers for SIGINT and SIGTERM
    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGINT, signal_handler)
    loop.add_signal_handler(signal.SIGTERM, signal_handler)
    
    await stop_event.wait()

    # Cancel the upstream connection task and wait for it to complete
    upstream_connection_task.cancel()
    try:
        await upstream_connection_task
    except asyncio.CancelledError:
        print("Upstream connection task cancelled")

    # Close all connected clients
    await asyncio.gather(*(client.close() for client in connected_clients))

if __name__ == "__main__":
    asyncio.run(main())
