import { start_logger, type LoggerCallback } from './logger-wrapper';
export type LoggerStatus = {
	npcap_installed: boolean;
	config_valid: boolean;
	config_up_to_date: boolean;
	something_else: string;
	patch: string;
};
let logger_status: LoggerStatus = {
	npcap_installed: false,
	config_valid: false,
	config_up_to_date: false,
	something_else: '',
	patch: ''
};

let resolve: (value: LoggerStatus) => void;

const error_message_mapping = {
	'Npcap is not installed': 'Npcap is not installed',
	'Could not locate config file or config is invalid':
		'Could not locate config file or config is invalid',
	'The config is older than 7 days. It might not work anymore. Try to update the config by using:\r\nlogger.exe -u':
		'The config is older than 7 days. It might not work anymore.',
	'Something else went wrong. Please contact the developer.':
		'Something else went wrong. Please contact the developer.'
};

const logger_callback: LoggerCallback = (data, status) => {
	if (status === 'running') {
		if (Object.keys(error_message_mapping).includes(data as keyof typeof error_message_mapping)) {
			if (data === 'Npcap is not installed') {
				logger_status.npcap_installed = false;
			} else if (data === 'Could not locate config file or config is invalid') {
				logger_status.config_valid = false;
			} else if (
				data ===
				'The config is older than 7 days. It might not work anymore. Try to update the config by using:\r\nlogger.exe -u'
			) {
				logger_status.config_up_to_date = false;
			}
		} else if (data.includes('The config is from the patch: ')) {
			logger_status.patch = data.replace('The config is from the patch: ', '');
		}
	} else if (status === 'error') {
		console.error('error', data);
		logger_status.something_else = data;
	} else if (status === 'terminated') {
		console.log(data);
		resolve(logger_status);
	}
};

export async function check_status(): Promise<LoggerStatus> {
	logger_status = {
		npcap_installed: true,
		config_valid: true,
		config_up_to_date: true,
		something_else: '',
		patch: ''
	};
	await start_logger(logger_callback, 'status');

	return new Promise((res) => {
		resolve = res;
	});
}
