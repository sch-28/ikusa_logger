<script lang="ts">
	import VirtualList from '@sveltejs/svelte-virtual-list';
	import { open_save_location } from '../../logic/file';
	import LoadingIndicator from '../../svelte-ui/elements/loading-indicator.svelte';
	import {
		get_date,
		get_formatted_date,
		calculate_kd,
		PERSONAL_FAMILY_NAME_KEY,
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

	const personal_stats_storage_key = PERSONAL_FAMILY_NAME_KEY;
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

	$: personal_stats = (() => {
		const name = personal_family_name.trim();
		if (!name) return { kills: 0, deaths: 0 };
		return logs.reduce(
			(acc, log) => {
				const killer = log.kill ? log.names[player_one_index] : log.names[player_two_index];
				const victim = log.kill ? log.names[player_two_index] : log.names[player_one_index];
				if (killer === name) acc.kills += 1;
				if (victim === name) acc.deaths += 1;
				return acc;
			},
			{ kills: 0, deaths: 0 }
		);
	})();

	function update_personal_family_name(value: string) {
		personal_family_name = value;
		storage.setData(personal_stats_storage_key, personal_family_name).catch(() => null);
	}

	function handle_personal_family_name_input(e: Event) {
		update_personal_family_name((e.currentTarget as HTMLInputElement).value);
	}

	$: ownKillPct = (() => {
		const t = alliance_overview.own.kills + alliance_overview.own.deaths;
		return t > 0 ? (alliance_overview.own.kills / t) * 100 : 0;
	})();
	$: enemyKillPct = (() => {
		const t = alliance_overview.enemy.kills + alliance_overview.enemy.deaths;
		return t > 0 ? (alliance_overview.enemy.kills / t) * 100 : 0;
	})();

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
<div class="flex flex-col gap-2 items-center w-full h-full relative">
	<div class="flex gap-1 items-center justify-start w-full">
		<p class="text-xs sm:text-sm text-gray-300">{logs.length} logs</p>
	</div>
	<div class="w-full flex gap-2 pb-14" style="height: {height}px;">
		<div class="w-[550px] flex-shrink-0 rounded-lg border border-gray-700 overflow-hidden p-2 relative h-full">
		{#if loading && logs.length === 0}
			<div class="absolute inset-0 flex justify-center items-center mb-14">
				<LoadingIndicator />
			</div>
		{:else if logs.length === 0 && !loading}
			<div class="absolute inset-0 flex items-center justify-center">
				<p class="text-gray-400">Waiting for logs...</p>
			</div>
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
		<!-- Stats panel fills the remaining right space -->
		<div class="flex-1 flex flex-col gap-2 text-xs h-full overflow-y-auto">
			<div class="rounded-lg border border-gray-700 p-2.5">
				<div class="flex items-center justify-between gap-1 mb-1.5">
					<p class="uppercase tracking-wide text-gray-400">War Overview</p>
					<button
						class="bg-gray-700 px-1.5 py-0.5 rounded"
						on:click={() => {
							ModalManager.open(GuildInfos, {
								logs: logs,
								guild_index,
								player_one_index,
								player_two_index
							});
						}}>Details</button
					>
				</div>
				{#if logs.length === 0}
					<p class="text-gray-500">No logs yet</p>
				{:else}
					<p class="text-gray-400">{own_guild_member_count} vs {enemy_count} players</p>
					<p class="mt-1">
						<span class="text-submarine-500">K {alliance_overview.own.kills}</span>
						<span class="text-gray-500 mx-1">·</span>
						<span class="text-red-500">D {alliance_overview.own.deaths}</span>
						<span class="text-gray-500 mx-1">·</span>
						<span class="font-semibold">{calculate_kd(alliance_overview.own.kills, alliance_overview.own.deaths)}</span>
					</p>
					<p class="text-gray-400 mt-0.5">Enemy K/D: <span class="font-semibold text-foreground-secondary">{calculate_kd(alliance_overview.enemy.kills, alliance_overview.enemy.deaths)}</span></p>
				{/if}
			</div>
			<div class="rounded-lg border border-gray-700 p-2.5">
				<p class="uppercase tracking-wide text-gray-400 mb-1.5">Personal</p>
				<input
					class="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 mb-1.5"
					placeholder="Family name"
					value={personal_family_name}
					on:input={handle_personal_family_name_input}
				/>
				{#if !personal_family_name.trim()}
					<p class="text-gray-500">Enter your family name</p>
				{:else}
					<p>
						<span class="text-submarine-500">K {personal_stats.kills}</span>
						<span class="text-gray-500 mx-1">·</span>
						<span class="text-red-500">D {personal_stats.deaths}</span>
						<span class="text-gray-500 mx-1">·</span>
						<span class="font-semibold">{calculate_kd(personal_stats.kills, personal_stats.deaths)}</span>
					</p>
				{/if}
			</div>
			<div class="rounded-lg border border-gray-700 p-2.5">
				<p class="uppercase tracking-wide text-gray-400 mb-2">K/D Breakdown</p>
				{#if logs.length === 0}
					<p class="text-gray-500">No logs yet</p>
				{:else}
					<div class="mb-3">
						<div class="flex justify-between mb-1">
							<span class="text-gray-400">Your Alliance</span>
							<span class="font-semibold">{calculate_kd(alliance_overview.own.kills, alliance_overview.own.deaths)}</span>
						</div>
						<div class="h-1.5 rounded-full bg-gray-700 overflow-hidden">
							<div class="h-full bg-submarine-500 transition-all" style="width: {ownKillPct}%"></div>
						</div>
						<div class="flex justify-between mt-1 text-gray-500">
							<span class="text-submarine-500">K {alliance_overview.own.kills}</span>
							<span class="text-red-500">D {alliance_overview.own.deaths}</span>
						</div>
					</div>
					<div>
						<div class="flex justify-between mb-1">
							<span class="text-gray-400">Enemy</span>
							<span class="font-semibold">{calculate_kd(alliance_overview.enemy.kills, alliance_overview.enemy.deaths)}</span>
						</div>
						<div class="h-1.5 rounded-full bg-gray-700 overflow-hidden">
							<div class="h-full bg-red-500 transition-all" style="width: {enemyKillPct}%"></div>
						</div>
						<div class="flex justify-between mt-1 text-gray-500">
							<span class="text-submarine-500">K {alliance_overview.enemy.kills}</span>
							<span class="text-red-500">D {alliance_overview.enemy.deaths}</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
	<div class="fixed bottom-4 left-0 right-0 flex gap-2 justify-center">
		<Button class="w-32" on:click={upload} {disabled}>Upload</Button>
		<Button class="w-32" on:click={save_logs} color="secondary" {disabled}>Save</Button>
	</div>
</div>
