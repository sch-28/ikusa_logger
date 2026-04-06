<script lang="ts">
	export let name: string;
	export let players: string[];
	export let kills = 0;
	export let deaths = 0;

	$: kd = deaths === 0 ? (kills > 0 ? kills.toFixed(2) : '0.00') : (kills / deaths).toFixed(2);
</script>

<div class="min-w-0">
	<h4 class="font-semibold mb-1 truncate">{players.length}: {name}</h4>
	<p class="text-xs mb-1.5">
		<span class="text-submarine-500">K: {kills}</span>
		<span class="mx-1 text-gray-500">|</span>
		<span class="text-red-500">D: {deaths}</span>
		<span class="mx-1 text-gray-500">|</span>
		<span>K/D: {kd}</span>
	</p>
	<ul class="list-disc list-inside h-32 max-h-32 overflow-y-auto border p-2">
		{#each players as player}
			<li class="truncate" title={player}>{player}</li>
		{/each}
	</ul>
</div>
