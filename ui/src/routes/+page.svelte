<script lang="ts">
	import { events, os } from '@neutralinojs/lib';
	import { Toggle } from 'flowbite-svelte';
	import Button from '../svelte-ui/elements/button.svelte';
	import { goto } from '$app/navigation';

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
	/* spawn(); */
</script>

<div class="flex flex-col items-center justify-center gap-2">
	<Button class="w-32">Sniff</Button>
	<Button class="w-32" on:click={() => goto('/record')}>Record</Button>
	<Button class="w-32" on:click={() => goto('/open')}>Open</Button>

	<p class="text-red-500 mt-4 text-center">
		The config file is older than 7 days. It might not work anymore.
	</p>
	<Button size="sm" color="secondary">Create Config</Button>
</div>
