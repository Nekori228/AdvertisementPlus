<script>
    import { Link } from "svelte-routing";
    import Modal from './Modal.svelte';

    let isMenuOpen = false;
    let isModalOpen = false;
    let modalContent = "";

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }

    function closeMenu() {
        isMenuOpen = false;
    }

    let items = [
        {
            title: "Услуги печати",
            content: [
                "Печать на баннере",
                "Печать на сетке",
                "Печать на самоклейке",
                "Интерьерная печать",
            ],
            open: false,
        },
        {
            title: "Вывески и таблички",
            content: ["Item 2.1", "Item 2.2", "Item 2.3"],
            open: false,
        },
        {
            title: "Прочие услуги",
            content: ["Item 3.1", "Item 3.2", "Item 3.3"],
            open: false,
        },
    ];

    function toggle(index) {
        items = items.map((item, i) => ({
            ...item,
            open: i === index ? !item.open : item.open,
        }));
    }

    function openModal(content) {
        modalContent = content;
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        modalContent = "";
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

    {#if isMenuOpen}
        <div class="overlay" on:click={closeMenu}></div>
    {/if}

    <nav class:open={isMenuOpen}>
        <button class="close-button" on:click={toggleMenu}>
            <img
                src="/img/arrowMenu.svg"
                width="25"
                height="25"
                alt="Закрыть"
            />
        </button>
        <div class="accordion">
            {#each items as item, index}
                <div
                    class="accordion-header-container {item.open ? 'active' : ''}"
                    on:click={() => toggle(index)}
                >
                    <div class="accordion-header">
                        <img
                            class="arrow {item.open ? 'open' : ''}"
                            src="/img/icon/arrow.svg"
                            alt="Arrow"
                        />
                        {item.title}
                    </div>
                </div>
                {#if item.open}
                    <div class="accordion-content-container">
                        <div class="accordion-content">
                            <ul>
                                {#each item.content as subitem}
                                    <li on:click={() => openModal(subitem)}>{subitem}</li>
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
</header>

<Modal isOpen={isModalOpen} content={modalContent} on:close={closeModal} />


<style>
    header {
        display: flex;
        align-items: center;
        margin: 0;
        padding: 1% 5% 1%;
        background: #e9e0cf;
        justify-content: space-between;
    }

    .ulHeader {
        display: flex;
        list-style: none;
        margin-left: auto;
        padding: 0;
        margin-top: 1%;
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
        transition: transform 0.3s ease;
    }

    .burger-menu.open div:first-child {
        transform: rotate(45deg) translate(5px, 5px);
    }

    .burger-menu.open div:nth-child(2) {
        opacity: 0;
    }

    .burger-menu.open div:last-child {
        transform: rotate(-45deg) translate(7px, -7px);
    }

    nav {
        text-align: end;
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 400px;
        background-color: #e9e0cf;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.5);
        z-index: 1000;
    }

    nav.open {
        transform: translateX(0);
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 500;
    }

    .accordion {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
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
        text-align: left;
        display: flex;
        align-items: center;
    }

    .accordion-header .arrow {
        transition: transform 0.3s ease;
    }

    .accordion-header .arrow.open {
        transform: rotate(-1deg);
    }

    .accordion-content-container {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .accordion-header-container.active {
        background-color: rgba(255, 255, 255, 37%);
    }

    .accordion-content {
        padding: 15px;
        width: 100%;
        max-width: 600px;
        text-align: left;
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

    .close-button {
        background-color: #e9e0cf;
        border: none;
        cursor: pointer;
        padding: 20px;
        font-size: 16px;
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
</style>