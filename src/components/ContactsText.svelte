<script>
</script>

<main>
    <div class="divBloc">
        <img src="/img/bloc.svg" alt="bloc" />
        <div class="text-container">
            <h1 class="textMainCont">Контакты</h1>
        </div>
    </div>
    <p class="textReview">
        Оставляйте свои отзывы на картах дубл гис, яндекс и др
    </p>
    <div class="infoCont">
        <div class="infoBlock">
            <p class="textInfoCont">+7 (3462) 66-64-64</p>
            <a href="#"><img src="/img/icon/phone.svg" alt="phone" /></a>
        </div>
        <div class="infoBlock">
            <p class="textInfoCont">7992022@mail.ru</p>
            <a href="#"><img src="/img/icon/mail2.svg" alt="phone" /></a>
        </div>
        <div class="infoBlock">
            <p class="textInfoCont">+79 (227) 99-20-22</p>
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
    <div class="borderDiv">
        <script
            type="text/javascript"
            charset="utf-8"
            async
            src="https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3Af315e0bca7fe4427a4f180573a635c8dd661d3047eeefffdadc094943b384db9&amp;width=100%&amp;height=632&amp;lang=ru_RU&amp;scroll=true"
        ></script>
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .divBloc {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
    }

    .text-container {
        display: flex;
        flex-direction: column;
        margin-left: 10px;
    }

    .textMainCont {
        font-size: 200%;
        font-weight: 600;
        font-family: "Releway", sans-serif;
        margin: 0; /* Add this line */
    }

    .textReview {
        font-size: 200%;
        font-family: "Jost", sans-serif;
    }

    .infoCont {
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: space-evenly;
    }

    .infoBlock {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .textInfoCont {
        margin: 0;
    }
    .infoBlock a {
        display: flex;
    }
    .infoBlock img {
        width: 90%;
        height: 90%;
    }

    .borderDiv {
        border: 2px solid black;
        width: 100%;
    }
</style>
