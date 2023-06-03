<script lang="ts">
	import IoMdClipboard from 'svelte-icons/io/IoMdClipboard.svelte';
	import { clipboard } from '@neutralinojs/lib';
	import type { Config } from '@sveltejs/kit';
	import Icon from '../../svelte-ui/elements/icon.svelte';

	export let config: Config;

	export let onChange: (config: Config) => void;

	$: config = {
		...config,
		patch: config.patch ?? get_date()
	};

	function get_date() {
		const today = new Date();
		/* const formatter = new Intl.DateTimeFormat('de', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
		return formatter.format(today).replace(/\//g, '.'); */
		const isoDate = today.toISOString().substr(0, 10);
		return isoDate;
	}

	function get_formatted_date(date_string: string) {
		const date = new Date(date_string);
		const formatter = new Intl.DateTimeFormat('de', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
		return formatter.format(date).replace(/\//g, '.');
	}

	function copy_to_clipboard() {
		clipboard.writeText(`[GENERAL]
patch=${config.patch ? get_formatted_date(config.patch) : get_formatted_date(get_date())}
[IP]
server_1 = 20.76.13
server_2 = 20.76.14
[PACKAGE]
identifier = ${config.identifier}
guild = ${config.guild}
player_one = ${config.player_one}
player_two = ${config.player_two}
kill = ${config.kill}
log_length = 600
name_length = 64`);
	}
</script>

{#if config}
	<div class="flex justify-between">
		<h3 class="font-bold">Config</h3>
		<button on:click={copy_to_clipboard}>
			<Icon icon={IoMdClipboard} />
		</button>
	</div>

	<pre class="text-sm mt-2">
[GENERAL]
patch 		= 	<input
			type="date"
			bind:value={config.patch}
			on:change={() => onChange(config)}
			class="!px-1 !py-0.5 !rounded-lg"
		/>
[IP]
server_1 	= 	20.76.13
server_2 	= 	20.76.14
[PACKAGE]
identifier 	= 	{config.identifier}
guild 		= 	{config.guild}
player_one 	= 	{config.player_one}
player_two 	= 	{config.player_two}
kill 		= 	{config.kill}
log_length 	= 	600
name_length = 	64
</pre>
{/if}
