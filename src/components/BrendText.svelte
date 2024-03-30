<main>
    <h1>Создание рекламы по продвижению бренда,<br>изготовление и установка всех видов рекламы</h1>
    <div class="BlackContainer">
        <p class="blackText">Действует специальное предложение!</p>
        <div class="divBlock"></div>
        <p class="blackText">Сделаем и повесим световую вывеску за</p>
        <p class="redText">48 часов!</p>
    </div>
    <div class="background-element">
        <div class="box1"><div class="box2"></div></div>
        <div class="box3"></div>
        <div class="box4"></div>
        <div class="box5"></div>
    </div>
</main>

<style>
main {
    display: flex;
    height: 90vh;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
}

h1 {
    grid-column: 2;
    font-family: "Raleway", sans-serif;
    font-size: 50px;
    font-weight: 600;
    padding-bottom: 3%;
}

.box1 {
    grid-column: 1;
    background: #E9E0CF;
    margin-left: -4%;
    width: 530px;
    height: 530px;
}

.box2 {
    grid-column: 1;
    background-color: rgba(255, 255, 255, 0.0);
    border: 4px solid #012E33;
    margin-top: 20%;
    margin-left: 50%;
    width: 60px;
    height: 60px;
}

.box3 {
    grid-column: 3;
    background: #F5F5F5;
    margin-left: 50%;
    width: 258px;
    height: 258px;
}

.box4 {
    grid-column: 1;
    background: #000000;
    margin-left: 57%;
    margin-top: 10%;
    width: 67px;
    height: 67px;
}

.box5 {
    grid-column: 4;
    background: #000000;
    width: 175px;
    height: 175px;
}

.blackText {
    font-family: "Jost", sans-serif;
    font-size: 35px;
    font-weight: 500;
    color: #000000;
    margin: 0;
}

.divBlock {
    margin: 3%;
}

.redText {
    font-family: "Jost", sans-serif;
    font-size: 35px;
    font-weight: 400;
    color: #B3111C;
    margin: 0;
}

.BlackContainer {
    grid-column: 2;
    border-radius: 10px;
    border: 2px solid black;
    padding: 40px;
    margin: 20px;
    width: 36%;
    margin-bottom: 10%;
    }

.background-element {
    display: grid;
    position: absolute; /* Add this line to take the element out of the normal document flow */
    top: 0; /* Add this line to position the element at the top of the viewport */
    left: 0; /* Add this line to position the element at the left edge of the viewport */
    width: 100%; /* Add this line to make the element full width */
    height: 100%; /* Add this line to make the element full height */
    
    z-index: -1; /* Add this line to make the element appear behind the other elements */
}
</style>