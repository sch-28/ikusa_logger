<script lang="ts">
	import { init, events, os } from '@neutralinojs/lib';
	import { onMount } from 'svelte';
	import '../app.css';
	import Modal from '../svelte-ui/modal/modal.svelte';
	import { Toaster } from 'svelte-french-toast';
	import { get_remaining_height } from '../svelte-ui/util';
	import Header from '../components/header.svelte';

	let is_ready = false;

	onMount(() => {
		init();
		events.on('ready', () => {
			is_ready = true;
		});
	});

	let container: HTMLElement;
</script>

{#if is_ready}
	<div class="h-full w-full">
		<div class="h-screen p-4 w-full max-w-7xl mx-auto">
			<Header />
			<div
				class="mt-6 flex flex-col items-center"
				bind:this={container}
				style="height: {get_remaining_height(container, 16)}px;"
			>
				<slot />
			</div>
		</div>
		<Modal />
		<Toaster />
	</div>
{/if}
