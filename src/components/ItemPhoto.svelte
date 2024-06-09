<script>
</script>

<main>
    <div class="text-container">
        <h1 class="textMainCont">Портфолио</h1>
    </div>
    <div class="containerDiv">
        <div class="gallery">
            <figure class="gallery__item gallery__item--1">
                <img
                    src="img/photoItems/img1.svg"
                    class="gallery__img"
                    alt="img1"
                />
            </figure>
            <figure class="gallery__item gallery__item--2">
                <img
                    src="img/photoItems/img2.svg"
                    class="gallery__img"
                    alt="img2"
                />
            </figure>
            <figure class="gallery__item gallery__item--3">
                <img
                    src="img/photoItems/img3.svg"
                    class="gallery__img"
                    alt="img3"
                />
            </figure>
            <figure class="gallery__item gallery__item--4">
                <img
                    src="img/photoItems/img4.svg"
                    class="gallery__img"
                    alt="img4"
                />
            </figure>
            <figure class="gallery__item gallery__item--5">
                <img
                    src="img/photoItems/img5.svg"
                    class="gallery__img"
                    alt="img5"
                />
            </figure>
            <figure class="gallery__item gallery__item--6">
                <img
                    src="img/photoItems/img6.svg"
                    class="gallery__img"
                    alt="img6"
                />
            </figure>
            <figure class="gallery__item gallery__item--7">
                <img
                    src="img/photoItems/img7.svg"
                    class="gallery__img"
                    alt="img7"
                />
            </figure>
        </div>
    </div>
</main>

<style>
    .text-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 3%;
    }

    .textMainCont {
        font-size: 300%;
        font-weight: 500;
        font-family: "Releway", sans-serif;
        margin: 0;
    }

    .containerDiv {
        width: 85%;
        margin: 2rem auto;
    }

    .gallery {
        display: grid;
        grid-template-columns: repeat(15, 1fr);
        grid-template-rows: repeat(14, 5vw);
        grid-gap: 1.5rem;
    }

    .gallery__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
    }

    .gallery__item--1 {
        grid-column-start: 1;
        grid-column-end: 7;
        grid-row-start: 1;
        grid-row-end: 7;
    }

    .gallery__item--2 {
        grid-column-start: 7;
        grid-column-end: 10;
        grid-row-start: 1;
        grid-row-end: 4;
    }

    .gallery__item--3 {
        grid-column-start: 10;
        grid-column-end: 13;
        grid-row-start: 1;
        grid-row-end: 4;
    }

    .gallery__item--4 {
        grid-column-start: 13;
        grid-column-end: 16;
        grid-row-start: 1;
        grid-row-end: 4;
    }

    .gallery__item--5 {
        grid-column-start: 7;
        grid-column-end: 10;
        grid-row-start: 4;
        grid-row-end: 7;
    }

    .gallery__item--6 {
        grid-column-start: 10;
        grid-column-end: 13;
        grid-row-start: 4;
        grid-row-end: 7;
    }

    .gallery__item--7 {
        grid-column-start: 13;
        grid-column-end: 16;
        grid-row-start: 4;
        grid-row-end: 7;
    }
</style>
