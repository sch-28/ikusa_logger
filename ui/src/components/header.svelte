<script lang="ts">
	import { page } from '$app/stores';

	$: is_selected = (url: string) => {
		return $page.route.id?.includes(url);
	};
</script>

<header class="flex items-center justify-center">
	<div class="flex gap-2 items-end">
		<a class="text-3xl font-bold" href={'/'}>Ikusa</a>
	</div>
</header>
