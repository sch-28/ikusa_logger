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

	let logs: {
		identifier: string;
		time: string;
		names: { name: string; offset: string }[];
		hex: string;
	}[] = [
		{
			identifier: '6d01001d0d',
			time: '08:01:34',
			names: [
				{
					name: 'Chromatica',
					offset: '16'
				},
				{
					name: 'ThaliaM',
					offset: '140'
				},
				{
					name: 'TerrorKnight',
					offset: '264'
				},
				{
					name: 'Pelat',
					offset: '404'
				},
				{
					name: 'Todakoro',
					offset: '540'
				}
			],
			hex: '6d01001d0d6300614300680072006f006d00610074006900630061000000000000000000000000000000000000000000000000000000000000000000000000000000000000005400680061006c00690061004d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000054006500720072006f0072004b006e00690067006800740000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000500065006c00610074000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000054006f00640061006b006f0072006f000000000000000000000000000000'
		},
		{
			identifier: '6d01001d0d',
			time: '08:02:19',
			names: [
				{
					name: 'Discipline',
					offset: '16'
				},
				{
					name: 'Payherefor',
					offset: '140'
				},
				{
					name: 'Achigodx',
					offset: '264'
				},
				{
					name: 'Myrmidonsx',
					offset: '404'
				},
				{
					name: 'Whatto',
					offset: '540'
				}
			],
			hex: '6d01001d0d6e00734400690073006300690070006c0069006e006500000000000000000000000000000000000000000000000000000000000000000000000000000000000000500061007900680065007200650066006f007200000000000000000000000000000000000000000000000000000000000000000000000000000000000000410063006800690067006f0064007800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c000000060000004d00790072006d00690064006f006e007300780000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff000a0afe570068006100740074006f00000000000000000000000000000000000000'
		},
		{
			identifier: '6d01001d0d',
			time: '08:02:21',
			names: [
				{
					name: 'Threat',
					offset: '16'
				},
				{
					name: 'Spinjake',
					offset: '140'
				},
				{
					name: 'KosiSiano',
					offset: '264'
				},
				{
					name: 'Strideer',
					offset: '404'
				},
				{
					name: 'Sparro',
					offset: '540'
				}
			],
			hex: '6d01001d0d65000054006800720065006100740000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005300700069006e006a0061006b006500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004b006f00730069005300690061006e006f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001060000005300740072006900640065006500720000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000530070006100720072006f00000000000000000000000000000000000000'
		},
		{
			identifier: '6d01001d0d',
			time: '08:02:42',
			names: [
				{
					name: 'Threat',
					offset: '16'
				},
				{
					name: 'Spinjake',
					offset: '140'
				},
				{
					name: 'Zedachi',
					offset: '264'
				},
				{
					name: 'Haunt',
					offset: '404'
				},
				{
					name: 'Sparro',
					offset: '540'
				}
			],
			hex: '6d01001d0d00000054006800720065006100740000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005300700069006e006a0061006b006500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005a00650064006100630068006900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e3f0d500060000004800610075006e00740000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d30de3eed30d530070006100720072006f00000000000000000000000000000000000000'
		},
		{
			identifier: '6d01001d0d',
			time: '08:02:55',
			names: [
				{
					name: 'Threat',
					offset: '16'
				},
				{
					name: 'LightSurfer',
					offset: '140'
				},
				{
					name: 'Lahnlut',
					offset: '264'
				},
				{
					name: 'Zendak',
					offset: '404'
				},
				{
					name: 'Surfers',
					offset: '540'
				}
			],
			hex: '6d01001d0d63006154006800720065006100740000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004c006900670068007400530075007200660065007200000000000000000000000000000000000000000000000000000000000000000000000000000000004c00610068006e006c007500740000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001060000005a0065006e00640061006b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000530075007200660065007200730000000000000000000000000000000000'
		},
		{
			identifier: '6d01001d0d',
			time: '08:02:59',
			names: [
				{
					name: 'InUnderrated',
					offset: '10'
				},
				{
					name: 'Xerathiel',
					offset: '140'
				},
				{
					name: 'Zeuzu',
					offset: '264'
				},
				{
					name: 'VonBlumenstein',
					offset: '404'
				},
				{
					name: 'Vi_Darquise',
					offset: '540'
				}
			],
			hex: '6d01001d0d49006e55006e0064006500720072006100740065006400000000000000000000000000000000000000000000000000000000000000000000000000000000000000580065007200610074006800690065006c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005a00650075007a0075000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffff000600000056006f006e0042006c0075006d0065006e0073007400650069006e00000000000000000000000000000000000000000000000000000000000000000000006812e6b26913560069005f00440061007200710075006900730065000000000000000000'
		},
		{
			identifier: '6d01001d0d',
			time: '08:03:03',
			names: [
				{
					name: 'Discipline',
					offset: '16'
				},
				{
					name: 'Dashanz',
					offset: '140'
				},
				{
					name: 'Imposter',
					offset: '264'
				},
				{
					name: 'Octaviius',
					offset: '404'
				},
				{
					name: 'Yougataga',
					offset: '540'
				}
			],
			hex: '6d01001d0d6300614400690073006300690070006c0069006e006500000000000000000000000000000000000000000000000000000000000000000000000000000000000000440061007300680061006e007a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000049006d0070006f0073007400650072000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001060000004f0063007400610076006900690075007300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000059006f007500670061007400610067006100000000000000000000000000'
		},
		{
			identifier: '6d01001d0d',
			time: '08:03:04',
			names: [
				{
					name: 'Discipline',
					offset: '16'
				},
				{
					name: 'Robynh',
					offset: '140'
				},
				{
					name: 'Achigodx',
					offset: '264'
				},
				{
					name: 'Myrmidonsx',
					offset: '404'
				},
				{
					name: 'Pengaroo',
					offset: '540'
				}
			],
			hex: '6d01001d0d6500724400690073006300690070006c0069006e00650000000000000000000000000000000000000000000000000000000000000000000000000000000000000052006f00620079006e0068000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000410063006800690067006f006400780000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f70f0f00060000004d00790072006d00690064006f006e0073007800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500065006e006700610072006f006f000000000000000000000000000000'
		},
		{
			identifier: '6d01001d0d',
			time: '08:03:07',
			names: [
				{
					name: 'Amongers',
					offset: '16'
				},
				{
					name: 'Nightllia',
					offset: '140'
				},
				{
					name: 'Akeles',
					offset: '264'
				},
				{
					name: 'Enferno',
					offset: '404'
				},
				{
					name: 'Nightllia',
					offset: '540'
				}
			],
			hex: '6d01001d0d63006141006d006f006e006700650072007300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004e0069006700680074006c006c0069006100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041006b0065006c00650073000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000045006e006600650072006e006f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004e0069006700680074006c006c0069006100000000000000000000000000'
		}
	];

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

	const logger_callback: LoggerCallback = (data, status) => {
		if (status === 'running') {
			const d = data.split(',');
			console.log(d);
			if (d.length === 8) {
				logs.push({
					identifier: d[0],
					time: d[1],
					names: d.slice(2, 7).map((name) => {
						const split = name.split(' ');
						return { name: split[0], offset: split[1] };
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
		}
	};

	async function open_pcap() {
		const file = await open_file();
		start_logger(logger_callback, 'analyze', '-f ' + file);
		state = 'loading';
	}

	let state: 'loading' | 'loaded' | 'live' | 'idle' = 'loaded';
</script>

<div class="flex flex-col gap-2 items-center w-full">
	{#if state === 'idle'}
		<p>How do you want to update the config?</p>
		<Button class="w-32" on:click={open_pcap}>Open pcap</Button>
		<Button class="w-32">Live</Button>
	{:else if state === 'loading'}
		<LoadingIndicator />
	{:else if state === 'loaded'}
		<p>Adjust the names accordingly</p>
		<div class="h-[264px] w-full overflow-auto">
			<VirtualList items={logs} let:item={log}>
				<div class="flex gap-1 group py-1 items-center">
					<p class="text-sm text-gray-400">{log.time}:</p>
					<!-- <p>{log.names[player_one_index].name}</p> -->
					<Select
						options={log.names.map((n) => n.name)}
						selected_value={player_one_index}
						on_change={(e) => update_names('player_one', e)}
					/>
					<div class="flex justify-center items-center">
						{#if log.kill}
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
	{:else if state === 'live'}
		<p>Config is being updated</p>
		<Button class="w-32" on:click={() => (state = 'idle')}>Back</Button>
	{/if}
</div>
