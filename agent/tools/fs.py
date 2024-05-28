import os
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

