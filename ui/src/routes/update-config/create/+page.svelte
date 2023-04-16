<script lang="ts">
	import VirtualList from '@sveltejs/svelte-virtual-list';
	import { start_logger, type LoggerCallback } from '../../../logic/logger-wrapper';
	import { open_file } from '../../../logic/open-file';
	import Button from '../../../svelte-ui/elements/button.svelte';
	import LoadingIndicator from '../../../svelte-ui/elements/loading-indicator.svelte';
	import Icon from '../../../svelte-ui/elements/icon.svelte';
	import GiBroadsword from 'svelte-icons/gi/GiBroadsword.svelte';
	import GiSkullCrack from 'svelte-icons/gi/GiSkullCrack.svelte';
	import MdDelete from 'svelte-icons/md/MdDelete.svelte';
	import Select from './select.svelte';
	import { find_all_indicies } from '../../../svelte-ui/util';

	type LogType = {
		identifier: string;
		time: string;
		names: { name: string; offset: number }[];
		hex: string;
	};

	let logs: LogType[] = [];
	let player_one_index = 0;
	let player_two_index = 1;
	let guild_index = 2;

	let possible_kill_offsets: string[] = [];
	let kill_offset = 0;

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
		}
	}

	const logger_callback: LoggerCallback = (data, status) => {
		if (status === 'running') {
			const d = data.split(',');
			if (d.length === 8) {
				logs.push({
					identifier: d[0],
					time: d[1],
					names: d.slice(2, 7).map((name) => {
						const split = name.split(' ');
						return { name: split[0], offset: +split[1] };
					}),
					hex: d[7]
				});
				logs = logs;
			}
		} else if (status === ('error' as any)) {
			console.error(data);
		} else if (status === 'terminated') {
			state = 'loaded';
			console.log(logs);
			possible_kill_offsets = find_kill_offset(logs).map((offset) => offset.toString());
		}
	};

	async function open_pcap() {
		const file = await open_file();
		start_logger(logger_callback, 'analyze', '-f ' + file);
		state = 'loading';
	}

	let state: 'loading' | 'loaded' | 'live' | 'idle' = 'idle';
</script>

<div class="flex flex-col gap-2 items-center w-full">
	{#if state === 'idle'}
		<p>How do you want to update the config?</p>
		<Button class="w-32" on:click={open_pcap}>Open pcap</Button>
		<Button class="w-32">Live</Button>
	{:else if state === 'loading'}
		<LoadingIndicator />
	{:else if state === 'loaded'}
		<div class="flex gap-1 items-center justify-start w-full px-1">
			<p class="w-16">Kill offset:</p>
			<Select options={possible_kill_offsets} bind:selected_value={kill_offset} />
		</div>
		<div class="h-[185px] w-full overflow-auto">
			<VirtualList items={logs} let:item={log}>
				<div class="flex gap-1 group py-1 items-center px-1">
					<p class="text-sm text-gray-400 w-16">{log.time}:</p>
					<!-- <p>{log.names[player_one_index].name}</p> -->
					<Select
						options={log.names.map((n) => n.name)}
						selected_value={player_one_index}
						on_change={(e) => update_names('player_one', e)}
					/>
					<div class="flex justify-center items-center w-10">
						{#if log.hex[possible_kill_offsets[kill_offset]] === '1'}
							<p class="self-center text-submarine-500">killed</p>
						{:else}
							<p class="self-center text-red-500">died to</p>
						{/if}
					</div>
					<!-- <p>{log.names[player_two_index].name}</p> -->
					<Select
						options={log.names.map((n) => n.name)}
						selected_value={player_two_index}
						on_change={(e) => update_names('player_two', e)}
					/>
					<!-- <p class="text-navy-400">[{log.names[guild_index].name}]</p> -->
					<Select
						options={log.names.map((n) => n.name)}
						selected_value={guild_index}
						on_change={(e) => update_names('guild', e)}
					/>
					<div class="ml-auto hidden group-hover:flex items-center">
						<button on:click={() => null}>
							<Icon icon={MdDelete} class="self-center text-red-500" />
						</button>
					</div>
				</div>
			</VirtualList>
		</div>
		<Button class="w-32" on:click={() => (state = 'idle')}>Save</Button>
	{:else if state === 'live'}
		<p>Config is being updated</p>
		<Button class="w-32" on:click={() => (state = 'idle')}>Back</Button>
	{/if}
</div>
