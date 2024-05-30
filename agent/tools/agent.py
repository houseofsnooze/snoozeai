def run_bash(path):
    try:
        result = subprocess.run(
                ['bash', path], 
                check=True,
                capture_output=True,
                text=True,
                )
        print("My Output:", result.stdout)
        print("My Error:", result.stderr)
    except Exception as e:
        return "Script failed with error.\n" +\
                "stdout: " + e.stdout + "\n" +\
                "stderr: " + e.stderr + "\n"

def run_tests():
    return run_bash("./run_tests.sh")

def init_tests():
    return run_bash("./init_tests.sh")
