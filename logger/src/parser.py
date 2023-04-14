from time import localtime, strftime
from . import config
from scapy.all import wrpcap

def dec(bytes):
    message = str(bytes, "latin-1")
    message = message.replace("\x00", "")
    return message


def extract_string(hex, offset, length):
    if hex[offset:offset+2] == "00":
        return -1
    try:
        length = min(len(hex)-offset, length)
        if length < 0:
            raise ValueError('Package too short')

        return dec(bytes.fromhex(hex[offset:offset+length]))
    except ValueError as e:
        print(e, flush=True)
        return -1


last_payload = ""


def package_handler(package, output, record=False):

    global last_payload

    if "IP" not in package:
        return

    package_src = package["IP"].src

    # checks if the package derives from bdo
    is_bdo_ip = len(([ip for ip in config.config.ips if ip in package_src])) > 0

    # chckes if the packages comes from a tcp stream
    uses_tcp = "TCP" in package and hasattr(package["TCP"].payload, "load")
    if is_bdo_ip and uses_tcp:

        if record:
           wrpcap(output+".pcap", package, append=True)
           return

        # loads the payload as raw hex
        payload = bytes(package["TCP"].payload).hex()

        while last_payload != "" or config.config.identifier in payload:
            # combines previous payload with new one
            payload = last_payload + payload

            # get starting position for the combat log
            start_index = payload.index(config.config.identifier)

            # remove unnecessary information
            payload = payload[start_index:]

            # if the combat log is not complete
            if config.config.log_length > len(payload):
                # save payload for next package
                last_payload = payload
                return

            # extract log information
            timestamp = strftime("%I:%M:%S", localtime(int(package.time)))
            guild = extract_string(payload, config.config.guild_offset, config.config.name_length)
            player_one = extract_string(
                payload, config.config.player_one_offset, config.config.name_length)
            player_two = extract_string(
                payload, config.config.player_two_offset, config.config.name_length)
            is_kill = payload[config.config.kill_offset: config.config.kill_offset+1] == "1"

            log = ""
            if(is_kill):
                log = f"[{timestamp}] {player_one} has killed {player_two} from {guild}"
            else:
                log = f"[{timestamp}] {player_one} died to {player_two} from {guild}"

            print(log, flush=True)
            with open(output, "a") as file:
                try:
                    file.write(log + "\n")
                except UnicodeEncodeError as error:
                    print(error, flush=True)

            payload = payload[len(config.config.identifier):]
            # reset ladst_payload
            last_payload = ""
