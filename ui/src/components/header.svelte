<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '../svelte-ui/elements/icon.svelte';
	import IoMdArrowRoundBack from 'svelte-icons/io/IoMdArrowRoundBack.svelte';

	$: show_arrow = $page.route.id !== '/';
</script>

<header class="flex items-center justify-center">
	<div class="flex gap-2 items-end">
		<a class="text-3xl font-bold text-gold mt-8 flex flex-col items-center" href={'/'}>
			{#if show_arrow}
				<div class="absolute left-1/2 -translate-x-16 translate-y-2">
					<Icon icon={IoMdArrowRoundBack} />
				</div>
			{/if}
			Ikusa
			<span class="text-xs font-light">Logger</span>
		</a>
	</div>
</header>
