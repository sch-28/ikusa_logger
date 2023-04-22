<script lang="ts">
	import Button from '../../svelte-ui/elements/button.svelte';
	import { onMount } from 'svelte';
	import LoadingIndicator from '../../svelte-ui/elements/loading-indicator.svelte';
	import { goto } from '$app/navigation';
	import { check_status, type LoggerStatus } from '../../logic/logger-status';
	import { start_logger, type LoggerCallback } from '../../logic/logger-wrapper';

	let loading = false;
	let already_updated = false;
	let outdated = false;
	let logger_status: LoggerStatus;

	const logger_callback: LoggerCallback = (data, status) => {
		if (status === 'running') {
			if (data !== 'The config was updated successfully.') {
				outdated = true;
			}
		} else if (status === 'error') {
			console.error(data);
		} else if (status === 'terminated') {
			check_status().then((status) => {
				logger_status = status;
				loading = false;
			});
		}
	};

	async function update() {
		loading = true;
		await start_logger(logger_callback, 'update');
	}

	onMount(async () => {
		loading = true;
		logger_status = await check_status();
		loading = false;
		/* loading = true;
		if (!status.config_up_to_date) {
			await start_logger(logger_callback, 'update');
		} else {
			loading = false;
			already_updated = true;
		} */
	});
</script>


{#if loading}
	<LoadingIndicator />
{:else if logger_status}
	<p>The current config is from patch {logger_status.patch}</p>
	{#if logger_status.config_up_to_date}
		<p class="text-submarine-500">Config is already up to date</p>
	{:else}
		<p class="text-red-500">The config might be outdated</p>
	{/if}

	<div class="flex flex-col gap-2 mt-2">
		<Button class="w-32" on:click={update}>Download Config</Button>
		<Button class="w-32" on:click={() => goto('/update-config/create')}>Create Config</Button>
	</div>
{/if}
