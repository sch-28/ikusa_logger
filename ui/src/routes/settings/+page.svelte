<script lang="ts">
	import { Label } from 'flowbite-svelte';
	import Select from '../../components/create-config/select.svelte';
	import { onMount } from 'svelte';
	import { get_config, type Config, update_config } from '../../components/create-config/config';

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
</script>

<div>
	<Label>Network Interface</Label>
	<Select
		options={['All', 'Default']}
		bind:selected_value={selected_interface}
		on_change={update_interface}
	/>
</div>
