import { events, os } from '@neutralinojs/lib';

function handle_process(evt: CustomEvent) {
	if (logger && logger.id == evt.detail.id) {
		switch (evt.detail.action) {
			case 'stdOut':
				console.log(evt.detail.data);
				callback?.(evt.detail.data.trim(), 'running');
				break;
			case 'stdErr':
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
	}
}

const arg_mapping = {
	sniff: '',
	open_file: '-f',
	status: '-s',
	update: '-u',
	record: '-r'
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
		await os.updateSpawnedProcess(logger.id, 'exit');
	}
	const extra_args = data ? ' ' + data : '';
	logger = await os.spawnProcess('logger\\dist\\logger\\logger ' + arg_mapping[arg] + extra_args);
	callback = clb;
	events.on('spawnedProcess', handle_process);
}
