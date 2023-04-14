import urllib.request
from .. import config
from . import status_check

def update_config():
    urllib.request.urlretrieve("https://raw.githubusercontent.com/sch-28/combat_logger/main/config.ini", "config.ini")
    config.init()
    if(status_check.is_outdated()):
        print("The config is still outdated. Please update it manually.", flush=True)
    
    