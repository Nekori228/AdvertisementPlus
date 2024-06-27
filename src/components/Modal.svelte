<script>
    import { createEventDispatcher } from "svelte";

    export let isOpen = false;
    export let content = "";

    const dispatch = createEventDispatcher();

    function closeModal() {
        dispatch("close");
    }
</script>

{#if isOpen}
    <div class="modal-overlay" on:click={closeModal}>
        <div class="modal-content" on:click|stopPropagation>
            <img class="modal-image" src="img/backModal2.png" />
            <div class="modal-body">
                <p class="modal-main">
                    Закажите услугу напрямую<br />у производителя!
                </p>
                <p class="modal-second">Контакты</p>
                <div class="container">
                    <div class="block phones">
                        <div class="phone-number">+7 (123) 456-7890</div>
                        <div class="phone-number">+7 (987) 654-3210</div>
                        <div class="phone-number">+7 (987) 654-3210</div>
                    </div>
                    <div class="block icons">
                        <div class="app-icon">
                            <img src="/img/icon/phone.svg" />
                        </div>
                        <div class="app-icon">
                            <img src="/img/icon/mail2.svg" />
                        </div>
                        <div class="row-position">
                            <div class="app-icon">
                                <img src="/img/icon/tgBrown.svg" />
                            </div>
                            <div class="app-icon">
                                <img src="/img/icon/viderBrown.svg" />
                            </div>
                            <div class="app-icon">
                                <img src="/img/icon/watsappBrown.svg" />
                            </div>
                            <div class="app-icon">
                                <img src="/img/icon/phone.svg" />
                            </div>
                        </div>
                    </div>
                </div>
                <button class="turquoise-button" on:click={closeModal}
                    ><p class="button-thanks">Спасибо</p></button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        background-color: rgba(0, 0, 0, 0.5);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 103%;
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        position: relative;
        width: 45%;
        height: 60%;
        border-radius: 8px;
        overflow: hidden;
    }

    .modal-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
    }

    .modal-body {
        padding: 20px;
        font-size: 1em;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .modal-main {
        font-size: 40px;
        font-family: "Raleway", sans-serif;
        font-weight: 600;
        text-align: center;
        margin-bottom: 5%;
    }

    .modal-second {
        font-family: "Jost", sans-serif;
        font-size: 30px;
        font-weight: 400;
        margin: 0;
    }

    .row-position {
        display: flex;
        flex-direction: row;
    }

    .container {
        display: flex;
        padding: 0 20px;
        align-items: center;
        justify-content: center;
        width: 81%;
    }

    .button-thanks {
        font-family: "Jost", sans-serif;
        font-size: 180%;
        font-weight: 500;
        margin: 0;
    }

    .turquoise-button {
        background-color: #31848a; /* Бирюзовый цвет */
        color: white;
        padding: 1% 6%;
        border: none;
        border-radius: 16px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Тень */
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        margin-top: 3%;
    }

    .turquoise-button:hover {
        background-color: #3bccc1; /* Более тёмный бирюзовый при наведении */
    }

    .block {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .phones {
        align-items: flex-end;
        margin: 2%;
    }

    .icons {
        align-items: flex-start;
        margin: 2%;
    }

    .block .phone-number,
    .block .app-icon {
        margin: 10px 5px;
    }

    .phone-number {
        font-family: "Jost", sans-serif;
        font-size: 200%;
        font-weight: 300;
        padding: 2px;
    }
</style>
