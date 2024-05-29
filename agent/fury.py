import os
import uvicorn  # noqa: E402
from autogen import AssistantAgent, UserProxyAgent, ConversableAgent
from typing import List, Any, Union, Dict, Optional
from http.server import HTTPServer, SimpleHTTPRequestHandler  # noqa: E402

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager  # noqa: E402

import autogen
from websockets.sync.client import connect as ws_connect
from autogen.io.websockets import IOWebsockets
from autogen.io.base import IOStream
import uvicorn

from tools import fs

llm_config = {"model": "gpt-4o", "api_key": os.environ["OPENAI_API_KEY"], "temperature": 1, "max_retries": 3, "timeout": 60}

### PROMPTS

spec_writer_prompt = fs.read_file("prompts/spec_writer/ask_questions.md")
contract_writer_prompt = fs.read_file("prompts/contract_writer/write_contracts.md")
contract_reviewer_prompt = fs.read_file("prompts/contract_reviewer/review_contracts.md")
test_reviewer_prompt = fs.read_file("prompts/test_reviewer/upgrade_ethers.md")
test_writer_prompt = fs.read_file("prompts/test_writer/generate_tests.md")

### AGENTS

spec_writer = ConversableAgent(
    "Spec Writer",
    system_message=spec_writer_prompt,
    llm_config=llm_config,
)

test_writer = ConversableAgent(
    name="Test Writer",
    system_message=test_writer_prompt,
    llm_config=llm_config,
)

test_reviewer = ConversableAgent(
    name="Test Reviewer",
    system_message=test_reviewer_prompt,
    llm_config=llm_config,
)

contract_writer = ConversableAgent(
    name="Contract Writer",
    system_message=contract_writer_prompt,
    llm_config=llm_config,
)

contract_reviewer = ConversableAgent(
    name="Contract Reviewer",
    system_message=contract_reviewer_prompt,
    llm_config=llm_config,
)

user_proxy = UserProxyAgent(
    name="Client",
    max_consecutive_auto_reply=10,
    code_execution_config=False,
)

# Register the tools

spec_writer.register_for_llm(name="list_files", description="Lists files and folders")(fs.list_files)
spec_writer.register_for_llm(name="read_file", description="Reads files")(fs.read_file)
spec_writer.register_for_llm(name="save_file", description="Writes files")(fs.save_file)
spec_writer.register_for_llm(name="make_directory", description="Creates folders")(fs.make_directory)

test_writer.register_for_llm(name="list_files", description="Lists files and folders")(fs.list_files)
test_writer.register_for_llm(name="read_file", description="Reads files")(fs.read_file)
test_writer.register_for_llm(name="save_file", description="Writes files")(fs.save_file)
test_writer.register_for_llm(name="make_directory", description="Creates folders")(fs.make_directory)

test_reviewer.register_for_llm(name="list_files", description="Lists files and folders")(fs.list_files)
test_reviewer.register_for_llm(name="read_file", description="Reads files")(fs.read_file)
test_reviewer.register_for_llm(name="save_file", description="Writes files")(fs.save_file)
test_reviewer.register_for_llm(name="make_directory", description="Creates folders")(fs.make_directory)

contract_writer.register_for_llm(name="list_files", description="Lists files and folders")(fs.list_files)
contract_writer.register_for_llm(name="read_file", description="Reads files")(fs.read_file)
contract_writer.register_for_llm(name="save_file", description="Writes files")(fs.save_file)
contract_writer.register_for_llm(name="make_directory", description="Creates folders")(fs.make_directory)

contract_reviewer.register_for_llm(name="list_files", description="Lists files and folders")(fs.list_files)
contract_reviewer.register_for_llm(name="read_file", description="Reads files")(fs.read_file)
contract_reviewer.register_for_llm(name="save_file", description="Writes files")(fs.save_file)
contract_reviewer.register_for_llm(name="make_directory", description="Creates folders")(fs.make_directory)

spec_writer.register_for_execution(name="list_files")(fs.list_files)
spec_writer.register_for_execution(name="read_file")(fs.read_file)
spec_writer.register_for_execution(name="save_file")(fs.save_file)
spec_writer.register_for_execution(name="make_directory")(fs.make_directory)

test_writer.register_for_execution(name="list_files")(fs.list_files)
test_writer.register_for_execution(name="read_file")(fs.read_file)
test_writer.register_for_execution(name="save_file")(fs.save_file)
test_writer.register_for_execution(name="make_directory")(fs.make_directory)

test_reviewer.register_for_execution(name="list_files")(fs.list_files)
test_reviewer.register_for_execution(name="read_file")(fs.read_file)
test_reviewer.register_for_execution(name="save_file")(fs.save_file)
test_reviewer.register_for_execution(name="make_directory")(fs.make_directory)

contract_writer.register_for_execution(name="list_files")(fs.list_files)
contract_writer.register_for_execution(name="read_file")(fs.read_file)
contract_writer.register_for_execution(name="save_file")(fs.save_file)
contract_writer.register_for_execution(name="make_directory")(fs.make_directory)

contract_reviewer.register_for_execution(name="list_files")(fs.list_files)
contract_reviewer.register_for_execution(name="read_file")(fs.read_file)
contract_reviewer.register_for_execution(name="save_file")(fs.save_file)
contract_reviewer.register_for_execution(name="make_directory")(fs.make_directory)

user_proxy.register_for_execution(name="list_files")(fs.list_files)
user_proxy.register_for_execution(name="read_file")(fs.read_file)
user_proxy.register_for_execution(name="save_file")(fs.save_file)
user_proxy.register_for_execution(name="make_directory")(fs.make_directory)

### RUN

def on_connect(iostream: IOWebsockets) -> None:
    print(f" - on_connect(): Connected to client using IOWebsockets {iostream}", flush=True)

    print(" - on_connect(): Receiving message from client.", flush=True)

    initial_msg = iostream.input()

    stream_llm_config = llm_config
    stream_llm_config["stream"] = True

    print(
        f" - on_connect(): Initiating chat with agent {user_proxy} using message '{initial_msg}'",
        flush=True,
    )

    chat_results = user_proxy.initiate_chats(
    [
        {
            "recipient": spec_writer,
            "message": "Help me to elaborate on the specification for a new smart contract by asking good and concise questions. " +
            "Name the spec `spec0.md` and put the spec in the zzz/ directory. " + 
            "Since I am iterating and making the system feature by feature, " +
            "I will need you to check zzz/ and see if there are: "
            "1. existing specification " +
            "2. existing tests (Hardhat tests written in Javascript, so look for .js files in a zzz/test directory)" +
            "3. existing contracts (Solidity contracts, so look for .sol files in a zzz/contracts directory)" +
            "If there are, read and reflect on the files, and help me write the next feature with this information in mind. " +
            "In your specification, add the new feature to the existing implementation. " +
            "Save the spec with the name that indicates next version (e.g. `spec1.md` or `spec2.md` and so on) in the zzz/ directory." +
            "Start by saying \"What kind of app should we build today?\"...",
            "summary_method": "reflection_with_llm",
        },
        {
            "recipient": contract_writer,
            "message": "Read the last written spec md file in the zzz directory then write smart contracts to match the spec exactly. "
            "Save the contracts to the zzz/contracts directory.",
            "summary_method": "reflection_with_llm",
        },
        {
            "recipient": contract_reviewer,
            "message": "Read the latest spec (a markdown file in the zzz/ directory, suffixed with version number e.g. if there are spec0.md and spec1.md, read spec1.md) and the contracts (.sol files in the zzz/contracts directory) "
            "Assume that the contracts are incorrect and that they do not implement the spec correctly. "
            "Think independently and critically, and correct the contracts.",
            "summary_method": "reflection_with_llm"
        },
        {
            "recipient": test_writer,
            "message": "Read the latest spec (a markdown file in the zzz/ directory, suffixed with version number e.g. if there are spec0.md and spec1.md, read spec1.md) and the contracts (.sol files in the zzz/contracts directory) "
            "Then write exhaustive tests that match the spec and save the tests in the zzz/test directory. "
            "When you are done pass the tests to the ethers API expert for review.",
            "summary_method": "reflection_with_llm",
        },
        {
            "recipient": test_reviewer,
            "message": "Read the tests (.js files) in the zzz/test directory one at a time. "
            "Assume that the usage of the ethers v6 API is incorrect. "
            "One at a time, re-write the test files to use the ethers v6 API correctly. "
            "Save the updated test file, then move to the next test.",
            "summary_method": "reflection_with_llm",
        },
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
