import autogen

from prompts import prompts
from agents import agents
from helpers.register_tools import register_tools

register_tools()

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
        "recipient": agents.test_fixer,
        "message": prompts.test_fixer_message,
        "summary_method": "reflection_with_llm",
    },
    {
        "sender": agents.user_rep,
        "recipient": agents.test_reviewer,
        "message": prompts.test_reviewer_message,
        "summary_method": "reflection_with_llm",
        "max_turns": 20
    },
])

print('chat results: ', chat_results)
