<script lang="ts">
	import VirtualList from '@sveltejs/svelte-virtual-list';
	import { open_save_location } from '../../logic/file';
	import LoadingIndicator from '../../svelte-ui/elements/loading-indicator.svelte';
	import IoMdSettings from 'svelte-icons/io/IoMdSettings.svelte';
	import { find_all_indicies } from '../../svelte-ui/util';
	import Button from '../../svelte-ui/elements/button.svelte';
	import Checkbox from '../../svelte-ui/elements/checkbox.svelte';
	import ConfigModal from './config.modal.svelte';
	import {
		update_config,
		type Config,
		type LogType,
		get_date,
		get_formatted_date,
		get_config,
		hexToString
	} from '../../components/create-config/config';
	import { filesystem, os, storage } from '@neutralinojs/lib';
	import { onMount } from 'svelte';
	import { ModalManager } from '../../svelte-ui/modal/modal-store';
	import Icon from '../../svelte-ui/elements/icon.svelte';
	import Select from './select.svelte';
	import { dev } from '$app/environment';
	import GuildInfos from './guild-infos.svelte';

	export let logs: LogType[];
	export let height = 155;
	export let loading = false;

	let possible_name_offsets: { offset: number; count: number }[][] = [];
	let name_indicies: number[] = [0, 0, 0, 0, 0];

	let player_one_index = 0;
	let player_two_index = 1;
	let guild_index = 2;

	let possible_kill_offsets: number[] = [];
	let kill_index = 0;

	let config: Config;
	let auto_scroll = true;
	const personal_stats_cache_key = 'ikusa_logger_personal_family_name';
	const personal_stats_storage_key = 'personal_family_name';
	let personal_family_name = '';

	onMount(async () => {
		config = await get_config();
		possible_kill_offsets = [config.kill];
		possible_name_offsets = [
			[{ offset: config.player_one, count: 1 }],
			[{ offset: config.player_two, count: 1 }],
			[{ offset: config.guild, count: 1 }]
		];
		auto_scroll = config.auto_scroll;
		const stored_family_name = await storage
			.getData(personal_stats_storage_key)
			.catch(() => '');
		personal_family_name = stored_family_name || localStorage.getItem(personal_stats_cache_key) || '';
	});

	$: {
		auto_scroll;
		config && update_config({ ...config, auto_scroll });
	}

	$: {
		if (logs.length > 0) {
			logs_changed();
		} else {
			scroll(true);
		}
	}

	function logs_changed() {
		auto_scroll && setTimeout(scroll);

		if (logs.length < 50 || logs.length % 100 === 0) {
			possible_kill_offsets = find_kill_offset(logs).map((offset) => offset);
			calculate_config();
		}
	}

	async function calculate_config() {
		possible_name_offsets = possible_name_offsets.map((list) =>
			list.map((n) => ({ ...n, count: 0 }))
		);
		// get all offsets for each name and count how many times they appear
		for (const log of logs) {
			for (let i = 0; i < log.names.length; i++) {
				const name = log.names[i];
				if (possible_name_offsets[i]) {
					const index = possible_name_offsets[i].findIndex((n) => n.offset === name.offset);
					if (index !== -1) {
						possible_name_offsets[i][index].count++;
					} else {
						possible_name_offsets[i].push({ offset: name.offset, count: 1 });
					}
				} else {
					possible_name_offsets[i] = [{ offset: name.offset, count: 1 }];
				}
			}
		}

		// sort by number of times they appear
		for (let i = 0; i < possible_name_offsets.length; i++) {
			possible_name_offsets[i] = possible_name_offsets[i].sort((a, b) => b.count - a.count);
		}

		//get all identifiers and count them
		const identifiers = new Map<string, number>();
		for (const log of logs) {
			if (identifiers.has(log.identifier)) {
				identifiers.set(log.identifier, identifiers.get(log.identifier)! + 1);
			} else {
				identifiers.set(log.identifier, 1);
			}
		}
		// get the most common identifier
		const identifier = Array.from(identifiers.entries())
			.sort((a, b) => b[1] - a[1])
			.map((a) => a[0])[0];

		await update_config_wrapper(identifier);
	}

	async function update_config_wrapper(identifier?: string) {
		config = {
			...config,
			patch: get_date(),
			identifier: identifier || config.identifier,
			player_one: possible_name_offsets[player_one_index][name_indicies[player_one_index]].offset,
			player_two: possible_name_offsets[player_two_index][name_indicies[player_two_index]].offset,
			guild: possible_name_offsets[guild_index][name_indicies[guild_index]].offset,
			kill: possible_kill_offsets[kill_index]
		};
		await update_config(config);
	}

	$: get_name_options = (i: number, log: LogType) => {
		const names = possible_name_offsets
			/* .filter((_, index) => index !== i) */
			.map((list, index) => {
				const selected = name_indicies[index];
				return hexToString(log.hex.slice(list[selected].offset, list[selected].offset + 64))
					.replaceAll('\0', '')
					.replaceAll(' ', '');
			});
		return names;
	};

	$: get_name = (i: number, log: LogType) => {
		const list = possible_name_offsets[i];
		const selected = name_indicies[i];
		return hexToString(log.hex.slice(list[selected].offset, list[selected].offset + 64))
			.replaceAll('\0', '')
			.replaceAll(' ', '');
	};

	function find_kill_offset(logs: LogType[]) {
		const all_indicies: number[] = [];
		for (const log of logs) {
			let indicies = find_all_indicies(log.hex, '01');
			indicies = indicies.filter((index) =>
				log.names.every((n) => index > n.offset + 64 || index < n.offset)
			);
			all_indicies.push(...indicies);
		}
		const possible_kill_offsets = new Map<number, number>();
		for (const log of logs) {
			for (const index of all_indicies) {
				if (log.hex.slice(index, index + 2) === '00') {
					if (possible_kill_offsets.has(index)) {
						possible_kill_offsets.set(index, possible_kill_offsets.get(index)! + 1);
					} else {
						possible_kill_offsets.set(index, 1);
					}
				}
			}
		}
		// creates array sorted by value
		const sorted = Array.from(possible_kill_offsets.entries())
			.sort((a, b) => b[1] - a[1])
			.map((a) => a[0] + 1);

		return sorted;
	}

	function update_names(target: 'player_one' | 'player_two' | 'guild', e: Event) {
		if (target === 'player_one') {
			const new_value = parseInt((e.target as HTMLSelectElement).value);
			if (new_value === player_two_index) {
				player_two_index = player_one_index;
			} else if (new_value === guild_index) {
				guild_index = player_one_index;
			}
			player_one_index = new_value;
		} else if (target === 'player_two') {
			const new_value = parseInt((e.target as HTMLSelectElement).value);
			if (new_value === player_one_index) {
				player_one_index = player_two_index;
			} else if (new_value === guild_index) {
				guild_index = player_two_index;
			}
			player_two_index = new_value;
		} else if (target === 'guild') {
			const new_value = parseInt((e.target as HTMLSelectElement).value);
			if (new_value === player_one_index) {
				player_one_index = guild_index;
			} else if (new_value === player_two_index) {
				player_two_index = guild_index;
			}
			guild_index = new_value;
		}
	}

	function scroll(top?: boolean) {
		const container = document.querySelector('svelte-virtual-list-viewport');
		if (container && !top) {
			container.scrollTop = container.scrollHeight;
		} else if (container) {
			container.scrollTop = 0;
		}
	}

	function get_logs_string() {
		let output = '';

		for (const log of logs) {
			let characters = '';

			const player_one_name = get_name(player_one_index, log);
			const player_two_name = get_name(player_two_index, log);
			const guild_name = get_name(guild_index, log);
			if (config.include_characters) {
				const remaining_indicies = [0, 1, 2, 3, 4].filter(
					(i) => i !== player_one_index && i !== player_two_index && i !== guild_index
				);
				const remaining_names = remaining_indicies.map((i) => get_name(i, log));
				characters = ` (${remaining_names.join(',')})`;
			}

			if (log.hex[possible_kill_offsets[kill_index]] === '1')
				output += `[${log.time}] ${player_one_name} has killed ${player_two_name} from ${guild_name}${characters}\n`;
			else
				output += `[${log.time}] ${player_one_name} died to ${player_two_name} from ${guild_name}${characters}\n`;
		}

		return output;
	}

	async function save_logs() {
		const path = await open_save_location(get_formatted_date(get_date()) + '.log');
		filesystem.writeFile(path, get_logs_string());
	}

	async function upload() {
		const website = dev ? 'http://localhost:5174' : 'https://ikusa.site';
		const result = await fetch(website + '/api/create', {
			method: 'POST',
			body: get_logs_string(),
			headers: {
				'Content-Type': 'text/plain'
			}
		});

		if (result.status === 200) {
			const id = (await result.json()).id;
			os.open(`${website}/wars?id=${id}`);
		} else {
			console.error(result);
		}
	}

	$: disabled = logs.length === 0 || loading;

	$: own_guild_member_count = logs.reduce((players, log) => {
		const name = log.names[player_one_index].name;
		if (!players.includes(name)) {
			players.push(name);
		}
		return players;
	}, [] as string[]).length;

	$: enemy_count = logs.reduce((players, log) => {
		const name = log.names[player_two_index].name;
		if (!players.includes(name)) {
			players.push(name);
		}
		return players;
	}, [] as string[]).length;

	$: alliance_overview = logs.reduce(
		(acc, log) => {
			const is_kill = log.hex[possible_kill_offsets[kill_index]] === '1';
			const own_member = log.names[player_one_index]?.name || '';
			const enemy_member = log.names[player_two_index]?.name || '';
			if (own_member) acc.own.members.add(own_member);
			if (enemy_member) acc.enemy.members.add(enemy_member);
			if (is_kill) {
				acc.own.kills += 1;
				acc.enemy.deaths += 1;
			} else {
				acc.own.deaths += 1;
				acc.enemy.kills += 1;
			}
			return acc;
		},
		{
			own: { members: new Set<string>(), kills: 0, deaths: 0 },
			enemy: { members: new Set<string>(), kills: 0, deaths: 0 }
		}
	);

	function calculate_kd(kills: number, deaths: number) {
		if (deaths === 0) {
			return kills > 0 ? kills.toFixed(2) : '0.00';
		}
		return (kills / deaths).toFixed(2);
	}

	function parse_log_stats(log: LogType) {
		if (
			possible_kill_offsets.length === 0 ||
			possible_kill_offsets[kill_index] === undefined ||
			!possible_name_offsets[player_one_index] ||
			!possible_name_offsets[player_two_index]
		) {
			return { killer: '', victim: '' };
		}
		const is_kill = log.hex[possible_kill_offsets[kill_index]] === '1';
		const killer = is_kill ? get_name(player_one_index, log) : get_name(player_two_index, log);
		const victim = is_kill ? get_name(player_two_index, log) : get_name(player_one_index, log);
		return { killer, victim };
	}

	$: personal_stats = logs.reduce(
		(acc, log) => {
			if (!personal_family_name.trim()) {
				return acc;
			}
			const { killer, victim } = parse_log_stats(log);
			if (killer === personal_family_name.trim()) {
				acc.kills += 1;
			}
			if (victim === personal_family_name.trim()) {
				acc.deaths += 1;
			}
			return acc;
		},
		{ kills: 0, deaths: 0 }
	);

	function update_personal_family_name(value: string) {
		personal_family_name = value;
		localStorage.setItem(personal_stats_cache_key, personal_family_name);
		storage.setData(personal_stats_storage_key, personal_family_name).catch(() => null);
	}

	function handle_personal_family_name_input(e: Event) {
		update_personal_family_name((e.currentTarget as HTMLInputElement).value);
	}
</script>

{#if logs.length > 0}
	<span class="absolute top-2 left-0 right-0 text-center text-gray-400 text-sm"
		>Adjust the Logs to: <b>Family-Name-1</b> kills/died to
		<b>Family-Name-2</b> from <b>Guild</b></span
	>
{/if}
<div class="flex flex-col gap-2 items-center w-full relative">
	<div class="flex gap-1 items-center justify-start w-full px-1">
		<p class="text-xs sm:text-sm text-gray-300">{logs.length} logs</p>
		<div class="ml-2">
			<Checkbox bind:checked={auto_scroll} />
			<span>Auto scroll</span>
		</div>
		<button
			class="ml-auto"
			on:click={() =>
				ModalManager.open(ConfigModal, {
					config: config,
					options: {
						possible_kill_offsets,
						possible_name_offsets,
						name_indicies,
						player_one_index,
						player_two_index,
						guild_index,
						kill_index
					},
					onChange: async (options) => {
						possible_kill_offsets = options.possible_kill_offsets;
						possible_name_offsets = options.possible_name_offsets;
						name_indicies = options.name_indicies;
						player_one_index = options.player_one_index;
						player_two_index = options.player_two_index;
						guild_index = options.guild_index;
						kill_index = options.kill_index;
						config.include_characters = options.include_characters;
						await update_config_wrapper();
					}
				})}
		>
			<Icon icon={IoMdSettings} />
		</button>
	</div>
	<div
		class="w-full bg-gray-800/60 rounded-lg p-2.5 sm:p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm"
	>
		<div class="rounded-lg border border-gray-700 p-3">
			<div class="flex items-center justify-between gap-2">
				<p class="text-xs uppercase tracking-wide text-gray-400">LIVE WAR OVERVIEW</p>
				<button
					class="bg-gray-700 px-2 py-1 rounded-md text-xs"
					on:click={() => {
						ModalManager.open(GuildInfos, {
							logs: logs.map((l) => ({
								names: l.names.map((n) => n.name),
								kill: l.hex[possible_kill_offsets[kill_index]] === '1'
							})),
							guild_index,
							player_one_index,
							player_two_index
						});
					}}>Alliance overview</button
				>
			</div>
			<div class="mt-2 grid grid-cols-1 gap-1.5">
				<p>
					Count: <span class="font-semibold">{own_guild_member_count}</span> vs.
					<span class="font-semibold">{enemy_count}</span>
				</p>
				<p>
					<span class="text-submarine-500">K: {alliance_overview.own.kills}</span>
					<span class="mx-2 text-red-500">D: {alliance_overview.own.deaths}</span>
				</p>
				<p>
					K/D:
					<span class="font-semibold">{calculate_kd(alliance_overview.own.kills, alliance_overview.own.deaths)}</span>
					vs.
					<span class="font-semibold">{calculate_kd(alliance_overview.enemy.kills, alliance_overview.enemy.deaths)}</span>
				</p>
			</div>
		</div>
		<div class="rounded-lg border border-gray-700 p-3">
			<p class="text-xs uppercase tracking-wide text-gray-400">Personal player stats</p>
			<input
				class="mt-2 w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs sm:text-sm"
				placeholder="Family name"
				value={personal_family_name}
				on:input={handle_personal_family_name_input}
			/>
			<p class="mt-2 text-sm">
				<span class="text-submarine-500">K: {personal_stats.kills}</span>
				<span class="mx-2 text-red-500">D: {personal_stats.deaths}</span>
				<span>K/D: {calculate_kd(personal_stats.kills, personal_stats.deaths)}</span>
			</p>
		</div>
	</div>
	<div class="w-full overflow-auto flex flex-col" style="height: {height}px;">
		{#if loading && logs.length === 0}
			<div class="absolute inset-0 flex justify-center items-center mb-14">
				<LoadingIndicator />
			</div>
		{:else if logs.length === 0 && !loading}
			<p class="text-center text-gray-400">Waiting for logs...</p>
		{/if}
		{#key logs.length === 0}
			<VirtualList items={logs} let:item={log}>
				<div class="flex gap-2 group py-1 items-center px-1">
					<p class="text-sm text-gray-400">{log.time}</p>
					<!-- <p>{log.names[player_one_index].name}</p> -->
					<Select
						options={get_name_options(player_one_index, log)}
						selected_value={player_one_index}
						on_change={(e) => update_names('player_one', e)}
					/>
					<div class="flex justify-center items-center w-16">
						{#if log.hex[possible_kill_offsets[kill_index]] === '1'}
							<p class="self-center text-submarine-500">killed</p>
						{:else}
							<p class="self-center text-red-500">died to</p>
						{/if}
					</div>
					<Select
						options={get_name_options(player_two_index, log)}
						selected_value={player_two_index}
						on_change={(e) => update_names('player_two', e)}
					/>
					<p class="text-sm text-gray-400">from</p>
					<Select
						options={get_name_options(guild_index, log)}
						selected_value={guild_index}
						on_change={(e) => update_names('guild', e)}
					/>
					<!-- <div class="ml-auto hidden group-hover:flex items-center">
						<button on:click={() => null}>
							<Icon icon={MdDelete} class="self-center text-red-500" />
						</button>
					</div> -->
				</div>
			</VirtualList>
		{/key}
	</div>
	<div class="flex gap-2">
		<Button class="w-32" on:click={upload} {disabled}>Upload</Button>
		<Button class="w-32" on:click={save_logs} color="secondary" {disabled}>Save</Button>
	</div>
</div>
