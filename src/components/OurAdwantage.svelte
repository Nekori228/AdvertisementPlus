<script>
    import Provide from "./Provide.svelte";
	import OurProjects from "./OurProjects.svelte";
    import Footer from "./Footer.svelte";
</script>

<main>
    <h1>
        Наши преимущества
    </h1>
    <div class="grid">
            <div class="block">
                <h2>Экспериментируем всегда</h2>
                <p>Возьмём работу любой сложности и выполним наилучшим образом. Каждая наша работа индивидуальна сама по себе, и каждый раз сталкиваемся с новыми непростыми и необычными заказами. Не боимся экспериментировать с новыми материалами.  Мы справляемся - заказчики довольны.</p>
            </div>
            <div class="block">
                <h2>Монтируем надежно</h2>
                <p>Всегда крепим надежно любые конструкции, учитывая северный климат. Проводим монтажи строго по проекту. Используем самые лучшие материалы.</p>
            </div>
            <div class="block">
                <h2>Гарантируем яркость</h2>
                <p>Мы используем самые яркие светодиоды, и не экономим на них. Яркость - наш успех.</p>
            </div>
            <div class="block">
                <h2>Печатаем красиво</h2>
                <p>Так отзываются наши заказчики) Свои отзывы можете оставлять на картах дубл гис, яндекс  др.  Спасибо что выбираете нас! :)</p>
            </div>
    </div>
    <div class="marginBlock"></div>
    <Provide />
    <div class="marginBlock"></div>
	<OurProjects />
    <div class="marginBlock"></div>
    <Footer />
    <div class="background-element">
        <div class="box1"></div>
        <div class="box2"></div>
        <div class="box3"></div>
        <div class="box5"><div class="box4"></div></div>
        <div class="box6"><div class="box7"></div></div>
        <div class="box10"><div class="box9"></div><div class="box8"></div></div>
        <div class="box12"><div class="box11"></div></div>
    </div>
</main>

<style>

    main {
        display: flex;
        height: 100vh;
        position: relative;
        flex-direction: column;
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-column-gap: 15%;
        margin: 0% 5% 0% 5%;
    }

    .block {
        display: flex;
        padding: 20px;
        border-radius: 0;
        flex-direction: column;
        align-items: flex-start;
    }

    .marginBlock {
        margin: 1%;
    }

    h1 {
        font-family: "Raleway", sans-serif;
        font-size: 50px;
        font-weight: 600;
    }

    h2 {
        font-family: "Jost", sans-serif;
        font-size: 35px;
        font-weight: 400;
    }

    p {
        font-family: "Jost", sans-serif;
        font-size: 35px;
        font-weight: 300;
        margin: 0; 
        text-align: left;
    }

    .box1 {
        grid-column: 1;
        background: #F39D54;
        margin-top: 16%;
        margin-left: 3%;
        width: 56px;
        height: 56px;
    }

    .box2 {
        grid-column: 2;
        background: #E9E0CF;
        margin-top: 20%;
        margin-left: 1%;
        width: 119px;
        height: 119px;
    }
    
    .box3 {
        grid-column: 1;
        grid-row: 2;
        background: #E9E0CF;
        margin-top: 36%;
        width: 255px;
        height: 255px;
    }

    .box4 {
        grid-column: 1;
        grid-row: 2;
        background-color: rgba(255, 255, 255, 0.0);
        border: 4px solid #D54E54;
        margin-left: -20%;
        margin-top: -22%;
        width: 90px;
        height: 90px;
    }   

    .box5 {
        grid-column: 1;
        background: #F5F3FF;
        margin-left: 12%;
        margin-top: 20%;
        width: 258px;
        height: 258px;
    }

    .box6 {
        grid-column: 2;
        background: #F5F3FF;
        margin-top: -25%;
        width: 537px;
        height: 537px;
    }

    .box7 {
        grid-column: 1;
        grid-row: 2;
        background-color: rgba(255, 255, 255, 0.0);
        border: 4px solid #000000;
        margin-top: -15%;
        margin-left: 90%;
        width: 122px;
        height: 122px;
    } 

    .box8 {
        grid-column: 1;
        grid-row: 2;
        background-color: rgba(255, 255, 255, 0.0);
        border: 4px solid #000000;
        margin-left: 70%;
        margin-top: -7%;
        width: 81px;
        height: 81px;
    } 

    .box9 {
        grid-column: 1;
        background: #D54E54;
        margin-top: -10%;
        margin-left: 60%;
        width: 117px;
        height: 117px;
    }

    .box10 {
        grid-column: 1;
        grid-row: 8;
        background: #F5F3FF;
        margin-top: 50%;
        width: 673px;
        height: 799px;
    }

    .box11 {
        grid-column: 2;
        background-color: rgba(255, 255, 255, 0.0);
        border: 4px solid #D54E54;
        margin-left: 30%;
        margin-top: -130%;
        width: 138px;
        height: 138px;
    }

    .box12 {
        grid-column: 2;
        grid-row: 11;
        background: #E9E0CF;
        margin-left: 57%;
        margin-top: -25%;
        width: 393px;
        height: 393px;
    }

    .background-element {
        display: grid;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
    }
</style>