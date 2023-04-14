<script lang="ts">
	import Button from '../../svelte-ui/elements/button.svelte';
	import { start_logger, type LoggerCallback } from '../../logic/logger-wrapper';
	import { onMount } from 'svelte';
	import LoadingIndicator from '../../svelte-ui/elements/loading-indicator.svelte';
	import { goto } from '$app/navigation';
	import { check_status } from '../../logic/logger-status';

	let loading = false;
	let already_updated = false;
	let outdated = false;

	const logger_callback: LoggerCallback = (data, status) => {
		if (status === 'running') {
			if (data !== 'The config was updated successfully.') {
				outdated = true;
			}
		} else if (status === 'error') {
			console.error(data);
			loading = false;
		} else if (status === 'terminated') {
			loading = false;
		}
	};

	onMount(async () => {
		loading = true;
		const status = await check_status();
		if (!status.config_up_to_date) {
			await start_logger(logger_callback, 'update');
		} else {
			loading = false;
			already_updated = true;
		}
	});
</script>

{#if loading}
	<LoadingIndicator />
{:else if !outdated}
	{#if already_updated}
		<p class="text-submarine-500">Config is already up to date</p>
	{:else}
		<p class="text-submarine-500">Config was updated successfully</p>
	{/if}
	<Button on:click={() => goto('/')} class="mt-2" size="sm">Back</Button>

	<p class="mt-auto">You can also manually update the config</p>
	<Button class="w-32 mt-2" on:click={() => goto('/update-config/create')}>Update config</Button>
{:else}
	<p class="text-red-500 mb-2">The config is older than 7 days. It might not work anymore.</p>
	<p>You can manually update the config</p>
	<Button class="w-32 mt-2" on:click={() => goto('/update-config/create')}>Update config</Button>
{/if}
