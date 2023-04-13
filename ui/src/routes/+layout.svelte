<script lang="ts">
	import { init, events, os } from '@neutralinojs/lib';
	import { onMount } from 'svelte';

	let is_ready = false;

	onMount(() => {
		init();
		events.on('ready', () => {
			is_ready = true;
		});
	});
</script>

{#if is_ready}
	<slot />
{/if}
