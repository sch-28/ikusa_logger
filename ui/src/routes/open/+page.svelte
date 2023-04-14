<script lang="ts">
	import { os } from '@neutralinojs/lib';
	import { onMount } from 'svelte';
	import Button from '../../svelte-ui/elements/button.svelte';
	import LoadingIndicator from '../../svelte-ui/elements/loading-indicator.svelte';
	import { start_logger, type LoggerCallback } from '../../logic/logger-wrapper';
	let log_container: HTMLElement;
	let logs: string[] = [];
	let loading = false;

	function parse_log(log: string) {
		log = log.trim();
		const regex = /\[(.*)\] (\w*) (died to|has killed) (\w*) from (\w*)/;
		const results = log.match(regex);
		if (results && results.length == 6) {
			logs.push(log);
			logs = logs;
			scroll();
		}
	}

	onMount(async () => {
		open_file();
	});

	function scroll() {
		if (log_container)
			setTimeout(() => {
				log_container.children[log_container.children.length - 1]?.scrollIntoView({
					behavior: 'smooth'
				});
			});
	}

	const logger_callback: LoggerCallback = (data, status) => {
		if (status === 'running') {
			loading = true;
			scroll();
			parse_log(data);
		} else {
			loading = false;
		}
	};

	async function open_file() {
		let entries = await os.showOpenDialog('Open a diagram', {
			defaultPath: '.',
			filters: [{ name: 'Network File', extensions: ['pcap', 'npcap'] }]
		});

		start_logger(logger_callback, 'open_file', entries[0]);
	}
</script>

<Button size="sm" class="mb-2 shrink-0" on:click={open_file}>Open File</Button>

<div
	class="flex flex-col w-full h-full text-sm border-gold border rounded-lg overflow-y-scroll p-2 relative"
	bind:this={log_container}
>
	{#if logs.length > 0}
		{#each logs as log}
			<p>{log}</p>
		{/each}
	{:else if !loading}
		<p class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">No Data</p>
	{/if}
	{#if loading}
		<div
			class={logs.length === 0
				? 'absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2'
				: 'mx-auto my-2'}
		>
			<LoadingIndicator />
		</div>
	{/if}
</div>

<div class="flex gap-2 mt-4">
	<Button class="w-28">Upload</Button>
	<Button class="w-28">Save</Button>
</div>
