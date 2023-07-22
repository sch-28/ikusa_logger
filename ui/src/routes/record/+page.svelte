<script lang="ts">
	import { type LoggerCallback, start_logger } from '../../logic/logger-wrapper';
	import { onDestroy, onMount } from 'svelte';
	import Logger from '../../components/create-config/logger.svelte';
	import { get_config, type LogType } from '../../components/create-config/config';

	let logs: LogType[] = [];
	let is_destroyed = false;
	let retry_count = 0;

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
			alert(
				'An error occured while trying to start the logger. Error message: ' +
					data +
					'\nLogger will be restarted.'
			);
			if (!is_destroyed && retry_count < 3) {
				start_logger(logger_callback, 'analyze');
				retry_count++;
			} else if (!is_destroyed && retry_count >= 3) {
				alert('Tried to start logger 3 times, but failed. Please try again.');
			} else {
				retry_count = 0;
			}
		} else if (status === 'terminated') {
			if (!is_destroyed && retry_count < 3) {
				start_logger(logger_callback, 'analyze');
				retry_count++;
			} else if (!is_destroyed && retry_count >= 3) {
				alert('Tried to start logger 3 times, but failed. Please try again.');
			} else {
				retry_count = 0;
			}
		} else {
			alert('Unknown status: ' + status);
		}
	};

	onMount(async () => {
		const config = await get_config();
		start_logger(logger_callback, 'analyze', config.all_interfaces ? '-i' : '');
	});
	onDestroy(() => {
		is_destroyed = true;
	});
</script>

<Logger {logs} height={165} />
