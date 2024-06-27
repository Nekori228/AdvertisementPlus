<script>
    let photos = [
        { src: "/img/imgProjects1.svg", alt: "фото 1" },
        { src: "/img/imgProjects2.svg", alt: "фото 2" },
        { src: "/img/imgProjects3.svg", alt: "фото 3" },
        { src: "/img/imgProjects4.svg", alt: "фото 4" },
        { src: "/img/imgProjects5.svg", alt: "фото 5" },
        { src: "/img/imgProjects6.svg", alt: "фото 6" },
        { src: "/img/imgProjects7.svg", alt: "фото 7" },
        { src: "/img/imgProjects8.svg", alt: "фото 8" },
    ];
</script>

<main>
    <h1>Наши работы</h1>
    <div class="content">
        <div class="photos">
            <div class="grid">
                {#each photos as photo}
                    <img src={photo.src} alt={photo.alt} />
                {/each}
            </div>
        </div>
    </div>
</main>

<style>
    main {
        margin: 0;
        margin: 0% 10% 0% 10%;
    }

    h1 {
        font-family: "Raleway", sans-serif;
        font-size: 50px;
        font-weight: 600;
        text-align: center;
    }

    .content {
        display: flex;
        width: 100%;
        justify-content: center;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 10px;
    }

    .photos img {
        max-width: 100%;
        max-height: 100%;
    }
</style>
