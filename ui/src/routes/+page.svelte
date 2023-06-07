<script lang="ts">
	import { events, os } from '@neutralinojs/lib';
	import { Toggle } from 'flowbite-svelte';
	import Button from '../svelte-ui/elements/button.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { start_logger, type LoggerCallback } from '../logic/logger-wrapper';
	import LoadingIndicator from '../svelte-ui/elements/loading-indicator.svelte';
	import { check_status, type LoggerStatus } from '../logic/logger-status';
	import GoMarkGithub from 'svelte-icons/go/GoMarkGithub.svelte';
	import Icon from '../svelte-ui/elements/icon.svelte';
	let loading = false;
	let status: LoggerStatus;
	/* let current_errors: (typeof error_message_mapping)[keyof typeof error_message_mapping][] = [];

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
	}; */

	onMount(async () => {
		loading = true;
		/* start_logger(logger_callback, 'status'); */
		status = await check_status();
		loading = false;
	});
</script>

<div class="flex flex-col items-center justify-center gap-2">
	<Button class="w-32" on:click={() => goto('/record')}>Record</Button>
	<Button class="w-32" on:click={() => goto('/open')}>Open</Button>
	<Button
		class="w-32"
		on:click={() => os.open('https://alpha.ikusa.site/docs/introduction')}
		color="secondary">Help</Button
	>

	<div class="min-h-[32px] mt-4 text-center">
		{#if loading || !status}
			<LoadingIndicator />
		{:else if status.npcap_installed && status.config_valid && status.config_up_to_date}
			<p class="text-submarine-500">Config is up to date</p>
		{:else}
			{#if !status.npcap_installed}
				<p class="text-red-500">Npcap is not installed</p>
			{/if}
			{#if !status.config_valid}
				<p class="text-red-500">No config found</p>
			{/if}
			{#if !status.config_up_to_date}
				<p class="text-red-500">Config is outdated</p>
			{/if}
		{/if}
	</div>
</div>

<div class="w-full flex justify-between absolute bottom-0 p-2 text-sm">
	<p>Made by <b>ORACLE#7672</b></p>

	<button on:click={() => os.execCommand('start https://github.com/sch-28/ikusa')}
		><Icon icon={GoMarkGithub} /></button
	>
</div>
