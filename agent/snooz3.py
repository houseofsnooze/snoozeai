import os
from typing import Any
import subprocess

import asyncio
import autogen
from autogen.io.base import IOStream
from autogen.io.websockets import IOWebsockets
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager  # noqa: E402
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
import uvicorn

from agents import agents
from helpers.register_tools import register_tools
from prompts import prompts

# Register the tools
register_tools()

def on_connect(iostream: IOWebsockets) -> None:
    print(f" - on_connect(): Connected to client using IOWebsockets {iostream}", flush=True)
    print(" - on_connect(): Receiving message from client.", flush=True)

    initial_msg = iostream.input()

    print(
        f" - on_connect(): Initiating chat with agent {agents.user_proxy} using message",
        flush=True,
    )

    chat_results = agents.user_proxy.initiate_chats([
        {
            "recipient": agents.spec_writer,
            "message": prompts.spec_writer_message,
            "summary_method": "reflection_with_llm",
        },
        {
            "sender": agents.user_rep,
            "recipient": agents.contract_writer,
            "message": prompts.contract_writer_message,
            "summary_method": "reflection_with_llm",
        },
        {
            "sender": agents.user_rep,
            "recipient": agents.contract_reviewer,
            "message": prompts.contract_reviewer_message,
            "summary_method": "reflection_with_llm"
        },
        {
            "sender": agents.user_rep,
            "recipient": agents.test_writer,
            "message": prompts.test_writer_message,
            "summary_method": "reflection_with_llm",
        },
        {
            "sender": agents.user_rep,
            "recipient": agents.test_reviewer,
            "message": prompts.test_reviewer_message,
            "summary_method": "reflection_with_llm",
        },
        {
            "sender": agents.user_rep,
            "recipient": agents.test_fixer,
            "message": prompts.test_fixer_message,
            "summary_method": "reflection_with_llm",
        }
    ])

@asynccontextmanager
async def run_websocket_server(app):
    with IOWebsockets.run_server_in_thread(host="0.0.0.0", on_connect=on_connect, port=1337) as uri:
        print(f"Websocket server started at {uri}.", flush=True)

        yield

app = FastAPI(lifespan=run_websocket_server)

@app.get("/")
async def get():
    return "hello"

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
