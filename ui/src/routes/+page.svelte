<script lang="ts">
	import { events, os } from '@neutralinojs/lib';

	async function spawn() {
		let pingProc = await os.spawnProcess('logger\\main -r');
		events.on('spawnedProcess', (evt) => {
			if (pingProc.id == evt.detail.id) {
				console.log(evt.detail);
				switch (evt.detail.action) {
					case 'stdOut':
						console.log(evt.detail.data);
						break;
					case 'stdErr':
						console.error(evt.detail.data);
						break;
					case 'exit':
						console.log(`Ping process terminated with exit code: ${evt.detail.data}`);
						break;
				}
			}
		});
	}
	spawn();
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
