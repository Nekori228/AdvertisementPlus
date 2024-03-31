<script>

</script>

<main>
    <h1 class="h1Left">Работаем по ХМАО и ЯНАО</h1>
    <h1 class="h1Rigt">с 2003 года</h1>
    <div class="background-element">
        <div class="box1"><div class="box2"></div></div>
        <div class="box3"><div class="box4"><p class="textInBox">здесь будет фото основателей или <br>фото самой компании</p></div></div>
    </div>
</main>

<style>
main {
    display: flex;
    height: 80vh;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: relative;
    /* margin: 0% 15% 0% 15%; */
}

h1 {
    font-family: "Raleway", sans-serif;
    font-size: 50px;
    font-weight: 600;
}

.textInBox {
    font-family: "Raleway", sans-serif;
    color: #9A9A9A;
    font-size: 36px;
    font-weight: 400;
    text-align: center;
}

.box1 {
    grid-column: 1;
    background: #F39D54;
    margin-left: 20%;
    margin-top: 80%;
    width: 130px;
    height: 130px;
}

.box2 {
    grid-column: 1;
    background-color: rgba(255, 255, 255, 0.0);
    border: 4px solid #000000;
    margin-top: -110%;
    margin-left: 50%;
    width: 192px;
    height: 192px;
}

.box3 {
    grid-column: 2;
    background: #F4F4F4;
    width: 682px;
    height: 682px;
}

.box4 {
    grid-column: 2;
    background-color: rgba(255, 255, 255, 0.0);
    border: 2px solid #000000;
    margin-left: -10%;
    margin-top: -5%;
    width: 682px;
    height: 682px;
}

.h1Left {
    display: flex;
    margin-bottom: 25%;
}

.h1Rigt {
    display: flex;
    flex-direction: row-reverse;
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