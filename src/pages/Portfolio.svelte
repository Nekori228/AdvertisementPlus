<script>
  import HeaderSec from "../components/HeaderSecond.svelte";
  import ItemPhoto from "../components/ItemPhoto.svelte";
  import Footer from "../components/Footer.svelte";
</script>

<header>
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
    integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
    crossorigin="anonymous"
  />
</header>
<main>
  <HeaderSec />
  <ItemPhoto />
  <div class="blocMar"><img src="img/square.svg" alt="square" /></div>
  <Footer />
</main>

<style>
  .blocMar {
    margin-top: 5%;
    margin-bottom: 13%;
    text-align: center;
  }
</style>
