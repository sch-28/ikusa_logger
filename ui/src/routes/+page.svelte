<script lang="ts">
	import { app, events, os, updater } from '@neutralinojs/lib';
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

	let update_available = false;

	async function check_for_updates() {
		try {
			let url =
				'https://raw.githubusercontent.com/sch-28/ikusa_logger/main/version/version-manifest.json';
			let manifest = await updater.checkForUpdates(url);
			if (manifest.version != NL_APPVERSION) {
				update_available = true;
			}
		} catch (err) {
			console.error(err);
		}
	}

	async function update() {
		try {
			await updater.install();
			await app.restartProcess();
		} catch (err) {
			console.error(err);
		}
	}

	onMount(async () => {
		loading = true;
		await check_for_updates();
		status = await check_status();
		loading = false;
	});
</script>

<div class="flex flex-col items-center justify-center gap-2">
	<Button class="w-32" on:click={() => goto('/record')}>Record</Button>
	<Button class="w-32" on:click={() => goto('/open')}>Open</Button>
	<Button
		class="w-32"
		on:click={() => os.open('https://ikusa.site/docs/introduction')}
		color="secondary">Help</Button
	>

	<div class="min-h-[32px] mt-4 text-center flex flex-col items-center justify-center">
		{#if loading || !status}
			<LoadingIndicator />
		{:else}
			{#if update_available}
				<p class="text-submarine-500 mb-2">Update available</p>
				<Button class="w-32 mb-2" on:click={update}>Update</Button>
			{/if}

			{#if status.npcap_installed && !update_available}
				<p class="text-submarine-500">Npcap found</p>
			{:else if !update_available}
				<p class="text-red-500">Npcap is not installed</p>
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
