<script lang="ts">
	import VirtualList from '@sveltejs/svelte-virtual-list';
	import { onDestroy, onMount } from 'svelte';
	import { scrollbar_width } from '../../logic/util';
	import { TableSort, type HeaderColumn, type Row, type RowObject } from './table';
	import FaSort from 'svelte-icons/fa/FaSort.svelte';
	import FaSortUp from 'svelte-icons/fa/FaSortUp.svelte';
	import FaSortDown from 'svelte-icons/fa/FaSortDown.svelte';
	import Icon from '../elements/icon.svelte';
	import Input from '../elements/input.svelte';

	export let header: HeaderColumn<any>[] = [];
	export let rows: Row[] = [];
	export let searchable: boolean = false;
	export let title: string = '';
	export let height: number = 300;
	export let id: string;

	export let instance: HTMLDivElement | undefined = undefined;

	let sorted_rows: Row[] = [];
	let search_string: string = '';
	let header_element: HTMLDivElement;
	let current_sorts: HeaderColumn<any>[] = [];
	let v_list: HTMLDivElement;

	let v_list_container: VirtualList;

	$: {
		height;
		header;
		rows;
		search_string;
		handle_sort();
	}

	$: {
		if (search_string) {
			const table = $TableSort.find((sort) => sort.table_id === id);
			if (table) {
				table.search = search_string;
			} else {
				$TableSort.push({ table_id: id, search: search_string, scroll_y: 0, sorts: current_sorts });
			}
		}
	}

	$: grid_template =
		`grid-template-columns:` +
		header.map((column) => `minmax(75px, ${column.width ?? 1}fr)`).join(' ') +
		';';

	$: {
		if (v_list_container) {
			update_v_list();
			load_cached_table();
		}
	}

	function update_v_list() {
		v_list = document.querySelector('svelte-virtual-list-viewport') as HTMLDivElement;
		if (v_list) {
			v_list.addEventListener('scroll', handle_scroll);
			v_list.style.minWidth = 'fit-content';
			v_list.style.overflowY = 'scroll';
		}
	}

	function load_cached_table() {
		const table = $TableSort.find((sort) => sort.table_id === id);
		current_sorts =
			(table?.sorts
				.map((sort) => header.find((col) => col.label === sort.label))
				.filter((col) => col !== undefined) as HeaderColumn<any>[]) ?? [];

		current_sorts.forEach((col) => {
			col.sort_dir = table?.sorts.find((sort) => sort.label === col.label)?.sort_dir;
		});
		search_string = table?.search ?? '';
		table && handle_sort(table.scroll_y);
	}

	onDestroy(() => {
		v_list?.removeEventListener('scroll', handle_scroll);
	});

	function handle_scroll() {
		const data = $TableSort.find((sort) => sort.table_id === id);
		if (data) {
			data.scroll_y = v_list.scrollTop;
		} else {
			$TableSort.push({
				table_id: id,
				sorts: current_sorts,
				scroll_y: v_list.scrollTop
			});
		}
	}

	function handle_sort_change(column: HeaderColumn<any>, multiple = false) {
		if (!current_sorts.includes(column) && !multiple) {
			current_sorts.forEach((col) => {
				col.sort_dir = undefined;
			});
			current_sorts = [];
		} else if (current_sorts.includes(column) && !multiple) {
			current_sorts.forEach((col) => {
				if (col !== column) col.sort_dir = undefined;
			});
			current_sorts = current_sorts.filter((col) => col === column);
		}

		if (column.sortable) {
			if (column.sort_dir === 'asc') {
				column.sort_dir = 'des';
			} else if (column.sort_dir === 'des') {
				column.sort_dir = undefined;
			} else {
				column.sort_dir = 'asc';
			}

			if (!current_sorts.includes(column)) {
				current_sorts.push(column);
				handle_sort();
			}
		}
		header = header;

		const table_sort = $TableSort.find((sort) => sort.table_id === id);
		if (table_sort) {
			table_sort.sorts = current_sorts;
		} else {
			$TableSort.push({
				table_id: id,
				sorts: current_sorts,
				scroll_y: 0
			});
		}
	}

	function default_sort(a: any, b: any, ...alt: [any, any, 'asc' | 'des'][]): -1 | 0 | 1 {
		if (a < b) {
			return -1;
		} else if (a > b) {
			return 1;
		} else {
			if (alt.length > 0) {
				if (alt[0][2] === 'asc') return default_sort(alt[0][0], alt[0][1], ...alt.slice(1));
				else if (alt[0][2] === 'des') return default_sort(alt[0][1], alt[0][0], ...alt.slice(1));
			}
			return 0;
		}
	}

	function handle_sort(scroll_y = 0) {
		sorted_rows = [...rows];
		if (current_sorts.length > 0 && current_sorts.some((colum) => colum.sort_dir !== undefined)) {
			const col_index = header.indexOf(current_sorts[0]);
			sorted_rows = [...rows].sort((a, b) => {
				let a_val;
				let b_val;
				if (typeof a.columns[col_index] !== 'object') {
					a_val = a.columns[col_index];
				} else {
					const col = a.columns[col_index] as RowObject;
					a_val = col.value ?? col.label;
				}

				if (typeof b.columns[col_index] !== 'object') {
					b_val = b.columns[col_index];
				} else {
					const col = b.columns[col_index] as RowObject;
					b_val = col.value ?? col.label;
				}

				const alt: [any, any, 'asc' | 'des'][] = [];
				for (let i = 1; i < current_sorts.length; i++) {
					const column = current_sorts[i];
					if (column.sort_dir === undefined) continue;
					const col_index = header.indexOf(column);
					alt.push([a.columns[col_index], b.columns[col_index], column.sort_dir]);
				}

				const sort = current_sorts[0].sort;

				if (current_sorts[0].sort_dir === 'asc') {
					return sort?.(a_val, b_val) ?? default_sort(a_val, b_val, ...alt);
				} else if (current_sorts[0].sort_dir === 'des') {
					return sort?.(b_val, a_val) ?? default_sort(b_val, a_val, ...alt);
				} else {
					return 0;
				}
			});
		}

		sorted_rows = sorted_rows.filter((row) => {
			if (!search_string) return true;

			return row.columns.some((column) => {
				if (typeof column === 'string') {
					return column.toLowerCase().includes(search_string.toLowerCase());
				} else if (typeof column === 'number') {
					return column.toString().includes(search_string);
				} else {
					return false;
				}
			});
		});
		header = header;
		scroll_top(scroll_y);
	}

	function scroll_top(y: number) {
		if (v_list) setTimeout(() => v_list.scrollTo({ top: y, behavior: 'smooth'}), 20);
	}
</script>

<div
	class="overflow-x-auto h-full flex flex-col min-w-0 relative"
	style="height: {height}px;"
	bind:this={instance}
>
	{#if searchable}
		<Input
			class="mb-2 sm:max-w-[12rem] max-w-[8rem] shrink"
			placeholder="Search..."
			bind:value={search_string}
			size="sm"
		/>
	{/if}
	<div class="absolute left-1/2 -translate-x-1/2 text-xl font-bold">{title}</div>
	<div
		class="items-start grid w-full min-w-0"
		style={grid_template + `padding-right:${scrollbar_width}px`}
		bind:this={header_element}
	>
		{#each header as head, index}
			<button
				class="max-w-full flex items-center font-bold text-foreground
				{index > 0 ? 'justify-self-center' : ''}
				{head.sortable ? 'cursor-pointer' : 'cursor-default'}"
				on:click={(e) => handle_sort_change(head, e.shiftKey)}
			>
				<span class="truncate" title={head.title ?? head.label}>{head.label}</span>
				{#if head.sortable}
					{#if head.sort_dir === 'asc'}
						<Icon class="hidden sm:block" icon={FaSortUp} />
					{:else if head.sort_dir === 'des'}
						<Icon class="hidden sm:block" icon={FaSortDown} />
					{:else}
						<Icon class="hidden sm:block" icon={FaSort} />
					{/if}
				{/if}
			</button>
		{/each}
	</div>
	{#key height}
		<VirtualList items={sorted_rows} let:item={row} bind:this={v_list_container}>
			<button
				on:click={row.onclick}
				class="grid w-full text-foreground-secondary hover:text-foreground"
				style={grid_template}
			>
				{#each row.columns as column, index}
					<div
						class="max-w-full {index > 0 ? 'justify-self-center' : 'justify-self-start'}"
						style="color: {column.color}"
					>
						{#if typeof column === 'string' || typeof column === 'number'}
							<span class="truncate" title={column.toString()}>{column}</span>
						{:else if typeof column === 'object' && (typeof column.data === 'string' || typeof column.data === 'number')}
							<span class="truncate" title={column.label.toString()}>{column.label}</span>
						{:else}
							<Icon icon={column.label} />
						{/if}
					</div>
				{/each}
			</button>
		</VirtualList>
	{/key}
</div>
