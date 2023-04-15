<script lang="ts">
	export let selected_value: number = 0;
	export let options: string[] = [];
	export let on_change: (e: Event) => void = (e) => {};
</script>

<select
	bind:value={selected_value}
	class="!w-32 p-1 bg-transparent rounded-lg [&_option]:!bg-transparent"
	on:change={on_change}
>
	{#each options as option, i}
		<option value={i} class="!bg-red-500 rounded-lg" style="background-color: red;">
			{option}
		</option>
	{/each}
</select>
