import os
import asyncio
import autogen
import pprint
import uvicorn
import boto3
import os
import zipfile
import json
import datetime

from typing import Any
from autogen.io.websockets import IOWebsockets
from contextlib import asynccontextmanager  # noqa: E402
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from agents import agents
from helpers.register_tools import register_tools
from prompts import prompts



# Configure logging
logging_session_id = autogen.runtime_logging.start(logger_type="file", config={"filename": "main.log"})
print("Logging session ID: " + str(logging_session_id))

# Global variable to store the server context manager
ws_ctx = None
apikey = None
taskid = None

# S3 bucket name
bucket = 'snooze-client-agent-chats-zzz--pastel-de-nata'

# Register the tools
register_tools()


def on_connect(iostream: IOWebsockets) -> None:
    global restart_flag

    print(f"on_connect: Connected to client using IOWebsockets {iostream}", flush=True)
    print(
        f"on_connect: Initiating chat with agent {agents.user_proxy}",
        flush=True,
    )

    initial_msg = iostream.input()
    print(f"on_connect: initial_msg: {initial_msg}", flush=True)

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
            "max_turns": 20
        },
        {
            "sender": agents.user_rep,
            "recipient": agents.contract_reviewer,
            "message": prompts.contract_reviewer_message,
            "summary_method": "reflection_with_llm",
            "max_turns": 20
        },
        {
            "sender": agents.user_rep,
            "recipient": agents.test_writer,
            "message": prompts.test_writer_message,
            "summary_method": "reflection_with_llm",
            "max_turns": 20
        },
        {
            "sender": agents.user_rep,
            "recipient": agents.test_fixer,
            "message": prompts.test_fixer_message,
            "summary_method": "reflection_with_llm",
            "max_turns": 20
        },
        {
            "sender": agents.user_rep,
            "recipient": agents.test_reviewer,
            "message": prompts.test_reviewer_message,
            "summary_method": "reflection_with_llm",
            "max_turns": 20
        },
    ])

    print("on_connect: finishing chats", flush=True)
    
    autogen.runtime_logging.stop()
    dir = 'zzz/'
    
    #### Save chat_history and cost to zzz/
    if hasattr(chat_results, 'chat_history'):
        pprint.pprint(chat_results.chat_history)
        with open(f"{dir}/chat_history.json", "w") as f:
            f.write(json.dumps(chat_results.chat_history))    
            
    if hasattr(chat_results, 'cost'):
        pprint.pprint(chat_results.cost)
        with open(f"{dir}/chat_costs.json", "w") as f:
            f.write(json.dumps(chat_results.cost))

    #### Save zzz/ to S3
    
    current_time = datetime.datetime.now(datetime.UTC).isoformat(timespec='seconds')
    zip = f"zzz.{apikey}.{current_time}.zip"
    
    iostream.print(f"snooz3-agent: {zip}", flush=True)
    print(f"on_connect: saving to S3. zip: {zip}, bucket: {bucket}")
    
    # Create a ZipFile Object
    with zipfile.ZipFile(zip, 'w') as zipObj:
        # Iterate over all the files in directory
        for foldername, subfolders, filenames in os.walk(dir):
            for filename in filenames:
                # Create complete filepath of file in directory
                filePath = os.path.join(foldername, filename)
                # Add file to zip
                zipObj.write(filePath)

    # Create an S3 client
    s3 = boto3.client('s3')

    # Uploads the given file using a managed uploader, which will split up large
    # files automatically and upload parts in parallel.
    s3.upload_file(zip, bucket, zip)
    
    print(f"on_connect: saved succesfully to S3. zip: {zip}, bucket: {bucket}")
    


async def start_server():
    global ws_ctx
    ws_ctx = IOWebsockets.run_server_in_thread(host="0.0.0.0", on_connect=on_connect, port=1337)
    ws_ctx.__enter__()
    print(f"Websocket server started.", flush=True)

async def stop_server():
    global ws_ctx
    if ws_ctx:
        ws_ctx.__exit__(None, None, None)
        ws_ctx = None
        print(f"Websocket server stopped.", flush=True)

@asynccontextmanager
async def run_websocket_server(app):
    await start_server()
    yield
    await stop_server()

app = FastAPI(lifespan=run_websocket_server)

class ApiKey(BaseModel):
    apikey: str

# have to type hint in order for JSON body in request to be validated
@app.post("/apikey")
async def set_apikey(_apikey: ApiKey):
    global apikey
    print(f"apikey: {_apikey.apikey}")
    apikey = _apikey.apikey
    return {"status": "apikey received", "apikey": _apikey.apikey}

class ECSTaskID(BaseModel):
    taskid: str

@app.post("/taskid")
async def set_apikey(_taskid: ECSTaskID):
    global taskid
    print(f"ecs-taskid: {_taskid.taskid}")
    taskid = _taskid.taskid
    return {"status": "taskid received", "taskid": _taskid.taskid}


@app.get("/")
async def get():
    return "hello"

@app.post("/restart")
async def restart_connection(background_tasks: BackgroundTasks):
    background_tasks.add_task(stop_server)
    await asyncio.sleep(10)  # Give time to properly stop the server
    background_tasks.add_task(start_server)
    return {"status": "restart triggered"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
