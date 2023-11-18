import { dev } from '$app/environment';
import { events, os } from '@neutralinojs/lib';

function handle_process(evt: CustomEvent) {
	if (logger && logger.id == evt.detail.id) {
		switch (evt.detail.action) {
			case 'stdOut':
				console.log(evt.detail.data.trim());
				callback?.(evt.detail.data.trim(), 'running');
				break;
			case 'stdErr':
				alert(
					'Something went wrong. Please contact me on discord and send the following error message:\n\n' +
						evt.detail.data
				);
				console.error(evt.detail.data);
				callback?.(evt.detail.data.trim(), 'error');
				break;
			case 'exit':
				console.log(`Logger process terminated with exit code: ${evt.detail.data}`);
				logger = null;
				callback?.(evt.detail.data, 'terminated');
				events.off('spawnedProcess', handle_process);
				break;
		}
	} else {
		console.log('Invalid logger', logger, evt.detail.id);
		alert('Something went wrong. Invalid Logger');
	}
}

const arg_mapping = {
	sniff: '',
	open_file: '-f',
	status: '-s',
	update: '-u',
	record: '-r',
	analyze: '-a',
} as const;

let logger: os.SpawnedProcess | null = null;

export type LoggerCallback = (data: string, status: 'running' | 'terminated' | 'error') => void;
let callback: LoggerCallback | null = null;

export async function start_logger(
	clb: LoggerCallback,
	arg: keyof typeof arg_mapping,
	data?: string
) {
	if (logger) {
		try {
			await os.updateSpawnedProcess(logger.id, 'exit');
		} catch (e) {
			console.error(e);
		}
	}
	console.log('Killing previous instances');
	try {
		const kill_timouet = new Promise((resolve, reject) => {
			setTimeout(() => resolve('Kill timeout'), 1000);
		});
		const kill_promise = os.execCommand('taskkill /F /IM logger.exe ');

		await Promise.race([kill_promise, kill_timouet]);
	} catch (e) {
		console.error(e);
	}

	const extra_args = data ? ' ' + data : '';
	let logger_command = 'logger\\logger ';
	if (dev) {
		logger_command = 'logger\\dist\\logger\\logger ';
	}

	console.log('Starting logger with command: ' + logger_command + arg_mapping[arg] + extra_args);

	logger = await os.spawnProcess(logger_command + arg_mapping[arg] + extra_args);
	callback = clb;
	events.on('spawnedProcess', handle_process);
}
