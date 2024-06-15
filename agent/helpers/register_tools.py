from tools import fs
from agents import agents

from tools.agent import run_tests, init_tests

def register_tools():
    agents.user_proxy.register_for_execution(name="list_files")(fs.list_files)
    agents.user_proxy.register_for_execution(name="read_file")(fs.read_file)
    agents.user_proxy.register_for_execution(name="save_file")(fs.save_file)
    agents.user_proxy.register_for_execution(name="make_directory")(fs.make_directory)

    agents.user_rep.register_for_execution(name="list_files")(fs.list_files)
    agents.user_rep.register_for_execution(name="read_file")(fs.read_file)
    agents.user_rep.register_for_execution(name="save_file")(fs.save_file)
    agents.user_rep.register_for_execution(name="make_directory")(fs.make_directory)


    agents.spec_writer.register_for_llm(name="list_files", description="Lists files and folders")(fs.list_files)
    agents.spec_writer.register_for_llm(name="read_file", description="Reads files")(fs.read_file)
    agents.spec_writer.register_for_llm(name="save_file", description="Writes files")(fs.save_file)
    agents.spec_writer.register_for_llm(name="make_directory", description="Creates folders")(fs.make_directory)
    agents.spec_writer.register_for_execution(name="list_files")(fs.list_files)
    agents.spec_writer.register_for_execution(name="read_file")(fs.read_file)
    agents.spec_writer.register_for_execution(name="save_file")(fs.save_file)
    agents.spec_writer.register_for_execution(name="make_directory")(fs.make_directory)

    agents.test_writer.register_for_llm(name="list_files", description="Lists files and folders")(fs.list_files)
    agents.test_writer.register_for_llm(name="read_file", description="Reads files")(fs.read_file)
    agents.test_writer.register_for_llm(name="save_file", description="Writes files")(fs.save_file)
    agents.test_writer.register_for_llm(name="make_directory", description="Creates folders")(fs.make_directory)
    agents.test_writer.register_for_execution(name="list_files")(fs.list_files)
    agents.test_writer.register_for_execution(name="read_file")(fs.read_file)
    agents.test_writer.register_for_execution(name="save_file")(fs.save_file)
    agents.test_writer.register_for_execution(name="make_directory")(fs.make_directory)

    agents.test_reviewer.register_for_llm(name="list_files", description="Lists files and folders")(fs.list_files)
    agents.test_reviewer.register_for_llm(name="read_file", description="Reads files")(fs.read_file)
    agents.test_reviewer.register_for_llm(name="save_file", description="Writes files")(fs.save_file)
    agents.test_reviewer.register_for_llm(name="make_directory", description="Creates folders")(fs.make_directory)
    agents.test_reviewer.register_for_execution(name="list_files")(fs.list_files)
    agents.test_reviewer.register_for_execution(name="read_file")(fs.read_file)
    agents.test_reviewer.register_for_execution(name="save_file")(fs.save_file)
    agents.test_reviewer.register_for_execution(name="make_directory")(fs.make_directory)

    agents.test_fixer.register_for_llm(name="list_files", description="Lists files and folders")(fs.list_files)
    agents.test_fixer.register_for_llm(name="read_file", description="Reads files")(fs.read_file)
    agents.test_fixer.register_for_llm(name="save_file", description="Writes files")(fs.save_file)
    agents.test_fixer.register_for_llm(name="make_directory", description="Creates folders")(fs.make_directory)
    agents.test_fixer.register_for_execution(name="list_files")(fs.list_files)
    agents.test_fixer.register_for_execution(name="read_file")(fs.read_file)
    agents.test_fixer.register_for_execution(name="save_file")(fs.save_file)
    agents.test_fixer.register_for_execution(name="make_directory")(fs.make_directory)

    agents.contract_writer.register_for_llm(name="list_files", description="Lists files and folders")(fs.list_files)
    agents.contract_writer.register_for_llm(name="read_file", description="Reads files")(fs.read_file)
    agents.contract_writer.register_for_llm(name="save_file", description="Writes files")(fs.save_file)
    agents.contract_writer.register_for_llm(name="make_directory", description="Creates folders")(fs.make_directory)
    agents.contract_writer.register_for_execution(name="list_files")(fs.list_files)
    agents.contract_writer.register_for_execution(name="read_file")(fs.read_file)
    agents.contract_writer.register_for_execution(name="save_file")(fs.save_file)
    agents.contract_writer.register_for_execution(name="make_directory")(fs.make_directory)

    agents.contract_reviewer.register_for_llm(name="list_files", description="Lists files and folders")(fs.list_files)
    agents.contract_reviewer.register_for_llm(name="read_file", description="Reads files")(fs.read_file)
    agents.contract_reviewer.register_for_llm(name="save_file", description="Writes files")(fs.save_file)
    agents.contract_reviewer.register_for_llm(name="make_directory", description="Creates folders")(fs.make_directory)
    agents.contract_reviewer.register_for_execution(name="list_files")(fs.list_files)
    agents.contract_reviewer.register_for_execution(name="read_file")(fs.read_file)
    agents.contract_reviewer.register_for_execution(name="save_file")(fs.save_file)
    agents.contract_reviewer.register_for_execution(name="make_directory")(fs.make_directory)
