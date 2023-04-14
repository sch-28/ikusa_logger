import time
from scapy.all import sniff, rdpcap, wrpcap
from time import localtime, strftime
from configparser import ConfigParser
from argparse import ArgumentParser, BooleanOptionalAction
from datetime import date
import os.path
import os

parser = ArgumentParser()
parser.add_argument("-f", "--file", dest="filename",
                    help="Instead of sniffing for bdo packages, it will use the given *.pcap file", metavar="FILE")
parser.add_argument("-o", "--output",
                    default=f"{date.today()}.log",
                    help="custom output file")
parser.add_argument("-r", "--record",
                    help="Record all of BDO's traffic and save it to a pcap file", action= BooleanOptionalAction)
parser.add_argument("-s", "--status",
                    help="Check the status of all requirements", action= BooleanOptionalAction)


args = parser.parse_args()

# checks if pcap file exists
if args.filename != None and not os.path.isfile(args.filename):
    print("Invalid file", flush=True)
    exit()

st=os.stat('./config.ini')    
days_since_modified = (time.time() - st.st_mtime)/60/60/24

if days_since_modified > 7:
    print("The config file is older than 7 days. It might not work anymore.", flush=True)

# load config
config_parser = ConfigParser()
config_parser.read('config.ini')
config = dict(config_parser)

# get ip addresses
ips = list((config["IP"]).values())

# get package informations
package_config = config["PACKAGE"]
identifier = package_config["identifier"]
guild_offset = int(package_config["guild"])
player_one_offset = int(package_config["player_one"])
player_two_offset = int(package_config["player_two"])
kill_offset = int(package_config["kill"])
log_length = int(package_config["log_length"])
name_length = int(package_config["name_length"])

def dec(bytes):
    message = str(bytes, "latin-1")
    message = message.replace("\x00", "")
    return message


def extract_string(hex, offset, length):
    if hex[offset:offset+2] == "00":
        return -1
    try:
        length = min(len(hex)-offset, length)
        if length < 0 : 
            raise ValueError('Package too short')
            
        return dec(bytes.fromhex(hex[offset:offset+length]))
    except ValueError as e:
        print(e, flush=True)
        return -1


last_payload = ""
def package_handler(package):
    
    global last_payload   
    
    if "IP" not in package:
        return
    
    package_src = package["IP"].src
    
    # checks if the package derives from bdo
    is_bdo_ip = len(([ip for ip in ips if ip in package_src])) > 0

    # chckes if the packages comes from a tcp stream
    uses_tcp =  "TCP" in package and hasattr(package["TCP"].payload, "load")
    if is_bdo_ip and uses_tcp:
        
        if args.record:
            wrpcap(args.output+".pcap", package, append=True)

        # loads the payload as raw hex
        payload = bytes(package["TCP"].payload).hex()
        
        while last_payload != "" or identifier in payload:
            # combines previous payload with new one
            payload = last_payload + payload
            
            # get starting position for the combat log 
            start_index = payload.index(identifier)
            
            # remove unnecessary information 
            payload = payload[start_index:]
           
            # if the combat log is not complete 
            if log_length > len(payload):
                # save payload for next package
                last_payload = payload
                return
           
            # extract log information
            timestamp = strftime("%I:%M:%S",localtime(int(package.time)))
            guild = extract_string(payload, guild_offset, name_length)
            player_one = extract_string(payload, player_one_offset, name_length)
            player_two = extract_string(payload, player_two_offset,name_length)
            is_kill = payload[kill_offset: kill_offset+1] == "1"
            
            
            log = ""
            if(is_kill):
                log = f"[{timestamp}] {player_one} has killed {player_two} from {guild}"
            else:
                log = f"[{timestamp}] {player_one} died to {player_two} from {guild}"

            print(log, flush=True)
            with open(args.output, "a") as file:
                try:
                    file.write(log + "\n")
                except UnicodeEncodeError as error:
                    print(error, flush=True)

            payload = payload[len(identifier):]
            # reset ladst_payload
            last_payload = ""
        

         
if args.filename:
    print("Reading " + args.filename, flush=True)
    if os.name == "nt":
        print("Loading file into ram. This may take a while.", flush=True)
        cap = rdpcap(args.filename)
        index = 0
        for package in cap:
            package_handler(package)
            if index % 10000 == 0:
                print(f"{index}/{len(cap)} packages analyzed.", flush=True)
            index += 1
    else:
        sniff(offline=args.filename, filter="tcp", prn=package_handler, store=0)
        
    print(f"Logs saved under: {args.output}\nYou can close this window now.", flush=True)
else:
    print("Reading Network...", flush=True)  
    sniff(filter="tcp", prn=lambda x: package_handler(x), store=0)          

