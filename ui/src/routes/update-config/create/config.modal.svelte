<script lang="ts">
	import type { Config } from '../config';

	export let config: Config;

	function get_date() {
		const today = new Date();
		const formatter = new Intl.DateTimeFormat('de', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
		return formatter.format(today).replace(/\//g, '.');
	}
</script>

{#if config}
	<pre class="text-sm">
[GENERAL]
patch = {get_date()}
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
