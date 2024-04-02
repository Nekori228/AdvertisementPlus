<script>
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }
</script>

<header>
    <button class="burger-button" on:click={toggleMenu}>
        <div class="burger-menu" class:open={isMenuOpen}>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </button>
    <nav class:open={isMenuOpen}>
        <button class="close-button" on:click={toggleMenu}>
            <img src="/img/arrowMenu.svg" alt="Закрыть">
        </button>
        <ul class="ulMenu">
            <li>
                <a href=""><h2>Контакты</h2></a>
            </li>
            <div class="block1"></div>
            <li>
                <a href=""><h2>Портфолио</h2></a>
            </li>
        </ul>
    </nav>
    <img src="/img/logo_small.svg" alt="small logo" width="200" height="64">
    <ul class="ulHeader">
        <li>
            <a href=""><h2>Контакты</h2></a>
        </li>
        <div class="block1"></div>
        <li>                
            <a href=""><h2>Портфолио</h2></a>
        </li>
    </ul>
</header>

<style>
    header {
        display: flex;
        align-items: center;
        margin: 0;
        padding: 0% 5% 0%;
        background: #E9E0CF;
        justify-content: space-between;
        height: 5em;
    }

    .block1 {
        padding: 20px;
    }
    
    nav {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 300px;
        background-color: #E9E0CF;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }

    nav.open {
        transform: translateX(0);
    }

    .ulHeader {
        display: flex;
        list-style: none;
        margin-left: auto;
        padding: 0;
    }

    .ulMenu {
        display: flex;
        flex-direction: column;
        list-style: none;
        margin-left: auto;
        padding: 0;
    }
    
    a {
        color: black;
        text-decoration: none;
    }

    a:hover {
        color: #34828C;
        text-decoration: none;
    }

    h2 {
        font-family: "Jost", sans-serif;
        font-size: 35px;
        font-weight: 400;
    }

    .burger-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        margin-right: 20px;
    }

    .burger-menu div {
        width: 30px;
        height: 3px;
        background-color: #000;
        margin: 5px 0;
        transition: transform 0.3s ease; /* Добавляем анимацию */
    }

    .burger-menu.open div:first-child {
        transform: rotate(45deg) translate(5px, 5px); /* Вращаем первую линию */
    }

    .burger-menu.open div:nth-child(2) {
        opacity: 0; /* Скрываем вторую линию */
    }

    .burger-menu.open div:last-child {
        transform: rotate(-45deg) translate(7px, -7px); /* Вращаем третью линию */
    }

    .close-button {
        background-color: #E9E0CF;
        border: none;
        cursor: pointer;
        padding: 10px;
        font-size: 16px;
    }
</style>
