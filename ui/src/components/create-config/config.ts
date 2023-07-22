import { clipboard, storage } from '@neutralinojs/lib';

export type Config = {
	patch: string;
	identifier: string;
	player_one: number;
	player_two: number;
	guild: number;
	kill: number;
	auto_scroll: boolean;
	include_characters: boolean;
	all_interfaces: boolean;
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

/* 
export async function get_config() {
	const config_parser = new ConfigIniParser.ConfigIniParser();
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
} */

export async function update_config(config: Config) {
	await storage.setData('config', JSON.stringify(config));
	return config;
}

export async function get_config(): Promise<Config> {
	const config = await storage.getData('config').catch((e) => console.error(e));
	if (config) {
		const parsed: Config = JSON.parse(config);
		if (parsed.include_characters === undefined) {
			parsed.include_characters = true;
		}

		return parsed;
	} else {
		return {
			identifier: '',
			player_one: 0,
			player_two: 0,
			guild: 0,
			kill: 0,
			patch: '',
			auto_scroll: true,
			include_characters: true,
			all_interfaces: true
		};
	}
}

export function copy_to_clipboard(config: Config) {
	clipboard.writeText(stringify_config(config));
}

export function hexToString(hex: string) {
	let string = '';
	for (let i = 0; i < hex.length; i += 2) {
		string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	}
	return string;
}
