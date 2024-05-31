from tools import fs

spec_writer_prompt = fs.read_file("prompts/spec_writer/ask_questions.md")
contract_writer_prompt = fs.read_file("prompts/contract_writer/write_contracts.md")
contract_reviewer_prompt = fs.read_file("prompts/contract_reviewer/review_contracts.md")
test_reviewer_prompt = fs.read_file("prompts/test_reviewer/review_tests.md")
test_fixer_prompt = fs.read_file("prompts/test_fixer/fix_tests.md")
test_writer_prompt = fs.read_file("prompts/test_writer/generate_tests.md")

spec_writer_message = """Help me to elaborate on the specification for a new smart contract by asking good and concise questions.
Name the spec `spec0.md` and put the spec in the zzz/ directory. 
Since I am iterating and making the system feature by feature, 
I will need you to check zzz/ and see if there are: 
1. existing specification 
2. existing tests (Hardhat tests written in Javascript, so look for .js files in a zzz/test directory)
3. existing contracts (Solidity contracts, so look for .sol files in a zzz/contracts directory)
If there are, read and reflect on the files, and help me write the next feature with this information in mind. 
In your specification, add the new feature to the existing implementation. 
Save the spec with an incremental suffix (e.g. if there is `spec1.md`, then name it `spec2.md` and so on) in the zzz/ directory. 
The next agent will write the smart contracts after. 
You need to tell the next agent 'exit' when they finish the task and save all the files. 
"""

contract_writer_message = """Read the last written spec in zzz/. 
Write smart contracts to match the spec exactly. 
Save the contracts to the zzz/contracts directory. 
The next agent will review the smart contracts after. """

contract_reviewer_message = """Read the last written spec and the contracts in zzz/ and zzz/contracts. 
Assume that the contracts are incorrect and that they do not implement the spec correctly. 
Think independently and critically, and correct the contracts. 
The next agent will write the tests for the smart contracts after. """

test_writer_message = """Read the last written spec and smart contracts in zzz/ and zzz/contracts. 
Write exhaustive tests that verify the smart contracts comply with the specification. 
Save the tests in the zzz/test directory. 
The next agent will review the tests for smart contracts after. """

test_reviewer_message = """Review the specification, smart contracts and the tests in zzz/, zzz/contracts and zzz/test. 
Fix any incorrect use of ethers API. Use only ethers v6 APIs. 
Save the fixed tests in zzz/test. 
The next agent will check the tests again, init/run the tests and debug any errors after. """

test_fixer_message = """Review the specification, smart contracts and the tests in zzz/, zzz/contracts and zzz/test. 
Assume the tests and smart contracts are incorrect, and assume the specification is correct, 
try fixing the tests and the smart contracts. 
After fixing the tests and the smart contracts, run the tests. 
You may need to initialize the tests. 
After this step, it is the end of the tool. """
