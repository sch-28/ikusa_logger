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
	let full_update_available = false;
	let version = NL_APPVERSION;

	async function check_for_updates() {
		let url =
			'https://raw.githubusercontent.com/sch-28/ikusa_logger/main/version/version-manifest.json';
		let manifest = await updater.checkForUpdates(url);
		if (manifest.version != NL_APPVERSION) {
			// check if it is a minor or major update
			if (
				manifest.version.split('.').length != NL_APPVERSION.split('.').length ||
				manifest.version.split('.')[0] != NL_APPVERSION.split('.')[0] ||
				manifest.version.split('.')[1] != NL_APPVERSION.split('.')[1]
			) {
				full_update_available = true;
			} else {
				update_available = true;
			}

			version = manifest.version;
		}
	}

	async function update() {
		try {
			if (full_update_available) {
				os.execCommand(`update.bat ${version}`, { background: true });
				await app.exit();
			} else if (update_available) {
				await updater.install();
				await app.restartProcess();
			}
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
	<Button class="w-32" on:click={() => goto('/settings')} color="secondary">Settings</Button>
	<Button
		class="w-32"
		on:click={() => os.open('https://ikusa.site/docs/introduction')}
		color="secondary">Help</Button
	>

	<div class="min-h-[32px] mt-2 text-center flex flex-col items-center justify-center">
		{#if loading}
			<LoadingIndicator />
		{:else}
			{#if update_available || full_update_available}
				<p class="text-submarine-500 mb-2">Update available</p>
				<Button class="w-32 mb-2" on:click={update}>Update</Button>
			{/if}

			{#if status?.npcap_installed && !update_available && !full_update_available}
				<p class="text-submarine-500">Npcap found</p>
			{:else if !update_available && !full_update_available}
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
