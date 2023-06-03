<script lang="ts">
	export let selected_value: number|string = 0;
	export let options: (string | number)[] = [];
	export let on_change: (e: Event) => void = (e) => {};
</script>

<select
	bind:value={selected_value}
	class="!w-32 p-1 bg-transparent rounded-lg [&_option]:!bg-transparent !ring-gold truncate"
	on:change={on_change}
>
	{#each options as option, i}
		<option value={i} class="rounded-lg">
			{option}
		</option>
	{/each}
</select>
