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

	$: {
		ip_filter;
		update_ip_filter();
	}

	onMount(async () => {
		config = await get_config();
		selected_interface =
			config.all_interfaces === true || config.all_interfaces === undefined ? 0 : 1;
		ip_filter = config.ip_filter === true || config.ip_filter === undefined ? true : false;
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

<div class="h-full flex flex-col gap-2">
	<div>
		<Label>Network Interface</Label>
		<Select
			options={['All', 'Default']}
			bind:selected_value={selected_interface}
			on_change={update_interface}
		/>
	</div>
	<div>
		<Label>Enable IP Filter</Label>
		<Toggle bind:checked={ip_filter} />
	</div>

	<div class="mt-auto flex flex-col gap-2">
		<Button on:click={restart_dev}>Dev Mode</Button>
		<Button on:click={restart_browser}>Browser Mode</Button>
	</div>
</div>
