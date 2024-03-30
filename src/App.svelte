<script>
	import Header from "./components/Header.svelte";
	import Footer from "./components/Footer.svelte";
	import MainLogo from "./components/MainLogo.svelte";
	import BrendText from "./components/BrendText.svelte";
	import WorkHMAO from "./components/WorkHMAO.svelte";
	import OurAdwantage from "./components/OurAdwantage.svelte";
	import Provide from "./components/Provide.svelte";
	import OurProjects from "./components/OurProjects.svelte";
</script>

<header>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&family=Roboto+Slab:wght@100;200;300&display=swap" rel="stylesheet">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Raleway:ital,wght@0,100..900;1,100..900&family=Roboto+Slab:wght@100;200;300&display=swap" rel="stylesheet">
</header>

<Header />
<main>
	<MainLogo />
	<d
	<BrendText />
	<WorkHMAO />
	<OurAdwantage />
	<Provide />
	<OurProjects />
</main>
<Footer />


<style>
	

	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>