import os
from typing import Any

import asyncio
import autogen
from autogen.io.base import IOStream
from autogen.io.websockets import IOWebsockets
from concurrent.futures import ThreadPoolExecutor
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse
import subprocess

from agents import agents
from helpers.register_tools import register_tools
from prompts import prompts

# Register the tools
register_tools()

def run():
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

if __name__ == "__main__":
    run()
