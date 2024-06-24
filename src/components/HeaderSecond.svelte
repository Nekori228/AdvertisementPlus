<script>
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }

    let items = [
        {
            title: "Услуги печати",
            content: [
                "Печать на баннере",
                "Печать на сетке",
                "Печать на самоклейке",
                "Интерьерная печать"
            ],
            open: false
        },
        {
            title: "Вывески и таблички",
            content: [
                "Item 2.1",
                "Item 2.2",
                "Item 2.3"
            ],
            open: false
        },
        {
            title: "Прочие услуги",
            content: [
                "Item 3.1",
                "Item 3.2",
                "Item 3.3"
            ],
            open: false
        }
    ];

    function toggle(index) {
        items = items.map((item, i) => ({
            ...item,
            open: i === index ? !item.open : item.open
        }));
    }

    import { Link } from "svelte-routing";
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
        <div class="accordion">
            {#each items as item, index}
        <div class="accordion-header-container {item.open ? 'active' : ''}" on:click={() => toggle(index)}>
            <div class="accordion-header">
                <img class="arrow {item.open ? 'open' : ''}" src="/img/icon/arrow.svg" alt="Arrow" />
                {item.title}
            </div>
        </div>
        {#if item.open}
            <div class="accordion-content-container">
                <div class="accordion-content">
                    <ul>
                        {#each item.content as subitem}
                            <li>{subitem}</li>
                        {/each}
                    </ul>
                </div>
            </div>
        {/if}
    {/each}
        </div>
    </nav>
    <img src="/img/logo_small.svg" alt="small logo" width="200" height="64" />
    <ul class="ulHeader">
        <li>
            <Link style="text-decoration: none;" to="/"
                ><h2 class="btnNav">Главная</h2></Link
            >
        </li>
        <div class="block1"></div>
        <li>
            <Link style="text-decoration: none;" to="Contact"
                ><h2 class="btnNav">Контакты</h2></Link
            >
        </li>
        <div class="block1"></div>
        <li>
            <Link style="text-decoration: none;" to="Portfolio"
                ><h2 class="btnNav">Портфолио</h2></Link
            >
        </li>
    </ul>
    <div
        class="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
    >
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <img
                src="/img/backModal2.png"
                alt="Background"
                class="modal-background"
            />
            <div class="modal-header">
                <h1 class="h1MainText" id="exampleModalLabel">
                    Закажите услугу напрямую <br /> у производителя!
                </h1>
            </div>
                <div class="contentGrid">
                   
                <div class="modal-body">
                    <p class="infoText">Контакты</p>
                    <div class="infoBlock2">
                        <p class="infoText">+7 (3462) 66-64-64</p>
                        <a href="#"
                            ><img src="/img/icon/phone.svg" alt="phone" /></a
                        >
                    </div>
                    <div class="infoBlock2">
                        <p class="infoText">7992022@mail.ru</p>
                        <a href="#"
                            ><img src="/img/icon/mail2.svg" alt="phone" /></a
                        >
                    </div>
                    <div class="infoBlock2">
                        <p class="infoText">+79 (227) 99-20-22</p>
                        <a href="#" class="imgIcon"
                            ><img src="/img/icon/tg.svg" alt="phone" /></a
                        >
                        <a href="#" class="imgIcon"
                            ><img src="/img/icon/vider.svg" alt="phone" /></a
                        >
                        <a href="#" class="imgIcon"
                            ><img src="/img/icon/watsapp.svg" alt="phone" /></a
                        >
                    </div>
                </div>
                </div>
            </div>
            <!-- <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
        </div>
    </div>
    <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"
    ></script>
</header>

<style>
    header {
        display: flex;
        align-items: center;
        margin: 0;
        padding: 1% 5% 1%;
        background: #e9e0cf;
        justify-content: space-between;
    }

    .h1MainText {
        color: #000;
        text-align: center;
    }

    .dropdown {
        position: relative;
        display: inline-block;
    }

    .infoBlock2 {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .infoText {
        color: #000;
        font-size: 140%;
        font-family: "Jost", sans-serif;
    }

    .modal-body {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .modal-header {
        border-bottom: 0;
        justify-content: center;
    }

    .dropdown-content {
        display: none;
        position: absolute;
        background-color: #f9f9f9;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
        z-index: 1;
    }

    .dropdown-content a {
        color: black;
        padding: 12px 16px;
        text-decoration: none;
        display: block;
    }

    .dropdown-content a:hover {
        background-color: #f1f1f1;
    }

    .dropdown-content.show {
        display: block;
    }

    .modal-content {
        position: relative;
        color: white; /* Цвет текста для контраста с фоновым изображением */
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        position: relative;
        z-index: 1;
    }

    .modal-title,
    .btn {
        color: white;
    }

    .modal-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
    }

    .accordion {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center; /* Центрирование элементов по горизонтали */
}

.accordion-header-container {
    width: 100%;
    display: flex;
    justify-content: center;
}

.accordion-header {
    font-size: 25px;
    font-family: "Raleway", sans-serif;
    font-weight: 500;
    margin-left: 10%;
    margin-right: 10%;
    padding: 15px;
    background-color: rgba(255, 255, 255, 0);
    cursor: pointer;
    border-bottom: 0px solid #ccc;
    width: 100%;
    max-width: 600px;
    text-align: left; /* Прижатие текста к левому краю */
    display: flex;
    align-items: center;
}

.accordion-header .arrow {
    transition: transform 0.3s ease;
}

.accordion-header .arrow.open {
    transform: rotate(-1deg); /* Поворот стрелки вниз */
}

.accordion-content-container {
    width: 100%;
    display: flex;
    justify-content: center;
}

.accordion-header-container.active {
    background-color: rgba(255, 255, 255, 37%); /* Цвет при открытом состоянии */
}

.accordion-content {
    padding: 15px;
    width: 100%;
    max-width: 600px;
    text-align: left; /* Прижатие текста к левому краю */
    margin-left: 18%;
    margin-right: 10%;
}

.accordion-content ul {
    list-style-type: none;
    padding: 0;
}

.accordion-content li {
    padding: 5px 0;
    font-size: 18px;
    font-family: "Jost", sans-serif;
    font-weight: 400;
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
        margin-top: 1%;
    }

    .ulMenu {
        display: flex;
        flex-direction: column;
        list-style: none;
        margin-left: auto;
        padding: 0;
    }

    .btnNav {
        color: black;
        text-decoration: none;
    }

    .btnNav:hover {
        color: #34828c;
        text-decoration: none;
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

    .maindropdowntext {
        font-size: 25px;
        font-family: "Raleway", sans-serif;
        font-weight: 500;
    }

    .lastdropdowntext {
        font-size: 18px;
        font-family: "Jost", sans-serif;
        font-weight: 400;
    }
</style>
