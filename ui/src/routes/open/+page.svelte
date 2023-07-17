<script lang="ts">
	import { os } from '@neutralinojs/lib';
	import { onMount } from 'svelte';
	import Button from '../../svelte-ui/elements/button.svelte';
	import LoadingIndicator from '../../svelte-ui/elements/loading-indicator.svelte';
	import { start_logger, type LoggerCallback } from '../../logic/logger-wrapper';
	import Logger from '../../components/create-config/logger.svelte';
	import { open_file } from '../../logic/file';
	import type { LogType } from '../../components/create-config/config';
	let log_container: HTMLElement;
	let logs: LogType[] = [];
	let loading = false;

	const logger_callback: LoggerCallback = (data, status) => {
		if (status === 'running') {
			const d = data.split(',');
			if (d.length === 8) {
				logs.push({
					identifier: d[0],
					time: d[1],
					names: d.slice(2, 7).map((name) => {
						const split = name.split(' ');
						return { name: split[0], offset: +split[1] };
					}),
					hex: d[7]
				});
				logs = logs;
			}
		} else if (status === ('error' as any)) {
			console.error(data);
			loading = false;
		} else if (status === 'terminated') {
			loading = false;
		}
	};

	async function open_pcap() {
		logs = [];
		const file = await open_file();
		start_logger(logger_callback, 'analyze', '-f ' + '"' + file + '"');
		loading = true;
	}
</script>

<Button size="sm" class="mb-2 shrink-0" on:click={open_pcap}>Open File</Button>

<Logger {logs} height={130} {loading} />
