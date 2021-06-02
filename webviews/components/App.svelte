<script lang="ts">
	interface Theme {
		label: string
	}
	let themes: Theme[] = []
	window.addEventListener('message', event => {
		const message = event.data; // The JSON data our extension sent
		themes = message.themes
	})
</script>

<h1>Themes</h1>
{#each themes as theme}
	<p>{theme.label}</p>
{/each}