import { os, filesystem } from '@neutralinojs/lib';

export async function open_file(path = '.') {
	return await os.showOpenDialog('Open a network recording', {
		defaultPath: path,
		filters: [{ name: 'Network File', extensions: ['pcap', 'npcap', 'pcapng'] }]
	});
}

export async function open_save_location(path = '.') {
	return await os.showSaveDialog('Save logs to file', {
		defaultPath: path,
		filters: [{ name: 'Log file', extensions: ['log'] }]
	});
}
