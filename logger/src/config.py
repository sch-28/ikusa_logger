from configparser import ConfigParser


class Config (object):
    def __init__(self, filename="config.ini"):
        self.config_parser = ConfigParser()
        self.config_parser.read(filename)
        self.config = dict(self.config_parser)
        
        if self.config.get("PACKAGE") == None:
            self.invalid = True
            print("Invalid config file", flush=True)
            return
        
        # get ip addresses
        self.ips = list((self.config["IP"]).values())

        # get patch date
        self.patch = self.config['GENERAL']['patch']

        # get package informations
        self.package_config = self.config["PACKAGE"]
        self.identifier = self.package_config["identifier"]
        self.guild_offset = int(self.package_config["guild"])
        self.player_one_offset = int(self.package_config["player_one"])
        self.player_two_offset = int(self.package_config["player_two"])
        self.kill_offset = int(self.package_config["kill"])
        self.log_length = int(self.package_config["log_length"])
        self.name_length = int(self.package_config["name_length"])
        

    def get_ips(self):
        return self.ips

    def get_identifier(self):
        return self.identifier

    def get_guild_offset(self):
        return self.guild_offset

    def get_player_one_offset(self):
        return self.player_one_offset

    def get_player_two_offset(self):
        return self.player_two_offset

    def get_kill_offset(self):
        return self.kill_offset

    def get_log_length(self):
        return self.log_length

    def get_name_length(self):
        return self.name_length


def init(filename="config.ini"):
    global config
    config = Config(filename)
    return config