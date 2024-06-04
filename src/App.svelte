<script>
	import { Router, Route, Link } from "svelte-routing";
	import Home from './pages/Home.svelte';
	import Contact from './pages/Contact.svelte';
	import Portfolio from './pages/Portfolio.svelte';
	export let url = "";
</script>

<header>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&family=Roboto+Slab:wght@100;200;300&display=swap" rel="stylesheet">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Raleway:ital,wght@0,100..900;1,100..900&family=Roboto+Slab:wght@100;200;300&display=swap" rel="stylesheet">
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</header>

<Router url="{url}">
	<div>
		<Route path="/"><Home /></Route>
		<Route path="Contact" component="{Contact}"></Route>
		<Route path="Portfolio" component="{Portfolio}"></Route>
	</div>
</Router>


<style>
	

	main {
		text-align: center;
		padding: 0em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
