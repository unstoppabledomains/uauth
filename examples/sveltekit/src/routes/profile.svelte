<script lang="ts">
	import getUAuth from '$lib/uauth';
	import { goto } from '$app/navigation';

	const userPromise = getUAuth()
		.then((uauth) => uauth.user())
		.catch(() => goto('/'));

	const handleClick = () => {
		getUAuth()
			.then(async (uauth) => {
				await uauth.logout();
			})
			.catch((error) => {
				console.error(error);
				alert(String(error));
			});
	};
</script>

{#await userPromise}
	Loading...
{:then user}
	<pre>{JSON.stringify(user, null, 2)}</pre>
	<button on:click={handleClick}>Logout</button>
{/await}
