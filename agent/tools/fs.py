import os
import shutil

from typing import List

def list_files(path: str) -> List[str]:
    return [f for f in os.listdir(path)]

def read_file(filename: str) -> str:
    with open(filename, 'r') as myfile:
        data = myfile.read()  

    return data

def save_file(filename: str, data: str) -> None:
    with open(filename, 'w') as myfile:
        myfile.write(data)

def make_directory(path: str) -> None:
    if not os.path.exists(path):
        os.makedirs(path)

def prep_for_testing():
    source_directory = 'zzz'
    contracts_destination_directory = 'zzz/hh/contracts'
    tests_destination_directory = 'zzz/hh/test'

    # Ensure the destination directory exists
    if not os.path.exists(contracts_destination_directory):
        os.makedirs(contracts_destination_directory)
    if not os.path.exists(tests_destination_directory):
        os.makedirs(tests_destination_directory)

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
