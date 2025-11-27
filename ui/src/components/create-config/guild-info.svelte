<script lang="ts">
	export let name: string;
	export let players: string[];
</script>

<div>
	<h4 class="font-semibold mb-1 truncate">{players.length}: {name}</h4>
	<ul class="list-disc list-inside h-32 max-h-32 overflow-y-auto border p-2">
		{#each players as player}
			<li class="truncate" title={player}>{player}</li>
		{/each}
	</ul>
</div>
