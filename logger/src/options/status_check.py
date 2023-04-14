import os
from datetime import datetime, timedelta
from .. import config


def is_outdated():
    date = datetime.strptime(config.config.patch, "%d.%m.%Y")
    now = datetime.now()
    delta = now - date
    return delta > timedelta(days=7)


def check_health():
    if os.path.exists(os.path.join(os.environ['SystemRoot'], 'System32', 'drivers', 'npcap.sys')):
        print("Npcap is installed", flush=True)
    else:
        print("Npcap is not installed", flush=True)

    if config.config.invalid:
        print("Could not locate config file or config is invalid", flush=True)
        return

    
    if is_outdated():
        print("The config is older than 7 days. It might not work anymore. Try to update the config by using:\nlogger.exe -u", flush=True)
    else:
        print("The config is up to date.", flush=True)
