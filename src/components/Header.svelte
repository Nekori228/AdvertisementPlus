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
            <img src="/img/arrowMenu.svg" alt="Закрыть" />
        </button>
        <div class="dropdown">
            <button class="dropdown-button">
                <img class="arrow" src="/img/icon/arrow.svg" alt="Arrow" />
                <p class="maindropdowntext">Услуги печати</p>
            </button>
            <ul class="dropdown-list">
                <li><p class="lastdropdowntext">Печать на баннере</p></li>
                <li><p class="lastdropdowntext">Печать на сетке</p></li>
                <li><p class="lastdropdowntext">Печать на самоклейке</p></li>
                <li><p class="lastdropdowntext">Интерьерная печать</p></li>
            </ul>
        </div>
        <div class="dropdown">
            <button class="dropdown-button">
                <img class="arrow" src="/img/icon/arrow.svg" alt="Arrow" />
                <p class="maindropdowntext">Услуги печати</p>
            </button>
            <ul class="dropdown-list">
                <li><p class="lastdropdowntext">Печать на баннере</p></li>
                <li><p class="lastdropdowntext">Печать на сетке</p></li>
                <li><p class="lastdropdowntext">Печать на самоклейке</p></li>
                <li><p class="lastdropdowntext">Интерьерная печать</p></li>
            </ul>
        </div>
        <div class="dropdown">
            <button class="dropdown-button">
                <img class="arrow" src="/img/icon/arrow.svg" alt="Arrow" />
                <p class="maindropdowntext">Услуги печати</p>
            </button>
            <ul class="dropdown-list">
                <li><p class="lastdropdowntext">Печать на баннере</p></li>
                <li><p class="lastdropdowntext">Печать на сетке</p></li>
                <li><p class="lastdropdowntext">Печать на самоклейке</p></li>
                <li><p class="lastdropdowntext">Интерьерная печать</p></li>
            </ul>
        </div>
        <!-- <ul class="ulMenu">
            <li></li>
            <div class="block1"></div>
            <li>
                <a href=""><h2>Портфолио</h2></a>
            </li>
            <div class="block1"></div>
            <li>
                <a href=""><h2>Портфолио</h2></a>
            </li>
        </ul> -->
    </nav>
    <img src="/img/logo_small.svg" alt="small logo" width="200" height="64" />
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
        background: #e9e0cf;
        justify-content: space-between;
    }

    .block1 {
        padding: 10px;
    }

    nav {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 400px;
        background-color: #e9e0cf;
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
        color: #34828c;
        text-decoration: none;
    }

    h2 {
        font-size: 1.1em;
        font-weight: 500;
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
        background-color: #e9e0cf;
        border: none;
        cursor: pointer;
        padding: 10px;
        font-size: 16px;
    }

    .dropdown {
        position: relative;
    }

    .dropdown-button {
        background-color: rgba(255, 255, 255, 0);
        width: 100%;
        height: 70px;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .arrow {
        display: inline-block;
        width: 15px;
        height: 15px;
        margin-right: 20px;
        background-size: cover;
        transform: rotate(90deg);
        transition: transform 0.3s ease;
    }

    .dropdown-button:active,
    .dropdown-button:focus {
        background-color: rgba(255, 255, 255, 0.37);
    }

    .dropdown-list {
        position: absolute;
        top: 80%;
        left: 20%;
        right: 20%;
        display: none;
        list-style-type: none;
    }

    .dropdown-button:focus + .dropdown-list {
        display: block;
    }

    .dropdown-button:focus .arrow {
        transform: rotate(0deg);
    }

    .maindropdowntext{
        font-size: 25px;
        font-family: 'Raleway', sans-serif;
        font-weight: 500;
    }

    .lastdropdowntext {
        font-size: 18px;
        font-family: 'Jost', sans-serif;
        font-weight: 400;
    }
</style>