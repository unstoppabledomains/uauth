<script lang="ts">
	import { goto } from '$app/navigation';
	import getUAuth from '$lib/uauth';
	import { onMount } from 'svelte';

	onMount(() => {
		getUAuth()
			.then(async (uauth) => {
				await uauth.loginCallback(/* { url: window.location.href } */);
				window.location.assign('/profile');
			})
			.catch((error) => {
				console.error(error);
				alert(error);
				goto('/');
			});
	});
</script>
