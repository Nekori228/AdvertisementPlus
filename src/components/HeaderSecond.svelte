<script>
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
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
        <div class="accordion" id="accordionExample">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button
                        class="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseOne"
                        aria-expanded="true"
                        aria-controls="collapseOne"
                    >
                        Accordion Item #1
                    </button>
                </h2>
                <div
                    id="collapseOne"
                    class="accordion-collapse collapse show"
                    data-bs-parent="#accordionExample"
                >
                    <div class="accordion-body">
                        <button
                            type="button"
                            class="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal"
                        >
                            Launch demo modal
                        </button>
                    </div>
                </div>
            </div>
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseTwo"
                        aria-expanded="false"
                        aria-controls="collapseTwo"
                    >
                        Accordion Item #2
                    </button>
                </h2>
                <div
                    id="collapseTwo"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionExample"
                >
                    <div class="accordion-body">
                        <strong
                            >This is the second item's accordion body.</strong
                        >
                        It is hidden by default, until the collapse plugin adds the
                        appropriate classes that we use to style each element. These
                        classes control the overall appearance, as well as the showing
                        and hiding via CSS transitions. You can modify any of this
                        with custom CSS or overriding our default variables. It's
                        also worth noting that just about any HTML can go within
                        the
                        <code>.accordion-body</code>, though the transition does
                        limit overflow.
                    </div>
                </div>
            </div>
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseThree"
                        aria-expanded="false"
                        aria-controls="collapseThree"
                    >
                        Accordion Item #3
                    </button>
                </h2>
                <div
                    id="collapseThree"
                    class="accordion-collapse collapse"
                    data-bs-parent="#accordionExample"
                >
                    <div class="accordion-body">
                        <strong>This is the third item's accordion body.</strong
                        >
                        It is hidden by default, until the collapse plugin adds the
                        appropriate classes that we use to style each element. These
                        classes control the overall appearance, as well as the showing
                        and hiding via CSS transitions. You can modify any of this
                        with custom CSS or overriding our default variables. It's
                        also worth noting that just about any HTML can go within
                        the
                        <code>.accordion-body</code>, though the transition does
                        limit overflow.
                    </div>
                </div>
            </div>
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
