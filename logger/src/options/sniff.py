from .. import config, parser
from scapy.all import sniff

def start_sniff(output):
    print("Reading Network...", flush=True)  
    sniff(filter="tcp", prn=lambda x: parser.package_handler(x,output), store=0)       
 
