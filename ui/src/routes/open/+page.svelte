<script lang="ts">
	import Button from '../../svelte-ui/elements/button.svelte';
	import { start_logger, type LoggerCallback } from '../../logic/logger-wrapper';
	import Logger from '../../components/create-config/logger.svelte';
	import { open_file } from '../../logic/file';
	import { get_config, type Log, type LogType } from '../../components/create-config/config';
	import { filesystem } from '@neutralinojs/lib';
	import LogEditor from '../../components/create-config/log-editor.svelte';
	let logs: LogType[] = [];
	let combat_logs: Log[] = [];
	let loading = false;

	let is_network = false;

	const log_regex = /\[(.+)\] (\w+) (died to|has killed) (\w+) from (\w+|-1)(?: \((\w+),(\w+)\))?/;

	const logger_callback: LoggerCallback = (data, status) => {
		if (status === 'running') {
			const d = data.split(',');
			if (d.length === 8 && !data.includes('Network Interfaces:')) {
				const new_log = {
					identifier: d[0],
					time: d[1],
					names: d.slice(2, 7).map((name) => {
						const split = name.split(' ');
						return { name: split[0], offset: +split[1] };
					}),
					hex: d[7]
				};

				if (
					logs.find(
						(log) =>
							log.identifier === new_log.identifier &&
							log.time === new_log.time &&
							log.names.length === new_log.names.length &&
							log.names.every((name, i) => name.name === new_log.names[i].name)
					)
				) {
					return;
				}

				logs.push(new_log);
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
		const filePaths = await open_file();
		const config = await get_config();
		if ((filePaths.length > 0 && filePaths[0].includes('.txt')) || filePaths[0].includes('.log')) {
			const filePath = filePaths[0];
			is_network = false;
			let data = await filesystem.readFile(filePath);
			if (!data) return;
			logs = [];
			const lines = data.split('\n');
			for (const line of lines) {
				const match = line.match(log_regex);
				if (match) {
					const new_combat_log: Log = {
						time: match[1],
						names: [match[2], match[4], match[5], match[6], match[7]],
						kill: match[3] === 'has killed'
					};
					combat_logs.push(new_combat_log);
				}
			}
			combat_logs = combat_logs;
			console.log(combat_logs);
		} else {
			is_network = true;
			start_logger(
				logger_callback,
				'analyze',
				'-f ' + '"' + filePaths + '"' + (config.ip_filter ? ' -p' : '')
			);
			loading = true;
		}
	}
</script>

<Button size="sm" class="mb-2 shrink-0" on:click={open_pcap}>Open File</Button>
{#if is_network}
	<Logger {logs} height={130} {loading} />
{:else}
	<LogEditor logs={combat_logs} height={130} {loading} />
{/if}
