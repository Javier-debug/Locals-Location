const loggedout = document.querySelectorAll(".logged-out")
const loggedin = document.querySelectorAll(".logged-in")
const logged = document.querySelectorAll(".logged");
const unlogged = document.querySelector(".unlogged");
const auth = firebase.auth();
const db = firebase.firestore();
const salir = document.getElementById("salir");
var localsList = document.getElementById("localsList");
const body = document.getElementById("body");
var imgLogo = document.getElementById("imgLogo");
const datosdelacuenta = document.querySelector(".datosdelacuenta");
//var userInfo = document.getElementById("userInfo");
var uidEmpresa = "";
var map;
var locals = [];
var localsDrawed = [];
var API = "https://ancient-dawn-65400.herokuapp.com/api/locals/";
const formaingresar = document.getElementById("formaingresar");

auth.onAuthStateChanged(user => {
  if(user) {
    db.collection("empresas").doc(user.uid).get().then(doc => {
      //body.style.backgroundColor = `#${doc.data().colores}`
      console.log(doc.data().logo)
      const html = `
      <img src="${doc.data().logo}" width="auto" height="60px"/>
      <p>Nombre comercial: ${doc.data().nombreC}</p>
      <p>Razon Social: ${doc.data().razonSocial}</p>
      `;

      datosdelacuenta.innerHTML = html;
      imgLogo.src = doc.data().logo;
    });
    optionsMenu(user);
    getLocals(user.uid);
  }
  else {
    //body.style.backgroundColor = "gray"
    optionsMenu();
  }
});

const optionsMenu = (user) => {
  if(user) {
    uidEmpresa = user.uid;
    console.log(uidEmpresa)
    loggedin.forEach(item => item.style.display = "block")
    loggedout.forEach(item => item.style.display = "none")
    unlogged.style.display = "none"
    logged.forEach(item => item.style.display = "block")
  }
  else {
    unlogged.style.display = "block"
    loggedin.forEach(item => item.style.display = "none")
    loggedout.forEach(item => item.style.display = "block")
    logged.forEach(item => item.style.display = "none")
  }
}

formaingresar.addEventListener("submit", (e) => {
  e.preventDefault();

  let correo = formaingresar['correo'].value;
  let contrasenia = formaingresar['contraseña'].value;

  auth.signInWithEmailAndPassword(correo, contrasenia).then(credencial => {
    console.log(credencial)
    $('#ingresarModal').modal('hide');
    formaingresar.reset();
    formaingresar.querySelector('.error').innerHTML = ''
  }).catch(error => {
    console.log(error);
    formaingresar.querySelector('.error').innerHTML = mensajeError(error.code)
  });
})

function mensajeError(codigo) {
  let mensaje = '';
  switch(codigo) {
    case 'auth/wrong-password': 
    mensaje = "Contraseña incorrecta"
    break;
    case 'auth/user-not-found': 
    mensaje = "Usuario no encontrado"
    break;
    case 'auth/weak-password': 
    mensaje = "Contraseña debil"
    break;
    default: 
    mensaje = "Occurio un error al ingresar con este usuario"
  }
  return mensaje;
}

salir.addEventListener("click", (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
  })
})

function iniciaMapa() {
  var coordenadas = {
    lat: 21.14785,
    lng: -101.70345
  }

  map = new google.maps.Map(document.getElementById('map'), {
    center: coordenadas,
    zoom: 15
  });
}

var  getLocals = async (userUID) => {
  await fetch(API + userUID, {
    method: "GET",
  })
  .then(async (response) => {
    return await response.json()
  })
  .then((data) => {
    locals = data;
    putLocalsInMap();
  })
} 

var putLocalsInMap = () => {
  locals.forEach(local => {
    var marker = new google.maps.Marker({
      map: map,
      title: '<strong>' + local.ubicacion + '</strong>' ,
      position: local.coor
    });

    localsDrawed.push(marker);
    google.maps.event.addListener(marker, 'mouseover', function(){
      var infowindow = new google.maps.InfoWindow({
        content : this.title,
        position : this.position
      });
      infowindow.open(map);
      setTimeout( function(){ infowindow.close(); }, 3000);
    });
    let position = document.createElement("button");
    position.className = "list-group-item list-group-item-action"
    position.type = "button"
    position.innerHTML = local.ubicacion
    position.onclick = function() {
      map.setCenter(local.coor)
    }
    localsList.appendChild(position)
  })
} 