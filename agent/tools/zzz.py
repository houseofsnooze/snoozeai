import os
import shutil

def prep_for_testing():
    print("running")
    # Find all files in zzz that end in .sol and move them to zzz-test/contracts

    source_directory = 'zzz'
    contracts_destination_directory = 'zzz-test/contracts'
    tests_destination_directory = 'zzz-test/test'

    # Ensure the destination directory exists
    if not os.path.exists(contracts_destination_directory):
        os.makedirs(contracts_destination_directory)
    if not os.path.exists(tests_destination_directory):
        os.makedirs(tests_destination_directory)

    # List all .sol files in the source directory
    contracts = [f for f in os.listdir(source_directory) if f.endswith('.sol')]
    tests = [f for f in os.listdir(source_directory) if f.endswith('.js')]

    # Move each .sol file to the destination directory
    for file in contracts:
        source_path = os.path.join(source_directory, file)
        destination_path = os.path.join(contracts_destination_directory, file)
        shutil.copy(source_path, destination_path)
        print(f'Copied {file} from {source_directory} to {contracts_destination_directory}')

    # Move each .js file to the destination directory
    for file in tests:
        source_path = os.path.join(source_directory, file)
        destination_path = os.path.join(tests_destination_directory, file)
        shutil.copy(source_path, destination_path)
        print(f'Copied {file} from {source_directory} to {tests_destination_directory}')

if __name__ == "__main__":
    prep_for_testing()
