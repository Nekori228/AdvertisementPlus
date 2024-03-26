<footer>
    <div class="container ">
        <div class="containerBlcokColor">
            <img src="/img/logo_big.svg" class="imgLogo" alt="big logo" width="515" height="93">
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
    </div>
</footer>

<style>
    footer {
    background: #E9E0CF;
    
    margin: 0;
    padding: 0 5%;
    position: relative; /* Добавляем позиционирование */
}

.containerBlcokColor {
    position: absolute; /* Позиционирование абсолютно */
    top: -50px; /* Смещаем вверх на 50 пикселей за рамки footer */
    left: 20%;
    transform: translateX(-50%);
    width: 400px; /* Размер квадрата */
    height: 400px; /* Размер квадрата */
    border: 5px solid #34828C; /* Цветные границы */
    background-color: transparent; /* Прозрачный фон */
    overflow: hidden; /* Обрезание содержимого внутри квадрата */
}

.imgLogo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 100%;
    max-height: 100%;
}

.container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.container2 {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
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


</style>