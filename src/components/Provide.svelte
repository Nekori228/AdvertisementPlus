<script>
    let photos = [
           { src: "/img/imgProvide1.svg", alt: 'фото 1' },
           { src: "/img/imgProvide2.svg", alt: 'фото 2' },
           { src: "/img/imgProvide3.svg", alt: 'фото 3' },
           { src: "/img/imgProvide4.svg", alt: 'фото 4' },
           { src: "/img/imgProvide5.svg", alt: 'фото 5' },
           { src: "/img/imgProvide6.svg", alt: 'фото 6' }
       ];
   </script>
   
   <main>
    <div class="content">
        <div class="text">
            <h1>Мы предоставляем</h1>
            <p>Размещение наружной рекламы<br>Печать баннеров и постеров<br>Внутреннее оформление<br>Реклама на транспорте<br>Крышные установки<br>Стелы</p>
            <div class="marginText"></div>
            <p>И другие конструкции любой сложности.</p>
        </div>
        <div class="photos">
            <div class="grid">
                {#each photos as photo}
                    <img src={photo.src} alt={photo.alt}>
                {/each}
            </div>
        </div>
    </div>
</main>

<style>
    main {
        margin: 0;
        display: flex;
        justify-content: space-between;
        margin: 0% 5% 0% 5%;
    }

    .content {
        display: flex;
        width: 100%;
    }

    .text {
        flex-grow: 1;
        padding-left: 10%;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 10px;
    }

    .photos img {
        max-width: 100%;
        max-height: 100%;
    }

    .marginText {
        margin-top: 50%;
    }

    p {
        font-size: 1.4em;
        text-align: left;
        margin: 0; /* Убираем внешние отступы параграфа */
    }

    h1 {
        text-align: left;
        margin: 0 0 10px 0; /* Убираем внешние отступы заголовка */
    }
</style>
