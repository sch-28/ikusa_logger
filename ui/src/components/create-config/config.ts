import { filesystem } from '@neutralinojs/lib';
import ConfigIniParser from 'config-ini-parser';
const config_parser = new ConfigIniParser.ConfigIniParser();

export type Config = {
	patch?: string;
	identifier: string;
	player_one: number;
	player_two: number;
	guild: number;
	kill: number;
};

export type LogType = {
	identifier: string;
	time: string;
	names: { name: string; offset: number }[];
	hex: string;
};

export function get_date() {
	const today = new Date();
	const isoDate = today.toISOString().substr(0, 10);
	return isoDate;
}

export function get_formatted_date(date_string: string) {
	const date = new Date(date_string);
	const formatter = new Intl.DateTimeFormat('de', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	});
	return formatter.format(date).replace(/\//g, '.');
}

export function stringify_config(config: Config) {
	return `[GENERAL]
patch=${config.patch ? get_formatted_date(config.patch) : get_formatted_date(get_date())}
[IP]
server_1 = 20.76.13
server_2 = 20.76.14
[PACKAGE]
identifier = ${config.identifier}
guild = ${config.guild}
player_one = ${config.player_one}
player_two = ${config.player_two}
kill = ${config.kill}
log_length = 600
name_length = 64`;
}

export async function get_config() {
	const raw_config = await filesystem.readFile('config.ini');
	const parsed_config = config_parser.parse(raw_config);
	const config: Config = {
		identifier: parsed_config.get('PACKAGE', 'identifier'),
		player_one: parsed_config.get('PACKAGE', 'player_one'),
		player_two: parsed_config.get('PACKAGE', 'player_two'),
		guild: parsed_config.get('PACKAGE', 'guild'),
		kill: parsed_config.get('PACKAGE', 'kill')
	};
	return config;

}

export async function update_config(config: Config) {
	filesystem.writeFile('config.ini', stringify_config(config));
}
