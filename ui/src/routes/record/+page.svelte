<script lang="ts">
	import type { Config } from '@sveltejs/kit';
	import VirtualList from '@sveltejs/svelte-virtual-list';

	import IoMdInformationCircleOutline from 'svelte-icons/io/IoMdInformationCircleOutline.svelte';
	import { type LoggerCallback, start_logger } from '../../logic/logger-wrapper';
	import { open_file } from '../../logic/open-file';
	import Icon from '../../svelte-ui/elements/icon.svelte';
	import LoadingIndicator from '../../svelte-ui/elements/loading-indicator.svelte';
	import { ModalManager } from '../../svelte-ui/modal/modal-store';
	import { find_all_indicies } from '../../svelte-ui/util';
	import Button from '../../svelte-ui/elements/button.svelte';
	import Select from '../../components/create-config/select.svelte';
	import ConfigModal from '../../components/create-config/config.modal.svelte';
	import { onMount } from 'svelte';
	import Checkbox from '../../svelte-ui/elements/checkbox.svelte';

	type LogType = {
		identifier: string;
		time: string;
		names: { name: string; offset: number }[];
		hex: string;
	};

	let logs: LogType[] = [
	/* 	{
			identifier: '2021-09-30',
			time: '12:00:00',
			names: [
				{ name: 'player_one', offset: 0 },
				{ name: 'player_two', offset: 0 },
				{ name: 'guild', offset: 0 }
			],
			hex: '000000'
		} */
	];
	let player_one_index = 0;
	let player_two_index = 1;
	let guild_index = 2;

	let possible_kill_offsets: number[] = [];
	let kill_offset = 0;

	let config: Config;

	let auto_scroll = true;

	$: {
		if (logs.length > 0) {
			config = {
				...config,
				identifier: logs[0].identifier,
				player_one: logs[0].names[player_one_index].offset,
				player_two: logs[0].names[player_two_index].offset,
				guild: logs[0].names[guild_index].offset,
				kill: possible_kill_offsets[kill_offset]
			};
		}
	}

	function on_config_change(new_config: Config) {
		config = new_config;
	}

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

	function scroll() {
		const container = document.querySelector('svelte-virtual-list-viewport');
		if (container) {
			container.scrollTop = container.scrollHeight;
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
				possible_kill_offsets = find_kill_offset(logs).map((offset) => offset);
				auto_scroll && scroll();
			}
		} else if (status === ('error' as any)) {
			console.error(data);
		} else if (status === 'terminated') {
			console.log(logs);
			possible_kill_offsets = find_kill_offset(logs).map((offset) => offset);
		}
	};

	/* 	async function open_pcap() {
		const file = await open_file();
		start_logger(logger_callback, 'analyze', '-f ' + file);
		state = 'loading';
	} */

	onMount(async () => {
		start_logger(logger_callback, 'analyze');
	});
</script>

<div class="flex flex-col gap-2 items-center w-full relative">
	<div class="flex gap-1 items-center justify-start w-full px-1">
		<p class="w-16">Kill offset:</p>
		<Select options={possible_kill_offsets} bind:selected_value={kill_offset} />
		<div class="ml-auto">
			<Checkbox bind:checked={auto_scroll} />
			<span>Auto scroll</span>
		</div>
		<!-- <button
			class="ml-auto"
			on:click={() =>
				config &&
				ModalManager.open(ConfigModal, {
					config: config,
					onChange: on_config_change
				})}
		>
			<Icon icon={IoMdInformationCircleOutline} />
		</button> -->
	</div>
	<div class="h-[155px] w-full overflow-auto flex flex-col">
		{#if logs.length === 0}
			<p class="text-center text-gray-400">Waiting for logs...</p>
		{/if}
		<VirtualList items={logs} let:item={log}>
			<div class="flex gap-2 group py-1 items-center px-1">
				<p class="text-sm text-gray-400">{log.time}</p>
				<!-- <p>{log.names[player_one_index].name}</p> -->
				<Select
					options={log.names.map((n) => n.name)}
					selected_value={player_one_index}
					on_change={(e) => update_names('player_one', e)}
				/>
				<div class="flex justify-center items-center w-16">
					{#if log.hex[possible_kill_offsets[kill_offset]] === '1'}
						<p class="self-center text-submarine-500">killed</p>
					{:else}
						<p class="self-center text-red-500">died to</p>
					{/if}
				</div>
				<Select
					options={log.names.map((n) => n.name)}
					selected_value={player_two_index}
					on_change={(e) => update_names('player_two', e)}
				/>
				<p class="text-sm text-gray-400">from</p>
				<Select
					options={log.names.map((n) => n.name)}
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
	</div>
	<div class="flex gap-2">
		<Button class="w-32" on:click={() => null}>Upload</Button>
		<Button class="w-32" on:click={() => null} color="secondary">Save</Button>
	</div>
	<div />
</div>
