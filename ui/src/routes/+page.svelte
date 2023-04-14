<script lang="ts">
	import { events, os } from '@neutralinojs/lib';
	import { Toggle } from 'flowbite-svelte';
	import Button from '../svelte-ui/elements/button.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { start_logger, type LoggerCallback } from '../logic/logger-wrapper';
	import LoadingIndicator from '../svelte-ui/elements/loading-indicator.svelte';

	let loading = false;

	let current_errors: (typeof error_message_mapping)[keyof typeof error_message_mapping][] = [];

	const error_message_mapping = {
		'Npcap is not installed': 'Npcap is not installed',
		'Could not locate config file or config is invalid':
			'Could not locate config file or config is invalid',
		'The config is older than 7 days. It might not work anymore. Try to update the config by using:\r\nlogger.exe -u':
			'The config is older than 7 days. It might not work anymore.',
		'Something else went wrong. Please contact the developer.':
			'Something else went wrong. Please contact the developer.'
	};

	const logger_callback: LoggerCallback = (data, status) => {
		if (status === 'running') {
			if (Object.keys(error_message_mapping).includes(data as keyof typeof error_message_mapping)) {
				current_errors.push(error_message_mapping[data as keyof typeof error_message_mapping]);
				current_errors = current_errors;
			}
		} else if (status === 'error') {
			console.error(data);
			current_errors.push(
				error_message_mapping['Something else went wrong. Please contact the developer.']
			);
			current_errors = current_errors;
			loading = false;
		} else if (status === 'terminated') {
			loading = false;
		}
	};

	onMount(() => {
		loading = true;
		start_logger(logger_callback, 'status');
	});
</script>

<div class="flex flex-col items-center justify-center gap-2">
	<Button class="w-32">Sniff</Button>
	<Button class="w-32" on:click={() => goto('/record')}>Record</Button>
	<Button class="w-32" on:click={() => goto('/open')}>Open</Button>

	<div class="h-8  mt-4 text-center">
		{#if loading}
			<LoadingIndicator />
		{:else if current_errors.length === 0}
			<p class="text-submarine-500">Config is up to date</p>
		{:else}
			{#each current_errors as error}
				<p class="text-red-500">{error}</p>
				<br />
			{/each}
		{/if}
	</div>
	<Button size="sm" color="secondary">Update Config</Button>
</div>
