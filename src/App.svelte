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

<Header />
<main>
	<MainLogo />
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