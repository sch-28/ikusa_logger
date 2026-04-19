<script lang="ts">
	import VirtualList from '@sveltejs/svelte-virtual-list';
	import { open_save_location } from '../../logic/file';
	import LoadingIndicator from '../../svelte-ui/elements/loading-indicator.svelte';
	import {
		get_date,
		get_formatted_date,
		calculate_kd,
		type Log
	} from './config';
	import { filesystem, os, storage } from '@neutralinojs/lib';
	import { ModalManager } from '../../svelte-ui/modal/modal-store';
	import Select from './select.svelte';
	import { dev } from '$app/environment';
	import Button from '../../svelte-ui/elements/button.svelte';
	import GuildInfos from './guild-infos.svelte';
	import { onMount } from 'svelte';

	export let logs: Log[];
	export let height = 155;
	export let loading = false;

	const personal_stats_storage_key = 'personal_family_name';
	let personal_family_name = '';

	let player_one_index = 0;
	let player_two_index = 1;
	let guild_index = 2;

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

	function get_logs_string() {
		return logs
			.map((log) => {
				const remaining_indicies = [0, 1, 2, 3, 4].filter(
					(i) => i !== player_one_index && i !== player_two_index && i !== guild_index
				);
				const remaining_names = remaining_indicies.map((i) => log.names[i]);
				const characters = ` (${remaining_names.join(',')})`;
				return `[${log.time}] ${log.names[player_one_index]} ${
					log.kill ? 'has killed' : 'died to'
				} ${log.names[player_two_index]} from ${log.names[guild_index]}${characters}`;
			})
			.join('\n');
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
		const name = log.names[player_one_index];
		if (!players.includes(name)) {
			players.push(name);
		}
		return players;
	}, [] as string[]).length;

	$: enemy_count = logs.reduce((players, log) => {
		const name = log.names[player_two_index];
		if (!players.includes(name)) {
			players.push(name);
		}
		return players;
	}, [] as string[]).length;

	$: alliance_overview = logs.reduce(
		(acc, log) => {
			if (log.kill) {
				acc.own.kills += 1;
				acc.enemy.deaths += 1;
			} else {
				acc.own.deaths += 1;
				acc.enemy.kills += 1;
			}
			return acc;
		},
		{
			own: { kills: 0, deaths: 0 },
			enemy: { kills: 0, deaths: 0 }
		}
	);

	$: personal_stats = logs.reduce(
		(acc, log) => {
			if (!personal_family_name.trim()) {
				return acc;
			}
			const killer = log.kill ? log.names[player_one_index] : log.names[player_two_index];
			const victim = log.kill ? log.names[player_two_index] : log.names[player_one_index];
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
		storage.setData(personal_stats_storage_key, personal_family_name).catch(() => null);
	}

	function handle_personal_family_name_input(e: Event) {
		update_personal_family_name((e.currentTarget as HTMLInputElement).value);
	}

	onMount(async () => {
		personal_family_name = await storage.getData(personal_stats_storage_key).catch(() => '');
	});
</script>

{#if logs.length > 0}
	<span class="absolute top-2 left-0 right-0 text-center text-gray-400 text-sm"
		>Adjust the Logs to: <b>Family-Name-1</b> kills/died to
		<b>Family-Name-2</b> from <b>Guild</b></span
	>
{/if}
<div class="flex flex-col gap-2 items-center w-full relative">
	<div class="flex gap-1 items-center justify-start w-full">
		<p class="text-xs sm:text-sm text-gray-300">{logs.length} logs</p>
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
							logs: logs,
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
						options={log.names}
						selected_value={player_one_index}
						on_change={(e) => update_names('player_one', e)}
					/>
					<div class="flex justify-center items-center w-16">
						{#if log.kill}
							<p class="self-center text-submarine-500">killed</p>
						{:else}
							<p class="self-center text-red-500">died to</p>
						{/if}
					</div>
					<Select
						options={log.names}
						selected_value={player_two_index}
						on_change={(e) => update_names('player_two', e)}
					/>
					<p class="text-sm text-gray-400">from</p>
					<Select
						options={log.names}
						selected_value={guild_index}
						on_change={(e) => update_names('guild', e)}
					/>
				</div>
			</VirtualList>
		{/key}
	</div>
	<div class="flex gap-2">
		<Button class="w-32" on:click={upload} {disabled}>Upload</Button>
		<Button class="w-32" on:click={save_logs} color="secondary" {disabled}>Save</Button>
	</div>
</div>
