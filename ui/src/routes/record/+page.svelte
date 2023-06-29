<script lang="ts">
	import VirtualList from '@sveltejs/svelte-virtual-list';
	import IoMdInformationCircleOutline from 'svelte-icons/io/IoMdInformationCircleOutline.svelte';
	import { type LoggerCallback, start_logger } from '../../logic/logger-wrapper';
	import { open_file } from '../../logic/file';
	import Icon from '../../svelte-ui/elements/icon.svelte';
	import LoadingIndicator from '../../svelte-ui/elements/loading-indicator.svelte';
	import { ModalManager } from '../../svelte-ui/modal/modal-store';
	import { find_all_indicies } from '../../svelte-ui/util';
	import Button from '../../svelte-ui/elements/button.svelte';
	import Select from '../../components/create-config/select.svelte';
	import ConfigModal from '../../components/create-config/config.modal.svelte';
	import { onDestroy, onMount } from 'svelte';
	import Checkbox from '../../svelte-ui/elements/checkbox.svelte';
	import Logger from '../../components/create-config/logger.svelte';
	import type { LogType } from '../../components/create-config/config';

	let logs: LogType[] = [];
	let is_destroyed = false;
	let retry_count = 0;

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
		}
	};

	onMount(async () => {
		start_logger(logger_callback, 'analyze');
	});
	onDestroy(() => {
		is_destroyed = true;
	});
</script>

<Logger {logs} height={165} />
