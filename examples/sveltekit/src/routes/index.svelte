<script lang="ts">
	import getUAuth from '$lib/uauth';
	import type { UserInfo } from '@uauth/js';
	import { onMount } from 'svelte';

	let userPromise: Promise<UserInfo>;
	onMount(() => {
		userPromise = getUAuth(window).then(async (uauth) => uauth.user());
	});

	const handleLogin = () => {
		getUAuth(window)
			.then(async (uauth) => {
				await uauth.loginWithPopup();
				userPromise = uauth.user();
			})
			.catch((error) => {
				console.error(error);
				alert(String(error));
			});
	};

	const handleLogout = () => {
		getUAuth(window)
			.then(async (uauth) => {
				await uauth.logout({ rpInitiatedLogout: false });
				userPromise = Promise.reject();
			})
			.catch((error) => {
				console.error(error);
				alert(String(error));
			});
	};

	export const ssr = false;
</script>

{#await userPromise then user}
	<pre>{JSON.stringify(user, null, 2)}</pre>
	<button on:click={handleLogout}>Logout</button>
{:catch error}
	<button on:click={handleLogin}>Login with Unstoppable</button>
{/await}
