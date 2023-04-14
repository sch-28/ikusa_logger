from src import config
from src.options import status_check, open, sniff, record, update_config

import time
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
parser.add_argument("-u", "--update",
                    help="Update the config", action= BooleanOptionalAction)


args = parser.parse_args()

config.init("config.ini")

if args.status:
    status_check.check_health()
    exit()
elif args.record:
    record.record(args.output)
    exit()
elif args.filename != None:
    open.open_pcap(args.filename, args.output)
    exit()
elif args.update:
    update_config.update_config("config.ini")
else:
    sniff.start_sniff(args.output)
    exit()
    
    
