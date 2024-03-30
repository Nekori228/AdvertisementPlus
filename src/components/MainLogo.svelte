<script>

</script>

<main>
  <div class="box1"><div class="box2"></div></div>
  <div class="imageLogoMain"><div class="box5"></div><img src="/img/logo_small.svg" alt="small logo" width="850" height="268"><div class="box6"></div></div>
  <div class="box3"><div class="box4"></div></div>    
</main>

<style>
    main {
      display: grid;
      grid-template-columns: 1fr auto 1fr; /* Три столбца с равным размером и фиксированным размером */
      height: 70vh;
    }
  
    .imageLogoMain {
      grid-column: 2;
      justify-self: center;
      margin-top: 40%;
    }
  
    .box1 {
      grid-column: 1;
      background: #B3111C;
      margin-top: 50%;
      width: 200px;
      height: 200px;
    }
  
    .box2 {
      grid-column: 3;
      justify-self: end;
      background-color: rgba(255, 255, 255, 0.0);
      border: 3px solid #000000;
      margin-left: 60%;
      margin-top: -120%;
      width: 304px;
      height: 304px;
    }
  
    .box3 {
      grid-column: 3;
      justify-self: end;
      background: #E9E0CF;
      width: 400px;
      height: 400px;
    }
  
    .box4 {
      grid-column: 3;
      justify-self: end;
      background-color: rgba(255, 255, 255, 0.0);
      border: 3px solid #D54E54;
      margin-top: 85%;
      margin-left: 35%;
      width: 120px;
      height: 120px;
    }
  
    .box5 {
      grid-column: 2;
      background: #8CBDAC;
      margin-left: 75%;
      margin-top: -35%;
      margin-bottom: 22%;
      width: 41px;
      height: 41px;
    }
  
    .box6 {
      grid-column: 3;
      background: #E9E0CF;
      margin-left: 45%;
      margin-top: 20%;
      width: 102px;
      height: 102px;
    }
  </style>