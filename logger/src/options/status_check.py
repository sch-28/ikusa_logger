import os
from .. import config

def check_health():
    if os.path.exists(os.path.join(os.environ['SystemRoot'], 'System32', 'drivers', 'npcap.sys')):
        print("npcap is installed")
    else:
        print("npcap is not installed")
        
    if config.config.invalid:
        print("config file is invalid")
