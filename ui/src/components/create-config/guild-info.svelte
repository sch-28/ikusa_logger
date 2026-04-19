<script lang="ts">
	import { calculate_kd } from './config';

	export let name: string;
	export let players: string[];
	export let kills = 0;
	export let deaths = 0;

	$: kd = calculate_kd(kills, deaths);
</script>

<div class="rounded-lg bg-white/5 p-2.5 flex flex-col gap-1.5 min-w-0">
	<div>
		<p class="text-xs uppercase tracking-wide text-gray-400 truncate">{name}</p>
		<p class="text-xs text-gray-500">{players.length} players</p>
	</div>
	<p class="text-xs">
		<span class="text-submarine-500">K {kills}</span>
		<span class="text-gray-500 mx-1">·</span>
		<span class="text-red-500">D {deaths}</span>
		<span class="text-gray-500 mx-1">·</span>
		<span class="font-semibold">{kd}</span>
	</p>
	<ul class="text-xs h-28 overflow-y-auto space-y-0.5">
		{#each players as player}
			<li class="truncate text-gray-200" title={player}>{player}</li>
		{/each}
	</ul>
</div>
