<script lang="ts">
	import type { Log } from './config';
	import GuildInfo from './guild-info.svelte';

	export let logs: Log[] = [];
	export let guild_index = 0;
	export let player_one_index = 0;
	export let player_two_index = 0;

	type Player = {
		name: string;
		guild: string;
	};

	type GuildStats = {
		kills: number;
		deaths: number;
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
	$: own_stats = logs.reduce(
		(acc, log) => {
			if (log.kill) {
				acc.kills += 1;
			} else {
				acc.deaths += 1;
			}
			return acc;
		},
		{ kills: 0, deaths: 0 } as GuildStats
	);

	$: enemy_stats = logs.reduce((acc, log) => {
		const guild = log.names[guild_index] || '-1';
		if (!acc[guild]) {
			acc[guild] = { kills: 0, deaths: 0 };
		}
		if (log.kill) {
			acc[guild].deaths += 1;
		} else {
			acc[guild].kills += 1;
		}
		return acc;
	}, {} as Record<string, GuildStats>);
</script>

{#if logs.length > 0}
	<div class="grid grid-cols-3 gap-3 max-h-[75vh] max-w-[80vw] overflow-auto px-0.5">
		<GuildInfo
			name={'Your Guild'}
			players={unique_members.map((m) => m.name)}
			kills={own_stats.kills}
			deaths={own_stats.deaths}
		/>
		{#each guilds as guild}
			<GuildInfo
				name={guild}
				players={unique_enemies.filter((e) => e.guild === guild).map((e) => e.name)}
				kills={enemy_stats[guild]?.kills || 0}
				deaths={enemy_stats[guild]?.deaths || 0}
			/>
		{/each}
	</div>
{:else}
	<p>No logs available to display guild information.</p>
{/if}
