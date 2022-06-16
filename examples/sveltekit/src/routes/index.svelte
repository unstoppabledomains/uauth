<script lang="ts">
	import type { UserInfo } from '@uauth/js';
	import UAuth from '@uauth/js';
	import { onMount } from 'svelte';

	const uauth = new UAuth({
		clientID: '1421c29a-cf20-4a5c-a6fa-65fbcc8c6151',
		redirectUri: 'http://localhost:5000',
		scope: 'openid wallet'
	});

	let userPromise: Promise<UserInfo>;
	onMount(() => {
		userPromise = uauth.user();
	});

	const handleLogin = () => {
		uauth
			.loginWithPopup()
			.then(async () => {
				userPromise = uauth.user();
			})
			.catch((error) => {
				console.error(error);
				alert(String(error));
			});
	};

	const handleLogout = () => {
		uauth
			.logout({ rpInitiatedLogout: false })
			.then(async () => {
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
