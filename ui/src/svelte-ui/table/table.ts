import { writable } from 'svelte/store';
import type { Component } from '../util';

export type RowObject = {
	label: number | string | Component;
	color: string;
	value?: number | string;
};

export type Row = {
	columns: (number | string | Component | RowObject)[];
	onclick?: () => void;
};

export type HeaderColumn<T> = {
	label: string;
	width?: number;
	sort?: (a: T, b: T) => number;
	sortable?: boolean;
	sort_dir?: 'asc' | 'des';
	title?: string;
};

type TableData = {
	table_id: string;
	sorts: HeaderColumn<any>[];
	search?: string;
	scroll_y: number;
}[];

export const TableSort = writable<TableData>([]);
