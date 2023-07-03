<script lang="ts">
	import { app, events, os, updater } from '@neutralinojs/lib';
	import { Toggle } from 'flowbite-svelte';
	import Button from '../svelte-ui/elements/button.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import LoadingIndicator from '../svelte-ui/elements/loading-indicator.svelte';
	import { check_status, type LoggerStatus } from '../logic/logger-status';
	import GoMarkGithub from 'svelte-icons/go/GoMarkGithub.svelte';
	import Icon from '../svelte-ui/elements/icon.svelte';
	import FaDiscord from 'svelte-icons/fa/FaDiscord.svelte';
	let loading = false;
	let status: LoggerStatus;

	let update_available = false;

	async function check_for_updates() {
		let url =
			'https://raw.githubusercontent.com/sch-28/ikusa_logger/main/version/version-manifest.json';
		let manifest = await updater.checkForUpdates(url);
		if (manifest.version != NL_APPVERSION) {
			update_available = true;
		}
	}

	async function update() {
		try {
			await updater.install();
			await app.restartProcess();
		} catch (err) {
			alert(
				'Upadating went wrong, check your internet connection.' + (err as Error).message || err
			);
			console.error(err);
		}
	}

	onMount(async () => {
		try {
			loading = true;
			console.log('Checking for updates');
			await check_for_updates();
			console.log('Checking status');
			status = await check_status();
			console.log('Starting logger');
		} catch (e) {
			console.error(e);
			alert('Upadating went wrong, check your internet connection.' + (e as Error).message || e);
		}
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

	<div class="text-red-500 absolute top-1/2 -translate-y-1/2 left-2 text-xs w-56 text-center flex flex-col">
		<span
			>Regrettably, an unidentified issue persists, leading to random halts in the logger. To
			address this problem, I have temporarily enabled the developer console. If you happen to
			observe the logger ceasing its function, kindly reach out to me on Discord and provide a
			screenshot of the console.</span
		>
		<span>To prevent a loss of data, I recommend to run Wireshark in parallel to the logger.</span>
	</div>

	<div class="min-h-[32px] mt-4 text-center flex flex-col items-center justify-center">
		{#if loading}
			<LoadingIndicator />
		{:else}
			{#if update_available}
				<p class="text-submarine-500 mb-2">Update available</p>
				<Button class="w-32 mb-2" on:click={update}>Update</Button>
			{/if}

			{#if status?.npcap_installed && !update_available}
				<p class="text-submarine-500">Npcap found</p>
			{:else if !update_available}
				<p class="text-red-500">Npcap is not installed</p>
			{/if}
		{/if}
	</div>
</div>

<div class="w-full flex justify-between absolute bottom-0 p-2 text-sm">
	<p>Made by <b>ORACLE#7672</b></p>

	<div class="flex gap-2">
		<button on:click={() => os.open('https://discord.gg/nXSYGnxXJ5')}
			><Icon icon={FaDiscord} /></button
		>
		<button on:click={() => os.open('https://github.com/sch-28/ikusa')}
			><Icon icon={GoMarkGithub} /></button
		>
	</div>
</div>
