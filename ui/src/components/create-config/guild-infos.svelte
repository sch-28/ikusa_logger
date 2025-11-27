<script lang="ts">
	import { type Log } from './config';
	import GuildInfo from './guild-info.svelte';

	export let logs: Log[] = [];
	export let guild_index = 0;
	export let player_one_index = 0;
	export let player_two_index = 0;

	type Player = {
		name: string;
		guild: string;
	};
	$: unique_members = logs
		.map((l) => ({ name: l.names[player_one_index], guild: 'own' }))
		.filter(
			(v, i, a) => a.findIndex((t) => t.name === v.name && t.guild === v.guild) === i
		) as Player[];
	$: unique_enemies = logs
		.map((l) => ({ name: l.names[player_two_index], guild: l.names[guild_index] }))
		.filter(
			(v, i, a) => a.findIndex((t) => t.name === v.name && t.guild === v.guild) === i
		) as Player[];

	$: guilds = Array.from(new Set(logs.map((l) => l.names[guild_index]))).sort();
</script>

{#if logs.length > 0}
	<div class="grid grid-cols-3 gap-4 max-h-[75vh] max-w-[80vw] overflow-auto px-0.5">
		<GuildInfo name={'Your Guild'} players={unique_members.map((m) => m.name)} />
		{#each guilds as guild}
			<GuildInfo
				name={guild}
				players={unique_enemies.filter((e) => e.guild === guild).map((e) => e.name)}
			/>
		{/each}
	</div>
{:else}
	<p>No logs available to display guild information.</p>
{/if}
