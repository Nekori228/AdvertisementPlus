<footer>
    <div class="container">
        <div class="containerBlcokColor">
            <img src="/img/logo_big.svg" class="imgLogo" alt="big logo" width="568" height="180">
        </div>
        <div class="container2">
            <h1>Посмотреть все услуги</h1>
            <ul class="footerCol">
                <li>                
                    <a href=""><h2>Портфолио</h2></a>
                </li>
                <div class="block1"></div>
                <li>
                    <a href=""><h2>Контакты</h2></a>
                </li>
            </ul>
            <div>
                <div class="contactsInfo"><p>+7 (3462) 66-64-64</p>
                    <a href="" class="linkPad"><img src="/img/icon/mail.svg"></a></div>
                    <div class="contactsInfo"><p>7992022@mail.ru</p><a href="" class="linkPad"><img src="/img/icon/mail.svg"></a></div>
                    <div class="contactsInfo"><p>+79 (227) 99-20-22</p><a href="" class="linkPad"><img src="/img/icon/mail.svg"></a></div>
            </div>
            <div class="copyText">
                <p>Политика конфидициальности<br>Условия использования<br>©Реклама плюс
                    <br>Все права защищены 2023</p>
            </div>
        </div>
        <div class="box2"><div class="box1"></div></div>
        <div class="box3"></div>
    </div>
    <div class="background-element">
        <div class="box4"></div>
    </div>
</footer>

<style>
    footer {
    background: #E9E0CF;
    margin: 0;
    width: 100%;
}

.box1 {
      grid-column: 1;
      background: #B3111C;
      margin-left: -30%;
      margin-top: -30%;
      width: 98px;
      height: 98px;
    }

    .box2 {
      background-color: rgba(255, 255, 255, 0.0);
      border: 3px solid #000000;
      margin-left: 5%;
      margin-top: -3%;
      width: 148px;
      height: 148px;
    }

    .box3 {
      grid-column: 1;
      background: #000000;
      margin-left: 5%;
      margin-top: 20%;
      width: 58px;
      height: 58px;
    }

    .box4 {
      background-color: rgba(255, 255, 255, 0.0);
      border: 3px solid #34828C;
      width: 148px;
      height: 148px;
    }

.containerBlcokColor {
    transform: translateX(-50%);
    width: 653px;
    height: 608px;
    border: 5px solid #34828C;
    background-color: transparent;
    overflow: hidden;
    margin-right: 10%;
    margin-left: 0%;
    margin-top: -7%;
}

.imgLogo {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 100%;
    max-height: 100%;
}

.container {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #E9E0CF;
    height: 31em;
    width: 100%;
}

.container2 {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
    margin-left: -16%;
}

.footerCol {
    flex-direction: column;
    list-style: none;
    margin-left: auto;
    padding: 0;
}

.contactsInfo {
    display: flex;
    align-items: center;
    justify-content: center;
}

.linkPad {
    padding: 0 6%;
}

a {
    color: black;
    text-decoration: none;
}

a:hover {
    color: #34828C;
    text-decoration: none;
}

.copyText {
   padding: 5% 0%;
}

h1 {
    font-family: "Jost", sans-serif;
    font-size: 35px;
    font-weight: 400;
    margin: 0;
    padding: 0;
}

h2 {
    font-family: "Jost", sans-serif;
    font-size: 35px;
    font-weight: 400;
    margin: 0;
    padding: 0;
}

p {
    font-family: "Jost", sans-serif;
    font-size: 15px;
    font-weight: 400;
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