<script lang="ts">
	import VirtualList from '@sveltejs/svelte-virtual-list';
	import { open_save_location } from '../../logic/file';
	import LoadingIndicator from '../../svelte-ui/elements/loading-indicator.svelte';
	import { find_all_indicies } from '../../svelte-ui/util';
	import Button from '../../svelte-ui/elements/button.svelte';
	import Select from '../../components/create-config/select.svelte';
	import Checkbox from '../../svelte-ui/elements/checkbox.svelte';
	import {
		update_config,
		type Config,
		type LogType,
		get_date,
		get_formatted_date,
		update_storage,
		get_storage
	} from '../../components/create-config/config';
	import { filesystem } from '@neutralinojs/lib';
	import { onMount } from 'svelte';

	export let logs: LogType[];
	export let height: number = 155;
	export let loading: boolean = false;

	let player_one_index = 0;
	let player_two_index = 1;
	let guild_index = 2;

	let possible_kill_offsets: number[] = [];
	let kill_index = 0;

	let local_config: Config;

	onMount(async () => {
		const last_config = await get_storage();
		if (last_config) {
			player_one_index = last_config.player_one_index;
			player_two_index = last_config.player_two_index;
			guild_index = last_config.guild_index;
			possible_kill_offsets = [last_config.kill_offset];
		}
	});

	let auto_scroll = true;

	$: {
		if (logs.length > 0) {
			possible_kill_offsets = find_kill_offset(logs).map((offset) => offset);
			auto_scroll && scroll();

			local_config = {
				...local_config,
				identifier: logs[0].identifier,
				player_one: logs[0].names[player_one_index].offset,
				player_two: logs[0].names[player_two_index].offset,
				guild: logs[0].names[guild_index].offset,
				kill: possible_kill_offsets[kill_index]
			};
			if (possible_kill_offsets.length > 0) {
				update_config(local_config);
				update_storage({
					player_one_index,
					player_two_index,
					guild_index,
					kill_offset: possible_kill_offsets[kill_index]
				});
			}
		} else {
			scroll(true);
			const v_list = document.querySelector('svelte-virtual-list-contents');
			if (v_list) {
				v_list.setAttribute('style', 'padding-top: 0px; padding-bottom: 0px;');
			}
		}
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

	function scroll(top?: boolean) {
		const container = document.querySelector('svelte-virtual-list-viewport');
		if (container && !top) {
			container.scrollTop = container.scrollHeight;
		} else if (container) {
			container.scrollTop = 0;
		}
	}

	async function save_logs() {
		let output = '';
		for (const log of logs) {
			if (log.hex[possible_kill_offsets[kill_index]] === '1')
				output += `[${log.time}] ${log.names[player_one_index].name} has killed ${log.names[player_two_index].name} from ${log.names[guild_index].name}\n`;
			else
				output += `[${log.time}] ${log.names[player_one_index].name} died to ${log.names[player_two_index].name} from ${log.names[guild_index].name}\n`;
		}
		const path = await open_save_location(get_formatted_date(get_date()) + '.log');
		filesystem.writeFile(path, output);
	}
</script>

<div class="flex flex-col gap-2 items-center w-full relative">
	<div class="flex gap-1 items-center justify-start w-full px-1">
		<p class="w-16">Kill offset:</p>
		<Select options={possible_kill_offsets} bind:selected_value={kill_index} />
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
	<div class="w-full overflow-auto flex flex-col" style="height: {height}px;">
		{#if loading && logs.length === 0}
			<div class="absolute inset-0 flex justify-center items-center">
				<LoadingIndicator />
			</div>
		{:else if logs.length === 0 && !loading}
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
					{#if log.hex[possible_kill_offsets[kill_index]] === '1'}
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
		<Button class="w-32" on:click={save_logs} color="secondary">Save</Button>
	</div>
</div>
