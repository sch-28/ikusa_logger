from .. import parser
from scapy.all import sniff


def record(output):
    print("Recording Network...", flush=True)
    sniff(filter="tcp", prn=lambda x: parser.package_handler(
        x, output, True), store=0)
