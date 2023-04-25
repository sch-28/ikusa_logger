<script lang="ts">
	import type { Config } from '../config';

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
</script>

{#if config}
	<pre class="text-sm">
[GENERAL]
patch = <input type="date" bind:value={config.patch} on:change={() => onChange(config)} class="!p-1 !rounded-lg" />
[IP]
server_1 = 20.76.13
server_2 = 20.76.14
[PACKAGE]
identifier = {config.identifier}
guild = {config.guild}
player_one = {config.player_one}
player_two = {config.player_two}
kill = {config.kill}
log_length = 600
name_length = 64
</pre>
{/if}
