<script lang="ts">
	import { Label } from 'flowbite-svelte';
	import Select from '../../components/create-config/select.svelte';
	import { onMount } from 'svelte';
	import { get_config, type Config, update_config } from '../../components/create-config/config';
	import Button from '../../svelte-ui/elements/button.svelte';
	import { app, os } from '@neutralinojs/lib';
	import { dev } from '$app/environment';

	let config: Config;

	let selected_interface = 0;

	async function update_interface() {
		if (config) {
			await update_config({ ...config, all_interfaces: selected_interface == 0 });
		}
	}

	onMount(async () => {
		config = await get_config();
		selected_interface =
			config.all_interfaces === true || config.all_interfaces === undefined ? 0 : 1;
	});

	async function restart_dev() {
		if (dev) return;
		await os.execCommand(`ikusa-logger-win_x64.exe --window-enable-inspector`, {
			background: true
		});
		app.exit();
	}
</script>

<div class="h-full flex flex-col items-center">
	<Label>Network Interface</Label>
	<Select
		options={['All', 'Default']}
		bind:selected_value={selected_interface}
		on_change={update_interface}
	/>

	<Button class="mt-auto" on:click={restart_dev}>Restart as dev</Button>
</div>
