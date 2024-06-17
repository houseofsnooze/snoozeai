import os
from autogen.agentchat import ConversableAgent, UserProxyAgent
# from autogen import ConversableAgent, UserProxyAgent, GroupChatManager, GroupChat
from prompts import prompts
from autogen.coding import LocalCommandLineCodeExecutor

seed = 42

# llm_config = {"model": "gpt-4o", "api_key": os.environ["OPENAI_API_KEY"], "temperature": 0, "timeout": 180, "max_retries": 2, "seed": seed}

# llm_config = {"model": "gpt-3.5-turbo-0125", "api_key": os.environ["OPENAI_API_KEY"], "temperature": 0, "timeout": 180, "max_retries": 2, "seed": seed}
llm_config = {"model": "gpt-4o", "api_key": os.environ["OPENAI_API_KEY"], "temperature": 0, "seed": seed, "max_retries": 1}

# llm_config = {"model": "gpt-4-turbo", "api_key"  : os.environ["OPENAI_API_KEY"], "temperature": 0, "timeout": 60, "seed": seed}

# cannot call tools for some reason
# generates responses with non sense
# llm_config = {"model": "llama3-70b-8192", "api_key": os.environ["GROQ_API_KEY"], "temperature": 0, "timeout": 60, "seed": seed, "base_url": "https://api.groq.com/openai/v1/", "max_retries": 3}


# does not implement the function bodies
# llm_config = {"model": "gpt-3.5-turbo-0125", "api_key": os.environ["OPENAI_API_KEY"], "temperature": 0, "timeout": 60, "seed": seed}


# cannot call tools for some reason
# there is a pr open to call tools, but i hit exceptions when trying to use it
# llm_config = {
#     "model": "gemini-pro",
#     "api_key": os.environ["GEMINI_API_KEY"],
#     "api_type": "google",
#     "temperature": 0,
#     "timeout": 60,
#     "seed": seed
# }

llm_config_warm = dict(llm_config)
llm_config_warm["temperature"] = 1

def _exit_pred(msg):
    if msg["content"]:
        return "EXIT" in msg["content"] or "goodbye!" in msg["content"].lower()
    else:
        return False

exit_pred = _exit_pred

spec_writer = ConversableAgent(
    "Spec Writer",
    system_message=prompts.spec_writer_prompt,
    llm_config=llm_config,
    human_input_mode="NEVER",
)

contract_writer = ConversableAgent(
    name="Contract Writer",
    system_message=prompts.contract_writer_prompt,
    llm_config=llm_config,
    human_input_mode="NEVER",
    max_consecutive_auto_reply=20,
    is_termination_msg=exit_pred
)

contract_reviewer = ConversableAgent(
    name="Contract Reviewer",
    system_message=prompts.contract_reviewer_prompt,
    llm_config=llm_config,
    human_input_mode="NEVER",
    max_consecutive_auto_reply=20,
    is_termination_msg=exit_pred
)

test_writer = ConversableAgent(
    name="Test Writer",
    system_message=prompts.test_writer_prompt,
    llm_config=llm_config,
    human_input_mode="NEVER",
    max_consecutive_auto_reply=20,
    is_termination_msg=exit_pred
)

test_reviewer = ConversableAgent(
    name="Test Reviewer",
    system_message=prompts.test_reviewer_prompt,
    llm_config=llm_config,
    human_input_mode="NEVER",
    max_consecutive_auto_reply=20,
    is_termination_msg=exit_pred
)

test_fixer = ConversableAgent(
    name="Test Fixer",
    system_message=prompts.test_fixer_prompt,
    llm_config=llm_config,
    human_input_mode="NEVER",
    max_consecutive_auto_reply=20,
    is_termination_msg=exit_pred
)

user_rep = ConversableAgent(
    name="Client Rep",
    human_input_mode="NEVER",
    llm_config=llm_config,
    system_message="An AI will be talking to you. "
                   "No human will be talking to you. "
                   "You ARE only allowed: 1) ask the AI to save the files 2) reply empty string to let the AI execute tools 3) ask the AI to double check whether files are saved. "
                   "You MUST not propose to the AI that you will save the files, you MUST let the AI save the files by itself. "
                   "If the AI gave you reviewed code in the message, you ask the AI to save the files. "
                   "If the AI saved the files, you ask the AI to double check whether it saved the files. "
                   "If the AI said they saved the files and double checked, you reply 'EXIT' to the AI to terminate the conversation. ",
    max_consecutive_auto_reply=20,
    is_termination_msg=exit_pred
)
 
user_proxy = UserProxyAgent(
    name="Client",
    code_execution_config=False,
)
