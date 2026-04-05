<script lang="ts">
	import { Label, Toggle } from 'flowbite-svelte';
	import Select from '../../components/create-config/select.svelte';
	import { onMount } from 'svelte';
	import { get_config, type Config, update_config } from '../../components/create-config/config';
	import Button from '../../svelte-ui/elements/button.svelte';
	import { app, os } from '@neutralinojs/lib';
	import { dev } from '$app/environment';

	let config: Config;

	let selected_interface = 0;
	let ip_filter = false;
	let live_output_path = '';

	async function update_interface() {
		if (config) {
			await update_config({ ...config, all_interfaces: selected_interface == 0 });
		}
	}

	async function update_ip_filter() {
		if (config) {
			await update_config({ ...config, ip_filter });
		}
	}

	async function pick_live_output_path() {
		const result = await os.showSaveDialog('Choose live output file location', {
			defaultPath: live_output_path || 'ikusa_live.log',
			filters: [{ name: 'Log file', extensions: ['log'] }]
		});
		if (result) {
			live_output_path = result;
			config = await update_config({ ...config, live_output_path });
		}
	}

	async function clear_live_output_path() {
		live_output_path = '';
		config = await update_config({ ...config, live_output_path: '' });
	}

	$: {
		ip_filter;
		update_ip_filter();
	}

	onMount(async () => {
		config = await get_config();
		selected_interface =
			config.all_interfaces === true || config.all_interfaces === undefined ? 0 : 1;
		ip_filter = config.ip_filter === true || config.ip_filter === undefined ? true : false;
		live_output_path = config.live_output_path || '';
	});

	async function restart_dev() {
		if (dev) return;
		await os.execCommand(`ikusa-logger-win_x64.exe --window-enable-inspector`, {
			background: true
		});
		app.exit();
	}

	async function restart_browser() {
		if (dev) return;
		await os.execCommand(`ikusa-logger-win_x64.exe --mode=browser`, {
			background: true
		});
		app.exit();
	}
</script>

<div class="h-full flex flex-col gap-3 max-w-sm mx-auto w-full">
	<div class="rounded-lg border border-gray-700 p-3 flex items-center justify-between gap-4">
		<div>
			<p class="text-sm font-medium">Network Interface</p>
			<p class="text-xs text-gray-400">Which interface to capture packets from</p>
		</div>
		<Select
			options={['All', 'Default']}
			bind:selected_value={selected_interface}
			on_change={update_interface}
		/>
	</div>

	<div class="rounded-lg border border-gray-700 p-3 flex items-center justify-between gap-4">
		<div>
			<p class="text-sm font-medium">IP Filter</p>
			<p class="text-xs text-gray-400">Filter packets by known game server IPs</p>
		</div>
		<Toggle bind:checked={ip_filter} />
	</div>
	<div>
		<Label>Live Output File</Label>
		<p class="text-xs text-gray-400 mb-1">
			When set, logs are written to this file in real-time as they appear (and rewritten on index
			changes). Leave empty to disable.
		</p>
		<div class="flex gap-2 items-center overflow-hidden">
			<span class="text-sm truncate text-gray-300 min-w-0 flex-1" title={live_output_path}>
				{live_output_path ? live_output_path.split(/[\\/]/).slice(-2).join('/') : 'Not set'}
			</span>
			<Button on:click={pick_live_output_path}>Browse</Button>
			{#if live_output_path}
				<Button color="secondary" on:click={clear_live_output_path}>Clear</Button>
			{/if}
		</div>
	</div>

	<div class="rounded-lg border border-gray-700 p-3">
		<p class="text-sm font-medium mb-0.5">Live Output File</p>
		<p class="text-xs text-gray-400 mb-2">
			Logs written to this file in real-time. Leave empty to disable.
		</p>
		<div class="flex gap-2 items-center">
			<span class="text-xs truncate text-gray-300 min-w-0 flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1.5" title={live_output_path}>
				{live_output_path ? live_output_path.split(/[\\/]/).slice(-2).join('/') : 'Not set'}
			</span>
			<Button size="sm" on:click={pick_live_output_path}>Browse</Button>
			{#if live_output_path}
				<Button size="sm" color="secondary" on:click={clear_live_output_path}>Clear</Button>
			{/if}
		</div>
	</div>

	<div class="mt-auto flex gap-2">
		<Button class="flex-1" color="secondary" on:click={restart_dev}>Dev Mode</Button>
		<Button class="flex-1" color="secondary" on:click={restart_browser}>Browser Mode</Button>
	</div>
</div>
