<script lang="ts">
	import IoMdClipboard from 'svelte-icons/io/IoMdClipboard.svelte';
	import Icon from '../../svelte-ui/elements/icon.svelte';
	import { copy_to_clipboard, type Config } from './config';
	import Select from './select.svelte';
	import Checkbox from '../../svelte-ui/elements/checkbox.svelte';

	export let config: Config;
	export let options: {
		possible_kill_offsets: number[];
		possible_name_offsets: { offset: number; count: number }[][];
		name_indicies: number[];
		player_one_index: number;
		player_two_index: number;
		guild_index: number;
		kill_index: number;
		include_characters: boolean;
	};
	export let onChange: (new_options: typeof options) => void;

	function update_name_index(name_index: number, e: Event) {
		const index = +(e.target as HTMLSelectElement).value;
		options.name_indicies[name_index] = index;

		onChange(options);
	}

	function update_kill_index(e: Event) {
		const index = +(e.target as HTMLSelectElement).value;
		options.kill_index = index;

		onChange(options);
	}

	let include_characters = config.include_characters;

	$: {
		include_characters;
		onChange({
			...options,
			include_characters
		});
	}
</script>

{#if config}
	<div class="flex justify-between">
		<h3 class="font-bold">Config</h3>
		<button on:click={copy_to_clipboard.bind(null, config)}>
			<Icon icon={IoMdClipboard} />
		</button>
	</div>
	<div>
		<Checkbox bind:checked={include_characters} />
		<span>Characters</span>
	</div>
	<pre class="text-sm mt-2">
[GENERAL]
patch 		= 	{config.patch}
[IP]
server_1 	= 	20.76.13
server_2 	= 	20.76.14
[PACKAGE]
identifier 	= 	{config.identifier}
kill 		= 	<Select
			options={options.possible_kill_offsets}
			selected_value={options.kill_index}
			on_change={(e) => update_kill_index(e)}
		/>
player_one 	= 	<Select
			options={options.possible_name_offsets[options.player_one_index].map((entry) => entry.offset)}
			selected_value={options.name_indicies[options.player_one_index]}
			on_change={(e) => update_name_index(0, e)}
		/>
player_two 	= 	<Select
			options={options.possible_name_offsets[options.player_two_index].map((entry) => entry.offset)}
			selected_value={options.name_indicies[options.player_two_index]}
			on_change={(e) => update_name_index(1, e)}
		/>
guild 		= 	<Select
			options={options.possible_name_offsets[options.guild_index].map((entry) => entry.offset)}
			selected_value={options.name_indicies[options.guild_index]}
			on_change={(e) => update_name_index(2, e)}
		/>
</pre>
{/if}
