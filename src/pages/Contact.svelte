<script>
  import HeaderSec from "../components/HeaderSecond.svelte";
  import ContactsText from "../components/ContactsText.svelte";
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
  <ContactsText />
  <div style="margin: 15%;"></div>
  <Footer />
</main>

<style>
</style>
