<script lang="ts">
	import getUAuth from '$lib/uauth';

	const handleClick = () => {
		getUAuth()
			.then(async (uauth) => {
				await uauth.login();
			})
			.catch((error) => {
				console.error(error);
				alert(String(error));
			});
	};
</script>

<button on:click={handleClick}>Login with Unstoppable</button>
