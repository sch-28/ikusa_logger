import { os } from '@neutralinojs/lib';

export async function open_file(path = '.') {
	return await os.showOpenDialog('Open a diagram', {
		defaultPath: path,
		filters: [{ name: 'Network File', extensions: ['pcap', 'npcap'] }]
	});
}
