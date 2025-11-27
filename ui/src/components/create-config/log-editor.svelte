<script lang="ts">
	import VirtualList from '@sveltejs/svelte-virtual-list';
	import { open_save_location } from '../../logic/file';
	import IoMdInfo from 'svelte-icons/io/IoIosInformationCircleOutline.svelte';
	import LoadingIndicator from '../../svelte-ui/elements/loading-indicator.svelte';
	import {
		get_date,
		get_formatted_date,
		type Log
	} from './config';
	import { filesystem, os } from '@neutralinojs/lib';
	import { ModalManager } from '../../svelte-ui/modal/modal-store';
	import Select from './select.svelte';
	import { dev } from '$app/environment';
	import Button from '../../svelte-ui/elements/button.svelte';
	import GuildInfos from './guild-infos.svelte';
	import Icon from '../../svelte-ui/elements/icon.svelte';

	export let logs: Log[];
	export let height = 155;
	export let loading = false;


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
</script>

{#if logs.length > 0}
	<span class="absolute top-2 left-0 right-0 text-center text-gray-400 text-sm"
		>Adjust the Logs to: <b>Family-Name-1</b> kills/died to
		<b>Family-Name-2</b> from <b>Guild</b></span
	>
{/if}
<div class="flex flex-col gap-2 items-center w-full relative">
	<div class="flex gap-1 items-center justify-start w-full">
		<!-- <p class="w-16">Kill offset:</p>-->
		<!-- <Select options={possible_kill_offsets} bind:selected_value={kill_index} /> -->
		<button
			on:click={() => {
				ModalManager.open(GuildInfos, {
					logs: logs,
					guild_index,
                    player_one_index,
                    player_two_index,
				});
			}}
            class="flex cursor-pointer items-end gap-2 bg-gray-700 p-2 rounded-lg"
		>
		{logs.length} Logs | 
			({own_guild_member_count} vs. {enemy_count}) 
		</button>
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
